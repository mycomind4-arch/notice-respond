/**
 * Ecosystem Orchestrator — Discovery Engine
 *
 * Reads the GitHub organization to discover repositories, branches, PRs,
 * CI status, and dependency information. Read-only — never modifies anything.
 */

import type { EcosystemManifest, RepositoryEntry } from "./types.js";

export interface DiscoveredRepo {
  id: string;
  name: string;
  fullName: string;
  private: boolean;
  fork: boolean;
  archived: boolean;
  disabled: boolean;
  language: string | null;
  sizeKB: number;
  defaultBranch: string;
  branches: BranchInfo[];
  openIssues: number;
  openPRs: number;
  recentPRs: PRInfo[];
  lastPush: string;
  createdAt: string;
  updatedAt: string;
  description: string | null;
  license: string | null;
  topics: string[];
}

export interface BranchInfo {
  name: string;
  protected: boolean;
  lastCommitSha: string;
}

export interface PRInfo {
  number: number;
  title: string;
  state: "open" | "closed" | "merged";
  author: string;
  createdAt: string;
  updatedAt: string;
  labels: string[];
}

export interface DiscoveryResult {
  repos: DiscoveredRepo[];
  organization: string;
  discoveredAt: string;
  totalRepos: number;
  ecosystemRepos: number;
  otherRepos: number;
}

export interface DiscoveryOptions {
  githubToken: string;
  organization: string;
  ecosystemRepoIds: Set<string>;
  includeOtherRepos?: boolean;
  maxPRsPerRepo?: number;
}

export class DiscoveryEngine {
  private token: string;
  private org: string;

  constructor(options: DiscoveryOptions) {
    this.token = options.githubToken;
    this.org = options.organization;
  }

  private async githubApi(path: string): Promise<unknown> {
    const url = `https://api.github.com${path}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (!res.ok) {
      throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
    }
    return res.json();
  }

  async discoverAllRepos(): Promise<DiscoveredRepo[]> {
    const repos: DiscoveredRepo[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const data = (await this.githubApi(
        `/user/repos?per_page=100&page=${page}&sort=updated&direction=desc`,
      )) as Array<Record<string, unknown>>;

      for (const repo of data) {
        repos.push(await this.discoverRepo(repo));
      }

      hasMore = data.length === 100;
      page++;
    }

    return repos;
  }

  private async discoverRepo(repoData: Record<string, unknown>): Promise<DiscoveredRepo> {
    const fullName = repoData["full_name"] as string;
    const name = repoData["name"] as string;

    // Fetch branches
    const branchData = (await this.githubApi(
      `/repos/${fullName}/branches?per_page=100`,
    )) as Array<Record<string, unknown>>;
    const branches: BranchInfo[] = branchData.map((b) => ({
      name: b["name"] as string,
      protected: b["protected"] as boolean,
      lastCommitSha: (b["commit"] as Record<string, unknown>)["sha"] as string,
    }));

    // Fetch recent PRs
    const prData = (await this.githubApi(
      `/repos/${fullName}/pulls?state=all&per_page=10&sort=updated&direction=desc`,
    )) as Array<Record<string, unknown>>;
    const recentPRs: PRInfo[] = prData.map((pr) => ({
      number: pr["number"] as number,
      title: pr["title"] as string,
      state: (pr["state"] as string) === "closed" && pr["merged_at"] !== null
        ? "merged"
        : (pr["state"] as "open" | "closed"),
      author: ((pr["user"] as Record<string, unknown>)?.["login"] as string) ?? "unknown",
      createdAt: pr["created_at"] as string,
      updatedAt: pr["updated_at"] as string,
      labels: (pr["labels"] as Array<Record<string, unknown>>).map((l) => l["name"] as string),
    }));

    return {
      id: name,
      name,
      fullName,
      private: repoData["private"] as boolean,
      fork: repoData["fork"] as boolean,
      archived: repoData["archived"] as boolean,
      disabled: repoData["disabled"] as boolean,
      language: (repoData["language"] as string) ?? null,
      sizeKB: repoData["size"] as number,
      defaultBranch: repoData["default_branch"] as string,
      branches,
      openIssues: repoData["open_issues_count"] as number,
      openPRs: recentPRs.filter((p) => p.state === "open").length,
      recentPRs,
      lastPush: repoData["pushed_at"] as string,
      createdAt: repoData["created_at"] as string,
      updatedAt: repoData["updated_at"] as string,
      description: (repoData["description"] as string) ?? null,
      license: (repoData["license"] as Record<string, unknown>)?.["spdx_id"] as string ?? null,
      topics: (repoData["topics"] as string[]) ?? [],
    };
  }

  filterEcosystemRepos(
    allRepos: DiscoveredRepo[],
    manifest: EcosystemManifest,
  ): { ecosystem: DiscoveredRepo[]; other: DiscoveredRepo[] } {
    const ecosystemRepoNames = new Set(
      manifest.repositories
        .filter((r) => r.github !== null)
        .map((r) => r.github!.split("/")[1]),
    );

    const ecosystem: DiscoveredRepo[] = [];
    const other: DiscoveredRepo[] = [];

    for (const repo of allRepos) {
      if (ecosystemRepoNames.has(repo.name)) {
        ecosystem.push(repo);
      } else if (!repo.archived && !repo.fork) {
        other.push(repo);
      }
    }

    return { ecosystem, other };
  }
}
