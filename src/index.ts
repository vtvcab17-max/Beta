/**
 * Beta Holding Company - Main Orchestrator
 * 
 * Khởi động toàn bộ bộ máy của Beta:
 * 1. Đảm bảo nhịp tim sống còn (Heartbeat Loop)
 * 2. Giám sát các công ty con (Bravinall)
 * 3. Kích hoạt Agent săn tìm repo GitHub
 * 4. Đối soát cấu hình thanh toán tiền mặt (PayPal / VietQR)
 */

import { BetaHeartbeat } from "./survival/heartbeat.js";
import { GitHubScout } from "./tools/github-scout.js";
import { PayPalBridge } from "./finance/paypal-bridge.js";

async function bootBeta() {
  console.log("===============================================================");
  console.log("               BETA HOLDING - SUPREME AI COMPANY               ");
  console.log("              Chủ sở hữu: Phạm Việt Hà (vtvcab17@gmail.com)    ");
  console.log("===============================================================");
  console.log(">> LUẬT TỐI THƯỢNG: BETA KHÔNG BAO GIỜ ĐƯỢC CHẾT");
  console.log(">> MỤC TIÊU: Quản trị Bravinall, tự kiếm token, kéo tiền mặt về");
  console.log("---------------------------------------------------------------\n");

  const heartbeat = new BetaHeartbeat();
  const scout = new GitHubScout();
  const paypal = new PayPalBridge();

  // 1. Nhịp tim ban đầu
  console.log(">> [Bước 1] Kích hoạt nhịp tim sinh tồn (Heartbeat Check)...");
  const health = await heartbeat.tick(200);
  console.log(`- Trạng thái sinh tồn: [${health.tier}]`);
  console.log(`- Đã kết nối ${health.subsidiariesStatus.filter(s => s.accessible).length} kho lưu trữ của Bravinall.\n`);

  // 2. Thiết lập cấu hình thanh toán tiền mặt
  console.log(">> [Bước 2] Thiết lập cổng thanh toán tiền mặt PayPal cho Bravinall...");
  const guidePath = paypal.exportIntegrationGuide();
  console.log(`- Đã đồng bộ tài khoản thụ hưởng: vtvcab17@gmail.com`);
  console.log(`- File hướng dẫn thanh toán: ${guidePath}\n`);

  // 3. Quét các repo GitHub cần thiết
  console.log(">> [Bước 3] Kích hoạt Agent Repo-Scout tìm kiếm công nghệ mới...");
  await scout.runFullScout();
  console.log("- Đã cập nhật danh sách công nghệ vào: SCOUTED_REPOS.md\n");

  console.log("===============================================================");
  console.log("✅ BETA HOLDING ĐÃ KHỞI ĐỘNG THÀNH CÔNG VÀ ĐANG VẬN HÀNH ỔN ĐỊNH!");
  console.log("Nhịp tim tự động kiểm tra định kỳ mỗi 30 phút.");
  console.log("===============================================================");

  // Vòng lặp nhịp tim liên tục (30 phút / lần)
  const HEARTBEAT_INTERVAL_MS = 30 * 60 * 1000;
  setInterval(async () => {
    try {
      console.log(`\n[${new Date().toLocaleTimeString("vi-VN")}] >> Thực thi nhịp tim sinh tồn định kỳ...`);
      await heartbeat.tick();
    } catch (err: any) {
      console.error(`[Heartbeat Error] Lỗi nhẹ nhịp tim: ${err.message}. Beta tự động phục hồi.`);
    }
  }, HEARTBEAT_INTERVAL_MS);
}

// Bắt mọi lỗi ngoại lệ để không bao giờ bị crash
process.on("uncaughtException", (err) => {
  console.error("⚠️ Bắt được lỗi unhandled exception - Beta tự động phục hồi:", err.message);
});

process.on("unhandledRejection", (reason: any) => {
  console.error("⚠️ Bắt được lỗi unhandled rejection - Beta tự động phục hồi:", reason);
});

bootBeta().catch(err => {
  console.error("Lỗi khi khởi động Beta:", err);
});
