import { Link } from 'react-router-dom';
import ThemeToggle from '../common/ThemeToggle';
import { useAuth } from '../../context/AuthContext';

function Navbar({ position = "absolute" }) { // <--- 1. Add Prop with default "absolute"
  const { user, logout } = useAuth();

  // 2. Define classes based on position
  // absolute: Floating, transparent (for Landing Page)
  // static: Block element, solid background (for Room/App)
  const headerClass = position === "static" 
    ? "bg-gray-900 border-b border-gray-800 z-50" 
    : "absolute inset-x-0 top-0 z-50";

  return (
    <header className={headerClass}>
      <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
        
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link to="/" className="-m-1.5 p-1.5 font-bold text-2xl text-indigo-600 dark:text-indigo-400">
            AlgoHire
          </Link>
        </div>

        {/* Links */}
        <div className="hidden lg:flex lg:gap-x-12">
          {user ? (
             <Link to="/dashboard" className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">
               Dashboard
             </Link>
          ) : (
            <>
              <a href="#product" className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">Product</a>
              <a href="#features" className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">Features</a>
              <a href="#marketplace" className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">Marketplace</a>
            </>
          )}
        </div>

        {/* Right Side */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4 lg:items-center">
          <ThemeToggle />
          
          {user ? (
            <div className="flex items-center gap-4 pl-4 border-l border-gray-200 dark:border-gray-700">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Hi, {user.fullName ? user.fullName.split(' ')[0] : "User"}
              </span>
              <button
                onClick={logout}
                className="text-sm font-semibold leading-6 text-red-600 hover:text-red-500 transition-colors"
              >
                Log out
              </button>
            </div>
          ) : (
            <Link to="/login" className="text-sm font-semibold leading-6 text-gray-900 dark:text-white">
              Log in <span aria-hidden="true">&rarr;</span>
            </Link>
          )}

        </div>
      </nav>
    </header>
  );
}

export default Navbar;