import Review from '../models/Review.js';
import Product from '../models/Product.js';
import { updateAverage } from '../utils/calcAverageRating.js';

export async function createReview(req, res) {
  const { productId, rating, text } = req.body;
  const review = await Review.create({ vendor: req.user.sub, product: productId, rating, text });
  const product = await Product.findById(productId);
  const { avg, count } = updateAverage(product.averageRating, product.ratingCount, rating);
  product.averageRating = avg;
  product.ratingCount = count;
  await product.save();
  res.status(201).json(review);
}
