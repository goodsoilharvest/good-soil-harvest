// General stop words — too common to indicate topic overlap
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
  "study","real","actually","reveals","tells","theory","problem","question",
  "guide","introduction","explained","understanding","something","anything",
  "everything","nothing","someone","anyone","everyone",
  // Generic meaningful words that are too broad to indicate topic duplication
  "ancient","early","means","works","wrong","alone","trying","people","world",
  "power","moral","brain","money","habit","self","life","body","shapes",
  "change","changes","changed","things","thing","around","within","across",
  "behind","called","named","known","used","made","comes","goes","gets",
  "feels","looks","seems","takes","gives","keeps","starts","stops","leads",
  "helps","needs","shows","tells","works","means","makes","says","puts",
  "human","social","personal","natural","physical","mental","cultural",
  "modern","common","simple","complex","specific","general","different",
  "important","significant","powerful","effective","difficult","possible",
]);

// Niche-specific stop words: common within a category but not topic-specific enough
const NICHE_STOP_WORDS: Record<string, Set<string>> = {
  faith: new Set([
    "theology","theological","prayer","prayers","church","churches",
    "scripture","gospel","jesus","christian","faith","spirit","spiritual",
    "spiritual","divine","sacred","holy","saint","saints","bible","biblical",
    "grace","wisdom","truth","light","eternal","kingdom","heaven","covenant",
    "worship","sermon","parable","psalm","psalms","prophet","prophets",
  ]),
  finance: new Set([
    "money","financial","wealth","invest","investing","investment","income",
    "savings","budget","budgeting","spending","retirement","portfolio","asset",
    "assets","returns","interest","compound","rates","taxes","dollars",
    "economic","economy","behavior","behavioral","market","markets",
  ]),
  psychology: new Set([
    "brain","behavior","behavioral","mental","cognitive","psychology",
    "psychological","research","researchers","experiment","experiments",
    "effect","effects","bias","biases","study","studies","phenomenon",
    "motivation","decision","decisions","judgment","perception","memory",
    "emotion","emotions","social","identity","belief","beliefs","thought",
    "thoughts","feeling","feelings","response","responses","pattern","patterns",
  ]),
  philosophy: new Set([
    "moral","ethics","ethical","virtue","virtuous","ancient","philosopher",
    "philosophy","philosophical","argument","arguments","idea","ideas",
    "concept","concepts","question","questions","truth","reality","justice",
    "freedom","reason","rational","rational","knowledge","value","values",
    "modern","western","thinker","thinkers",
  ]),
  science: new Set([
    "science","scientific","scientist","scientists","research","researchers",
    "evolution","evolutionary","universe","nature","natural","organism",
    "organisms","system","systems","process","processes","evidence","data",
    "experiment","experiments","theory","theories","biology","biological",
    "physics","chemistry","discovery","discoveries","mechanism","mechanisms",
  ]),
};

// Extract significant topic keywords from a title for a given niche
function topicWords(title: string, niche?: string): string[] {
  const nicheStop = niche ? (NICHE_STOP_WORDS[niche] ?? new Set()) : new Set<string>();
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(
      (w) =>
        w.length >= 5 &&           // minimum 5 chars
        !STOP_WORDS.has(w) &&
        !nicheStop.has(w)
    );
}

export const DUPLICATE_THRESHOLD = 0.5;

/**
 * Niche-aware duplicate detection.
 *
 * Two posts are flagged as duplicates ONLY when they:
 *   1. Belong to the same niche
 *   2. Share at least one significant topic keyword not in the stop lists
 *
 * "Significant" = 5+ chars, not a generic or niche-common word.
 * This catches real topic duplication (e.g., two articles both using the word
 * "marshmallow", "symbiogenesis", "eudaimonia", "antibiotic") without
 * triggering on generic domain vocabulary ("theology", "brain", "money"…).
 *
 * Returns a Map of postId → { matchTitle, matchedWord }
 */
export function findDuplicates(
  posts: { id: string; title: string; niche?: string }[]
): Map<string, { matchTitle: string; matchedWord: string }> {
  const dupeMap = new Map<string, { matchTitle: string; matchedWord: string }>();

  // Build inverted index per niche: (niche+word) → list of post indices
  const wordIndex = new Map<string, number[]>();
  posts.forEach((p, i) => {
    for (const w of topicWords(p.title, p.niche)) {
      const key = `${p.niche ?? ""}::${w}`;
      if (!wordIndex.has(key)) wordIndex.set(key, []);
      wordIndex.get(key)!.push(i);
    }
  });

  // For each (niche+word) that appears in 2+ posts, mark later posts as dupes
  for (const [, indices] of wordIndex.entries()) {
    if (indices.length < 2) continue;
    const canonical = indices[0]; // earliest post wins
    const matchedWord = topicWords(posts[canonical].title, posts[canonical].niche)[0] ?? "";
    for (const idx of indices.slice(1)) {
      if (!dupeMap.has(posts[idx].id)) {
        // Find the actual shared word
        const sharedWords = topicWords(posts[idx].title, posts[idx].niche).filter((w) =>
          topicWords(posts[canonical].title, posts[canonical].niche).includes(w)
        );
        dupeMap.set(posts[idx].id, {
          matchTitle: posts[canonical].title,
          matchedWord: sharedWords[0] ?? matchedWord,
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
