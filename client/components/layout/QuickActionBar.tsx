import { Phone, MapPin } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { siteConfig } from "@/config/site";

export function QuickActionBar() {
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 glass-strong border-t border-border z-40 pb-safe">
      <div className="flex items-center justify-between p-2 max-w-md mx-auto">
        {siteConfig.phone.startsWith("[") ? <span aria-disabled="true" className="flex-1 flex flex-col items-center justify-center py-2 text-muted-foreground h-11" aria-label="Phone number not yet confirmed">
          <Phone className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">Call</span>
        </span> : <a href={`tel:${siteConfig.phone}`} className="flex-1 flex flex-col items-center justify-center py-2 text-foreground hover:text-primary transition-colors h-11" aria-label="Call Us"><Phone className="w-5 h-5 mb-1" /><span className="text-[10px] font-medium">Call</span></a>}
        {siteConfig.whatsapp ? <a href={`https://wa.me/${siteConfig.whatsapp}`} className="flex-1 flex flex-col items-center justify-center py-2 text-foreground hover:text-primary transition-colors h-11" aria-label="WhatsApp" rel="noreferrer">
          <FaWhatsapp className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">WhatsApp</span>
        </a> : <a href="/contact" className="flex-1 flex flex-col items-center justify-center py-2 text-muted-foreground h-11" aria-label="WhatsApp details not yet confirmed"><FaWhatsapp className="w-5 h-5 mb-1" /><span className="text-[10px] font-medium">WhatsApp</span></a>}
        {siteConfig.directionsUrl ? <a href={siteConfig.directionsUrl} target="_blank" rel="noreferrer" className="flex-1 flex flex-col items-center justify-center py-2 text-foreground hover:text-primary transition-colors h-11" aria-label="Directions">
          <MapPin className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">Directions</span>
        </a> : <a href="/visit" className="flex-1 flex flex-col items-center justify-center py-2 text-foreground hover:text-primary transition-colors h-11" aria-label="Visit details"> <MapPin className="w-5 h-5 mb-1" /><span className="text-[10px] font-medium">Visit</span></a>}
      </div>
    </div>
  );
}
