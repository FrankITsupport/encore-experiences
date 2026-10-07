export function mediaUrl(path: string | null | undefined) {
  if (!path) return "";
  if (path.startsWith("static:")) return `${import.meta.env.BASE_URL}starter-media/${path.slice(7)}`;
  if (/^(https?:\/\/|\/)/.test(path)) return path;
  return `${import.meta.env.BASE_URL}${path}`;
}

export function siteHref(href: string) {
  if (href.startsWith("/") && !href.startsWith("//")) return `${import.meta.env.BASE_URL}${href.slice(1)}`;
  return href;
}
