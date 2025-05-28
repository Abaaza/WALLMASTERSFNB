// DirectionContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import { useTranslation } from "react-i18next";

const DirectionContext = createContext<string>("ltr");

export const DirectionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { i18n } = useTranslation();
  const [direction, setDirection] = useState<string>(i18n.dir());

  i18n.on("languageChanged", (lng: string) => {
    setDirection(i18n.dir(lng));
  });

  return (
    <DirectionContext.Provider value={direction}>
      <div dir={direction}>{children}</div>
    </DirectionContext.Provider>
  );
};

export const useDirection = () => useContext(DirectionContext);
