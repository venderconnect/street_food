import mongoose from 'mongoose';
const productSchema = new mongoose.Schema({
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  description: String,
  price: Number,
  unit: String,
  isPrepped: { type: Boolean, default: false },
  averageRating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.model('Product', productSchema);
