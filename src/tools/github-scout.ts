/**
 * GitHub Scout Agent Tool
 * 
 * Tự động tìm kiếm, sàng lọc và đánh giá các kho lưu trữ GitHub mã nguồn mở
 * phục vụ cho việc nâng cấp Bravin, Antifact và Micron.
 */

import * as fs from "fs";
import * as path from "path";

export interface RepoCandidate {
  name: string;
  fullName: string;
  url: string;
  description: string;
  stars: number;
  license: string;
  category: "VIDEO_ENGINE" | "MOTION_TRACKING" | "AI_CANVAS" | "PAYMENT_TOOL" | "AGENT_FRAMEWORK";
}

export class GitHubScout {
  private outputDir = path.join(process.cwd(), "data");

  constructor() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Danh mục tìm kiếm trọng tâm cho hệ sinh thái Bravinall
   */
  public getSearchTopics(): { query: string; category: RepoCandidate["category"] }[] {
    return [
      { query: "webcodecs video editor wasm", category: "VIDEO_ENGINE" },
      { query: "motion tracking js computer vision perspective", category: "MOTION_TRACKING" },
      { query: "canvas node based editor react flow", category: "AI_CANVAS" },
      { query: "autonomous agent survival heartbeat", category: "AGENT_FRAMEWORK" },
      { query: "paypal webhook nodejs checkout", category: "PAYMENT_TOOL" }
    ];
  }

  /**
   * Tìm kiếm qua GitHub REST API
   */
  public async searchGitHub(query: string, category: RepoCandidate["category"]): Promise<RepoCandidate[]> {
    try {
      const endpoint = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=3`;
      const response = await fetch(endpoint, {
        headers: {
          "User-Agent": "Beta-Scout-Agent/1.0"
        }
      });

      if (!response.ok) {
        console.warn(`[GitHub API Warning] Lỗi HTTP ${response.status} khi tìm kiếm: "${query}"`);
        return [];
      }

      const data = (await response.json()) as any;
      if (!data.items) return [];

      return data.items.map((item: any) => ({
        name: item.name,
        fullName: item.full_name,
        url: item.html_url,
        description: item.description || "Không có mô tả",
        stars: item.stargazers_count,
        license: item.license ? item.license.spdx_id : "Unspecified",
        category
      }));
    } catch (err: any) {
      console.error(`[Scout Error] Không thể kết nối GitHub API: ${err.message}`);
      return [];
    }
  }

  /**
   * Quét toàn bộ và tạo báo cáo
   */
  public async runFullScout(): Promise<RepoCandidate[]> {
    const topics = this.getSearchTopics();
    const allCandidates: RepoCandidate[] = [];

    console.log("🔍 Đang tiến hành quét các GitHub Repo cần thiết cho hệ sinh thái Bravinall...");
    for (const topic of topics) {
      console.log(`- Đang quét chủ đề [${topic.category}]: "${topic.query}"...`);
      const results = await this.searchGitHub(topic.query, topic.category);
      allCandidates.push(...results);
      // Chờ nhẹ để tránh rate-limit API
      await new Promise(r => setTimeout(r, 1200));
    }

    // Lưu kết quả JSON
    const jsonPath = path.join(this.outputDir, "scouted_repos.json");
    fs.writeFileSync(jsonPath, JSON.stringify(allCandidates, null, 2), "utf-8");

    // Xuất báo cáo Markdown
    this.generateMarkdownReport(allCandidates);
    return allCandidates;
  }

  private generateMarkdownReport(repos: RepoCandidate[]) {
    const mdPath = path.join(process.cwd(), "SCOUTED_REPOS.md");
    let content = `# Danh sách GitHub Repositories được Beta tuyển chọn\n\n`;
    content += `*Cập nhật lúc: ${new Date().toLocaleString("vi-VN")}*\n\n`;
    content += `Danh sách các công nghệ mã nguồn mở được Agent Scout tìm kiếm nhằm tích hợp vào Bravin, Antifact và Micron:\n\n`;

    const categories = ["VIDEO_ENGINE", "MOTION_TRACKING", "AI_CANVAS", "AGENT_FRAMEWORK", "PAYMENT_TOOL"] as const;

    for (const cat of categories) {
      const items = repos.filter(r => r.category === cat);
      content += `### 📂 Phân loại: ${cat}\n\n`;
      if (items.length === 0) {
        content += `*Chưa có repo nào trong lượt quét này.*\n\n`;
        continue;
      }
      for (const item of items) {
        content += `- **[${item.fullName}](${item.url})** (⭐ ${item.stars.toLocaleString()} | License: ${item.license})\n`;
        content += `  - *Mô tả:* ${item.description}\n`;
      }
      content += `\n`;
    }

    fs.writeFileSync(mdPath, content, "utf-8");
    console.log(`✅ Đã xuất báo cáo repo vào: ${mdPath}`);
  }
}

import { fileURLToPath } from "url";

const isDirectRun = Boolean(process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url)));

if (isDirectRun) {
  const scout = new GitHubScout();
  scout.runFullScout().then(repos => {
    console.log(`🎯 Quét hoàn tất: Tìm thấy ${repos.length} repo tiềm năng sẵn sàng đưa vào vận hành!`);
  });
}

