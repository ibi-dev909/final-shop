import mongoose, { Schema, Document, models, Model } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    slug: { type: String, required: [true, "Slug is required"], trim: true, lowercase: true, unique: true },
    description: { type: String, default: "", trim: true },
    image: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

const Category: Model<ICategory> =
  models.Category ?? mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
