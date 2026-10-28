"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { AddonKey, PackageKey } from "@/lib/brief";
import { CONTACT_STEPS, type ContactStep } from "@/lib/contact";

export type BriefStatus = "editing" | "sending" | "done";
type Answers = Record<ContactStep, string>;

type Brief = {
  pkg: PackageKey | null;
  addons: AddonKey[];
  /** the package the fit finder points to (null: no answers yet) */
  fit: PackageKey | null;
  /** what the visitor has told us in Contact, answer by answer */
  answers: Answers;
  status: BriefStatus;
  /** how many briefs have gone off (each send seals the card anew) */
  sent: number;
  /** a package's ticket is on its way down to Contact: its slot waits for it */
  arriving: boolean;
  choosePackage: (pkg: PackageKey | null) => void;
  toggleAddon: (addon: AddonKey) => void;
  setAddon: (addon: AddonKey, on: boolean) => void;
  removeAddon: (addon: AddonKey) => void;
  setFit: (pkg: PackageKey | null) => void;
  setAnswer: (step: ContactStep, value: string) => void;
  setStatus: (status: BriefStatus) => void;
  setArriving: (arriving: boolean) => void;
  reset: () => void;
};

const BriefContext = createContext<Brief | null>(null);

const blank = (): Answers => Object.fromEntries(CONTACT_STEPS.map((s) => [s, ""])) as Answers;

// What the visitor picks in "Find your fit" and says in Contact: one brief, shared by
// the package cards, the conversation and the brief card that fills in beside it.
export function BriefProvider({ children }: { children: ReactNode }) {
  const [pkg, setPkg] = useState<PackageKey | null>(null);
  const [addons, setAddons] = useState<AddonKey[]>([]);
  const [fit, setFit] = useState<PackageKey | null>(null);
  const [answers, setAnswers] = useState<Answers>(blank);
  const [status, setStatusRaw] = useState<BriefStatus>("editing");
  const [sent, setSent] = useState(0);
  const [arriving, setArriving] = useState(false);

  const setAddon = useCallback((addon: AddonKey, on: boolean) => {
    setAddons((list) => (on ? (list.includes(addon) ? list : [...list, addon]) : list.filter((a) => a !== addon)));
  }, []);
  const toggleAddon = useCallback((addon: AddonKey) => {
    setAddons((list) => (list.includes(addon) ? list.filter((a) => a !== addon) : [...list, addon]));
  }, []);
  const removeAddon = useCallback((addon: AddonKey) => setAddon(addon, false), [setAddon]);
  const setAnswer = useCallback((step: ContactStep, value: string) => {
    setAnswers((a) => ({ ...a, [step]: value }));
  }, []);
  const setStatus = useCallback((next: BriefStatus) => {
    setStatusRaw(next);
    if (next === "done") setSent((n) => n + 1);
  }, []);
  const reset = useCallback(() => {
    setPkg(null);
    setAddons([]);
    setAnswers(blank());
    setStatusRaw("editing");
    setArriving(false);
  }, []);

  const value = useMemo(
    () => ({
      pkg,
      addons,
      fit,
      answers,
      status,
      sent,
      arriving,
      choosePackage: setPkg,
      toggleAddon,
      setAddon,
      removeAddon,
      setFit,
      setAnswer,
      setStatus,
      setArriving,
      reset,
    }),
    [
      pkg,
      addons,
      fit,
      answers,
      status,
      sent,
      arriving,
      toggleAddon,
      setAddon,
      removeAddon,
      setAnswer,
      setStatus,
      reset,
    ],
  );
  return <BriefContext.Provider value={value}>{children}</BriefContext.Provider>;
}

export function useBrief() {
  const ctx = useContext(BriefContext);
  if (!ctx) throw new Error("useBrief must be used inside <BriefProvider>");
  return ctx;
}
