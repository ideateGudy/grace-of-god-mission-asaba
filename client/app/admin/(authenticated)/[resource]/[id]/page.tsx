import { AdminResourceEditor } from "@/components/admin/AdminResourceEditor";

export default async function ResourceEditorPage({ params }: { params: Promise<{ resource: string; id: string }> }) {
  const values = await params;
  return <AdminResourceEditor {...values} />;
}
