"use strict";

const { model, Schema } = require("mongoose");

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
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

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
