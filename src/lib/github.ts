import data from '@/data/github.json';
import { projects, type ProjectContent } from '@/data/projects';

export type Repo = (typeof data.repos)[number];

export const github = data;

export const reposByName = new Map<string, Repo>(data.repos.map((r) => [r.name, r]));

export type Project = ProjectContent & {
  repo: Repo | undefined;
  repoUrl: string;
  liveUrl: string | null;
  pushedAt: string | null;
  createdAt: string | null;
  language: string | null;
  languageShare: { name: string; pct: number }[];
  stars: number;
  commits: number;
  image: string | null;
};

export function enrich(p: ProjectContent): Project {
  const repo = reposByName.get(p.slug);
  const langs = repo ? Object.entries(repo.languages) : [];
  const total = langs.reduce((s, [, v]) => s + (v as number), 0) || 1;
  return {
    ...p,
    repo,
    repoUrl: repo?.html_url ?? `https://github.com/D-L-Narayana/${p.slug}`,
    liveUrl: p.liveOverride ?? repo?.homepage ?? null,
    pushedAt: repo?.pushed_at ?? null,
    createdAt: repo?.created_at ?? null,
    language: repo?.language ?? null,
    languageShare: langs
      .map(([name, v]) => ({ name, pct: Math.round(((v as number) / total) * 1000) / 10 }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 4),
    stars: repo?.stargazers_count ?? 0,
    commits: repo?.commits ?? 0,
    image: p.hasScreenshot ? `/images/projects/${p.slug}` : null,
  };
}

export const allProjects: Project[] = projects.map(enrich);
export const featured: Project[] = allProjects.filter((p) => p.featured).sort((a, b) => (a.featured ?? 99) - (b.featured ?? 99));
export const projectBySlug = (slug: string) => allProjects.find((p) => p.slug === slug);

/** Public repos that have curated content (excludes the profile README repo). */
export const showcaseRepos = data.repos.filter((r) => r.name !== 'D-L-Narayana');

export function languageBreakdown(min = 1) {
  const total = Object.values(data.languages).reduce((s, v) => s + v, 0) || 1;
  return Object.entries(data.languages)
    .map(([name, bytes]) => ({ name, bytes, pct: (bytes / total) * 100 }))
    .filter((l) => l.pct >= min)
    .sort((a, b) => b.pct - a.pct);
}

export const stats = (() => {
  const weeks = data.activity.weeks;
  const activeWeeks = weeks.filter((w) => w.count > 0).length;
  const lastPush = showcaseRepos.map((r) => r.pushed_at).sort().at(-1) ?? null;
  return {
    publicRepos: showcaseRepos.length,
    commits: data.activity.totalCommits,
    activeWeeks,
    weeks: weeks.length,
    lastPush,
    languages: languageBreakdown().length,
    fetchedAt: data.fetchedAt,
    memberSince: data.profile.created_at,
    liveDemos: showcaseRepos.filter((r) => r.homepage).length + 1, // + VeriLens (live URL documented in its README)
  };
})();

/** Trimmed shape for the stacked home cards — only what the card renders. */
export const toStackProject = (p: Project) => ({ slug: p.slug, title: p.title, category: p.category, tagline: p.tagline, summary: p.summary, stack: p.stack.slice(0, 5), liveUrl: p.liveUrl, repoUrl: p.repoUrl, pushedAt: p.pushedAt, image: p.image, diagram: p.diagram, results: p.results.slice(0, 2) });
