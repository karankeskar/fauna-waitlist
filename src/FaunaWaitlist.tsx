import { useState, useEffect, useRef } from "react";

interface WaitlistForm {
  email: string;
  status: "idle" | "loading" | "success" | "error";
  errorMessage: string;
}

interface Photo {
  src: string;
  alt: string;
  location: string;
}

interface Feature {
  num: string;
  icon: string;
  title: string;
  desc: string;
}

const BASE = import.meta.env.BASE_URL;

const PHOTOS: Photo[] = [
  { src: `${BASE}images/FB.jpeg`, alt: "Crested Serpent Eagle", location: "Karnataka, India" },
  { src: `${BASE}images/2C1A0060.jpeg`, alt: "Siberian Stonechat", location: "Uttarakhand, India" },
  { src: `${BASE}images/2C1A0613.jpeg`, alt: "Tiger", location: "Karnataka, India" },
  { src: `${BASE}images/2C1A0735.jpeg`, alt: "Tiger", location: "Uttarakhand, India" },
  { src: `${BASE}images/2C1A1171.jpeg`, alt: "Leopard", location: "Karnataka, India" },
  { src: `${BASE}images/2C1A1199.jpeg`, alt: "Tiger", location: "Karnataka, India" },
  { src: `${BASE}images/2C1A1513.jpeg`, alt: "Leopard", location: "Karnataka, India"},
  { src: `${BASE}images/2C1A2020.jpeg`, alt: "Tiger", location: "Karnataka, India" },
  { src: `${BASE}images/2C1A2463.jpeg`, alt: "Tiger", location: "Karnataka, India" },
  { src: `${BASE}images/2C1A2789.jpeg`, alt: "Spotted Deer", location: "Uttarakhand, India" },
  { src: `${BASE}images/2C1A2860.jpeg`, alt: "Tiger", location: "Uttarakhand, India" },
  { src: `${BASE}images/2C1A3681.jpeg`, alt: "Tiger", location: "Karnataka, India" },
  { src: `${BASE}images/2C1A3683.jpeg`, alt: "Woodpecker", location: "Karnataka, India" },
  { src: `${BASE}images/2C1A4407.jpeg`, alt: "Tiger", location: "Karnataka, India" },
  { src: `${BASE}images/2C1A5189.jpeg`, alt: "Peacock", location: "Karnataka, India" },
  { src: `${BASE}images/2C1A6110.jpeg`, alt: "Leopard", location: "Karnataka, India" },
  { src: `${BASE}images/2C1A6125.jpeg`, alt: "Leopard", location: "Karnataka, India" },
  { src: `${BASE}images/2C1A6564.jpeg`, alt: "Peacock", location: "Karnataka, India" },
  { src: `${BASE}images/2C1A6701.jpeg`, alt: "Tiger", location: "Karnataka, India" },
  { src: `${BASE}images/2C1A6863.jpeg`, alt: "Tiger", location: "Karnataka, India" },
  { src: `${BASE}images/2C1A9250.jpeg`, alt: "Tickell's Blue Flycatcher", location: "Karnataka, India" },
  { src: `${BASE}images/2C1A9415.jpeg`, alt: "Crested Serpent Eagle", location: "Karnataka, India" },
  { src: `${BASE}images/2C1A9894.jpeg`, alt: "Oriental White Eye", location: "Uttarakhand, India" },
];

const FEATURES: Feature[] = [
  { num: "01", icon: "◈", title: "Species Intelligence", desc: "Tag every sighting with species data, conservation status, and IUCN classifications — automatically enriched from global biodiversity databases." },
  { num: "02", icon: "◉", title: "Field Journal Feed", desc: "A feed that feels like flipping through a naturalist's notebook. Curated by ecosystems, migration patterns, and conservation urgency." },
  { num: "03", icon: "◎", title: "Verified Sightings", desc: "Community-validated wildlife observations with geolocation, timestamp metadata, and expert naturalist verification badges." },
  { num: "04", icon: "⬡", title: "Habitat Maps", desc: "Pin sightings on living range maps. Watch species distributions shift in real time as your community documents the wild." },
  { num: "05", icon: "◇", title: "Conservation Alerts", desc: "Follow endangered species. Receive updates when a tracked animal is spotted — and when they aren't." },
  { num: "06", icon: "◈", title: "Research Grade Exports", desc: "Export your field data in Darwin Core format, directly shareable with iNaturalist, GBIF, and research institutions worldwide." },
];

