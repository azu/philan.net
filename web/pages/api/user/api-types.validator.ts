// @ts-nocheck
// eslint-disable
// This file is generated by create-validator-ts
import Ajv from 'ajv';
import * as apiTypes from './api-types';

export const SCHEMA = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
        "CreateUserRequestBody": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string"
                },
                "name": {
                    "type": "string"
                },
                "README": {
                    "type": "string"
                },
                "budget": {
                    "type": "number"
                },
                "defaultCurrency": {
                    "type": "string"
                }
            },
            "required": [
                "id",
                "name",
                "README",
                "budget",
                "defaultCurrency"
            ],
            "additionalProperties": false
        },
        "CreateUserResponseBody": {
            "type": "object",
            "properties": {
                "ok": {
                    "type": "boolean",
                    "const": true
                },
                "id": {
                    "type": "string"
                }
            },
            "required": [
                "ok",
                "id"
            ],
            "additionalProperties": false
        },
        "UpdateUserRequestBody": {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string"
                },
                "budget": {
                    "type": "number"
                },
                "defaultCurrency": {
                    "type": "string"
                },
                "spreadsheetId": {
                    "type": "string"
                }
            },
            "required": [
                "name",
                "budget",
                "defaultCurrency",
                "spreadsheetId"
            ],
            "additionalProperties": false
        },
        "UserResponseObject": {
            "type": "object",
            "properties": {
                "isLogin": {
                    "type": "boolean",
                    "const": true
                },
                "id": {
                    "type": "string"
                },
                "name": {
                    "type": "string"
                },
                "defaultCurrency": {
                    "type": "string"
                },
                "avatarUrl": {
                    "type": "string"
                },
                "spreadsheetUrl": {
                    "type": "string"
                }
            },
            "required": [
                "isLogin",
                "id",
                "name",
                "defaultCurrency",
                "spreadsheetUrl"
            ],
            "additionalProperties": false
        },
        "GetUserResponseBody": {
            "anyOf": [
                {
                    "$ref": "#/definitions/UserResponseObject"
                },
                {
                    "type": "object",
                    "properties": {
                        "isLogin": {
                            "type": "boolean",
                            "const": false
                        }
                    },
                    "required": [
                        "isLogin"
                    ],
                    "additionalProperties": false
                }
            ]
        }
    }
};
const ajv = new Ajv({ removeAdditional: true }).addSchema(SCHEMA, "SCHEMA");
export function validateCreateUserRequestBody(payload: unknown): apiTypes.CreateUserRequestBody {
  /** Schema is defined in {@link SCHEMA.definitions.CreateUserRequestBody } **/
  const validator = ajv.getSchema("SCHEMA#/definitions/CreateUserRequestBody");
  const valid = validator(payload);
  if (!valid) {
    const error = new Error('Invalid CreateUserRequestBody: ' + ajv.errorsText(validator.errors, {dataVar: "CreateUserRequestBody"}));
    error.name = "ValidationError";
    throw error;
  }
  return payload;
}

export function isCreateUserRequestBody(payload: unknown): payload is apiTypes.CreateUserRequestBody {
  try {
    validateCreateUserRequestBody(payload);
    return true;
  } catch (error) {
    return false;
  }
}

export function validateCreateUserResponseBody(payload: unknown): apiTypes.CreateUserResponseBody {
  /** Schema is defined in {@link SCHEMA.definitions.CreateUserResponseBody } **/
  const validator = ajv.getSchema("SCHEMA#/definitions/CreateUserResponseBody");
  const valid = validator(payload);
  if (!valid) {
    const error = new Error('Invalid CreateUserResponseBody: ' + ajv.errorsText(validator.errors, {dataVar: "CreateUserResponseBody"}));
    error.name = "ValidationError";
    throw error;
  }
  return payload;
}

export function isCreateUserResponseBody(payload: unknown): payload is apiTypes.CreateUserResponseBody {
  try {
    validateCreateUserResponseBody(payload);
    return true;
  } catch (error) {
    return false;
  }
}

export function validateUpdateUserRequestBody(payload: unknown): apiTypes.UpdateUserRequestBody {
  /** Schema is defined in {@link SCHEMA.definitions.UpdateUserRequestBody } **/
  const validator = ajv.getSchema("SCHEMA#/definitions/UpdateUserRequestBody");
  const valid = validator(payload);
  if (!valid) {
    const error = new Error('Invalid UpdateUserRequestBody: ' + ajv.errorsText(validator.errors, {dataVar: "UpdateUserRequestBody"}));
    error.name = "ValidationError";
    throw error;
  }
  return payload;
}

export function isUpdateUserRequestBody(payload: unknown): payload is apiTypes.UpdateUserRequestBody {
  try {
    validateUpdateUserRequestBody(payload);
    return true;
  } catch (error) {
    return false;
  }
}

export function validateUserResponseObject(payload: unknown): apiTypes.UserResponseObject {
  /** Schema is defined in {@link SCHEMA.definitions.UserResponseObject } **/
  const validator = ajv.getSchema("SCHEMA#/definitions/UserResponseObject");
  const valid = validator(payload);
  if (!valid) {
    const error = new Error('Invalid UserResponseObject: ' + ajv.errorsText(validator.errors, {dataVar: "UserResponseObject"}));
    error.name = "ValidationError";
    throw error;
  }
  return payload;
}

export function isUserResponseObject(payload: unknown): payload is apiTypes.UserResponseObject {
  try {
    validateUserResponseObject(payload);
    return true;
  } catch (error) {
    return false;
  }
}

export function validateGetUserResponseBody(payload: unknown): apiTypes.GetUserResponseBody {
  /** Schema is defined in {@link SCHEMA.definitions.GetUserResponseBody } **/
  const validator = ajv.getSchema("SCHEMA#/definitions/GetUserResponseBody");
  const valid = validator(payload);
  if (!valid) {
    const error = new Error('Invalid GetUserResponseBody: ' + ajv.errorsText(validator.errors, {dataVar: "GetUserResponseBody"}));
    error.name = "ValidationError";
    throw error;
  }
  return payload;
}

export function isGetUserResponseBody(payload: unknown): payload is apiTypes.GetUserResponseBody {
  try {
    validateGetUserResponseBody(payload);
    return true;
  } catch (error) {
    return false;
  }
}
