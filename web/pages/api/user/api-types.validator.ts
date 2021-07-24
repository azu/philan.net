// @ts-nocheck
// eslint-disable
// This file is generated by create-validator-ts
import Ajv from 'ajv';
import * as apiTypes from './api-types';

const SCHEMA = {
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
                },
                "appsScriptUrl": {
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
  if (!isCreateUserRequestBody(payload)) {
    const error = new Error('invalid payload: CreateUserRequestBody');
    error.name = "ValidationError";
    throw error;
  }
  return payload;
}

export function isCreateUserRequestBody(payload: unknown): payload is apiTypes.CreateUserRequestBody {
  /** Schema is defined in {@link SCHEMA.definitions.CreateUserRequestBody } **/
  const ajvValidate = ajv.compile({ "$ref": "SCHEMA#/definitions/CreateUserRequestBody" });
  return ajvValidate(payload);
}

export function validateCreateUserResponseBody(payload: unknown): apiTypes.CreateUserResponseBody {
  if (!isCreateUserResponseBody(payload)) {
    const error = new Error('invalid payload: CreateUserResponseBody');
    error.name = "ValidationError";
    throw error;
  }
  return payload;
}

export function isCreateUserResponseBody(payload: unknown): payload is apiTypes.CreateUserResponseBody {
  /** Schema is defined in {@link SCHEMA.definitions.CreateUserResponseBody } **/
  const ajvValidate = ajv.compile({ "$ref": "SCHEMA#/definitions/CreateUserResponseBody" });
  return ajvValidate(payload);
}

export function validateUpdateUserRequestBody(payload: unknown): apiTypes.UpdateUserRequestBody {
  if (!isUpdateUserRequestBody(payload)) {
    const error = new Error('invalid payload: UpdateUserRequestBody');
    error.name = "ValidationError";
    throw error;
  }
  return payload;
}

export function isUpdateUserRequestBody(payload: unknown): payload is apiTypes.UpdateUserRequestBody {
  /** Schema is defined in {@link SCHEMA.definitions.UpdateUserRequestBody } **/
  const ajvValidate = ajv.compile({ "$ref": "SCHEMA#/definitions/UpdateUserRequestBody" });
  return ajvValidate(payload);
}

export function validateUserResponseObject(payload: unknown): apiTypes.UserResponseObject {
  if (!isUserResponseObject(payload)) {
    const error = new Error('invalid payload: UserResponseObject');
    error.name = "ValidationError";
    throw error;
  }
  return payload;
}

export function isUserResponseObject(payload: unknown): payload is apiTypes.UserResponseObject {
  /** Schema is defined in {@link SCHEMA.definitions.UserResponseObject } **/
  const ajvValidate = ajv.compile({ "$ref": "SCHEMA#/definitions/UserResponseObject" });
  return ajvValidate(payload);
}

export function validateGetUserResponseBody(payload: unknown): apiTypes.GetUserResponseBody {
  if (!isGetUserResponseBody(payload)) {
    const error = new Error('invalid payload: GetUserResponseBody');
    error.name = "ValidationError";
    throw error;
  }
  return payload;
}

export function isGetUserResponseBody(payload: unknown): payload is apiTypes.GetUserResponseBody {
  /** Schema is defined in {@link SCHEMA.definitions.GetUserResponseBody } **/
  const ajvValidate = ajv.compile({ "$ref": "SCHEMA#/definitions/GetUserResponseBody" });
  return ajvValidate(payload);
}
