import axios from 'axios';

export const getCyberNews = async () => {
  const response = await axios.get('http://localhost:5005/v1/news/cyber');
  // const response = await axios.get('https://cs-qhmx.onrender.com/v1/news/cyber');
  return response.data.articles;
};
