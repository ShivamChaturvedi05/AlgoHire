import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1/questions';

const getQuestions = async () => {
    const response = await axios.get(API_URL, {
        withCredentials: true
    });
    return response.data;
};

const createQuestion = async (title, description, testCases = []) => {
    const response = await axios.post(API_URL, { title, description, testCases }, {
        withCredentials: true
    });
    return response.data;
};

const deleteQuestion = async (questionId) => {
    const response = await axios.delete(`${API_URL}/${questionId}`, {
        withCredentials: true
    });
    return response.data;
};

export default {
    getQuestions,
    createQuestion,
    deleteQuestion
};
