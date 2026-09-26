#!/usr/bin/env python3
"""Dumpar butikens aktiva katalog till korningar/<datum>/v3/katalog-live.txt (V3 steg 0, K0-kollen).
    python3 katalog.py [--datum YYYY-MM-DD] [--ut <fil>]
Auth: client credentials grant mot Shopify Admin API (SHOPIFY_SHOP_SE, SHOPIFY_CLIENT_ID_SE,
SHOPIFY_CLIENT_SECRET_SE) — samma väg som tools/shopify-fix-compareat.mjs. Inga beroenden.
Radformat: STATUS<TAB>produkttyp<TAB>pris<TAB>titel — samma som tidigare körningar.
"""
import argparse, datetime, json, os, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
API = "2025-07"


def post(url, body, headers):
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={"Content-Type": "application/json", **headers})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--datum", default=datetime.date.today().isoformat())
    ap.add_argument("--ut")
    a = ap.parse_args()
    shop, cid, sec = (os.environ.get(k) for k in ("SHOPIFY_SHOP_SE", "SHOPIFY_CLIENT_ID_SE", "SHOPIFY_CLIENT_SECRET_SE"))
    if not (shop and cid and sec):
        sys.exit("Saknar env SHOPIFY_SHOP_SE / SHOPIFY_CLIENT_ID_SE / SHOPIFY_CLIENT_SECRET_SE")
    tok = post(f"https://{shop}/admin/oauth/access_token", {"client_id": cid, "client_secret": sec, "grant_type": "client_credentials"}, {})["access_token"]
    q = """query($c: String) { products(first: 250, after: $c, query: "status:active") {
      pageInfo { hasNextPage endCursor }
      nodes { title status productType priceRangeV2 { minVariantPrice { amount } } } } }"""
    rader, cursor = [], None
    while True:
        d = post(f"https://{shop}/admin/api/{API}/graphql.json", {"query": q, "variables": {"c": cursor}}, {"X-Shopify-Access-Token": tok})
        if "errors" in d:
            sys.exit(f"GraphQL-fel: {d['errors']}")
        p = d["data"]["products"]
        for n in p["nodes"]:
            rader.append(f"{n['status']}\t{n.get('productType') or ''}\t{float(n['priceRangeV2']['minVariantPrice']['amount']):.2f}\t{n['title']}")
        if not p["pageInfo"]["hasNextPage"]:
            break
        cursor = p["pageInfo"]["endCursor"]
    rader.sort(key=lambda r: r.split("\t")[3].lower())
    ut = a.ut or os.path.join(HERE, "korningar", a.datum, "v3", "katalog-live.txt")
    os.makedirs(os.path.dirname(ut), exist_ok=True)
    open(ut, "w", encoding="utf-8").write(f"# {shop} aktiva produkter {datetime.datetime.utcnow().isoformat()}Z — {len(rader)} st\n" + "\n".join(rader) + "\n")
    print(f"{ut}: {len(rader)} aktiva produkter")


if __name__ == "__main__":
    main()
