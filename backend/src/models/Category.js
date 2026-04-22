import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    normalizedName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

categorySchema.pre("validate", function setNormalizedName() {
  if (this.name) {
    this.name = this.name.trim().replace(/\s+/g, " ");
    this.normalizedName = this.name.toLowerCase();
  }
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
