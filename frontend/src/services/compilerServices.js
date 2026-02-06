import api from './api';

const compilerService = {
  execute: async (language, code) => {
    try {
      const response = await api.post('/compiler/execute', {
        language,
        code
      });
      return response.data;
    } catch (error) {
      console.error("Execution error:", error);
      throw error;
    }
  }
};

export default compilerService;