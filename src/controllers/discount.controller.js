"use strict";

const { SuccessResponse } = require("../core/success.response");
const DiscountService = require("../services/discount.service");

class DiscountController {
  createDiscountCode = async (req, res, next) => {
    new SuccessResponse(
      "Create discount success",
      200,
      await DiscountService.createDiscountCode({
        ...req.body,
        shopId: req.user.userId,
      })
    ).send(res);
  };

  getAllDiscountCodes = async (req, res, next) => {
      new SuccessResponse(
      "get all discount success",
      200,
      await DiscountService.getAllDiscountsByShop({
        ...req.query,
      })
    ).send(res);
  }

  getDiscountAmount = async (req, res, next) => {
      new SuccessResponse(
      "get product discount success",
      200,
      await DiscountService.getDiscountAmount({
        ...req.body,
      })
    ).send(res);
  }

  getAllDiscountCodesWithProducts = async (req, res, next) => {
      new SuccessResponse(
      "get discount amount success",
      200,
      await DiscountService.getAllDiscountsCodeWithProduct({
        ...req.query,
      })
    ).send(res);
  }
}


module.exports = new DiscountController();