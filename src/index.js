const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const productRoutes = require('./routes/products');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Глобальные middleware
app.use(express.json());
app.use(logger);

// Статика для загруженных картинок
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Маршруты API
app.use('/api/products', productRoutes);

// Обработчик несуществующих маршрутов (404)
app.use((req, res, next) => {
  res.status(404).json({ message: 'Маршрут не найден' });
});

// Глобальный обработчик ошибок
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});