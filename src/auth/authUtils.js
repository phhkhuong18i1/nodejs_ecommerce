"use strict";

const JWT = require("jsonwebtoken");
const asyncHandler = require("../helpers/asyncHandler");
const { findByUserId } = require("../services/keyToken.service");
const { AuthFailureError, NotFoundError } = require("../core/error.response");

const HEADER = {
  API_KEY: "x-api-key",
  CLIENTP_ID: "x-client-id",
  AUTHORIZATION: "authorization",
  REFRESH_TOKEN: "x-rtoken",
};

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: "2 days",
    });

    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: "7 days",
    });

    //

    JWT.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.log("error verify::", err);
      } else {
        console.log("decode verify::", decode);
      }
    });

    return { accessToken, refreshToken };
  } catch (error) {}
};

const authentication = asyncHandler(async (req, res, next) => {
  /*  
        1. check userId missing
        2. get access token
        3. verifyToken
        4. check user in Db
        5. check keyStore with this user 
        6. ok all -> return next()
    */

  const userId = req.headers[HEADER.CLIENTP_ID]?.toString();
  if (!userId) throw new AuthFailureError("User ID is missing");

  //2
  const keyStore = await findByUserId(userId);
  if (!keyStore) throw new NotFoundError("Not found keystore");

  //3
  const accessToken = req.headers[HEADER.AUTHORIZATION]?.toString();
  if (!accessToken) throw new AuthFailureError("Access token is missing");

  //4
  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
    if (userId !== decodeUser.userId) {
      throw new AuthFailureError("Invalid user ID in access token");
    }

    req.keyStore = keyStore; // attach keyStore to request
    req.user = decodeUser; // attach user info to request
    return next(); // proceed to next middleware
  } catch (error) {
    throw new AuthFailureError("Invalid access token");
  }
});

const authenticationV2 = asyncHandler(async (req, res, next) => {
  /*  
        1. check userId missing
        2. get access token
        3. verifyToken
        4. check user in Db
        5. check keyStore with this user 
        6. ok all -> return next()
    */

  const userId = req.headers[HEADER.CLIENTP_ID]?.toString();
  if (!userId) throw new AuthFailureError("User ID is missing");

  //2
  const keyStore = await findByUserId(userId);
  if (!keyStore) throw new NotFoundError("Not found keystore");

  if (req.headers[HEADER.REFRESH_TOKEN]) {
    const refreshToken = req.headers[HEADER.REFRESH_TOKEN]?.toString();
    if (!refreshToken) throw new AuthFailureError("Refresh token is missing");

    // verify refresh token
    try {
      const decodeUser = JWT.verify(refreshToken, keyStore.privateKey);
      if (userId !== decodeUser.userId) {
        throw new AuthFailureError("Invalid user ID in refresh token");
      }

      req.keyStore = keyStore; // attach keyStore to request
      req.user = decodeUser; // attach user info to request
      req.refreshToken = refreshToken; // attach refresh token to request
      return next(); // proceed to next middleware
    } catch (error) {
      throw new AuthFailureError("Invalid refresh token");
    }
  }
  //3
  const accessToken = req.headers[HEADER.AUTHORIZATION]?.toString();
  if (!accessToken) throw new AuthFailureError("Access token is missing");

  //4
  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
    if (userId !== decodeUser.userId) {
      throw new AuthFailureError("Invalid user ID in access token");
    }
    req.keyStore = keyStore; // attach keyStore to request
    req.user = decodeUser; // attach user info to request
    return next(); // proceed to next middleware
  } catch (error) {
    throw new AuthFailureError("Invalid access token");
  }
});

const verifyJWT = async (token, keySecret) => {
  return await JWT.verify(token, keySecret);
};

module.exports = {
  createTokenPair,
  authentication,
  verifyJWT,
  authenticationV2
};
