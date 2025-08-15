
import React from 'react';
import { Header } from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer/Footer';
import { Building, Users, Globe, Shield, Star, TrendingUp, Award, Heart, Zap, Target, Smartphone, Search, ShoppingCart, CreditCard, Cpu, Lock, BarChart3, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutUs: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-xl font-bold text-gray-900 mb-3">Transforming Bangladesh's Digital Commerce Landscape</h1>
          <p className="text-sm text-gray-600 max-w-4xl mx-auto leading-relaxed">
            GetIt stands as Bangladesh's premier multi-vendor ecommerce platform, revolutionizing how people shop and businesses thrive in the digital marketplace. Founded with a vision to establish market leadership in Bangladesh's rapidly growing ecommerce sector, we bridge the gap between local market needs and cutting-edge global technology standards.
          </p>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-base font-bold text-gray-900">10M+</div>
            <div className="text-2xs text-gray-600">Active Users</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <Building className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-base font-bold text-gray-900">100K+</div>
            <div className="text-2xs text-gray-600">Vendors</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <Globe className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-base font-bold text-gray-900">64</div>
            <div className="text-2xs text-gray-600">Districts</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <Star className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <div className="text-base font-bold text-gray-900">4.8</div>
            <div className="text-2xs text-gray-600">Rating</div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div id="mission-vision" className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-blue-50 p-6 rounded-lg">
            <Target className="h-6 w-6 text-blue-600 mb-3" />
            <h3 className="text-base font-bold text-gray-900 mb-3">Our Mission</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              We empower both buyers and sellers by creating a seamless, secure, and personalized shopping ecosystem that celebrates diversity, promotes sustainability, and drives economic growth across Bangladesh. Our platform serves as a catalyst for local businesses to expand their reach while providing consumers with unparalleled choice and convenience.
            </p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <Zap className="h-6 w-6 text-green-600 mb-3" />
            <h3 className="text-base font-bold text-gray-900 mb-3">Our Vision</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              To become the leading multi-vendor ecommerce destination in Bangladesh, recognized for exceptional user experience, innovative technology, and unwavering commitment to our community's prosperity.
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-100 p-4 rounded-lg mb-12">
          <div className="flex flex-wrap justify-center gap-3 text-xs">
            <a href="#mission-vision" className="bg-white px-3 py-2 rounded-full hover:bg-blue-100 transition-colors">🎯 Our Mission</a>
            <a href="#how-it-works" className="bg-white px-3 py-2 rounded-full hover:bg-blue-100 transition-colors">⚙️ How It Works</a>
            <a href="#success-stories" className="bg-white px-3 py-2 rounded-full hover:bg-blue-100 transition-colors">📈 Success Stories</a>
            <a href="#careers" className="bg-white px-3 py-2 rounded-full hover:bg-blue-100 transition-colors">💼 Careers</a>
            <a href="#our-team" className="bg-white px-3 py-2 rounded-full hover:bg-blue-100 transition-colors">👥 Our Team</a>
            <a href="#company-values" className="bg-white px-3 py-2 rounded-full hover:bg-blue-100 transition-colors">⭐ Company Values</a>
            <a href="#achievements" className="bg-white px-3 py-2 rounded-full hover:bg-blue-100 transition-colors">🏅 Achievements</a>
            <a href="#sustainability" className="bg-white px-3 py-2 rounded-full hover:bg-blue-100 transition-colors">🌱 Sustainability</a>
            <a href="#press-media" className="bg-white px-3 py-2 rounded-full hover:bg-blue-100 transition-colors">📰 Press & Media</a>
            <a href="#community" className="bg-white px-3 py-2 rounded-full hover:bg-blue-100 transition-colors">❤️ Community Impact</a>
            <a href="#innovation" className="bg-white px-3 py-2 rounded-full hover:bg-blue-100 transition-colors">💡 Innovation Hub</a>
            <a href="#awards" className="bg-white px-3 py-2 rounded-full hover:bg-blue-100 transition-colors">🏆 Awards</a>
          </div>
        </div>

        {/* Company Values (What Sets Us Apart) */}
        <div id="company-values" className="mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-6 text-center">⭐ Company Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-5 rounded-lg">
              <ShoppingCart className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="text-sm font-bold text-gray-900 mb-2">Extensive Product Diversity</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Our curated marketplace hosts a vast array of vendors offering everything from cutting-edge technology and smart home devices to sustainable products and local crafts.</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-5 rounded-lg">
              <Globe className="h-8 w-8 text-green-600 mb-3" />
              <h3 className="text-sm font-bold text-gray-900 mb-2">Localized Excellence</h3>
              <p className="text-xs text-gray-600 leading-relaxed">We integrate popular local payment methods including <a href="#" className="text-green-600 hover:underline">bKash</a>, <a href="#" className="text-green-600 hover:underline">Nagad</a>, and <a href="#" className="text-green-600 hover:underline">Rocket</a> alongside traditional banking options with full Bangla language support.</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-5 rounded-lg">
              <Star className="h-8 w-8 text-purple-600 mb-3" />
              <h3 className="text-sm font-bold text-gray-900 mb-2">Personalized Shopping Experience</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Through advanced machine learning algorithms, we deliver tailored product recommendations, intelligent search capabilities, and customized content.</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-amber-100 p-5 rounded-lg">
              <Building className="h-8 w-8 text-orange-600 mb-3" />
              <h3 className="text-sm font-bold text-gray-900 mb-2">Vendor Empowerment</h3>
              <p className="text-xs text-gray-600 leading-relaxed">We provide comprehensive tools including streamlined <Link to="/vendor/register" className="text-orange-600 hover:underline">KYC verification</Link>, robust inventory management, performance analytics, and transparent payout mechanisms.</p>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-cyan-100 p-5 rounded-lg">
              <Smartphone className="h-8 w-8 text-teal-600 mb-3" />
              <h3 className="text-sm font-bold text-gray-900 mb-2">Mobile-First Approach</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Recognizing Bangladesh's mobile-centric digital landscape, our platform is optimized for seamless mobile experiences across all devices.</p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div id="how-it-works" className="mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-6 text-center">⚙️ How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center bg-blue-50 p-5 rounded-lg">
              <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm mx-auto mb-3">1</div>
              <h3 className="text-sm font-bold text-gray-900 mb-2">Browse & Discover</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Explore millions of products from verified vendors across Bangladesh using our AI-powered search and personalized recommendations.</p>
            </div>
            <div className="text-center bg-green-50 p-5 rounded-lg">
              <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm mx-auto mb-3">2</div>
              <h3 className="text-sm font-bold text-gray-900 mb-2">Safe Shopping</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Shop with confidence using our secure payment gateways, buyer protection, and verified vendor program with quality guarantees.</p>
            </div>
            <div className="text-center bg-purple-50 p-5 rounded-lg">
              <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm mx-auto mb-3">3</div>
              <h3 className="text-sm font-bold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Enjoy nationwide delivery through our logistics network, with same-day delivery in major cities and real-time tracking.</p>
            </div>
            <div className="text-center bg-orange-50 p-5 rounded-lg">
              <div className="bg-orange-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm mx-auto mb-3">4</div>
              <h3 className="text-sm font-bold text-gray-900 mb-2">Support & Service</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Get 24/7 customer support, easy returns, and after-sales service through our dedicated customer success team.</p>
            </div>
          </div>
        </div>

        {/* Technology Foundation */}
        <div id="technology" className="bg-gray-50 p-6 rounded-lg mb-12">
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Our Technology Foundation</h2>
            <p className="text-xs text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Built on a sophisticated microservices architecture, GetIt leverages cloud-native infrastructure to ensure scalability, reliability, and performance. Our technology stack includes:
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center bg-white p-4 rounded-lg border">
              <Search className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <h4 className="text-xs font-semibold text-gray-900 mb-1">Advanced Search & Discovery</h4>
              <p className="text-2xs text-gray-600">Natural language processing for intelligent product search and voice commerce</p>
            </div>
            <div className="text-center bg-white p-4 rounded-lg border">
              <Cpu className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <h4 className="text-xs font-semibold text-gray-900 mb-1">AI-Powered Recommendations</h4>
              <p className="text-2xs text-gray-600">Machine learning algorithms that understand customer preferences and patterns</p>
            </div>
            <div className="text-center bg-white p-4 rounded-lg border">
              <Shield className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <h4 className="text-xs font-semibold text-gray-900 mb-1">Fraud Detection & Security</h4>
              <p className="text-2xs text-gray-600">Multi-layered security systems with real-time fraud monitoring and PCI DSS compliance</p>
            </div>
            <div className="text-center bg-white p-4 rounded-lg border">
              <BarChart3 className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <h4 className="text-xs font-semibold text-gray-900 mb-1">Analytics & Business Intelligence</h4>
              <p className="text-2xs text-gray-600">Comprehensive data analytics for both customers and vendors to make informed decisions</p>
            </div>
          </div>
        </div>

        {/* Commitment to Excellence */}
        <div className="mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-6 text-center">Our Commitment to Excellence</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <Heart className="h-8 w-8 text-red-500 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-gray-900 mb-2">Customer-Centric Design</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Every feature is developed with our users in mind, from intuitive navigation to responsive <Link to="/customer-support" className="text-red-500 hover:underline">customer support</Link>.</p>
            </div>
            <div className="text-center">
              <Shield className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-gray-900 mb-2">Trust & Security</h3>
              <p className="text-xs text-gray-600 leading-relaxed">We implement robust security measures, transparent business practices, and efficient customer service systems to build lasting trust.</p>
            </div>
            <div className="text-center">
              <Leaf className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-gray-900 mb-2">Sustainability Focus</h3>
              <p className="text-xs text-gray-600 leading-relaxed">We actively promote environmentally conscious commerce by highlighting sustainable products and supporting eco-friendly vendors.</p>
            </div>
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-gray-900 mb-2">Innovation & Growth</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Our platform continuously evolves with emerging technologies and market trends, incorporating visual search and automated marketing campaigns.</p>
            </div>
          </div>
        </div>

        {/* Supporting Bangladesh's Digital Economy */}
        <div id="how-it-works" className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg mb-12">
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Supporting Bangladesh's Digital Economy</h2>
            <p className="text-xs text-gray-600 max-w-4xl mx-auto leading-relaxed mb-4">
              GetIt plays a crucial role in Bangladesh's digital transformation by empowering businesses and individuals across the nation.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <Building className="h-6 w-6 text-blue-600 mb-2" />
              <h3 className="text-xs font-bold text-gray-900 mb-1">SME Empowerment</h3>
              <p className="text-2xs text-gray-600">Providing small and medium enterprises with powerful <Link to="/vendor/register" className="text-blue-600 hover:underline">ecommerce tools</Link></p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <Users className="h-6 w-6 text-green-600 mb-2" />
              <h3 className="text-xs font-bold text-gray-900 mb-1">Job Creation</h3>
              <p className="text-2xs text-gray-600">Creating employment opportunities in the <Link to="#careers" className="text-green-600 hover:underline">digital economy</Link></p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <CreditCard className="h-6 w-6 text-purple-600 mb-2" />
              <h3 className="text-xs font-bold text-gray-900 mb-1">Financial Inclusion</h3>
              <p className="text-2xs text-gray-600">Supporting local payment ecosystems and financial inclusion initiatives</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-orange-200">
              <Globe className="h-6 w-6 text-orange-600 mb-2" />
              <h3 className="text-xs font-bold text-gray-900 mb-1">Digital Literacy</h3>
              <p className="text-2xs text-gray-600">Promoting digital literacy through user-friendly interfaces</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-teal-200">
              <TrendingUp className="h-6 w-6 text-teal-600 mb-2" />
              <h3 className="text-xs font-bold text-gray-900 mb-1">Tech Sector Growth</h3>
              <p className="text-2xs text-gray-600">Contributing to the growth of Bangladesh's technology sector</p>
            </div>
          </div>
        </div>

        {/* Our Team */}
        <div id="our-team" className="mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-6 text-center">👥 Our Team</h2>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg mb-6">
            <p className="text-xs text-gray-600 leading-relaxed text-center mb-4">
              Our diverse team of 500+ professionals combines local market expertise with global technology experience, working together to build Bangladesh's most trusted ecommerce platform.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center bg-white p-5 rounded-lg shadow-sm border">
              <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-lg mx-auto mb-3">MT</div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">Mohammad Taher</h3>
              <p className="text-xs text-blue-600 mb-2">Chief Executive Officer</p>
              <p className="text-xs text-gray-600 leading-relaxed">Former Amazon & Google executive leading digital transformation in Bangladesh</p>
            </div>
            <div className="text-center bg-white p-5 rounded-lg shadow-sm border">
              <div className="bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-lg mx-auto mb-3">FR</div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">Fatema Rahman</h3>
              <p className="text-xs text-green-600 mb-2">Chief Technology Officer</p>
              <p className="text-xs text-gray-600 leading-relaxed">AI/ML expert building scalable technology infrastructure for millions of users</p>
            </div>
            <div className="text-center bg-white p-5 rounded-lg shadow-sm border">
              <div className="bg-purple-600 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-lg mx-auto mb-3">AH</div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">Abdullah Hassan</h3>
              <p className="text-xs text-purple-600 mb-2">Chief Product Officer</p>
              <p className="text-xs text-gray-600 leading-relaxed">Product strategy leader focusing on user experience and vendor success</p>
            </div>
          </div>
        </div>

        {/* Community Impact & Success Stories */}
        <div id="success-stories" className="mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-6 text-center">📈 Success Stories</h2>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg mb-6">
            <p className="text-xs text-gray-600 leading-relaxed text-center mb-4">
              We believe in giving back to the communities we serve. Through our platform, we support local artisans, promote sustainable business practices, and contribute to the economic empowerment of vendors across Bangladesh. Our focus on excellent customer service and community engagement helps foster a sense of trust and belonging among all users.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-lg shadow-sm border border-green-200">
              <div className="flex items-center mb-3">
                <div className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm">A</div>
                <div className="ml-3">
                  <h4 className="text-xs font-bold text-gray-900">Ayesha's Boutique</h4>
                  <p className="text-2xs text-gray-600">Fashion Vendor, Dhaka</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 italic leading-relaxed">"GetIt helped me grow my business from a small boutique to reaching customers nationwide. Sales increased by 400% in just 6 months with their <Link to="/vendor/register" className="text-green-600 hover:underline">vendor tools</Link>!"</p>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-sm border border-blue-200">
              <div className="flex items-center mb-3">
                <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm">R</div>
                <div className="ml-3">
                  <h4 className="text-xs font-bold text-gray-900">Rahman Electronics</h4>
                  <p className="text-2xs text-gray-600">Electronics Vendor, Chittagong</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 italic leading-relaxed">"The AI-powered inventory management and customer insights transformed how we do business. We're now the top electronics vendor in our region with GetIt's analytics."</p>
            </div>
          </div>
        </div>

        {/* Careers Section */}
        <div id="careers" className="mb-12">
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Join Our Team</h2>
            <p className="text-xs text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Be part of Bangladesh's digital transformation. We're looking for passionate individuals to help shape the future of e-commerce and contribute to our nation's technological advancement.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50 to-indigo-100">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Software Engineers</h3>
              <p className="text-xs text-gray-600 mb-3 leading-relaxed">Build the next generation of e-commerce technology with AI and microservices</p>
              <span className="inline-block bg-blue-100 text-blue-800 text-2xs px-2 py-1 rounded-full">5+ positions</span>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-green-50 to-emerald-100">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Product Managers</h3>
              <p className="text-xs text-gray-600 mb-3 leading-relaxed">Drive product strategy, innovation, and user experience excellence</p>
              <span className="inline-block bg-green-100 text-green-800 text-2xs px-2 py-1 rounded-full">3+ positions</span>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-purple-50 to-violet-100">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Customer Success</h3>
              <p className="text-xs text-gray-600 mb-3 leading-relaxed">Ensure exceptional customer experiences and community engagement</p>
              <span className="inline-block bg-purple-100 text-purple-800 text-2xs px-2 py-1 rounded-full">4+ positions</span>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div id="achievements" className="mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-6 text-center">🏅 Achievements</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-yellow-50 p-4 rounded-lg text-center border border-yellow-200">
              <div className="text-xl mb-2">🏆</div>
              <h3 className="text-xs font-bold text-gray-900 mb-1">Best Ecommerce Platform</h3>
              <p className="text-2xs text-gray-600">Bangladesh Digital Awards 2024</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-200">
              <div className="text-xl mb-2">🚀</div>
              <h3 className="text-xs font-bold text-gray-900 mb-1">Fastest Growing Startup</h3>
              <p className="text-2xs text-gray-600">TechCrunch Disrupt Asia 2024</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200">
              <div className="text-xl mb-2">🌟</div>
              <h3 className="text-xs font-bold text-gray-900 mb-1">Customer Choice Award</h3>
              <p className="text-2xs text-gray-600">Bangladesh Consumer Association 2024</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center border border-purple-200">
              <div className="text-xl mb-2">💡</div>
              <h3 className="text-xs font-bold text-gray-900 mb-1">Innovation Excellence</h3>
              <p className="text-2xs text-gray-600">BASIS National ICT Awards 2024</p>
            </div>
          </div>
        </div>

        {/* Sustainability */}
        <div id="sustainability" className="mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-6 text-center">🌱 Sustainability</h2>
          <div className="bg-green-50 p-6 rounded-lg mb-6">
            <p className="text-xs text-gray-600 leading-relaxed text-center mb-4">
              We're committed to building a sustainable future through responsible business practices, supporting local communities, and promoting eco-friendly products and packaging solutions.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-lg border border-green-200">
              <Leaf className="h-6 w-6 text-green-600 mb-3" />
              <h3 className="text-sm font-bold text-gray-900 mb-2">Green Packaging</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Eco-friendly packaging materials and minimal waste initiatives across our delivery network</p>
            </div>
            <div className="bg-white p-5 rounded-lg border border-blue-200">
              <Globe className="h-6 w-6 text-blue-600 mb-3" />
              <h3 className="text-sm font-bold text-gray-900 mb-2">Carbon Neutral</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Working towards carbon neutral operations and supporting renewable energy adoption</p>
            </div>
            <div className="bg-white p-5 rounded-lg border border-purple-200">
              <Heart className="h-6 w-6 text-purple-600 mb-3" />
              <h3 className="text-sm font-bold text-gray-900 mb-2">Community Impact</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Supporting local artisans and promoting sustainable business practices nationwide</p>
            </div>
          </div>
        </div>

        {/* Community Impact */}
        <div id="community" className="mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-6 text-center">❤️ Community Impact</h2>
          <div className="bg-red-50 p-6 rounded-lg mb-6">
            <p className="text-xs text-gray-600 leading-relaxed text-center mb-4">
              GetIt is more than a platform - we're building communities. Through our initiatives, we empower local businesses, create job opportunities, and contribute to Bangladesh's digital economy growth.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-red-200 text-center">
              <Users className="h-6 w-6 text-red-600 mx-auto mb-2" />
              <div className="text-sm font-bold text-gray-900">250K+</div>
              <p className="text-xs text-gray-600">Jobs Created</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-orange-200 text-center">
              <Building className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <div className="text-sm font-bold text-gray-900">50K+</div>
              <p className="text-xs text-gray-600">SMEs Supported</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-green-200 text-center">
              <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-sm font-bold text-gray-900">৳5B+</div>
              <p className="text-xs text-gray-600">Economic Impact</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-200 text-center">
              <Globe className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-sm font-bold text-gray-900">64</div>
              <p className="text-xs text-gray-600">Districts Reached</p>
            </div>
          </div>
        </div>

        {/* Innovation Hub */}
        <div id="innovation" className="mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-6 text-center">💡 Innovation Hub</h2>
          <div className="bg-gradient-to-br from-purple-50 to-indigo-100 p-6 rounded-lg mb-6">
            <p className="text-xs text-gray-600 leading-relaxed text-center mb-4">
              Our innovation hub drives technological advancement through AI research, startup partnerships, and digital transformation initiatives that shape Bangladesh's tech ecosystem.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-lg border border-purple-200">
              <Cpu className="h-6 w-6 text-purple-600 mb-3" />
              <h3 className="text-sm font-bold text-gray-900 mb-2">AI Research Lab</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Advanced machine learning research for personalized shopping experiences and predictive analytics</p>
            </div>
            <div className="bg-white p-5 rounded-lg border border-indigo-200">
              <Zap className="h-6 w-6 text-indigo-600 mb-3" />
              <h3 className="text-sm font-bold text-gray-900 mb-2">Startup Incubator</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Supporting early-stage tech startups and fostering innovation in Bangladesh's digital economy</p>
            </div>
            <div className="bg-white p-5 rounded-lg border border-blue-200">
              <BarChart3 className="h-6 w-6 text-blue-600 mb-3" />
              <h3 className="text-sm font-bold text-gray-900 mb-2">Data Intelligence</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Big data analytics and business intelligence solutions for market insights and growth strategies</p>
            </div>
          </div>
        </div>

        {/* Awards */}
        <div id="awards" className="mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-6 text-center">🏆 Awards</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-100 p-5 rounded-lg">
              <div className="flex items-center mb-3">
                <div className="bg-yellow-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl">🏆</div>
                <div className="ml-4">
                  <h3 className="text-sm font-bold text-gray-900">Digital Excellence Award</h3>
                  <p className="text-xs text-gray-600">Bangladesh Association of Software & Information Services (2024)</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">Recognized for outstanding contribution to digital transformation and innovation in ecommerce</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-5 rounded-lg">
              <div className="flex items-center mb-3">
                <div className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl">⭐</div>
                <div className="ml-4">
                  <h3 className="text-sm font-bold text-gray-900">Best User Experience</h3>
                  <p className="text-xs text-gray-600">UX Design Awards Bangladesh (2024)</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">Excellence in user interface design and customer experience innovation</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-5 rounded-lg">
              <div className="flex items-center mb-3">
                <div className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl">🌟</div>
                <div className="ml-4">
                  <h3 className="text-sm font-bold text-gray-900">Startup of the Year</h3>
                  <p className="text-xs text-gray-600">Bangladesh Startup Awards (2023)</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">Outstanding achievement in scaling technology solutions for mass market adoption</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-5 rounded-lg">
              <div className="flex items-center mb-3">
                <div className="bg-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl">🚀</div>
                <div className="ml-4">
                  <h3 className="text-sm font-bold text-gray-900">Innovation Leader</h3>
                  <p className="text-xs text-gray-600">TechCrunch Startup Battlefield (2023)</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">Global recognition for breakthrough AI technology in emerging markets</p>
            </div>
          </div>
        </div>

        {/* Press & Media Section */}
        <div id="press-media" className="bg-gray-50 p-6 rounded-lg mb-12">
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Press & Media</h2>
            <p className="text-xs text-gray-600">GetIt in the news - Recognition for innovation and growth</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="text-xs font-bold text-gray-900 mb-2">Daily Star Business</h4>
              <p className="text-2xs text-gray-600 mb-2 leading-relaxed">"GetIt revolutionizes Bangladesh's e-commerce landscape with AI-powered platform, bridging local market needs with global technology standards"</p>
              <span className="text-2xs text-gray-500 italic">March 2025</span>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="text-xs font-bold text-gray-900 mb-2">TechCrunch</h4>
              <p className="text-2xs text-gray-600 mb-2 leading-relaxed">"Bangladesh startup GetIt raises Series A funding to expand AI-driven marketplace and support local SME digital transformation"</p>
              <span className="text-2xs text-gray-500 italic">January 2025</span>
            </div>
          </div>
        </div>

        {/* Looking Forward */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg mb-12">
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Looking Forward</h2>
            <p className="text-xs text-gray-600 max-w-4xl mx-auto leading-relaxed">
              As we continue our journey toward becoming Bangladesh's leading ecommerce platform, we remain committed to innovation, customer satisfaction, and community growth. Our roadmap includes expanding our product categories, enhancing personalization features, and strengthening our support for local businesses while maintaining our position at the forefront of ecommerce technology.
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 italic mb-4">
              Join us in shaping the future of digital commerce in Bangladesh, where every transaction contributes to a more connected, prosperous, and sustainable economy for all.
            </p>
            <p className="text-sm font-semibold text-blue-600">
              <em>GetIt - Where Shopping Meets Innovation</em>
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 rounded-lg">
          <Award className="h-8 w-8 mx-auto mb-3" />
          <h2 className="text-lg font-bold mb-3">Join the GetIt Revolution</h2>
          <p className="text-xs mb-6 max-w-3xl mx-auto leading-relaxed">
            Be part of Bangladesh's digital commerce transformation. Whether you're a customer looking for authentic products with the best deals or a vendor wanting to grow your business with advanced tools, GetIt is here to empower your success.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/" className="bg-white text-blue-600 px-6 py-2 rounded-lg text-xs font-semibold hover:bg-gray-100 transition-colors">
              Start Shopping
            </Link>
            <Link to="/vendor/register" className="border border-white text-white px-6 py-2 rounded-lg text-xs font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Become a Vendor
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AboutUs;
