import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import EventCard from "@/components/EventCard";
import { getEvents } from "@/lib/content";

export default function Events() {
  const { data: events = [], isLoading, isError } = useQuery({ queryKey: ["events"], queryFn: getEvents });
  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 pb-28 pt-40">
        <span className="mb-4 block text-xs uppercase tracking-[0.3em] text-secondary">Moments we made</span>
        <h1 className="mb-5 font-display text-5xl font-bold sm:text-7xl">Our <span className="gradient-text">Events</span></h1>
        <p className="mb-14 max-w-2xl text-lg leading-relaxed text-muted-foreground">Explore the experiences, celebrations, and brand moments we helped bring to life.</p>
        {isLoading && <p className="text-muted-foreground">Loading events…</p>}
        {isError && <p role="alert" className="text-muted-foreground">Events could not be loaded right now. Please try again later.</p>}
        {!isLoading && !isError && (events.length ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{events.map((event) => <EventCard key={event.id} event={event} />)}</div>
        ) : <p className="rounded-2xl border border-border p-8 text-muted-foreground">New event stories are coming soon.</p>)}
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
