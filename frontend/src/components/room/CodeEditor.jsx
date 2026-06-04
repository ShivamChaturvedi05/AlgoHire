import { useEffect, useRef, memo } from "react";
import Editor from "@monaco-editor/react";

const CodeEditor = memo(({ socket, roomId, language, initialCode, onCodeChange }) => {
  const editorRef = useRef(null);
  const isRemoteUpdate = useRef(false);
  const codeSyncTimer = useRef(null);

  const socketRef = useRef(socket);
  const roomIdRef = useRef(roomId);
  const onCodeChangeRef = useRef(onCodeChange);

  useEffect(() => { socketRef.current = socket; }, [socket]);
  useEffect(() => { roomIdRef.current = roomId; }, [roomId]);
  useEffect(() => { onCodeChangeRef.current = onCodeChange; }, [onCodeChange]);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;

    // If we have initial code from Redis, set it
    if (initialCode !== null && initialCode !== undefined) {
      isRemoteUpdate.current = true;
      editor.setValue(initialCode);
      isRemoteUpdate.current = false;
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

  return (
    <div className="h-full w-full overflow-hidden">
      <Editor
        height="100%"
        language={language}
        theme="vs-dark"
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