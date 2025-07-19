"use strict";

const { Created, SuccessResponse } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {

  handleRefreshToken = async (req, res, next) => {
    // SuccessResponse.create(
    //   "Refresh token success!",
    //   200,
    //   await AccessService.handleRefreshToken(req.body.refreshToken)
    // ).send(res);

    //v2 fixed
    SuccessResponse.create(
      "Refresh token success!",
      200,
      await AccessService.handleRefreshTokenV2({
        refreshToken: req.refreshToken,
        user: req.user,
        keyStore: req.keyStore,
      })
    ).send(res);
  };

   logout = async (req, res, next) => {
    SuccessResponse.create(
      "Logout success!",
      200,
      await AccessService.logout(req.keyStore)
    ).send(res);
  };

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
