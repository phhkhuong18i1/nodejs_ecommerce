"use strict";
const  inventory  = require("../inventory.model");
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

module.exports = {
  insertInventory,
}