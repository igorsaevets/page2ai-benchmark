"""Python extractors for protocol v0.2. Invoked as:

    python py_tools.py <tool> <html-path> <url>

Writes Markdown to stdout, nothing else. Any diagnostic goes to stderr so the harness can
record it as an error rather than silently scoring an error message as extracted content.
"""

import io
import sys


def run_trafilatura(html: str, url: str) -> str:
    import trafilatura

    out = trafilatura.extract(
        html,
        url=url,
        output_format="markdown",
        include_tables=True,
        include_links=True,
        include_formatting=True,
        include_images=True,
    )
    return out or ""


def run_markitdown(html: str, url: str) -> str:
    from markitdown import MarkItDown, StreamInfo

    md = MarkItDown(enable_plugins=False)
    stream = io.BytesIO(html.encode("utf-8"))
    result = md.convert_stream(
        stream, stream_info=StreamInfo(extension=".html", mimetype="text/html", charset="utf-8", url=url)
    )
    return result.markdown or ""


TOOLS = {"trafilatura": run_trafilatura, "markitdown": run_markitdown}


def main() -> int:
    if len(sys.argv) != 4:
        print("usage: py_tools.py <tool> <html-path> <url>", file=sys.stderr)
        return 2
    tool, path, url = sys.argv[1], sys.argv[2], sys.argv[3]
    if tool not in TOOLS:
        print(f"unknown tool {tool}", file=sys.stderr)
        return 2
    with open(path, "r", encoding="utf-8", errors="replace") as fh:
        html = fh.read()
    out = TOOLS[tool](html, url)
    sys.stdout.reconfigure(encoding="utf-8", newline="")
    sys.stdout.write(out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
