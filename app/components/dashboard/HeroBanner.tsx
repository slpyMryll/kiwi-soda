"use client";

import { ChevronDown, Check } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Term {
  id: string;
  name: string;
  is_current: boolean;
  cover_url?: string;
}

import { useState, useEffect } from "react";

export function HeroBanner({ terms, currentTermId }: { terms: Term[], currentTermId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const activeTerm = terms?.find(t => t.id === currentTermId) || terms?.[0];

  const handleTermSelect = (termId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("term", termId);
    router.push(`${pathname}?${params.toString()}`);
  };

  if (!isMounted) {
    return <div className="relative w-full h-48 md:h-64 rounded-b-2xl overflow-hidden mb-8 shadow-sm bg-gray-200 animate-pulse" />;
  }

  return (
    <div className="relative w-full h-48 md:h-64 rounded-b-2xl overflow-hidden mb-8 shadow-sm group">
      <Image
        src={activeTerm?.cover_url || "/hero-section-place.jpg"} 
        alt="VSU SSC Team" 
        fill
        className="object-cover object-top"
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
      
      <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white flex items-baseline gap-2">
            {activeTerm?.name || "2025-2026"} <span className="text-lg font-semibold opacity-90">VSU-USSC</span>
          </h1>
        </div>

        {terms && terms.length > 0 ? (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-semibold transition-colors outline-none cursor-pointer">
              SY: {activeTerm?.name || "2025-2026"} <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white rounded-xl shadow-xl border border-gray-100 p-1 z-[100]">
              {terms.map((term) => (
                <DropdownMenuItem 
                  key={term.id}
                  onClick={() => handleTermSelect(term.id)}
                  className="flex items-center justify-between px-3 py-2 text-sm font-medium cursor-pointer rounded-lg hover:bg-gray-50 focus:bg-gray-50"
                >
                  {term.name}
                  {term.id === currentTermId && <Check className="w-4 h-4 text-[#1B4332]" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-semibold transition-colors cursor-default">
            SY: 2025-2026 <ChevronDown className="w-4 h-4 opacity-50" />
          </button>
        )}
      </div>
    </div>
  );
}