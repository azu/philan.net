// @ts-nocheck
// eslint-disable
// This file is generated by create-validator-ts
import Ajv from 'ajv';
import * as apiTypes from './api-types';

const SCHEMA = {
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
  if (!isGetBudgetResponse(payload)) {
    const error = new Error('invalid payload: GetBudgetResponse');
    error.name = "ValidationError";
    throw error;
  }
  return payload;
}

export function isGetBudgetResponse(payload: unknown): payload is apiTypes.GetBudgetResponse {
  /** Schema is defined in {@link SCHEMA.definitions.GetBudgetResponse } **/
  const ajvValidate = ajv.compile({ "$ref": "SCHEMA#/definitions/GetBudgetResponse" });
  return ajvValidate(payload);
}

export function validateBudgetItem(payload: unknown): apiTypes.BudgetItem {
  if (!isBudgetItem(payload)) {
    const error = new Error('invalid payload: BudgetItem');
    error.name = "ValidationError";
    throw error;
  }
  return payload;
}

export function isBudgetItem(payload: unknown): payload is apiTypes.BudgetItem {
  /** Schema is defined in {@link SCHEMA.definitions.BudgetItem } **/
  const ajvValidate = ajv.compile({ "$ref": "SCHEMA#/definitions/BudgetItem" });
  return ajvValidate(payload);
}

export function validateAddBudgetRequest(payload: unknown): apiTypes.AddBudgetRequest {
  if (!isAddBudgetRequest(payload)) {
    const error = new Error('invalid payload: AddBudgetRequest');
    error.name = "ValidationError";
    throw error;
  }
  return payload;
}

export function isAddBudgetRequest(payload: unknown): payload is apiTypes.AddBudgetRequest {
  /** Schema is defined in {@link SCHEMA.definitions.AddBudgetRequest } **/
  const ajvValidate = ajv.compile({ "$ref": "SCHEMA#/definitions/AddBudgetRequest" });
  return ajvValidate(payload);
}

export function validateAddBudgetResponse(payload: unknown): apiTypes.AddBudgetResponse {
  if (!isAddBudgetResponse(payload)) {
    const error = new Error('invalid payload: AddBudgetResponse');
    error.name = "ValidationError";
    throw error;
  }
  return payload;
}

export function isAddBudgetResponse(payload: unknown): payload is apiTypes.AddBudgetResponse {
  /** Schema is defined in {@link SCHEMA.definitions.AddBudgetResponse } **/
  const ajvValidate = ajv.compile({ "$ref": "SCHEMA#/definitions/AddBudgetResponse" });
  return ajvValidate(payload);
}