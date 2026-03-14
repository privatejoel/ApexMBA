"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { Excalidraw, getSceneVersion } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";

interface ExcalidrawWrapperProps {
  initialElements: ExcalidrawElement[] | null;
  onSave: (elements: ExcalidrawElement[]) => void;
}

export default function ExcalidrawWrapper({ initialElements, onSave }: ExcalidrawWrapperProps) {
  const [mounted, setMounted] = useState(false);
  const sceneVersionRef = useRef<number>(-1);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const handleChange = useCallback(
    (elements: readonly ExcalidrawElement[]) => {
      const version = getSceneVersion(elements);
      if (version === sceneVersionRef.current) return;
      sceneVersionRef.current = version;

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        const live = elements.filter((el) => !el.isDeleted);
        onSave(live as ExcalidrawElement[]);
      }, 500);
    },
    [onSave],
  );

  if (!mounted) return null;

  return (
    <div style={{ height: 400, width: "100%", borderRadius: 6, overflow: "hidden", border: "1px solid #e0d4f0" }}>
      <Excalidraw
        initialData={{
          elements: initialElements ?? [],
          appState: { viewBackgroundColor: "#fffef9" },
        }}
        onChange={handleChange}
        theme="light"
      />
    </div>
  );
}
