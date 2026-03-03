import { create } from 'zustand';

let _id = 0;
const MAX_TOASTS = 5;

const useToastStore = create((set, get) => ({
  toasts: [],

  push: ({ type, message, title, duration = 4000, persistent = false, action = null }) => {
    const id = ++_id;
    // Evict oldest non-persistent toast when at the cap
    let list = get().toasts;
    while (list.length >= MAX_TOASTS) {
      const idx = list.findIndex((t) => !t.persistent);
      if (idx === -1) break;
      list = list.filter((_, i) => i !== idx);
    }
    set({ toasts: [...list, { id, type, message, title, duration, persistent, action }] });
    return id;
  },

  remove: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
  clear:  ()   => set({ toasts: [] }),
}));

export const useToast = () => {
  const { push, clear } = useToastStore();
  const make = (type) => (message, opts = {}) => push({ type, message, ...opts });
  return {
    toast: {
      success: make('success'),
      error:   make('error'),
      info:    make('info'),
      warn:    make('warn'),
    },
    clearToasts: clear,
  };
};

export { useToastStore };
