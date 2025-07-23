"use strict";

const { model, Schema, Types } = require("mongoose");

const DOCUMENT_NAME = "Inventory";
const COLLECTION_NAME = "Inventorys";

const inventorySchema = new Schema(
  {
    inven_productId: {
      type: Types.ObjectId,
      ref: "Product",
      required: true,
    },
    inven_location: {
      type: String,
      default: "unKnown",
    },
    inven_stock: {
      type: Number,
      required: true,
    },
    inven_shopId: {
      type: Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    inven_reservations: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, inventorySchema);
