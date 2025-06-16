'use strict'

const shopModel = require("../models/shop.model")

const findByEmail = async ({email, seclect = {
    email: 1,
    password: 2,
    name: 1,
    status: 1, roles: 1
}}) => {
    return await shopModel.findOne({email}).select(seclect).lean()
}

module.exports = {
    findByEmail
}