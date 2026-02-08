import { useEffect, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";

const Whiteboard = ({ socket, roomId }) => {
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);

  useEffect(() => {
    if (!socket || !excalidrawAPI) return;

    const handleRemoteUpdate = (elements) => {
      excalidrawAPI.updateScene({
        elements: elements
      });
    };

    socket.on("whiteboard-update", handleRemoteUpdate);

    return () => {
      socket.off("whiteboard-update", handleRemoteUpdate);
    };
  }, [socket, excalidrawAPI]);

  const handleChange = (elements, appState) => {

    if (appState.draggingElement || appState.resizingElement || appState.editingElement) {
       if (socket) {
          socket.emit("whiteboard-draw", {
             roomId,
             data: elements 
          });
       }
    }
    
  };

  return (
    <div className="h-full w-full bg-gray-900">
      <Excalidraw
        theme="dark"
        onChange={handleChange}
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        UIOptions={{
           canvasActions: {
              loadScene: false,
              saveToActiveFile: false,
              toggleTheme: false,
              saveAsImage: true 
           }
        }}
      />
    </div>
  );
};

export default Whiteboard;