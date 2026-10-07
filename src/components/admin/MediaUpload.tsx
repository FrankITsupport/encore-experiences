import { useState } from "react";
import { mediaUrl } from "@/lib/media";
import { uploadMedia } from "@/lib/upload";

type Props = {
  label: string;
  value: string;
  onChange: (path: string) => void | Promise<void>;
  folder: "events" | "hero" | "equipment";
  kind?: "image" | "video";
  disabled?: boolean;
};

export default function MediaUpload({ label, value, onChange, folder, kind = "image", disabled = false }: Props) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError("");
    setProgress(0);
    try {
      if (kind === "video" && !["video/mp4", "video/webm"].includes(file.type)) throw new Error("Choose an MP4 or WebM video.");
      if (kind === "image" && !file.type.startsWith("image/")) throw new Error("Choose an image file.");
      const path = await uploadMedia(file, folder, setProgress);
      await onChange(path);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed.");
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      {value && (kind === "video" ? <video src={mediaUrl(value)} controls className="max-h-48 w-full rounded-lg bg-black" /> : <img src={mediaUrl(value)} alt={`${label} preview`} className="max-h-48 w-full rounded-lg object-contain bg-muted" />)}
      <input type="file" accept={kind === "video" ? "video/mp4,video/webm" : "image/jpeg,image/png,image/webp,image/avif"} disabled={disabled || progress !== null} onChange={(event) => { void handleFile(event.target.files?.[0]); event.target.value = ""; }} className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-primary-foreground" />
      {progress !== null && <p role="status" className="text-xs text-secondary">Uploading: {progress}%</p>}
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
