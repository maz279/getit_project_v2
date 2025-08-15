
import React from 'react';
import { BookOpen, Book, Code, VideoIcon, CheckCircle, Wrench, Settings, GitBranch, Activity } from 'lucide-react';

export const AdminFooterDocumentation: React.FC = () => {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold text-cyan-300 flex items-center space-x-1">
        <BookOpen size={12} />
        <span>Documentation & Resources</span>
      </h3>
      <div className="grid grid-cols-1 gap-1 text-xs">
        <a href="#" className="text-gray-300 hover:text-blue-300 transition-colors flex items-center space-x-1">
          <Book size={8} className="text-blue-300" />
          <span>Admin User Manual</span>
        </a>
        <a href="#" className="text-gray-300 hover:text-blue-300 transition-colors flex items-center space-x-1">
          <Code size={8} className="text-green-300" />
          <span>API Documentation</span>
        </a>
        <a href="#" className="text-gray-300 hover:text-blue-300 transition-colors flex items-center space-x-1">
          <VideoIcon size={8} className="text-red-300" />
          <span>Video Tutorials</span>
        </a>
        <a href="#" className="text-gray-300 hover:text-blue-300 transition-colors flex items-center space-x-1">
          <CheckCircle size={8} className="text-emerald-300" />
          <span>Best Practices Guide</span>
        </a>
        <a href="#" className="text-gray-300 hover:text-blue-300 transition-colors flex items-center space-x-1">
          <Wrench size={8} className="text-orange-300" />
          <span>Troubleshooting Guide</span>
        </a>
        <a href="#" className="text-gray-300 hover:text-blue-300 transition-colors flex items-center space-x-1">
          <Settings size={8} className="text-purple-300" />
          <span>System Requirements</span>
        </a>
        <a href="#" className="text-gray-300 hover:text-blue-300 transition-colors flex items-center space-x-1">
          <GitBranch size={8} className="text-yellow-300" />
          <span>Release Notes</span>
        </a>
        <a href="#" className="text-gray-300 hover:text-blue-300 transition-colors flex items-center space-x-1">
          <Activity size={8} className="text-pink-300" />
          <span>Change Log</span>
        </a>
      </div>
    </div>
  );
};
