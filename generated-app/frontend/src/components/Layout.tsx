import { Link, useLocation } from 'react-router-dom';
import { Newspaper, PlusCircle, Zap } from 'lucide-react';
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
      <header className="bg-[#232F3E] text-white sticky top-0 z-50 shadow-lg animate-slide-down">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-[#FF9900] rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3">
                <Zap className="w-5 h-5 text-[#232F3E]" strokeWidth={2.5} />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight">AWS News Hub</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === '/'
                    ? 'bg-white/10 text-[#FF9900]'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Newspaper className="w-4 h-4" />
                Feed
              </Link>
              <Link
                to="/announcements/new"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === '/announcements/new'
                    ? 'bg-[#FF9900] text-[#232F3E]'
                    : 'bg-[#FF9900]/10 text-[#FF9900] hover:bg-[#FF9900] hover:text-[#232F3E]'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                New Announcement
              </Link>
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <div className="w-5 h-5 flex flex-col justify-center gap-1">
                <span className={`block h-0.5 w-5 bg-white transition-all duration-200 ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <span className={`block h-0.5 w-5 bg-white transition-all duration-200 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 w-5 bg-white transition-all duration-200 ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>
          </div>

          {/* Mobile Nav */}
          {mobileMenuOpen && (
            <nav className="md:hidden pb-4 animate-slide-down">
              <div className="flex flex-col gap-1">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === '/' ? 'bg-white/10 text-[#FF9900]' : 'text-gray-300'
                  }`}
                >
                  <Newspaper className="w-4 h-4" />
                  Feed
                </Link>
                <Link
                  to="/announcements/new"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === '/announcements/new' ? 'bg-[#FF9900] text-[#232F3E]' : 'text-gray-300'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  New Announcement
                </Link>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#2E3440] text-gray-400 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-sm font-['JetBrains_Mono']">
            &copy; 2025 AWS News Hub
          </p>
          <p className="text-xs text-gray-500">
            Built with React + Lambda + DynamoDB
          </p>
        </div>
      </footer>
    </div>
  );
}
