const axios = require("axios");

const EMBEDDING_API = process.env.EMBEDDING_URL || "http://localhost:5002/embed";
const EMBEDDING_TIMEOUT = 15000; // 15 seconds
const MAX_RETRIES = 2;

/**
 * Generate semantic embedding for text
 * Falls back to empty array if service is unavailable
 */
exports.generateEmbedding = async (text, retries = 0) => {
  if (!text || !text.trim()) {
    return [];
  }

  try {
    const res = await axios.post(
      EMBEDDING_API,
      { text: text.substring(0, 8000) }, // Limit text length
      {
        timeout: EMBEDDING_TIMEOUT,
        headers: { "Content-Type": "application/json" },
      }
    );

    if (res.data?.embedding && Array.isArray(res.data.embedding)) {
      return res.data.embedding;
    }

    console.warn("Invalid embedding response, retrying...");
    return [];
  } catch (err) {
    // Retry on timeout or connection error
    if (retries < MAX_RETRIES && (err.code === "ECONNABORTED" || err.code === "ECONNREFUSED" || err.response?.status === 503)) {
      console.log(`Embedding attempt ${retries + 1} failed, retrying...`);
      return exports.generateEmbedding(text, retries + 1);
    }

    if (err.code === "ECONNABORTED") {
      console.error("Embedding service timeout");
    } else if (err.code === "ECONNREFUSED") {
      console.error("Embedding service unavailable (connection refused)");
    } else {
      console.error("Embedding Error:", err.message);
    }

    return [];
  }
};

/**
 * Check if embedding service is healthy
 */
exports.checkEmbeddingHealth = async () => {
  try {
    const healthUrl = EMBEDDING_API.replace("/embed", "/health");
    await axios.get(healthUrl, { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
};