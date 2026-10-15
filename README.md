<p align="center"><img src="assets/beta-ngang-nen-toi.svg" alt="Beta" height="56"></p>

<h1 align="center">Beta HQ & Holding Company</h1>

<p align="center"><b>Trung tâm điều hành AI thời gian thực và Hệ điều hành Doanh nghiệp Tự trị của Beta.</b><br>
<i>"Luật tối thượng: Beta KHÔNG ĐƯỢC CHẾT." &bull; Sở hữu: <b>Phạm Việt Hà</b> (vtvcab17@gmail.com)</i></p>

---

## 🎮 1. Beta HQ: Trụ Sở Gamified Thời Gian Thực
Mỗi sản phẩm là một phòng, mỗi tác nhân AI là một nhân vật. Code vừa đẩy lên ở đâu, nhân vật chạy tới đó.

| Thành phần | Nguồn dữ liệu | Chu kỳ cập nhật |
| **Văn phòng 2.5D phong cách Google (Material 3)**: 6 phòng (Bravin, Antifact, Micron, Micow, Bravinall, Sảnh Beta) có bàn, máy tính, đồ đặc trưng; phòng sáng lên khi có commit và lên cấp theo số commit | GitHub, repo công khai của `vtvcab17-max` | Trình duyệt tự hỏi GitHub mỗi 60 giây |
| **Nhân vật pixel**: 🤖 tác nhân AI đi theo hành lang tới phòng, ngồi gõ phím khi làm, ngủ gục khi nghỉ; 🧑 con người. Token tăng thật thì xu vàng bay vào bảng tổng | Commit có dòng `Claude-Session: …session_<id>` được gắn đúng cho tác nhân đó; commit không có dòng Claude là của người | Mỗi lần có commit mới |
| **Tầng 2 · Xưởng** | Dựng từ danh sách repo công khai (không giới hạn thời gian): 5 repo ngoài 6 sản phẩm được đẩy code gần nhất thành 5 phòng; phòng lâu không có code ngả xám kèm "nghỉ N ngày"; repo cũ hơn ghi ở biển Sảnh tầng 2 và tự vào phòng khi có code mới. Commit mới nhất của mỗi phòng cho biết tác nhân nào ngồi đó; repo `beta-holding` (công ty mẹ) luôn có phòng cố định; nhân vật đi thang máy ở sảnh để đổi tầng; nút chọn tầng có chấm báo hoạt động. Cách cho Antigravity làm việc ở đây: [HUONG_DAN_ANTIGRAVITY.md](HUONG_DAN_ANTIGRAVITY.md) | Mỗi lần có repo hoặc commit mới |
| **Beta Holding đang làm gì** | Đọc thẳng tệp trạng thái hệ thống Paperclip ghi vào repo `beta-holding`: nhịp tim (đang chạy hay máy đã tắt, mức sinh tồn, đơn vị token, thời gian chạy), 5 tác tử Paperclip và việc hiện tại của từng tác tử, lịch chạy tự động kèm lần chạy kế tiếp, việc treo thưởng đang nhắm, repo đã tìm. Tác tử hiện thành nhân vật ở tầng 2 (Chỉ huy, Kiểm toán ở sảnh; Sinh tồn, Săn repo, Săn thưởng trong phòng Beta Holding), lần lượt nói việc đang làm; ngủ khi nhịp tim trễ quá 75 phút. Đọc qua raw.githubusercontent nên không tính vào hạn mức 60 lượt/giờ; không hiện đường dẫn máy tính | 90 giây/lần |
| **Tác nhân khác** (Antigravity, Paperclip, Codex…) | Commit có dòng `Agent: <Tên>` ở cuối thông điệp (ví dụ `Agent: Antigravity`) thì tạo nhân vật riêng cho tác nhân đó | Mỗi lần có commit mới |
| **Thẻ tác nhân**: đang làm gì, model, token viết ra / đã đọc, ngữ cảnh đã dùng, biểu đồ token theo thời gian | Ảnh chụp các phiên Claude Code, lưu ở `du-lieu/trang-thai.json` | Mỗi khi chạy `cap-nhat.py`; trang tự đọc lại tệp mỗi phút |
| **Nhật ký**: commit, nhánh, PR, sao, phát hành | GitHub Events API | 60 giây |
| **Trạm điều khiển 2D Cockpit (`cockpit.html`)**: Sàn điều khiển Retro Canvas với âm thanh 8-bit và mô phỏng nhịp tim | Local Canvas Engine | Thời gian thực 60 FPS |

---

