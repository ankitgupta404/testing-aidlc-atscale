import { Link, useLocation } from 'react-router-dom';
import { Newspaper, Plus, Menu, X } from './Icons';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-aws-navy sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-3 group"
            >
              <div className="w-9 h-9 bg-aws-orange rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
                <Newspaper className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-semibold text-lg leading-tight font-[family-name:var(--font-display)]">
                  AWS News Hub
                </span>
                <span className="text-gray-400 text-xs leading-tight hidden sm:block font-[family-name:var(--font-mono)]">
                  Service Releases & Updates
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === '/'
                    ? 'bg-white/10 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Feed
              </Link>
              <Link
                to="/announcements/new"
                className="ml-2 flex items-center gap-2 px-4 py-2 bg-aws-orange hover:bg-aws-orange-hover text-white rounded-lg text-sm font-medium transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Add Announcement
              </Link>
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-gray-300 hover:text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 animate-slide-down">
            <div className="px-4 py-3 space-y-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg text-sm font-medium ${
                  location.pathname === '/'
                    ? 'bg-white/10 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Feed
              </Link>
              <Link
                to="/announcements/new"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2 bg-aws-orange hover:bg-aws-orange-hover text-white rounded-lg text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Announcement
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-sm text-text-muted font-[family-name:var(--font-mono)]">
              AWS News Hub — Stay updated with the latest AWS releases
            </p>
            <p className="text-xs text-text-muted">
              Built with React, TypeScript & AWS
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
