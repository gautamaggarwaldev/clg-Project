import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.get('/cyber', async (req, res) => {
  try {
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'cybersecurity OR cyber attack OR hacking OR data breach',
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 10,
        apiKey: process.env.NEWS_API_KEY,
      },
    });

    res.status(200).json({ articles: response.data.articles });
  } catch (error) {
    console.error('News API error:', error.message);
    res.status(500).json({ message: 'Failed to fetch news articles' });
  }
});

export default router;
