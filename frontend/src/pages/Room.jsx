import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import Navbar from '../components/layout/Navbar';
import CodeEditor from '../components/room/CodeEditor';

function Room() {
  const { roomId } = useParams();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socketRef.current = io('http://localhost:8000');

    socketRef.current.on('connect', () => {
      console.log("Connected to Socket Server with ID:", socketRef.current.id);
      setIsConnected(true);
      // We will add the join-room emit here in the next step
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      
      {/* FIX: Add position="static" so it pushes content down */}
      <Navbar position="static" />
      
      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT PANEL (Sidebar) */}
        <div className="w-1/4 bg-gray-800 border-r border-gray-700 p-4 hidden md:block">
          <h2 className="text-xl font-bold mb-4">Room Info</h2>
          <div className="bg-gray-700/50 p-3 rounded-lg mb-4">
            <p className="text-sm text-gray-400">Room ID:</p>
            <p className="font-mono text-yellow-400 text-sm truncate" title={roomId}>{roomId}</p>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-400">Status:</p>
            <p className={`font-bold ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
              {isConnected ? '🟢 Connected' : '🔴 Connecting...'}
            </p>
          </div>
        </div>

        {/* RIGHT PANEL (Code Editor) */}
        <div className="flex-1 bg-[#1e1e1e] flex flex-col min-w-0">
          
          {/* Editor Header */}
          <div className="bg-gray-900 border-b border-gray-700 p-2 flex justify-between items-center px-4 shrink-0 h-10">
             <span className="text-sm font-medium text-gray-300">main.js</span>
             <span className="text-xs text-gray-500">JavaScript</span>
          </div>

          {/* The Real Editor */}
          <div className="flex-1 overflow-hidden relative">
             <CodeEditor /> 
          </div>
          
        </div>

      </div>
    </div>
  );
}

export default Room;