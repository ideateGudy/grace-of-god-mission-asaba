import Link from "next/link";
import { PublicPageLayout } from "@/components/shared/PublicPageLayout";

export default function NotFound() {
  return <PublicPageLayout title="Page not found" description="The link may be out of date, or the page may have moved."><Link href="/" className="inline-flex min-h-11 items-center rounded-md bg-primary px-5 font-semibold text-primary-foreground">Return home</Link></PublicPageLayout>;
}
