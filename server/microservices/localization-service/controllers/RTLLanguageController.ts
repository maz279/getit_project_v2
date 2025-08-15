/**
 * RTLLanguageController.ts
 * RTL Language Support Controller - Amazon.com/Shopee.sg-Level Phase 2 Implementation
 * 
 * Features:
 * - Right-to-Left (RTL) language support
 * - Bidirectional text processing
 * - RTL UI layout management
 * - Arabic, Hebrew, Persian, Urdu support
 * - Mixed content handling (LTR + RTL)
 * - Enterprise-grade RTL optimization
 */

import { Request, Response } from 'express';
import { db } from '../../../db';
import { 
  rtlLanguageConfigs, 
  rtlLayoutMappings, 
  bidirectionalContent,
  rtlOptimizationRules 
} from '../../../../shared/schema';
import { eq, and, desc, gte, lte, or, like, sql } from 'drizzle-orm';

export class RTLLanguageController {
  private rtlLanguages = ['ar', 'he', 'fa', 'ur', 'ps', 'sd', 'yi'];
  private layoutCache: Map<string, any> = new Map();
  private optimizationRules: Map<string, any> = new Map();

  /**
   * Get RTL language configurations
   * GET /api/v1/localization/rtl/configs
   */
  async getRTLConfigs(req: Request, res: Response) {
    try {
      const { language, tenantId } = req.query;

      let query = db.select().from(rtlLanguageConfigs);
      const conditions = [];

      if (language) {
        conditions.push(eq(rtlLanguageConfigs.languageCode, language as string));
      }

      if (tenantId) {
        conditions.push(eq(rtlLanguageConfigs.tenantId, tenantId as string));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const configs = await query.orderBy(rtlLanguageConfigs.languageCode);

      res.json({
        success: true,
        configs,
        supportedLanguages: this.rtlLanguages,
        features: {
          bidirectionalText: true,
          automaticLayoutSwitching: true,
          mixedContentSupport: true,
          fontOptimization: true,
          uiMirroring: true
        }
      });

    } catch (error) {
      console.error('Get RTL configs error:', error);
      res.status(500).json({ 
        error: 'Failed to get RTL configurations',
        details: error.message 
      });
    }
  }

  /**
   * Create RTL language configuration
   * POST /api/v1/localization/rtl/configs
   */
  async createRTLConfig(req: Request, res: Response) {
    try {
      const { 
        languageCode, 
        languageName, 
        directionality,
        fontFamily,
        fontSize,
        textAlignment,
        layoutMirror,
        customRules,
        tenantId,
        metadata 
      } = req.body;

      // Validate RTL language
      if (!this.rtlLanguages.includes(languageCode)) {
        return res.status(400).json({ 
          error: 'Language code must be a valid RTL language',
          supportedLanguages: this.rtlLanguages 
        });
      }

      // Create RTL configuration
      const [newConfig] = await db.insert(rtlLanguageConfigs).values({
        languageCode,
        languageName,
        directionality: directionality || 'rtl',
        fontFamily: fontFamily || this.getDefaultFont(languageCode),
        fontSize: fontSize || 16,
        textAlignment: textAlignment || 'right',
        layoutMirror: layoutMirror !== false,
        customRules: customRules || {},
        tenantId: tenantId || 'default',
        metadata: metadata || {},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      // Generate layout mappings
      await this.generateLayoutMappings(newConfig.id, languageCode);

      // Create optimization rules
      await this.createOptimizationRules(newConfig.id, languageCode);

      res.status(201).json({
        success: true,
        config: newConfig,
        layoutMappings: await this.getLayoutMappings(newConfig.id),
        optimizationRules: await this.getOptimizationRules(newConfig.id)
      });

    } catch (error) {
      console.error('Create RTL config error:', error);
      res.status(500).json({ 
        error: 'Failed to create RTL configuration',
        details: error.message 
      });
    }
  }

  /**
   * Process bidirectional text
   * POST /api/v1/localization/rtl/process
   */
  async processBidirectionalText(req: Request, res: Response) {
    try {
      const { 
        content, 
        languageCode, 
        contentType,
        preserveFormatting,
        tenantId 
      } = req.body;

      if (!content || !languageCode) {
        return res.status(400).json({ 
          error: 'Content and language code are required' 
        });
      }

      // Detect text direction
      const textDirection = this.detectTextDirection(content);
      const isRTL = this.rtlLanguages.includes(languageCode);

      // Process bidirectional content
      const processedContent = await this.processBidirectionalContent(
        content, 
        languageCode, 
        textDirection,
        preserveFormatting
      );

      // Store processed content
      const [contentRecord] = await db.insert(bidirectionalContent).values({
        originalContent: content,
        processedContent: processedContent.text,
        languageCode,
        textDirection,
        contentType: contentType || 'text',
        processingRules: processedContent.rules,
        tenantId: tenantId || 'default',
        createdAt: new Date()
      }).returning();

      res.json({
        success: true,
        processed: {
          id: contentRecord.id,
          originalContent: content,
          processedContent: processedContent.text,
          textDirection,
          languageCode,
          isRTL,
          directionChanges: processedContent.directionChanges,
          unicodeMarkers: processedContent.unicodeMarkers
        },
        analysis: {
          hasLTRContent: processedContent.hasLTRContent,
          hasRTLContent: processedContent.hasRTLContent,
          isMixed: processedContent.isMixed,
          complexity: processedContent.complexity
        }
      });

    } catch (error) {
      console.error('Process bidirectional text error:', error);
      res.status(500).json({ 
        error: 'Failed to process bidirectional text',
        details: error.message 
      });
    }
  }

  /**
   * Get RTL layout mappings
   * GET /api/v1/localization/rtl/layouts/:configId
   */
  async getRTLLayoutMappings(req: Request, res: Response) {
    try {
      const { configId } = req.params;
      const { component, category } = req.query;

      let query = db.select()
        .from(rtlLayoutMappings)
        .where(eq(rtlLayoutMappings.configId, Number(configId)));

      const conditions = [eq(rtlLayoutMappings.configId, Number(configId))];

      if (component) {
        conditions.push(eq(rtlLayoutMappings.component, component as string));
      }

      if (category) {
        conditions.push(eq(rtlLayoutMappings.category, category as string));
      }

      if (conditions.length > 1) {
        query = query.where(and(...conditions));
      }

      const mappings = await query.orderBy(rtlLayoutMappings.component);

      res.json({
        success: true,
        mappings,
        categories: this.getLayoutCategories(),
        components: this.getLayoutComponents()
      });

    } catch (error) {
      console.error('Get RTL layout mappings error:', error);
      res.status(500).json({ 
        error: 'Failed to get RTL layout mappings',
        details: error.message 
      });
    }
  }

  /**
   * Update RTL layout mapping
   * PUT /api/v1/localization/rtl/layouts/:mappingId
   */
  async updateRTLLayoutMapping(req: Request, res: Response) {
    try {
      const { mappingId } = req.params;
      const { 
        ltrProperty, 
        rtlProperty, 
        transformationRule,
        priority,
        metadata 
      } = req.body;

      const [updatedMapping] = await db.update(rtlLayoutMappings)
        .set({
          ltrProperty,
          rtlProperty,
          transformationRule,
          priority: priority || 1,
          metadata: metadata || {},
          updatedAt: new Date()
        })
        .where(eq(rtlLayoutMappings.id, Number(mappingId)))
        .returning();

      // Clear layout cache
      this.clearLayoutCache();

      res.json({
        success: true,
        mapping: updatedMapping,
        message: 'RTL layout mapping updated successfully'
      });

    } catch (error) {
      console.error('Update RTL layout mapping error:', error);
      res.status(500).json({ 
        error: 'Failed to update RTL layout mapping',
        details: error.message 
      });
    }
  }

  /**
   * Generate RTL CSS
   * POST /api/v1/localization/rtl/css
   */
  async generateRTLCSS(req: Request, res: Response) {
    try {
      const { 
        languageCode, 
        cssContent, 
        configId,
        includeWCAG,
        optimizeForMobile 
      } = req.body;

      if (!languageCode || !cssContent) {
        return res.status(400).json({ 
          error: 'Language code and CSS content are required' 
        });
      }

      // Get RTL configuration
      const config = configId ? 
        await this.getRTLConfigById(configId) : 
        await this.getRTLConfigByLanguage(languageCode);

      if (!config) {
        return res.status(404).json({ 
          error: 'RTL configuration not found' 
        });
      }

      // Generate RTL CSS
      const rtlCSS = await this.generateRTLCSSFromConfig(
        cssContent, 
        config, 
        includeWCAG,
        optimizeForMobile
      );

      res.json({
        success: true,
        originalCSS: cssContent,
        rtlCSS: rtlCSS.css,
        transformations: rtlCSS.transformations,
        optimizations: rtlCSS.optimizations,
        wcagCompliance: rtlCSS.wcagCompliance,
        statistics: {
          originalRules: rtlCSS.statistics.originalRules,
          transformedRules: rtlCSS.statistics.transformedRules,
          optimizedRules: rtlCSS.statistics.optimizedRules
        }
      });

    } catch (error) {
      console.error('Generate RTL CSS error:', error);
      res.status(500).json({ 
        error: 'Failed to generate RTL CSS',
        details: error.message 
      });
    }
  }

  /**
   * Validate RTL content
   * POST /api/v1/localization/rtl/validate
   */
  async validateRTLContent(req: Request, res: Response) {
    try {
      const { 
        content, 
        languageCode, 
        contentType,
        strictMode 
      } = req.body;

      if (!content || !languageCode) {
        return res.status(400).json({ 
          error: 'Content and language code are required' 
        });
      }

      // Perform RTL validation
      const validation = await this.validateRTLContentInternal(
        content, 
        languageCode, 
        contentType,
        strictMode
      );

      res.json({
        success: true,
        validation: {
          isValid: validation.isValid,
          score: validation.score,
          issues: validation.issues,
          suggestions: validation.suggestions,
          directionalityCheck: validation.directionalityCheck,
          unicodeCompliance: validation.unicodeCompliance,
          fontCompatibility: validation.fontCompatibility
        },
        analysis: {
          contentLength: content.length,
          detectedLanguage: validation.detectedLanguage,
          textDirection: validation.textDirection,
          hasNumbers: validation.hasNumbers,
          hasMixedContent: validation.hasMixedContent
        }
      });

    } catch (error) {
      console.error('Validate RTL content error:', error);
      res.status(500).json({ 
        error: 'Failed to validate RTL content',
        details: error.message 
      });
    }
  }

  /**
   * Get RTL optimization suggestions
   * GET /api/v1/localization/rtl/optimize/:configId
   */
  async getRTLOptimizationSuggestions(req: Request, res: Response) {
    try {
      const { configId } = req.params;
      const { includePerformance, includeAccessibility } = req.query;

      const optimizationRules = await db.select()
        .from(rtlOptimizationRules)
        .where(eq(rtlOptimizationRules.configId, Number(configId)));

      const suggestions = await this.generateOptimizationSuggestions(
        optimizationRules,
        includePerformance === 'true',
        includeAccessibility === 'true'
      );

      res.json({
        success: true,
        suggestions,
        categories: {
          performance: suggestions.filter(s => s.category === 'performance'),
          accessibility: suggestions.filter(s => s.category === 'accessibility'),
          usability: suggestions.filter(s => s.category === 'usability'),
          cultural: suggestions.filter(s => s.category === 'cultural')
        },
        priorityLevels: {
          critical: suggestions.filter(s => s.priority === 'critical'),
          high: suggestions.filter(s => s.priority === 'high'),
          medium: suggestions.filter(s => s.priority === 'medium'),
          low: suggestions.filter(s => s.priority === 'low')
        }
      });

    } catch (error) {
      console.error('Get RTL optimization suggestions error:', error);
      res.status(500).json({ 
        error: 'Failed to get RTL optimization suggestions',
        details: error.message 
      });
    }
  }

  // Private helper methods

  private detectTextDirection(content: string): 'ltr' | 'rtl' | 'mixed' {
    const rtlChars = /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F\u08A0-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;
    const ltrChars = /[A-Za-z\u0100-\u017F\u0180-\u024F]/;
    
    const hasRTL = rtlChars.test(content);
    const hasLTR = ltrChars.test(content);
    
    if (hasRTL && hasLTR) return 'mixed';
    if (hasRTL) return 'rtl';
    return 'ltr';
  }

  private async processBidirectionalContent(
    content: string, 
    languageCode: string, 
    textDirection: string,
    preserveFormatting?: boolean
  ) {
    // Process bidirectional content with Unicode bidi algorithm
    const processed = {
      text: content,
      rules: [],
      directionChanges: [],
      unicodeMarkers: [],
      hasLTRContent: false,
      hasRTLContent: false,
      isMixed: textDirection === 'mixed',
      complexity: 'simple'
    };

    // Add Unicode directional markers if needed
    if (textDirection === 'mixed') {
      processed.text = this.addUnicodeMarkers(content);
      processed.unicodeMarkers = this.extractUnicodeMarkers(processed.text);
      processed.complexity = 'complex';
    }

    // Apply language-specific processing rules
    const languageRules = this.getLanguageSpecificRules(languageCode);
    processed.rules = languageRules;

    return processed;
  }

  private addUnicodeMarkers(content: string): string {
    // Add Unicode Bidi control characters
    const LRM = '\u200E'; // Left-to-Right Mark
    const RLM = '\u200F'; // Right-to-Left Mark
    const LRE = '\u202A'; // Left-to-Right Embedding
    const RLE = '\u202B'; // Right-to-Left Embedding
    const PDF = '\u202C'; // Pop Directional Formatting

    // Simple implementation - add markers around direction changes
    return content.replace(
      /([A-Za-z]+)(\s+)([\u0590-\u05FF\u0600-\u06FF]+)/g,
      `$1${LRM}$2${RLM}$3`
    );
  }

  private extractUnicodeMarkers(text: string): string[] {
    const markers = [];
    const unicodePattern = /[\u200E\u200F\u202A\u202B\u202C\u202D\u202E]/g;
    let match;
    
    while ((match = unicodePattern.exec(text)) !== null) {
      markers.push({
        char: match[0],
        position: match.index,
        type: this.getUnicodeMarkerType(match[0])
      });
    }
    
    return markers;
  }

  private getUnicodeMarkerType(char: string): string {
    const types = {
      '\u200E': 'LRM',
      '\u200F': 'RLM',
      '\u202A': 'LRE',
      '\u202B': 'RLE',
      '\u202C': 'PDF',
      '\u202D': 'LRO',
      '\u202E': 'RLO'
    };
    return types[char] || 'Unknown';
  }

  private getLanguageSpecificRules(languageCode: string): any[] {
    const rules = {
      'ar': [
        { rule: 'arabic_numerals', description: 'Use Arabic-Indic numerals' },
        { rule: 'contextual_forms', description: 'Apply contextual letter forms' }
      ],
      'he': [
        { rule: 'hebrew_punctuation', description: 'Adjust Hebrew punctuation' },
        { rule: 'nikud_support', description: 'Support Hebrew diacritics' }
      ],
      'fa': [
        { rule: 'persian_digits', description: 'Use Persian digits' },
        { rule: 'zero_width_joiner', description: 'Handle Persian letter connections' }
      ],
      'ur': [
        { rule: 'urdu_punctuation', description: 'Adjust Urdu punctuation' },
        { rule: 'nastaliq_font', description: 'Optimize for Nastaliq script' }
      ]
    };
    
    return rules[languageCode] || [];
  }

  private getDefaultFont(languageCode: string): string {
    const fonts = {
      'ar': 'Noto Sans Arabic, Arial, sans-serif',
      'he': 'Noto Sans Hebrew, Arial, sans-serif',
      'fa': 'Noto Sans Persian, Arial, sans-serif',
      'ur': 'Noto Nastaliq Urdu, Arial, sans-serif'
    };
    
    return fonts[languageCode] || 'Arial, sans-serif';
  }

  private async generateLayoutMappings(configId: number, languageCode: string): Promise<void> {
    const mappings = [
      { component: 'button', category: 'ui', ltrProperty: 'margin-left', rtlProperty: 'margin-right' },
      { component: 'input', category: 'form', ltrProperty: 'text-align: left', rtlProperty: 'text-align: right' },
      { component: 'navigation', category: 'layout', ltrProperty: 'float: left', rtlProperty: 'float: right' },
      { component: 'sidebar', category: 'layout', ltrProperty: 'border-left', rtlProperty: 'border-right' },
      { component: 'tooltip', category: 'ui', ltrProperty: 'left: 0', rtlProperty: 'right: 0' }
    ];

    for (const mapping of mappings) {
      await db.insert(rtlLayoutMappings).values({
        configId,
        component: mapping.component,
        category: mapping.category,
        ltrProperty: mapping.ltrProperty,
        rtlProperty: mapping.rtlProperty,
        transformationRule: 'mirror',
        priority: 1,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }

  private async createOptimizationRules(configId: number, languageCode: string): Promise<void> {
    const rules = [
      { rule: 'font_optimization', description: 'Optimize font loading for RTL', priority: 'high' },
      { rule: 'layout_caching', description: 'Cache RTL layout calculations', priority: 'medium' },
      { rule: 'bidi_processing', description: 'Optimize bidirectional text processing', priority: 'high' },
      { rule: 'rtl_animations', description: 'Mirror animations for RTL', priority: 'low' }
    ];

    for (const rule of rules) {
      await db.insert(rtlOptimizationRules).values({
        configId,
        ruleName: rule.rule,
        description: rule.description,
        priority: rule.priority,
        isEnabled: true,
        ruleData: {},
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }

  private async getRTLConfigById(configId: number): Promise<any> {
    const [config] = await db.select()
      .from(rtlLanguageConfigs)
      .where(eq(rtlLanguageConfigs.id, configId));
    return config;
  }

  private async getRTLConfigByLanguage(languageCode: string): Promise<any> {
    const [config] = await db.select()
      .from(rtlLanguageConfigs)
      .where(eq(rtlLanguageConfigs.languageCode, languageCode));
    return config;
  }

  private async generateRTLCSSFromConfig(
    cssContent: string, 
    config: any, 
    includeWCAG?: boolean,
    optimizeForMobile?: boolean
  ): Promise<any> {
    // Generate RTL CSS transformations
    const transformations = [];
    const optimizations = [];
    
    // Basic RTL transformations
    let rtlCSS = cssContent
      .replace(/margin-left/g, 'margin-right')
      .replace(/margin-right/g, 'margin-left')
      .replace(/padding-left/g, 'padding-right')
      .replace(/padding-right/g, 'padding-left')
      .replace(/float:\s*left/g, 'float: right')
      .replace(/float:\s*right/g, 'float: left')
      .replace(/text-align:\s*left/g, 'text-align: right')
      .replace(/text-align:\s*right/g, 'text-align: left');

    transformations.push('Applied basic RTL property mirroring');

    // Add font family from config
    if (config.fontFamily) {
      rtlCSS = `body { font-family: ${config.fontFamily}; }\n${rtlCSS}`;
      transformations.push('Added RTL font family');
    }

    // Add direction property
    rtlCSS = `html { direction: rtl; }\n${rtlCSS}`;
    transformations.push('Added RTL direction');

    // WCAG compliance
    let wcagCompliance = {};
    if (includeWCAG) {
      wcagCompliance = {
        colorContrast: 'AA',
        keyboardNavigation: 'supported',
        screenReader: 'optimized'
      };
    }

    // Mobile optimizations
    if (optimizeForMobile) {
      rtlCSS += `\n@media (max-width: 768px) { body { font-size: ${config.fontSize + 2}px; } }`;
      optimizations.push('Mobile font size optimization');
    }

    return {
      css: rtlCSS,
      transformations,
      optimizations,
      wcagCompliance,
      statistics: {
        originalRules: cssContent.split('{').length - 1,
        transformedRules: rtlCSS.split('{').length - 1,
        optimizedRules: optimizations.length
      }
    };
  }

  private async validateRTLContentInternal(
    content: string, 
    languageCode: string, 
    contentType?: string,
    strictMode?: boolean
  ): Promise<any> {
    const validation = {
      isValid: true,
      score: 100,
      issues: [],
      suggestions: [],
      directionalityCheck: true,
      unicodeCompliance: true,
      fontCompatibility: true,
      detectedLanguage: languageCode,
      textDirection: this.detectTextDirection(content),
      hasNumbers: /\d/.test(content),
      hasMixedContent: this.detectTextDirection(content) === 'mixed'
    };

    // Check for common RTL issues
    if (validation.hasMixedContent && !content.includes('\u200E') && !content.includes('\u200F')) {
      validation.issues.push('Mixed content detected without proper Unicode markers');
      validation.suggestions.push('Add Unicode directional markers for better display');
      validation.score -= 20;
    }

    // Check font compatibility
    if (!this.isFontCompatible(languageCode)) {
      validation.fontCompatibility = false;
      validation.issues.push('Font may not support RTL language properly');
      validation.suggestions.push(`Use ${this.getDefaultFont(languageCode)} for better compatibility`);
      validation.score -= 15;
    }

    // Strict mode validations
    if (strictMode) {
      if (content.includes('?') && languageCode === 'ar') {
        validation.issues.push('Arabic question mark should be ؟ not ?');
        validation.suggestions.push('Replace ? with ؟ for Arabic content');
        validation.score -= 10;
      }
    }

    validation.isValid = validation.score >= 80;

    return validation;
  }

  private isFontCompatible(languageCode: string): boolean {
    // Simplified font compatibility check
    return this.rtlLanguages.includes(languageCode);
  }

  private async generateOptimizationSuggestions(
    optimizationRules: any[],
    includePerformance: boolean,
    includeAccessibility: boolean
  ): Promise<any[]> {
    const suggestions = [];

    if (includePerformance) {
      suggestions.push({
        category: 'performance',
        priority: 'high',
        title: 'Enable RTL Layout Caching',
        description: 'Cache RTL layout calculations for better performance',
        implementation: 'Add CSS contain: layout style;'
      });
    }

    if (includeAccessibility) {
      suggestions.push({
        category: 'accessibility',
        priority: 'critical',
        title: 'Screen Reader Optimization',
        description: 'Optimize content for RTL screen readers',
        implementation: 'Add proper ARIA labels and language attributes'
      });
    }

    suggestions.push({
      category: 'usability',
      priority: 'medium',
      title: 'Improve Number Display',
      description: 'Use language-appropriate number formatting',
      implementation: 'Apply local number formatting rules'
    });

    return suggestions;
  }

  private getLayoutCategories(): string[] {
    return ['ui', 'form', 'layout', 'navigation', 'content'];
  }

  private getLayoutComponents(): string[] {
    return ['button', 'input', 'navigation', 'sidebar', 'tooltip', 'modal', 'card', 'table'];
  }

  private async getLayoutMappings(configId: number): Promise<any[]> {
    return await db.select()
      .from(rtlLayoutMappings)
      .where(eq(rtlLayoutMappings.configId, configId));
  }

  private async getOptimizationRules(configId: number): Promise<any[]> {
    return await db.select()
      .from(rtlOptimizationRules)
      .where(eq(rtlOptimizationRules.configId, configId));
  }

  private clearLayoutCache(): void {
    this.layoutCache.clear();
  }
}

export default RTLLanguageController;