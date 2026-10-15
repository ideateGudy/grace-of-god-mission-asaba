import { api } from "@/lib/api/client";
import { NextResponse } from "next/server";

const escapeText = (value: string) => value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
const utc = (value: string) => new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const { data } = await api.public.event(slug) as { data: { title: string; startsAt: string; endsAt: string | null; venue: string; address: string | null; description: string | null; slug: string } };
    const uid = `${data.slug}@graceofgodmissionasaba`;
    const description = escapeText(data.description ?? "");
    const location = escapeText([data.venue, data.address].filter(Boolean).join(", "));
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Grace of God Mission Asaba//Events//EN", "CALSCALE:GREGORIAN", "BEGIN:VEVENT", `UID:${uid}`, `DTSTAMP:${utc(new Date().toISOString())}`, `DTSTART:${utc(data.startsAt)}`, `DTEND:${utc(data.endsAt ?? data.startsAt)}`, `SUMMARY:${escapeText(data.title)}`, `DESCRIPTION:${description}`, `LOCATION:${location}`, "END:VEVENT", "END:VCALENDAR", ""].join("\r\n");
    return new NextResponse(ics, { headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": `attachment; filename="${encodeURIComponent(data.slug)}.ics"`, "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Event not found" }, { status: 404 }); }
}
