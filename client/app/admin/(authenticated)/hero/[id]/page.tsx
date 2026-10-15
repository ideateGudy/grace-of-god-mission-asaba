import { HeroEditor } from "@/components/admin/HeroEditor";

export default async function HeroEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <HeroEditor id={id} />;
}
