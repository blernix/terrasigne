import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, default: 0 },
  slots: { type: Number, default: 0 },
  redirectLink: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Service || mongoose.model('Service', serviceSchema);