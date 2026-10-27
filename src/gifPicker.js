const GIPHY_API_KEY = import.meta.env.VITE_GIPHY_KEY;
const GIPHY_API_URL = "https://api.giphy.com/v1/gifs";
const gifCache = new Map();

export function gifUrl(id) {
  return `https://media.giphy.com/media/${encodeURIComponent(id)}/giphy.gif`;
}

export async function fetchGifs(query, signal) {
  if (!GIPHY_API_KEY) {
    throw new Error("VITE_GIPHY_KEY is not configured.");
  }

  const search = String(query || "").trim();
  const cacheKey = search.toLocaleLowerCase();
  if (gifCache.has(cacheKey)) return gifCache.get(cacheKey);

  const endpoint = search ? "search" : "trending";
  const params = new URLSearchParams({
    api_key: GIPHY_API_KEY,
    limit: "24",
    rating: "g"
  });
  if (search) params.set("q", search);

  const response = await fetch(`${GIPHY_API_URL}/${endpoint}?${params}`, {
    signal
  });
  if (!response.ok) {
    throw Object.assign(
      new Error(`GIPHY request failed (${response.status}).`),
      { status: response.status }
    );
  }

  const payload = await response.json();
  const gifs = (Array.isArray(payload.data) ? payload.data : [])
    .filter(gif => gif.id && (gif.images?.fixed_width?.webp || gif.images?.fixed_width?.url))
    .map(gif => ({
      id: gif.id,
      title: gif.title || gif.id,
      url: gif.images.fixed_width.webp || gif.images.fixed_width.url
    }));

  gifCache.set(cacheKey, gifs);
  return gifs;
}
