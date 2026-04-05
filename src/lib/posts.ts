import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const contentDir = path.join(process.cwd(), "content");

export interface PostFrontmatter {
  title: string;
  description: string;
  date: string;
  updated?: string;
  author?: string;
  niche: string;
  tags?: string[];
  image?: string;
  imageAlt?: string;
  featured?: boolean;
  affiliate?: boolean; // flags posts with affiliate links for disclosure
}

export interface Post extends PostFrontmatter {
  slug: string;
  content: string;
  readingTime: string;
  href: string;
}

function parsePost(filePath: string, slug: string, niche?: string): Post {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const rt = readingTime(content);
  const fm = data as PostFrontmatter;

  const postNiche = niche ?? fm.niche;
  const href = `/blog/${postNiche}/${slug}`;

  return {
    ...fm,
    niche: postNiche,
    slug,
    content,
    readingTime: rt.text,
    href,
  };
}

export function getAllPosts(): Post[] {
  const posts: Post[] = [];

  // Blog posts organized by niche folder: content/blog/{niche}/{slug}.mdx
  const blogDir = path.join(contentDir, "blog");
  if (!fs.existsSync(blogDir)) return posts;

  const niches = fs.readdirSync(blogDir).filter((n) => {
    return fs.statSync(path.join(blogDir, n)).isDirectory();
  });

  for (const niche of niches) {
    const nicheDir = path.join(blogDir, niche);
    const files = fs.readdirSync(nicheDir).filter((f) => f.endsWith(".mdx"));

    for (const file of files) {
      const slug = file.replace(/\.mdx$/, "");
      const post = parsePost(path.join(nicheDir, file), slug, niche);
      posts.push(post);
    }
  }

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getPostsByNiche(niche: string): Post[] {
  return getAllPosts().filter((p) => p.niche === niche);
}

export function getFeaturedPosts(limit = 3): Post[] {
  const all = getAllPosts();
  const featured = all.filter((p) => p.featured);
  return (featured.length >= limit ? featured : all).slice(0, limit);
}

export function getPostBySlug(niche: string, slug: string): Post | null {
  const filePath = path.join(contentDir, "blog", niche, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  return parsePost(filePath, slug, niche);
}
