import { useState } from 'react';

const OutputConsole = ({ output, isError, isLoading, onClose }) => {
  const [height, setHeight] = useState(192);

  return (
    <div 
      style={{ height: height, minHeight: 100, maxHeight: 600 }} 
      className="bg-white dark:bg-[#1e1e1e] flex flex-col transition-colors duration-300 shrink-0"
    >
      {/* RESIZER HANDLE */}
      <div 
        className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-indigo-500 cursor-row-resize shrink-0 transition-colors"
        onMouseDown={(e) => {
          e.preventDefault();
          const startY = e.clientY;
          const startHeight = height;
          
          const handleMouseMove = (moveEvent) => {
             const newHeight = startHeight - (moveEvent.clientY - startY);
             if (newHeight >= 100 && newHeight <= 600) {
                setHeight(newHeight);
             }
          };
          
          const handleMouseUp = () => {
             document.removeEventListener('mousemove', handleMouseMove);
             document.removeEventListener('mouseup', handleMouseUp);
             document.body.style.cursor = 'default';
          };
          
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
          document.body.style.cursor = 'row-resize';
        }}
      />

      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Console Output</span>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Output Content */}
      <div className="flex-1 p-4 font-mono text-sm overflow-auto text-gray-800 dark:text-gray-300">
        {isLoading ? (
          <div className="flex items-center gap-2 text-yellow-500 dark:text-yellow-400">
             <div className="animate-spin h-3 w-3 border-2 border-yellow-500 dark:border-yellow-400 border-t-transparent rounded-full"></div>
             Running code...
          </div>
        ) : (
          <pre className={`whitespace-pre-wrap ${isError ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
            {output || "Run code to see output here..."}
          </pre>
        )}
      </div>
    </div>
  );
};

export default OutputConsole;