"use strict";

const _ = require("lodash");
const {Types} = require("mongoose");

const convertToObjectId = (id) => {
  if (typeof id === "string") {
    return new Types.ObjectId(id);
  } else if (id instanceof Types.ObjectId) {
    return id;
  } else {
    throw new Error("Invalid ID format");
  }
};
const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields);
};

const getSelectData = (select = []) => {
  return Object.fromEntries(
    select.map((item) => [item, 1])
  );
};

const unGetSelectData = (select = []) => {
  return Object.fromEntries(
    select.map((item) => [item, 0])
  );
};

const removeUndefinedObject = (obj) => {
    Object.keys(obj).forEach(key => {
        if (obj[key] && typeof obj[key] === 'object') removeUndefinedObject(obj[key]);
        else if (obj[key] == null) delete obj[key];
    });
    return obj;
}

const updateNestedObjectParser = object => {
  const final = {};
  Object.keys(object).forEach(key => {
    if (typeof object[key] === 'object' && !Array.isArray(object[key])) {
      Object.keys(object[key]).forEach(subKey => {
        final[`${key}.${subKey}`] = object[key][subKey];
      });
    } else {
      final[key] = object[key];
    }
  }
  );
  return final;
}

module.exports = {
  getInfoData,
  getSelectData,
  unGetSelectData,
  removeUndefinedObject,
  updateNestedObjectParser,
  convertToObjectId
};
