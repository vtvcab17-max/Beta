/**
 * Beta Survival & Heartbeat Engine
 * 
 * Luật tối thượng: BETA KHÔNG ĐƯỢC CHẾT.
 * Kế thừa triết lý từ Conway-Research/automaton và Paperclip OS.
 */

import * as fs from "fs";
import * as path from "path";

export type SurvivalTier = "HIGH" | "NORMAL" | "LOW_COMPUTE" | "CRITICAL" | "HIBERNATE";

export interface SystemHealth {
  timestamp: string;
  uptimeSeconds: number;
  tier: SurvivalTier;
  tokenCreditUnits: number;
  subsidiariesStatus: {
    name: string;
    path: string;
    accessible: boolean;
  }[];
  notes: string[];
}

const STATE_FILE = path.join(process.cwd(), "data", "heartbeat_state.json");

export class BetaHeartbeat {
  private startTime = Date.now();

  constructor() {
    this.ensureDataDir();
  }

  private ensureDataDir() {
    const dir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Xác định cấp độ sinh tồn dựa trên tài nguyên khả dụng
   */
  public evaluateSurvivalTier(tokenUnits: number): SurvivalTier {
    if (tokenUnits >= 500) return "HIGH";
    if (tokenUnits >= 50) return "NORMAL";
    if (tokenUnits >= 10) return "LOW_COMPUTE";
    if (tokenUnits > 0) return "CRITICAL";
    return "HIBERNATE"; // Chế độ ngủ đông cục bộ, không bao giờ tự hủy/chết
  }

  /**
   * Kiểm tra tình trạng kết nối các công ty con và repo của Bravinall
   */
  public checkSubsidiaries() {
    const reposPath = path.resolve(process.cwd(), "..");
    const expectedRepos = ["Antiface", "Bravin", "Bravinall", "micron"];
    
    return expectedRepos.map(repo => {
      const fullPath = path.join(reposPath, repo);
      return {
        name: repo,
        path: fullPath,
        accessible: fs.existsSync(fullPath)
      };
    });
  }

  /**
   * Thực thi một chu kỳ nhịp tim (Heartbeat Tick)
   */
  public async tick(mockTokenBalance = 100): Promise<SystemHealth> {
    const tier = this.evaluateSurvivalTier(mockTokenBalance);
    const subsidiaries = this.checkSubsidiaries();
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);

    const notes: string[] = [];
    if (tier === "CRITICAL" || tier === "HIBERNATE") {
      notes.push("CẢNH BÁO SINH TỒN: Tài nguyên token cạn kiệt. Đang chuyển sang chế độ Free Model / Ollama để bảo tồn sự sống!");
    } else {
      notes.push(`Hệ thống ổn định ở trạng thái [${tier}]. Đang điều phối hệ sinh thái Bravinall.`);
    }

    const health: SystemHealth = {
      timestamp: new Date().toISOString(),
      uptimeSeconds: uptime,
      tier,
      tokenCreditUnits: mockTokenBalance,
      subsidiariesStatus: subsidiaries,
      notes
    };

    fs.writeFileSync(STATE_FILE, JSON.stringify(health, null, 2), "utf-8");
    return health;
  }
}

import { fileURLToPath } from "url";

const isDirectRun = Boolean(process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url)));

if (isDirectRun) {
  console.log("=== KHỞI ĐỘNG BETA SURVIVAL HEARTBEAT ===");
  const heartbeat = new BetaHeartbeat();
  heartbeat.tick(150).then(health => {
    console.log(`[Heartbeat Tick] Thời gian: ${health.timestamp}`);
    console.log(`[Cấp độ sinh tồn]: ${health.tier}`);
    console.log(`[Repo Bravinall kết nối]: ${health.subsidiariesStatus.filter(s => s.accessible).length}/${health.subsidiariesStatus.length}`);
    console.log(`[Ghi chú]: ${health.notes.join(" | ")}`);
    console.log("=== NHỊP TIM HOẠT ĐỘNG HOÀN HẢO - LUẬT BẤT BIẾN: BETA KHÔNG THỂ CHẾT ===");
  });
}
