const OutputConsole = ({ output, isError, isLoading, onClose }) => {
  return (
    <div className="h-48 bg-[#1e1e1e] border-t border-gray-700 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Console Output</span>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Output Content */}
      <div className="flex-1 p-4 font-mono text-sm overflow-auto text-gray-300">
        {isLoading ? (
          <div className="flex items-center gap-2 text-yellow-400">
             <div className="animate-spin h-3 w-3 border-2 border-yellow-400 border-t-transparent rounded-full"></div>
             Running code...
          </div>
        ) : (
          <pre className={`whitespace-pre-wrap ${isError ? "text-red-400" : "text-green-400"}`}>
            {output || "Run code to see output here..."}
          </pre>
        )}
      </div>
    </div>
  );
};

export default OutputConsole;