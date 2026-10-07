import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { HeroSlide } from "@/lib/content";
import { adminSlides, deleteRecord, saveRecord, swapRecords } from "@/lib/adminData";
import MediaUpload from "./MediaUpload";

const inputClass = "w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary";
const emptySlide = { title: "", subtitle: "", media_type: "image" as "image" | "video", media_path: "", poster_path: "", cta_label: "", cta_href: "", enabled: false };

export default function AdminHero() {
  const queryClient = useQueryClient();
  const { data: slides = [], isLoading, error: loadError } = useQuery<HeroSlide[]>({ queryKey: ["admin-slides"], queryFn: adminSlides, refetchOnWindowFocus: false });
  const [selectedId, setSelectedId] = useState("");
  const selected = slides.find((item) => item.id === selectedId);
  const [form, setForm] = useState(emptySlide);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(selected ? { title: selected.title, subtitle: selected.subtitle, media_type: selected.media_type, media_path: selected.media_path, poster_path: selected.poster_path, cta_label: selected.cta_label, cta_href: selected.cta_href, enabled: selected.enabled } : emptySlide);
    setMessage("");
  }, [selected]);

  async function saveSlide() {
    setMessage("");
    if (!form.media_path) return setMessage("Upload an image or video.");
    if (form.media_type === "video" && !form.poster_path) return setMessage("Add a poster image for the video.");
    if (form.cta_href && !/^(#|\/(?!\/)|https:\/\/)/.test(form.cta_href)) return setMessage("CTA link must start with #, /, or https://.");
    setSaving(true);
    const payload = { ...form, title: form.title.trim(), subtitle: form.subtitle.trim(), cta_label: form.cta_label.trim(), cta_href: form.cta_href.trim(), position: selected?.position ?? Math.max(-1, ...slides.map((slide) => slide.position)) + 1 };
    let result: { id: string };
    try { result = await saveRecord("hero_slides", payload, selectedId || undefined); }
    catch (cause) { setSaving(false); return setMessage(cause instanceof Error ? cause.message : "Could not save slide."); }
    setSaving(false);
    setSelectedId(result.id);
    setMessage("Slide saved.");
    await queryClient.invalidateQueries({ queryKey: ["admin-slides"] });
    await queryClient.invalidateQueries({ queryKey: ["hero-slides"] });
  }

  async function moveSlide(index: number, direction: number) {
    const other = slides[index + direction];
    if (!other) return;
    try { await swapRecords("hero_slides", slides[index].id, other.id); }
    catch (cause) { return setMessage(cause instanceof Error ? cause.message : "Could not reorder slides."); }
    await queryClient.invalidateQueries({ queryKey: ["admin-slides"] });
    await queryClient.invalidateQueries({ queryKey: ["hero-slides"] });
  }

  async function removeSlide() {
    if (!selectedId || !window.confirm("Delete this slide? Its uploaded files will remain in storage.")) return;
    try { await deleteRecord("hero_slides", selectedId); }
    catch (cause) { return setMessage(cause instanceof Error ? cause.message : "Could not delete slide."); }
    setSelectedId("");
    await queryClient.invalidateQueries({ queryKey: ["admin-slides"] });
    await queryClient.invalidateQueries({ queryKey: ["hero-slides"] });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-2">
        <button type="button" onClick={() => { setSelectedId(""); setForm(emptySlide); setMessage(""); }} className="w-full rounded-xl bg-primary px-4 py-3 text-left text-sm font-semibold text-primary-foreground">+ New slide</button>
        {isLoading && <p className="text-sm text-muted-foreground">Loading slides…</p>}
        {loadError && <p role="alert" className="text-sm text-destructive">{loadError.message}</p>}
        {slides.map((slide, index) => <div key={slide.id} className={`rounded-xl border p-3 ${selectedId === slide.id ? "border-primary bg-muted" : "border-border"}`}><button type="button" onClick={() => setSelectedId(slide.id)} className="w-full text-left text-sm"><strong className="block">{slide.title || `${slide.media_type} slide`}</strong><span className="text-xs text-muted-foreground">{slide.enabled ? "Visible" : "Hidden"}</span></button><div className="mt-2 flex gap-4 text-xs"><button type="button" disabled={index === 0} onClick={() => void moveSlide(index, -1)} className="text-secondary disabled:opacity-30">Up</button><button type="button" disabled={index === slides.length - 1} onClick={() => void moveSlide(index, 1)} className="text-secondary disabled:opacity-30">Down</button></div></div>)}
      </aside>
      <div className="space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4"><h2 className="text-2xl font-bold">{selected ? "Edit hero slide" : "Create hero slide"}</h2>{selected && <button type="button" onClick={() => void removeSlide()} className="text-sm text-destructive">Delete slide</button>}</div>
        <label className="block space-y-2 text-sm">Slide type<select value={form.media_type} onChange={(event) => setForm({ ...form, media_type: event.target.value as "image" | "video", media_path: "", poster_path: "" })} className={inputClass}><option value="image">Image</option><option value="video">Video</option></select></label>
        <MediaUpload key={`${selectedId}-${form.media_type}`} label={form.media_type === "video" ? "Hero video (MP4 or WebM, max 50 MB)" : "Hero image"} value={form.media_path} folder="hero" kind={form.media_type} onChange={(path) => setForm((current) => ({ ...current, media_path: path }))} />
        {form.media_type === "video" && <MediaUpload label="Video poster image" value={form.poster_path} folder="hero" onChange={(path) => setForm((current) => ({ ...current, poster_path: path }))} />}
        <label className="block space-y-2 text-sm">Headline<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className={inputClass} /></label>
        <label className="block space-y-2 text-sm">Supporting text<textarea rows={3} value={form.subtitle} onChange={(event) => setForm({ ...form, subtitle: event.target.value })} className={inputClass} /></label>
        <div className="grid gap-5 sm:grid-cols-2"><label className="space-y-2 text-sm">Button text<input value={form.cta_label} onChange={(event) => setForm({ ...form, cta_label: event.target.value })} className={inputClass} /></label><label className="space-y-2 text-sm">Button link<input value={form.cta_href} onChange={(event) => setForm({ ...form, cta_href: event.target.value })} placeholder="#products or /events" className={inputClass} /></label></div>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={form.enabled} onChange={(event) => setForm({ ...form, enabled: event.target.checked })} /> Show this slide</label>
        <button type="button" disabled={saving} onClick={() => void saveSlide()} className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">{saving ? "Saving…" : "Save slide"}</button>
        {message && <p role="status" className="text-sm text-secondary">{message}</p>}
      </div>
    </div>
  );
}
