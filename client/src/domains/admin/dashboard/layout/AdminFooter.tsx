/**
 * AdminFooter - Bangladesh Enterprise Admin Footer
 * Based on HTML specification with exact styling requirements
 */

import { } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Youtube,
  ExternalLink,
  TrendingUp,
  Users,
  ShoppingBag,
  Building
} from 'lucide-react';

export const AdminFooter = () => {
  return (
    <footer 
      className="admin-footer text-white"
      style={{
        background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 50%, #1a202c 100%)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
      }}
    >
      <div className="footer-container max-w-7xl mx-auto px-5 py-8">
        
        {/* Footer Main Content */}
        <div className="footer-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Section */}
          <div className="footer-brand lg:col-span-1">
            <div className="brand-info flex items-center gap-4 mb-5">
              <div 
                className="brand-logo w-15 h-15 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, #ff6b6b, #4ecdc4, #45b7d1)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
                }}
              >
                GI
              </div>
              <div className="brand-text">
                <h3 className="text-3xl font-extrabold m-0 mb-1 text-white">
                  GetIt
                </h3>
                <p className="text-white/70 m-0 text-sm font-medium">
                  Bangladesh Multi-Vendor Platform
                </p>
              </div>
            </div>
            
            <div className="footer-description text-white/80 text-sm leading-relaxed mb-6">
              Empowering digital commerce across Bangladesh with cutting-edge technology, 
              comprehensive vendor solutions, and world-class customer experiences.
            </div>
            
            <div className="footer-stats grid grid-cols-2 gap-3 mb-6">
              <div 
                className="stat-item bg-white/5 p-4 rounded-xl border border-white/10 text-center"
              >
                <div className="stat-number text-lg font-extrabold text-green-400 m-0">
                  2.5M+
                </div>
                <div className="stat-label text-xs text-white/70 m-0 uppercase tracking-wider">
                  Active Users
                </div>
              </div>
              <div 
                className="stat-item bg-white/5 p-4 rounded-xl border border-white/10 text-center"
              >
                <div className="stat-number text-lg font-extrabold text-blue-400 m-0">
                  15K+
                </div>
                <div className="stat-label text-xs text-white/70 m-0 uppercase tracking-wider">
                  Vendors
                </div>
              </div>
            </div>
          </div>

          {/* Admin Tools */}
          <div className="footer-column">
            <h4 className="text-base font-bold mb-5 text-white relative pb-2">
              Admin Tools
              <div 
                className="absolute bottom-0 left-0 w-8 h-0.5 rounded-sm"
                style={{ background: 'linear-gradient(45deg, #4ade80, #22d3ee)' }}
              ></div>
            </h4>
            <ul className="footer-links space-y-2">
              <li><a href="/admin/dashboard" className="text-white/70 hover:text-green-400 text-sm transition-colors">Dashboard Overview</a></li>
              <li><a href="/admin/products" className="text-white/70 hover:text-green-400 text-sm transition-colors">Product Management</a></li>
              <li><a href="/admin/orders" className="text-white/70 hover:text-green-400 text-sm transition-colors">Order Processing</a></li>
              <li><a href="/admin/customers" className="text-white/70 hover:text-green-400 text-sm transition-colors">Customer Database</a></li>
              <li><a href="/admin/vendors" className="text-white/70 hover:text-green-400 text-sm transition-colors">Vendor Management</a></li>
              <li><a href="/admin/analytics" className="text-white/70 hover:text-green-400 text-sm transition-colors">Analytics & Reports</a></li>
              <li><a href="/admin/finance" className="text-white/70 hover:text-green-400 text-sm transition-colors">Financial Management</a></li>
            </ul>
          </div>

          {/* Platform Management */}
          <div className="footer-column">
            <h4 className="text-base font-bold mb-5 text-white relative pb-2">
              Platform Management
              <div 
                className="absolute bottom-0 left-0 w-8 h-0.5 rounded-sm"
                style={{ background: 'linear-gradient(45deg, #4ade80, #22d3ee)' }}
              ></div>
            </h4>
            <ul className="footer-links space-y-2">
              <li><a href="/admin/settings" className="text-white/70 hover:text-green-400 text-sm transition-colors">System Configuration</a></li>
              <li><a href="/admin/security" className="text-white/70 hover:text-green-400 text-sm transition-colors">Security Settings</a></li>
              <li><a href="/admin/payments" className="text-white/70 hover:text-green-400 text-sm transition-colors">Payment Gateways</a></li>
              <li><a href="/admin/shipping" className="text-white/70 hover:text-green-400 text-sm transition-colors">Shipping Partners</a></li>
              <li><a href="/admin/kyc" className="text-white/70 hover:text-green-400 text-sm transition-colors">KYC Verification</a></li>
              <li><a href="/admin/compliance" className="text-white/70 hover:text-green-400 text-sm transition-colors">Compliance & Legal</a></li>
              <li><a href="/admin/backups" className="text-white/70 hover:text-green-400 text-sm transition-colors">Backup & Recovery</a></li>
            </ul>
          </div>

          {/* Support & Resources */}
          <div className="footer-column">
            <h4 className="text-base font-bold mb-5 text-white relative pb-2">
              Support & Resources
              <div 
                className="absolute bottom-0 left-0 w-8 h-0.5 rounded-sm"
                style={{ background: 'linear-gradient(45deg, #4ade80, #22d3ee)' }}
              ></div>
            </h4>
            <ul className="footer-links space-y-2">
              <li><a href="/admin/documentation" className="text-white/70 hover:text-green-400 text-sm transition-colors">API Documentation</a></li>
              <li><a href="/admin/help" className="text-white/70 hover:text-green-400 text-sm transition-colors">Help Center</a></li>
              <li><a href="/admin/training" className="text-white/70 hover:text-green-400 text-sm transition-colors">Training Materials</a></li>
              <li><a href="/admin/changelog" className="text-white/70 hover:text-green-400 text-sm transition-colors">System Updates</a></li>
              <li><a href="/admin/tickets" className="text-white/70 hover:text-green-400 text-sm transition-colors">Support Tickets</a></li>
              <li><a href="/admin/feedback" className="text-white/70 hover:text-green-400 text-sm transition-colors">Feedback & Suggestions</a></li>
            </ul>
            
            {/* Contact Information */}
            <div className="contact-info mt-6 space-y-2">
              <div className="contact-item flex items-center gap-2 text-white/70 text-sm">
                <MapPin className="w-4 h-4 text-green-400" />
                <span>Dhaka, Bangladesh</span>
              </div>
              <div className="contact-item flex items-center gap-2 text-white/70 text-sm">
                <Phone className="w-4 h-4 text-green-400" />
                <span>+880-1234-567890</span>
              </div>
              <div className="contact-item flex items-center gap-2 text-white/70 text-sm">
                <Mail className="w-4 h-4 text-green-400" />
                <span>admin@getit.com.bd</span>
              </div>
              <div className="contact-item flex items-center gap-2 text-white/70 text-sm">
                <Clock className="w-4 h-4 text-green-400" />
                <span>24/7 System Monitoring</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bangladesh Partners Section */}
        <div className="partners-section mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Payment Partners */}
            <div className="payment-partners">
              <h5 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-green-400" />
                Bangladesh Payment Partners
              </h5>
              <div className="partners-grid grid grid-cols-4 gap-4">
                <div className="partner-item bg-white/5 p-3 rounded-lg border border-white/10 text-center hover:bg-white/10 transition-colors">
                  <div className="text-pink-400 font-bold text-sm">bKash</div>
                </div>
                <div className="partner-item bg-white/5 p-3 rounded-lg border border-white/10 text-center hover:bg-white/10 transition-colors">
                  <div className="text-orange-400 font-bold text-sm">Nagad</div>
                </div>
                <div className="partner-item bg-white/5 p-3 rounded-lg border border-white/10 text-center hover:bg-white/10 transition-colors">
                  <div className="text-purple-400 font-bold text-sm">Rocket</div>
                </div>
                <div className="partner-item bg-white/5 p-3 rounded-lg border border-white/10 text-center hover:bg-white/10 transition-colors">
                  <div className="text-blue-400 font-bold text-sm">SSL</div>
                </div>
              </div>
            </div>

            {/* Logistics Partners */}
            <div className="logistics-partners">
              <h5 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Logistics Partners
              </h5>
              <div className="partners-grid grid grid-cols-4 gap-4">
                <div className="partner-item bg-white/5 p-3 rounded-lg border border-white/10 text-center hover:bg-white/10 transition-colors">
                  <div className="text-green-400 font-bold text-sm">Pathao</div>
                </div>
                <div className="partner-item bg-white/5 p-3 rounded-lg border border-white/10 text-center hover:bg-white/10 transition-colors">
                  <div className="text-blue-400 font-bold text-sm">Paperfly</div>
                </div>
                <div className="partner-item bg-white/5 p-3 rounded-lg border border-white/10 text-center hover:bg-white/10 transition-colors">
                  <div className="text-red-400 font-bold text-sm">RedX</div>
                </div>
                <div className="partner-item bg-white/5 p-3 rounded-lg border border-white/10 text-center hover:bg-white/10 transition-colors">
                  <div className="text-cyan-400 font-bold text-sm">eCourier</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom pt-6 border-t border-white/5">
          <div className="footer-bottom-content flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Legal Links */}
            <div className="footer-legal flex items-center gap-5 flex-wrap">
              <a href="/admin/privacy" className="text-white/60 hover:text-green-400 text-xs transition-colors">Privacy Policy</a>
              <span className="text-white/40">•</span>
              <a href="/admin/terms" className="text-white/60 hover:text-green-400 text-xs transition-colors">Terms of Service</a>
              <span className="text-white/40">•</span>
              <a href="/admin/compliance" className="text-white/60 hover:text-green-400 text-xs transition-colors">Compliance</a>
              <span className="text-white/40">•</span>
              <a href="/admin/security" className="text-white/60 hover:text-green-400 text-xs transition-colors">Security Policy</a>
              <span className="text-white/40">•</span>
              <a href="/admin/audit" className="text-white/60 hover:text-green-400 text-xs transition-colors">Audit Logs</a>
            </div>

            {/* Social Links */}
            <div className="footer-social flex gap-3">
              <a href="#" className="social-btn w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white/70 hover:bg-green-400 hover:text-white transition-all duration-300 border border-white/20 hover:scale-110 hover:-translate-y-1 hover:shadow-lg">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="social-btn w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white/70 hover:bg-green-400 hover:text-white transition-all duration-300 border border-white/20 hover:scale-110 hover:-translate-y-1 hover:shadow-lg">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="social-btn w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white/70 hover:bg-green-400 hover:text-white transition-all duration-300 border border-white/20 hover:scale-110 hover:-translate-y-1 hover:shadow-lg">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="social-btn w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white/70 hover:bg-green-400 hover:text-white transition-all duration-300 border border-white/20 hover:scale-110 hover:-translate-y-1 hover:shadow-lg">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="copyright text-center text-white/60 text-xs mt-5 pt-5 border-t border-white/5">
            © 2025 GetIt Bangladesh. All rights reserved. | Enterprise Admin Panel v2.1.0 | 
            Proudly serving Bangladesh's digital commerce ecosystem.
          </div>
        </div>
      </div>
    </footer>
  );
}