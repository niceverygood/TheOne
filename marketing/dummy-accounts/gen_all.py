#!/usr/bin/env python3
"""베이스 + 변형 2장을 전부 generate-face(폰 셀카 톤)로 생성.
   변형은 편집 모드(image 전달)로 동일인물 유지. 페르소나당 3장."""
import base64, json, os, ssl, urllib.request, concurrent.futures as cf

HERE = os.path.dirname(os.path.abspath(__file__))
TOKEN = open("/tmp/ai_gen_token.txt").read().strip()
URL = "https://the-one-web-virid.vercel.app/api/ai/generate-face"
CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE

# 폰 셀카 사실감 — DSLR/스튜디오/보정/보케 금지(= AI 티 제거).
REAL = (
    " . Make it look like a REAL ordinary smartphone photo: natural phone-camera quality, "
    "soft natural light, candid and unposed, real skin texture with subtle pores and minor "
    "imperfections, slightly imperfect framing. NOT a professional photoshoot, NOT studio "
    "lighting, NO shallow depth-of-field bokeh, NO editorial retouching, no glamour, no DSLR "
    "look, no beauty filter. Photorealistic, vertical 3:4. No text, no watermark."
)
EDIT_LOCK = (
    "This is the same person — keep their exact face, hair, and features identical. "
)
personas = json.load(open(os.path.join(HERE, "personas.json")))


def call(prompt, image_b64=None):
    payload = {"prompt": prompt}
    if image_b64:
        payload["image"] = image_b64
    req = urllib.request.Request(
        URL, data=json.dumps(payload).encode(), method="POST",
        headers={"content-type": "application/json", "x-gen-token": TOKEN},
    )
    with urllib.request.urlopen(req, timeout=290, context=CTX) as r:
        return json.load(r)


def do(p):
    log = []
    try:
        # 1) 베이스(신규 생성)
        d = call(p["base"] + REAL)
        b1 = base64.b64decode(d["b64"])
        open(os.path.join(HERE, f"{p['id']}-1.jpg"), "wb").write(b1)
        base_b64 = base64.b64encode(b1).decode()
        log.append("base✓")
        # 2) 변형 2장(편집 모드 — 동일인물)
        for n, key in [(2, "var1"), (3, "var2")]:
            try:
                dd = call(EDIT_LOCK + p[key] + REAL, image_b64=base_b64)
                open(os.path.join(HERE, f"{p['id']}-{n}.jpg"), "wb").write(
                    base64.b64decode(dd["b64"])
                )
                log.append(f"v{n}✓")
            except Exception as e:
                log.append(f"v{n}✗{str(e)[:40]}")
        return p["id"], " ".join(log)
    except Exception as e:
        return p["id"], f"FAIL {str(e)[:80]}"


with cf.ThreadPoolExecutor(max_workers=4) as ex:
    for pid, status in ex.map(do, personas):
        print(f"{pid}: {status}")
