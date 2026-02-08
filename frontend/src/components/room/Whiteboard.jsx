import { useEffect, useState, useRef } from "react"; 
import { Excalidraw } from "@excalidraw/excalidraw";

const Whiteboard = ({ socket, roomId }) => {
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);

  const isRemoteUpdate = useRef(false);
  
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!socket || !excalidrawAPI) return;

    const handleRemoteUpdate = (elements) => {
      isRemoteUpdate.current = true;
      excalidrawAPI.updateScene({ elements });
    };

    socket.on("whiteboard-update", handleRemoteUpdate);

    return () => {
      socket.off("whiteboard-update", handleRemoteUpdate);
    };
  }, [socket, excalidrawAPI]);

  const handleChange = (elements) => {
    if (isRemoteUpdate.current) {
       isRemoteUpdate.current = false;
       return;
    }

    //Throttler: If a timer is already running, we are "too busy". Skip this update.
    if (timeoutRef.current) {
        return; 
    }

    if (socket) {
        socket.emit("whiteboard-draw", {
            roomId,
            data: elements 
        });
    }

    timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
    }, 50); 
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