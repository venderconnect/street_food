import Product from '../models/Product.js';

export async function listProducts(req, res) {
  const { isPrepped } = req.query;
  const filter = {};
  if (isPrepped !== undefined) filter.isPrepped = isPrepped === 'true';
  const products = await Product.find(filter).sort({ createdAt: -1 }).limit(200);
  res.json(products);
}

export async function getProduct(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Not found' });
  res.json(product);
}

export async function createProduct(req, res) {
  if (req.user.role !== 'supplier') return res.status(403).json({ message: 'Forbidden' });
  const doc = await Product.create({ ...req.body, supplier: req.user.sub });
  res.status(201).json(doc);
}
