"use strict";

const { BadRequestError, NotFoundError } = require("../core/error.response");
const discountModel = require("../models/discount.model");
const { convertToObjectId } = require("../utils");
const { findAllProducts } = require("../models/repositories/product.repo");
const {
  findAllDiscountsUnSelect,
  checkDiscountExist,
} = require("../models/repositories/discount.repo");
/*
 Discount Service Module
 1. Generator for discount codes [shop | Admin]
 2. Get discount amount [user]
 3. Get all discounts codes [user, | shop]
 4. Verify discount code [user]
 5. Delete discount code [shop | Admin]
 6. Cancel discount code [user]
*/

class DiscountService {
  static async createDiscountCode(discountData) {
    // Logic to create a discount
    const {
      code,
      name,
      type,
      value,
      startDate,
      endDate,
      maxUses,
      minOrderValue,
      description,
      isActive,
      appliesTo,
      productIds,
      usesCount,
      maxUsesPerUser,
      shopId,
      maxValue,
      userUsed,
    } = discountData;

    if (new Date() > new Date(endDate)) {
      throw new BadRequestError(
        "Discount code is not valid for the current date"
      );
    }

    if (new Date(startDate) >= new Date(endDate)) {
      throw new BadRequestError("Start date cannot be after end date");
    }

    //create index for discount code
    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectId(shopId),
      })
      .lean();
    if (foundDiscount && foundDiscount.discount_is_active) {
      throw new BadRequestError("Discount code already exists and is active");
    }

    const discount = new discountModel({
      discount_name: name,
      discount_code: code,
      discount_type: type,
      discount_value: value,
      discount_max_value: maxValue || 0, // default to 0 if not provided
      discount_start_date: new Date(startDate),
      discount_end_date: new Date(endDate),
      discount_max_uses: maxUses,
      discount_min_order_value: minOrderValue || 0,
      discount_description: description,
      discount_is_active: isActive || true, // default to true
      discount_applies_to: appliesTo || "all", // default to all
      discount_product_ids: appliesTo === "all" ? [] : productIds,
      discount_uses_count: usesCount || 0, // default to 0
      discount_max_uses_per_user: maxUsesPerUser || 1, // default to 1
      discount_users_used: userUsed || [],
      discount_shopId: convertToObjectId(shopId),
    });

    const createdDiscount = await discount.save();

    // This would typically involve saving the discount to a database
    return createdDiscount;
  }

  static async updateDiscountCode(discountId, updateData) {
    // Logic to update a discount
    const updatedDiscount = await discountModel.findByIdAndUpdate(
      discountId,
      updateData,
      { new: true }
    );
    if (!updatedDiscount) {
      throw new BadRequestError(
        "Discount code not found or could not be updated"
      );
    }
    return updatedDiscount;
  }

  /*
    get all products with discount code
  */

  static async getAllDiscountsCodeWithProduct({
    code,
    shopId,
    userId,
    limit = 50,
    page = 1,
  }) {
    

    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectId(shopId),
      })
      .lean();

    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new NotFoundError("Discount code not found");
    }

    const { discount_applies_to, discount_product_ids } = foundDiscount;
    let products = [];
    if (discount_applies_to === "all") {
      products = await findAllProducts({
        limit,
        page,
        filter: { isPublished: true, product_shop: convertToObjectId(shopId) },
        sort: "ctime",
        select: ["product_name"],
      });
    }

    if (discount_applies_to === "specific" && discount_product_ids.length > 0) {
      products = await findAllProducts({
        limit,
        page,
        filter: {
          _id: { $in: discount_product_ids.map((id) => convertToObjectId(id)) },
          isPublished: true,
          product_shop: convertToObjectId(shopId),
        },
        sort: "ctime",
        select: ["product_name"],
      });
    }
    return products;
  }

  /*
  get all discounts codes by shop
  */

  static async getAllDiscountsByShop({ shopId, limit = 50, page = 1 }) {
    const discounts = await findAllDiscountsUnSelect({
      limit,
      page,
      filter: {
        discount_shopId: convertToObjectId(shopId),
        discount_is_active: true,
      },
      unSelect: ["__v", "discount_shopId"],
      model: discountModel,
    });

    if (!discounts || discounts.length === 0) {
      throw new NotFoundError("No discounts found for this shop");
    }

    return discounts;
  }

  /*
   apply discount code
   */

  static async getDiscountAmount({ code, userId, shopId, products }) {
    const foundDiscount = await checkDiscountExist(discountModel, {
      discount_code: code,
      discount_shopId: convertToObjectId(shopId),
      discount_is_active: true,
    });
    if (!foundDiscount) {
      throw new NotFoundError("Discount code not found or inactive");
    }

    const {
      discount_type,
      discount_value,
      discount_max_value,
      discount_min_order_value,
      discount_max_uses,
      discount_start_date,
      discount_end_date,
      discount_max_uses_per_user,
      discount_users_used,
    } = foundDiscount;

    if (discount_max_uses <= foundDiscount.discount_uses_count) {
      throw new BadRequestError("Discount code has reached its maximum uses");
    }

    if (
      new Date() < new Date(discount_start_date) ||
      new Date() > new Date(discount_end_date)
    ) {
      throw new BadRequestError(
        "Discount code is not valid for the current date"
      );
    }

    let totalOrder = 0;
    if (discount_min_order_value > 0) {
      totalOrder = products.reduce((total, product) => {
        return total + product.price * (product.quantity || 1);
      }, 0);

      if (totalOrder < discount_min_order_value) {
        throw new BadRequestError(
          "Total order value does not meet the minimum required for this discount"
        );
      }
    }

    if (discount_max_uses_per_user > 0) {
      const userUsesCount = discount_users_used.filter(
        (user) => user.toString() === userId.toString()
      ).length;

      if (userUsesCount >= discount_max_uses_per_user) {
        throw new BadRequestError(
          "You have reached the maximum uses for this discount code"
        );
      }
    }

    //check type discount
    let discountAmount = 0;
    if (discount_type === "fixed") {
      discountAmount = discount_value;
      if (discount_max_value > 0 && discountAmount > discount_max_value) {
        discountAmount = discount_max_value;
      }
    } else if (discount_type === "percentage") {
      discountAmount = (discount_value / 100) * totalOrder;
      if (discount_max_value > 0 && discountAmount > discount_max_value) {
        discountAmount = discount_max_value;
      }
    }

    return {
      totalOrder,
      discountAmount,
      totalPrice: totalOrder - discountAmount,
    };
  }

  //Delete discount code
  static async deleteDiscountCode (code, shopId) {
    const deletedDiscount = await discountModel.findOneAndDelete({
      discount_code: code,
      discount_shopId: convertToObjectId(shopId),
    });

    if (!deletedDiscount) {
      throw new NotFoundError("Discount code not found or could not be deleted");
    }

    return deletedDiscount;
  }

  //cancel discount code
  static async cancelDiscountCode(code, userId, shopId) {
    const foundDiscount = await checkDiscountExist(discountModel, {
      discount_code: code,
      discount_shopId: convertToObjectId(shopId),
      discount_is_active: true,
    });

    if (!foundDiscount) {
      throw new NotFoundError("Discount code not found or inactive");
    }

    // Check if the user has used this discount code
    if (!foundDiscount.discount_users_used.includes(userId)) {
      throw new BadRequestError("You have not used this discount code");
    }

    // Remove the user from the used list
    foundDiscount.discount_users_used = foundDiscount.discount_users_used.filter(
      (user) => user.toString() !== userId.toString()
    );

    // Decrease the uses count
    foundDiscount.discount_max_uses += 1;
    foundDiscount.discount_uses_count -= 1;

    // Save the updated discount
    const updatedDiscount = await foundDiscount.save();

    return updatedDiscount;
  }

}

module.exports = DiscountService;
