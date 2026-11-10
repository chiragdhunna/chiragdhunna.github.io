import { useCallback, useMemo, useRef, useState } from "react";
import { getDroppedFileCount, getFirstDroppedFile } from "./fileDrop";

function hasFiles(e) {
  const types = e?.dataTransfer?.types;
  if (!types) return false;
  if (typeof types.includes === "function") return types.includes("Files");
  return Array.from(types).includes("Files");
}

export function useFileDrop({ onFile, disabled = false, onMultiple }) {
  const [isDragging, setIsDragging] = useState(false);
  const dragDepth = useRef(0);

  const onDragEnter = useCallback(
    (e) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      dragDepth.current += 1;
      setIsDragging(true);
    },
    [disabled],
  );

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDragLeave = useCallback(
    (e) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (dragDepth.current === 0) {
        setIsDragging(false);
      }
    },
    [disabled],
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!hasFiles(e)) return;

      dragDepth.current = 0;
      setIsDragging(false);

      if (disabled) return;

      const fileCount = getDroppedFileCount(e);
      const file = getFirstDroppedFile(e);
      if (!file) return;

      onFile?.(file);
      if (fileCount > 1) {
        onMultiple?.();
      }
    },
    [disabled, onFile, onMultiple],
  );

  const dropProps = useMemo(
    () => ({
      onDragEnter,
      onDragOver,
      onDragLeave,
      onDrop,
    }),
    [onDragEnter, onDragLeave, onDragOver, onDrop],
  );

  return { isDragging, dropProps };
}
