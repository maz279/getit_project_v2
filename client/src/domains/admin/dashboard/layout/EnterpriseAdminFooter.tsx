/**
 * EnterpriseAdminFooter - Amazon.com/Shopee.sg-Level Admin Footer
 * Comprehensive grid layout with extensive functionality and Bangladesh integration
 */

import React from 'react';
import { 
  Activity, 
  Building2, 
  Clock, 
  Database,
  Globe,
  HelpCircle,
  Mail,
  Phone,
  Shield,
  Server,
  Users,
  Package,
  MapPin,
  ExternalLink,
  Facebook,
  Twitter,
  Linkedin,
  Github,
  Youtube
} from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';

interface EnterpriseAdminFooterProps {
  className?: string;
}

export const EnterpriseAdminFooter: React.FC<EnterpriseAdminFooterProps> = ({ className = "" }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white mt-12 ${className}`}>
      {/* Gradient border top */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Footer Top - Main Grid */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">G</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    GETIT
                  </h3>
                  <p className="text-white/70 text-sm">Bangladesh's Leading Multi-Vendor Marketplace</p>
                </div>
              </div>
              
              <p className="text-white/80 mb-6 leading-relaxed">
                Empowering millions of customers and thousands of vendors across Bangladesh with cutting-edge 
                ecommerce technology. Built for the future of digital commerce in Bangladesh.
              </p>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-400">2.5M+</p>
                  <p className="text-xs text-white/60 uppercase tracking-wide">Active Users</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-400">15K+</p>
                  <p className="text-xs text-white/60 uppercase tracking-wide">Vendors</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-purple-400">1M+</p>
                  <p className="text-xs text-white/60 uppercase tracking-wide">Products</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-orange-400">64</p>
                  <p className="text-xs text-white/60 uppercase tracking-wide">Districts</p>
                </div>
              </div>
            </div>

            {/* Admin Tools */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white relative">
                Admin Tools
                <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-green-400 to-blue-400"></div>
              </h4>
              <ul className="space-y-2">
                {[
                  { name: 'Analytics Dashboard', href: '#dashboard' },
                  { name: 'Vendor Management', href: '#vendors' },
                  { name: 'Order Processing', href: '#orders' },
                  { name: 'Product Moderation', href: '#products' },
                  { name: 'Customer Support', href: '#customers' },
                  { name: 'Financial Reports', href: '#reports' },
                  { name: 'System Settings', href: '#settings' }
                ].map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href}
                      className="flex items-center text-white/70 hover:text-green-400 text-sm transition-all duration-300 hover:translate-x-1 group"
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-2">→</span>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Platform Management */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white relative">
                Platform
                <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-green-400 to-blue-400"></div>
              </h4>
              <ul className="space-y-2">
                {[
                  { name: 'Regulatory Compliance', href: '#compliance' },
                  { name: 'Security Center', href: '#security' },
                  { name: 'API Management', href: '#api' },
                  { name: 'Third-party Integrations', href: '#integrations' },
                  { name: 'Data & Backups', href: '#backups' },
                  { name: 'System Logs', href: '#logs' },
                  { name: 'Performance Monitoring', href: '#monitoring' }
                ].map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href}
                      className="flex items-center text-white/70 hover:text-green-400 text-sm transition-all duration-300 hover:translate-x-1 group"
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-2">→</span>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support & Resources */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white relative">
                Support & Resources
                <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-green-400 to-blue-400"></div>
              </h4>
              <ul className="space-y-2">
                {[
                  { name: 'Admin Documentation', href: '#documentation' },
                  { name: 'Training Materials', href: '#training' },
                  { name: 'Support Tickets', href: '#tickets' },
                  { name: 'System Updates', href: '#updates' },
                  { name: 'Admin Community', href: '#community' },
                  { name: 'Submit Feedback', href: '#feedback' },
                  { name: 'Emergency Contacts', href: '#emergency' }
                ].map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href}
                      className="flex items-center text-white/70 hover:text-green-400 text-sm transition-all duration-300 hover:translate-x-1 group"
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-2">→</span>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white relative">
                Contact Information
                <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-green-400 to-blue-400"></div>
              </h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-4 w-4 text-green-400" />
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-white">GetIt Limited</p>
                    <p className="text-white/70">Level 15, Rupayan Golden Age</p>
                    <p className="text-white/70">Shantinagar, Dhaka-1217</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="text-sm">
                    <p className="text-white/70">Admin Hotline: +880-1700-123456</p>
                    <p className="text-white/70">Emergency: +880-1800-654321</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="text-sm">
                    <p className="text-white/70">admin@getit.com.bd</p>
                    <p className="text-white/70">support@getit.com.bd</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="h-4 w-4 text-orange-400" />
                  </div>
                  <div className="text-sm">
                    <p className="text-white/70">24/7 Admin Support</p>
                    <p className="text-white/70">Bangladesh Standard Time</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment & Shipping Partners */}
            <div>
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-4 text-white relative">
                  Integrated Payment Partners
                  <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-green-400 to-blue-400"></div>
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: 'bKash', color: 'text-pink-400' },
                    { name: 'Nagad', color: 'text-orange-400' },
                    { name: 'Rocket', color: 'text-purple-400' },
                    { name: 'SSL', color: 'text-green-400' },
                    { name: 'Aamar', color: 'text-blue-400' },
                    { name: 'VISA', color: 'text-blue-500' }
                  ].map((partner) => (
                    <div key={partner.name} className="bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-lg p-3 text-center">
                      <span className={`text-xs font-bold ${partner.color}`}>{partner.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4 text-white relative">
                  Logistics Partners
                  <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-green-400 to-blue-400"></div>
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: 'Pathao', color: 'text-cyan-400' },
                    { name: 'Paperfly', color: 'text-orange-500' },
                    { name: 'Sundarban', color: 'text-green-400' },
                    { name: 'RedX', color: 'text-red-400' },
                    { name: 'eCourier', color: 'text-purple-400' },
                    { name: 'SA', color: 'text-gray-400' }
                  ].map((partner) => (
                    <div key={partner.name} className="bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-lg p-3 text-center">
                      <span className={`text-xs font-bold ${partner.color}`}>{partner.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            {/* Legal Links */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {[
                'Privacy Policy',
                'Terms of Service', 
                'Regulatory Compliance',
                'Security Policy',
                'Data Protection',
                'Cookie Policy',
                'Accessibility'
              ].map((link, index) => (
                <React.Fragment key={link}>
                  <a href="#" className="text-white/60 hover:text-green-400 transition-colors">
                    {link}
                  </a>
                  {index < 6 && <span className="text-white/40">|</span>}
                </React.Fragment>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-3">
              {[
                { icon: Linkedin, href: '#' },
                { icon: Twitter, href: '#' },
                { icon: Facebook, href: '#' },
                { icon: Github, href: '#' },
                { icon: Youtube, href: '#' }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 bg-white/10 hover:bg-green-500 border border-white/20 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-white/60 mb-2">
              <strong>© ২০২৫ GetIt Limited.</strong> All rights reserved. | 
              Registered in Bangladesh under Company Registration No. 12345678 | 
              Licensed by Bangladesh Bank & BTRC | 
              VAT Registration: 1234567890123 | 
              <strong> Built with ❤️ in Dhaka, Bangladesh</strong>
            </p>
            <p className="text-xs text-white/40">
              This admin panel is secured with enterprise-grade encryption and monitored 24/7. 
              Compliant with Bangladesh Data Protection Act 2023, PCI DSS, and ISO 27001 standards.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};