#!/usr/bin/env python3
"""Cập nhật du-lieu/trang-thai.json từ danh sách phiên Claude Code.

Đầu vào: JSON mà công cụ list_sessions trả về (dạng {"ccr": {"data": [...]}} hoặc {"data": [...]} hoặc [...]).
    python3 cap-nhat.py phien.json
Chỉ ghi những gì trang cần: tên việc, trạng thái, model, repo, việc gần nhất và số token.
Không ghi chi phí, không ghi đường dẫn nội bộ. Mỗi lần chạy nối thêm một điểm vào lịch sử token.
"""
import json, sys, datetime, pathlib

OUT = pathlib.Path(__file__).with_name("du-lieu") / "trang-thai.json"
PHONG = {"micow": "micow", "bravin": "bravin", "micron": "micron", "antiface": "antifact", "bravinall": "web", "beta": "hq"}
GIU_LICH_SU = 288  # điểm mỗi tác nhân (ví dụ 12 ngày nếu cập nhật mỗi giờ)


def repos_cua(s):
    ctx = s.get("session_context") or {}
    out = []
    for src in ctx.get("sources") or []:
        url = (src.get("git_repository") or {}).get("url", "")
        if url: out.append(url.rstrip("/").split("/")[-1].lower())
    for oc in ctx.get("outcomes") or []:
        r = ((oc.get("git_repository") or {}).get("git_info") or {}).get("repo", "")
        if r: out.append(r.split("/")[-1].lower())
    return list(dict.fromkeys(out))


def phong_cua(repos):
    phong = [PHONG.get(r) for r in repos if PHONG.get(r)]
    if len(set(phong)) == 1: return phong[0]
    return "hq"  # làm nhiều repo cùng lúc: đứng ở sảnh điều phối


def main(path):
    raw = json.load(open(path, encoding="utf-8"))
    data = raw.get("ccr", raw).get("data", raw) if isinstance(raw, dict) else raw
    now = datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat()
    old = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {"tac_nhan": []}
    cu = {a["id"]: a for a in old.get("tac_nhan", [])}
    ds = []
    for s in data:
        em = s.get("external_metadata") or {}
        u = em.get("usage") or {}
        ctx = em.get("context_usage") or {}
        pts = (s.get("post_turn_summary") or em.get("post_turn_summary") or {})
        repos = repos_cua(s)
        tok = {"vao": u.get("input_tokens", 0), "ra": u.get("output_tokens", 0),
               "doc_cache": u.get("cache_read_tokens", 0), "ghi_cache": u.get("cache_write_tokens", 0)}
        sid = s["id"].replace("session_", "")
        ls = (cu.get(sid) or {}).get("lich_su", [])
        diem = {"t": now, "ra": tok["ra"], "vao": tok["vao"] + tok["doc_cache"] + tok["ghi_cache"]}
        if not ls or ls[-1]["ra"] != diem["ra"] or ls[-1]["vao"] != diem["vao"]:
            ls = (ls + [diem])[-GIU_LICH_SU:]
        bucket = s.get("status_bucket", "")
        ds.append({
            "id": sid,
            "ten": s.get("title") or "Phiên chưa đặt tên",
            "trang_thai": "dang-lam" if "WORKING" in bucket or s.get("session_status") == "SESSION_STATUS_RUNNING" else "nghi",
            "model": em.get("last_served_model") or s.get("configured_model") or "",
            "repos": repos,
            "phong": phong_cua(repos),
            "viec_gan_nhat": pts.get("recent_action") or pts.get("status_detail") or "",
            "bat_dau": s.get("created_at", ""),
            "cap_nhat": s.get("updated_at", ""),
            "token": tok,
            "ngu_canh": {"dung": ctx.get("used_tokens", 0), "toi_da": ctx.get("max_tokens", 0)},
            "lich_su": ls,
        })
    ds.sort(key=lambda a: (a["trang_thai"] != "dang-lam", a["cap_nhat"]), reverse=False)
    OUT.write_text(json.dumps({"chup_luc": now, "tac_nhan": ds}, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"Đã ghi {OUT} · {len(ds)} tác nhân")


if __name__ == "__main__":
    main(sys.argv[1])
