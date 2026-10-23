// Counts full-page overlays (the opened demo window). Background renderers
// pause while one is open: nobody can see them, and the demo gets the frames.
let open = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const overlay = {
  push() {
    open += 1;
    emit();
  },
  pop() {
    open = Math.max(0, open - 1);
    emit();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  isOpen: () => open > 0,
};
