const express = require('express');
const router = express.Router();
const { productsDb } = require('../config/index');
const validateProduct = require('../middleware/validate');
const upload = require('../middleware/upload');

// 1. GET /api/products — Получение списка с фильтрацией и пагинацией
router.get('/', (req, res) => {
  let { category, minPrice, maxPrice, page = 1, limit = 10 } = req.query;
  
  page = parseInt(page);
  limit = parseInt(limit);
  let filteredProducts = [...productsDb];

  // Фильтрация по категории
  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }

  // Фильтрация по цене
  if (minPrice) {
    filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(minPrice));
  }
  if (maxPrice) {
    filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(maxPrice));
  }

  // Пагинация
  const total = filteredProducts.length;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  res.json({
    data: paginatedProducts,
    total,
    page,
    limit
  });
});

// 2. GET /api/products/:id — Получение одного товара
router.get('/:id', (req, res) => {
  const product = productsDb.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ message: 'Товар не найден' });
  }
  res.json(product);
});

// 3. POST /api/products — Создание товара
router.post('/', validateProduct, (req, res) => {
  const newProduct = {
    id: productsDb.length > 0 ? Math.max(...productsDb.map(p => p.id)) + 1 : 1,
    name: req.body.name,
    price: req.body.price,
    category: req.body.category,
    stock: req.body.stock !== undefined ? req.body.stock : 0,
    description: req.body.description || '',
    imageUrl: req.body.imageUrl || null,
    createdAt: new Date().toISOString()
  };

  productsDb.push(newProduct);
  res.status(201).json(newProduct);
});

// 4. PUT /api/products/:id — Полная замена товара
router.put('/:id', validateProduct, (req, res) => {
  const index = productsDb.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: 'Товар не найден' });
  }

  productsDb[index] = {
    id: productsDb[index].id,
    ...req.body,
    createdAt: productsDb[index].createdAt // сохраняем дату создания
  };

  res.json(productsDb[index]);
});

// 5. PATCH /api/products/:id — Частичное обновление
router.patch('/:id', validateProduct, (req, res) => {
  const product = productsDb.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ message: 'Товар не найден' });
  }

  Object.assign(product, req.body);
  res.json(product);
});

// 6. DELETE /api/products/:id — Удаление товара
router.delete('/:id', (req, res) => {
  const index = productsDb.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: 'Товар не найден' });
  }

  productsDb.splice(index, 1);
  res.status(200).json({ message: 'Товар успешно удален' });
});

// 7. POST /api/products/:id/image — Загрузка изображения товара
router.post('/:id/image', upload.single('image'), (req, res) => {
  const product = productsDb.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ message: 'Товар не найден' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'Пожалуйста, выберите файл для загрузки' });
  }

  // Сохраняем относительный путь к картинке
  product.imageUrl = `/uploads/products/${req.file.filename}`;

  res.json({
    message: 'Изображение успешно загружено',
    product
  });
});

module.exports = router;