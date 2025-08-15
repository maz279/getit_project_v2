
import React from 'react';
import { AdminFooterCompanyInfo } from './footer/AdminFooterCompanyInfo';
import { AdminFooterLegal } from './footer/AdminFooterLegal';
import { AdminFooterDocumentation } from './footer/AdminFooterDocumentation';
import { AdminFooterTechnical } from './footer/AdminFooterTechnical';
import { AdminFooterSupport } from './footer/AdminFooterSupport';
import { AdminFooterSocial } from './footer/AdminFooterSocial';
import { AdminFooterEmergency } from './footer/AdminFooterEmergency';
import { AdminFooterAccessibility } from './footer/AdminFooterAccessibility';
import { AdminFooterMetrics } from './footer/AdminFooterMetrics';
import { AdminFooterCertifications } from './footer/AdminFooterCertifications';
import { AdminFooterCopyright } from './footer/AdminFooterCopyright';
import { AdminFooterBottomBar } from './footer/AdminFooterBottomBar';

export const AdminDashboardFooter: React.FC = () => {
  return (
    <footer className="bg-gradient-to-b from-blue-800 via-blue-900 to-teal-900 text-white mt-12">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* First Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AdminFooterCompanyInfo />
          <AdminFooterLegal />
          <AdminFooterDocumentation />
          <AdminFooterTechnical />
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-600">
          <AdminFooterSupport />
          <AdminFooterSocial />
          <AdminFooterEmergency />
          <AdminFooterAccessibility />
        </div>

        {/* System Statistics */}
        <AdminFooterMetrics />

        {/* Certifications & Partners */}
        <AdminFooterCertifications />

        {/* Copyright */}
        <AdminFooterCopyright />
      </div>

      {/* Bottom Bar */}
      <AdminFooterBottomBar />
    </footer>
  );
};
