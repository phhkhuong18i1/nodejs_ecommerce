"use strict";

const e = require("express");
const { BadRequestError } = require("../core/error.response");
const {
  product,
  clothing,
  electronic,
  furniture,
} = require("../models/product.model");
const {
  findAllDraftsForShop,
  publishProductByShop,
  findAllPublishForShop,
  unPublishProductByShop,
  searchProduct,
  findAllProducts,
  findProduct,
  updateProductById,
} = require("../models/repositories/product.repo");
const { updateNestedObjectParser, removeUndefinedObject } = require("../utils");
const { insertInventory } = require("../models/repositories/inventory.repo");

//define Factory class to create product

class ProductFactory {
  static productRegistry = {};

  static registerProductType(type, ProductClass) {
    if (this.productRegistry[type]) {
      throw new BadRequestError(`Product type ${type} already registered`);
    }
    this.productRegistry[type] = ProductClass;
  }

  static createProduct = async (type, productData) => {
    const ProductClass = this.productRegistry[type];
    if (!ProductClass) {
      throw new BadRequestError("Invalid product type");
    }
    const productInstance = new ProductClass(productData);
    return await productInstance.createProduct();
  };

  static updateProduct = async (type, productId, payload) => {
    const ProductClass = this.productRegistry[type];
    if (!ProductClass) {
      throw new BadRequestError("Invalid product type");
    }
    const productInstance = new ProductClass(payload);
    return await productInstance.updateProduct(productId);
  };
  // put
  static async unPublishProductByShop({ productId, product_shop }) {
    return await unPublishProductByShop({ productId, product_shop });
  }

  static async publishProductByShop({ productId, product_shop }) {
    return await publishProductByShop({ productId, product_shop });
  }

  //query all drafts for shop
  static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = {
      product_shop,
      isDraft: true,
    };

    return await findAllDraftsForShop({ query, limit, skip });
  }

  static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = {
      product_shop,
      isPublished: true,
    };

    return await findAllPublishForShop({ query, limit, skip });
  }

  static async searchProduct({ keySearch, limit = 50, skip = 0 }) {
    return await searchProduct({ keySearch, limit, skip });
  }

  static async findAllProducts({
    limit = 50,
    sort = "ctime",
    page = 1,
    filter = { isPublished: true },
    select = [
      "product_name",
      "product_thumb",
      "product_price",
      "product_description",
    ],
  }) {
    return await findAllProducts({
      limit,
      sort,
      page,
      filter,
      select,
    });
  }

  static async findProduct({
    productId,
    unSelect = ["__v", "product_variations"],
  }) {
    return await findProduct({ productId, unSelect });
  }
}

//define Product class to handle product operations
class Product {
  constructor(productData) {
    this.product_name = productData.product_name;
    this.product_thumb = productData.product_thumb;
    this.product_price = productData.product_price;
    this.product_description = productData.product_description;
    this.product_quantity = productData.product_quantity;
    this.product_type = productData.product_type;
    this.product_shop = productData.product_shop;
    this.product_attributes = productData.product_attributes;
  }

  async createProduct(product_id) {
    const newProduct = await product.create({ ...this, _id: product_id });
    if (newProduct) {
      await insertInventory({
        productId: newProduct._id,
        shopId: this.product_shop,
        stock: this.product_quantity,
      });
    }

    return newProduct;
  }

  //update product
  async updateProduct(productId, payload) {
    return await updateProductById(productId, payload, product, true);
  }
}

//define sub-class for clothing products
class Clothing extends Product {
  async createProduct() {
    const newClothing = await clothing.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newClothing)
      throw new BadRequestError("Failed to create clothing product");

    const newProduct = await super.createProduct();
    if (!newProduct) throw new BadRequestError("Failed to create product");

    return newProduct;
  }

  async updateProduct(productId) {
    //1. remove attr has not undefined value
    const objectParams = removeUndefinedObject(this);
    //2. check update o cho nao
    if (objectParams.product_attributes) {
      await updateProductById(
        productId,
        updateNestedObjectParser(objectParams.product_attributes),
        clothing
      );
    }

    const updateProduct = await super.updateProduct(
      productId,
      updateNestedObjectParser(objectParams)
    );
    return updateProduct;
  }
}

//define sub-class for clothing products
class Electronic extends Product {
  async createProduct() {
    const newElectronic = await electronic.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newElectronic)
      throw new BadRequestError("Failed to create Electronic product");

    const newProduct = await super.createProduct(newElectronic._id);
    if (!newProduct) throw new BadRequestError("Failed to create product");

    return newProduct;
  }

  async updateProduct(productId) {
    //1. remove attr has not undefined value
    const objectParams = removeUndefinedObject(this);
    //2. check update o cho nao
    if (objectParams.product_attributes) {
      await updateProductById(
        productId,
        updateNestedObjectParser(objectParams.product_attributes),
        electronic
      );
    }

    const updateProduct = await super.updateProduct(
      productId,
      updateNestedObjectParser(objectParams)
    );
    return updateProduct;
  }
}

class Furniture extends Product {
  async createProduct() {
    const newFurniture = await furniture.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newFurniture)
      throw new BadRequestError("Failed to create Furniture product");

    const newProduct = await super.createProduct(newFurniture._id);
    if (!newProduct) throw new BadRequestError("Failed to create product");

    return newProduct;
  }
}

// register product types
ProductFactory.registerProductType("clothing", Clothing);
ProductFactory.registerProductType("electronics", Electronic);
ProductFactory.registerProductType("furniture", Furniture);

module.exports = ProductFactory;
