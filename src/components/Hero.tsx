import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { getHeroSlides, starterSlides } from "@/lib/content";
import { mediaUrl, siteHref } from "@/lib/media";

const Hero = () => {
  const { data: loadedSlides, isError } = useQuery({ queryKey: ["hero-slides"], queryFn: getHeroSlides });
  const slides = isError ? starterSlides : loadedSlides ?? starterSlides;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();
  const slide = slides[active];

  useEffect(() => {
    if (active >= slides.length) setActive(0);
  }, [active, slides.length]);

  useEffect(() => {
    if (slides.length < 2 || paused || interactionPaused || reducedMotion) return;
    const delay = slides[active]?.media_type === "video" ? 20000 : 7000;
    const timer = window.setTimeout(() => setActive((index) => (index + 1) % slides.length), delay);
    return () => window.clearTimeout(timer);
  }, [active, paused, interactionPaused, reducedMotion, slides]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (paused || interactionPaused || reducedMotion) video.pause();
    else void video.play().catch(() => undefined);
  }, [active, paused, interactionPaused, reducedMotion, slide?.id]);

  const move = (direction: number) => setActive((index) => (index + direction + slides.length) % slides.length);

  return (
    <section id="home" aria-label="Featured experiences" onMouseEnter={() => setInteractionPaused(true)} onMouseLeave={() => setInteractionPaused(false)} onFocusCapture={() => setInteractionPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setInteractionPaused(false); }} className="relative min-h-[680px] min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {slide && (
        <div className="absolute inset-0" key={slide.id}>
          {slide.media_type === "video" ? (
            <video
              ref={videoRef}
              src={mediaUrl(slide.media_path)}
              poster={mediaUrl(slide.poster_path)}
              autoPlay={!reducedMotion && !paused}
              muted
              playsInline
              onEnded={() => slides.length > 1 && move(1)}
              className="h-full w-full object-cover"
              aria-hidden="true"
            />
          ) : (
            <img src={mediaUrl(slide.media_path)} alt="" className="h-full w-full object-cover" fetchPriority="high" />
          )}
          <div className="absolute inset-0 bg-background/75" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/30" />
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-36 text-center">
        <span className="mb-6 inline-block rounded-full border border-white/20 px-4 py-1.5 font-display text-xs uppercase tracking-widest text-foreground/80">
          Kenya's Premier Event Experience Company
        </span>
        <h1 className="mx-auto mb-8 max-w-5xl font-display text-5xl font-bold leading-[0.98] tracking-tight text-foreground sm:text-7xl lg:text-8xl">
          {slide?.title ?? "Unforgettable Experiences"}
        </h1>
        {slide?.subtitle && <p className="mx-auto mb-10 max-w-2xl font-body text-lg leading-relaxed text-foreground/80 sm:text-xl">{slide.subtitle}</p>}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {slide?.cta_label && slide.cta_href && (
            <a href={siteHref(slide.cta_href)} className="rounded-full px-8 py-4 font-display text-sm font-semibold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
              {slide.cta_label}
            </a>
          )}
          <a href={`${import.meta.env.BASE_URL}events`} className="rounded-full border border-white/30 px-8 py-4 font-display text-sm font-semibold text-foreground hover:border-primary/70">
            Explore Events
          </a>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/20 bg-background/70 px-3 py-2 backdrop-blur-md" aria-label="Hero slideshow controls">
          <button type="button" onClick={() => move(-1)} aria-label="Previous slide" className="rounded-full p-2 text-foreground hover:bg-white/10"><ChevronLeft size={20} /></button>
          <span className="min-w-12 text-center text-xs text-foreground">{active + 1} / {slides.length}</span>
          <button type="button" onClick={() => move(1)} aria-label="Next slide" className="rounded-full p-2 text-foreground hover:bg-white/10"><ChevronRight size={20} /></button>
          <button type="button" onClick={() => setPaused((value) => !value)} aria-label={paused ? "Play slideshow" : "Pause slideshow"} className="rounded-full p-2 text-foreground hover:bg-white/10">
            {paused ? <Play size={18} /> : <Pause size={18} />}
          </button>
        </div>
      )}
    </section>
  );
};

export default Hero;
