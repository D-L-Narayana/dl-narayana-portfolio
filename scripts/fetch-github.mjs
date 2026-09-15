// Build-time GitHub harvest. Public data only. Uses GITHUB_TOKEN from the environment when present
// (never written anywhere); falls back to unauthenticated calls. Writes src/data/github.json.
import fs from 'node:fs';
import path from 'node:path';

const USER = 'D-L-Narayana';
const OUT = path.resolve('src/data/github.json');
const token = process.env.GITHUB_TOKEN;
const headers = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'dl-narayana-portfolio-build' };
if (token) headers.Authorization = `Bearer ${token}`;

async function api(p) {
  const res = await fetch(`https://api.github.com${p}`, { headers });
  if (!res.ok) throw new Error(`${p} -> ${res.status}`);
  return res.json();
}
async function paged(p) {
  const all = [];
  for (let page = 1; page < 20; page++) {
    const chunk = await api(`${p}${p.includes('?') ? '&' : '?'}per_page=100&page=${page}`);
    all.push(...chunk);
    if (chunk.length < 100) break;
  }
  return all;
}

try {
  const profile = await api(`/users/${USER}`);
  const repos = (await paged(`/users/${USER}/repos?type=owner&sort=updated`)).filter((r) => !r.fork && !r.private);
  const out = {
    fetchedAt: new Date().toISOString(),
    profile: {
      login: profile.login, name: profile.name, location: profile.location, html_url: profile.html_url,
      avatar_url: profile.avatar_url, public_repos: profile.public_repos, followers: profile.followers,
      following: profile.following, created_at: profile.created_at,
    },
    repos: [], activity: { weeks: [], totalCommits: 0, firstCommit: null, lastCommit: null }, languages: {},
  };
  const langTotals = {};
  const commitDates = [];
  for (const r of repos) {
    const languages = await api(`/repos/${USER}/${r.name}/languages`).catch(() => ({}));
    for (const [k, v] of Object.entries(languages)) langTotals[k] = (langTotals[k] || 0) + v;
    const commits = await paged(`/repos/${USER}/${r.name}/commits?`).catch(() => []);
    const human = commits.filter((c) => !(c.author?.type === 'Bot' || /\[bot\]$/.test(c.author?.login || '') || /\[bot\]/.test(c.commit?.author?.name || '')));
    for (const c of human) commitDates.push(c.commit.author.date);
    out.repos.push({
      name: r.name, description: r.description, html_url: r.html_url, homepage: r.homepage || null,
      language: r.language, languages, topics: r.topics || [], stargazers_count: r.stargazers_count,
      forks_count: r.forks_count, created_at: r.created_at, pushed_at: r.pushed_at, size: r.size,
      license: r.license?.spdx_id || null, commits: human.length, default_branch: r.default_branch,
    });
    console.log('repo', r.name, 'commits', human.length);
  }
  out.languages = langTotals;
  // 26 weekly buckets ending this week (Mon-start weeks)
  const now = new Date();
  const day = (now.getUTCDay() + 6) % 7; // Mon=0
  const thisMonday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - day));
  const weeks = [];
  for (let i = 25; i >= 0; i--) {
    const start = new Date(thisMonday.getTime() - i * 7 * 86400000);
    weeks.push({ start: start.toISOString().slice(0, 10), count: 0 });
  }
  for (const d of commitDates) {
    const t = new Date(d).getTime();
    for (const w of weeks) {
      const s = new Date(w.start).getTime();
      if (t >= s && t < s + 7 * 86400000) { w.count++; break; }
    }
  }
  commitDates.sort();
  out.activity = { weeks, totalCommits: commitDates.length, firstCommit: commitDates[0] || null, lastCommit: commitDates.at(-1) || null };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.log(`wrote ${OUT}: ${out.repos.length} repos, ${out.activity.totalCommits} human commits`);
} catch (e) {
  console.error('GitHub fetch failed:', e.message);
  if (fs.existsSync(OUT)) { console.error('keeping existing snapshot'); process.exit(0); }
  process.exit(1);
}
