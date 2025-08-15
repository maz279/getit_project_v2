/**
 * Documentation Service
 * Amazon.com/Shopee.sg-Level Documentation Management
 * Comprehensive documentation generation and management
 */

interface DocumentationEntry {
  id: string;
  title: string;
  content: string;
  category: 'component' | 'service' | 'api' | 'guide' | 'reference';
  tags: string[];
  author: string;
  createdAt: number;
  updatedAt: number;
  version: string;
  examples?: CodeExample[];
}

interface CodeExample {
  title: string;
  description: string;
  code: string;
  language: string;
}

interface DocumentationSection {
  id: string;
  title: string;
  entries: DocumentationEntry[];
  order: number;
}

class DocumentationService {
  private static instance: DocumentationService;
  private entries: Map<string, DocumentationEntry> = new Map();
  private sections: Map<string, DocumentationSection> = new Map();

  private constructor() {
    this.initializeDefaultDocumentation();
  }

  static getInstance(): DocumentationService {
    if (!DocumentationService.instance) {
      DocumentationService.instance = new DocumentationService();
    }
    return DocumentationService.instance;
  }

  /**
   * Initialize default documentation
   */
  private initializeDefaultDocumentation(): void {
    // Create default sections
    this.createSection('getting-started', 'Getting Started', 1);
    this.createSection('components', 'Components', 2);
    this.createSection('services', 'Services', 3);
    this.createSection('api', 'API Reference', 4);
    this.createSection('guides', 'Guides', 5);

    // Add sample documentation
    this.addEntry({
      id: 'installation',
      title: 'Installation',
      content: `# Installation Guide

To get started with the platform, follow these steps:

## Prerequisites
- Node.js 18 or higher
- npm or yarn
- PostgreSQL database

## Installation Steps
1. Clone the repository
2. Install dependencies: \`npm install\`
3. Set up environment variables
4. Run database migrations: \`npm run db:push\`
5. Start the development server: \`npm run dev\`
      `,
      category: 'guide',
      tags: ['installation', 'setup', 'getting-started'],
      author: 'System',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: '1.0.0'
    });

    this.addEntry({
      id: 'button-component',
      title: 'Button Component',
      content: `# Button Component

A flexible button component with multiple variants and states.

## Props
- \`variant\`: 'primary' | 'secondary' | 'outline' | 'ghost'
- \`size\`: 'sm' | 'md' | 'lg'
- \`disabled\`: boolean
- \`loading\`: boolean
- \`onClick\`: (event: MouseEvent) => void

## Usage
The Button component supports various styling options and states.
      `,
      category: 'component',
      tags: ['button', 'ui', 'component'],
      author: 'System',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: '1.0.0',
      examples: [
        {
          title: 'Basic Button',
          description: 'Simple button with primary variant',
          code: `<Button variant="primary" onClick={() => console.log('Clicked!')}>
  Click me
</Button>`,
          language: 'tsx'
        },
        {
          title: 'Loading Button',
          description: 'Button with loading state',
          code: `<Button loading={isLoading} onClick={handleSubmit}>
  Submit
</Button>`,
          language: 'tsx'
        }
      ]
    });
  }

  /**
   * Create documentation section
   */
  public createSection(id: string, title: string, order: number): DocumentationSection {
    const section: DocumentationSection = {
      id,
      title,
      entries: [],
      order
    };

    this.sections.set(id, section);
    return section;
  }

  /**
   * Add documentation entry
   */
  public addEntry(entry: DocumentationEntry): void {
    this.entries.set(entry.id, entry);
    
    // Add to appropriate section
    const section = this.findSectionForEntry(entry);
    if (section) {
      section.entries.push(entry);
    }
  }

  /**
   * Find section for entry
   */
  private findSectionForEntry(entry: DocumentationEntry): DocumentationSection | null {
    switch (entry.category) {
      case 'component':
        return this.sections.get('components') || null;
      case 'service':
        return this.sections.get('services') || null;
      case 'api':
        return this.sections.get('api') || null;
      case 'guide':
        return this.sections.get('guides') || null;
      default:
        return this.sections.get('getting-started') || null;
    }
  }

  /**
   * Update documentation entry
   */
  public updateEntry(id: string, updates: Partial<DocumentationEntry>): void {
    const entry = this.entries.get(id);
    if (entry) {
      const updatedEntry = {
        ...entry,
        ...updates,
        updatedAt: Date.now()
      };
      this.entries.set(id, updatedEntry);
    }
  }

  /**
   * Get documentation entry
   */
  public getEntry(id: string): DocumentationEntry | null {
    return this.entries.get(id) || null;
  }

  /**
   * Get all entries
   */
  public getAllEntries(): DocumentationEntry[] {
    return Array.from(this.entries.values());
  }

