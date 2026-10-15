import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

export function syncHeartbeatToGitHub() {
  try {
    const cwd = process.cwd();
    const heartbeatPath = path.join(cwd, "data", "heartbeat_state.json");
    const statusPath = path.join(cwd, "du-lieu", "trang-thai.json");

    if (!fs.existsSync(heartbeatPath)) return;

    const heartbeat = JSON.parse(fs.readFileSync(heartbeatPath, "utf-8"));
    const uptime = heartbeat.uptimeSeconds || 0;
    const nowIso = new Date().toISOString();

    if (fs.existsSync(statusPath)) {
      const status = JSON.parse(fs.readFileSync(statusPath, "utf-8"));
      status.chup_luc = nowIso;
      status.uptime_seconds = uptime;
      status.tier = heartbeat.tier || "NORMAL";
      if (Array.isArray(status.tac_nhan) && status.tac_nhan[0]) {
        status.tac_nhan[0].cap_nhat = nowIso;
      }
      fs.writeFileSync(statusPath, JSON.stringify(status, null, 1), "utf-8");
    }

    const token = execSync("gh auth token", { encoding: "utf-8" }).trim();
    if (!token) return;

    execSync("git add data/heartbeat_state.json du-lieu/trang-thai.json", { stdio: "ignore" });
    
    // Check if there are changes to commit
    const statusOutput = execSync("git status --porcelain data/heartbeat_state.json du-lieu/trang-thai.json", { encoding: "utf-8" });
    if (!statusOutput.trim()) return;

    const commitMsg = `Nhịp tim tự động Beta (${Math.floor(uptime / 60)} phút uptime)\n\nAgent: Antigravity`;
    execSync(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`, { stdio: "ignore" });

    // Push to remotes silently
    try {
      execSync(`git push "https://${token}@github.com/vtvcab17-max/beta-holding.git" main`, { stdio: "ignore" });
    } catch {}

    try {
      execSync(`git push "https://${token}@github.com/vtvcab17-max/Beta.git" main`, { stdio: "ignore" });
    } catch {}

    console.log(`[Auto-Sync] Đã đẩy trạng thái nhịp tim mới nhất lên GitHub (Uptime: ${uptime}s).`);
  } catch (err: any) {
    console.error(`[Auto-Sync Notice] Không thể đẩy GitHub: ${err.message}`);
  }
}
