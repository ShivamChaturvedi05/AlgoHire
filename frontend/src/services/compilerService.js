import api from './api';

const compilerService = {
  execute: async (language, code, input = "", roomId) => {
    try {
      const response = await api.post('/compiler/execute', {
        language,
        code,
        input,
        roomId
      });
      return response.data;
    } catch (error) {
      console.error("Execution error:", error);
      throw error;
    }
  },
  runTests: async (language, code, testCases, roomId) => {
    try {
      const response = await api.post('/compiler/run-tests', {
        language,
        code,
        testCases,
        roomId
      });
      return response.data;
    } catch (error) {
      console.error("Test execution error:", error);
      throw error;
    }
  }
};

export default compilerService;