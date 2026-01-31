import Editor from '@monaco-editor/react';

const CodeEditor = () => {
  
  const handleEditorChange = (value) => {
    // This function runs every time you type a character
    console.log("Current Code:", value);
    // TODO: Emit this change to the Socket Server
  };

  return (
    <div className="h-full w-full overlay overflow-hidden">
      <Editor
        height="100%"
        defaultLanguage="javascript"
        defaultValue="// Start coding here..."
        theme="vs-dark" // Matches our dark theme
        options={{
          minimap: { enabled: false }, // Hides the small map on the right
          fontSize: 16,
          cursorBlinking: "smooth",
          wordWrap: "on",
          padding: { top: 20 },
        }}
        onChange={handleEditorChange}
      />
    </div>
  );
};

export default CodeEditor;