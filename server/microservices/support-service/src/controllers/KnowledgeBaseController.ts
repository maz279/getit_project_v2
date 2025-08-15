/**
 * Knowledge Base Controller - Amazon.com/Shopee.sg Level
 * Comprehensive FAQ and article management with Bangladesh content
 */

import { Request, Response } from 'express';
import { db } from '../../../../db';
import { 
  knowledgeBaseArticles, 
  kbCategories,
  users,
  insertKnowledgeBaseArticleSchema,
  insertKbCategorySchema,
  KnowledgeBaseArticle
} from '../../../../../shared/schema';
import { eq, desc, and, count, sql, ilike, or } from 'drizzle-orm';

export class KnowledgeBaseController {
  /**
   * Get all published articles with search and filtering
   */
  static async getPublishedArticles(req: Request, res: Response) {
    try {
      const { 
        search, 
        category, 
        difficulty, 
        audience = 'customer',
        language = 'en',
        featured,
        page = 1, 
        limit = 20 
      } = req.query;
      
      let query = db.select({
        article: knowledgeBaseArticles,
        category: {
          name: kbCategories.name,
          nameBn: kbCategories.nameBn,
          icon: kbCategories.icon
        },
        author: {
          username: users.username,
          fullName: users.fullName
        }
      })
      .from(knowledgeBaseArticles)
      .leftJoin(kbCategories, eq(knowledgeBaseArticles.categoryId, kbCategories.id))
      .leftJoin(users, eq(knowledgeBaseArticles.authorId, users.id))
      .where(eq(knowledgeBaseArticles.status, 'published'));
      
      // Apply filters
      let conditions = [eq(knowledgeBaseArticles.status, 'published')];
      
      if (search) {
        const searchConditions = or(
          ilike(knowledgeBaseArticles.title, `%${search}%`),
          ilike(knowledgeBaseArticles.content, `%${search}%`),
          ilike(knowledgeBaseArticles.titleBn, `%${search}%`),
          sql`${knowledgeBaseArticles.searchKeywords}::text ILIKE ${'%' + search + '%'}`
        );
        conditions.push(searchConditions);
      }
      
      if (category) {
        conditions.push(eq(knowledgeBaseArticles.categoryId, category as string));
      }
      
      if (difficulty) {
        conditions.push(eq(knowledgeBaseArticles.difficultyLevel, difficulty as string));
      }
      
      if (audience && audience !== 'all') {
        conditions.push(or(
          eq(knowledgeBaseArticles.targetAudience, audience as string),
          eq(knowledgeBaseArticles.targetAudience, 'all')
        ));
      }
      
      if (featured === 'true') {
        conditions.push(eq(knowledgeBaseArticles.featured, true));
      }
      
      const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];
      
      // Get articles with pagination
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      const articles = await query
        .where(whereClause)
        .orderBy(
          featured === 'true' ? knowledgeBaseArticles.featured : desc(knowledgeBaseArticles.viewCount),
          desc(knowledgeBaseArticles.publishedAt)
        )
        .limit(parseInt(limit as string))
        .offset(offset);
      
      // Get total count
      const [totalCount] = await db.select({ count: count() })
        .from(knowledgeBaseArticles)
        .where(whereClause);
      
      // Increment view count for articles (async)
      if (articles.length > 0) {
        const articleIds = articles.map(a => a.article.id);
        await db.update(knowledgeBaseArticles)
          .set({ viewCount: sql`${knowledgeBaseArticles.viewCount} + 1` })
          .where(sql`${knowledgeBaseArticles.id} = ANY(${articleIds})`);
      }
      
      // Format response based on language preference
      const formattedArticles = articles.map(item => ({
        ...item.article,
        title: language === 'bn' && item.article.titleBn ? item.article.titleBn : item.article.title,
        content: language === 'bn' && item.article.contentBn ? item.article.contentBn : item.article.content,
        category: {
          ...item.category,
          name: language === 'bn' && item.category?.nameBn ? item.category.nameBn : item.category?.name
        },
        author: item.author
      }));
      
      res.json({
        success: true,
        data: {
          articles: formattedArticles,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: totalCount.count,
            pages: Math.ceil(totalCount.count / parseInt(limit as string))
          }
        }
      });
      
    } catch (error) {
      console.error('Error fetching articles:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch articles',
        messageBn: 'আর্টিকেল আনতে ব্যর্থ',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  /**
   * Get article by slug with related articles
   */
  static async getArticleBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const { language = 'en' } = req.query;
      
      const article = await db.select({
        article: knowledgeBaseArticles,
        category: {
          name: kbCategories.name,
          nameBn: kbCategories.nameBn,
          icon: kbCategories.icon
        },
        author: {
          username: users.username,
          fullName: users.fullName,
          avatar: users.avatar
        }
      })
      .from(knowledgeBaseArticles)
      .leftJoin(kbCategories, eq(knowledgeBaseArticles.categoryId, kbCategories.id))
      .leftJoin(users, eq(knowledgeBaseArticles.authorId, users.id))
      .where(and(
        eq(knowledgeBaseArticles.slug, slug),
        eq(knowledgeBaseArticles.status, 'published')
      ))
      .limit(1);
      
      if (!article.length) {
        return res.status(404).json({
          success: false,
          message: 'Article not found',
          messageBn: 'আর্টিকেল পাওয়া যায়নি'
        });
      }
      
      const foundArticle = article[0];
      
      // Get related articles
      const relatedIds = foundArticle.article.relatedArticles as string[] || [];
      let relatedArticles = [];
      
      if (relatedIds.length > 0) {
        relatedArticles = await db.select({
          id: knowledgeBaseArticles.id,
          title: knowledgeBaseArticles.title,
          titleBn: knowledgeBaseArticles.titleBn,
          slug: knowledgeBaseArticles.slug,
          summary: knowledgeBaseArticles.summary,
          difficultyLevel: knowledgeBaseArticles.difficultyLevel,
          viewCount: knowledgeBaseArticles.viewCount
        })
        .from(knowledgeBaseArticles)
        .where(and(
          sql`${knowledgeBaseArticles.id} = ANY(${relatedIds})`,
          eq(knowledgeBaseArticles.status, 'published')
        ))
        .limit(5);
      } else {
        // If no related articles specified, get articles from same category
        relatedArticles = await db.select({
          id: knowledgeBaseArticles.id,
          title: knowledgeBaseArticles.title,
          titleBn: knowledgeBaseArticles.titleBn,
          slug: knowledgeBaseArticles.slug,
          summary: knowledgeBaseArticles.summary,
          difficultyLevel: knowledgeBaseArticles.difficultyLevel,
          viewCount: knowledgeBaseArticles.viewCount
        })
        .from(knowledgeBaseArticles)
        .where(and(
          eq(knowledgeBaseArticles.categoryId, foundArticle.article.categoryId),
          sql`${knowledgeBaseArticles.id} != ${foundArticle.article.id}`,
          eq(knowledgeBaseArticles.status, 'published')
        ))
        .orderBy(desc(knowledgeBaseArticles.viewCount))
        .limit(5);
      }
      
      // Increment view count
      await db.update(knowledgeBaseArticles)
        .set({ viewCount: sql`${knowledgeBaseArticles.viewCount} + 1` })
        .where(eq(knowledgeBaseArticles.id, foundArticle.article.id));
      
      // Format response
      const formattedArticle = {
        ...foundArticle.article,
        title: language === 'bn' && foundArticle.article.titleBn ? foundArticle.article.titleBn : foundArticle.article.title,
        content: language === 'bn' && foundArticle.article.contentBn ? foundArticle.article.contentBn : foundArticle.article.content,
        category: {
          ...foundArticle.category,
          name: language === 'bn' && foundArticle.category?.nameBn ? foundArticle.category.nameBn : foundArticle.category?.name
        },
        author: foundArticle.author,
        viewCount: foundArticle.article.viewCount + 1 // Include the increment
      };
      
      const formattedRelated = relatedArticles.map(article => ({
        ...article,
        title: language === 'bn' && article.titleBn ? article.titleBn : article.title
      }));
      
      res.json({
        success: true,
        data: {
          article: formattedArticle,
          relatedArticles: formattedRelated
        }
      });
      
    } catch (error) {
      console.error('Error fetching article:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch article',
        messageBn: 'আর্টিকেল আনতে ব্যর্থ',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  /**
   * Get all categories with article counts
   */
  static async getCategories(req: Request, res: Response) {
    try {
      const { language = 'en', includeInactive = false } = req.query;
      
      let whereCondition = includeInactive === 'true' ? undefined : eq(kbCategories.isActive, true);
      
      const categories = await db.select({
        category: kbCategories,
        articleCount: sql<number>`COALESCE(${kbCategories.articleCount}, 0)`
      })
      .from(kbCategories)
      .where(whereCondition)
      .orderBy(kbCategories.sortOrder, kbCategories.name);
      
      // Format response based on language
      const formattedCategories = categories.map(item => ({
        ...item.category,
        name: language === 'bn' && item.category.nameBn ? item.category.nameBn : item.category.name,
        articleCount: item.articleCount
      }));
      
      res.json({
        success: true,
        data: formattedCategories
      });
      
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch categories',
        messageBn: 'ক্যাটেগরি আনতে ব্যর্থ',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  /**
   * Create new article (Admin only)
   */
  static async createArticle(req: Request, res: Response) {
    try {
      const validatedData = insertKnowledgeBaseArticleSchema.parse(req.body);
      const authorId = req.user?.id; // From auth middleware
      
      // Generate slug from title
      const slug = KnowledgeBaseController.generateSlug(validatedData.title);
      
      // Check if slug exists
      const existingSlug = await db.select()
        .from(knowledgeBaseArticles)
        .where(eq(knowledgeBaseArticles.slug, slug))
        .limit(1);
        
      if (existingSlug.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Article with similar title already exists',
          messageBn: 'অনুরূপ শিরোনামের আর্টিকেল ইতিমধ্যে বিদ্যমান'
        });
      }
      
      // Extract search keywords from content
      const searchKeywords = KnowledgeBaseController.extractKeywords(
        validatedData.title + ' ' + validatedData.content
      );
      
      const articleData = {
        ...validatedData,
        slug,
        authorId,
        searchKeywords,
        publishedAt: validatedData.status === 'published' ? new Date() : null
      };
      
      const [newArticle] = await db.insert(knowledgeBaseArticles)
        .values(articleData)
        .returning();
      
      // Update category article count
      await db.update(kbCategories)
        .set({ articleCount: sql`${kbCategories.articleCount} + 1` })
        .where(eq(kbCategories.id, validatedData.categoryId));
      
      res.status(201).json({
        success: true,
        message: 'Article created successfully',
        messageBn: 'আর্টিকেল সফলভাবে তৈরি হয়েছে',
        data: newArticle
      });
      
    } catch (error) {
      console.error('Error creating article:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create article',
        messageBn: 'আর্টিকেল তৈরি করতে ব্যর্থ',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  /**
   * Rate article helpfulness
   */
  static async rateArticle(req: Request, res: Response) {
    try {
      const { articleId } = req.params;
      const { helpful } = req.body; // boolean
      
      const updateField = helpful ? 'helpfulCount' : 'notHelpfulCount';
      const dbField = helpful ? knowledgeBaseArticles.helpfulCount : knowledgeBaseArticles.notHelpfulCount;
      
      const [updatedArticle] = await db.update(knowledgeBaseArticles)
        .set({ [updateField]: sql`${dbField} + 1` })
        .where(eq(knowledgeBaseArticles.id, articleId))
        .returning({
          id: knowledgeBaseArticles.id,
          helpfulCount: knowledgeBaseArticles.helpfulCount,
          notHelpfulCount: knowledgeBaseArticles.notHelpfulCount
        });
      
      if (!updatedArticle) {
        return res.status(404).json({
          success: false,
          message: 'Article not found',
          messageBn: 'আর্টিকেল পাওয়া যায়নি'
        });
      }
      
      res.json({
        success: true,
        message: 'Thank you for your feedback',
        messageBn: 'আপনার মতামতের জন্য ধন্যবাদ',
        data: {
          helpfulCount: updatedArticle.helpfulCount,
          notHelpfulCount: updatedArticle.notHelpfulCount,
          helpfulnessRatio: updatedArticle.helpfulCount / 
            (updatedArticle.helpfulCount + updatedArticle.notHelpfulCount) * 100
        }
      });
      
    } catch (error) {
      console.error('Error rating article:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to rate article',
        messageBn: 'আর্টিকেল রেটিং করতে ব্যর্থ',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  /**
   * Search articles with advanced algorithms
   */
  static async searchArticles(req: Request, res: Response) {
    try {
      const { q, language = 'en', category, difficulty } = req.query;
      
      if (!q || (q as string).length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search query must be at least 2 characters',
          messageBn: 'অনুসন্ধান কমপক্ষে ২ অক্ষরের হতে হবে'
        });
      }
      
      // Advanced search with ranking
      let query = db.select({
        article: knowledgeBaseArticles,
        category: {
          name: kbCategories.name,
          nameBn: kbCategories.nameBn
        },
        relevanceScore: sql<number>`
          CASE 
            WHEN ${knowledgeBaseArticles.title} ILIKE ${`%${q}%`} THEN 10
            WHEN ${knowledgeBaseArticles.summary} ILIKE ${`%${q}%`} THEN 8
            WHEN ${knowledgeBaseArticles.content} ILIKE ${`%${q}%`} THEN 5
            WHEN ${knowledgeBaseArticles.searchKeywords}::text ILIKE ${`%${q}%`} THEN 7
            ELSE 1
          END + (${knowledgeBaseArticles.viewCount} / 100.0) + 
          CASE WHEN ${knowledgeBaseArticles.featured} THEN 5 ELSE 0 END
        `.as('relevance_score')
      })
      .from(knowledgeBaseArticles)
      .leftJoin(kbCategories, eq(knowledgeBaseArticles.categoryId, kbCategories.id))
      .where(and(
        eq(knowledgeBaseArticles.status, 'published'),
        or(
          ilike(knowledgeBaseArticles.title, `%${q}%`),
          ilike(knowledgeBaseArticles.titleBn, `%${q}%`),
          ilike(knowledgeBaseArticles.content, `%${q}%`),
          ilike(knowledgeBaseArticles.contentBn, `%${q}%`),
          ilike(knowledgeBaseArticles.summary, `%${q}%`),
          sql`${knowledgeBaseArticles.searchKeywords}::text ILIKE ${'%' + q + '%'}`
        )
      ));
      
      // Apply additional filters
      if (category) {
        query = query.where(and(
          eq(knowledgeBaseArticles.categoryId, category as string)
        ));
      }
      
      if (difficulty) {
        query = query.where(and(
          eq(knowledgeBaseArticles.difficultyLevel, difficulty as string)
        ));
      }
      
      const results = await query
        .orderBy(desc(sql`relevance_score`))
        .limit(20);
      
      // Format results
      const formattedResults = results.map(item => ({
        ...item.article,
        title: language === 'bn' && item.article.titleBn ? item.article.titleBn : item.article.title,
        content: KnowledgeBaseController.truncateContent(
          language === 'bn' && item.article.contentBn ? item.article.contentBn : item.article.content,
          200
        ),
        category: {
          ...item.category,
          name: language === 'bn' && item.category?.nameBn ? item.category.nameBn : item.category?.name
        },
        relevanceScore: item.relevanceScore
      }));
      
      res.json({
        success: true,
        data: {
          query: q,
          results: formattedResults,
          total: results.length
        }
      });
      
    } catch (error) {
      console.error('Error searching articles:', error);
      res.status(500).json({
        success: false,
        message: 'Search failed',
        messageBn: 'অনুসন্ধান ব্যর্থ',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  // Helper methods
  private static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }
  
  private static extractKeywords(text: string): string[] {
    // Simple keyword extraction (in production, use NLP libraries)
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
      
    // Remove duplicates and common words
    const stopWords = ['that', 'with', 'have', 'this', 'will', 'your', 'from', 'they', 'know', 'want'];
    const keywords = [...new Set(words)]
      .filter(word => !stopWords.includes(word))
      .slice(0, 20);
      
    return keywords;
  }
  
  private static truncateContent(content: string, maxLength: number): string {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  }
}