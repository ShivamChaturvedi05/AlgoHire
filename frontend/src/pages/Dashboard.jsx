import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import roomService from '../services/roomService';
import QuestionBank from '../components/dashboard/QuestionBank';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('history');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await roomService.getHistory();
        setRooms(data || []); 
      } catch (err) {
        console.error("Failed to load history:", err);
        setError("Could not load past interviews.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleCreateRoom = async () => {
    try {
      const data = await roomService.createRoom();

      const roomId = data.data?.roomId || data.roomId || data.data?._id; 

      if (!roomId) {
        throw new Error("No room ID received");
      }

      navigate(`/room/${roomId}`); 
    } catch (err) {
      console.error(err);
      alert("Failed to create room. Please try again.");
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("Are you sure you want to delete this interview history?")) {
      return;
    }
    try {
      await roomService.deleteRoom(roomId);
      setRooms(rooms.filter(room => (room.roomId || room._id) !== roomId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete room.");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300 relative isolate">
      <Navbar />

      {/* Background Blobs */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 dark:opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }} />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
        
        {/* Header Section */}
        <div className="md:flex md:items-center md:justify-between mb-10">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
              Dashboard
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your past interviews or create a new session.
            </p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <button
              onClick={handleCreateRoom}
              className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              + New Interview
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex space-x-6 mb-8 border-b border-gray-200 dark:border-gray-700">
           <button 
             onClick={() => setActiveTab('history')} 
             className={`pb-3 px-1 text-sm font-bold border-b-2 transition-colors ${activeTab === 'history' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
           >
             Interview History
           </button>
           <button 
             onClick={() => setActiveTab('questions')} 
             className={`pb-3 px-1 text-sm font-bold border-b-2 transition-colors ${activeTab === 'questions' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
           >
             Question Bank
           </button>
        </div>

        {activeTab === 'history' ? (
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-lg ring-1 ring-gray-900/5 dark:ring-white/10 overflow-hidden">
            
            {loading ? (
              <div className="p-10 text-center text-gray-500 dark:text-gray-400">Loading your history...</div>
            ) : error ? (
               <div className="p-10 text-center text-red-500">{error}</div>
            ) : rooms.length === 0 ? (
              <div className="p-10 text-center text-gray-500 dark:text-gray-400">
                No interviews yet. Click "New Interview" to start!
              </div>
            ) : (
              <ul role="list" className="divide-y divide-gray-100 dark:divide-gray-700">
                {rooms.map((room) => (
                  <li key={room._id || room.roomId} className="flex justify-between gap-x-6 py-5 px-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition duration-150">
                    <div className="flex min-w-0 gap-x-4">
                      <div className="min-w-0 flex-auto">
                        <p className="text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                          Room ID: {room.roomId || room._id}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-gray-700 dark:text-gray-300 font-medium">
                          Candidate: {room.candidateName && room.candidateName !== "Guest Candidate" ? room.candidateName : "Pending/Unknown"}
                        </p>
                        <p className="mt-1 truncate text-xs leading-5 text-gray-500 dark:text-gray-400">
                          Created on {formatDate(room.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                      <p className="text-sm leading-6 text-gray-900 dark:text-gray-300 capitalize">
                        Status: <span className={room.status === 'active' ? 'text-green-500 font-bold' : 'text-gray-500'}>{room.status}</span>
                      </p>
                       <div className="mt-1 flex items-center gap-x-4">
                         <button 
                            onClick={() => navigate(`/room/${room.roomId || room._id}`)}
                            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                         >
                           {room.status === 'completed' ? 'View Results' : 'Rejoin Room'}
                         </button>
                         {room.status === 'completed' && (
                           <button 
                              onClick={() => handleDeleteRoom(room.roomId || room._id)}
                              className="text-xs text-red-600 dark:text-red-400 hover:underline"
                              title="Delete Interview"
                           >
                             Delete
                           </button>
                         )}
                       </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <QuestionBank />
        )}
      </div>
    </div>
  );
}

export default Dashboard;