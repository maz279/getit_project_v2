#!/usr/bin/env node

/**
 * 🔍 FOOTER FORENSIC INVESTIGATION TEST
 * 
 * Comprehensive forensic analysis of footer components following the same
 * methodology that successfully identified AI/ML/NLP service issues.
 * 
 * INVESTIGATION SCOPE:
 * - Performance gaps
 * - Errors and mistakes  
 * - Anomalies and inconsistencies
 * - Architectural issues
 * 
 * FORENSIC METHODOLOGY:
 * 1. Component Duplication Analysis
 * 2. Consistency Validation  
 * 3. Performance Impact Assessment
 * 4. Link Functionality Testing
 * 5. Styling Inconsistency Detection
 */

import fs from 'fs/promises';
import path from 'path';

class FooterForensicInvestigator {
  constructor() {
    this.issues = [];
    this.footerLocations = [
      'client/src/shared/layouts/components/Footer/footer',
      'client/src/domains/customer/home/homepage/footer',
      'client/src/domains/customer/components/home/homepage/footer',
      'client/src/domains/admin/dashboard/footer'
    ];
    this.componentTypes = [
      'FooterMainSection',
      'FooterSecondarySection',
      'FooterRegionalSection',
      'FooterLegalSection',
      'FooterBusinessSection',
      'FooterConnectSection',
      'FooterAdditionalServices',
      'FooterTechnologySection',
      'FooterSpecialPrograms',
      'FooterEmergencySupport',
      'FooterCopyright'
    ];
  }

  async runFullInvestigation() {
    console.log('🔍 FOOTER FORENSIC INVESTIGATION');
    console.log('============================================================');
    console.log(`Started: ${new Date().toISOString()}`);
    console.log('Purpose: Comprehensive footer architecture analysis\n');

    await this.investigateComponentDuplication();
    await this.analyzeConsistencyIssues();
    await this.checkLinkFunctionality();
    await this.analyzeStylingInconsistencies();
    await this.assessPerformanceImpact();

    this.generateForensicReport();
  }

  async investigateComponentDuplication() {
    console.log('🧪 Testing: Component Duplication Analysis');
    
    const duplicateMap = new Map();
    
    for (const location of this.footerLocations) {
      try {
        const files = await fs.readdir(location);
        for (const file of files) {
          if (file.endsWith('.tsx')) {
            const componentName = file.replace('.tsx', '');
            if (!duplicateMap.has(componentName)) {
              duplicateMap.set(componentName, []);
            }
            duplicateMap.get(componentName).push(location);
          }
        }
      } catch (error) {
        // Directory doesn't exist or access error
      }
    }

    let duplicateCount = 0;
    for (const [component, locations] of duplicateMap.entries()) {
      if (locations.length > 1) {
        duplicateCount++;
        this.issues.push({
          type: 'CRITICAL_DUPLICATION',
          component,
          locations,
          severity: 'HIGH',
          description: `Component ${component} duplicated across ${locations.length} locations`
        });
      }
    }

    if (duplicateCount > 0) {
      console.log(`❌ Component Duplication Analysis - FAILED (${duplicateCount} duplicates found)`);
    } else {
      console.log('✅ Component Duplication Analysis - SUCCESS');
    }
  }

  async analyzeConsistencyIssues() {
    console.log('\n🧪 Testing: Styling Consistency Analysis');
    
    const stylingPatterns = new Map();
    
    for (const location of this.footerLocations) {
      for (const componentType of this.componentTypes) {
        const filePath = path.join(location, `${componentType}.tsx`);
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          
          // Extract styling patterns
          const textSizes = content.match(/text-(xs|sm|base|lg|xl)/g) || [];
          const spacings = content.match(/(?:pt|pb|mt|mb|space-y)-\d+/g) || [];
          const gaps = content.match(/gap-\d+/g) || [];
          
          const key = `${componentType}`;
          if (!stylingPatterns.has(key)) {
            stylingPatterns.set(key, new Map());
          }
          
          stylingPatterns.get(key).set(location, {
            textSizes: [...new Set(textSizes)],
            spacings: [...new Set(spacings)],
            gaps: [...new Set(gaps)]
          });
          
        } catch (error) {
          // File doesn't exist in this location
        }
      }
    }

