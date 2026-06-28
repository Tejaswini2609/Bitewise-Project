export const platforms = [
  {
    id: "swiggy",
    name: "Swiggy",
    logo: "S",
    color: "#fa560b",
    urlPattern: "https://www.swiggy.com/search?query={food}",
  },
  {
    id: "zomato",
    name: "Zomato",
    logo: "zomato",
    color: "#e20f34",
    urlPattern: "https://www.zomato.com/pune/restaurants/{foodSlug}",
  },
  {
    id: "magicpin",
    name: "Magicpin",
    logo: "magicpin",
    color: "#6827bb",
    urlPattern: "https://magicpin.in/search/?query={food}",
  },
];

export const foods = [
  {
    key: "pizza",
    title: "Pizza",
    short: "PZ",
    groupName: "quick-bites",
    deals: [
      { platformId: "swiggy", price: 299, original: 349, mins: 35, offer: 10, rating: 4.3 },
      { platformId: "zomato", price: 269, original: 349, mins: 34, offer: 23, rating: 4.4 },
      { platformId: "magicpin", price: 279, original: 349, mins: 38, offer: 20, rating: 4.2 },
    ],
  },
  {
    key: "biryani",
    title: "Biryani",
    short: "BY",
    groupName: "indian-meals",
    deals: [
      { platformId: "swiggy", price: 229, original: 329, mins: 32, offer: 30, rating: 4.5 },
      { platformId: "zomato", price: 269, original: 329, mins: 29, offer: 18, rating: 4.6 },
      { platformId: "magicpin", price: 239, original: 319, mins: 42, offer: 25, rating: 4.2 },
    ],
  },
  {
    key: "burger",
    title: "Burger",
    short: "BG",
    groupName: "quick-bites",
    deals: [
      { platformId: "swiggy", price: 169, original: 229, mins: 24, offer: 26, rating: 4.4 },
      { platformId: "zomato", price: 159, original: 219, mins: 31, offer: 27, rating: 4.2 },
      { platformId: "magicpin", price: 179, original: 239, mins: 28, offer: 25, rating: 4.1 },
    ],
  },
  {
    key: "dosa",
    title: "Dosa",
    short: "DS",
    groupName: "south-street",
    deals: [
      { platformId: "swiggy", price: 119, original: 159, mins: 27, offer: 25, rating: 4.3 },
      { platformId: "zomato", price: 129, original: 169, mins: 22, offer: 24, rating: 4.5 },
      { platformId: "magicpin", price: 109, original: 159, mins: 35, offer: 31, rating: 4.0 },
    ],
  },
  {
    key: "pasta",
    title: "Pasta",
    short: "PS",
    groupName: "quick-bites",
    deals: [
      { platformId: "swiggy", price: 219, original: 279, mins: 34, offer: 21, rating: 4.2 },
      { platformId: "zomato", price: 199, original: 269, mins: 38, offer: 26, rating: 4.4 },
      { platformId: "magicpin", price: 209, original: 279, mins: 41, offer: 25, rating: 4.1 },
    ],
  },
  {
    key: "noodles",
    title: "Noodles",
    short: "ND",
    groupName: "south-street",
    deals: [
      { platformId: "swiggy", price: 135, original: 199, mins: 25, offer: 32, rating: 4.4 },
      { platformId: "zomato", price: 159, original: 209, mins: 23, offer: 24, rating: 4.3 },
      { platformId: "magicpin", price: 139, original: 199, mins: 36, offer: 30, rating: 4.1 },
    ],
  },
  {
    key: "fries",
    title: "Fries",
    short: "FR",
    groupName: "quick-bites",
    deals: [
      { platformId: "swiggy", price: 99, original: 139, mins: 21, offer: 29, rating: 4.2 },
      { platformId: "zomato", price: 109, original: 149, mins: 24, offer: 27, rating: 4.1 },
      { platformId: "magicpin", price: 89, original: 139, mins: 33, offer: 36, rating: 4.0 },
    ],
  },
  {
    key: "coffee",
    title: "Coffee",
    short: "CF",
    groupName: "desserts-drinks",
    deals: [
      { platformId: "swiggy", price: 99, original: 169, mins: 19, offer: 41, rating: 4.5 },
      { platformId: "zomato", price: 119, original: 169, mins: 22, offer: 30, rating: 4.4 },
      { platformId: "magicpin", price: 109, original: 159, mins: 31, offer: 31, rating: 4.2 },
    ],
  },
  {
    key: "gobi-manchurian",
    title: "Gobi Manchurian",
    short: "GB",
    groupName: "indian-meals",
    aliases: ["gobi"],
    deals: [
      { platformId: "swiggy", price: 159, original: 219, mins: 28, offer: 27, rating: 4.3 },
      { platformId: "zomato", price: 129, original: 209, mins: 31, offer: 38, rating: 4.4 },
      { platformId: "magicpin", price: 139, original: 199, mins: 36, offer: 30, rating: 4.1 },
    ],
  },
  {
    key: "sandwich",
    title: "Sandwich",
    short: "SW",
    groupName: "quick-bites",
    deals: [
      { platformId: "swiggy", price: 139, original: 189, mins: 22, offer: 26, rating: 4.3 },
      { platformId: "zomato", price: 129, original: 179, mins: 26, offer: 28, rating: 4.2 },
      { platformId: "magicpin", price: 149, original: 199, mins: 34, offer: 25, rating: 4.0 },
    ],
  },
  {
    key: "momos",
    title: "Momos",
    short: "MM",
    groupName: "south-street",
    deals: [
      { platformId: "swiggy", price: 119, original: 169, mins: 26, offer: 30, rating: 4.2 },
      { platformId: "zomato", price: 109, original: 159, mins: 29, offer: 31, rating: 4.3 },
      { platformId: "magicpin", price: 99, original: 159, mins: 37, offer: 38, rating: 4.0 },
    ],
  },
  {
    key: "fried-rice",
    title: "Fried Rice",
    short: "FR",
    groupName: "indian-meals",
    deals: [
      { platformId: "swiggy", price: 145, original: 229, mins: 30, offer: 37, rating: 4.3 },
      { platformId: "zomato", price: 159, original: 219, mins: 34, offer: 27, rating: 4.4 },
      { platformId: "magicpin", price: 149, original: 209, mins: 39, offer: 29, rating: 4.1 },
    ],
  },
  {
    key: "paneer-tikka",
    title: "Paneer Tikka",
    short: "PT",
    groupName: "indian-meals",
    deals: [
      { platformId: "swiggy", price: 229, original: 299, mins: 33, offer: 23, rating: 4.4 },
      { platformId: "zomato", price: 219, original: 299, mins: 36, offer: 27, rating: 4.5 },
      { platformId: "magicpin", price: 209, original: 289, mins: 43, offer: 28, rating: 4.2 },
    ],
  },
  {
    key: "ice-cream",
    title: "Ice Cream",
    short: "IC",
    groupName: "desserts-drinks",
    deals: [
      { platformId: "swiggy", price: 79, original: 149, mins: 18, offer: 47, rating: 4.5 },
      { platformId: "zomato", price: 109, original: 159, mins: 21, offer: 31, rating: 4.4 },
      { platformId: "magicpin", price: 89, original: 149, mins: 29, offer: 40, rating: 4.2 },
    ],
  },
  {
    key: "shawarma",
    title: "Shawarma",
    short: "SH",
    groupName: "south-street",
    deals: [
      { platformId: "swiggy", price: 149, original: 199, mins: 27, offer: 25, rating: 4.3 },
      { platformId: "zomato", price: 139, original: 199, mins: 25, offer: 30, rating: 4.4 },
      { platformId: "magicpin", price: 159, original: 219, mins: 35, offer: 27, rating: 4.1 },
    ],
  },
  {
    key: "idli",
    title: "Idli",
    short: "ID",
    groupName: "south-street",
    deals: [
      { platformId: "swiggy", price: 89, original: 129, mins: 24, offer: 31, rating: 4.4 },
      { platformId: "zomato", price: 99, original: 139, mins: 21, offer: 29, rating: 4.5 },
      { platformId: "magicpin", price: 79, original: 129, mins: 34, offer: 39, rating: 4.0 },
    ],
  },
  {
    key: "veg-thali",
    title: "Veg Thali",
    short: "VT",
    groupName: "indian-meals",
    deals: [
      { platformId: "swiggy", price: 189, original: 249, mins: 31, offer: 24, rating: 4.3 },
      { platformId: "zomato", price: 179, original: 249, mins: 34, offer: 28, rating: 4.4 },
      { platformId: "magicpin", price: 169, original: 239, mins: 41, offer: 29, rating: 4.1 },
    ],
  },
];
