import Navbar from '../components/layout/Navbar';
import { Link } from 'react-router-dom';

function Landing() {
  return (
    
    <div className="bg-white dark:bg-gray-900 transition-colors duration-300 min-h-screen"> 
      <Navbar />

      <div className="relative isolate px-6 pt-14 lg:px-8">
        
        {/* Top Blob - Adjusted opacity for dark mode */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div 
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 dark:opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}
          />
        </div>

        {/* MAIN CONTENT */}
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            
            {/* Headline - Added dark:text-white */}
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              Technical interviews, <br />
              <span className="text-indigo-600 dark:text-indigo-400">simplified.</span>
            </h1>
            
            {/* Subtext - Added dark:text-gray-300 */}
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              The frictionless platform for modern engineering teams. 
              Real-time code collaboration, shared whiteboards, and 
              instant access for candidates—no login required.
            </p>
            
            {/* Buttons */}
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/login"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400"
              >
                Start Interviewing
              </Link>
              <a href="#" className="text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                View Demo <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;