import mongoose from 'mongoose';
import GroupOrder from '../models/GroupOrder.js';
import Product from '../models/Product.js';

export async function createGroupOrder(req, res) {
  const { productId, quantity } = req.body;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  const order = await GroupOrder.create({
    product: product._id,
    supplier: product.supplier,
    participants: [{ vendor: req.user.sub, quantity }],
    createdBy: req.user.sub
  });
  res.status(201).json(order);
}

export async function joinGroupOrder(req, res) {
  const { id } = req.params;
  const { quantity } = req.body;
  const order = await GroupOrder.findById(id);
  if (!order || order.status !== 'open') return res.status(400).json({ message: 'Cannot join' });
  const idx = order.participants.findIndex(p => p.vendor.toString() === req.user.sub);
  if (idx === -1) order.participants.push({ vendor: req.user.sub, quantity });
  else order.participants[idx].quantity += quantity;
  await order.save();
  res.json(order);
}

export async function updateQuantity(req, res) {
  const { id } = req.params;
  const { quantity } = req.body;
  const order = await GroupOrder.findById(id);
  if (!order || order.status !== 'open') return res.status(400).json({ message: 'Cannot modify' });
  const p = order.participants.find(p => p.vendor.toString() === req.user.sub);
  if (!p) return res.status(404).json({ message: 'Not in order' });
  p.quantity = quantity;
  await order.save();
  res.json(order);
}

export async function closeGroupOrder(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const order = await GroupOrder.findById(id).session(session).populate('product');
    if (!order || order.status !== 'open') {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Invalid order state' });
    }
    order.status = 'completed';
    order.closedAt = new Date();
    await order.save({ session });
    await session.commitTransaction();
    session.endSession();
    return res.json(order);
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: 'Close failed' });
  }
}

export async function myOrders(req, res) {
  const orders = await GroupOrder.find({ 'participants.vendor': req.user.sub }).sort({ createdAt: -1 }).limit(100);
  res.json(orders);
}
