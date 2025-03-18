import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  title: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
}, { collection: 'categories' });

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

export default Category;