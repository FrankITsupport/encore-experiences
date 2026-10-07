import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { getEvent } from "@/lib/content";
import { mediaUrl } from "@/lib/media";

export default function EventDetail() {
  const { slug = "" } = useParams();
  const { data: event, isLoading, isError } = useQuery({ queryKey: ["event", slug], queryFn: () => getEvent(slug), enabled: !!slug });

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 pb-28 pt-36">
        <Link to="/events" className="mb-10 inline-block text-sm text-secondary hover:underline">← All events</Link>
        {isLoading && <p className="text-muted-foreground">Loading event…</p>}
        {isError && <p role="alert" className="text-muted-foreground">This event could not be loaded right now.</p>}
        {!isLoading && !isError && !event && <div><h1 className="mb-4 text-4xl font-bold">Event not found</h1><p className="text-muted-foreground">This event is unavailable or has not been published.</p></div>}
        {event && (
          <article>
            {event.event_date && <p className="mb-3 text-sm uppercase tracking-widest text-secondary">{new Intl.DateTimeFormat("en-KE", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${event.event_date}T12:00:00Z`))}{event.location && ` · ${event.location}`}</p>}
            <h1 className="mb-6 font-display text-5xl font-bold leading-tight sm:text-7xl">{event.title}</h1>
            <p className="mb-12 max-w-3xl text-xl leading-relaxed text-muted-foreground">{event.summary}</p>
            <img src={mediaUrl(event.cover_path)} alt={event.title} className="mb-12 aspect-video w-full rounded-2xl object-cover" />
            {event.body && <div className="mb-16 max-w-3xl space-y-5 text-lg leading-relaxed text-foreground/85">{event.body.split(/\n\s*\n/).map((paragraph, index) => <p key={index} className="whitespace-pre-line">{paragraph}</p>)}</div>}
            {!!event.event_images?.length && (
              <section aria-labelledby="gallery-heading">
                <h2 id="gallery-heading" className="mb-8 font-display text-3xl font-bold">Event gallery</h2>
                <div className="grid gap-6 sm:grid-cols-2">
                  {event.event_images.map((image) => <figure key={image.id} className="overflow-hidden rounded-2xl border border-border bg-card"><img src={mediaUrl(image.image_path)} alt={image.alt_text || event.title} loading="lazy" className="aspect-[4/3] w-full object-cover" />{image.caption && <figcaption className="p-4 text-sm text-muted-foreground">{image.caption}</figcaption>}</figure>)}
                </div>
              </section>
            )}
          </article>
        )}
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
