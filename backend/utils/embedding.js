const axios = require("axios");

const EMBEDDING_API = "http://127.0.0.1:8001/embed";

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