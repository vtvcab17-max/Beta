<p align="center"><img src="assets/beta-ngang-nen-toi.svg" alt="Beta" height="56"></p>

<h1 align="center">Beta HQ</h1>

<p align="center"><b>Xem Beta đang làm gì, theo thời gian thực, như một trò chơi.</b><br>
Mỗi sản phẩm là một phòng, mỗi tác nhân AI là một nhân vật. Code vừa đẩy lên ở đâu, nhân vật chạy tới đó.</p>

---

## Trên trang có gì

| Phần | Lấy từ đâu | Cập nhật |
|---|---|---|
| **Bản đồ trụ sở**: 6 phòng (Bravin, Antifact, Micron, Micow, Bravinall, Sảnh Beta), phòng lên cấp theo số commit | GitHub, repo công khai của `vtvcab17-max` | Trình duyệt tự hỏi GitHub mỗi 60 giây |
| **Nhân vật**: 🤖 tác nhân AI, 🧑 con người | Commit có dòng `Claude-Session: …session_<id>` được gắn đúng cho tác nhân đó; commit không có dòng Claude là của người | Mỗi lần có commit mới |
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

Chạy thử trên máy: `python3 -m http.server 8080` rồi mở `http://localhost:8080`.

## Giới hạn

- GitHub cho mỗi người xem 60 lượt hỏi API mỗi giờ khi chưa đăng nhập. Trang hỏi 1 lần mỗi phút và dùng ETag (lượt "không có gì mới" không bị tính), nên thường không chạm giới hạn. Nếu chạm, trang báo và tự đợi.
- Chỉ thấy repo **công khai**.
- Sự kiện GitHub có thể trễ vài phút so với lúc đẩy code.

---

<p align="center">© 2026 Phạm Việt Hà · <a href="https://bravinall.vtvcab17.workers.dev/">Bravinall</a></p>
