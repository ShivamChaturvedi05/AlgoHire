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
  },
  runTests: async (language, code, testCases) => {
    try {
      const response = await api.post('/compiler/run-tests', {
        language,
        code,
        testCases
      });
      return response.data;
    } catch (error) {
      console.error("Test execution error:", error);
      throw error;
    }
  }
};

export default compilerService;