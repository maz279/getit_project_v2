/**
 * Component Documentation
 * Documentation wrapper for design system components
 */

import React from 'react';
import { Typography } from '../atoms/Typography/Typography';
import { Button } from '../atoms/Button/Button';

export interface ComponentDocProps {
  name: string;
  description: string;
  category: 'atoms' | 'molecules' | 'organisms' | 'templates';
  props?: Array<{
    name: string;
    type: string;
    default?: string;
    description: string;
    required?: boolean;
  }>;
  examples?: Array<{
    title: string;
    code: string;
    component: React.ReactNode;
  }>;
  children?: React.ReactNode;
}

export const ComponentDoc: React.FC<ComponentDocProps> = ({
  name,
  description,
  category,
  props = [],
  examples = [],
  children
}) => {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'props' | 'examples'>('overview');

  const renderProps = () => (
    <div className="space-y-4">
      <Typography variant="h3">Props</Typography>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-border">
          <thead>
            <tr className="bg-muted">
              <th className="border border-border p-2 text-left">Name</th>
              <th className="border border-border p-2 text-left">Type</th>
              <th className="border border-border p-2 text-left">Default</th>
              <th className="border border-border p-2 text-left">Description</th>
              <th className="border border-border p-2 text-left">Required</th>
            </tr>
          </thead>
          <tbody>
            {props.map((prop) => (
              <tr key={prop.name}>
                <td className="border border-border p-2 font-mono text-sm">{prop.name}</td>
                <td className="border border-border p-2 font-mono text-sm text-blue-600">{prop.type}</td>
                <td className="border border-border p-2 font-mono text-sm">{prop.default || '-'}</td>
                <td className="border border-border p-2">{prop.description}</td>
                <td className="border border-border p-2">
                  {prop.required ? (
                    <span className="text-red-600">Yes</span>
                  ) : (
                    <span className="text-gray-600">No</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderExamples = () => (
    <div className="space-y-6">
      <Typography variant="h3">Examples</Typography>
      {examples.map((example, index) => (
        <div key={index} className="space-y-2">
          <Typography variant="h4">{example.title}</Typography>
          <div className="border rounded-lg p-4 bg-muted">
            {example.component}
          </div>
          <details className="group">
            <summary className="cursor-pointer font-medium text-primary hover:text-primary/80">
              View Code
            </summary>
            <pre className="mt-2 bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
              <code>{example.code}</code>
            </pre>
          </details>
        </div>
      ))}
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Typography variant="h3">Overview</Typography>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
            {category}
          </span>
        </div>
        <Typography variant="p">{description}</Typography>
      </div>
      
      {children && (
        <div className="space-y-2">
          <Typography variant="h4">Preview</Typography>
          <div className="border rounded-lg p-6 bg-card">
            {children}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="border-b">
        <div className="space-y-2 pb-4">
          <Typography variant="h1">{name}</Typography>
          <Typography variant="lead" color="muted">{description}</Typography>
        </div>
        
        <div className="flex space-x-1">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('overview')}
            size="sm"
          >
            Overview
          </Button>
          {props.length > 0 && (
            <Button
              variant={activeTab === 'props' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('props')}
              size="sm"
            >
              Props
            </Button>
          )}
          {examples.length > 0 && (
            <Button
              variant={activeTab === 'examples' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('examples')}
              size="sm"
            >
              Examples
            </Button>
          )}
        </div>
      </div>

      <div className="py-4">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'props' && renderProps()}
        {activeTab === 'examples' && renderExamples()}
      </div>
    </div>
  );
};

export default ComponentDoc;