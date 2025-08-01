"use strict";

const { NotFoundError, BadRequestError } = require("../core/error.response");
const orderModel = require("../models/order.model");
const { findCartById } = require("../models/repositories/cart.repo");
const { checkProductByServer } = require("../models/repositories/product.repo");
const { getDiscountAmount } = require("./discount.service");
const { acquireLock, releaseLock } = require("./redis.service");

class CheckoutService {
  static async checkoutReview({ cartId, userId, shop_order_ids }) {
    //check cartId co ton tai

    const foundCart = await findCartById(cartId);
    if (!foundCart) throw new BadRequestError("Cart not exist");

    const checkout_order = {
        totalPrice: 0, // tong tien hang
        feeShip: 0,
        totalDiscount: 0, // tong tien discount giam gia
        totalCheckout: 0, //tong thanh toan
      },
      shop_order_ids_new = [];

    // tinh tong bill

    for (let i = 0; i < shop_order_ids.length; i++) {
      const {
        shopId,
        shop_discounts = [],
        item_products = [],
      } = shop_order_ids[i];

      const checkProductServer = await checkProductByServer(item_products);
      if (!checkProductServer[0]) throw new BadRequestError("Order wrong");

      const checkoutPrice = checkProductServer.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);

      //tong tien truoc khi xu ly

      checkout_order.totalPrice = checkoutPrice;

      const itemCheckout = {
        shopId,
        shop_discounts,
        priceRaw: checkoutPrice, // tien truoc khi giam gia
        priceApplyDiscount: checkoutPrice,
        item_products: checkProductServer,
      };

      //neu shop_discounts ton tai > 0, check co hop le ko

      if (shop_discounts.length > 0) {
        //neu co 1 discount
        // get amount discount

        const { totalPrice, discountAmount = 0 } = await getDiscountAmount({
          code: shop_discounts[0].code,
          userId,
          shopId,
          products: checkProductServer,
        });

        //tong cong discount giam gia
        checkout_order.totalDiscount += discountAmount;

        if (discountAmount > 0) {
          itemCheckout.priceApplyDiscount = checkoutPrice - discountAmount;
        }
      }

      //tong thanh toan cuoi cung
      checkout_order.totalCheckout += itemCheckout.priceApplyDiscount;
      shop_order_ids_new.push(itemCheckout);
    }

    return {
      shop_order_ids,
      shop_order_ids_new,
      checkout_order,
    };
  }

  static async orderByUser({
    shop_order_ids,
    cartId,
    userId,
    userAddress = {},
    userPayment = {},
  }) {
    const { shop_order_ids_new, checkout_order } =
      await CheckoutService.checkoutReview({
        cartId,
        userId,
        shop_order_ids,
      });

    // check lai lan nua xem vuot ton kho hay ko
    // get new array products

    const products = shop_order_ids.flatMap((order) => order.item_products);
    console.log("[1]:", products);
    const acquireProduct = [];
    for (let i = 0; i < products.length; i++) {
      const { productId, quantity } = products[i];

      const keyLock = await acquireLock(productId, quantity, cartId);
      acquireProduct.push(keyLock ? true : false);

      if (keyLock) {
        await releaseLock(keyLock);
      }
    }

    // check neu co san pham het hang
    if (acquireProduct.includes(false)) {
      throw new BadRequestError(
        "Mot so san pham da duoc cap nhat, vui long quay lai gio hang..."
      );
    }

    const newOrder = await orderModel.create({
      order_userId: userId,
      order_checkout: checkout_order,
      order_shipping: userAddress,
      order_payment: userPayment,
      order_products: shop_order_ids_new,
    });

    // truong hop: neu insert thanh cong, thi remove product in cart

    if (newOrder) {
    }

    return newOrder;
  }

  static async getOrdersByUser() {}

  static async getOneOrderByUser() {}

  static async cancelOrderByUser() {}

  static async updateOrderStatusByShop() {}
}

module.exports = CheckoutService;
