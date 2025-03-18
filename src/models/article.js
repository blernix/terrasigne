import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }, // 1 catégorie
  tags: [{ type: String }], // liste de tags
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Article || mongoose.model('Article', articleSchema);