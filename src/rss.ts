import Parser from 'rss-parser';

export interface Article {
  title: string;
  link: string;
  pubDate: string;
  snippet: string;
  source: 'Qiita' | 'Zenn';
  topics: string[];
}

const parser = new Parser();

export async function fetchZennArticles(topic: string, sinceDate: Date): Promise<Article[]> {
  const url = `https://zenn.dev/topics/${encodeURIComponent(topic)}/feed`;
  const articles: Article[] = [];

  try {
    const feed = await parser.parseURL(url);
    for (const item of feed.items) {
      const pubDateStr = item.isoDate || item.pubDate || '';
      const pubDate = pubDateStr ? new Date(pubDateStr) : new Date();

      if (pubDate >= sinceDate) {
        articles.push({
          title: item.title || 'No Title',
          link: item.link || '',
          pubDate: pubDate.toISOString(),
          snippet: (item.contentSnippet || item.content || '').trim(),
          source: 'Zenn',
          topics: [topic],
        });
      }
    }
  } catch (error) {
    console.error(`Error fetching Zenn topic feed for "${topic}":`, error);
  }

  return articles;
}

export async function fetchQiitaArticles(topic: string, sinceDate: Date): Promise<Article[]> {
  const url = `https://qiita.com/tags/${encodeURIComponent(topic)}/feed.atom`;
  const articles: Article[] = [];

  try {
    const feed = await parser.parseURL(url);
    for (const item of feed.items) {
      const pubDateStr = item.isoDate || item.pubDate || '';
      const pubDate = pubDateStr ? new Date(pubDateStr) : new Date();

      if (pubDate >= sinceDate) {
        articles.push({
          title: item.title || 'No Title',
          link: item.link || '',
          pubDate: pubDate.toISOString(),
          snippet: (item.contentSnippet || item.content || '').trim(),
          source: 'Qiita',
          topics: [topic],
        });
      }
    }
  } catch (error) {
    console.error(`Error fetching Qiita tag feed for "${topic}":`, error);
  }

  return articles;
}

export async function fetchAllArticles(topics: string[], hoursAgo: number = 24): Promise<Article[]> {
  const sinceDate = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
  const articleMap = new Map<string, Article>();

  for (const topic of topics) {
    const [zenn, qiita] = await Promise.all([
      fetchZennArticles(topic, sinceDate),
      fetchQiitaArticles(topic, sinceDate),
    ]);

    const combined = [...zenn, ...qiita];

    for (const article of combined) {
      if (!article.link) continue;
      const existing = articleMap.get(article.link);
      if (existing) {
        if (!existing.topics.includes(topic)) {
          existing.topics.push(topic);
        }
      } else {
        articleMap.set(article.link, article);
      }
    }
  }

  return Array.from(articleMap.values());
}
