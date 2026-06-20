#!/usr/bin/env python3
"""시드 7명을 프로덕션(/api/admin/seed-member)으로 업로드. 회원당 1건(사진 data URI)."""
import base64, json, os, ssl, time, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
TOKEN = open("/tmp/ai_gen_token.txt").read().strip()
BASE = "https://the-one-web-virid.vercel.app/api/admin/seed-member"
CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE
IDS = ["m1", "m2", "f1", "f2", "f3", "f4", "f5"]


def photos(pid):
    out = []
    for n in (1, 2, 3):
        f = os.path.join(HERE, f"{pid}-{n}.jpg")
        if os.path.exists(f):
            out.append("data:image/jpeg;base64," + base64.b64encode(open(f, "rb").read()).decode())
    return out


def req(method, body=None):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(
        BASE, data=data, method=method,
        headers={"content-type": "application/json", "x-gen-token": TOKEN},
    )
    with urllib.request.urlopen(r, timeout=60, context=CTX) as resp:
        return json.load(resp)


# 배포 반영 대기 — GET 이 200(ok) 나올 때까지
print("배포 반영 대기…")
for i in range(20):
    try:
        d = req("GET")
        if d.get("ok"):
            print(f"  라우트 활성. 현재 seed_ {d.get('count')}명")
            break
    except Exception as e:
        print(f"  대기 {i}: {str(e)[:60]}")
        time.sleep(12)

# 업로드
for pid in IDS:
    ph = photos(pid)
    try:
        d = req("POST", {"id": pid, "photos": ph})
        m = d.get("member", {})
        print(f"  ✓ {pid}: {m.get('email')} {m.get('jobDetail')} 사진{m.get('photos')}장" if d.get("ok") else f"  ✗ {pid}: {d}")
    except Exception as e:
        print(f"  ✗ {pid}: {str(e)[:80]}")

# 검증
final = req("GET")
print(f"\n프로덕션 seed_ 총 {final.get('count')}명:")
for m in final.get("members", []):
    print(f"  - {m['email']} | {m['gender']} | {m['jobDetail']} | 사진{m['photos']} 뱃지{m['badges']}")
