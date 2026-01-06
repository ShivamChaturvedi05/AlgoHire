import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import useTheme from '../../hooks/useTheme';

export default function ThemeToggle() {
  const [theme, setTheme] = useTheme();

  return (
    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-full p-1 ring-1 ring-gray-200 dark:ring-gray-700">
      
      {/* Light Mode Button */}
      <button
        onClick={() => setTheme('light')}
        className={`p-1.5 rounded-full transition-all duration-200 ${
          theme === 'light' 
            ? 'bg-white shadow-sm text-amber-500' 
            : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
        }`}
      >
        <SunIcon className="h-5 w-5" />
      </button>

      {/* Dark Mode Button */}
      <button
        onClick={() => setTheme('dark')}
        className={`p-1.5 rounded-full transition-all duration-200 ${
          theme === 'dark' 
            ? 'bg-gray-700 shadow-sm text-indigo-400' 
            : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
        }`}
      >
        <MoonIcon className="h-5 w-5" />
      </button>
    </div>
  );
}