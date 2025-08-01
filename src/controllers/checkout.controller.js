"use strict";

const CheckoutService = require("../services/checkout.service");
const { SuccessResponse } = require("../core/success.response");

class CheckoutController {
  checkoutReview = async (req, res, next) => {
    new SuccessResponse(
      "Add to cart success",
      200,
      await CheckoutService.checkoutReview(req.body)
    ).send(res);
  };
}

module.exports = new CheckoutController();
