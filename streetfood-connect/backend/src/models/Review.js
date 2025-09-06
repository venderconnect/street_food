import mongoose from 'mongoose';
const reviewSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  text: String,
  createdAt: { type: Date, default: Date.now }
});
reviewSchema.index({ vendor: 1, product: 1 }, { unique: true });
export default mongoose.model('Review', reviewSchema);
