import { useState } from 'react';

const TestConsole = ({ results, isLoading, onClose, isHost }) => {
  const [height, setHeight] = useState(250);

  return (
    <div 
      style={{ height: height, minHeight: 100, maxHeight: 600 }} 
      className="bg-white dark:bg-[#1e1e1e] flex flex-col transition-colors duration-300 shrink-0 border-t border-gray-200 dark:border-gray-700"
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
      <div className="flex justify-between items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Test Results</span>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Output Content */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-[#121212]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full gap-2 text-indigo-500 dark:text-indigo-400 font-semibold">
             <div className="animate-spin h-5 w-5 border-2 border-indigo-500 dark:border-indigo-400 border-t-transparent rounded-full"></div>
             Running Tests...
          </div>
        ) : !results || results.length === 0 ? (
           <div className="text-gray-500 dark:text-gray-400 text-sm text-center mt-4">
               No test results.
           </div>
        ) : (
          <div className="space-y-4">
             {results.map((res, index) => {
                const hiddenFromCandidate = res.isHidden && !isHost;

                return (
                  <div key={index} className={`rounded-lg border ${res.passed ? 'border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-900/10' : 'border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10'} p-4 shadow-sm`}>
                     <div className="flex justify-between items-center mb-2">
                        <h4 className={`font-bold ${res.passed ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                           Test Case {index + 1} {hiddenFromCandidate && <span className="text-xs ml-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">Hidden</span>}
                        </h4>
                        <span className={`text-sm font-bold px-2 py-1 rounded ${res.passed ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                           {res.passed ? '✅ Passed' : '❌ Failed'}
                        </span>
                     </div>
                     
                     {hiddenFromCandidate ? (
                        <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                           This is a hidden test case. You cannot see the input or expected output.
                        </div>
                     ) : (
                        <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                           <div>
                              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase">Input</p>
                              <pre className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-2 rounded text-gray-800 dark:text-gray-300 whitespace-pre-wrap font-mono">{res.input || "No Input"}</pre>
                           </div>
                           <div>
                              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase">Expected Output</p>
                              <pre className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-2 rounded text-gray-800 dark:text-gray-300 whitespace-pre-wrap font-mono">{res.expectedOutput}</pre>
                           </div>
                           <div className="col-span-2 mt-2">
                              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase">Your Output</p>
                              <pre className={`bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-2 rounded whitespace-pre-wrap font-mono ${res.passed ? 'text-gray-800 dark:text-gray-300' : 'text-red-600 dark:text-red-400'}`}>
                                 {res.stderr ? `Error:\n${res.stderr}` : (res.stdout || "No output")}
                              </pre>
                           </div>
                        </div>
                     )}
                  </div>
                );
             })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestConsole;
