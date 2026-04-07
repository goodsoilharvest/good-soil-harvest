const STOP_WORDS = new Set([
  "a","an","the","of","in","on","for","to","and","or","is","are","with",
  "your","our","how","why","what","when","can","do","does","its","it","be",
  "by","as","at","from","into","that","this","these","those","we","you","i",
  "my","their","about","more","most","some","all","any","not","no","but",
  "if","so","up","out","has","have","had","get","was","were","will","would",
]);

function keyWords(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter(w => w.length > 2 && !STOP_WORDS.has(w))
  );
}

function jaccardSimilarity(a: string, b: string): number {
  const wa = keyWords(a);
  const wb = keyWords(b);
  if (wa.size === 0 || wb.size === 0) return 0;
  const intersection = [...wa].filter(w => wb.has(w)).length;
  const union = new Set([...wa, ...wb]).size;
  return intersection / union;
}

export const DUPLICATE_THRESHOLD = 0.55;

/**
 * Given a list of posts, returns a Map of postId → the title of the most
 * similar other post (only when similarity ≥ DUPLICATE_THRESHOLD).
 * The "canonical" post is whichever was created first (lowest index).
 */
export function findDuplicates(
  posts: { id: string; title: string }[]
): Map<string, string> {
  const dupeMap = new Map<string, string>();

  for (let i = 0; i < posts.length; i++) {
    for (let j = i + 1; j < posts.length; j++) {
      if (dupeMap.has(posts[j].id)) continue; // already flagged
      const score = jaccardSimilarity(posts[i].title, posts[j].title);
      if (score >= DUPLICATE_THRESHOLD) {
        dupeMap.set(posts[j].id, posts[i].title);
      }
    }
  }

  return dupeMap;
}
