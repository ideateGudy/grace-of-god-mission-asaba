import type { MetadataRoute } from "next";
import { api } from "@/lib/api/client";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const routes = ["", "/about", "/visit", "/sermons", "/events", "/announcements", "/gallery", "/contact", "/prayer", "/give", "/countdown", "/privacy"];
  const entries: MetadataRoute.Sitemap = routes.map((route) => ({ url: `${base}${route}`, changeFrequency: route === "" ? "weekly" : "monthly", priority: route === "" ? 1 : 0.6 }));
  const [sermons, events] = await Promise.allSettled([
    api.public.sermons("?page=1&limit=500"),
    api.public.events("?scope=upcoming&page=1&limit=500"),
  ]);
  if (sermons.status === "fulfilled") {
    for (const sermon of sermons.value.data) {
      if (typeof sermon.slug === "string") entries.push({ url: `${base}/sermons/${encodeURIComponent(sermon.slug)}`, changeFrequency: "monthly", priority: 0.5 });
    }
  }
  if (events.status === "fulfilled") {
    for (const event of events.value.data) {
      if (typeof event.slug === "string") entries.push({ url: `${base}/events/${encodeURIComponent(event.slug)}`, changeFrequency: "weekly", priority: 0.6 });
    }
  }
  return entries;
}
