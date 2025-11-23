import { ChevronLeft, ChevronRight, SkipBack, SkipForward } from "lucide-react";
import { useEffect, useRef } from "react";
import type { Move } from "../types/game";


interface ReviewProps {
  moves: Move[];
  currentIndex: number;
  onFirst: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLast: () => void;
  capturedWhite: number;
  capturedBlack: number;
}

export function ReviewPanel({
  moves,
  currentIndex,
  onFirst,
  onPrev,
  onNext,
  onLast,
  capturedWhite,
  capturedBlack,
}: ReviewProps) {
  const listRef = useRef<HTMLUListElement>(null);
  
  useEffect(() => {
    if (!listRef.current) return;
    const item = listRef.current.querySelector(`[data-move="${currentIndex}"]`);
    if (item) {
      item.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentIndex]);
  
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") onPrev();
      else if (e.key === "ArrowRight") onNext();
      else if (e.key === "Home") onFirst();
      else if (e.key === "End") onLast();
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onPrev, onNext, onFirst, onLast]);

  return (
    <div className="review-panel">
      
      {/* Captures */}
      <div className="captures">
        <div className="cap-item">
          <span className="piece-icon">♟</span>
          <span className="cap-num">{capturedBlack}</span>
        </div>
        <div className="cap-item">
          <span className="piece-icon">♙</span>
          <span className="cap-num">{capturedWhite}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="controls">
        <button onClick={onFirst} className="icon-btn"><SkipBack size={20} /></button>
        <button onClick={onPrev} className="icon-btn"><ChevronLeft size={20} /></button>
        <button onClick={onNext} className="icon-btn"><ChevronRight size={20} /></button>
        <button onClick={onLast} className="icon-btn"><SkipForward size={20} /></button>
      </div>

      {/* Move List */}
      <ul className="moves-list" ref={listRef}>
        {moves.map((m, i) => (
          <li
            key={i}
            data-move={i}
            className={`move-item ${i === currentIndex ? "active" : ""}`}
          >
            <div className="move-index">{i + 1}.</div>

            <div className="move-text">
              ({m.from.row}, {m.from.col}) → ({m.to.row}, {m.to.col})
              {m.captured && (
                <span className="capture-tag">
                  x {m.captured}
                </span>
              )}
            </div>

            <div className="move-time">{m.timestamp.toISOString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
