import { Metadata } from "next";
import { FlyerStudio } from "@/components/flyer/FlyerStudio";

export const metadata: Metadata = {
  title: "Church Flyer Studio | Grace of God Mission Asaba",
  description: "Create and download high-resolution church flyers, promotional graphics, and daily devotional cards automatically.",
};

export default async function AdminFlyersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const initialDevotionDate =
    typeof resolvedParams.date === "string" ? resolvedParams.date : undefined;

  return <FlyerStudio initialDevotionDate={initialDevotionDate} />;
}
