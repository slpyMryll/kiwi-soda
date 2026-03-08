import { ChevronDown } from "lucide-react";

export function HeroBanner() {
  return (
    <div className="relative w-full h-48 md:h-64 rounded-b-2xl overflow-hidden mb-8 shadow-sm group">
      <img 
        src="/hero-section-place.jpg" 
        alt="VSU SSC Team" 
        className="w-full h-full object-cover object-top"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
      
      <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white flex items-baseline gap-2">
            2025-2026 <span className="text-lg font-semibold opacity-90">VSU-USSC</span>
          </h1>
        </div>

        <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-semibold transition-colors">
          SY: 2025-2026 <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}