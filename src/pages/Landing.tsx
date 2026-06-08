import { useEffect, useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import FeatureGrid from "@/components/landing/FeatureGrid";
import Footer from "@/components/landing/Footer";
import { useSEO } from "@/hooks/useSEO";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "E-VARA",
      "applicationCategory": "SecurityApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "1250",
        "priceCurrency": "USD"
      },
      "description": "Autonomous identity defense and threat monitoring platform for high-value targets."
    },
    {
      "@type": "Organization",
      "name": "E-VARA Security Systems",
      "url": "https://e-vara.vercel.app"
    }
  ]
};

gsap.registerPlugin(ScrollTrigger);

const PremiumNavbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-[100] bg-black/50 backdrop-blur-2xl border-b border-white/5">
    <div className="container mx-auto px-6 h-20 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-[#007AFF]" />
        <span className="text-xl font-bold tracking-tighter text-white uppercase italic">E-vara</span>
      </div>
      <div className="hidden md:flex items-center gap-8">
        {["Technology", "Solutions", "Investors", "Security"].map((item) => (
          <a key={item} href={`#${item.toLowerCase()}`} className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/40 hover:text-[#007AFF] transition-colors">
            {item}
          </a>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <button className="px-6 py-2.5 rounded-full bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-[#007AFF] hover:text-white transition-all">
          Connect Identity
        </button>
        <button className="px-6 py-2.5 rounded-full bg-[#007AFF] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all">
          Launch Console
        </button>
      </div>
    </div>
  </nav>
);

  useSEO({
    title: "Enterprise Identity Defense & Intelligence OS",
    description: "E-VARA provides autonomous identity defense, real-time threat monitoring, and executive security auditing for high-value targets.",
    canonicalUrl: "https://e-vara.vercel.app/"
  });

  useEffect(() => {
    console.log("E-VARA V2 REDESIGN LOADED");
    gsap.utils.toArray<HTMLElement>("section").forEach((section) => {
      gsap.fromTo(section, 
        { opacity: 0, y: 50 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1, 
          ease: "power4.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#050608] text-foreground selection:bg-primary/30 overflow-x-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <Navbar 
        isScrolled={isScrolled} 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen} 
      />
      <Hero />
      <FeatureGrid />
      <Footer />
    </div>
  );
};

export default LandingPage;
