const express = require('express');
const router = express.Router();
const { productsDb } = require('../config/index');
const validateProduct = require('../middleware/validate');
const upload = require('../middleware/upload');

/**
 * @openapi
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Автоматически сгенерированный ID
 *         name:
 *           type: string
 *           description: Название товара (2-100 символов)
 *         price:
 *           type: number
 *           description: Цена товара (больше 0)
 *         category:
 *           type: string
 *           enum: [electronics, clothing, food, other]
 *           description: Категория товара
 *         stock:
 *           type: integer
 *           default: 0
 *           description: Количество на складе
 *         description:
 *           type: string
 *           description: Описание товара (макс. 500 символов)
 *         imageUrl:
 *           type: string
 *           description: Ссылка на изображение товара
 *         createdAt:
 *           type: string
 *           description: Дата создания товара
 */

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: Получить список товаров с фильтрацией и пагинацией
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Фильтр по категории
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Минимальная цена
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Максимальная цена
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Номер страницы
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Количество товаров на странице
 *     responses:
 *       200:
 *         description: Успешный ответ со списком товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *   post:
 *     summary: Создать новый товар
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, category]
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               stock:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Товар успешно создан
 *       400:
 *         description: Ошибка валидации данных
 */

/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     summary: Получить один товар по ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Товар найден
 *       404:
 *         description: Товар не найден
 *   put:
 *     summary: Полностью обновить товар
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Товар успешно обновлен
 *       404:
 *         description: Товар не найден
 *   patch:
 *     summary: Частично обновить товар
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Товар успешно обновлен
 *   delete:
 *     summary: Удалить товар
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Товар успешно удален
 */

/**
 * @openapi
 * /api/products/{id}/image:
 *   post:
 *     summary: Загрузить изображение товара через Multer
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID товара
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Файл изображения (JPEG или PNG, макс. 2 МБ)
 *     responses:
 *       200:
 *         description: Изображение успешно загружено
 *       400:
 *         description: Неверный формат файла или превышен размер
 *       404:
 *         description: Товар не найден
 */

// 1. GET /api/products — Получение списка с фильтрацией и пагинацией
router.get('/', (req, res) => {
  let { category, minPrice, maxPrice, page = 1, limit = 10 } = req.query;
  
  page = parseInt(page);
  limit = parseInt(limit);
  let filteredProducts = [...productsDb];

  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }

  if (minPrice) {
    filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(minPrice));
  }
  if (maxPrice) {
    filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(maxPrice));
  }

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
    createdAt: productsDb[index].createdAt
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

  product.imageUrl = `/uploads/products/${req.file.filename}`;

  res.json({
    message: 'Изображение успешно загружено',
    product
  });
});

module.exports = router;