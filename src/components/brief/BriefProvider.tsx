"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { AddonKey, PackageKey } from "@/lib/brief";

type Brief = {
  pkg: PackageKey | null;
  addons: AddonKey[];
  choosePackage: (pkg: PackageKey | null) => void;
  toggleAddon: (addon: AddonKey) => void;
  removeAddon: (addon: AddonKey) => void;
  reset: () => void;
};

const BriefContext = createContext<Brief | null>(null);

// What the visitor picked in "Find your fit" travels with them into Contact.
export function BriefProvider({ children }: { children: ReactNode }) {
  const [pkg, setPkg] = useState<PackageKey | null>(null);
  const [addons, setAddons] = useState<AddonKey[]>([]);

  const toggleAddon = useCallback((addon: AddonKey) => {
    setAddons((list) => (list.includes(addon) ? list.filter((a) => a !== addon) : [...list, addon]));
  }, []);
  const removeAddon = useCallback((addon: AddonKey) => {
    setAddons((list) => list.filter((a) => a !== addon));
  }, []);
  const reset = useCallback(() => {
    setPkg(null);
    setAddons([]);
  }, []);

  const value = useMemo(
    () => ({ pkg, addons, choosePackage: setPkg, toggleAddon, removeAddon, reset }),
    [pkg, addons, toggleAddon, removeAddon, reset],
  );
  return <BriefContext.Provider value={value}>{children}</BriefContext.Provider>;
}

export function useBrief() {
  const ctx = useContext(BriefContext);
  if (!ctx) throw new Error("useBrief must be used inside <BriefProvider>");
  return ctx;
}
