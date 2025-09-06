import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, index: true },
  passwordHash: String,
  role: { type: String, enum: ['vendor','supplier'], required: true },
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.model('User', userSchema);
