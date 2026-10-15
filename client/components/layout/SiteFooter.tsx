import { Logo } from "@/components/shared/Logo";
import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { FaFacebook, FaYoutube, FaWhatsapp, FaInstagram } from "react-icons/fa6";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="bg-midnight text-white py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-5 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-6 md:col-span-2">
          <Logo className="text-white" />
          <p className="text-white/70 text-balance max-w-sm">{siteConfig.name}</p>
          <div className="flex gap-4">
            {siteConfig.facebookUrl && <a href={siteConfig.facebookUrl} className="min-h-11 min-w-11 flex items-center justify-center text-white/70 hover:text-white transition-colors" aria-label="Facebook" rel="noreferrer"><FaFacebook className="w-6 h-6" /></a>}
            {siteConfig.youtubeUrl && <a href={siteConfig.youtubeUrl} className="min-h-11 min-w-11 flex items-center justify-center text-white/70 hover:text-white transition-colors" aria-label="YouTube" rel="noreferrer"><FaYoutube className="w-6 h-6" /></a>}
            {siteConfig.whatsapp && <a href={`https://wa.me/${siteConfig.whatsapp}`} className="min-h-11 min-w-11 flex items-center justify-center text-white/70 hover:text-white transition-colors" aria-label="WhatsApp" rel="noreferrer"><FaWhatsapp className="w-6 h-6" /></a>}
            {siteConfig.instagramUrl && <a href={siteConfig.instagramUrl} className="min-h-11 min-w-11 flex items-center justify-center text-white/70 hover:text-white transition-colors" aria-label="Instagram" rel="noreferrer"><FaInstagram className="w-6 h-6" /></a>}
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="font-bold font-display text-lg">Quick Links</h4>
          <ul className="space-y-2 text-white/70">
            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link href="/visit" className="hover:text-white transition-colors">Visit</Link></li>
            <li><Link href="/sermons" className="hover:text-white transition-colors">Sermons</Link></li>
            <li><Link href="/give" className="hover:text-white transition-colors">Give</Link></li>
          </ul>
        </div>
        <div className="space-y-4">
          <h4 className="font-bold font-display text-lg">Contact</h4>
          <ul className="space-y-4 text-white/70">
            <li className="flex gap-3">
              <MapPin className="w-5 h-5 shrink-0" />
              <span>{siteConfig.churchAddress}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="w-5 h-5 shrink-0" />
              <span>{siteConfig.phone}</span>
            </li>
            <li className="flex gap-3">
              <Mail className="w-5 h-5 shrink-0" />
              <span>{siteConfig.email}</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-5 mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-white/50 text-sm">
        <p>&copy; {new Date().getFullYear()} Grace of God Mission Asaba. All rights reserved.</p>
        <Link href="/privacy" className="hover:text-white transition-colors">Privacy Notice</Link>
      </div>
    </footer>
  );
}
