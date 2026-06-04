import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Navbar from '../components/layout/Navbar';
import CodeEditor from '../components/room/CodeEditor';
import OutputConsole from '../components/room/OutputConsole';
import Whiteboard from '../components/room/Whiteboard';
import { useAuth } from '../context/AuthContext';
import roomService from '../services/roomService';
import compilerService from '../services/compilerService'; 
import { v4 as uuidv4 } from 'uuid';

const LANGUAGES = [
  { name: "JavaScript", value: "javascript" },
  { name: "Python", value: "python" },
  { name: "Java", value: "java" },
  { name: "C++", value: "cpp" }
];

function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); 
  const socketRef = useRef(null);
  
  const [isConnected, setIsConnected] = useState(false);
  const [roomDetails, setRoomDetails] = useState(null);
  const [isApproved, setIsApproved] = useState(false); 
  const [guestName, setGuestName] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [pendingCandidate, setPendingCandidate] = useState(null);
  const [language, setLanguage] = useState("javascript");

  // --- COMPILER STATES ---
  const [output, setOutput] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const codeValueRef = useRef("// Start coding here...");

  const [activeTab, setActiveTab] = useState("code"); 

  // --- INITIAL STATE FROM REDIS ---
  const [initialCode, setInitialCode] = useState(null);
  const [initialWhiteboard, setInitialWhiteboard] = useState(null);
  const [interviewEnded, setInterviewEnded] = useState(false);

  useEffect(() => {
    const checkRoom = async () => {
      try {
        const response = await roomService.getRoom(roomId);
        const details = response.data || response;
        setRoomDetails(details);

        if (details.status === 'completed') {
          // Bypass join screen for completed rooms (Read-Only Mode)
          setHasJoined(true);
          setIsApproved(true);
          setInitialCode(details.codeState);
          codeValueRef.current = details.codeState || "// No code saved";
          setLanguage(details.language || "javascript");
          setInitialWhiteboard(details.whiteboardState);
        }
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
      setIsConnected(true);
      socketRef.current.emit('join-room', { roomId, userId, username: name, role });
    });

    socketRef.current.on('room-joined', ({ status }) => {
      if (status === 'approved') setIsApproved(true);
    });

    // Receive initial state from Redis
    socketRef.current.on('room-state', (state) => {
      console.log("📥 Received room state from server:", state);
      if (state.codeState !== undefined) {
        setInitialCode(state.codeState);
        codeValueRef.current = state.codeState;
      }
      if (state.language) {
        setLanguage(state.language);
      }
      if (state.whiteboardState) {
        setInitialWhiteboard(state.whiteboardState);
      }
    });

    if (isHost) {
      socketRef.current.on('user-waiting', ({ userId, socketId }) => {
        setPendingCandidate({ userId, socketId });
      });
    }

    socketRef.current.on('language-update', (newLang) => setLanguage(newLang));

    // Listen for interview end
    socketRef.current.on('interview-ended', ({ message }) => {
      setInterviewEnded(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    });
    
    setHasJoined(true);
  };

  const handleAdmit = () => {
    if (pendingCandidate && socketRef.current) {
        socketRef.current.emit('admit-candidate', { socketId: pendingCandidate.socketId });
        setPendingCandidate(null);
    }
  };

  const handleLanguageChange = (e) => {
      const newLang = e.target.value;
      setLanguage(newLang);
      if (socketRef.current) {
          socketRef.current.emit('language-change', { roomId, language: newLang });
      }
  };

  const handleEndInterview = () => {
    if (socketRef.current) {
      socketRef.current.emit('end-interview', { roomId });
    }
  };

  // --- RUN CODE FUNCTION ---
  const runCode = async () => {
    setIsConsoleOpen(true);
    setIsCompiling(true);
    setOutput(""); 

    try {
        const result = await compilerService.execute(language, codeValueRef.current);

        const outputData = result.data || {};
        const finalOutput = outputData.stdout || outputData.stderr || "No output returned";
        
        setOutput(finalOutput);

    } catch (err) {
        console.error("Run failed:", err);
        setOutput("Error: Failed to execute code. Please try again.");
    } finally {
        setIsCompiling(false);
    }
  };

  const handleLocalCodeChange = useCallback((newCode) => {
      codeValueRef.current = newCode;
  }, []);

  useEffect(() => {
    if (user && roomDetails && !hasJoined) {
      joinRoom(user.fullName, user._id);
    }
  }, [user, roomDetails]);

  // Cleanup socket on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const isHost = user && roomDetails && roomDetails.interviewer === user._id;

  if (interviewEnded) {
    return (
      <div className="flex flex-col h-screen bg-gray-900 text-white items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2">Interview Ended</h2>
          <p className="text-gray-400">The interview has been saved. Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  if (!roomDetails) return <div className="bg-gray-900 h-screen text-white flex items-center justify-center">Loading Room...</div>;

  if (!hasJoined && roomDetails?.status !== 'completed') {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        <div className="p-8 bg-gray-800 rounded-lg shadow-xl w-96 text-center">
          <h2 className="text-2xl font-bold mb-6">Join Interview</h2>
          {!user ? (
            <input
              type="text"
              placeholder="Enter your name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full px-4 py-2 mb-4 bg-gray-700 rounded border border-gray-600 text-white focus:outline-none focus:border-indigo-500"
            />
          ) : (
            <p className="mb-4 text-gray-300">Joining as <strong>{user.fullName}</strong></p>
          )}
          <button
            onClick={() => joinRoom(user ? user.fullName : guestName, user ? user._id : 'guest')}
            disabled={!user && !guestName.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded font-semibold transition"
          >
            Join Room
          </button>
        </div>
      </div>
    );
  }

  const isCompleted = roomDetails?.status === 'completed';

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white relative">
      
      {pendingCandidate && (
        <div className="fixed top-24 right-6 bg-gray-800 border border-indigo-500 shadow-2xl p-4 rounded-lg z-50 animate-bounce max-w-sm">
            <h3 className="font-bold text-white mb-1">👤 Candidate Waiting</h3>
            <div className="flex gap-3 mt-4">
                <button onClick={handleAdmit} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded text-sm font-bold">Admit</button>
                <button onClick={() => setPendingCandidate(null)} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded text-sm font-bold">Deny</button>
            </div>
        </div>
      )}

      <Navbar position="static" />
      
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT PANEL */}
        <div className="w-1/4 bg-gray-800 border-r border-gray-700 p-4 hidden md:flex md:flex-col">
           <h2 className="text-xl font-bold mb-4">Room Info</h2>
           <div className="bg-gray-700/50 p-3 rounded-lg mb-4">
            <p className="text-sm text-gray-400">Room ID:</p>
            <p className="font-mono text-yellow-400 text-sm truncate" title={roomId}>{roomId}</p>
          </div>
           <div className="mt-6"><p className="text-gray-400 text-sm">Your Role:</p><p className="font-bold text-lg text-white capitalize">{isHost ? "Interviewer (Host)" : "Candidate"}</p></div>
           
           <h3 className="text-sm font-semibold text-gray-400 mt-6 mb-2 px-2 uppercase tracking-wider">Controls</h3>
           <div className="space-y-3">
             <div className="p-3 bg-gray-800 rounded text-sm">
                <p className="text-gray-300 mb-1">Status</p>
                <p className={`font-bold capitalize ${isCompleted ? 'text-red-400' : 'text-green-400'}`}>
                   {isCompleted ? 'Completed' : 'Active'}
                </p>
             </div>
             {isHost && !isCompleted && (
                <button 
                   onClick={handleEndInterview}
                   className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold transition"
                >
                   🛑 End Interview
                </button>
             )}
           </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 bg-[#1e1e1e] flex flex-col min-w-0">
           
           {isApproved ? (
             <>
               {/* --- HEADER: TABS + TOOLS --- */}
               <div className="bg-gray-900 border-b border-gray-700 p-2 flex justify-between items-center px-4 shrink-0 h-12">
                 
                 {/* LEFT: TABS */}
                 <div className="flex gap-4">
                     <button 
                       onClick={() => setActiveTab("code")}
                       className={`text-sm font-medium transition-colors ${activeTab === "code" ? "text-indigo-400 border-b-2 border-indigo-400" : "text-gray-400 hover:text-gray-200"}`}
                     >
                       &lt;/&gt; Code
                     </button>
                     <button 
                       onClick={() => setActiveTab("board")}
                       className={`text-sm font-medium transition-colors ${activeTab === "board" ? "text-indigo-400 border-b-2 border-indigo-400" : "text-gray-400 hover:text-gray-200"}`}
                     >
                       🎨 Whiteboard
                     </button>
                 </div>

                 {/* RIGHT: TOOLS */}
                 {activeTab === "code" && (
                     <div className="flex items-center gap-3">
                        <select 
                          value={language}
                          onChange={handleLanguageChange}
                          disabled={isCompleted}
                          className={`bg-gray-800 text-gray-300 text-xs rounded border border-gray-600 px-2 py-1 outline-none focus:border-indigo-500 ${isCompleted ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {LANGUAGES.map(lang => (
                            <option key={lang.value} value={lang.value}>{lang.name}</option>
                          ))}
                        </select>
                        {!isCompleted && (
                          <button 
                              onClick={runCode}
                              disabled={isCompiling}
                              className={`text-xs font-bold px-4 py-1.5 rounded transition-all flex items-center gap-2 ${
                                  isCompiling 
                                  ? "bg-gray-700 text-gray-400 cursor-not-allowed" 
                                  : "bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20"
                              }`}
                          >
                              {isCompiling ? "Running..." : "▶ Run Code"}
                          </button>
                        )}
                     </div>
                 )}
               </div>

               {/* --- MAIN CONTENT AREA --- */}
               <div className="flex-1 overflow-hidden relative">
                 {isCompleted && (
                   <div className="absolute top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-1 text-sm font-bold shadow-md">
                      READ-ONLY MODE: This interview has been completed.
                   </div>
                 )}
                 {activeTab === "code" ? (
                     <CodeEditor 
                        socket={socketRef.current} 
                        roomId={roomId} 
                        language={language}
                        initialCode={initialCode}
                        onCodeChange={handleLocalCodeChange} 
                     />
                 ) : (
                     <Whiteboard 
                        socket={socketRef.current}
                        roomId={roomId}
                        initialElements={initialWhiteboard}
                     />
                 )}
               </div>

               {/* --- OUTPUT CONSOLE (Only for Code Tab) --- */}
               {isConsoleOpen && activeTab === "code" && (
                 <OutputConsole 
                    output={output} 
                    isLoading={isCompiling} 
                    isError={false}
                    onClose={() => setIsConsoleOpen(false)}
                 />
               )}
             </>
           ) : (
             <div className="flex items-center justify-center h-full">
               <div className="text-center">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                 <h2 className="text-2xl font-bold">Waiting Room</h2>
               </div>
             </div>
           )}
           
        </div>

      </div>
    </div>
  );
}

export default Room;