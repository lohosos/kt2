const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Обработка ошибок Multer
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'Ошибка загрузки: Файл слишком большой. Максимум 2 МБ.' });
  }
  
  if (err.message === 'Недопустимый формат файла. Разрешены только JPEG и PNG.') {
    return res.status(400).json({ message: err.message });
  }

  res.status(500).json({
    message: 'Внутренняя ошибка сервера',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
};

module.exports = errorHandler;