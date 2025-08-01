"use strict"

const { model, Schema, Types } = require("mongoose");

const DOCUMENT_NAME = "Order";
const COLLECTION_NAME = "orders";

const orderSchema = new Schema(
  {
   order_userId: {type: Number, required: true},
   order_checkout: {type: Object, default: {}},
   order_shipping: {type: Object, required: true},
   order_payment: {type: Object, default: {}},
   order_products: {type: Array, required: true},
   order_trackingNumber: {type: String, default: "#000123072025"},
   order_status: {type: String, enum: ["pending", "confirmed", "shipped", "cancelled", "delivered"], default: "pending"}
   }
  ,
  {
    collection: COLLECTION_NAME,
    timestamps: {
        createdAt: "createdOn",
        updatedAt: "modifiedOn"
    }
  }
);

module.exports = model(DOCUMENT_NAME, orderSchema);
