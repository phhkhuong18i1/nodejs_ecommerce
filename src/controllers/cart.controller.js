"use strict";

const { SuccessResponse } = require("../core/success.response");
const CartService = require("../services/cart.service");

class CartController {
  addToCart = async (req, res, next) => {
    new SuccessResponse(
      "Add to cart success",
      200,
      await CartService.addToCart(req.body)
    ).send(res);
  };

  update = async (req, res, next) => {
    new SuccessResponse(
      "update to cart success",
      200,
      await CartService.addToCartV2(req.body)
    ).send(res);
  };

  delete = async (req, res, next) => {
    new SuccessResponse(
      "delete to cart success",
      200,
      await CartService.deleteUSerCart(req.body)
    ).send(res);
  };

  list = async (req, res, next) => {
    new SuccessResponse(
      "Get list cart success",
      200,
      await CartService.getListUserCart(req.query)
    ).send(res);
  };
}

module.exports = new CartController();
