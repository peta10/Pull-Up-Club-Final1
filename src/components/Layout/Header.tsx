import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import { User, Menu, X, Trophy, Home, UserPlus, LogIn, LogOut, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../LanguageSelector';

const Header: React.FC = () => {
  const { user, signOut, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation('common');

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 bg-black text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 text-[#9b9b6f] hover:text-[#7a7a58] transition-colors">
            <img 
              src={"/battlebunker-logo-optimized.webp"}
              alt="Battle Bunker"
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold tracking-wider"></span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="font-medium hover:text-[#9b9b6f] transition-colors flex items-center">
              <Home className="h-4 w-4 mr-1" />
              {t('nav.home')}
            </Link>
            <Link to="/leaderboard" className="font-medium hover:text-[#9b9b6f] transition-colors flex items-center">
              <Trophy className="h-4 w-4 mr-1" />
              {t('nav.leaderboard')}
            </Link>
            <Link to="/ethos" className="font-medium hover:text-[#9b9b6f] transition-colors flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 4h9" /><path strokeLinecap="round" strokeLinejoin="round" d="M4 6v12a2 2 0 002 2h8V4H6a2 2 0 00-2 2z" /></svg>
              {t('nav.ethos')}
            </Link>
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="flex items-center space-x-2 font-medium hover:text-[#9b9b6f] transition-colors">
                  <User size={20} />
                  <span>{t('nav.dashboard')}</span>
                </Link>
                {isAdmin && (
                  <Link to="/admin-dashboard" className="font-medium hover:text-[#9b9b6f] transition-colors flex items-center">
                    <Shield className="h-4 w-4 mr-1" />
                    {t('nav.admin')}
                  </Link>
                )}
                <button
                  className="font-medium hover:text-[#9b9b6f] transition-colors flex items-center bg-transparent border-none outline-none cursor-pointer p-0"
                  onClick={signOut}
                  type="button"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <>
                <Link to="/subscription" className="font-medium hover:text-[#9b9b6f] transition-colors flex items-center">
                  <UserPlus className="h-4 w-4 mr-1" />
                  {t('nav.signup')}
                </Link>
                <Link to="/login" className="font-medium hover:text-[#9b9b6f] transition-colors flex items-center">
                  <LogIn className="h-4 w-4 mr-1" />
                  {t('nav.login')}
                </Link>
              </>
            )}
            <LanguageSelector />
          </nav>
          
          <button 
            className="md:hidden text-white focus:outline-none" 
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-black border-t border-gray-800 shadow-lg">
            <nav className="flex flex-col space-y-4 p-4">
              <Link 
                to="/" 
                className="font-medium hover:text-[#9b9b6f] transition-colors flex items-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="h-4 w-4 mr-1" />
                {t('nav.home')}
              </Link>
              <Link 
                to="/leaderboard" 
                className="font-medium hover:text-[#9b9b6f] transition-colors flex items-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Trophy className="h-4 w-4 mr-1" />
                {t('nav.leaderboard')}
              </Link>
              <Link 
                to="/ethos" 
                className="font-medium hover:text-[#9b9b6f] transition-colors flex items-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 4h9" /><path strokeLinecap="round" strokeLinejoin="round" d="M4 6v12a2 2 0 002 2h8V4H6a2 2 0 00-2 2z" /></svg>
                {t('nav.ethos')}
              </Link>
              {user ? (
                <>
                  <Link 
                    to="/profile" 
                    className="flex items-center space-x-2 font-medium hover:text-[#9b9b6f] transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User size={20} />
                    <span>{t('nav.dashboard')}</span>
                  </Link>
                  {isAdmin && (
                    <Link 
                      to="/admin-dashboard" 
                      className="font-medium hover:text-[#9b9b6f] transition-colors flex items-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Shield className="h-4 w-4 mr-1" />
                      {t('nav.admin')}
                    </Link>
                  )}
                  <button
                    className="font-medium hover:text-[#9b9b6f] transition-colors flex items-center bg-transparent border-none outline-none cursor-pointer p-0"
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    type="button"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/subscription" 
                    className="font-medium hover:text-[#9b9b6f] transition-colors flex items-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    {t('nav.signup')}
                  </Link>
                  <Link 
                    to="/login" 
                    className="font-medium hover:text-[#9b9b6f] transition-colors flex items-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LogIn className="h-4 w-4 mr-1" />
                    {t('nav.login')}
                  </Link>
                </>
              )}
              <LanguageSelector />
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;