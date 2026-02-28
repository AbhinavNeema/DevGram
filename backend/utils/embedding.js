const axios = require("axios");

const EMBEDDING_API = process.env.EMBEDDING_URL;

exports.generateEmbedding = async (text) => {
  try {
    const res = await axios.post(EMBEDDING_API, {
      text,
    });

    return res.data.embedding;
  } catch (err) {
    console.error("Embedding Error:", err.message);
    return [];
  }
};