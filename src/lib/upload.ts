import { uploadFile } from "./api";

const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const videoTypes = ["video/mp4", "video/webm"];
const maxImageBytes = 12 * 1024 * 1024;
const maxVideoBytes = 50 * 1024 * 1024;

async function optimizeImage(file: File): Promise<File> {
  if (file.type === "image/avif" || file.type === "image/webp") return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size < 2 * 1024 * 1024) { bitmap.close(); return file; }
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Image processing failed")), "image/webp", 0.84));
  return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, { type: "image/webp" });
}

export async function uploadMedia(file: File, folder: "events" | "hero" | "equipment", onProgress: (percent: number) => void): Promise<string> {
  const isImage = imageTypes.includes(file.type);
  const isVideo = videoTypes.includes(file.type);
  if (!isImage && !isVideo) throw new Error("Use a JPG, PNG, WebP, AVIF, MP4, or WebM file.");
  if (file.size > (isImage ? maxImageBytes : maxVideoBytes)) throw new Error(isImage ? "Image must be under 12 MB." : "Video must be under 50 MB.");
  return uploadFile(isImage ? await optimizeImage(file) : file, folder, onProgress);
}
