import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";

import { useWindowVirtualizer } from "@tanstack/react-virtual";

import ConfessionCard from "./ConfessionCard";
import { formatDate } from "../utils";

const getColumnCount = () => {
  if (typeof window === "undefined") return 3;

  if (window.innerWidth >= 1100) return 3;
  if (window.innerWidth >= 700) return 2;

  return 1;
};

export default function VirtualizedConfessionList({
  items,
  expandedId,
  liked,
  hasMore,
  loadingMore,
  onLoadMore,
  onOpen,
  onClose,
  onLike,
  onComment,
  fetchComments
}) {
  const listRef = useRef(null);

  const [columns, setColumns] = useState(getColumnCount);
  const [scrollMargin, setScrollMargin] = useState(0);

  useEffect(() => {
    const updateColumns = () => {
      setColumns(getColumnCount());
    };

    updateColumns();

    window.addEventListener("resize", updateColumns);

    return () => {
      window.removeEventListener("resize", updateColumns);
    };
  }, []);

  useLayoutEffect(() => {
    const updateOffset = () => {
      setScrollMargin(
        listRef.current?.offsetTop ?? 0
      );
    };

    updateOffset();

    window.addEventListener("resize", updateOffset);

    const parent = listRef.current?.parentElement;

    const observer = parent
      ? new ResizeObserver(updateOffset)
      : null;

    if (observer && parent) {
      observer.observe(parent);
    }

    return () => {
      window.removeEventListener("resize", updateOffset);
      observer?.disconnect();
    };
  }, [items.length, columns]);

  const rows = useMemo(() => {
    const result = [];

    let currentDate = null;
    let currentCardRow = null;

    for (const item of items) {
      const date =
        item.dateLabel ||
        formatDate(item.time) ||
        "Khác";

      if (date !== currentDate) {
        currentDate = date;

        result.push({
          type: "date",
          key: `date:${date}`,
          date
        });

        currentCardRow = null;
      }

      if (
        !currentCardRow ||
        currentCardRow.items.length >= columns
      ) {
        currentCardRow = {
          type: "cards",
          date,
          items: [],
          key: `cards:${date}:${item.uuid}`
        };

        result.push(currentCardRow);
      }

      currentCardRow.items.push(item);
    }

    if (hasMore) {
      result.push({
        type: "loader",
        key: "loader"
      });
    }

    return result;
  }, [items, columns, hasMore]);

  const virtualizer = useWindowVirtualizer({
    count: rows.length,

    estimateSize: (index) => {
      const row = rows[index];

      if (row?.type === "date") {
        return 60;
      }

      if (row?.type === "loader") {
        return 60;
      }

      return columns === 1 ? 272 : 262;
    },

    overscan: 5,

    scrollMargin,

    getItemKey: (index) => rows[index]?.key ?? index
  });

  const virtualItems = virtualizer.getVirtualItems();

  useEffect(() => {
    const last = virtualItems[virtualItems.length - 1];

    if (!last) return;

    if (
      last.index >= rows.length - 3 &&
      hasMore &&
      !loadingMore
    ) {
      onLoadMore();
    }
  }, [
    virtualItems,
    rows.length,
    hasMore,
    loadingMore,
    onLoadMore
  ]);

  return (
    <div
      ref={listRef}
      className="virtual_confession_list"
      style={{
        position: "relative",
        width: "100%",
        height: `${virtualizer.getTotalSize()}px`
      }}
    >
      {virtualItems.map((virtualRow) => {
        const row = rows[virtualRow.index];

        return (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={virtualizer.measureElement}
            className="virtual_confession_row"
            style={{
              position: "absolute",
              top: `${virtualRow.start - scrollMargin}px`,
              left: 0,
              width: "100%",
              paddingBottom: 22
            }}
          >
            {row.type === "date" && (
              <div className="virtual_date_header">
                📅 Ngày {row.date}
              </div>
            )}

            {row.type === "cards" && (
              <div
                className="virtual_card_row"
                style={{
                  gridTemplateColumns:
                    `repeat(${columns}, minmax(0, 1fr))`
                }}
              >
                {row.items.map((item) => (
                  <ConfessionCard
                    key={item.uuid}
                    confession={item}
                    expanded={
                      expandedId === String(item.uuid)
                    }
                    liked={
                      liked.includes(String(item.uuid))
                    }
                    onOpen={onOpen}
                    onClose={onClose}
                    onLike={onLike}
                    onComment={onComment}
                    fetchComments={fetchComments}
                  />
                ))}
              </div>
            )}

            {row.type === "loader" && (
              <div className="virtual_loading_more">
                {loadingMore ? "Đang tải thêm..." : ""}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}