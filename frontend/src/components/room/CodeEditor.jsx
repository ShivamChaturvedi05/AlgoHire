import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ socket, roomId, language, onCodeChange }) => { 
  const [code, setCode] = useState("// Start coding here...");

  const isThrottled = useRef(false);

  useEffect(() => {
    if (!socket) return;

    const handleCodeUpdate = (newCode) => {
      setCode(newCode); 
      if (onCodeChange) onCodeChange(newCode); 
    };

    socket.on("code-update", handleCodeUpdate);

    return () => {
      socket.off("code-update", handleCodeUpdate);
    };
  }, [socket, onCodeChange]);

  const handleEditorChange = (value) => {
    setCode(value);
    if (onCodeChange) onCodeChange(value);

    //THROTTLING LOGIC 

    if (isThrottled.current) {
        return; 
    }

    if (socket) {
        socket.emit("code-change", { roomId, code: value });
    }

    isThrottled.current = true;
    setTimeout(() => {
        isThrottled.current = false;
        
    }, 500); 
  };

  return (
    <div className="h-full w-full overlay overflow-hidden">
      <Editor
        height="100%"
        language={language}
        theme="vs-dark"
        value={code} 
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          fontSize: 16,
          cursorBlinking: "smooth",
          wordWrap: "on",
          padding: { top: 20 },
        }}
      />
    </div>
  );
};

export default CodeEditor;