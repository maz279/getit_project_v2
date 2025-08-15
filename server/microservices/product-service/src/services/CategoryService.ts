/**
 * Category Service - Amazon.com/Shopee.sg Level Business Logic
 * Handles all category-related business operations
 */

import { db } from '../../../../db';
import { 
  categories, 
  products,
  type Category, 
  type InsertCategory
} from '@shared/schema';
import { eq, and, desc, asc, like, sql, count, isNull, inArray } from 'drizzle-orm';
import { 
  CategorySearchParams,
  CategoryResponse,
  CategoryHierarchy,
  CategoryAnalytics,
  NotFoundError,
  ConflictError,
  ValidationError
} from '../types';

export class CategoryService {
  private serviceName = 'category-service';

  constructor() {
    this.initializeService();
  }

  private async initializeService() {
    console.log(`🚀 Initializing ${this.serviceName}`, {
      service: this.serviceName,
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get all categories with filtering and pagination
   */
  async getAllCategories(params: CategorySearchParams): Promise<CategoryResponse> {
    try {
      const {
        parentId,
        level,
        isActive = true,
        includeChildren = false,
        includeProducts = false,
        sortBy = 'name',
        sortOrder = 'asc',
        page = 1,
        limit = 50
      } = params;

      const offset = (page - 1) * limit;

      // Build the query
      let query = db.select().from(categories);
      const conditions = [];

      if (parentId !== undefined) {
        if (parentId === null) {
          conditions.push(isNull(categories.parentId));
        } else {
          conditions.push(eq(categories.parentId, parentId));
        }
      }

      if (level !== undefined) {
        conditions.push(eq(categories.level, level));
      }

      if (isActive !== undefined) {
        conditions.push(eq(categories.isActive, isActive));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      // Apply sorting
      const sortColumn = categories[sortBy as keyof typeof categories] || categories.name;
      query = query.orderBy(sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn));

      // Apply pagination
      query = query.limit(limit).offset(offset);

      const categoriesResult = await query;

      // Get total count
      let countQuery = db.select({ count: count() }).from(categories);
      if (conditions.length > 0) {
        countQuery = countQuery.where(and(...conditions));
      }
      const [{ count: totalCount }] = await countQuery;

      // Enhance with children and products if requested
      const enhancedCategories = await Promise.all(
        categoriesResult.map(async (category) => {
          const enhanced = { ...category };

          if (includeChildren) {
            enhanced.children = await this.getCategoryChildren(category.id);
          }

          if (includeProducts) {
            enhanced.productCount = await this.getCategoryProductCount(category.id);
          }

          return enhanced;
        })
      );

      return {
        categories: enhancedCategories,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('Failed to get categories:', error);
      throw error;
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(
    id: string, 
    options: { includeProducts?: boolean; includeChildren?: boolean } = {}
  ): Promise<Category | null> {
    try {
      const [category] = await db
        .select()
        .from(categories)
        .where(eq(categories.id, id));

      if (!category) {
        return null;
      }

      const enhanced = { ...category };

      if (options.includeChildren) {
        enhanced.children = await this.getCategoryChildren(id);
      }

      if (options.includeProducts) {
        enhanced.productCount = await this.getCategoryProductCount(id);
      }

      return enhanced;
    } catch (error) {
      console.error('Failed to get category by ID:', error);
      throw error;
    }
  }

  /**
   * Create new category
   */
  async createCategory(categoryData: InsertCategory): Promise<Category> {
    try {
      // Validate parent category exists if parentId is provided
      if (categoryData.parentId) {
        const parentCategory = await this.getCategoryById(categoryData.parentId);
        if (!parentCategory) {
          throw new NotFoundError('Parent category not found');
        }
        
        // Set level based on parent
        categoryData.level = (parentCategory.level || 0) + 1;
      } else {
        categoryData.level = 0;
      }

      // Check if category with same name exists at the same level
      const existingCategory = await db
        .select()
        .from(categories)
        .where(
          and(
            eq(categories.name, categoryData.name),
            categoryData.parentId 
              ? eq(categories.parentId, categoryData.parentId)
              : isNull(categories.parentId)
          )
        );

      if (existingCategory.length > 0) {
        throw new ConflictError('Category with this name already exists at this level');
      }

      const [createdCategory] = await db
        .insert(categories)
        .values(categoryData)
        .returning();

      return createdCategory;
    } catch (error) {
      console.error('Failed to create category:', error);
      throw error;
    }
  }

  /**
   * Update category
   */
  async updateCategory(id: string, updateData: Partial<InsertCategory>): Promise<Category | null> {
    try {
      // Check if category exists
      const existingCategory = await this.getCategoryById(id);
      if (!existingCategory) {
        return null;
      }

      // If changing parent, validate new parent exists
      if (updateData.parentId !== undefined) {
        if (updateData.parentId) {
          const parentCategory = await this.getCategoryById(updateData.parentId);
          if (!parentCategory) {
            throw new NotFoundError('Parent category not found');
          }
          
          // Prevent circular references
          if (await this.wouldCreateCircularReference(id, updateData.parentId)) {
            throw new ValidationError('Cannot move category: would create circular reference');
          }

          updateData.level = (parentCategory.level || 0) + 1;
        } else {
          updateData.level = 0;
        }
      }

      const [updatedCategory] = await db
        .update(categories)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(eq(categories.id, id))
        .returning();

      // If parent changed, update levels of all children
      if (updateData.parentId !== undefined) {
        await this.updateChildrenLevels(id);
      }

      return updatedCategory;
    } catch (error) {
      console.error('Failed to update category:', error);
      throw error;
    }
  }

  /**
   * Delete category
   */
  async deleteCategory(id: string, force: boolean = false): Promise<boolean> {
    try {
      const category = await this.getCategoryById(id);
      if (!category) {
        return false;
      }

      // Check if category has children
      const children = await this.getCategoryChildren(id);
      if (children.length > 0 && !force) {
        throw new ValidationError('Cannot delete category with children. Use force=true to delete recursively.');
      }

      // Check if category has products
      const productCount = await this.getCategoryProductCount(id);
      if (productCount > 0 && !force) {
        throw new ValidationError('Cannot delete category with products. Use force=true to reassign products.');
      }

      if (force) {
        // Delete all children recursively
        for (const child of children) {
          await this.deleteCategory(child.id, true);
        }

        // Reassign products to parent category or null
        if (productCount > 0) {
          await db
            .update(products)
            .set({ categoryId: category.parentId || null })
            .where(eq(products.categoryId, id));
        }
      }

      await db.delete(categories).where(eq(categories.id, id));
      return true;
    } catch (error) {
      console.error('Failed to delete category:', error);
      throw error;
    }
  }

  /**
   * Get category hierarchy
   */
  async getCategoryHierarchy(options: {
    maxDepth?: number;
    includeProductCounts?: boolean;
  } = {}): Promise<CategoryHierarchy[]> {
    try {
      const { maxDepth, includeProductCounts = false } = options;

      // Get root categories
      const rootCategories = await db
        .select()
        .from(categories)
        .where(and(isNull(categories.parentId), eq(categories.isActive, true)))
        .orderBy(asc(categories.sortOrder), asc(categories.name));

      const buildHierarchy = async (
        parentCategories: Category[], 
        currentDepth: number = 0
      ): Promise<CategoryHierarchy[]> => {
        if (maxDepth !== undefined && currentDepth >= maxDepth) {
          return parentCategories.map(cat => ({
            ...cat,
            children: [],
            productCount: 0
          }));
        }

        return Promise.all(
          parentCategories.map(async (category) => {
            const children = await db
              .select()
              .from(categories)
              .where(and(eq(categories.parentId, category.id), eq(categories.isActive, true)))
              .orderBy(asc(categories.sortOrder), asc(categories.name));

            const hierarchy: CategoryHierarchy = {
              ...category,
              children: children.length > 0 ? await buildHierarchy(children, currentDepth + 1) : [],
              productCount: includeProductCounts ? await this.getCategoryProductCount(category.id) : 0
            };

            return hierarchy;
          })
        );
      };

      return buildHierarchy(rootCategories);
    } catch (error) {
      console.error('Failed to get category hierarchy:', error);
      throw error;
    }
  }

  /**
   * Get category analytics
   */
  async getCategoryAnalytics(categoryId: string, timeRange: string): Promise<CategoryAnalytics> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(startDate.getDate() - 30);
      }

      // Get basic category info
      const category = await this.getCategoryById(categoryId);
      if (!category) {
        throw new NotFoundError('Category not found');
      }

      // Get product count
      const productCount = await this.getCategoryProductCount(categoryId);

      // Get sales data (mock implementation - replace with actual order data)
      const salesData = await this.getCategorySalesData(categoryId, startDate, endDate);

      return {
        categoryId,
        categoryName: category.name,
        productCount,
        totalSales: salesData.totalSales,
        totalRevenue: salesData.totalRevenue,
        averageRating: salesData.averageRating,
        topProducts: salesData.topProducts,
        salesTrend: salesData.salesTrend,
        timeRange
      };
    } catch (error) {
      console.error('Failed to get category analytics:', error);
      throw error;
    }
  }

  /**
   * Reorder categories
   */
  async reorderCategories(categoryOrder: Array<{ id: string; sortOrder: number }>): Promise<boolean> {
    try {
      await Promise.all(
        categoryOrder.map(({ id, sortOrder }) =>
          db
            .update(categories)
            .set({ sortOrder, updatedAt: new Date() })
            .where(eq(categories.id, id))
        )
      );

      return true;
    } catch (error) {
      console.error('Failed to reorder categories:', error);
      throw error;
    }
  }

  // Helper methods

  private async getCategoryChildren(parentId: string): Promise<Category[]> {
    return db
      .select()
      .from(categories)
      .where(and(eq(categories.parentId, parentId), eq(categories.isActive, true)))
      .orderBy(asc(categories.sortOrder), asc(categories.name));
  }

  private async getCategoryProductCount(categoryId: string): Promise<number> {
    const [{ count: productCount }] = await db
      .select({ count: count() })
      .from(products)
      .where(and(eq(products.categoryId, categoryId), eq(products.isActive, true)));

    return productCount;
  }

  private async wouldCreateCircularReference(categoryId: string, newParentId: string): Promise<boolean> {
    let currentParentId = newParentId;
    
    while (currentParentId) {
      if (currentParentId === categoryId) {
        return true;
      }
      
      const [parent] = await db
        .select({ parentId: categories.parentId })
        .from(categories)
        .where(eq(categories.id, currentParentId));
      
      currentParentId = parent?.parentId || null;
    }
    
    return false;
  }

  private async updateChildrenLevels(categoryId: string): Promise<void> {
    const children = await this.getCategoryChildren(categoryId);
    const [parent] = await db
      .select({ level: categories.level })
      .from(categories)
      .where(eq(categories.id, categoryId));

    const newLevel = (parent?.level || 0) + 1;

    for (const child of children) {
      await db
        .update(categories)
        .set({ level: newLevel })
        .where(eq(categories.id, child.id));
      
      // Recursively update grandchildren
      await this.updateChildrenLevels(child.id);
    }
  }

  private async getCategorySalesData(categoryId: string, startDate: Date, endDate: Date) {
    // Mock implementation - replace with actual order/sales data queries
    return {
      totalSales: Math.floor(Math.random() * 1000),
      totalRevenue: Math.floor(Math.random() * 50000),
      averageRating: 4.2 + Math.random() * 0.8,
      topProducts: [],
      salesTrend: []
    };
  }
}