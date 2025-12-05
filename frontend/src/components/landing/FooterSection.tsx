import React from 'react';
import { Zap, Mail, Github, Twitter, Linkedin } from 'lucide-react';

const footerLinks = [
  { label: 'About', href: '#' },
  { label: 'Features', href: '#' },
  { label: 'Pricing', href: '#' },
  { label: 'Blog', href: '#' },
];

const socialLinks = [
  { icon: <Twitter className="h-5 w-5" />, href: '#' },
  { icon: <Github className="h-5 w-5" />, href: '#' },
  { icon: <Linkedin className="h-5 w-5" />, href: '#' },
];

export const FooterSection: React.FC = () => {
  return (
    <footer className="relative w-full bg-slate-950/80 border-t border-slate-700/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <Zap className="h-5 w-5 text-blue-400" />
              </div>
              <span className="text-lg font-bold text-slate-100">
                AiNewsVerse
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Your go-to platform for AI news and insights.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-bold text-slate-100 mb-4">Product</h4>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-bold text-slate-100 mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:support@ainewsverse.com"
                  className="text-sm text-slate-400 hover:text-blue-400 transition-colors flex items-center space-x-2"
                >
                  <Mail className="h-4 w-4" />
                  <span>Support</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
                >
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-bold text-slate-100 mb-4">Follow Us</h4>
            <div className="flex items-center space-x-4">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-400 hover:text-blue-400 hover:border-blue-600/50 transition-all"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700/50 pt-8 flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sm text-slate-400">
            © 2025 AiNewsVerse. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 mt-4 sm:mt-0">
            <a href="#" className="text-sm text-slate-400 hover:text-blue-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-slate-400 hover:text-blue-400 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};