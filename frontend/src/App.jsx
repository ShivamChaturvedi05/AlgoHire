import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Room from './pages/Room';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/*Secured*/}
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/room/:roomId" element={<Room />} />
      </Routes>
    </>
  );
}

export default App;