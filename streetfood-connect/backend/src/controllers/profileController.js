import Product from '../models/Product.js';
import GroupOrder from '../models/GroupOrder.js';

export async function supplierProfile(req, res) {
  const { id } = req.params;
  const products = await Product.find({ supplier: id }).sort({ createdAt: -1 });
  res.json({ products });
}

export async function vendorProfile(req, res) {
  const { id } = req.params;
  const orders = await GroupOrder.find({ 'participants.vendor': id }).sort({ createdAt: -1 }).limit(100);
  res.json({ orders });
}
