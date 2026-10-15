<p align="center"><img src="assets/beta-ngang-nen-toi.svg" alt="Beta" height="56"></p>

<h1 align="center">Beta HQ</h1>

<p align="center"><b>Xem Beta đang làm gì, theo thời gian thực, như một trò chơi.</b><br>
Mỗi sản phẩm là một phòng, mỗi tác nhân AI là một nhân vật. Code vừa đẩy lên ở đâu, nhân vật chạy tới đó.</p>

---

## Trên trang có gì

| Phần | Lấy từ đâu | Cập nhật |
|---|---|---|
| **Văn phòng 2.5D phong cách Google (Material 3)**: 6 phòng (Bravin, Antifact, Micron, Micow, Bravinall, Sảnh Beta) có bàn, máy tính, đồ đặc trưng; phòng sáng lên khi có commit và lên cấp theo số commit | GitHub, repo công khai của `vtvcab17-max` | Trình duyệt tự hỏi GitHub mỗi 60 giây |
| **Nhân vật pixel**: 🤖 tác nhân AI đi theo hành lang tới phòng, ngồi gõ phím khi làm, ngủ gục khi nghỉ; 🧑 con người. Token tăng thật thì xu vàng bay vào bảng tổng | Commit có dòng `Claude-Session: …session_<id>` được gắn đúng cho tác nhân đó; commit không có dòng Claude là của người | Mỗi lần có commit mới |
| **Tầng 2 · Xưởng** | Dựng từ danh sách repo công khai (không giới hạn thời gian): 5 repo ngoài 6 sản phẩm được đẩy code gần nhất thành 5 phòng; phòng lâu không có code ngả xám kèm "nghỉ N ngày"; repo cũ hơn ghi ở biển Sảnh tầng 2 và tự vào phòng khi có code mới. Commit mới nhất của mỗi phòng cho biết tác nhân nào ngồi đó; repo `beta-holding` (công ty mẹ) luôn có phòng cố định; nhân vật đi thang máy ở sảnh để đổi tầng; nút chọn tầng có chấm báo hoạt động. Cách cho Antigravity làm việc ở đây: [HUONG_DAN_ANTIGRAVITY.md](HUONG_DAN_ANTIGRAVITY.md) | Mỗi lần có repo hoặc commit mới |
| **Tác nhân khác** (Antigravity, Paperclip, Codex…) | Commit có dòng `Agent: <Tên>` ở cuối thông điệp (ví dụ `Agent: Antigravity`) thì tạo nhân vật riêng cho tác nhân đó | Mỗi lần có commit mới |
| **Thẻ tác nhân**: đang làm gì, model, token viết ra / đã đọc, ngữ cảnh đã dùng, biểu đồ token theo thời gian | Ảnh chụp các phiên Claude Code, lưu ở `du-lieu/trang-thai.json` | Mỗi khi chạy `cap-nhat.py`; trang tự đọc lại tệp mỗi phút |
| **Nhật ký**: commit, nhánh, PR, sao, phát hành | GitHub Events API | 60 giây |

Số liệu đều là thật. Trang không tự bịa số: chỗ nào chưa có dữ liệu thì hiện "–".

## Cập nhật số token

Dữ liệu phiên Claude chỉ đọc được từ bên trong một phiên Claude Code (công cụ `list_sessions`), nên trang công khai không tự lấy được. Một tác nhân lưu kết quả `list_sessions` ra tệp JSON rồi chạy:

```bash
python3 cap-nhat.py phien.json      # ghi du-lieu/trang-thai.json, nối thêm một điểm vào lịch sử token
git add du-lieu/trang-thai.json && git commit -m "HQ: cập nhật trạng thái tác nhân" && git push
```

Tệp chỉ giữ những gì trang cần: tên việc, trạng thái, model, repo, việc gần nhất, số token. **Không ghi chi phí.**

## Bật trang web

GitHub → repo **Beta** → **Settings → Pages** → *Source*: **Deploy from a branch**, nhánh `main`, thư mục `/ (root)` → **Save**. Sau khoảng 1 phút trang có ở `https://vtvcab17-max.github.io/Beta/`.

**Hoặc trên Cloudflare Workers** (giống Bravinall): `wrangler.jsonc` đã có sẵn: trước mỗi lần deploy chép `index.html`, `assets/`, `du-lieu/` vào `dist/` rồi chỉ đưa `dist/` lên. Cloudflare → **Workers & Pages → Create → Import a repository** → chọn repo `Beta` → Deploy command `npx wrangler deploy` → **Deploy**. Trang ở `https://beta-hq.vtvcab17.workers.dev`, tự cập nhật mỗi khi đẩy lên `main`.

Chạy thử trên máy: `python3 -m http.server 8080` rồi mở `http://localhost:8080`.

## Giới hạn

- GitHub cho mỗi người xem 60 lượt hỏi API mỗi giờ khi chưa đăng nhập. Trang hỏi 1 lần mỗi phút và dùng ETag (lượt "không có gì mới" không bị tính), nên thường không chạm giới hạn. Nếu chạm, trang báo và tự đợi.
- Chỉ thấy repo **công khai**.
- Sự kiện GitHub có thể trễ vài phút so với lúc đẩy code.

---

<p align="center">© 2026 Phạm Việt Hà · <a href="https://bravinall.vtvcab17.workers.dev/">Bravinall</a></p>
