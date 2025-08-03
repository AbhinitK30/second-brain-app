const { Pinecone } = require('@pinecone-database/pinecone');

// Use the host URL for serverless
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
  // No controllerHostUrl or environment for serverless
});

function getPineconeIndex() {
  return pinecone.index(process.env.PINECONE_INDEX, process.env.PINECONE_HOST);
}

module.exports = { getPineconeIndex }; 