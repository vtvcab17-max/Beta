/**
 * GitHub Bounty Hunter Tool for Beta Holding
 * 
 * Tự động quét và săn tìm các Issue có gắn tiền thưởng (Bounty / Cash / USDC)
 * trên GitHub (thông qua Algora, Polar, IssueHunt, Gitcoin và nhãn bounty)
 * để các tác nhân AI của Beta nhận việc, giải quyết và kiếm tiền/token.
 */

import * as fs from "fs";
import * as path from "path";

export interface BountyIssue {
  id: number;
  title: string;
  url: string;
  repo: string;
  labels: string[];
  rewardEstimated: string;
  languageMatch: string;
  createdDate: string;
  state: string;
  suitabilityScore: number; // 0 - 100
}

export class BountyHunter {
  private outputDir = path.join(process.cwd(), "data");

  constructor() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Truy vấn tìm kiếm các Issue có thưởng tiền phù hợp với năng lực kỹ thuật của Beta
   */
  public getSearchQueries(): { query: string; tech: string }[] {
    return [
      { query: 'is:issue is:open label:bounty language:TypeScript sort:created-desc', tech: 'TypeScript' },
      { query: 'is:issue is:open label:bounty language:JavaScript sort:created-desc', tech: 'JavaScript' },
      { query: 'is:issue is:open "algora" is:open sort:created-desc', tech: 'Algora / Web3' },
      { query: 'is:issue is:open label:"good first issue" "reward" sort:created-desc', tech: 'OpenSource / Tools' },
      { query: 'is:issue is:open label:funded sort:created-desc', tech: 'Funded Issues' }
    ];
  }

  /**
   * Trích xuất ước tính số tiền thưởng từ tiêu đề hoặc nhãn (Label)
   */
  public extractReward(title: string, labels: string[], body = ""): string {
    const combined = `${title} ${labels.join(" ")} ${body.substring(0, 500)}`;
    const dollarMatch = combined.match(/\$(\d+[\d,]*)/);
    if (dollarMatch) return `$${dollarMatch[1]}`;

    const usdcMatch = combined.match(/(\d+[\d,]*)\s*USDC/i);
    if (usdcMatch) return `${usdcMatch[1]} USDC`;

    const ethMatch = combined.match(/(\d*\.?\d+)\s*ETH/i);
    if (ethMatch) return `${ethMatch[1]} ETH`;

    // Nhãn chứa bounty dạng bounty:50 hoặc $50
    for (const lbl of labels) {
      if (lbl.includes("$") || lbl.toLowerCase().includes("bounty")) {
        return lbl;
      }
    }

    return "Thỏa thuận / Theo task";
  }

  /**
   * Tìm kiếm qua GitHub API công khai
   */
  public async searchGitHubBounties(query: string, tech: string): Promise<BountyIssue[]> {
    try {
      const endpoint = `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&per_page=6`;
      const res = await fetch(endpoint, {
        headers: {
          "User-Agent": "Beta-Bounty-Hunter-Agent/1.0"
        }
      });

      if (!res.ok) {
        console.warn(`[Bounty Hunter Warning] Lỗi API HTTP ${res.status} cho query: "${query}"`);
        return [];
      }

      const data = (await res.json()) as any;
      if (!data.items) return [];

      return data.items.map((item: any) => {
        const repoUrlParts = item.repository_url.split("/");
        const repoName = `${repoUrlParts[repoUrlParts.length - 2]}/${repoUrlParts[repoUrlParts.length - 1]}`;
        const labels = (item.labels || []).map((l: any) => l.name);
        const reward = this.extractReward(item.title, labels, item.body || "");

        // Tính điểm phù hợp dựa trên tech stack của Beta (TS, Node, Web, Video, Canvas)
        let score = 70;
        const lowerTitle = item.title.toLowerCase();
        if (lowerTitle.includes("fix") || lowerTitle.includes("bug")) score += 10;
        if (lowerTitle.includes("canvas") || lowerTitle.includes("ui") || lowerTitle.includes("video")) score += 15;
        if (reward.startsWith("$") && !reward.includes("Thỏa thuận")) score += 10;

        return {
          id: item.id,
          title: item.title,
          url: item.html_url,
          repo: repoName,
          labels,
          rewardEstimated: reward,
          languageMatch: tech,
          createdDate: item.created_at,
          state: item.state,
          suitabilityScore: Math.min(100, score)
        };
      });
    } catch (err: any) {
      console.error(`[Bounty Hunter Error] Lỗi kết nối: ${err.message}`);
      return [];
    }
  }

