const productsDb = [
  {
    id: 1,
    name: "Смартфон",
    price: 50000,
    category: "electronics",
    stock: 10,
    description: "Флагманский смартфон",
    imageUrl: null,
    createdAt: new Date().toISOString()
  }
];

module.exports = {
  productsDb
};