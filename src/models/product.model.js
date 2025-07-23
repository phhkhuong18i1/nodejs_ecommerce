"use strict";

const { model, Schema } = require("mongoose");
const slugify = require("slugify");

const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "Products";

const productSchema = new Schema(
  {
    product_name: {
      type: String,
      required: true,
    },
    product_thumb: {
      type: String,
      required: true,
    },
    product_price: {
      type: Number,
      required: true,
    },
    product_description: {
      type: String,
    },
    product_slug: {
      type: String,
      unique: true,
    },
    product_quantity: {
      type: Number,
      required: true,
    },
    product_type: {
      type: String,
      required: true,
      enum: ["electronics", "clothing", "furniture"],
    },
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    product_attributes: {
      type: Schema.Types.Mixed,
      required: true,
    },
    //more
    product_ratingAverage: {
      type: Number,
      default: 4.5,
      min:[1, "Rating must be at least 1"],
      max:[5, "Rating must be at most 5"],
      set: (v) => Math.round(v * 10) / 10, // round to one decimal place
    },
    product_variations: {
      type: [String],
      default: [],
    },
    isDraft: {
      type: Boolean,
      default: true,
      select: false, // do not return this field by default
      index: true, // index for faster queries
    },
    isPublished: {
      type: Boolean,
      default: false,
      select: false, // do not return this field by default
      index: true, // index for faster queries
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

// cxreate indexes for faster queries
productSchema.index({ product_name: "text", product_description: "text" });

// Document middleware to create slug before saving
productSchema.pre("save", function (next) {
  if (this.isModified("product_name")) {
    this.product_slug = slugify(this.product_name, {
      lower: true,
      strict: true,
    });
  }
  next();
});

const clothingSchema = new Schema(
  {
    size: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    material: {
      type: String,
      required: true,
    },
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
  },
  {
    collection: "Clothes",
    timestamps: true,
  }
);

const electronicsSchema = new Schema(
  {
    manufacturer: {
      type: String,
      required: true,
    },
    model: {
      type: String,
    },
    color: {
      type: String,
    },
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
  },
  {
    collection: "Electronics",
    timestamps: true,
  }
);

const furnitureSchema = new Schema(
  {
    size: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    material: {
      type: String,
      required: true,
    },
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
  },
  {
    collection: "furnitures",
    timestamps: true,
  }
);

module.exports = {
  product: model(DOCUMENT_NAME, productSchema),
  clothing: model("Clothing", clothingSchema),
  electronic: model("Electronic", electronicsSchema),
  furniture: model("Furniture", furnitureSchema),
};
