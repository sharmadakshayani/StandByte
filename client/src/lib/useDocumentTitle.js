import { useEffect } from "react";

const APP_TITLE = "StandByte";

export function useDocumentTitle(title) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} — ${APP_TITLE}` : APP_TITLE;
    return () => {
      document.title = prev;
    };
  }, [title]);
}
