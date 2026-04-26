export const products = [
  {
    id: 1,
    name: "Cinnamon Roll Box (4-Pack)",
    price: 30,
    boxSize: 4,
    description: "Build your own 4-pack of fresh, handcrafted cinnamon rolls. Mix & match your favorite flavors.",
    image: "/images/variety-image.jpg",
  },
  {
    id: 2,
    name: "Cinnamon Roll Box (6-Pack)",
    price: 42,
    boxSize: 6,
    description: "Build your own 6-pack of fresh, handcrafted cinnamon rolls. More rolls, more love.",
    image: "/images/variety-image.jpg",
  },
];

// Legacy single-product export for backward compat
export const product = products[0];

export const flavors = [
  { id: "classic", name: "Classic", image: "/images/classic.jpeg" },
  { id: "matcha", name: "Matcha", image: "/images/matcha.jpeg" },
  { id: "red-velvet", name: "Red Velvet", image: "/images/red-velvet.jpeg" },
  { id: "peach-cobbler", name: "Peach Cobbler", image: "/images/peachcobler.jpeg" },
  { id: "blueberry", name: "Blueberry", image: "/images/blueberry.jpeg" },
];
