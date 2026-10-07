import boothImg from "@/assets/hero-photobooth.jpg";
import booth360 from "@/assets/360-booth.jpg";
import ledImg from "@/assets/led-screen.jpg";
import lightingImg from "@/assets/event-lighting.jpg";
import { api } from "./api";

export type EventImage = {
  id: string;
  event_id: string;
  image_path: string;
  alt_text: string;
  caption: string;
  position: number;
};

export type EventItem = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  event_date: string | null;
  location: string;
  cover_path: string;
  published: boolean;
  created_at: string;
  event_images?: EventImage[];
};

export type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  media_type: "image" | "video";
  media_path: string;
  poster_path: string;
  cta_label: string;
  cta_href: string;
  position: number;
  enabled: boolean;
};

export type EquipmentItem = {
  id: string;
  title: string;
  description: string;
  image_path: string;
  tag: string;
  position: number;
  published: boolean;
};

export const starterSlides: HeroSlide[] = [{
  id: "starter-hero",
  title: "We Create Unforgettable Experiences",
  subtitle: "From mirror photobooths to 360° video experiences, we transform corporate events into immersive moments that captivate and engage.",
  media_type: "image",
  media_path: boothImg,
  poster_path: "",
  cta_label: "Explore Our Products",
  cta_href: "#products",
  position: 0,
  enabled: true,
}];

export const starterEquipment: EquipmentItem[] = [
  { id: "mirror-booth", title: "Mirror Photobooth", description: "An interactive, full-length mirror that captures stunning photos with custom animations, filters, and branded overlays. A showstopper at any corporate event.", image_path: boothImg, tag: "Most Popular", position: 0, published: true },
  { id: "video-booth", title: "360° Video Booth", description: "Step onto the platform and let our rotating camera capture epic slow-motion videos from every angle. Instant social media content your guests will love.", image_path: booth360, tag: "Trending", position: 1, published: true },
  { id: "led-displays", title: "LED Screen Displays", description: "High-resolution LED screens for presentations, live feeds, and dynamic brand visuals. Available in various sizes for any venue configuration.", image_path: ledImg, tag: "Essential", position: 2, published: true },
  { id: "stage-lighting", title: "Stage & Lighting", description: "Complete stage platforms with professional lighting rigs, LED dance floors, red carpet setups, and crowd control solutions for a polished event experience.", image_path: lightingImg, tag: "Premium", position: 3, published: true },
];

export async function getHeroSlides(): Promise<HeroSlide[]> {
  try { return await api<HeroSlide[]>("resource=hero_slides"); }
  catch { return starterSlides; }
}

export async function getEquipment(): Promise<EquipmentItem[]> {
  try { return await api<EquipmentItem[]>("resource=equipment"); }
  catch { return starterEquipment; }
}

export async function getEvents(): Promise<EventItem[]> {
  return api<EventItem[]>("resource=events");
}

export async function getEvent(slug: string): Promise<EventItem | null> {
  return api<EventItem | null>(`resource=event&slug=${encodeURIComponent(slug)}`);
}
