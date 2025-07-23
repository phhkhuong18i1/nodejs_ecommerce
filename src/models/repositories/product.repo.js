"use strict";
const { get } = require("lodash");
const { product } = require("../product.model");
const { Types } = require("mongoose");
const { getSelectData, unGetSelectData } = require("../../utils");
const findAllDraftsForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};

const findAllPublishForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};

const searchProduct = async ({ keySearch, limit, skip }) => {
  const regexSearch = new RegExp(keySearch, "i");
  const results = await product
    .find(
      {
        $text: {
          $search: regexSearch,
        },
        isPublished: true,
      },
      {
        score: { $meta: "textScore" },
      }
    )
    .sort({ score: { $meta: "textScore" } })
    .populate("product_shop", "name email -_id")
    .lean()
    .limit(limit)
    .skip(skip);

  return results;
};

const publishProductByShop = async ({ productId, product_shop }) => {
  const foundProduct = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(productId),
  });
  if (!foundProduct) return null;

  const { modifiedCount } = await product.updateOne(
    { _id: productId },
    { $set: { isDraft: false, isPublished: true } }
  );

  return modifiedCount;
};

const unPublishProductByShop = async ({ productId, product_shop }) => {
  const foundProduct = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(productId),
  });
  if (!foundProduct) return null;

  const { modifiedCount } = await product.updateOne(
    { _id: productId },
    { $set: { isDraft: true, isPublished: false } }
  );

  return modifiedCount;
};

const findAllProducts = async ({ limit, sort, page, filter, select }) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  const products = await product
    .find(filter)
    .populate("product_shop", "name email -_id")
    .limit(limit)
    .skip(skip)
    .sort(sortBy)
    .select(getSelectData(select))
    .lean()
    .exec();
  return products;
};

const findProduct = async ({ productId, unSelect }) => {
  const foundProduct = await product.findOne({
    _id: new Types.ObjectId(productId),
    isPublished: true,
  })
  .select(unGetSelectData(unSelect))
  .populate("product_shop", "name email -_id")
  .lean()
  .exec();
  if (!foundProduct) return null;

  return foundProduct;
};

const updateProductById = async (productId, payload, model, isNew = true) => {
  const updatedProduct = await model.findByIdAndUpdate(
    productId,
    payload,
    {
      new: isNew,
    }
  );

  return updatedProduct;
};

const queryProduct = async ({ query, limit = 50, skip = 0 }) => {
  const products = await product
    .find(query)
    .populate("product_shop", "name email -_id")
    .limit(limit)
    .skip(skip)
    .sort({ updateAt: -1 })
    .lean()
    .exec();
  return products;
};

module.exports = {
  findAllDraftsForShop,
  publishProductByShop,
  findAllPublishForShop,
  unPublishProductByShop,
  searchProduct,
  findAllProducts,
  findProduct,
  updateProductById
};
