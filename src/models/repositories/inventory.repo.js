"use strict";
const { convertToObjectId } = require("../../utils");
const inventory = require("../inventory.model");
const { Types } = require("mongoose");
const insertInventory = async ({
  productId,
  shopId,
  location = "unKnown",
  stock,
}) => {
  const newInventory = new inventory({
    inven_productId: productId,
    inven_location: location,
    inven_stock: stock,
    inven_shopId: shopId,
  });

  return await newInventory.save();
};

const reservationInventory = async ({ productId, quantiy, cartId }) => {
  const query = {
      inven_productId: convertToObjectId(productId),
      inven_stock: { $gte: quantiy },
    },
    updateSet = {
      $inc: {
        inven_stock: -quantiy,
      },
      $push: {
        inven_reservations: {
          quantiy,
          cartId,
          createOn: new Date()
        },
      },
    }, options = { upsert: true, new: true};

    return await inventory.updateOne(query, updateSet)
};

module.exports = {
  insertInventory,
  reservationInventory
};
