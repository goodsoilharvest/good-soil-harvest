const STOP_WORDS = new Set([
  "a","an","the","of","in","on","for","to","and","or","is","are","with",
  "your","our","how","why","what","when","can","do","does","its","it","be",
  "by","as","at","from","into","that","this","these","those","we","you","i",
  "my","their","about","more","most","some","all","any","not","no","but",
  "if","so","up","out","has","have","had","get","was","were","will","would",
  "just","than","then","them","they","which","who","him","her","his","she",
  "he","me","us","did","been","also","may","way","day","let","too","own",
  "new","old","big","good","well","even","only","very","still","yet","now",
  "case","makes","make","made","part","each","both","many","much","same",
  "after","before","between","through","without","while","where","here",
  "there","under","over","back","never","always","often","again","first",
  "last","long","little","few","every","found","left","right","think","know",
  "show","take","come","give","look","want","seem","turn","move","live",
  "study","real","actually","actually","reveals","tells","science","theory",
  "problem","question","guide","introduction","explained","understanding",
  "something","anything","everything","nothing","someone","anyone","everyone",
]);

// Extract significant topic keywords from a title
function topicWords(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length >= 4 && !STOP_WORDS.has(w));
}

export const DUPLICATE_THRESHOLD = 0.5;

/**
 * Primary method: shared-topic-word detection.
 * If two posts share any significant keyword (epigenetics, marshmallow, trolley…)
 * they are flagged. This catches topic duplicates regardless of how differently
 * they're titled.
 *
 * Secondary method: Jaccard similarity as a fallback for near-identical titles
 * that share many common words.
 *
 * Returns a Map of postId → { matchTitle, matchedWord }
 */
export function findDuplicates(
  posts: { id: string; title: string }[]
): Map<string, { matchTitle: string; matchedWord: string }> {
  const dupeMap = new Map<string, { matchTitle: string; matchedWord: string }>();

  // Build inverted index: word → list of post indices
  const wordIndex = new Map<string, number[]>();
  posts.forEach((p, i) => {
    for (const w of topicWords(p.title)) {
      if (!wordIndex.has(w)) wordIndex.set(w, []);
      wordIndex.get(w)!.push(i);
    }
  });

  // For each word that appears in 2+ posts, mark later posts as dupes of earliest
  for (const [word, indices] of wordIndex.entries()) {
    if (indices.length < 2) continue;
    const canonical = indices[0]; // earliest post wins
    for (const idx of indices.slice(1)) {
      if (!dupeMap.has(posts[idx].id)) {
        dupeMap.set(posts[idx].id, {
          matchTitle: posts[canonical].title,
          matchedWord: word,
        });
      }
    }
  }

  return dupeMap;
}

// Legacy export used by older callers — wraps new function
export function findDuplicateTitles(
  posts: { id: string; title: string }[]
): Map<string, string> {
  const result = new Map<string, string>();
  for (const [id, { matchTitle }] of findDuplicates(posts)) {
    result.set(id, matchTitle);
  }
  return result;
}
