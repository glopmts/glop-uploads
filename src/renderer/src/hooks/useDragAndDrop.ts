import type React from "react";

import { useCallback, useState } from "react";

interface UseDragAndDropOptions {
  onDrop?: (files: File[]) => void;
  onDragOver?: () => void;
  onDragLeave?: () => void;
}

export function useDragAndDrop({
  onDrop,
  onDragOver,
  onDragLeave,
}: UseDragAndDropOptions = {}) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (!isDragging) {
        setIsDragging(true);
        onDragOver?.();
      }
    },
    [isDragging, onDragOver]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();

      // Only trigger if leaving the actual target, not entering a child
      if (e.currentTarget.contains(e.relatedTarget as Node)) {
        return;
      }

      setIsDragging(false);
      onDragLeave?.();
    },
    [onDragLeave]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();

      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files);
        onDrop?.(files);
      }
    },
    [onDrop]
  );

  return {
    isDragging,
    dragProps: {
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
}
