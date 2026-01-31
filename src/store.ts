import { create } from "zustand";

// Offsetting Z by +2 to place them IN FRONT of the 1.5m thick monoliths (Center Z + 2)
export const PRODUCTS = [
  { id: "1", name: "Obsidian Hoodie", price: "$450", position: [0, 0, -8] }, // Monolith at -10
  { id: "2", name: "Basalt Trousers", price: "$320", position: [0, 0, 2] }, // Monolith at 0
  { id: "3", name: "Void Runner", price: "$580", position: [0, 0, 12] }, // Monolith at 10
] as const;

interface PlacedObject {
  id: string;
  position: [number, number, number];
}

interface StoreState {
  placedObjects: PlacedObject[];
  activeProductId: string | null;
  addPlacedObject: (position: [number, number, number]) => void;
  setActiveProduct: (id: string | null) => void;
}

const useStore = create<StoreState>((set) => ({
  placedObjects: [],
  activeProductId: null,
  addPlacedObject: (position) =>
    set((state) => ({
      placedObjects: [
        ...state.placedObjects,
        { id: Math.random().toString(36).substr(2, 9), position },
      ],
    })),
  setActiveProduct: (id) => set({ activeProductId: id }),
}));

export default useStore;
