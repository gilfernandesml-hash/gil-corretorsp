import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET


def fetch(url: str, timeout: int = 30) -> bytes:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "gilcorretorsp-seo-audit/1.0 (+https://gilcorretorsp.com.br)",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
    )
    with urllib.request.urlopen(req, timeout=timeout) as res:
        return res.read()


def parse_sitemap(xml_bytes: bytes) -> list[str]:
    root = ET.fromstring(xml_bytes)
    ns = "{http://www.sitemaps.org/schemas/sitemap/0.9}"

    urls = []
    for url_el in root.findall(f"{ns}url"):
        loc = url_el.find(f"{ns}loc")
        if loc is not None and loc.text:
            urls.append(loc.text.strip())
    return urls


def audit_urls(urls: list[str], per_request_delay_s: float = 0.2, limit: int | None = None) -> dict:
    results = []

    to_check = urls[:limit] if limit else urls
    for i, url in enumerate(to_check, start=1):
        status = None
        title = None
        robots_meta = None
        error = None

        try:
            data = fetch(url)
            html = data.decode("utf-8", errors="ignore")

            title_start = html.lower().find("<title")
            if title_start != -1:
                title_tag_start = html.lower().find(">", title_start)
                title_end = html.lower().find("</title>", title_tag_start + 1)
                if title_tag_start != -1 and title_end != -1:
                    title = html[title_tag_start + 1 : title_end].strip()

            lower = html.lower()
            idx = lower.find('name="robots"')
            if idx != -1:
                content_idx = lower.find('content=', idx)
                if content_idx != -1:
                    quote = lower[content_idx + len('content=') : content_idx + len('content=') + 1]
                    if quote in ('"', "'"):
                        end = lower.find(quote, content_idx + len('content=') + 1)
                        if end != -1:
                            robots_meta = html[content_idx + len('content=') + 1 : end].strip()

            status = 200

        except urllib.error.HTTPError as e:
            status = e.code
            error = str(e)
        except Exception as e:
            error = str(e)

        results.append(
            {
                "url": url,
                "status": status,
                "title": title,
                "robots": robots_meta,
                "error": error,
            }
        )

        time.sleep(per_request_delay_s)

    return {
        "count": len(results),
        "results": results,
    }


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: python audit_sitemap.py <sitemap_url> [--limit N]", file=sys.stderr)
        return 2

    sitemap_url = sys.argv[1]
    limit = None
    if "--limit" in sys.argv:
        idx = sys.argv.index("--limit")
        if idx + 1 < len(sys.argv):
            limit = int(sys.argv[idx + 1])

    xml_bytes = fetch(sitemap_url)
    urls = parse_sitemap(xml_bytes)

    report = audit_urls(urls, limit=limit)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
