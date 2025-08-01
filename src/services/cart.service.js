"use strict";

const { NotFoundError } = require("../core/error.response");
const cartModel = require("../models/cart.model");
const { getProductById } = require("../models/repositories/product.repo");

/*
key features: Cart service
- add product to cart [user]
- reduce product quantity by one [User]
- increase product quantity by one [User]
- get cart [user]
- Delete cart [user]
- Delete cart item [User]
*/

class CartService {
  //start repo cart
  static async createUserCart({ userId, product }) {
    const query = { cart_userId: userId, cart_state: "active" },
      updateOrInsert = {
        $addToSet: {
          cart_products: product,
        },
      },
      options = { upsert: true, new: true };

    return await cartModel.findOneAndUpdate(query, updateOrInsert, options);
  }

  static async updateUserCartQuantity({ userId, product }) {
    const userCart = await cartModel.findOne({
      cart_userId: userId,
    });

    const existingProduct = userCart.cart_products.find(
      (p) => p.productId.toString() === product.productId.toString()
    );

    if (existingProduct) {
      const { productId, quantity } = product;
      const query = {
          cart_userId: userId,
          "cart_products.productId": productId,
          cart_state: "active",
        },
        updateSet = {
          $inc: {
            "cart_products.$.quantity": quantity,
          },
        },
        options = { upsert: true, new: true };

      return await cartModel.findOneAndUpdate(query, updateSet, options);
    } else {
      return await cartModel.updateOne(
        { cart_userId: userId },
        {
          $push: { cart_products: product },
        }
      );
    }
  }
  //end repo cart

  static async addToCart({ userId, product = {} }) {
    // check cart ton tai hay khong
    const userCart = await cartModel.findOne({
      cart_userId: userId,
    });
    if (!userCart) {
      //create cart
      return await CartService.createUserCart({ userId, product });
    }

    // Neu co gio hang roi nhung chua cos san pham
    if (!userCart.cart_products.length) {
      userCart.cart_products = [product];
      return await userCart.save();
    }

    //Gio hang ton tai va co san pham nay thi update quantity
    return await CartService.updateUserCartQuantity({ userId, product });
  }

  //update cart
  /*

        shop_order_ids: [
            {
                shopId
                item_products: [
                    {
                        quantity,
                        price,
                        shopId,
                        old_quantity,
                        productId
                    }
                ],
                version
            }
        ]
    */

  static async addToCartV2({ userId, shop_order_ids = [] }) {
    const { productId, quantity, old_quantity } =
      shop_order_ids[0]?.item_products[0];
    // check product

    const foundProduct = await getProductById(productId);
    if (!foundProduct) throw new NotFoundError("Product not found");
    //compare

    if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId)
      throw new NotFoundError("Shop not found");

    if (quantity == 0) {
      //deleted
    }

    return await CartService.updateUserCartQuantity({
      userId,
      product: {
        productId,
        quantity: quantity - old_quantity,
      },
    });
  }

  static async deleteUSerCart({ userId, productId }) {
    const query = {
        cart_userId: userId,
        cart_state: "active",
      },
      updateSet = {
        $pull: {
          cart_products: {
            productId,
          },
        },
      };

    const deleteCart = await cartModel.updateOne(query, updateSet);
    return deleteCart;
  }

  static async getListUserCart({ userId }) {
    return await cartModel
      .findOne({
        cart_userId: userId,
      })
      .lean();
  }
}

module.exports = CartService;