export default function FaunaWaitlist() {
  const [form, setForm] = useState<WaitlistForm>({ email: "", status: "idle", errorMessage: "" });
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState<Photo | null>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`;
        dotRef.current.style.top = `${e.clientY}px`;
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (activePhoto) setActivePhoto(null);
        else if (galleryOpen) setGalleryOpen(false);
      }
      if (e.key === "ArrowRight" && activePhoto) {
        const idx = PHOTOS.indexOf(activePhoto);
        setActivePhoto(PHOTOS[(idx + 1) % PHOTOS.length]);
      }
      if (e.key === "ArrowLeft" && activePhoto) {
        const idx = PHOTOS.indexOf(activePhoto);
        setActivePhoto(PHOTOS[(idx - 1 + PHOTOS.length) % PHOTOS.length]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activePhoto, galleryOpen]);

  useEffect(() => {
    document.body.style.overflow = galleryOpen || activePhoto ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [galleryOpen, activePhoto]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setForm((f) => ({ ...f, status: "loading", errorMessage: "" }));
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      if (res.ok) {
        setForm((f) => ({ ...f, status: "success" }));
      } else if (res.status === 409) {
        setForm((f) => ({ ...f, status: "error", errorMessage: "You're already on the list!" }));
      } else {
        setForm((f) => ({ ...f, status: "error", errorMessage: "Something went wrong. Please try again." }));
      }
    } catch {
      setForm((f) => ({ ...f, status: "error", errorMessage: "Something went wrong. Please try again." }));
    }
  };

  const openPhoto = (photo: Photo) => {
    setActivePhoto(photo);
    setGalleryOpen(false);
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activePhoto) return;
    const idx = PHOTOS.indexOf(activePhoto);
    setActivePhoto(PHOTOS[(idx - 1 + PHOTOS.length) % PHOTOS.length]);
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activePhoto) return;
    const idx = PHOTOS.indexOf(activePhoto);
    setActivePhoto(PHOTOS[(idx + 1) % PHOTOS.length]);
  };

  return (
    <div
      className="min-h-screen bg-[#070b06] text-[#ede8df] flex flex-col cursor-none"
      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", scrollBehavior: "smooth" }}
    >
      {/* Grain overlay */}
      <div
        className="fixed inset-0 z-[9990] pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "160px",
        }}
      />

      <div
        ref={dotRef}
        className="fixed w-2 h-2 bg-[#c9a96e] rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2"
        style={{ transition: "left 0.05s, top 0.05s" }}
      />

      <nav className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-between px-12 py-7 bg-gradient-to-b from-[rgba(7,11,6,0.95)] to-transparent backdrop-blur-md">
        <span className="text-2xl tracking-[0.22em] font-light">
          F<span className="text-[#c9a96e]">A</span>UNA
        </span>
        <div className="flex items-center gap-8">
          <button
            onClick={() => setGalleryOpen(true)}
            className="text-[0.72rem] tracking-[0.2em] uppercase text-[#7a7670] hover:text-[#c9a96e] transition-colors cursor-none bg-transparent border-none"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Gallery
          </button>
          <a
            href="#waitlist"
            className="text-[0.72rem] tracking-[0.2em] uppercase text-[#7a7670] hover:text-[#c9a96e] transition-colors cursor-none no-underline"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Join
          </a>
        </div>
      </nav>

      <main
        id="waitlist"
        className="relative flex-1 flex flex-col items-center justify-center text-center px-6 pt-36 pb-32 overflow-hidden"
      >
        <div
          className="absolute inset-0 z-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 70% at 50% 45%, rgba(24,43,16,0.6) 0%, transparent 70%),
              radial-gradient(ellipse 60% 50% at 80% 20%, rgba(201,169,110,0.04) 0%, transparent 65%),
              radial-gradient(ellipse 110% 45% at 50% 100%, rgba(7,11,6,1) 0%, transparent 60%)
            `,
          }}
        />

        <div className="relative z-10 flex flex-col items-center" style={{ animation: "fadeInUp 1s ease-out both" }}>
          <p
            className="text-[0.7rem] tracking-[0.28em] uppercase text-[#c9a96e] mb-8 flex items-center gap-3"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            <span className="w-8 h-px bg-[#c9a96e] opacity-60 inline-block" />
            Coming soon · Private beta
            <span className="w-8 h-px bg-[#c9a96e] opacity-60 inline-block" />
          </p>

          <h1 className="font-light leading-none tracking-tight mb-5" style={{ fontSize: "clamp(3.8rem, 9vw, 7.5rem)", animation: "fadeInUp 1s ease-out 0.15s both" }}>
            Where the
            <br />
            <em className="text-[#c9a96e] italic" style={{ textShadow: "0 0 30px rgba(201,169,110,0.3), 0 0 60px rgba(201,169,110,0.1)" }}>Wild Speaks</em>
          </h1>

          <p className="text-[#7a7670] italic leading-relaxed mb-16" style={{ fontSize: "clamp(1rem, 2vw, 1.4rem)", animation: "fadeInUp 1s ease-out 0.3s both" }}>
            A home for naturalists, wildlife photographers,
            <br />
            and those who still choose the wild.
          </p>

          {form.status !== "success" ? (
            <>
              <form
                onSubmit={handleSubmit}
                className="flex w-full max-w-md mb-4 border border-white/10 overflow-hidden rounded-sm focus-within:border-[#c9a96e]/40 focus-within:shadow-[0_0_20px_rgba(201,169,110,0.08)] transition-all duration-300"
              >
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value, status: f.status === "error" ? "idle" : f.status, errorMessage: "" }))}
                  className="flex-1 bg-white/[0.04] border-none outline-none px-5 py-3.5 text-[#ede8df] text-sm placeholder:text-[#7a7670]"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                />
                <button
                  type="submit"
                  disabled={form.status === "loading"}
                  className="bg-[#c9a96e] text-[#070b06] px-6 py-3.5 text-[0.78rem] font-semibold tracking-[0.1em] uppercase cursor-none whitespace-nowrap hover:bg-[#d4b880] transition-colors disabled:opacity-60"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {form.status === "loading" ? "Joining..." : "Join Waitlist"}
                </button>
              </form>
              {form.status === "error" && (
                <p className="text-[#c06060] text-sm tracking-wide mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {form.errorMessage}
                </p>
              )}
            </>
          ) : (
            <div
              className="px-8 py-4 border border-[#c9a96e]/30 text-[#c9a96e] text-sm tracking-wide mb-4"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              ✦ &nbsp; You're on the list — we'll be in touch.
            </div>
          )}

          <p className="text-[0.72rem] text-[#5a5650] tracking-widest" style={{ fontFamily: "'DM Mono', monospace" }}>
            <span className="text-[#c9a96e]">1,247</span> naturalists already waiting
          </p>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <span className="text-[0.6rem] tracking-[0.25em] uppercase text-[#7a7670]" style={{ fontFamily: "'DM Mono', monospace" }}>
            Scroll
          </span>
          <div className="w-px h-12 bg-gradient-to-b from-[#c9a96e] to-transparent" />
        </div>
      </main>

      <div className="flex items-center gap-5 px-12 py-2 opacity-20">
        <div className="flex-1 h-px bg-white/20" />
        <span className="text-[#c9a96e] text-[0.6rem] tracking-[0.3em]" style={{ fontFamily: "'DM Mono', monospace" }}>✦ FAUNA ✦</span>
        <div className="flex-1 h-px bg-white/20" />
      </div>

      <section className="w-full max-w-[1200px] mx-auto px-12 py-24">
        <p
          className="text-[0.66rem] tracking-[0.3em] uppercase text-[#c9a96e] mb-14 flex items-center gap-3"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          What awaits
          <span className="w-16 h-px bg-[#c9a96e] opacity-40 inline-block" />
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border border-white/[0.07]" style={{ gap: 1, background: "rgba(255,255,255,0.07)" }}>
          {FEATURES.map((f) => (
            <div
              key={f.num}
              className="bg-[#070b06] p-12 relative overflow-hidden group hover:bg-[#111708] transition-all duration-300 hover:scale-[1.01]"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-0 left-0 bottom-0 w-px bg-[#c9a96e] opacity-0 group-hover:opacity-40 transition-opacity duration-300" />

              <div className="font-light text-[#3e3d3a] opacity-60 mb-5 leading-none transition-opacity duration-300" style={{ fontSize: "3.5rem" }}>
                {f.num}
              </div>
              <span className="text-[#c9a96e] text-xl mb-4 block">{f.icon}</span>
              <h3 className="text-xl font-normal text-[#ede8df] mb-3 leading-tight">{f.title}</h3>
              <p className="text-sm text-[#7a7670] leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-5 px-12 py-2 opacity-20">
        <div className="flex-1 h-px bg-white/20" />
        <span className="text-[#c9a96e] text-[0.6rem] tracking-[0.3em]" style={{ fontFamily: "'DM Mono', monospace" }}>✦</span>
        <div className="flex-1 h-px bg-white/20" />
      </div>

      <section id="gallery" className="w-full max-w-[1400px] mx-auto px-12 py-24 text-center">
        <p
          className="text-[0.72rem] tracking-[0.25em] uppercase text-[#c9a96e] mb-4"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          — From the field
        </p>
        <h2 className="font-light tracking-tight mb-4" style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)" }}>
          The Wild, Documented
        </h2>
        <p className="text-base text-[#7a7670] italic mb-16" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Every image captured in the field. Every moment earned.
        </p>

        <div className="[columns:3_280px] gap-4 text-left">
          {PHOTOS.map((photo, i) => (
            <div
              key={i}
              className="relative break-inside-avoid mb-4 overflow-hidden rounded-sm group cursor-none"
              onClick={() => openPhoto(photo)}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                loading="eager"
                className="w-full block brightness-[0.82] saturate-[0.7] transition-all duration-500 group-hover:brightness-100 group-hover:saturate-100 group-hover:scale-[1.04]"
              />
              <div className="absolute bottom-0 left-0 right-0 px-4 pt-10 pb-4 bg-gradient-to-t from-[rgba(7,11,6,0.9)] to-transparent flex flex-col gap-1 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400">
                <span className="text-sm text-[#ede8df] italic">{photo.alt}</span>
                <span className="text-[0.65rem] text-[#c9a96e] tracking-widest" style={{ fontFamily: "'DM Mono', monospace" }}>◎ {photo.location}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative w-full bg-[#0c1109] border-t border-b border-white/[0.06] overflow-hidden">
        <div
          className="absolute top-1/2 -translate-y-1/2 left-0 pointer-events-none select-none"
          style={{ fontSize: "18vw", color: "rgba(255,255,255,0.015)", fontWeight: 300, whiteSpace: "nowrap" }}
        >
          FAUNA
        </div>

        <div className="relative z-10 max-w-[1200px] mx-auto px-12 py-28 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div>
            <p
              className="text-[0.66rem] tracking-[0.3em] uppercase text-[#c9a96e] mb-8 flex items-center gap-3"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Our purpose
              <span className="w-16 h-px bg-[#c9a96e] opacity-40 inline-block" />
            </p>
            <h2 className="font-light leading-tight mb-7" style={{ fontSize: "clamp(2.2rem, 4vw, 3.6rem)" }}>
              Built for those who
              <br />
              <em className="text-[#c9a96e] italic">still choose the wild</em>
            </h2>
            <p className="text-sm text-[#7a7670] leading-[1.9] mb-10" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Every sighting documented on Fauna contributes to a growing dataset used by conservation
              researchers worldwide. We believe citizen science is the most powerful tool we have left —
              and every photograph, every field note, every observation matters.
              <br /><br />
              30% of every premium subscription funds direct conservation programmes across six continents.
            </p>

            <div className="flex gap-12">
              {[
                { num: "10k+", label: "Species tracked\nby our community" },
                { num: "4.2M", label: "Sightings\nsubmitted to GBIF" },
                { num: "30%", label: "Revenue goes\nto conservation" },
              ].map((s) => (
                <div key={s.num} className="border-l border-[#c9a96e]/20 pl-5">
                  <div className="font-light text-[#c9a96e] leading-none mb-1" style={{ fontSize: "3rem" }}>{s.num}</div>
                  <div className="text-[0.72rem] text-[#7a7670] leading-relaxed whitespace-pre-line" style={{ fontFamily: "'DM Sans', sans-serif" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p
              className="text-[0.66rem] tracking-[0.3em] uppercase text-[#c9a96e] mb-6 flex items-center gap-3"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Conservation status
              <span className="w-10 h-px bg-[#c9a96e] opacity-40 inline-block" />
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { status: "CR", statusClass: "bg-[rgba(180,60,60,0.15)] text-[#c06060] border-[rgba(180,60,60,0.25)]", name: "Amur Leopard", sci: "Panthera pardus orientalis" },
                { status: "EN", statusClass: "bg-[rgba(180,120,40,0.15)] text-[#c0903a] border-[rgba(180,120,40,0.25)]", name: "African Elephant", sci: "Loxodonta africana" },
                { status: "VU", statusClass: "bg-[rgba(160,140,40,0.15)] text-[#a89a38] border-[rgba(160,140,40,0.25)]", name: "Polar Bear", sci: "Ursus maritimus" },
                { status: "LC", statusClass: "bg-[rgba(60,140,80,0.12)] text-[#5aaa72] border-[rgba(60,140,80,0.2)]", name: "Red Fox", sci: "Vulpes vulpes" },
              ].map((sp) => (
                <div
                  key={sp.name}
                  className="bg-[#111708] border border-white/[0.07] p-5 hover:border-[#c9a96e]/30 hover:scale-[1.02] hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300"
                  style={{ borderRadius: 1 }}
                >
                  <span
                    className={`text-[0.58rem] tracking-[0.15em] uppercase px-2 py-0.5 border mb-3 inline-block ${sp.statusClass}`}
                    style={{ fontFamily: "'DM Mono', monospace", borderRadius: 1 }}
                  >
                    {sp.status}
                  </span>
                  <div className="text-sm text-[#ede8df] mb-1">{sp.name}</div>
                  <div className="text-[0.64rem] text-[#3e3d3a] italic" style={{ fontFamily: "'DM Mono', monospace" }}>{sp.sci}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] px-12 pt-20 pb-14">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col lg:flex-row justify-between gap-16 mb-20">
            <div>
              <div className="text-2xl tracking-[0.15em] font-light mb-3">
                F<span className="text-[#c9a96e]">A</span>UNA
              </div>
              <div className="text-sm text-[#7a7670] italic">Where the wild speaks.</div>
            </div>

            <div className="flex gap-16 flex-wrap">
              {[
                { title: "Platform", links: ["Features", "Conservation", "Field Guide", "Species Map"] },
                { title: "Community", links: ["Naturalists", "Researchers", "Photographers", "Educators"] },
                { title: "Company", links: ["About", "Blog", "Privacy", "Contact"] },
              ].map((col) => (
                <div key={col.title}>
                  <h4
                    className="text-[0.64rem] tracking-[0.22em] uppercase text-[#c9a96e] mb-5"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    {col.title}
                  </h4>
                  <ul className="flex flex-col gap-3">
                    {col.links.map((link) => (
                      <li key={link}>
                        <a
                          href="#"
                          className="text-sm text-[#7a7670] hover:text-[#ede8df] transition-colors cursor-none no-underline hover:underline underline-offset-4 decoration-[#c9a96e]/30"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-8 border-t border-white/[0.06] flex-wrap gap-4">
            <span className="text-[0.62rem] text-[#3e3d3a] tracking-widest" style={{ fontFamily: "'DM Mono', monospace" }}>
              © 2025 Fauna · All rights reserved
            </span>
            <div className="flex gap-6">
              {["Twitter", "Instagram", "Discord"].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="text-[0.62rem] tracking-[0.15em] uppercase text-[#7a7670] hover:text-[#c9a96e] transition-colors cursor-none no-underline"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  {s}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {galleryOpen && (
        <div
          className="fixed inset-0 bg-[rgba(7,11,6,0.95)] backdrop-blur-sm z-[500] flex flex-col overflow-hidden"
          onClick={() => setGalleryOpen(false)}
        >
          <div className="flex flex-col h-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-12 py-6 border-b border-white/[0.06] shrink-0">
              <span className="text-xl tracking-[0.15em] font-light">
                F<span className="text-[#c9a96e]">A</span>UNA — Field Gallery
              </span>
              <button
                onClick={() => setGalleryOpen(false)}
                className="text-[#7a7670] hover:text-[#ede8df] transition-colors cursor-none bg-transparent border-none text-base px-2 py-1"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-2 p-6 overflow-y-auto flex-1">
              {PHOTOS.map((photo, i) => (
                <div
                  key={i}
                  className="overflow-hidden aspect-[4/3] cursor-none group rounded-sm"
                  onClick={() => openPhoto(photo)}
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="w-full h-full object-cover brightness-[0.82] saturate-[0.7] transition-all duration-500 group-hover:brightness-100 group-hover:saturate-100 group-hover:scale-[1.06]"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activePhoto && (
        <div
          className="fixed inset-0 bg-[rgba(7,11,6,0.95)] backdrop-blur-md z-[600] flex flex-col items-center justify-center gap-4 cursor-none"
          onClick={() => setActivePhoto(null)}
        >
          <img
            src={activePhoto.src}
            alt={activePhoto.alt}
            className="max-w-[90vw] max-h-[80vh] object-contain drop-shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-sm text-[#ede8df] italic">{activePhoto.alt}</span>
            <span className="text-[0.65rem] text-[#c9a96e] tracking-widest" style={{ fontFamily: "'DM Mono', monospace" }}>
              ◎ {activePhoto.location}
            </span>
          </div>
          <span className="text-[0.65rem] text-[#3e3d3a] tracking-widest" style={{ fontFamily: "'DM Mono', monospace" }}>
            {PHOTOS.indexOf(activePhoto) + 1} / {PHOTOS.length}
          </span>

          <button onClick={() => setActivePhoto(null)} className="fixed top-6 right-12 text-[#7a7670] hover:text-[#ede8df] transition-colors cursor-none bg-transparent border-none text-base">✕</button>
          <button onClick={prevPhoto} className="fixed left-8 top-1/2 -translate-y-1/2 text-[#7a7670] hover:text-[#c9a96e] transition-all duration-300 hover:scale-110 cursor-none bg-transparent border-none text-2xl">←</button>
          <button onClick={nextPhoto} className="fixed right-8 top-1/2 -translate-y-1/2 text-[#7a7670] hover:text-[#c9a96e] transition-all duration-300 hover:scale-110 cursor-none bg-transparent border-none text-2xl">→</button>
        </div>
      )}
    </div>
  );
}