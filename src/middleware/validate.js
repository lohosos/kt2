const Joi = require('joi');

const productSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  price: Joi.number().greater(0).required(),
  category: Joi.string().valid('electronics', 'clothing', 'food', 'other').required(),
  stock: Joi.number().integer().min(0).default(0),
  description: Joi.string().max(500).optional().allow(''),
  imageUrl: Joi.string().optional().allow(null, '')
});

const validateProduct = (req, res, next) => {
  // Для PATCH делаем поля необязательными
  const schema = req.method === 'PATCH' ? productSchema.fork(Object.keys(productSchema.describe().keys), (field) => field.optional()) : productSchema;
  
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  
  if (error) {
    return res.status(400).json({
      details: error.details.map(err => ({
        message: err.message,
        path: err.path
      }))
    });
  }
  
  req.body = value;
  next();
};

module.exports = validateProduct;