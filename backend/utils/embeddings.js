const axios = require('axios');

// Function to get embedding for a given text using Cohere API
async function getEmbedding(text) {
  try {
    console.log('Calling Cohere for embedding:', text);
    const response = await axios.post(
      'https://api.cohere.ai/v1/embed',
      {
        texts: [text],
        model: 'embed-english-v3.0', // or your chosen model
        input_type: 'search_document',
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Cohere response:', response.data);
    return response.data.embeddings[0];
  } catch (err) {
    console.error('Cohere embedding error:', err.response?.data || err.message);
    throw err;
  }
}

module.exports = { getEmbedding }; 