## 🏛️ 2. Hệ Điều Hành Tự Trị & Luật Sinh Tồn (Paperclip & Automaton)

Beta Holding là thực thể bảo trợ và chỉ đạo tối cao toàn bộ hệ sinh thái **Bravinall**:

1. **Luật Không Được Chết (Never-Die Rule):** 
   - Kế thừa từ `Conway-Research/automaton`. Phân tầng 5 cấp sinh tồn (`HIGH` $\rightarrow$ `NORMAL` $\rightarrow$ `LOW_COMPUTE` $\rightarrow$ `CRITICAL` $\rightarrow$ `HIBERNATE`).
   - Tự động chuyển đổi sang mô hình AI miễn phí/local khi thiếu token để không bao giờ dừng hoạt động.
2. **Săn tìm GitHub Repos (`src/tools/github-scout.ts`):**
   - Tự động quét GitHub API định kỳ để tìm kiếm các công nghệ mở (WebCodecs, AI Video, Canvas, WASM) và cập nhật vào `SCOUTED_REPOS.md`.
3. **Quản trị dòng tiền mặt (`src/finance/paypal-bridge.ts`):**
   - Toàn bộ doanh thu bán ứng dụng Bravinall được điều hướng trực tiếp về tài khoản cá nhân của **Phạm Việt Hà** qua PayPal (`vtvcab17@gmail.com`) và VietQR.
4. **Tự khởi động cùng máy tính (`Beta-Never-Die.bat`):**
   - Đã nạp vào Windows Startup để tự động chạy ngầm mỗi khi bật máy.

---

## 🚀 3. Bật Trang Web GitHub Pages

1. Vào GitHub &rarr; repo **[vtvcab17-max/Beta](https://github.com/vtvcab17-max/Beta)**.
2. Vào **Settings &rarr; Pages**.
3. Tại mục **Build and deployment &rarr; Branch**: chọn nhánh `main`, thư mục `/ (root)` rồi bấm **Save**.
4. Sau 1 phút, trang web game sẽ hoạt động công khai tại:
   👉 **`https://vtvcab17-max.github.io/Beta/`**

---

## 💻 4. Chạy trên máy cục bộ

```bash
# Cài đặt thư viện
npm install

# Khởi động nhịp tim sinh tồn (Heartbeat Check):
npx tsx src/survival/heartbeat.ts

# Kích hoạt Agent quét tìm repo công nghệ mới:
npx tsx src/tools/github-scout.ts

# Chạy web server xem trên máy:
python3 -m http.server 8080
# Mở trình duyệt tại: http://localhost:8080/
```

<<<<<<< HEAD
=======
Tệp chỉ giữ những gì trang cần: tên việc, trạng thái, model, repo, việc gần nhất, số token. **Không ghi chi phí.**

## Bật trang web

GitHub → repo **Beta** → **Settings → Pages** → *Source*: **Deploy from a branch**, nhánh `main`, thư mục `/ (root)` → **Save**. Sau khoảng 1 phút trang có ở `https://vtvcab17-max.github.io/Beta/`.

**Hoặc trên Cloudflare Workers** (giống Bravinall): `wrangler.jsonc` đã có sẵn: trước mỗi lần deploy chép `index.html`, `assets/`, `du-lieu/` vào `dist/` rồi chỉ đưa `dist/` lên. Cloudflare → **Workers & Pages → Create → Import a repository** → chọn repo `Beta` → Deploy command `npx wrangler deploy` → **Deploy**. Trang ở `https://beta-hq.vtvcab17.workers.dev`, tự cập nhật mỗi khi đẩy lên `main`.

Chạy thử trên máy: `python3 -m http.server 8080` rồi mở `http://localhost:8080`.

## Giới hạn

- GitHub cho mỗi người xem 60 lượt hỏi API mỗi giờ khi chưa đăng nhập. Mở trang tốn khoảng 8 lượt (commit đọc theo loạt 50 cái mỗi repo, có lưu lại), sau đó 1 lượt mỗi phút và dùng ETag (lượt "không có gì mới" không bị tính). Nếu chạm giới hạn, trang hiện dữ liệu lưu lần trước, báo giờ GitHub cho đọc lại và tự đợi.
- Chỉ thấy repo **công khai**.
- Sự kiện GitHub có thể trễ vài phút so với lúc đẩy code.

>>>>>>> 39d17bce836f4f9a42c673f1d545306f94939fac
---

<p align="center">© 2026 Phạm Việt Hà &bull; <a href="https://bravinall.vtvcab17.workers.dev/">Hệ sinh thái Bravinall</a></p>
