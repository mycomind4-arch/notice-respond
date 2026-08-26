import fs from "fs";

const REPOS = [
  "mycomind4-arch/AccessForge",
  "mycomind4-arch/ai-project-hub",
  "mycomind4-arch/civic-ledger",
  "mycomind4-arch/contentforge-ai",
  "mycomind4-arch/deal-intelligence-command-center",
  "mycomind4-arch/FairProcess",
  "mycomind4-arch/ParcelProof",
];

async function gh(path) {
  const resp = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${process.env.GH_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!resp.ok) throw new Error(`${resp.status} ${path}`);
  return resp.json();
}

async function main() {
  const repos = [];

  for (const full of REPOS) {
    try {
      const d = await gh(`/repos/${full}`);

      let runs = [];
      try {
        const r = await gh(`/repos/${full}/actions/runs?per_page=5`);
        runs = r.workflow_runs || [];
      } catch {}

      let latestRelease = null;
      let releaseDate = null;
      try {
        const r = await gh(`/repos/${full}/releases/latest`);
        latestRelease = r.tag_name;
        releaseDate = r.published_at;
      } catch {}

      let languages = [];
      try {
        const l = await gh(`/repos/${full}/languages`);
        languages = Object.keys(l);
      } catch {}

      const latestRun = runs[0] || {};
      const ciStatus = latestRun.status || "none";
      const ciConclusion = latestRun.conclusion;
      let ciHealth = "unknown";
      if (ciConclusion === "success") ciHealth = "passing";
      else if (ciConclusion === "failure") ciHealth = "failing";
      else if (ciStatus === "in_progress") ciHealth = "running";
      else if (ciConclusion) ciHealth = ciConclusion;

      let score = 0;
      if (ciHealth === "passing") score += 30;
      else if (ciHealth === "running") score += 20;
      else if (ciHealth === "failing") score += 5;
      if (latestRelease) score += 20;

      let daysSinceUpdate = null;
      if (d.updated_at) {
        daysSinceUpdate = Math.floor((Date.now() - new Date(d.updated_at).getTime()) / 86400000);
        if (daysSinceUpdate <= 7) score += 20;
        else if (daysSinceUpdate <= 30) score += 15;
        else if (daysSinceUpdate <= 90) score += 10;
        else if (daysSinceUpdate <= 180) score += 5;
      }

      if (d.description) score += 10;
      if (d.topics?.length) score += 10;
      if (d.license) score += 10;

      repos.push({
        name: d.name,
        full_name: d.full_name,
        description: d.description || "",
        html_url: d.html_url,
        private: d.private,
        language: d.language || "",
        languages,
        topics: d.topics || [],
        stargazers_count: d.stargazers_count || 0,
        forks_count: d.forks_count || 0,
        open_issues_count: d.open_issues_count || 0,
        default_branch: d.default_branch || "main",
        license: d.license?.spdx_id || null,
        created_at: d.created_at,
        updated_at: d.updated_at,
        pushed_at: d.pushed_at,
        days_since_update: daysSinceUpdate,
        latest_release: latestRelease,
        release_date: releaseDate,
        ci: {
          health: ciHealth,
          status: ciStatus,
          conclusion: ciConclusion,
          workflow_name: latestRun.name,
          workflow_path: latestRun.path,
          run_id: latestRun.id,
          run_date: latestRun.created_at,
          html_url: latestRun.html_url,
        },
        health_score: score,
      });

      console.log(`  ${d.name}: score=${score} CI=${ciHealth} release=${latestRelease || "none"}`);
    } catch (e) {
      console.error(`  Error fetching ${full}: ${e.message}`);
    }
  }

  repos.sort((a, b) => b.health_score - a.health_score);

  const output = {
    generated_at: new Date().toISOString(),
    repo_count: repos.length,
    repos,
  };

  fs.writeFileSync("repos.json", JSON.stringify(output, null, 2) + "\n");
  console.log(`\nGenerated repos.json with ${repos.length} repos`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
