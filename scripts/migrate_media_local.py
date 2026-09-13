#!/usr/bin/env python3
"""One-shot: pull product images + hero video out of the Shopify CDN and into
public/, rewriting data/products.json to local paths. Source = the offline
scrape at ../site rep of shopify/. Idempotent: safe to re-run."""
import json, os, re, shutil, subprocess, sys
from urllib.parse import urlparse, parse_qs

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRAPE = os.path.normpath(os.path.join(ROOT, "..", "site rep of shopify", "biw.salon"))
FILES = os.path.join(SCRAPE, "cdn", "shop", "files")
PUB_PRODUCTS = os.path.join(ROOT, "public", "products")
PRODUCTS_JSON = os.path.join(ROOT, "data", "products.json")

os.makedirs(PUB_PRODUCTS, exist_ok=True)

def scraped_variants(base_name, v):
    """All scraped files for <base_name>?v=<v>[&width=N] -> [(width, path)]."""
    out = []
    for fn in os.listdir(FILES):
        # filenames are literal: "NAME.jpg?v=123&width=940" or "NAME.jpg?v=123"
        if not fn.startswith(base_name + "?"):
            continue
        q = parse_qs(fn.split("?", 1)[1])
        if v and q.get("v", [None])[0] != v:
            continue
        width = int(q["width"][0]) if "width" in q else 10**9  # no width = original
        out.append((width, os.path.join(FILES, fn)))
    return sorted(out)  # ascending; last = biggest / original

def pick_best(base_name, v):
    variants = scraped_variants(base_name, v)
    if not variants and v:  # fall back: ignore the v filter
        variants = scraped_variants(base_name, None)
    return variants[-1][1] if variants else None

def main():
    products = json.load(open(PRODUCTS_JSON))
    copied, missing, nulls = 0, [], 0
    for p in products:
        img = p.get("image")
        if not img:
            nulls += 1
            continue
        path = urlparse(img).path            # /cdn/shop/files/NAME.jpg
        base_name = os.path.basename(path)   # NAME.jpg
        v = parse_qs(urlparse(img).query).get("v", [None])[0]
        src = pick_best(base_name, v)
        if not src:
            missing.append((p["handle"], base_name))
            continue
        dst = os.path.join(PUB_PRODUCTS, base_name)
        shutil.copyfile(src, dst)
        p["image"] = f"/products/{base_name}"
        copied += 1

    json.dump(products, open(PRODUCTS_JSON, "w"), ensure_ascii=False, indent=2)
    print(f"products: copied {copied}, null-left {nulls}, missing {len(missing)}")
    for h, n in missing:
        print("  MISSING", h, n)

    # collection_cards.json — same CDN rewrite
    cc_path = os.path.join(ROOT, "data", "collection_cards.json")
    if os.path.exists(cc_path):
        cards = json.load(open(cc_path))
        cc_copied, cc_missing = 0, []
        for c in cards:
            img = c.get("image")
            if not img or not img.startswith("http"):
                continue
            base_name = os.path.basename(urlparse(img).path)
            v = parse_qs(urlparse(img).query).get("v", [None])[0]
            src = pick_best(base_name, v)
            if not src:
                cc_missing.append(base_name); continue
            shutil.copyfile(src, os.path.join(PUB_PRODUCTS, base_name))
            c["image"] = f"/products/{base_name}"
            cc_copied += 1
        json.dump(cards, open(cc_path, "w"), ensure_ascii=False, indent=2)
        print(f"collection_cards: copied {cc_copied}, missing {len(cc_missing)} {cc_missing}")

    # AboutContent.tsx hardcoded images (founders + interior shots)
    about = ["Untitled_design_1.png", "WhatsApp_Image_2026-07-13_at_14.31.10.jpg",
             "Untitled_design_3.png", "pedicure_haircut.jpg", "lobby.jpg", "face_scan.jpg"]
    ab_copied, ab_missing = 0, []
    for name in about:
        src = pick_best(name, None)
        if not src:
            ab_missing.append(name); continue
        shutil.copyfile(src, os.path.join(PUB_PRODUCTS, name)); ab_copied += 1
    print(f"about images: copied {ab_copied}, missing {len(ab_missing)} {ab_missing}")

    # hero video + poster
    vids = os.path.join(SCRAPE, "cdn", "shop", "videos")
    mp4 = None
    for dp, _, fns in os.walk(vids):
        for fn in fns:
            if fn.split("?")[0].endswith(".mp4"):
                mp4 = os.path.join(dp, fn)
    pub = os.path.join(ROOT, "public")
    if mp4:
        hero_mp4 = os.path.join(pub, "hero.mp4")
        shutil.copyfile(mp4, hero_mp4)
        poster = os.path.join(pub, "hero-poster.jpg")
        subprocess.run(
            ["ffmpeg", "-y", "-i", hero_mp4, "-ss", "00:00:01", "-vframes", "1",
             "-vf", "scale=1600:-1", poster],
            check=True, capture_output=True)
        print(f"hero: video -> public/hero.mp4 ({os.path.getsize(hero_mp4)//1024} KB), "
              f"poster -> public/hero-poster.jpg ({os.path.getsize(poster)//1024} KB)")
    else:
        print("hero: NO mp4 found in scrape", file=sys.stderr)

if __name__ == "__main__":
    main()
