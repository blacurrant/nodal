import { create } from "zustand";

// Product catalog with full details
export const PRODUCTS = [
  {
    id: "1",
    name: "Obsidian Hoodie",
    price: "$450",
    position: [0, 0, -8],
    description:
      "Heavyweight organic cotton hoodie with water-resistant coating. Minimalist construction meets maximum comfort.",
    sizes: ["S", "M", "L", "XL"],
    color: "Charcoal Black",
  },
  {
    id: "2",
    name: "Basalt Trousers",
    price: "$320",
    position: [0, 0, 2],
    description:
      "Technical cargo pants with 4-way stretch. Reinforced knees and hidden pockets for urban exploration.",
    sizes: ["28", "30", "32", "34", "36"],
    color: "Slate Grey",
  },
  {
    id: "3",
    name: "Void Runner",
    price: "$580",
    position: [0, 0, 12],
    description:
      "Lightweight performance sneaker with adaptive cushioning. Carbon fiber plate for explosive energy return.",
    sizes: ["7", "8", "9", "10", "11", "12"],
    color: "Obsidian",
  },
] as const;

export type Product = (typeof PRODUCTS)[number];

interface PlacedObject {
  id: string;
  position: [number, number, number];
}

interface StoreState {
  placedObjects: PlacedObject[];
  activeProductId: string | null;
  cartItems: string[];
  addPlacedObject: (position: [number, number, number]) => void;
  setActiveProduct: (id: string | null) => void;
  addToCart: (id: string) => void;
  removeFromCart: (id: string) => void;
}

const useStore = create<StoreState>((set) => ({
  placedObjects: [],
  activeProductId: null,
  cartItems: [],
  addPlacedObject: (position) =>
    set((state) => ({
      placedObjects: [
        ...state.placedObjects,
        { id: Math.random().toString(36).substr(2, 9), position },
      ],
    })),
  setActiveProduct: (id) => set({ activeProductId: id }),
  addToCart: (id) =>
    set((state) => ({
      cartItems: state.cartItems.includes(id)
        ? state.cartItems
        : [...state.cartItems, id],
    })),
  removeFromCart: (id) =>
    set((state) => ({
      cartItems: state.cartItems.filter((i) => i !== id),
    })),
}));

export default useStore;
