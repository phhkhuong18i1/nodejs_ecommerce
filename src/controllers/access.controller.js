"use strict";

const { Created, SuccessResponse } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {
  login = async (req, res, next) => {
    SuccessResponse.create(
      "Login success!",
      200,
      await AccessService.login(req.body)
    ).send(res);
  };
  
  signUp = async (req, res, next) => {
    Created.create("Register OK!", await AccessService.signUp(req.body)).send(
      res
    );
  };
}

module.exports = new AccessController();
