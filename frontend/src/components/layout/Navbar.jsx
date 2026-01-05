import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
        
        {/* 1. Logo Section (Left) */}
        <div className="flex lg:flex-1">
          <Link to="/" className="-m-1.5 p-1.5 font-bold text-2xl text-indigo-600">
            AlgoHire
          </Link>
        </div>

        {/* 2. Navigation Links (Center) - Hidden on mobile for simplicity */}
        <div className="hidden lg:flex lg:gap-x-12">
          <a href="#product" className="text-sm font-semibold leading-6 text-gray-900">Product</a>
          <a href="#features" className="text-sm font-semibold leading-6 text-gray-900">Features</a>
          <a href="#marketplace" className="text-sm font-semibold leading-6 text-gray-900">Marketplace</a>
          <a href="#company" className="text-sm font-semibold leading-6 text-gray-900">Company</a>
        </div>

        {/* 3. Login Button (Right) */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <Link to="/login" className="text-sm font-semibold leading-6 text-gray-900">
            Log in <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;