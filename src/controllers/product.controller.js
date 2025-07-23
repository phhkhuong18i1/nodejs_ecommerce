"use strict";

const { SuccessResponse } = require("../core/success.response");
const ProductService = require("../services/product.service");
const ProductServiceV2 = require("../services/product.service.xxx");

class ProductController {
   createProduct = async (req, res, next) => {
     SuccessResponse.create(
      "Product created successfully!",
      200,
      await ProductServiceV2.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId,
      })
    ).send(res);
  };

  /**
   * @desc Get all drafts for shop
   * @route GET /api/v1/product/drafts/all
   * @param {Number} limit 
   * @param {Number} skip 
   * @return {JSON} 
   */
  getAllDraftsForShop = async (req, res, next) => {
    SuccessResponse.create(
      "Get all drafts for shop successfully!",
      200,
      await ProductServiceV2.findAllDraftsForShop({
        product_shop: req.user.userId,
        limit: req.query.limit,
        skip: req.query.skip,
      })
    ).send(res);
  }

  /**
   * @desc Get all publish for shop
   * @route GET /api/v1/product/published/all
   * @param {Number} limit 
   * @param {Number} skip 
   * @return {JSON} 
   */
  getAllPublishForShop = async (req, res, next) => {
    SuccessResponse.create(
      "Get all publish for shop successfully!",
      200,
      await ProductServiceV2.findAllPublishForShop({
        product_shop: req.user.userId,
        limit: req.query.limit,
        skip: req.query.skip,
      })
    ).send(res);
  }

  /**
   * 
   * @param {String} productId
   * @desc Publish product by shop
   * @route POST /api/v1/product/publish/:id 
    * @return {JSON}
   */
  publishProductByShop = async (req, res, next) => {
    SuccessResponse.create(
      "Product published successfully!",
      200,
      await ProductServiceV2.publishProductByShop({
        productId: req.params.id,
        product_shop: req.user.userId,
      })
    ).send(res);
  }

  /**
   * @param {String} productId
   * @desc Unpublish product by shop
   * @route POST /api/v1/product/unpublish/:id
   * @return {JSON} 
   * 
   */
    unPublishProductByShop = async (req, res, next) => {
    SuccessResponse.create(
      "Product published successfully!",
      200,
      await ProductServiceV2.unPublishProductByShop({
        productId: req.params.id,
        product_shop: req.user.userId,
      })
    ).send(res);
  }

  /**
   * @desc Search product
   * @route GET /api/v1/product/search
   * @param {String} keySearch
   * @param {Number} limit
   * @param {Number} skip
   * @return {JSON}
   */
  searchProduct = async (req, res, next) => {
    SuccessResponse.create(
      "Search product successfully!",
      200,
      await ProductServiceV2.searchProduct({
        keySearch: req.query.keySearch,
        limit: req.query.limit,
        skip: req.query.skip,
      })
    ).send(res);
  }

  /**
   * @desc Get all products
   * @route GET /api/v1/product
   * @param {Number} limit
   * @param {String} sort
   * @param {Number} page
   * @param {Object} filter
   * @param {Array} select
   * @return {JSON}
   */
  findAllProducts = async (req, res, next) => {
    SuccessResponse.create(
      "Get all products successfully!",
      200,
      await ProductServiceV2.findAllProducts(req.query)
    ).send(res);
  }

  /**
   * @desc Find product by ID
   * @route GET /api/v1/product/:productId
   * @param {String} productId
   * @return {JSON}
   */
  findProduct = async (req, res, next) => {
    SuccessResponse.create(
      "Find product successfully!",
      200,
      await ProductServiceV2.findProduct({
        productId: req.params.productId,
      })
    ).send(res);
  }

  /**
   * @desc Update product by ID
   * @route PUT /api/v1/product/:productId
   * @param {String} productId
   * @return {JSON}
   */
  updateProduct = async (req, res, next) => {
    SuccessResponse.create(
      "Product updated successfully!",
      200,
      await ProductServiceV2.updateProduct(
        req.body.product_type,
        req.params.productId,
        {
          ...req.body,
          product_shop: req.user.userId,
        }
      )
    ).send(res);
  }
}
module.exports = new ProductController();
