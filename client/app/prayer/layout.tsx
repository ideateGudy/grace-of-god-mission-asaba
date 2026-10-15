import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Prayer request',
  description: 'Share a prayer request privately with Grace of God Mission Asaba.',
};

export default function PrayerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
