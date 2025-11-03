import axios from 'axios';

const BASE_URL = 'http://localhost:5005/v1/user/auth';
// const BASE_URL = 'https://cs-qhmx.onrender.com/v1/user/auth';

export const loginUser = async (credentials) => {
  return axios.post(`${BASE_URL}/login`, credentials);
};

export const registerUser = async (data) => {
  return axios.post(`${BASE_URL}/register`, data);
};
