import mongoose, { Schema, Document, models, Model } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  featured: boolean;
  sku: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    slug: { type: String, required: [true, "Slug is required"], trim: true, lowercase: true },
    description: { type: String, required: [true, "Description is required"], trim: true },
    price: { type: Number, required: [true, "Price is required"], min: [0, "Price must be >= 0"] },
    category: { type: String, required: [true, "Category is required"], trim: true },
    images: { type: [String], default: [] },
    stock: { type: Number, required: [true, "Stock is required"], min: [0, "Stock must be >= 0"], default: 0 },
    featured: { type: Boolean, default: false },
    sku: { type: String, required: [true, "SKU is required"], trim: true, unique: true },
  },
  { timestamps: true }
);

const Product: Model<IProduct> = models.Product ?? mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
