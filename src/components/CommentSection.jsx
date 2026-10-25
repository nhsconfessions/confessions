import { useEffect, useRef, useState } from "react";
import { MAX_LENGTH } from "../constants";
import { formatTime } from "../utils";
import EmojiPicker from "./EmojiPicker";

export default function CommentSection({
  confession,
  onComment,
  fetchComments,
  isModalPane = false
}) {
  const [input, setInput] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [loading, setLoading] = useState(confession.comments === null);
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const emojiWrapperRef = useRef(null);

  useEffect(() => {
    if (confession.comments === null) {
      setLoading(true);
      setError(false);
      fetchComments(confession.uuid)
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    }
  }, [confession.uuid, confession.comments, fetchComments]);

  useEffect(() => {
    if (!emojiOpen) return;
    const handleDocumentClick = (event) => {
      if (emojiWrapperRef.current && !emojiWrapperRef.current.contains(event.target)) {
        setEmojiOpen(false);
      }
    };
    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, [emojiOpen]);

  const submit = async (event) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || submitting) return;

    setSubmitting(true);
    try {
      const ok = await onComment(confession.uuid, text);
      if (ok !== false) {
        setInput("");
        setEmojiOpen(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`comments_section${isModalPane ? " modal_comments_mode" : ""}`}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="comment_list">
        {loading ? (
          <div style={{ textAlign: "center", padding: 10, color: "var(--text-muted)" }}>
            <i className="fa-solid fa-spinner fa-spin" /> Đang tải bình luận...
          </div>
        ) : error ? (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: 10 }}>
            Không thể tải bình luận.
          </p>
        ) : confession.comments?.length ? (
          confession.comments.map((comment, index) => {
            const isObj = typeof comment === "object" && comment !== null;
            const key = isObj && comment.id ? String(comment.id) : `${comment?.time || "comment"}-${index}`;
            const text = isObj ? comment.content : comment;
            const time = isObj ? comment.time : null;

            return (
              <div className="comment_item" key={key}>
                <span className="comment_text">{text}</span>
                {time && (
                  <span className="comment_time">
                    {formatTime(time)}
                  </span>
                )}
              </div>
            );
          })
        ) : (
          <p style={{ textAlign: "center", color: "var(--text-muted)", padding: 10 }}>
            Chưa có bình luận nào.
          </p>
        )}
      </div>

      <div className="comment_form_wrapper" ref={emojiWrapperRef}>
        <form className="comment_form" onSubmit={submit}>
          <textarea
            className="comment_input"
            rows="1"
            maxLength={MAX_LENGTH}
            placeholder="Viết bình luận..."
            value={input}
            disabled={submitting}
            onChange={(event) => setInput(event.target.value)}
          />

          <button
            type="button"
            className="comment_emoji_btn"
            title="Chọn biểu cảm"
            aria-label="Chọn biểu cảm"
            disabled={submitting}
            onClick={() => setEmojiOpen((value) => !value)}
          >
            <i className="fa-regular fa-face-smile" />
          </button>

          <button
            type="submit"
            className="comment_submit"
            disabled={submitting || !input.trim()}
          >
            {submitting ? (
              <i className="fa-solid fa-spinner fa-spin" />
            ) : (
              "Gửi"
            )}
          </button>
        </form>

        {emojiOpen && (
          <div className="emoji_picker_container comment_emoji_container">
            <EmojiPicker
              onSelect={(emoji) => {
                setInput((value) => `${value}${emoji}`);
                setEmojiOpen(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
