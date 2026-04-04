import argparse
import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from typing import Any

import urllib.error
import urllib.parse
import urllib.request


def load_dotenv_file(file_path: str) -> None:
    if not os.path.exists(file_path):
        return
    with open(file_path, "r", encoding="utf-8") as f:
        for raw in f.read().splitlines():
            line = raw.strip()
            if not line or line.startswith("#"):
                continue
            if "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip("\"").strip("'")
            if key and key not in os.environ:
                os.environ[key] = value


def load_dotenv() -> None:
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    load_dotenv_file(os.path.join(root, ".env"))
    load_dotenv_file(os.path.join(root, ".env.local"))


def format_money_brl(value: Any) -> str | None:
    if value is None or value == "":
        return None
    try:
        num = float(value)
    except Exception:
        return None
    s = f"{num:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    return f"R$ {s}"


def normalize_type(ptype: str | None) -> str | None:
    if not ptype:
        return None
    mapping = {
        "apartment": "Apartamento",
        "house": "Casa",
        "studio": "Studio",
        "commercial": "Comercial",
        "land": "Terreno",
    }
    return mapping.get(ptype, ptype)


def build_description(p: dict[str, Any]) -> str:
    title = (p.get("title") or "").strip() or "Imóvel"
    neighborhood = (p.get("neighborhood") or "").strip()

    parts: list[str] = []
    headline = title
    if neighborhood:
        headline = f"{title} em {neighborhood}"
    parts.append(f"{headline} — oportunidade em São Paulo com atendimento consultivo do início ao fechamento.")

    bullets: list[str] = []

    t = normalize_type(p.get("type"))
    if t:
        bullets.append(t)

    for label, key in [
        ("Dormitórios", "bedrooms"),
        ("Banheiros", "bathrooms"),
        ("Suítes", "suites"),
        ("Vagas", "parking_spaces"),
    ]:
        v = p.get(key)
        if v not in (None, ""):
            bullets.append(f"{label}: {v}")

    area = p.get("area")
    if area not in (None, ""):
        bullets.append(f"Área: {area} m²")

    price = format_money_brl(p.get("price"))
    if price:
        bullets.append(f"Valor: {price}")

    starting_from = format_money_brl(p.get("starting_from_price"))
    if starting_from and not price:
        bullets.append(f"A partir de: {starting_from}")

    if bullets:
        parts.append("Destaques:")
        parts.extend([f"- {b}" for b in bullets])

    parts.append(
        "\nQuer receber opções parecidas (incluindo lançamentos e oportunidades de investimento)? Fale comigo no WhatsApp."
    )

    return "\n".join(parts).strip()


def build_meta_title(p: dict[str, Any]) -> str | None:
    title = (p.get("title") or "").strip()
    if not title:
        return None

    neighborhood = (p.get("neighborhood") or "").strip()
    if neighborhood:
        base = f"{title} em {neighborhood}"
    else:
        base = title

    suffix = " | Gil Fernandes Imóveis"
    if len(base + suffix) <= 60:
        return base + suffix

    truncated = base[: max(0, 60 - len(suffix) - 1)].rstrip()
    return f"{truncated}…{suffix}"


def build_meta_description(p: dict[str, Any]) -> str | None:
    neighborhood = (p.get("neighborhood") or "").strip()
    t = normalize_type(p.get("type"))
    price = format_money_brl(p.get("price"))

    chunks: list[str] = []
    if t and neighborhood:
        chunks.append(f"{t} em {neighborhood}")
    elif t:
        chunks.append(t)
    elif neighborhood:
        chunks.append(f"Imóvel em {neighborhood}")

    if price:
        chunks.append(f"por {price}")

    chunks.append("Atendimento consultivo e curadoria de imóveis em São Paulo. Fale no WhatsApp.")

    text = " ".join(chunks).strip()
    if len(text) <= 160:
        return text
    return text[:157].rstrip() + "…"


def supabase_rest_headers(key: str) -> dict[str, str]:
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }


def http_json(method: str, url: str, headers: dict[str, str], params: dict[str, str] | None = None, body: str | None = None, timeout: int = 45) -> Any:
    method = method.upper()
    if params:
        url = f"{url}?{urllib.parse.urlencode(params)}"

    data = body.encode("utf-8") if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req, timeout=timeout) as res:
            raw = res.read()
            if not raw:
                return None
            return json.loads(raw.decode("utf-8"))
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", errors="ignore") if hasattr(e, "read") else ""
        raise RuntimeError(f"HTTP {e.code} {e.reason}: {raw}") from e


def supabase_get_properties_draft(supabase_url: str, key: str, limit: int) -> list[dict[str, Any]]:
    return supabase_get_properties_by_status(supabase_url, key, statuses=["draft"], limit=limit)


