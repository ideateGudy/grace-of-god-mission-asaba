import { AdminResourceList } from "@/components/admin/AdminResourceList";

export default async function ResourceListPage({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  return <AdminResourceList resource={resource} />;
}
