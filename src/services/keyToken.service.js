"use strict";

const keytokenModel = require("../models/keytoken.model");
const mongoose = require("mongoose");
class KeyTokenService {
  static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
    try {
      //lv 0
      // const tokens = await keytokenModel.create({
      //     user: userId,
      //     publicKey,
      //     privateKey
      // });

      // return tokens ? tokens.publicKey : null;

      //lv xxx
      const filter = { user: userId },
        update = { publicKey, privateKey, refreshTokenUsed: [], refreshToken },
        options = { upsert: true, new: true };
      const tokens = await keytokenModel.findOneAndUpdate(
        filter,
        update,
        options
      );

    return tokens ? tokens.publicKey : null;

    } catch (error) {
      return error;
    }
  };

  static findByUserId = async (userId) => {
      return  await keytokenModel.findOne({ user: userId });
  };

  static removeKeyById = async (keyId) => {
    return await keytokenModel.findOneAndDelete({ _id: new mongoose.Types.ObjectId(keyId) });
  };

  static findByRefreshTokenUsed = async(refreshToken) => {
    return await keytokenModel.findOne({ refreshTokensUsed: refreshToken }).lean();
  }

  static deleteKeyById = async (userId) => {
    return await keytokenModel.findOneAndDelete({ user: userId});
  }

   static findByRefreshToken = async(refreshToken) => {
    return await keytokenModel.findOne({ refreshToken });
  }
}

module.exports = KeyTokenService;
