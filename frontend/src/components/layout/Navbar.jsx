import { Link } from 'react-router-dom';
import ThemeToggle from '../common/ThemeToggle';

function Navbar() {
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
          <a href="#product" className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">Product</a>
          <a href="#features" className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">Features</a>
          <a href="#marketplace" className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">Marketplace</a>
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4 lg:items-center">
          <ThemeToggle />
          
          <Link to="/login" className="text-sm font-semibold leading-6 text-gray-900 dark:text-white">
            Log in <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;