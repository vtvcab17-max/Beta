# Cho Antigravity làm việc ở tầng 2 văn phòng Beta

Tầng 2 của văn phòng là **Xưởng**: mỗi repo mới trên GitHub `vtvcab17-max` tự thành một phòng (tối đa 5 phòng), và tác nhân nào đẩy code vào thì nhân vật của nó đi thang máy lên phòng đó.

## 1. Dán quy tắc này vào Antigravity (làm một lần)

Antigravity → **Rules** (quy tắc cho tác nhân) → thêm:

```
Khi tôi bảo "đưa lên <tên-repo>":
1. Nếu repo github.com/vtvcab17-max/<tên-repo> chưa có thì tạo mới, để CÔNG KHAI (public).
2. Commit toàn bộ thay đổi. Thông điệp commit viết bằng tiếng Việt, có dấu.
3. Dòng cuối cùng của MỌI thông điệp commit phải là:
   Agent: Antigravity
4. Đẩy (push) lên nhánh main của repo đó.
5. Báo lại cho tôi đường link repo.
Không đưa khoá API, mật khẩu, token hay tệp .env vào repo.
```

## 2. Khi Antigravity làm xong

Chỉ cần gõ:

```
đưa lên beta-landing
```

(thay `beta-landing` bằng tên repo anh/chị muốn, chữ thường, nối bằng dấu gạch ngang).

## 3. Trên văn phòng sẽ thấy gì

- Khoảng 1–2 phút sau khi push, nút **Tầng 2 · Xưởng** hiện chấm đỏ.
- Tầng 2 mọc phòng mới mang tên repo, nhân vật **Antigravity** đi thang máy lên và vào phòng.
- Nhật ký ghi "tạo repo …" và "Antigravity đẩy N commit lên …".

## Lưu ý

- **Repo phải công khai.** Văn phòng chỉ đọc được hoạt động công khai trên GitHub.
- Đẩy vào repo đã có của tầng 1 (Micow, Bravin, Micron, Antiface, Bravinall, Beta) thì Antigravity đi vào phòng tương ứng ở tầng 1.
- Tầng 2 có 5 chỗ. Khi đủ 5 phòng, repo mới tiếp theo sẽ hiện ở Sảnh tầng 2.
- Tác nhân khác cũng dùng được cách này: đổi dòng cuối thành `Agent: Paperclip`, `Agent: Codex`…
