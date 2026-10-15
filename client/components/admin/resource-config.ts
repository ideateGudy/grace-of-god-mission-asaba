export type ResourceField = { key: string; label: string; type?: "text" | "url" | "image" | "datetime-local" | "textarea" | "checkbox" | "number"; required?: boolean };
export type ResourceConfig = { title: string; fields: ResourceField[]; columns: string[]; dateField?: string };

export const RESOURCE_CONFIG: Record<string, ResourceConfig> = {
  sermons: { title: "Sermons", dateField: "preachedAt", columns: ["title", "preacher", "series", "published"], fields: [
    { key: "title", label: "Title", required: true }, { key: "slug", label: "Slug (leave blank to generate)" }, { key: "preacher", label: "Preacher", required: true }, { key: "preachedAt", label: "Date preached", type: "datetime-local", required: true }, { key: "scripture", label: "Scripture reference" }, { key: "series", label: "Series" }, { key: "videoUrl", label: "YouTube or video URL", type: "url" }, { key: "audioUrl", label: "Audio URL", type: "url" }, { key: "thumbnailUrl", label: "Thumbnail", type: "image" }, { key: "description", label: "Description", type: "textarea" }, { key: "published", label: "Published", type: "checkbox" },
  ] },
  events: { title: "Events", dateField: "startsAt", columns: ["title", "venue", "startsAt", "published"], fields: [
    { key: "title", label: "Title", required: true }, { key: "slug", label: "Slug (leave blank to generate)" }, { key: "startsAt", label: "Starts", type: "datetime-local", required: true }, { key: "endsAt", label: "Ends", type: "datetime-local" }, { key: "venue", label: "Venue", required: true }, { key: "address", label: "Address" }, { key: "mapUrl", label: "Map URL", type: "url" }, { key: "description", label: "Description", type: "textarea" }, { key: "imageUrl", label: "Image", type: "image" }, { key: "published", label: "Published", type: "checkbox" },
  ] },
  announcements: { title: "Announcements", dateField: "publishFrom", columns: ["title", "pinned", "published"], fields: [
    { key: "title", label: "Title", required: true }, { key: "body", label: "Announcement", type: "textarea", required: true }, { key: "publishFrom", label: "Publish from", type: "datetime-local" }, { key: "expiresAt", label: "Expires at", type: "datetime-local" }, { key: "pinned", label: "Pinned", type: "checkbox" }, { key: "published", label: "Published", type: "checkbox" },
  ] },
  gallery: { title: "Gallery", dateField: "createdAt", columns: ["caption", "album", "sortOrder", "published"], fields: [
    { key: "imageUrl", label: "Gallery image", type: "image", required: true }, { key: "caption", label: "Caption" }, { key: "album", label: "Album" }, { key: "width", label: "Width (px)", type: "number" }, { key: "height", label: "Height (px)", type: "number" }, { key: "sortOrder", label: "Order", type: "number" }, { key: "published", label: "Published", type: "checkbox" },
  ] },
};