  /**
   * Get entries by category
   */
  public getEntriesByCategory(category: string): DocumentationEntry[] {
    return this.getAllEntries().filter(entry => entry.category === category);
  }

  /**
   * Search documentation
   */
  public searchDocumentation(query: string): DocumentationEntry[] {
    const lowercaseQuery = query.toLowerCase();
    
    return this.getAllEntries().filter(entry => 
      entry.title.toLowerCase().includes(lowercaseQuery) ||
      entry.content.toLowerCase().includes(lowercaseQuery) ||
      entry.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  /**
   * Get documentation sections
   */
  public getSections(): DocumentationSection[] {
    return Array.from(this.sections.values()).sort((a, b) => a.order - b.order);
  }

  /**
   * Generate API documentation
   */
  public generateAPIDocumentation(apiSpec: any): DocumentationEntry {
    const entry: DocumentationEntry = {
      id: `api-${Date.now()}`,
      title: 'API Reference',
      content: this.formatAPISpec(apiSpec),
      category: 'api',
      tags: ['api', 'reference'],
      author: 'System',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: '1.0.0'
    };

    this.addEntry(entry);
    return entry;
  }

  /**
   * Format API specification
   */
  private formatAPISpec(apiSpec: any): string {
    return `# API Reference

## Endpoints

${Object.entries(apiSpec.paths || {}).map(([path, methods]: [string, any]) => {
  return `### ${path}

${Object.entries(methods).map(([method, spec]: [string, any]) => {
  return `**${method.toUpperCase()}**
- Description: ${spec.description || 'No description'}
- Parameters: ${JSON.stringify(spec.parameters || [])}
- Responses: ${JSON.stringify(spec.responses || {})}
`;
}).join('\n')}`;
}).join('\n')}
    `;
  }

  /**
   * Generate component documentation
   */
  public generateComponentDocumentation(componentName: string, props: any): DocumentationEntry {
    const entry: DocumentationEntry = {
      id: `component-${componentName.toLowerCase()}`,
      title: `${componentName} Component`,
      content: this.formatComponentSpec(componentName, props),
      category: 'component',
      tags: ['component', componentName.toLowerCase()],
      author: 'System',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: '1.0.0'
    };

    this.addEntry(entry);
    return entry;
  }

  /**
   * Format component specification
   */
  private formatComponentSpec(componentName: string, props: any): string {
    return `# ${componentName} Component

## Props

${Object.entries(props).map(([propName, propSpec]: [string, any]) => {
  return `- **${propName}**: ${propSpec.type} ${propSpec.required ? '(required)' : '(optional)'}
  ${propSpec.description || 'No description'}`;
}).join('\n')}

## Usage

\`\`\`tsx
import ${componentName} from './components/${componentName}';

<${componentName} />
\`\`\`
    `;
  }

  /**
   * Export documentation
   */
  public exportDocumentation(format: 'json' | 'markdown' = 'json'): string {
    const data = {
      sections: this.getSections(),
      entries: this.getAllEntries()
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else {
      return this.convertToMarkdown(data);
    }
  }

  /**
   * Convert to markdown
   */
  private convertToMarkdown(data: any): string {
    let markdown = '# Documentation\n\n';
    
    data.sections.forEach((section: DocumentationSection) => {
      markdown += `## ${section.title}\n\n`;
      
      section.entries.forEach((entry: DocumentationEntry) => {
        markdown += `### ${entry.title}\n\n`;
        markdown += `${entry.content}\n\n`;
        
        if (entry.examples) {
          markdown += `#### Examples\n\n`;
          entry.examples.forEach((example: CodeExample) => {
            markdown += `**${example.title}**\n\n`;
            markdown += `${example.description}\n\n`;
            markdown += `\`\`\`${example.language}\n${example.code}\n\`\`\`\n\n`;
          });
        }
      });
    });

    return markdown;
  }

  /**
   * Delete entry
   */
  public deleteEntry(id: string): void {
    this.entries.delete(id);
    
    // Remove from sections
    this.sections.forEach(section => {
      section.entries = section.entries.filter(entry => entry.id !== id);
    });
  }

  /**
   * Get documentation statistics
   */
  public getStatistics(): {
    totalEntries: number;
    entriesByCategory: Record<string, number>;
    totalSections: number;
    lastUpdated: number;
  } {
    const entries = this.getAllEntries();
    const entriesByCategory: Record<string, number> = {};
    
    entries.forEach(entry => {
      entriesByCategory[entry.category] = (entriesByCategory[entry.category] || 0) + 1;
    });

    const lastUpdated = Math.max(...entries.map(entry => entry.updatedAt));

    return {
      totalEntries: entries.length,
      entriesByCategory,
      totalSections: this.sections.size,
      lastUpdated
    };
  }
}

export default DocumentationService;