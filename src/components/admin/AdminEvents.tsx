import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { EventImage, EventItem } from "@/lib/content";
import { mediaUrl } from "@/lib/media";
import { adminEvents, adminImages, deleteRecord, saveRecord, swapRecords } from "@/lib/adminData";
import MediaUpload from "./MediaUpload";

const inputClass = "w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary";
const emptyEvent = { title: "", slug: "", summary: "", body: "", event_date: "", location: "", cover_path: "", published: false };
type EventForm = typeof emptyEvent;

function EventPhoto({ image, onSaved }: { image: EventImage; onSaved: () => void }) {
  const [altText, setAltText] = useState(image.alt_text);
  const [caption, setCaption] = useState(image.caption);
  const [error, setError] = useState("");

  async function save() {
    try { await saveRecord("event_images", { alt_text: altText.trim(), caption: caption.trim() }, image.id); setError(""); onSaved(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save photo text."); }
  }

  async function remove() {
    if (!window.confirm("Remove this photo from the event?")) return;
    try { await deleteRecord("event_images", image.id); setError(""); onSaved(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not remove photo."); }
  }

  return (
    <div className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-[100px_1fr]">
      <img src={mediaUrl(image.image_path)} alt="" className="h-24 w-24 rounded-lg object-cover" />
      <div className="space-y-3">
        <input aria-label="Photo alt text" value={altText} onChange={(event) => setAltText(event.target.value)} placeholder="Describe this photo" className={inputClass} />
        <input aria-label="Photo caption" value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="Optional caption" className={inputClass} />
        <div className="flex gap-3 text-sm"><button type="button" onClick={() => void save()} className="text-secondary">Save photo text</button><button type="button" onClick={() => void remove()} className="text-destructive">Remove</button></div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}

export default function AdminEvents() {
  const queryClient = useQueryClient();
  const { data: events = [], isLoading, error: loadError } = useQuery<EventItem[]>({ queryKey: ["admin-events"], queryFn: adminEvents, refetchOnWindowFocus: false });
  const [selectedId, setSelectedId] = useState("");
  const selected = events.find((item) => item.id === selectedId);
  const [form, setForm] = useState<EventForm>(emptyEvent);
  const [message, setMessage] = useState("");
  const [newImageAlt, setNewImageAlt] = useState("");
  const [saving, setSaving] = useState(false);
  const { data: images = [] } = useQuery<EventImage[]>({ queryKey: ["admin-event-images", selectedId], enabled: !!selectedId, queryFn: () => adminImages(selectedId) });

  useEffect(() => {
    setForm(selected ? { title: selected.title, slug: selected.slug, summary: selected.summary, body: selected.body, event_date: selected.event_date ?? "", location: selected.location, cover_path: selected.cover_path, published: selected.published } : emptyEvent);
    setMessage("");
  }, [selected]);

  async function saveEvent() {
    setMessage("");
    if (!form.title.trim()) return setMessage("Add an event title.");
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(form.slug)) return setMessage("Use a URL slug with lowercase letters, numbers, and hyphens.");
    if (form.published && !form.cover_path) return setMessage("Add a cover image before publishing.");
    if (form.published && !form.summary.trim()) return setMessage("Add a short summary before publishing.");
    if (form.published && images.length === 0) return setMessage("Add at least one gallery photo before publishing.");
    if (form.published && images.some((image) => !image.alt_text.trim())) return setMessage("Add alt text for every gallery photo before publishing.");
    setSaving(true);
    const payload = { title: form.title.trim(), slug: form.slug, summary: form.summary.trim(), body: form.body.trim(), event_date: form.event_date || null, location: form.location.trim(), cover_path: form.cover_path, published: form.published, updated_at: new Date().toISOString() };
    let result: { id: string };
    try { result = await saveRecord("events", payload, selectedId || undefined); }
    catch (cause) { setSaving(false); return setMessage(cause instanceof Error ? cause.message : "Could not save event."); }
    setSaving(false);
    setSelectedId(result.id);
    setMessage("Event saved.");
    await queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    await queryClient.invalidateQueries({ queryKey: ["events"] });
    await queryClient.invalidateQueries({ queryKey: ["event", form.slug] });
  }

  async function addImage(path: string) {
    if (!selectedId) return;
    const position = Math.max(-1, ...images.map((image) => image.position)) + 1;
    await saveRecord("event_images", { event_id: selectedId, image_path: path, alt_text: newImageAlt.trim(), caption: "", position });
    setNewImageAlt("");
    await queryClient.invalidateQueries({ queryKey: ["admin-event-images", selectedId] });
    await queryClient.invalidateQueries({ queryKey: ["event", form.slug] });
  }

  async function moveImage(index: number, direction: number) {
    const other = images[index + direction];
    if (!other) return;
    try { await swapRecords("event_images", images[index].id, other.id); }
    catch (cause) { return setMessage(cause instanceof Error ? cause.message : "Could not reorder images."); }
    await queryClient.invalidateQueries({ queryKey: ["admin-event-images", selectedId] });
    await queryClient.invalidateQueries({ queryKey: ["event", form.slug] });
  }

  async function removeEvent() {
    if (!selectedId || !window.confirm("Delete this event and its gallery records? Uploaded files will remain in storage.")) return;
    try { await deleteRecord("events", selectedId); }
    catch (cause) { return setMessage(cause instanceof Error ? cause.message : "Could not delete event."); }
    setSelectedId("");
    await queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    await queryClient.invalidateQueries({ queryKey: ["events"] });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-2">
        <button type="button" onClick={() => { setSelectedId(""); setForm(emptyEvent); setMessage(""); }} className="w-full rounded-xl bg-primary px-4 py-3 text-left text-sm font-semibold text-primary-foreground">+ New event</button>
        {isLoading && <p className="text-sm text-muted-foreground">Loading events…</p>}
        {loadError && <p role="alert" className="text-sm text-destructive">{loadError.message}</p>}
        {events.map((event) => <button type="button" key={event.id} onClick={() => setSelectedId(event.id)} className={`w-full rounded-xl border p-4 text-left text-sm ${selectedId === event.id ? "border-primary bg-muted" : "border-border"}`}><strong className="block">{event.title}</strong><span className="text-xs text-muted-foreground">{event.published ? "Published" : "Draft"}</span></button>)}
      </aside>
      <div className="space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4"><h2 className="text-2xl font-bold">{selected ? "Edit event" : "Create event"}</h2>{selected && <button type="button" onClick={() => void removeEvent()} className="text-sm text-destructive">Delete event</button>}</div>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2 text-sm">Title<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value, slug: selectedId ? form.slug : event.target.value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") })} className={inputClass} /></label>
          <label className="space-y-2 text-sm">URL slug<input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} className={inputClass} /></label>
          <label className="space-y-2 text-sm">Event date<input type="date" value={form.event_date} onChange={(event) => setForm({ ...form, event_date: event.target.value })} className={inputClass} /></label>
          <label className="space-y-2 text-sm">Location<input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} className={inputClass} /></label>
        </div>
        <label className="block space-y-2 text-sm">Short summary<textarea rows={3} value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} className={inputClass} /></label>
        <label className="block space-y-2 text-sm">Event write-up <span className="text-muted-foreground">(separate paragraphs with a blank line)</span><textarea rows={9} value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} className={inputClass} /></label>
        <MediaUpload label="Cover image" value={form.cover_path} folder="events" onChange={(path) => setForm((current) => ({ ...current, cover_path: path }))} />
        <details className="rounded-xl border border-border p-5"><summary className="cursor-pointer text-sm font-semibold">Preview event text</summary><div className="mt-5 space-y-4"><h3 className="text-3xl font-bold">{form.title || "Event title"}</h3><p className="text-muted-foreground">{form.summary || "Event summary"}</p><div className="space-y-4">{form.body.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index} className="whitespace-pre-line">{paragraph}</p>)}</div></div></details>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} /> Publish event</label>
        {!selectedId && <p className="text-xs text-muted-foreground">Save as a draft first, add gallery photos and alt text, then publish.</p>}
        <button type="button" disabled={saving} onClick={() => void saveEvent()} className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">{saving ? "Saving…" : "Save event"}</button>
        {message && <p role="status" className="text-sm text-secondary">{message}</p>}
        {selected && <div className="border-t border-border pt-7"><h3 className="mb-4 text-xl font-semibold">Gallery photos</h3><p className="mb-5 text-sm text-muted-foreground">Describe the photo, upload it, then use the arrows to set its order.</p><label className="block space-y-2 text-sm">Description for new photo<input value={newImageAlt} onChange={(event) => setNewImageAlt(event.target.value)} placeholder="Guests enjoying the 360° booth" className={inputClass} /></label><div className="mt-4"><MediaUpload label="Add gallery photo" value="" folder="events" disabled={!newImageAlt.trim()} onChange={addImage} /></div><div className="mt-6 space-y-4">{images.map((image, index) => <div key={image.id}><EventPhoto image={image} onSaved={() => { void queryClient.invalidateQueries({ queryKey: ["admin-event-images", selectedId] }); void queryClient.invalidateQueries({ queryKey: ["event", form.slug] }); }} /><div className="mt-2 flex gap-4 text-sm"><button type="button" disabled={index === 0} onClick={() => void moveImage(index, -1)} className="text-secondary disabled:opacity-30">Move up</button><button type="button" disabled={index === images.length - 1} onClick={() => void moveImage(index, 1)} className="text-secondary disabled:opacity-30">Move down</button></div></div>)}</div></div>}
      </div>
    </div>
  );
}
