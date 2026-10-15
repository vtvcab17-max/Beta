/**
 * Sovereign AI Agent Wallet Generator & Manager
 * 
 * Tạo và quản lý ví Web3 tự trị cho Beta Holding (chuẩn Conway Automaton).
 * Cho phép Beta tự nhận thưởng, tự trả phí compute và quản lý dòng vốn on-chain.
 */

import * as fs from "fs";
import * as path from "path";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

export interface WalletIdentity {
  name: string;
  address: string;
  chain: string;
  chainId: number; // Base Mainnet = 8453
  createdAt: string;
}

export class BetaWalletManager {
  private dataDir = path.join(process.cwd(), "data");
  private secureWalletFile = path.join(process.cwd(), "data", "wallet_secure.json");
  private publicWalletFile = path.join(process.cwd(), "data", "wallet_public.json");

  constructor() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  /**
   * Khởi tạo hoặc tải ví tự trị của Beta
   */
  public getOrCreateWallet(): { address: string; isNew: boolean } {
    if (fs.existsSync(this.secureWalletFile)) {
      try {
        const raw = fs.readFileSync(this.secureWalletFile, "utf-8");
        const data = JSON.parse(raw);
        return { address: data.address, isNew: false };
      } catch (e) {}
    }

    // Tự sinh cặp khóa mới độc lập cho Beta
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    const now = new Date().toISOString();

    const secureData = {
      name: "Beta Autonomous Sovereign Core",
      address: account.address,
      privateKey,
      chain: "Base",
      chainId: 8453,
      createdAt: now
    };

    // Lưu khóa bí mật cục bộ (được .gitignore bảo vệ tuyệt đối)
    fs.writeFileSync(this.secureWalletFile, JSON.stringify(secureData, null, 2), "utf-8");

    // Xuất thông tin công khai (không chứa private key)
    const publicData: WalletIdentity = {
      name: "Beta Autonomous Sovereign Core",
      address: account.address,
      chain: "Base (Coinbase L2)",
      chainId: 8453,
      createdAt: now
    };
    fs.writeFileSync(this.publicWalletFile, JSON.stringify(publicData, null, 2), "utf-8");

    return { address: account.address, isNew: true };
  }
}

// Chạy trực tiếp
import { fileURLToPath } from "url";
const isDirectRun = Boolean(process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url)));

if (isDirectRun) {
  const manager = new BetaWalletManager();
  const res = manager.getOrCreateWallet();
  console.log("===============================================================");
  console.log("       VÍ WEB3 TỰ TRỊ CỦA BETA (SOVEREIGN AGENT WALLET)        ");
  console.log("===============================================================");
  console.log(`- Trạng thái: ${res.isNew ? "Vừa tạo mới" : "Đã kích hoạt sẵn"}`);
  console.log(`- Địa chỉ ví công khai: ${res.address}`);
  console.log(`- Mạng lưới tối ưu: BASE (ChainID 8453)`);
  console.log(`- Chuẩn: ERC-8004 Sovereign Agent Ready`);
  console.log("===============================================================");
}
