import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { EquipmentItem } from "@/lib/content";
import { adminEquipment, deleteRecord, saveRecord, swapRecords } from "@/lib/adminData";
import MediaUpload from "./MediaUpload";

const inputClass = "w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary";
const emptyEquipment = { title: "", description: "", image_path: "", tag: "", published: false };

export default function AdminEquipment() {
  const queryClient = useQueryClient();
  const { data: equipment = [], isLoading, error: loadError } = useQuery<EquipmentItem[]>({ queryKey: ["admin-equipment"], queryFn: adminEquipment, refetchOnWindowFocus: false });
  const [selectedId, setSelectedId] = useState("");
  const selected = equipment.find((item) => item.id === selectedId);
  const [form, setForm] = useState(emptyEquipment);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(selected ? { title: selected.title, description: selected.description, image_path: selected.image_path, tag: selected.tag, published: selected.published } : emptyEquipment);
    setMessage("");
  }, [selected]);

  async function saveEquipment() {
    setMessage("");
    if (!form.title.trim()) return setMessage("Add an equipment name.");
    if (form.published && !form.image_path) return setMessage("Add an image before publishing.");
    setSaving(true);
    const payload = { ...form, title: form.title.trim(), description: form.description.trim(), tag: form.tag.trim(), position: selected?.position ?? Math.max(-1, ...equipment.map((item) => item.position)) + 1 };
    let result: { id: string };
    try { result = await saveRecord("equipment", payload, selectedId || undefined); }
    catch (cause) { setSaving(false); return setMessage(cause instanceof Error ? cause.message : "Could not save equipment."); }
    setSaving(false);
    setSelectedId(result.id);
    setMessage("Equipment saved.");
    await queryClient.invalidateQueries({ queryKey: ["admin-equipment"] });
    await queryClient.invalidateQueries({ queryKey: ["equipment"] });
  }

  async function moveEquipment(index: number, direction: number) {
    const other = equipment[index + direction];
    if (!other) return;
    try { await swapRecords("equipment", equipment[index].id, other.id); }
    catch (cause) { return setMessage(cause instanceof Error ? cause.message : "Could not reorder equipment."); }
    await queryClient.invalidateQueries({ queryKey: ["admin-equipment"] });
    await queryClient.invalidateQueries({ queryKey: ["equipment"] });
  }

  async function removeEquipment() {
    if (!selectedId || !window.confirm("Delete this equipment item? Its uploaded image will remain in storage.")) return;
    try { await deleteRecord("equipment", selectedId); }
    catch (cause) { return setMessage(cause instanceof Error ? cause.message : "Could not delete equipment."); }
    setSelectedId("");
    await queryClient.invalidateQueries({ queryKey: ["admin-equipment"] });
    await queryClient.invalidateQueries({ queryKey: ["equipment"] });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-2">
        <button type="button" onClick={() => { setSelectedId(""); setForm(emptyEquipment); setMessage(""); }} className="w-full rounded-xl bg-primary px-4 py-3 text-left text-sm font-semibold text-primary-foreground">+ New equipment</button>
        {isLoading && <p className="text-sm text-muted-foreground">Loading equipment…</p>}
        {loadError && <p role="alert" className="text-sm text-destructive">{loadError.message}</p>}
        {equipment.map((item, index) => <div key={item.id} className={`rounded-xl border p-3 ${selectedId === item.id ? "border-primary bg-muted" : "border-border"}`}><button type="button" onClick={() => setSelectedId(item.id)} className="w-full text-left text-sm"><strong className="block">{item.title}</strong><span className="text-xs text-muted-foreground">{item.published ? "Published" : "Draft"}</span></button><div className="mt-2 flex gap-4 text-xs"><button type="button" disabled={index === 0} onClick={() => void moveEquipment(index, -1)} className="text-secondary disabled:opacity-30">Up</button><button type="button" disabled={index === equipment.length - 1} onClick={() => void moveEquipment(index, 1)} className="text-secondary disabled:opacity-30">Down</button></div></div>)}
      </aside>
      <div className="space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4"><h2 className="text-2xl font-bold">{selected ? "Edit equipment" : "Create equipment"}</h2>{selected && <button type="button" onClick={() => void removeEquipment()} className="text-sm text-destructive">Delete item</button>}</div>
        <label className="block space-y-2 text-sm">Name<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className={inputClass} /></label>
        <label className="block space-y-2 text-sm">Description<textarea rows={5} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className={inputClass} /></label>
        <label className="block space-y-2 text-sm">Tag<input value={form.tag} onChange={(event) => setForm({ ...form, tag: event.target.value })} placeholder="Most Popular" className={inputClass} /></label>
        <MediaUpload label="Equipment image" value={form.image_path} folder="equipment" onChange={(path) => setForm((current) => ({ ...current, image_path: path }))} />
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} /> Publish equipment</label>
        <button type="button" disabled={saving} onClick={() => void saveEquipment()} className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">{saving ? "Saving…" : "Save equipment"}</button>
        {message && <p role="status" className="text-sm text-secondary">{message}</p>}
      </div>
    </div>
  );
}
