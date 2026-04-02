const { Product } = require('../models');

exports.getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const { count, rows: products } = await Product.findAndCountAll({
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    const totalPages = Math.ceil(count / limit);
    res.json({
      products,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, costPrice, stock, category } = req.body;
    const product = await Product.create({ 
      name, 
      description, 
      price, 
      costPrice: costPrice || 0, 
      stock: stock || 0,
      category: category || 'General'
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const { name, description, price, costPrice, stock, category } = req.body;
    await product.update({ 
      name, 
      description, 
      price, 
      costPrice: costPrice || 0, 
      stock: stock || 0,
      category: category || 'General'
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    await product.destroy();
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStock = async (req, res) => {
  try {
    const products = await Product.findAll({ 
      attributes: ['id', 'name', 'stock'],
      where: { stock: { [require('sequelize').Op.gt]: 0 } }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