def supabase_get_properties_by_status(
    supabase_url: str,
    key: str,
    statuses: list[str],
    limit: int,
) -> list[dict[str, Any]]:
    url = f"{supabase_url.rstrip('/')}/rest/v1/properties"

    filters: dict[str, str] = {
        "select": "id,slug,title,description,meta_title,meta_description,neighborhood,type,bedrooms,bathrooms,suites,parking_spaces,area,price,starting_from_price,business_type,property_status,updated_at,status",
        "order": "updated_at.asc",
        "limit": str(limit),
    }

    clean_statuses = [s.strip() for s in statuses if s and s.strip()]
    if not clean_statuses:
        return []

    if len(clean_statuses) == 1:
        filters["status"] = f"eq.{clean_statuses[0]}"
    else:
        filters["status"] = f"in.({','.join(clean_statuses)})"

    data = http_json("GET", url, headers=supabase_rest_headers(key), params=filters, body=None, timeout=45)
    return data or []


def supabase_discover_statuses(supabase_url: str, key: str, limit: int = 2000) -> dict[str, int]:
    url = f"{supabase_url.rstrip('/')}/rest/v1/properties"
    params = {
        "select": "status",
        "limit": str(limit),
    }
    data = http_json("GET", url, headers=supabase_rest_headers(key), params=params, body=None, timeout=45) or []
    counts: dict[str, int] = {}
    for row in data:
        s = row.get("status")
        if not s:
            s = "(null)"
        counts[str(s)] = counts.get(str(s), 0) + 1
    return dict(sorted(counts.items(), key=lambda kv: (-kv[1], kv[0])))


def supabase_patch_property(supabase_url: str, key: str, property_id: str, payload: dict[str, Any]) -> None:
    url = f"{supabase_url.rstrip('/')}/rest/v1/properties"
    params = {"id": f"eq.{property_id}"}
    http_json("PATCH", url, headers=supabase_rest_headers(key), params=params, body=json.dumps(payload), timeout=45)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=25)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--no-sitemap", action="store_true")
    parser.add_argument("--audit", action="store_true")
    parser.add_argument(
        "--from-status",
        default="draft",
        help="Status(es) de origem para publicar. Pode ser um valor (ex: draft) ou lista separada por vírgula (ex: draft,pending).",
    )
    parser.add_argument(
        "--discover-statuses",
        action="store_true",
        help="Lista contagem aproximada de registros por status na tabela properties (amostragem até --limit registros).",
    )
    parser.add_argument("--site-url", default=os.environ.get("SITE_URL") or "https://gilcorretorsp.com.br")
    args = parser.parse_args()

    load_dotenv()

    supabase_url = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
    service_role = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url:
        print("Missing SUPABASE_URL (or VITE_SUPABASE_URL) in environment", file=sys.stderr)
        return 2

    if not service_role:
        print("Missing SUPABASE_SERVICE_ROLE_KEY in environment", file=sys.stderr)
        return 2

    if args.discover_statuses:
        counts = supabase_discover_statuses(supabase_url, service_role, limit=args.limit)
        if not counts:
            print("No rows returned. Check permissions/RLS or increase --limit.")
            return 0
        print(json.dumps({"sample_limit": args.limit, "status_counts": counts}, ensure_ascii=False, indent=2))
        return 0

    from_statuses = [s.strip() for s in str(args.from_status).split(",") if s.strip()]
    drafts = supabase_get_properties_by_status(supabase_url, service_role, statuses=from_statuses, limit=args.limit)
    if not drafts:
        print(f"No properties found with status in: {', '.join(from_statuses)}")
        return 0

    published = 0
    for p in drafts:
        pid = p.get("id")
        if not pid:
            continue

        payload: dict[str, Any] = {
            "status": "active",
        }

        if not (p.get("description") or "").strip():
            payload["description"] = build_description(p)

        if not (p.get("meta_title") or "").strip():
            mt = build_meta_title(p)
            if mt:
                payload["meta_title"] = mt

        if not (p.get("meta_description") or "").strip():
            md = build_meta_description(p)
            if md:
                payload["meta_description"] = md

        if args.dry_run:
            print(json.dumps({"id": pid, "slug": p.get("slug"), "payload": payload}, ensure_ascii=False))
            continue

        supabase_patch_property(supabase_url, service_role, pid, payload)
        published += 1

    from_status_str = ", ".join(from_statuses)
    now_utc = datetime.now(timezone.utc).isoformat()
    print(f"Published {published} properties ({from_status_str} -> active) at {now_utc}")

    if args.dry_run or args.no_sitemap:
        return 0

    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

    subprocess.run(
        ["node", os.path.join(project_root, "scripts", "generate-sitemap.mjs")],
        check=True,
        cwd=project_root,
        env={**os.environ, "SITE_URL": args.site_url},
    )

    if args.audit:
        subprocess.run(
            [sys.executable, os.path.join(project_root, "python", "audit_sitemap.py"), f"{args.site_url.rstrip('/')}/sitemap.xml"],
            check=True,
            cwd=project_root,
            env={**os.environ},
        )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
