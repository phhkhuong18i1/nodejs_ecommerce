"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const { BadRequestError, AuthFailureError } = require("../core/error.response");
const { findByEmail } = require("./shop.service");

const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  static handleRefreshToken = async (refreshToken) => {
    //check xem token này đã được sử dụng chưa
    const foundToken = await KeyTokenService.findByRefreshTokenUsed(
      refreshToken
    );
    //nếu có
    if (foundToken) {
      //check xem là ai
      const { userId, email } = await verifyJWT(
        refreshToken,
        foundToken.privateKey
      );
      console.log("Found user::", userId, email);
      //xoa  tất cả token trong keyStore
      await KeyTokenService.deleteKeyById(userId);
      throw new BadRequestError("Refresh token used, please login again!");
    }

    //No, quá ngon

    const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);
    if (!holderToken) throw new AuthFailureError("Refresh token not found");

    //verify token
    const { userId, email } = await verifyJWT(
      refreshToken,
      holderToken.privateKey
    );
    console.log("Found user::", userId, email);

    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new NotFoundError("Not found shop");

    //create 1 cap moi

    const tokens = await createTokenPair(
      { userId, email },
      holderToken.publicKey,
      holderToken.privateKey
    );

    //update token
    await holderToken.updateOne({
      refreshTokensUsed: Array.isArray(holderToken.refreshTokenUsed)
        ? [...holderToken.refreshTokenUsed, refreshToken]
        : [refreshToken],
      refreshToken: tokens.refreshToken,
    });

    return {
      shop: getInfoData({
        fields: ["_id", "name", "email"],
        object: foundShop,
      }),
      tokens,
    };
  };

  static handleRefreshTokenV2 = async ({ refreshToken, user, keyStore }) => {
    const { userId, email } = user;

    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      await KeyTokenService.deleteKeyById(userId);
      throw new BadRequestError("Refresh token used, please login again!");
    }

    if (keyStore.refreshToken !== refreshToken) {
      throw new AuthFailureError("Refresh token not found");
    }

    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new NotFoundError("Not found shop");

    //create 1 cap moi

    const tokens = await createTokenPair(
      { userId, email },
      keyStore.publicKey,
      keyStore.privateKey
    );

    //update token
    await keyStore.updateOne({
      refreshTokensUsed: Array.isArray(keyStore.refreshTokenUsed)
        ? [...keyStore.refreshTokenUsed, refreshToken]
        : [refreshToken],
      refreshToken: tokens.refreshToken,
    });

    return {
      shop: getInfoData({
        fields: ["_id", "name", "email"],
        object: foundShop,
      }),
      tokens,
    };
  };

  static logout = async (keyStore) => {
    const delKey = await KeyTokenService.removeKeyById(keyStore._id);
    console.log("Delete keyStore::", delKey);
    return delKey;
  };

  static login = async ({ email, password, refreshToken = null }) => {
    //check email in db
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new BadRequestError("Shop not registered!");

    //check password
    const match = bcrypt.compare(password, foundShop.password);
    if (!match) throw new AuthFailureError("Authentication error");

    //created token

    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");

    const tokens = await createTokenPair(
      { userId: foundShop._id, email },
      publicKey,
      privateKey
    );

    await KeyTokenService.createKeyToken({
      userId: foundShop._id,
      publicKey,
      privateKey,
      refreshToken: tokens.refreshToken,
    });

    return {
      shop: getInfoData({
        fields: ["_id", "name", "email"],
        object: foundShop,
      }),
      tokens,
    };
  };
  static signUp = async ({ name, email, password }) => {
    //step1: check email exists?
    const holderShop = await shopModel.findOne({ email }).lean();
    if (holderShop) {
      throw new BadRequestError("Error: Shop already registered!");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      roles: [RoleShop.SHOP],
    });

    if (newShop) {
      // created privateKey, publicKey
      // const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
      //   modulusLength: 4096,
      //   publicKeyEncoding: {
      //     type: 'pkcs1',
      //     format: "pem"
      //   },
      //    privateKeyEncoding: {
      //     type: 'pkcs1',
      //     format: "pem"
      //   },
      // });

      const privateKey = crypto.randomBytes(64).toString("hex");
      const publicKey = crypto.randomBytes(64).toString("hex");
      console.log({ privateKey, publicKey }); //save collection KeyStore

      const keyStore = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
      });

      if (!keyStore) {
        return {
          code: "xxxx",
          message: "keyStore error!",
        };
      }

      //created token pair
      const tokens = await createTokenPair(
        { userId: newShop._id, email },
        publicKey,
        privateKey
      );
      console.log("Created Token success::", tokens);

      return {
        metadata: {
          shop: getInfoData({
            fields: ["_id", "name", "email"],
            object: newShop,
          }),
          tokens,
        },
      };
    }

    return {
      code: 200,
      metadata: null,
    };
  };
}

module.exports = AccessService;
