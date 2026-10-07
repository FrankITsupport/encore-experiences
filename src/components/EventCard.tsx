import { Link } from "react-router-dom";
import type { EventItem } from "@/lib/content";
import { mediaUrl } from "@/lib/media";

export default function EventCard({ event }: { event: EventItem }) {
  return (
    <Link to={`/events/${event.slug}`} className="group block overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/60">
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        <img src={mediaUrl(event.cover_path)} alt={event.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="p-6">
        {event.event_date && <p className="mb-2 text-xs uppercase tracking-widest text-secondary">{new Intl.DateTimeFormat("en-KE", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${event.event_date}T12:00:00Z`))}</p>}
        <h3 className="mb-2 font-display text-xl font-semibold text-foreground">{event.title}</h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{event.summary}</p>
        <span className="mt-5 inline-block text-sm font-semibold text-primary">View event →</span>
      </div>
    </Link>
  );
}
