# Beta Holding (Công ty tổng Beta)

> **"Luật duy nhất: Công ty không được chết."**  
> *Sở hữu & Chỉ đạo tối cao: **Phạm Việt Hà** (`vtvcab17@gmail.com`)*

Beta Holding là công ty tổng vận hành bằng AI tự trị (Autonomous Multi-Agent System), kết hợp kiến trúc từ **Conway Automaton** (ví tự trị, áp lực sinh tồn, tự kiểm soát token) và **Paperclip OS** (hệ điều hành tổ chức ảo cho công ty AI).

---

## 🏛️ Cơ cấu & Nhiệm vụ

1. **Bảo trợ & Điều phối Bravinall:**
   - Beta đứng trên đỉnh, chỉ đạo toàn bộ hệ sinh thái của công ty con **Bravinall** (`Antifact`, `Bravin`, `Micron`).
   - Phối hợp các Agent chuyên trách: `supreme-orchestrator`, `survival-monitor`, `repo-scout`, `cashflow-auditor`.

2. **Cơ chế Sinh tồn & Tiêu thụ Token (Survival Tiers):**
   - **Tự nuôi sống:** Tự động điều chỉnh mức tiêu thụ token gọi mô hình LLM.
   - **Chống sập (Self-healing):** Nếu cạn token, hệ thống tự chuyển sang chế độ `LOW_COMPUTE` hoặc mô hình local/miễn phí, tuyệt đối không bị dừng hoạt động.

3. **Săn tìm GitHub Repositories:**
   - Agent `repo-scout` tự động quét GitHub API định kỳ để tìm kiếm các giải pháp mã nguồn mở mới nhất (WebCodecs, AI Video, Computer Vision, Motion Tracking, Payment Webhooks) và cập nhật vào `SCOUTED_REPOS.md` để nạp vào hệ sinh thái.

4. **Dòng tiền mặt cho Chủ sở hữu:**
   - Mọi doanh thu bán bản quyền ứng dụng Bravinall được điều chuyển trực tiếp về tài khoản cá nhân của **Phạm Việt Hà** thông qua PayPal (`vtvcab17@gmail.com`) và VietQR tự động.

---

## 🚀 Khởi chạy hệ thống

### Yêu cầu:
- Node.js (v18+)
- pnpm hoặc npm

### Lệnh thực thi:
```bash
# Cài đặt thư viện
npm install

# Khởi động nhịp tim sinh tồn (Heartbeat Check)
npm run heartbeat

# Kích hoạt Agent quét GitHub Repo
npm run scout

# Khởi động toàn bộ bộ máy Beta
npm start
```

---

## 📂 Cấu trúc thư mục

```
Beta/
├── COMPANY.md                  # Hồ sơ công ty tổng theo chuẩn Paperclip
├── .paperclip.yaml             # Khung cấu hình các Agent và Routines
├── SCOUTED_REPOS.md            # Danh sách repo GitHub do Beta tự săn tìm
├── PAYMENT_INTEGRATION.md      # Hướng dẫn tích hợp thanh toán tiền mặt PayPal
├── src/
│   ├── index.ts                # Bộ điều phối chính (Supreme Orchestrator)
│   ├── survival/
│   │   └── heartbeat.ts        # Động cơ nhịp tim & kiểm soát mức sinh tồn
│   ├── tools/
│   │   └── github-scout.ts     # Công cụ tự động quét GitHub API
│   └── finance/
│       └── paypal-bridge.ts    # Cầu nối thanh toán tiền mặt về tài khoản cá nhân
└── data/                       # Lưu trữ trạng thái nhịp tim và giao dịch
```
