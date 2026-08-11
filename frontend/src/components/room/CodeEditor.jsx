import { useEffect, useRef, memo } from "react";
import Editor from "@monaco-editor/react";

const CODE_TEMPLATES = {
  javascript: `// Start coding here...\n`,
  python: `# Start coding here...\n`,
  java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Start coding here...\n        \n    }\n}\n`,
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Start coding here...\n    \n    return 0;\n}\n`
};

const CodeEditor = memo(({ socket, roomId, language, initialCode, onCodeChange, theme }) => {
  const editorRef = useRef(null);
  const isRemoteUpdate = useRef(false);
  const codeSyncTimer = useRef(null);
  const codeByLanguage = useRef({});
  const previousLanguage = useRef(language);

  const socketRef = useRef(socket);
  const roomIdRef = useRef(roomId);
  const onCodeChangeRef = useRef(onCodeChange);

  useEffect(() => { socketRef.current = socket; }, [socket]);
  useEffect(() => { roomIdRef.current = roomId; }, [roomId]);
  useEffect(() => { onCodeChangeRef.current = onCodeChange; }, [onCodeChange]);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;

    // If we have initial code from Redis, set it
    if (initialCode !== null && initialCode !== undefined && initialCode.trim() !== "" && initialCode !== "// Start coding here...") {
      isRemoteUpdate.current = true;
      editor.setValue(initialCode);
      isRemoteUpdate.current = false;
      codeByLanguage.current[language] = initialCode;
    } else {
      isRemoteUpdate.current = true;
      editor.setValue(CODE_TEMPLATES[language] || CODE_TEMPLATES.javascript);
      isRemoteUpdate.current = false;
      onCodeChangeRef.current?.(CODE_TEMPLATES[language] || CODE_TEMPLATES.javascript);
      codeByLanguage.current[language] = CODE_TEMPLATES[language] || CODE_TEMPLATES.javascript;
    }

    editor.onDidChangeModelContent((event) => {
      if (isRemoteUpdate.current) return;

      const value = editor.getValue();
      onCodeChangeRef.current?.(value);

      // Send incremental changes for real-time collab
      if (socketRef.current) {
        socketRef.current.emit("code-change", {
          roomId: roomIdRef.current,
          changes: event.changes.map(({ range, text }) => ({ range, text })),
        });

        // Debounced full code sync to Redis (300ms)
        if (codeSyncTimer.current) clearTimeout(codeSyncTimer.current);
        codeSyncTimer.current = setTimeout(() => {
          socketRef.current?.emit("code-sync", {
            roomId: roomIdRef.current,
            code: value,
          });
        }, 300);
      }
    });
  };

  useEffect(() => {
    if (!socket) return;

    const handleCodeUpdate = ({ changes }) => {
      if (!editorRef.current || !changes?.length) return;

      const editor = editorRef.current;

      isRemoteUpdate.current = true;

      // Save selections
      const selections = editor.getSelections();

      // Apply only the specific character-level edits, not full replacement
      editor.executeEdits(
        "remote-update",
        changes.map(({ range, text }) => ({
          range,
          text,
          forceMoveMarkers: true,
        }))
      );

      // Restore selections
      if (selections) editor.setSelections(selections);

      // Keep parent's code ref in sync
      onCodeChangeRef.current?.(editor.getValue());

      isRemoteUpdate.current = false;
    };

    socket.on("code-update", handleCodeUpdate);

    return () => {
      socket.off("code-update", handleCodeUpdate);
    };
  }, [socket]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (codeSyncTimer.current) clearTimeout(codeSyncTimer.current);
    };
  }, []);

  // Handle language change template insertion
  useEffect(() => {
    if (editorRef.current) {
      // 1. Save current code to the previous language
      if (previousLanguage.current) {
        codeByLanguage.current[previousLanguage.current] = editorRef.current.getValue();
      }

      // 2. Load the saved code for the NEW language, OR the template
      isRemoteUpdate.current = true;
      const newCode = codeByLanguage.current[language] || CODE_TEMPLATES[language] || CODE_TEMPLATES.javascript;
      editorRef.current.setValue(newCode);
      isRemoteUpdate.current = false;
      
      onCodeChangeRef.current?.(newCode);
      
      if (socketRef.current) {
          socketRef.current.emit("code-sync", {
              roomId: roomIdRef.current,
              code: newCode
          });
      }

      // 3. Update previousLanguage ref
      previousLanguage.current = language;
    }
  }, [language]);

  return (
    <div className="h-full w-full overflow-hidden">
      <Editor
        height="100%"
        language={language}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        defaultValue={initialCode || "// Start coding here..."}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 16,
          cursorBlinking: "smooth",
          wordWrap: "on",
          padding: { top: 20 },
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
});

export default CodeEditor;