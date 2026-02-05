import api from './api';

const roomService = {

  createRoom: async () => {
    try {
      const response = await api.post('/rooms/create');

      return response.data; 
    } catch (error) {
      console.error("Error creating room:", error);
      throw error;
    }
  },

  getRoom: async (roomId) => {
    try {
      const response = await api.get(`/rooms/${roomId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching room:", error);
      throw error;
    }
  },


  getHistory: async () => {
    try {
      const response = await api.get('/rooms/history');
      return response.data.data; 
    } catch (error) {
      console.error("Error fetching history:", error);
      throw error;
    }
  }
};

export default roomService;