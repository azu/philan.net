// @ts-nocheck
// eslint-disable
// This file is generated by create-validator-ts
import Ajv from 'ajv';
import * as apiTypes from './api-types';

export const SCHEMA = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
        "GetBudgetResponse": {
            "type": "array",
            "items": {
                "$ref": "#/definitions/BudgetItem"
            }
        },
        "BudgetItem": {
            "type": "object",
            "properties": {
                "year": {
                    "type": "number"
                },
                "budget": {
                    "type": "object",
                    "properties": {
                        "raw": {
                            "type": "number"
                        },
                        "value": {
                            "type": "string"
                        }
                    },
                    "required": [
                        "raw",
                        "value"
                    ],
                    "additionalProperties": false
                },
                "used": {
                    "type": "object",
                    "properties": {
                        "raw": {
                            "type": "number"
                        },
                        "value": {
                            "type": "string"
                        }
                    },
                    "required": [
                        "raw",
                        "value"
                    ],
                    "additionalProperties": false
                },
                "balance": {
                    "type": "object",
                    "properties": {
                        "raw": {
                            "type": "number"
                        },
                        "value": {
                            "type": "string"
                        }
                    },
                    "required": [
                        "raw",
                        "value"
                    ],
                    "additionalProperties": false
                }
            },
            "required": [
                "year",
                "budget",
                "used",
                "balance"
            ],
            "additionalProperties": false
        },
        "AddBudgetRequest": {
            "type": "object",
            "properties": {
                "year": {
                    "type": "number"
                },
                "budget": {
                    "type": "number"
                }
            },
            "required": [
                "year",
                "budget"
            ],
            "additionalProperties": false
        },
        "AddBudgetResponse": {
            "type": "object",
            "properties": {
                "ok": {
                    "type": "boolean",
                    "const": true
                }
            },
            "required": [
                "ok"
            ],
            "additionalProperties": false
        }
    }
};
const ajv = new Ajv({ removeAdditional: true }).addSchema(SCHEMA, "SCHEMA");
export function validateGetBudgetResponse(payload: unknown): apiTypes.GetBudgetResponse {
  /** Schema is defined in {@link SCHEMA.definitions.GetBudgetResponse } **/
  const validator = ajv.getSchema("SCHEMA#/definitions/GetBudgetResponse");
  const valid = validator(payload);
  if (!valid) {
    const error = new Error('Invalid GetBudgetResponse: ' + ajv.errorsText(validator.errors, {dataVar: "GetBudgetResponse"}));
    error.name = "ValidationError";
    throw error;
  }
  return payload;
}

export function isGetBudgetResponse(payload: unknown): payload is apiTypes.GetBudgetResponse {
  try {
    validateGetBudgetResponse(payload);
    return true;
  } catch (error) {
    return false;
  }
}

export function validateBudgetItem(payload: unknown): apiTypes.BudgetItem {
  /** Schema is defined in {@link SCHEMA.definitions.BudgetItem } **/
  const validator = ajv.getSchema("SCHEMA#/definitions/BudgetItem");
  const valid = validator(payload);
  if (!valid) {
    const error = new Error('Invalid BudgetItem: ' + ajv.errorsText(validator.errors, {dataVar: "BudgetItem"}));
    error.name = "ValidationError";
    throw error;
  }
  return payload;
}

export function isBudgetItem(payload: unknown): payload is apiTypes.BudgetItem {
  try {
    validateBudgetItem(payload);
    return true;
  } catch (error) {
    return false;
  }
}

export function validateAddBudgetRequest(payload: unknown): apiTypes.AddBudgetRequest {
  /** Schema is defined in {@link SCHEMA.definitions.AddBudgetRequest } **/
  const validator = ajv.getSchema("SCHEMA#/definitions/AddBudgetRequest");
  const valid = validator(payload);
  if (!valid) {
    const error = new Error('Invalid AddBudgetRequest: ' + ajv.errorsText(validator.errors, {dataVar: "AddBudgetRequest"}));
    error.name = "ValidationError";
    throw error;
  }
  return payload;
}

export function isAddBudgetRequest(payload: unknown): payload is apiTypes.AddBudgetRequest {
  try {
    validateAddBudgetRequest(payload);
    return true;
  } catch (error) {
    return false;
  }
}

export function validateAddBudgetResponse(payload: unknown): apiTypes.AddBudgetResponse {
  /** Schema is defined in {@link SCHEMA.definitions.AddBudgetResponse } **/
  const validator = ajv.getSchema("SCHEMA#/definitions/AddBudgetResponse");
  const valid = validator(payload);
  if (!valid) {
    const error = new Error('Invalid AddBudgetResponse: ' + ajv.errorsText(validator.errors, {dataVar: "AddBudgetResponse"}));
    error.name = "ValidationError";
    throw error;
  }
  return payload;
}

export function isAddBudgetResponse(payload: unknown): payload is apiTypes.AddBudgetResponse {
  try {
    validateAddBudgetResponse(payload);
    return true;
  } catch (error) {
    return false;
  }
}
