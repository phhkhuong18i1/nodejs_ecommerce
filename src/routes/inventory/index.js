"use strict";

const express = require("express");
const InventoryController = require("../../controllers/inventory.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const { authenticationV2 } = require("../../auth/authUtils");
const router = express.Router();

//get amount a discount
router.use(authenticationV2);


module.exports = router;
