const normalize = (vector) => {
  const norm = Math.sqrt(
    vector.reduce((sum, val) => sum + val * val, 0)
  );

  if (norm === 0) return vector;

  return vector.map(val => val / norm);
};

exports.updateUserEmbedding = (
  userEmbedding,
  contentEmbedding,
  weight
) => {
  if (!contentEmbedding || contentEmbedding.length === 0)
    return userEmbedding || [];

  const decay = 0.95;

  // If user has no embedding yet
  if (!userEmbedding || userEmbedding.length === 0) {
    return normalize(
      contentEmbedding.map(val => val * weight)
    );
  }

  const updated = userEmbedding.map(
    (val, idx) =>
      decay * val + weight * contentEmbedding[idx]
  );

  return normalize(updated);
};

exports.cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0)
    return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return 0;

  return dot / (normA * normB);
};