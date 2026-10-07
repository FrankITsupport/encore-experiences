import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import EventCard from "./EventCard";
import { getEvents } from "@/lib/content";

export default function EventsPreview() {
  const { data: events = [] } = useQuery({ queryKey: ["events"], queryFn: getEvents });
  if (events.length === 0) return null;

  return (
    <section className="px-6 py-28" aria-labelledby="recent-events-heading">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="mb-3 block text-xs uppercase tracking-[0.3em] text-secondary">Our work</span>
            <h2 id="recent-events-heading" className="font-display text-4xl font-bold sm:text-5xl">Recent <span className="gradient-text">Events</span></h2>
          </div>
          <Link to="/events" className="rounded-full border border-border px-6 py-3 text-sm font-semibold hover:border-primary/60">View all events →</Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">{events.slice(0, 3).map((event) => <EventCard key={event.id} event={event} />)}</div>
      </div>
    </section>
  );
}
