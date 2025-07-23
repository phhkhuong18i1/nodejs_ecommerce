"use strict";

"use strict";

const { model, Schema, Types } = require("mongoose");

const DOCUMENT_NAME = "Discount";
const COLLECTION_NAME = "discounts";

const discountSchema = new Schema(
  {
    discount_name: {
      type: String,
      required: true,
    },
    discount_code: {
      type: String,
      required: true,
      unique: true,
    },
    discount_type: {
      type: String,
      required: true,
      default: "fixed", // or 'percentage'
    },
    discount_value: {
      type: Number,
      required: true,
    }, // 10.000, 10%
    discount_max_value: {
      type: Number,
      default: 0,
    }, // Maximum value for the discount, if applicable
    discount_start_date: {
      type: Date,
      required: true,
    }, // Start date for the discount validity
    discount_end_date: {
      type: Date,
      required: true,
    }, // End date for the discount validity
    discount_max_uses: {
      type: Number,
      required: true,
    }, // Maximum number of times the discount can be used
    discount_uses_count: {
      type: Number,
      required: true,
    }, // Count of how many times the discount has been used
    discount_users_used: {
      type: Array,
      default: [],
    }, // Array of user IDs who have used the discount
    discount_max_uses_per_user: {
      type: Number,
      required: true,
    }, // Maximum number of times a single user can use the discount
    discount_min_order_value: {
      type: Number,
      required: true, // Minimum order value to apply the discount
    },
    discount_description: {
      type: String,
      default: "",
    },
    discount_shopId: {
      type: Types.ObjectId,
      ref: "Shop",
      required: true,
    }, // Reference to the shop that created the discount
    discount_is_active: {
      type: Boolean,
      default: true,
    }, // Whether the discount is currently active
    discount_applies_to: {
      type: String,
      enum: ["all", "specific"],
      default: "all",
    }, // Whether the discount applies to all products, specific products
    discount_product_ids: {
      type: Array,
      default: [],
    }, // Array of product IDs to which the discount applies if 'specific'
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, discountSchema);
