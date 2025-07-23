'use strict';

const express = require('express');
const ProductController  = require('../../controllers/product.controller');
const asyncHandler = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils');
const router = express.Router();

router.get('/search', asyncHandler(ProductController.searchProduct));
//get all products
router.get('', asyncHandler(ProductController.findAllProducts));
//get product by id
router.get('/:productId', asyncHandler(ProductController.findProduct));
//authentication

router.use(authenticationV2);

router.post('', asyncHandler(ProductController.createProduct));
router.post('/publish/:id', asyncHandler(ProductController.publishProductByShop));
router.post('unpublish/:id', asyncHandler(ProductController.unPublishProductByShop));

//update product by id
router.patch('/:productId', asyncHandler(ProductController.updateProduct));
//query
router.get('/drafts/all', asyncHandler(ProductController.getAllDraftsForShop));
router.get('/published/all', asyncHandler(ProductController.getAllPublishForShop));
module.exports = router;