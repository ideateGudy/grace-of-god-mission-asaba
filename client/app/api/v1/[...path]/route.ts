import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return handleProxy(req, path);
}

export async function POST(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return handleProxy(req, path);
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return handleProxy(req, path);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return handleProxy(req, path);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return handleProxy(req, path);
}

const STRIP_RESPONSE_HEADERS = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
  "keep-alive",
  "set-cookie",
]);

// In-memory frame and signal store at the proxy layer for resilient camera transmission
const studioFrames = new Map<string, { frame: string; timestamp: number; label?: string }>();
const studioSignals = new Map<string, Array<{ type: string; sender: string; data: any; timestamp: number }>>();

async function handleProxy(req: NextRequest, path: string[]) {
  const pathStr = path.join("/");

  // Resilient fallback for studio frame transmission
  if (path[0] === "studio") {
    if (path[1] === "frame" && path[2]) {
      const room = path[2];
      if (req.method === "POST") {
        try {
          const body: any = await req.json();
          studioFrames.set(room, { frame: body?.frame || "", timestamp: Date.now(), label: body?.label });
          return NextResponse.json({ success: true });
        } catch {}
      } else if (req.method === "GET") {
        const frameData = studioFrames.get(room) || null;
        if (frameData) {
          return NextResponse.json({ data: frameData });
        }
      }
    } else if (path[1] === "cameras" && req.method === "GET") {
      const now = Date.now();
      const cameras = Array.from(studioFrames.entries())
        .filter(([_, data]) => now - data.timestamp < 30000)
        .map(([id, data]) => ({ id, label: data.label || `Camera (${id})`, lastSeen: data.timestamp }));
      if (cameras.length > 0) {
        return NextResponse.json({ data: cameras });
      }
    } else if (path[1] === "signal" && path[2]) {
      const room = path[2];
      if (req.method === "POST") {
        try {
          const body: any = await req.json();
          const list = studioSignals.get(room) || [];
          list.push({ ...body, timestamp: Date.now() });
          if (list.length > 50) list.shift();
          studioSignals.set(room, list);
          return NextResponse.json({ success: true });
        } catch {}
      } else if (req.method === "GET") {
        const since = Number(req.nextUrl.searchParams.get("since") || 0);
        const list = studioSignals.get(room) || [];
        return NextResponse.json({ data: list.filter((s) => s.timestamp > since) });
      }
    }
  }

  const backendBase = process.env.API_INTERNAL_URL || "http://127.0.0.1:5000";
  const search = req.nextUrl.search;
  const targetUrl = `${backendBase}/api/v1/${pathStr}${search}`;

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("connection");
  // Delete accept-encoding so upstream sends uncompressed bytes; Next.js/Vercel handles compression to the browser
  headers.delete("accept-encoding");

  const body = req.method !== "GET" && req.method !== "HEAD" ? await req.arrayBuffer() : undefined;

  let backendRes: Response;
  try {
    backendRes = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      redirect: "manual",
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to connect to the backend server. Please try again shortly." },
      { status: 503 }
    );
  }

  // If backend returned 500 for studio endpoints, fallback gracefully to edge-persisted frame
  if (backendRes.status >= 500 && path[0] === "studio") {
    if (path[1] === "frame" && path[2] && req.method === "GET") {
      const frameData = studioFrames.get(path[2]) || null;
      return NextResponse.json({ data: frameData });
    }
    if (path[1] === "cameras" && req.method === "GET") {
      const now = Date.now();
      const cameras = Array.from(studioFrames.entries())
        .filter(([_, data]) => now - data.timestamp < 30000)
        .map(([id, data]) => ({ id, label: data.label || `Camera (${id})`, lastSeen: data.timestamp }));
      return NextResponse.json({ data: cameras });
    }
  }

  const responseBody = await backendRes.arrayBuffer();

  const res = new NextResponse(responseBody, {
    status: backendRes.status,
    statusText: backendRes.statusText,
  });

  // Forward all response headers except hop-by-hop and encoding headers
  backendRes.headers.forEach((val, key) => {
    if (!STRIP_RESPONSE_HEADERS.has(key.toLowerCase())) {
      res.headers.set(key, val);
    }
  });

  // Prevent caching of authenticated or dynamic API responses
  res.headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate");

  // Multi-cookie preservation: extract all Set-Cookie headers individually
  // so intermediate reverse proxies (Vercel edge, CDN) never fold them with commas.
  const setCookies = typeof backendRes.headers.getSetCookie === "function"
    ? backendRes.headers.getSetCookie()
    : [backendRes.headers.get("set-cookie")].filter(Boolean) as string[];

  for (const cookie of setCookies) {
    res.headers.append("Set-Cookie", cookie);
  }

  return res;
}
