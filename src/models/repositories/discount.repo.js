"use strict";

const { unGetSelectData, getSelectData } = require("../../utils");

const findAllDiscountsUnSelect = async ({
  limit = 50,
  page = 1,
  sort = "ctime",
  filter = {},
  unSelect = [],
  model,
}) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  const discounts = await model
    .find(filter)
    .limit(limit)
    .skip(skip)
    .sort(sortBy)
    .select(unGetSelectData(unSelect))
    .lean()
    .exec();

  // Assuming you have a Discount model to interact with the database
  return discounts;
};

const findAllDiscountsSelect = async ({
  limit = 50,
  page = 1,
  sort = "ctime",
  filter = {},
  select = [],
  model,
}) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  const discounts = await model
    .find(filter)
    .limit(limit)
    .skip(skip)
    .sort(sortBy)
    .select(getSelectData(select))
    .lean()
    .exec();

  // Assuming you have a Discount model to interact with the database
  return discounts;
};

const checkDiscountExist = (model, filter) => {
  return model.findOne(filter).lean();
};

module.exports = {
  findAllDiscountsUnSelect,
  findAllDiscountsSelect,
  checkDiscountExist,
};
