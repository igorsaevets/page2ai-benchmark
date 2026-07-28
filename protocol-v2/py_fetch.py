"""Negotiation-track probe for the Python tools. Emits one JSON object on stdout.

    python py_fetch.py <tool> <url>

Records what the tool's own fetch path returned, not a quality judgement.
"""

import hashlib
import json
import sys


def probe_trafilatura(url: str) -> dict:
    import trafilatura

    # with_headers=True is required. Without it Response.headers is an empty dict and every
    # row reads "content_type: null", which looks like a tool failure and is a harness bug.
    downloaded = trafilatura.fetch_response(url, decode=False, with_headers=True)
    if downloaded is None:
        return {"ok": False, "error": "fetch_response returned None"}
    body = downloaded.data or b""
    headers = {k.lower(): v for k, v in dict(getattr(downloaded, "headers", {}) or {}).items()}
    return {
        "ok": True,
        "status": getattr(downloaded, "status", None),
        "final_url": getattr(downloaded, "url", url),
        "content_type": headers.get("content-type"),
        "vary": headers.get("vary"),
        "bytes": len(body),
        "sha256": hashlib.sha256(body).hexdigest(),
        "is_markdown": "markdown" in (headers.get("content-type") or "").lower(),
    }


def probe_markitdown(url: str) -> dict:
    from markitdown import MarkItDown

    md = MarkItDown(enable_plugins=False)
    try:
        result = md.convert(url)
    except Exception as exc:  # noqa: BLE001 - the failure itself is the datum
        return {"ok": False, "error": f"{type(exc).__name__}: {exc}"}
    text = result.markdown or ""
    return {
        "ok": True,
        "chars": len(text),
        "sha256": hashlib.sha256(text.encode("utf-8")).hexdigest(),
        "title": result.title,
    }


TOOLS = {"trafilatura": probe_trafilatura, "markitdown": probe_markitdown}


def main() -> int:
    if len(sys.argv) != 3 or sys.argv[1] not in TOOLS:
        print("usage: py_fetch.py <trafilatura|markitdown> <url>", file=sys.stderr)
        return 2
    out = TOOLS[sys.argv[1]](sys.argv[2])
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stdout.write(json.dumps(out))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