  /**
   * Chạy toàn bộ tiến trình quét việc có thưởng
   */
  public async runHunt(): Promise<BountyIssue[]> {
    const queries = this.getSearchQueries();
    const allBounties: BountyIssue[] = [];
    const seenIds = new Set<number>();

    console.log("🎯 [Bounty Hunter] Đang quét các công việc có tiền thưởng (Bounties) trên GitHub...");

    for (const q of queries) {
      console.log(`- Đang tìm kiếm hạng mục [${q.tech}]...`);
      const results = await this.searchGitHubBounties(q.query, q.tech);
      for (const item of results) {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          allBounties.push(item);
        }
      }
      await new Promise(r => setTimeout(r, 1200)); // Tránh rate-limit
    }

    // Sắp xếp theo điểm phù hợp
    allBounties.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

    // Ghi file JSON
    const jsonPath = path.join(this.outputDir, "active_bounties.json");
    fs.writeFileSync(jsonPath, JSON.stringify(allBounties, null, 2), "utf-8");

    // Xuất báo cáo Markdown
    this.generateMarkdownReport(allBounties);
    return allBounties;
  }

  private generateMarkdownReport(bounties: BountyIssue[]) {
    const mdPath = path.join(process.cwd(), "BOUNTY_TARGETS.md");
    let content = `# Danh Sách Công Việc Có Thưởng (GitHub Bounties) Cho Beta\n\n`;
    content += `*Cập nhật lúc: ${new Date().toLocaleString("vi-VN")}*\n`;
    content += `*Tác tử phụ trách: Bounty-Hunter & Supreme-Orchestrator*\n`;
    content += `*Tài khoản nhận tiền thưởng: Phạm Việt Hà (PayPal: vtvcab17@gmail.com / Ví On-chain)*\n\n`;
    content += `Dưới đây là các cơ hội giải quyết issue nhận thưởng USD/Token từ các dự án mã nguồn mở quốc tế:\n\n`;

    content += `| Điểm phù hợp | Tiền thưởng ước tính | Kho lưu trữ (Repo) | Tiêu đề Issue & Link | Ngôn ngữ |\n`;
    content += `| :---: | :---: | :--- | :--- | :---: |\n`;

    for (const b of bounties.slice(0, 15)) {
      const scoreBadge = b.suitabilityScore >= 85 ? `🟢 ${b.suitabilityScore}%` : `🟡 ${b.suitabilityScore}%`;
      const cleanTitle = b.title.replace(/\|/g, "-");
      content += `| ${scoreBadge} | **${b.rewardEstimated}** | \`${b.repo}\` | [${cleanTitle}](${b.url}) | \`${b.languageMatch}\` |\n`;
    }

    content += `\n---\n`;
    content += `### 💡 Quy trình AI Tác tử nhận thưởng:\n`;
    content += `1. **Phân tích:** Dev Agent đọc kỹ mô tả issue và mã nguồn repo mục tiêu.\n`;
    content += `2. **Tạo giải pháp:** Viết mã sửa lỗi hoặc tính năng mới trong nhánh cục bộ và chạy test kiểm chứng.\n`;
    content += `3. **Gửi Pull Request:** Mở PR kèm giải trình chi tiết theo chuẩn của repo đích.\n`;
    content += `4. **Nhận thưởng:** Khi PR được Merge, tiền thưởng được chuyển tự động về PayPal \`vtvcab17@gmail.com\` hoặc ví token của Beta.\n`;

    fs.writeFileSync(mdPath, content, "utf-8");
    console.log(`✅ [Bounty Hunter] Đã tạo báo cáo cơ hội kiếm tiền tại: ${mdPath}`);
  }
}

// Chạy trực tiếp nếu gọi từ command line
import { fileURLToPath } from "url";
const isDirectRun = Boolean(process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url)));

if (isDirectRun) {
  const hunter = new BountyHunter();
  hunter.runHunt().then(bounties => {
    console.log(`🏆 [Bounty Hunter] Hoàn tất! Phát hiện ${bounties.length} cơ hội nhận thưởng tiền mặt & token.`);
  });
}
