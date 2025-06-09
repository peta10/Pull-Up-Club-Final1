import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { User, Menu, X, Trophy, Home, ShoppingBag } from 'lucide-react';

const Header: React.FC = () => {
  const { user, signOut, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 bg-black text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 text-[#9b9b6f] hover:text-[#7a7a58] transition-colors">
            <img 
              src={import.meta.env.VITE_LOGO_URL || "https://cdn.shopify.com/s/files/1/0567/5237/3945/files/png_bb_logo.png?v=1746303427"} 
              alt="Battle Bunker Logo" 
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold tracking-wider"></span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="font-medium hover:text-[#9b9b6f] transition-colors flex items-center">
              <Home className="h-4 w-4 mr-1" />
              Home
            </Link>
            <Link to="/leaderboard" className="font-medium hover:text-[#9b9b6f] transition-colors flex items-center">
              <Trophy className="h-4 w-4 mr-1" />
              Leaderboard
            </Link>
            <a href="https://shop.thebattlebunker.com/?srsltid=AfmBOooA1PK269tAblC8AjIUZIdGUa5gd65im0ovz5pqv5tcrV319AlX" 
               className="font-medium hover:text-[#9b9b6f] transition-colors flex items-center"
               target="_blank"
               rel="noopener noreferrer">
              <ShoppingBag className="h-4 w-4 mr-1" />
              Shop
            </a>
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="flex items-center space-x-2 font-medium hover:text-[#9b9b6f] transition-colors">
                  <User size={20} />
                  <span>Dashboard</span>
                </Link>
                {isAdmin && (
                  <Link to="/admin-dashboard" className="font-medium hover:text-[#9b9b6f] transition-colors">
                    Admin
                  </Link>
                )}
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => signOut()}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Link to="/subscription" className="font-medium hover:text-[#9b9b6f] transition-colors">
                  Sign Up
                </Link>
                <Link to="/login" className="font-medium hover:text-[#9b9b6f] transition-colors">
                  Login
                </Link>
              </>
            )}
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
                Home
              </Link>
              <Link 
                to="/leaderboard" 
                className="font-medium hover:text-[#9b9b6f] transition-colors flex items-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Trophy className="h-4 w-4 mr-1" />
                Leaderboard
              </Link>
              <a 
                href="https://shop.thebattlebunker.com/?srsltid=AfmBOooA1PK269tAblC8AjIUZIdGUa5gd65im0ovz5pqv5tcrV319AlX"
                className="font-medium hover:text-[#9b9b6f] transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Shop
              </a>
              {user ? (
                <>
                  <Link 
                    to="/profile" 
                    className="flex items-center space-x-2 font-medium hover:text-[#9b9b6f] transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User size={20} />
                    <span>Dashboard</span>
                  </Link>
                  {isAdmin && (
                    <Link 
                      to="/admin-dashboard" 
                      className="font-medium hover:text-[#9b9b6f] transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link 
                    to="/subscription" 
                    className="font-medium hover:text-[#9b9b6f] transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                <Link 
                  to="/login" 
                  className="font-medium hover:text-[#9b9b6f] transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;