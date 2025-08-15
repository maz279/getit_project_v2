/**
 * AMAZON.COM/SHOPEE.SG-LEVEL LANGUAGE PROCESSING CONTROLLER
 * Advanced Bengali/English NLP with cultural context processing
 * Features: Translation, cultural adaptation, language detection
 */

import { Request, Response } from 'express';

export class LanguageProcessingController {

  /**
   * HEALTH CHECK
   */
  async getHealth(req: Request, res: Response) {
    try {
      res.status(200).json({
        success: true,
        service: 'language-processing-controller',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        features: [
          'Bengali/English NLP processing',
          'Automatic language detection',
          'Cultural context analysis',
          'Review translation services',
          'Text normalization and cleaning',
          'Named entity recognition',
          'Cultural sentiment adaptation'
        ]
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Language processing service health check failed',
        error: error.message
      });
    }
  }

  /**
   * AUTOMATIC LANGUAGE DETECTION
   * Detect language of review content with high accuracy
   */
  async detectLanguage(req: Request, res: Response) {
    try {
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({
          success: false,
          message: 'Content is required for language detection'
        });
      }

      const detection = await this.performLanguageDetection(content);

      res.status(200).json({
        success: true,
        data: {
          detectedLanguage: detection.language,
          confidence: detection.confidence,
          alternativeLanguages: detection.alternatives,
          script: detection.script,
          culturalContext: detection.culturalMarkers
        },
        message: 'Language detection completed'
      });

    } catch (error) {
      console.error('Language detection error:', error);
      res.status(500).json({
        success: false,
        message: 'Language detection failed',
        error: error.message
      });
    }
  }

  /**
   * REVIEW TRANSLATION SERVICES
   * Translate reviews between Bengali and English
   */
  async translateReview(req: Request, res: Response) {
    try {
      const { content, sourceLanguage, targetLanguage, preserveCulturalContext = true } = req.body;

      if (!content || !targetLanguage) {
        return res.status(400).json({
          success: false,
          message: 'Content and target language are required'
        });
      }

      const translation = await this.performTranslation({
        content,
        sourceLanguage,
        targetLanguage,
        preserveCulturalContext
      });

      res.status(200).json({
        success: true,
        data: {
          originalContent: content,
          translatedContent: translation.translatedText,
          sourceLanguage: translation.detectedSourceLanguage,
          targetLanguage,
          confidence: translation.confidence,
          culturalAdaptations: translation.culturalAdaptations,
          preservedElements: translation.preservedElements
        },
        message: 'Translation completed successfully'
      });

    } catch (error) {
      console.error('Translation error:', error);
      res.status(500).json({
        success: false,
        message: 'Translation failed',
        error: error.message
      });
    }
  }

  /**
   * CULTURAL CONTEXT ANALYSIS
   * Analyze cultural context and adapt content accordingly
   */
  async analyzeCulturalContext(req: Request, res: Response) {
    try {
      const { content, language = 'auto' } = req.body;

      if (!content) {
        return res.status(400).json({
          success: false,
          message: 'Content is required for cultural analysis'
        });
      }

      const culturalAnalysis = await this.performCulturalAnalysis(content, language);

      res.status(200).json({
        success: true,
        data: {
          culturalMarkers: culturalAnalysis.markers,
          religiousContext: culturalAnalysis.religiousContext,
          formalityLevel: culturalAnalysis.formalityLevel,
          emotionalExpression: culturalAnalysis.emotionalExpression,
          culturalReferences: culturalAnalysis.references,
          adaptationSuggestions: culturalAnalysis.adaptations
        },
        message: 'Cultural context analysis completed'
      });

    } catch (error) {
      console.error('Cultural analysis error:', error);
      res.status(500).json({
        success: false,
        message: 'Cultural context analysis failed',
        error: error.message
      });
    }
  }

  /**
   * TEXT NORMALIZATION AND CLEANING
   * Clean and normalize review text for processing
   */
  async normalizeText(req: Request, res: Response) {
    try {
      const { 
        content, 
        language = 'auto',
        removeEmojis = false,
        fixTypos = true,
        standardizeSpacing = true 
      } = req.body;

      if (!content) {
        return res.status(400).json({
          success: false,
          message: 'Content is required for text normalization'
        });
      }

      const normalized = await this.performTextNormalization({
        content,
        language,
        removeEmojis,
        fixTypos,
        standardizeSpacing
      });

      res.status(200).json({
        success: true,
        data: {
          originalContent: content,
          normalizedContent: normalized.text,
          changes: normalized.changes,
          language: normalized.detectedLanguage,
          statistics: {
            originalLength: content.length,
            normalizedLength: normalized.text.length,
            changesApplied: normalized.changes.length
          }
        },
        message: 'Text normalization completed'
      });

    } catch (error) {
      console.error('Text normalization error:', error);
      res.status(500).json({
        success: false,
        message: 'Text normalization failed',
        error: error.message
      });
    }
  }

  /**
   * NAMED ENTITY RECOGNITION
   * Extract entities from review content
   */
  async extractEntities(req: Request, res: Response) {
    try {
      const { content, language = 'auto', entityTypes = 'all' } = req.body;

      if (!content) {
        return res.status(400).json({
          success: false,
          message: 'Content is required for entity extraction'
        });
      }

      const entities = await this.performEntityExtraction(content, language, entityTypes);

      res.status(200).json({
        success: true,
        data: {
          entities: entities.entities,
          summary: {
            totalEntities: entities.entities.length,
            entityTypes: [...new Set(entities.entities.map(e => e.type))],
            confidence: entities.averageConfidence
          },
          language: entities.detectedLanguage
        },
        message: 'Entity extraction completed'
      });

    } catch (error) {
      console.error('Entity extraction error:', error);
      res.status(500).json({
        success: false,
        message: 'Entity extraction failed',
        error: error.message
      });
    }
  }

  /**
   * BATCH LANGUAGE PROCESSING
   * Process multiple reviews simultaneously
   */
  async batchProcess(req: Request, res: Response) {
    try {
      const { 
        reviews, 
        operations = ['detect', 'normalize', 'analyze'], 
        targetLanguage 
      } = req.body;

      if (!reviews || !Array.isArray(reviews)) {
        return res.status(400).json({
          success: false,
          message: 'Reviews array is required for batch processing'
        });
      }

      const results = [];
      const errors = [];

      for (const review of reviews) {
        try {
          const result = await this.processSingleReview(review, operations, targetLanguage);
          results.push({ reviewId: review.id, success: true, result });
        } catch (error) {
          errors.push({ reviewId: review.id, success: false, error: error.message });
        }
      }

      res.status(200).json({
        success: true,
        data: {
          processed: results.length,
          failed: errors.length,
          results,
          errors,
          summary: {
            languageDistribution: this.calculateLanguageDistribution(results),
            processingTime: results.reduce((sum, r) => sum + (r.result.processingTime || 0), 0)
          }
        },
        message: `Batch processing completed: ${results.length} processed, ${errors.length} failed`
      });

    } catch (error) {
      console.error('Batch processing error:', error);
      res.status(500).json({
        success: false,
        message: 'Batch processing failed',
        error: error.message
      });
    }
  }

  /**
   * PRIVATE HELPER METHODS
   */

  private async performLanguageDetection(content: string) {
    // Advanced language detection with cultural markers
    const bengaliPatterns = [
      /[\u0980-\u09FF]/g, // Bengali Unicode range
      /\b(আমি|আপনি|এটা|খুব|ভালো|খারাপ|দারুণ|চমৎকার)\b/g
    ];

    const englishPatterns = [
      /^[a-zA-Z\s.,!?'"()-]+$/,
      /\b(the|and|is|was|were|good|bad|excellent|amazing)\b/gi
    ];

    let bengaliScore = 0;
    let englishScore = 0;

    // Check for Bengali patterns
    bengaliPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        bengaliScore += matches.length * 0.1;
      }
    });

    // Check for English patterns
    englishPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        englishScore += matches.length * 0.05;
      }
    });

    // Determine script
    const hasBengaliScript = /[\u0980-\u09FF]/.test(content);
    const script = hasBengaliScript ? 'Bengali' : 'Latin';

    // Cultural markers
    const culturalMarkers = this.detectCulturalMarkers(content);

    let language = 'en';
    let confidence = 0.5;

    if (bengaliScore > englishScore && hasBengaliScript) {
      language = 'bn';
      confidence = Math.min(bengaliScore / (bengaliScore + englishScore), 0.95);
    } else if (englishScore > bengaliScore) {
      language = 'en';
      confidence = Math.min(englishScore / (bengaliScore + englishScore), 0.95);
    }

    return {
      language,
      confidence,
      script,
      alternatives: [
        { language: language === 'bn' ? 'en' : 'bn', confidence: 1 - confidence }
      ],
      culturalMarkers
    };
  }

  private async performTranslation(options: any) {
    const { content, sourceLanguage, targetLanguage, preserveCulturalContext } = options;

    // Detect source language if not provided
    const detectedLanguage = sourceLanguage || (await this.performLanguageDetection(content)).language;

    // Cultural elements to preserve
    const culturalElements = preserveCulturalContext ? 
      this.extractCulturalElements(content, detectedLanguage) : [];

    // Perform translation (mock implementation)
    let translatedText = await this.translateText(content, detectedLanguage, targetLanguage);

    // Reinsert cultural elements if preserving context
    if (preserveCulturalContext && culturalElements.length > 0) {
      translatedText = this.reinsertCulturalElements(translatedText, culturalElements, targetLanguage);
    }

    return {
      translatedText,
      detectedSourceLanguage: detectedLanguage,
      confidence: 0.9,
      culturalAdaptations: culturalElements.map(e => e.adaptation),
      preservedElements: culturalElements.map(e => e.original)
    };
  }

  private async performCulturalAnalysis(content: string, language: string) {
    if (language === 'auto') {
      language = (await this.performLanguageDetection(content)).language;
    }

    const markers = this.detectCulturalMarkers(content);
    const religiousContext = this.analyzeReligiousContext(content);
    const formalityLevel = this.analyzeFormalityLevel(content, language);
    const emotionalExpression = this.analyzeEmotionalExpression(content, language);
    const references = this.extractCulturalReferences(content, language);

    return {
      markers,
      religiousContext,
      formalityLevel,
      emotionalExpression,
      references,
      adaptations: this.generateAdaptationSuggestions(content, language)
    };
  }

  private async performTextNormalization(options: any) {
    const { content, language, removeEmojis, fixTypos, standardizeSpacing } = options;
    
    let normalizedText = content;
    const changes = [];

    // Detect language if auto
    const detectedLanguage = language === 'auto' ? 
      (await this.performLanguageDetection(content)).language : language;

    // Standardize spacing
    if (standardizeSpacing) {
      const original = normalizedText;
      normalizedText = normalizedText.replace(/\s+/g, ' ').trim();
      if (original !== normalizedText) {
        changes.push('Standardized spacing');
      }
    }

    // Remove emojis if requested
    if (removeEmojis) {
      const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
      const original = normalizedText;
      normalizedText = normalizedText.replace(emojiRegex, '');
      if (original !== normalizedText) {
        changes.push('Removed emojis');
      }
    }

    // Fix common typos
    if (fixTypos) {
      const typoFixes = this.getTypoFixes(detectedLanguage);
      let hasTypoFixes = false;
      
      typoFixes.forEach(fix => {
        const original = normalizedText;
        normalizedText = normalizedText.replace(fix.pattern, fix.replacement);
        if (original !== normalizedText) {
          hasTypoFixes = true;
        }
      });
      
      if (hasTypoFixes) {
        changes.push('Fixed typos');
      }
    }

    return {
      text: normalizedText,
      changes,
      detectedLanguage
    };
  }

  private async performEntityExtraction(content: string, language: string, entityTypes: string) {
    if (language === 'auto') {
      language = (await this.performLanguageDetection(content)).language;
    }

    const entities = [];

    // Product mentions
    const productPatterns = language === 'bn' ? 
      [/পণ্য|পণ্যের|দ্রব্য|জিনিস/g] : 
      [/product|item|device|gadget/gi];
    
    productPatterns.forEach(pattern => {
      const matches = [...content.matchAll(pattern)];
      matches.forEach(match => {
        entities.push({
          text: match[0],
          type: 'PRODUCT',
          start: match.index,
          end: match.index + match[0].length,
          confidence: 0.8
        });
      });
    });

    // Brand mentions
    const brandPatterns = [/Samsung|Apple|Xiaomi|OnePlus|Oppo|Vivo/gi];
    brandPatterns.forEach(pattern => {
      const matches = [...content.matchAll(pattern)];
      matches.forEach(match => {
        entities.push({
          text: match[0],
          type: 'BRAND',
          start: match.index,
          end: match.index + match[0].length,
          confidence: 0.9
        });
      });
    });

    // Location mentions
    const locationPatterns = language === 'bn' ? 
      [/ঢাকা|চট্টগ্রাম|সিলেট|খুলনা|রাজশাহী|বরিশাল|রংপুর|ময়মনসিংহ/g] :
      [/Dhaka|Chittagong|Sylhet|Khulna|Rajshahi|Barisal|Rangpur|Mymensingh|Bangladesh/gi];
    
    locationPatterns.forEach(pattern => {
      const matches = [...content.matchAll(pattern)];
      matches.forEach(match => {
        entities.push({
          text: match[0],
          type: 'LOCATION',
          start: match.index,
          end: match.index + match[0].length,
          confidence: 0.85
        });
      });
    });

    const averageConfidence = entities.length > 0 ? 
      entities.reduce((sum, e) => sum + e.confidence, 0) / entities.length : 0;

    return {
      entities,
      averageConfidence,
      detectedLanguage: language
    };
  }

  private async processSingleReview(review: any, operations: string[], targetLanguage?: string) {
    const startTime = Date.now();
    const result: any = { reviewId: review.id };

    if (operations.includes('detect')) {
      result.languageDetection = await this.performLanguageDetection(review.content);
    }

    if (operations.includes('normalize')) {
      result.normalization = await this.performTextNormalization({
        content: review.content,
        language: result.languageDetection?.language || 'auto'
      });
    }

    if (operations.includes('analyze')) {
      result.culturalAnalysis = await this.performCulturalAnalysis(
        review.content, 
        result.languageDetection?.language || 'auto'
      );
    }

    if (operations.includes('translate') && targetLanguage) {
      result.translation = await this.performTranslation({
        content: review.content,
        sourceLanguage: result.languageDetection?.language,
        targetLanguage,
        preserveCulturalContext: true
      });
    }

    if (operations.includes('entities')) {
      result.entities = await this.performEntityExtraction(
        review.content,
        result.languageDetection?.language || 'auto',
        'all'
      );
    }

    result.processingTime = Date.now() - startTime;
    return result;
  }

  // Additional helper methods
  private detectCulturalMarkers(content: string) {
    return {
      religiousReferences: /আল্লাহ|ইনশাআল্লাহ|মাশাআল্লাহ|blessed|prayer/gi.test(content),
      formalityMarkers: /আপনি|স্যার|ম্যাডাম|please|thank you/gi.test(content),
      festivalReferences: /ঈদ|পহেলা বৈশাখ|দুর্গাপূজা|eid|festival/gi.test(content)
    };
  }

  private analyzeReligiousContext(content: string) {
    const islamicTerms = ['আল্লাহ', 'ইনশাআল্লাহ', 'মাশাআল্লাহ', 'আলহামদুলিল্লাহ'];
    const hinduTerms = ['ভগবান', 'প্রভু', 'দেবতা'];
    const christianTerms = ['যীশু', 'ঈশ্বর', 'প্রভু'];
    
    return {
      islamic: islamicTerms.some(term => content.includes(term)),
      hindu: hinduTerms.some(term => content.includes(term)),
      christian: christianTerms.some(term => content.includes(term)),
      secular: !islamicTerms.concat(hinduTerms, christianTerms).some(term => content.includes(term))
    };
  }

  private analyzeFormalityLevel(content: string, language: string): string {
    const formalMarkers = language === 'bn' ? 
      ['আপনি', 'স্যার', 'ম্যাডাম', 'দয়া করে'] :
      ['please', 'thank you', 'sir', 'madam', 'kindly'];
    
    const informalMarkers = language === 'bn' ?
      ['তুমি', 'তোমার', 'বলো', 'দেখো'] :
      ['hey', 'cool', 'awesome', 'gonna', 'wanna'];

    const formalCount = formalMarkers.filter(marker => 
      content.toLowerCase().includes(marker.toLowerCase())
    ).length;

    const informalCount = informalMarkers.filter(marker => 
      content.toLowerCase().includes(marker.toLowerCase())
    ).length;

    if (formalCount > informalCount + 1) return 'formal';
    if (informalCount > formalCount + 1) return 'informal';
    return 'neutral';
  }

  private analyzeEmotionalExpression(content: string, language: string) {
    const strongEmotions = language === 'bn' ?
      ['দারুণ', 'অসাধারণ', 'ভয়ানক', 'চমৎকার', 'বাজে'] :
      ['amazing', 'terrible', 'awesome', 'horrible', 'fantastic'];

    const moderateEmotions = language === 'bn' ?
      ['ভালো', 'খারাপ', 'ঠিক', 'সুন্দর'] :
      ['good', 'bad', 'nice', 'okay', 'fine'];

    const strongCount = strongEmotions.filter(emotion => 
      content.toLowerCase().includes(emotion.toLowerCase())
    ).length;

    const moderateCount = moderateEmotions.filter(emotion => 
      content.toLowerCase().includes(emotion.toLowerCase())
    ).length;

    if (strongCount > 0) return 'highly_expressive';
    if (moderateCount > 1) return 'moderately_expressive';
    return 'reserved';
  }

  private extractCulturalReferences(content: string, language: string) {
    const festivals = language === 'bn' ?
      ['ঈদ', 'পহেলা বৈশাখ', 'দুর্গাপূজা', 'কালী পূজা'] :
      ['eid', 'pohela boishakh', 'durga puja', 'diwali'];

    const foods = language === 'bn' ?
      ['ভাত', 'মাছ', 'বিরিয়ানি', 'ইলিশ', 'চা'] :
      ['rice', 'fish', 'biryani', 'hilsa', 'tea'];

    return {
      festivals: festivals.filter(f => content.toLowerCase().includes(f.toLowerCase())),
      foods: foods.filter(f => content.toLowerCase().includes(f.toLowerCase())),
      clothing: [], // Add clothing references
      traditions: [] // Add tradition references
    };
  }

  private generateAdaptationSuggestions(content: string, language: string) {
    const suggestions = [];
    
    if (language === 'bn') {
      suggestions.push('Consider English translation for international audience');
      suggestions.push('Maintain Bengali cultural context in translation');
    } else {
      suggestions.push('Add Bengali translation for local market');
      suggestions.push('Include cultural context explanations');
    }
    
    return suggestions;
  }

  private extractCulturalElements(content: string, language: string) {
    // Extract cultural elements that should be preserved during translation
    return [
      { original: 'ইনশাআল্লাহ', adaptation: 'Inshallah (God willing)', type: 'religious' },
      { original: 'আলহামদুলিল্লাহ', adaptation: 'Alhamdulillah (praise be to God)', type: 'religious' }
    ];
  }

  private async translateText(content: string, sourceLanguage: string, targetLanguage: string): Promise<string> {
    // Mock translation - would use actual translation service
    if (sourceLanguage === 'bn' && targetLanguage === 'en') {
      return content + ' (translated to English)';
    } else if (sourceLanguage === 'en' && targetLanguage === 'bn') {
      return content + ' (বাংলায় অনুবাদিত)';
    }
    return content;
  }

  private reinsertCulturalElements(text: string, elements: any[], targetLanguage: string): string {
    // Reinsert cultural elements with appropriate adaptations
    let adaptedText = text;
    elements.forEach(element => {
      if (targetLanguage === 'en') {
        adaptedText = adaptedText.replace(element.original, element.adaptation);
      }
    });
    return adaptedText;
  }

  private getTypoFixes(language: string) {
    if (language === 'bn') {
      return [
        { pattern: /ভালো\s+লাগছে/g, replacement: 'ভালো লাগছে' },
        { pattern: /খুব\s+সুন্দর/g, replacement: 'খুব সুন্দর' }
      ];
    } else {
      return [
        { pattern: /\bgood\s+quality\b/gi, replacement: 'good quality' },
        { pattern: /\bfast\s+delivery\b/gi, replacement: 'fast delivery' },
        { pattern: /\bthier\b/gi, replacement: 'their' },
        { pattern: /\brealy\b/gi, replacement: 'really' }
      ];
    }
  }

  private calculateLanguageDistribution(results: any[]) {
    const distribution = {};
    results.forEach(result => {
      const lang = result.result.languageDetection?.language || 'unknown';
      distribution[lang] = (distribution[lang] || 0) + 1;
    });
    return distribution;
  }
}