import { useEffect, useRef, useState } from "react";
import { formatTime } from "../utils";
import CommentSection from "./CommentSection";

export default function ConfessionCard({ confession, liked, expanded, onOpen, onClose, onLike, onComment, fetchComments }) {
  const important = confession.status === "important";
  const [showReadMore, setShowReadMore] = useState(confession.content.length > 120);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) setShowReadMore(contentRef.current.scrollHeight > contentRef.current.clientHeight || confession.content.length > 120);
  }, [confession.content]);

  return <div className={`box${important ? " announcement_box" : ""}${expanded ? " expanded modal_focused" : ""}`} onClick={() => !expanded && onOpen(confession.uuid)}>
    <div className="box_stars" aria-hidden="true">
      <i className="box_star box_star_one fa-solid fa-star" />
      <i className="box_star box_star_two fa-solid fa-star" />
      <i className="box_star box_star_three fa-solid fa-star" />
      {expanded && <><i className="box_star box_star_four fa-solid fa-star" /><i className="box_star box_star_five fa-solid fa-star" /></>}
    </div>
    {expanded && <>
      <div className="modal_lanterns" aria-hidden="true">
        <i className="modal_lantern modal_lantern_left" />
        <i className="modal_lantern modal_lantern_right" />
      </div>
      <div className="modal_clouds" aria-hidden="true">
        <i className="modal_cloud modal_cloud_top" />
        <i className="modal_cloud modal_cloud_bottom" />
      </div>
    </>}
    {expanded && <button type="button" className="close_modal_btn" title="Đóng" onClick={(event) => { event.stopPropagation(); onClose(); }}><i className="fa-solid fa-xmark" /></button>}
    <div className="confession_title">{important ? "📢 Thông báo" : `Confession #${String(confession.number || 0).padStart(3, "0")}`}</div>
    <div className="confession_content"><p ref={contentRef}>{confession.content}</p>{showReadMore && !expanded && <button type="button" className="read_more_btn" onClick={(event) => { event.stopPropagation(); onOpen(confession.uuid); }}>Xem thêm</button>}</div>
    <div className="confession_meta"><span className="confession_time">{formatTime(confession.time)}</span></div>
    <div className="confession_actions"><button type="button" className={`heart_btn${liked ? " liked" : ""}`} onClick={(event) => { event.stopPropagation(); onLike(confession.uuid); }}>{liked ? "❤️" : "🤍"} <span className="heart_count">{confession.likes || 0}</span></button>{!important && <button type="button" className="comment_toggle" onClick={(event) => { event.stopPropagation(); onOpen(confession.uuid); }}>💬 Bình luận ({confession.commentCount || 0})</button>}</div>
    {expanded && !important && <CommentSection confession={confession} onComment={onComment} fetchComments={fetchComments} />}
  </div>;
}
