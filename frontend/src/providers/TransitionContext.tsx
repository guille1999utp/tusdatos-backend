import { createContext, useContext } from "react";

export const TransitionContext = createContext<{
  startTransition: (callback: () => void) => void;
} | null>(null);

export const useTransition = () => {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error("useTransition must be used inside provider");
  return ctx;
};
