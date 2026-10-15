import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const tags = new Set(["hero", "sermons", "events", "announcements", "gallery"]);

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || request.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body: unknown = await request.json().catch(() => null);
  const tag = typeof body === "object" && body !== null && "tag" in body ? body.tag : null;
  if (typeof tag !== "string" || !tags.has(tag)) {
    return NextResponse.json({ error: "Unsupported cache tag" }, { status: 400 });
  }
  revalidateTag(tag, "max");
  return NextResponse.json({ revalidated: true, tag });
}
