import { api } from "./api";
import type { EquipmentItem, EventImage, EventItem, HeroSlide } from "./content";

export const adminEvents = () => api<EventItem[]>("resource=events&admin=1");
export const adminImages = (eventId: string) => api<EventImage[]>(`resource=event_images&event_id=${encodeURIComponent(eventId)}`);
export const adminSlides = () => api<HeroSlide[]>("resource=hero_slides&admin=1");
export const adminEquipment = () => api<EquipmentItem[]>("resource=equipment&admin=1");

type Table = "events" | "event_images" | "hero_slides" | "equipment";

export function saveRecord(table: Table, record: Record<string, unknown>, id?: string): Promise<{ id: string }> {
  return api<{ id: string }>(`resource=${table}${id ? `&id=${encodeURIComponent(id)}` : ""}`, { method: id ? "PUT" : "POST", body: record });
}

export function deleteRecord(table: Table, id: string): Promise<void> {
  return api<void>(`resource=${table}&id=${encodeURIComponent(id)}`, { method: "DELETE", body: {} });
}

export function swapRecords(table: "event_images" | "hero_slides" | "equipment", first: string, second: string): Promise<void> {
  return api<void>(`action=swap&resource=${table}`, { method: "POST", body: { first, second } });
}
