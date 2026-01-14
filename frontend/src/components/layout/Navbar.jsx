import { Link } from 'react-router-dom';
import ThemeToggle from '../common/ThemeToggle';
import { useAuth } from '../../context/AuthContext'; // 1. Import Auth Context

function Navbar() {
  const { user, logout } = useAuth(); // 2. Get user state and logout function

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
        
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link to="/" className="-m-1.5 p-1.5 font-bold text-2xl text-indigo-600 dark:text-indigo-400">
            AlgoHire
          </Link>
        </div>

        {/* Links (Hidden on mobile) */}
        <div className="hidden lg:flex lg:gap-x-12">
          {/* If user is logged in, you might want to link "Dashboard" instead of landing page links */}
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

        {/* Right Side: ThemeToggle + Auth Status */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4 lg:items-center">
          
          <ThemeToggle />
          
          {user ? (
            /* STATE A: User is Logged In */
            <div className="flex items-center gap-4 pl-4 border-l border-gray-200 dark:border-gray-700">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Hi, {user.fullName ? user.fullName.split(' ')[0] : "User"}
              </span>
              <button
                onClick={logout}
                className="text-sm font-semibold leading-6 text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              >
                Log out
              </button>
            </div>
          ) : (
            /* STATE B: User is Logged Out */
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