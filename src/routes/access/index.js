'use strict';

const express = require('express');
const accessController = require('../../controllers/access.controller');
const router = express.Router();

//signUp
router.post('/shop/signup', accessController.signUp);

module.exports = router;