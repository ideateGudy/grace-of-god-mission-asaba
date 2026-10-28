import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const rawUrl = searchParams.get("url");

  let targetUrl = rawUrl;

  if (id) {
    targetUrl = `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`;
  } else if (!targetUrl) {
    return new NextResponse("Missing id or url parameter", { status: 400 });
  }

  try {
    const rangeHeader = req.headers.get("range");
    const fetchHeaders: HeadersInit = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    };
    if (rangeHeader) {
      fetchHeaders["Range"] = rangeHeader;
    }

    const res = await fetch(targetUrl, {
      headers: fetchHeaders,
      redirect: "follow",
    });

    // Check if Google Drive returned a virus scan confirmation page
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("text/html") && id) {
      const html = await res.text();
      // Look for confirm token or download form
      const confirmMatch = html.match(/confirm=([0-9A-Za-z_-]+)/);
      if (confirmMatch && confirmMatch[1]) {
        const confirmUrl = `https://drive.google.com/uc?export=download&confirm=${confirmMatch[1]}&id=${encodeURIComponent(id)}`;
        const confirmedRes = await fetch(confirmUrl, {
          headers: fetchHeaders,
          redirect: "follow",
        });
        return forwardStream(confirmedRes);
      }
    }

    return forwardStream(res);
  } catch (error) {
    console.error("Audio proxy error:", error);
    return new NextResponse("Unable to fetch audio stream", { status: 502 });
  }
}

function forwardStream(res: Response): NextResponse {
  const responseHeaders = new Headers();
  
  // Forward essential streaming headers
  const passThrough = [
    "content-type",
    "content-length",
    "content-range",
    "accept-ranges",
    "cache-control",
  ];

  for (const h of passThrough) {
    const val = res.headers.get(h);
    if (val) responseHeaders.set(h, val);
  }

  // Ensure content-type is audio if not set
  if (!responseHeaders.has("content-type") || responseHeaders.get("content-type")?.includes("octet-stream")) {
    responseHeaders.set("content-type", "audio/mpeg");
  }

  if (!responseHeaders.has("accept-ranges")) {
    responseHeaders.set("accept-ranges", "bytes");
  }

  responseHeaders.set("Cache-Control", "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800");

  return new NextResponse(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: responseHeaders,
  });
}
