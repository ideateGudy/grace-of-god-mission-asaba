import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const tags = new Set([
  "hero",
  "sermons",
  "events",
  "announcements",
  "gallery",
  "projects",
  "settings",
  "home",
  "visit",
  "give",
]);

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  const searchParams = request.nextUrl.searchParams;
  const providedSecret =
    request.headers.get("x-revalidate-secret") || searchParams.get("secret");

  if (!secret || providedSecret !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let tag = searchParams.get("tag");
  if (!tag) {
    const body: unknown = await request.json().catch(() => null);
    if (typeof body === "object" && body !== null && "tag" in body && typeof body.tag === "string") {
      tag = body.tag;
    }
  }

  if (!tag || !tags.has(tag)) {
    return NextResponse.json({ error: "Unsupported cache tag" }, { status: 400 });
  }

  revalidateTag(tag, "max");
  return NextResponse.json({ revalidated: true, tag });
}