    let inconsistencyCount = 0;
    for (const [component, locationStyles] of stylingPatterns.entries()) {
      if (locationStyles.size > 1) {
        const styles = Array.from(locationStyles.values());
        const textSizeVariations = new Set();
        const spacingVariations = new Set();
        
        styles.forEach(style => {
          style.textSizes.forEach(size => textSizeVariations.add(size));
          style.spacings.forEach(spacing => spacingVariations.add(spacing));
        });
        
        if (textSizeVariations.size > 1 || spacingVariations.size > 1) {
          inconsistencyCount++;
          this.issues.push({
            type: 'STYLING_INCONSISTENCY',
            component,
            variations: {
              textSizes: Array.from(textSizeVariations),
              spacings: Array.from(spacingVariations)
            },
            severity: 'MEDIUM',
            description: `Inconsistent styling in ${component} across locations`
          });
        }
      }
    }

    if (inconsistencyCount > 0) {
      console.log(`❌ Styling Consistency Analysis - FAILED (${inconsistencyCount} inconsistencies found)`);
    } else {
      console.log('✅ Styling Consistency Analysis - SUCCESS');
    }
  }

  async checkLinkFunctionality() {
    console.log('\n🧪 Testing: Link Functionality Analysis');
    
    const linkIssues = [];
    const primaryFooterPath = 'client/src/shared/layouts/components/Footer/footer';
    
    for (const componentType of this.componentTypes) {
      const filePath = path.join(primaryFooterPath, `${componentType}.tsx`);
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        
        // Check for placeholder links
        const placeholderLinks = content.match(/href="#"/g) || [];
        const brokenToLinks = content.match(/to="[^"]*"/g) || [];
        const windowOpenCalls = content.match(/window\.open\('[^']*'/g) || [];
        
        if (placeholderLinks.length > 0) {
          linkIssues.push({
            type: 'PLACEHOLDER_LINKS',
            component: componentType,
            count: placeholderLinks.length,
            severity: 'HIGH'
          });
        }
        
        // Check for potential broken routes
        brokenToLinks.forEach(link => {
          if (link.includes('to="/api-docs"') || link.includes('to="/sdk-downloads"')) {
            linkIssues.push({
              type: 'POTENTIAL_BROKEN_ROUTE',
              component: componentType,
              link: link,
              severity: 'MEDIUM'
            });
          }
        });
        
      } catch (error) {
        // File doesn't exist
      }
    }

    if (linkIssues.length > 0) {
      console.log(`❌ Link Functionality Analysis - FAILED (${linkIssues.length} issues found)`);
      this.issues.push(...linkIssues.map(issue => ({
        ...issue,
        description: `${issue.type} found in ${issue.component}`
      })));
    } else {
      console.log('✅ Link Functionality Analysis - SUCCESS');
    }
  }

  async analyzeStylingInconsistencies() {
    console.log('\n🧪 Testing: Cross-Component Styling Analysis');
    
    const sharedPath = 'client/src/shared/layouts/components/Footer/footer';
    const customerPath = 'client/src/domains/customer/home/homepage/footer';
    
    let inconsistencyCount = 0;
    
    for (const componentType of this.componentTypes) {
      try {
        const sharedContent = await fs.readFile(path.join(sharedPath, `${componentType}.tsx`), 'utf-8');
        const customerContent = await fs.readFile(path.join(customerPath, `${componentType}.tsx`), 'utf-8');
        
        // Compare text sizes
        const sharedTextSizes = sharedContent.match(/text-(xs|sm|base|lg)/g) || [];
        const customerTextSizes = customerContent.match(/text-(xs|sm|base|lg)/g) || [];
        
        if (JSON.stringify(sharedTextSizes.sort()) !== JSON.stringify(customerTextSizes.sort())) {
          inconsistencyCount++;
          this.issues.push({
            type: 'CROSS_LOCATION_INCONSISTENCY',
            component: componentType,
            sharedSizes: sharedTextSizes,
            customerSizes: customerTextSizes,
            severity: 'MEDIUM',
            description: `Text size inconsistency between shared and customer versions`
          });
        }
        
      } catch (error) {
        // One or both files don't exist
      }
    }

    if (inconsistencyCount > 0) {
      console.log(`❌ Cross-Component Styling Analysis - FAILED (${inconsistencyCount} inconsistencies)`);
    } else {
      console.log('✅ Cross-Component Styling Analysis - SUCCESS');
    }
  }

  async assessPerformanceImpact() {
    console.log('\n🧪 Testing: Performance Impact Assessment');
    
    let totalDuplicateSize = 0;
    let fileCount = 0;
    
    for (const location of this.footerLocations) {
      try {
        const files = await fs.readdir(location);
        for (const file of files) {
          if (file.endsWith('.tsx')) {
            const filePath = path.join(location, file);
            const stats = await fs.stat(filePath);
            totalDuplicateSize += stats.size;
            fileCount++;
          }
        }
      } catch (error) {
        // Directory doesn't exist
      }
    }

    const estimatedWaste = totalDuplicateSize * 0.6; // Estimate 60% is duplicate code
    
    this.issues.push({
      type: 'PERFORMANCE_IMPACT',
      totalSize: totalDuplicateSize,
      estimatedWaste: Math.round(estimatedWaste),
      fileCount: fileCount,
      severity: 'HIGH',
      description: `Duplicate footer components cause bundle bloat and maintenance overhead`
    });

    if (estimatedWaste > 50000) { // 50KB
      console.log(`❌ Performance Impact Assessment - FAILED (${Math.round(estimatedWaste / 1000)}KB waste)`);
    } else {
      console.log('✅ Performance Impact Assessment - SUCCESS');
    }
  }

  generateForensicReport() {
    console.log('\n============================================================');
    console.log('🎯 FOOTER FORENSIC INVESTIGATION SUMMARY');
    console.log('============================================================');
    
    const critical = this.issues.filter(i => i.severity === 'HIGH').length;
    const medium = this.issues.filter(i => i.severity === 'MEDIUM').length;
    const total = this.issues.length;
    
    console.log(`📊 Issues Found: ${total}`);
    console.log(`🔴 Critical: ${critical}`);
    console.log(`🟡 Medium: ${medium}`);
    
    console.log('\n📋 DETAILED FINDINGS:');
    this.issues.forEach((issue, index) => {
      const icon = issue.severity === 'HIGH' ? '🔴' : '🟡';
      console.log(`${index + 1}. ${icon} ${issue.type}: ${issue.description}`);
    });

    console.log('\n🔍 FORENSIC CONCLUSION:');
    if (critical > 0) {
      console.log('❌ FOOTER ARCHITECTURE: CRITICAL ISSUES IDENTIFIED');
      console.log('🎯 Immediate action required to fix architectural problems');
    } else if (medium > 0) {
      console.log('⚠️ FOOTER ARCHITECTURE: MODERATE ISSUES IDENTIFIED');
      console.log('🎯 Optimization recommended but not critical');
    } else {
      console.log('✅ FOOTER ARCHITECTURE: EXCELLENT - No issues found');
    }

    console.log(`\n⏰ Investigation completed: ${new Date().toISOString()}`);
  }
}

// Export for use in other scripts
export { FooterForensicInvestigator };

// Run investigation if called directly
if (import.meta.url.startsWith('file:') && process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  const investigator = new FooterForensicInvestigator();
  investigator.runFullInvestigation().catch(console.error);
}