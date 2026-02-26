"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { StyleThemeId } from "@/lib/styleThemes";

type StyleThemeContextType = {
  styleTheme: StyleThemeId;
  setStyleTheme: (theme: StyleThemeId) => void;
};

const StyleThemeContext = createContext<StyleThemeContextType>({
  styleTheme: "midnight",
  setStyleTheme: () => {},
});

export function useStyleTheme() {
  return useContext(StyleThemeContext);
}

const validThemes: StyleThemeId[] = ["midnight", "executive", "coastal", "rose"];

export function StyleThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [styleTheme, setStyleThemeState] = useState<StyleThemeId>("midnight");

  useEffect(() => {
    const saved = localStorage.getItem("style-theme") as StyleThemeId | null;
    if (saved && validThemes.includes(saved)) {
      setStyleThemeState(saved);
      document.documentElement.setAttribute("data-style-theme", saved);
    } else {
      document.documentElement.setAttribute("data-style-theme", "midnight");
    }
  }, []);

  const setStyleTheme = useCallback((theme: StyleThemeId) => {
    setStyleThemeState(theme);
    document.documentElement.setAttribute("data-style-theme", theme);
    localStorage.setItem("style-theme", theme);
  }, []);

  return (
    <StyleThemeContext.Provider value={{ styleTheme, setStyleTheme }}>
      {children}
    </StyleThemeContext.Provider>
  );
}
