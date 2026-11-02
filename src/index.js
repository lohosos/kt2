const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const productRoutes = require('./routes/products');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Конфигурация Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Каталог товаров REST API',
      version: '1.0.0',
      description: 'Интерактивная документация для взаимодействия с файлами и CRUD',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  // Указываем явные пути к файлам для Windows и Linux
  apis: [
    path.join(__dirname, 'routes', '*.js'),
    './src/routes/*.js'
  ],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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
  console.log(`Документация Swagger доступна на http://localhost:${PORT}/api-docs`);
});