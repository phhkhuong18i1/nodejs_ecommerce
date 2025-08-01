"use strict";

const express = require("express");
const CheckoutController = require("../../controllers/checkout.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const { authenticationV2 } = require("../../auth/authUtils");
const router = express.Router();

//get amount a discount

router.post("/review", asyncHandler(CheckoutController.checkoutReview));

module.exports = router;
