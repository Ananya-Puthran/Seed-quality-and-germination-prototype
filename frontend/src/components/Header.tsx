import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User as UserIcon, FileText, Play, Home } from 'lucide-react';
import sporousLogo from '../assets/sporous_logo.jpeg';

export const Header: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: 'Home', path: '/home', icon: Home },
    { name: 'Prediction', path: '/prediction', icon: Play },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Profile', path: '/profile', icon: UserIcon },
  ];

  return (
    <header className="bg-[#FAF8F5] border-b border-[#E2DDD5] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
        {/* Brand Logo Asset & Tagline */}
        <Link to="/home" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#E2DDD5] bg-white flex items-center justify-center p-0.5 shadow-sm group-hover:border-[#386655] transition-colors">
            <img
              src={sporousLogo}
              alt="SPOROUS Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-[#163323] block leading-none">
              SPOROUS
            </span>
            <span className="text-[11px] text-[#566A58] font-medium tracking-wide block mt-1">
              Seed Quality & Germination
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-xs font-semibold tracking-wide transition-colors py-1 relative ${
                  active
                    ? 'text-[#163323]'
                    : 'text-[#566A58] hover:text-[#163323]'
                }`}
              >
                {link.name}
                {active && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#163323] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#163323] hover:bg-[#F5F2EC] rounded-md transition-colors"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E2DDD5] bg-[#FAF8F5] px-6 py-4 space-y-3">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-[#163323] text-[#FAF8F5]'
                    : 'text-[#566A58] hover:bg-[#F5F2EC] hover:text-[#163323]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
