let extractorPromise;

async function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = import("@huggingface/transformers").then(
      ({ pipeline }) =>
        pipeline(
          "feature-extraction",
          "Xenova/all-MiniLM-L6-v2"
        )
    );
  }

  return extractorPromise;
}

async function getEmbedding(text) {
  const extractor = await getExtractor();

  const output = await extractor(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data);
}

function cosineSimilarity(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (!normA || !normB) {
    return 0;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function semanticSimilarity(textA, textB) {
  const [embeddingA, embeddingB] =
    await Promise.all([
      getEmbedding(textA),
      getEmbedding(textB),
    ]);

  return cosineSimilarity(
    embeddingA,
    embeddingB
  );
}

module.exports = {
  getEmbedding,
  semanticSimilarity,
};