import { useEffect, useState } from "react";
import { fetchGifs } from "../gifPicker";

export default function GifPicker({ onSelect }) {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        const results = await fetchGifs(query, controller.signal);
        if (active) setGifs(results);
      } catch (requestError) {
        if (requestError?.name !== "AbortError" && active) {
          console.error("GIPHY request failed:", requestError);
          setGifs([]);
          setError(requestError?.status === 429 ? "rate-limit" : "request");
        }
      } finally {
        if (active) setLoading(false);
      }
    }, 500);

    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return (
    <div className="giphy_picker_container comment_emoji_container">
      <input
        type="search"
        className="giphy_picker_search"
        placeholder="Tìm GIF..."
        aria-label="Tìm GIF"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <p className="giphy_picker_status" role="status">
        {loading
          ? "Đang tải GIF..."
          : error === "rate-limit"
            ? "GIPHY đang giới hạn yêu cầu. Vui lòng thử lại sau."
            : error
              ? "Không thể tải GIF. Hãy thử tìm lại."
            : gifs.length
              ? "Chọn một GIF để bình luận."
              : "Không tìm thấy GIF phù hợp."}
      </p>

      {!loading && !error && (
        <div className="giphy_picker_results">
          {gifs.map((gif) => (
            <button
              type="button"
              className="giphy_picker_item"
              key={gif.id}
              aria-label={gif.title}
              onClick={() => onSelect(gif.id)}
            >
              <img src={gif.url} alt={gif.title} loading="lazy" />
            </button>
          ))}
        </div>
      )}

      <a
        className="giphy_picker_attribution"
        href="https://giphy.com"
        target="_blank"
        rel="noreferrer"
      >
        Powered by GIPHY
      </a>
    </div>
  );
}
