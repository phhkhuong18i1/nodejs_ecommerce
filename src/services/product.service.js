"use strict";

const { BadRequestError } = require("../core/error.response");
const { product, clothing, electronic } = require("../models/product.model");

//define Factory class to create product

class ProductFactory {
  static createProduct = async (type,productData) => {
 let productInstance;
    switch (type) {
      case "clothing":
        productInstance = new Clothing(productData);
        break;
      case "electronics":
        productInstance = new Electronic(productData);
        break
      default:
        throw new BadRequestError("Invalid product type");
    }

    return await productInstance.createProduct();
  };

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
    return await product.create({...this, _id: product_id });
  }
}

//define sub-class for clothing products
class Clothing extends Product {
  async createProduct() {
    const newClothing = await clothing.create(this.product_attributes);
    if (!newClothing)
      throw new BadRequestError("Failed to create clothing product");

    const newProduct = await super.createProduct();
    if (!newProduct) throw new BadRequestError("Failed to create product");

    return newProduct;
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
}

module.exports = ProductFactory;
