import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import Navbar from '../components/layout/Navbar';
import CodeEditor from '../components/room/CodeEditor';
import { useAuth } from '../context/AuthContext';
import roomService from '../services/roomService';
import { v4 as uuidv4 } from 'uuid';

// 1. Define Supported Languages
const LANGUAGES = [
  { name: "JavaScript", value: "javascript" },
  { name: "Python", value: "python" },
  { name: "Java", value: "java" },
  { name: "C++", value: "cpp" }
];

function Room() {
  const { roomId } = useParams();
  const { user } = useAuth(); 
  const socketRef = useRef(null);
  
  const [isConnected, setIsConnected] = useState(false);
  const [roomDetails, setRoomDetails] = useState(null);
  const [isApproved, setIsApproved] = useState(false); 
  
  const [guestName, setGuestName] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [pendingCandidate, setPendingCandidate] = useState(null);

  // 2. Add Language State
  const [language, setLanguage] = useState("javascript");

  useEffect(() => {
    const checkRoom = async () => {
      try {
        const response = await roomService.getRoom(roomId);
        setRoomDetails(response.data || response);
      } catch (err) {
        console.error("Room check failed:", err);
        alert("Room not found.");
      }
    };
    checkRoom();
  }, [roomId]);

  const joinRoom = (name, userId) => {
    if (!roomDetails) return;

    const isHost = user && roomDetails.interviewer === user._id;
    const role = isHost ? "interviewer" : "candidate";

    console.log(`Joining as ${role} (${name})...`);

    socketRef.current = io('http://localhost:8000');

    socketRef.current.on('connect', () => {
      console.log("Connected to Socket Server with ID:", socketRef.current.id);
      setIsConnected(true);
      
      socketRef.current.emit('join-room', { 
        roomId, 
        userId: userId,
        username: name,
        role: role 
      });
    });

    socketRef.current.on('room-joined', ({ status }) => {
      if (status === 'approved') {
        setIsApproved(true);
      }
    });

    if (isHost) {
      socketRef.current.on('user-waiting', ({ userId, socketId }) => {
        setPendingCandidate({ userId, socketId });
      });
    }

    // 3. Listen for Language Updates from other users
    socketRef.current.on('language-update', (newLang) => {
        setLanguage(newLang);
    });

    setHasJoined(true);
  };

  const handleAdmit = () => {
    if (pendingCandidate && socketRef.current) {
        socketRef.current.emit('admit-candidate', { socketId: pendingCandidate.socketId });
        setPendingCandidate(null);
    }
  };

  // 4. Handle Language Selection
  const handleLanguageChange = (e) => {
      const newLang = e.target.value;
      setLanguage(newLang);
      // Emit change to server
      if (socketRef.current) {
          socketRef.current.emit('language-change', { roomId, language: newLang });
      }
  };

  useEffect(() => {
    if (user && roomDetails && !hasJoined) {
      joinRoom(user.fullName, user._id);
    }
  }, [user, roomDetails]);


  if (!roomDetails) return <div className="bg-gray-900 h-screen text-white flex items-center justify-center">Loading Room...</div>;

  // SCENARIO 1: GUEST JOIN SCREEN
  if (!user && !hasJoined) {
    return (
      <div className="flex flex-col h-screen bg-gray-900 text-white items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md">
           <h2 className="text-2xl font-bold mb-2 text-center">Join Interview</h2>
           <p className="text-gray-400 mb-6 text-center">Enter your name to join the room.</p>
           
           <input 
             type="text"
             placeholder="Your Name (e.g. John Doe)"
             className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
             value={guestName}
             onChange={(e) => setGuestName(e.target.value)}
           />
           
           <button 
             onClick={() => joinRoom(guestName, uuidv4())} 
             disabled={!guestName.trim()}
             className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition"
           >
             Join Room
           </button>
        </div>
      </div>
    );
  }

  // SCENARIO 2: THE ACTUAL ROOM
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white relative">
      
      {/* NOTIFICATION BOX */}
      {pendingCandidate && (
        <div className="fixed top-24 right-6 bg-gray-800 border border-indigo-500 shadow-2xl p-4 rounded-lg z-50 animate-bounce max-w-sm">
            <h3 className="font-bold text-white mb-1 flex items-center gap-2">
                👤 Candidate Waiting
            </h3>
            <p className="text-sm text-gray-400 mb-4">
                A candidate is requesting to join the room.
            </p>
            <div className="flex gap-3">
                <button 
                  onClick={handleAdmit}
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded text-sm font-bold transition"
                >
                  Admit
                </button>
                <button 
                  onClick={() => setPendingCandidate(null)}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded text-sm font-bold transition"
                >
                  Deny
                </button>
            </div>
        </div>
      )}

      <Navbar position="static" />
      
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT PANEL (Sidebar) */}
        <div className="w-1/4 bg-gray-800 border-r border-gray-700 p-4 hidden md:block">
           <h2 className="text-xl font-bold mb-4">Room Info</h2>
           <div className="bg-gray-700/50 p-3 rounded-lg mb-4">
            <p className="text-sm text-gray-400">Room ID:</p>
            <p className="font-mono text-yellow-400 text-sm truncate" title={roomId}>{roomId}</p>
          </div>

           <div className="mt-6">
             <p className="text-gray-400 text-sm">Your Role:</p>
             <p className="font-bold text-lg text-white capitalize">
               {roomDetails.interviewer === user?._id ? "Interviewer (Host)" : "Candidate"}
             </p>
           </div>
           
           <div className="mt-4">
             <p className="text-gray-400 text-sm">Status:</p>
             <p className={`font-bold ${isApproved ? "text-green-400" : "text-yellow-400"}`}>
                {isApproved ? "🟢 Access Granted" : "🟡 Waiting for host..."}
             </p>
           </div>
        </div>

        {/* RIGHT PANEL (Code Editor) */}
        <div className="flex-1 bg-[#1e1e1e] flex flex-col min-w-0">
           
           {isApproved ? (
             <>
               {/* 5. Updated Header with Dropdown */}
               <div className="bg-gray-900 border-b border-gray-700 p-2 flex justify-between items-center px-4 shrink-0 h-12">
                 <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-300">main</span>
                    {/* Visual file extension */}
                    <span className="text-xs text-gray-500">
                        .{language === 'cpp' ? 'cpp' : language === 'python' ? 'py' : language === 'java' ? 'java' : 'js'}
                    </span>
                 </div>
                 
                 {/* Language Selector */}
                 <select 
                   value={language}
                   onChange={handleLanguageChange}
                   className="bg-gray-800 text-gray-300 text-xs rounded border border-gray-600 px-2 py-1 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                 >
                   {LANGUAGES.map(lang => (
                     <option key={lang.value} value={lang.value}>{lang.name}</option>
                   ))}
                 </select>
               </div>

               <div className="flex-1 overflow-hidden relative">
                 {/* 6. Pass Language Prop */}
                 <CodeEditor 
                    socket={socketRef.current} 
                    roomId={roomId} 
                    language={language}
                 /> 
               </div>
             </>
           ) : (
             <div className="flex items-center justify-center h-full">
               <div className="text-center">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                 <h2 className="text-2xl font-bold">Waiting Room</h2>
                 <p className="text-gray-400 mt-2">The host has been notified. Please wait...</p>
               </div>
             </div>
           )}
           
        </div>

      </div>
    </div>
  );
}

export default Room;