import { useEffect, useRef, memo } from "react";
import Editor from "@monaco-editor/react";

const CodeEditor = memo(({ socket, roomId, language, onCodeChange }) => {
  const editorRef = useRef(null);
  const isRemoteUpdate = useRef(false);

  const socketRef = useRef(socket);
  const roomIdRef = useRef(roomId);
  const onCodeChangeRef = useRef(onCodeChange);

  useEffect(() => { socketRef.current = socket; }, [socket]);
  useEffect(() => { roomIdRef.current = roomId; }, [roomId]);
  useEffect(() => { onCodeChangeRef.current = onCodeChange; }, [onCodeChange]);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;

    editor.onDidChangeModelContent((event) => {
      if (isRemoteUpdate.current) return;

      const value = editor.getValue();
      onCodeChangeRef.current?.(value);

      // Send only the incremental changes (not the full code)
      if (socketRef.current) {
        socketRef.current.emit("code-change", {
          roomId: roomIdRef.current,
          changes: event.changes.map(({ range, text }) => ({ range, text })),
        });
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

  return (
    <div className="h-full w-full overflow-hidden">
      <Editor
        height="100%"
        language={language}
        theme="vs-dark"
        defaultValue="// Start coding here..."
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