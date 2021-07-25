import { sheets_v4 } from "googleapis";

type Schema$RowData = sheets_v4.Schema$RowData;
type Schema$CellData = sheets_v4.Schema$CellData;
export type CreateCellArg = string | number | Schema$CellData;
export const createRow = (rowData: CreateCellArg[][]): Schema$RowData[] => {
    return rowData.map((line) => {
        return {
            values: line.map((cellValue) => {
                return createCell(cellValue);
            })
        };
    });
};
/**
 * @example
 * ```
 * {
 *    rows: BudgetData.map((line) => {
 *      return {
 *          values: line.map((cellValue) => {
 *              return createCell(cellValue);
 *          })
 *      };
 *   });
 * }
 * ```
 *
 * @param cell
 */
export const createCell = (cell: CreateCellArg): Schema$CellData => {
    if (typeof cell === "object") {
        return cell; // Schema$CellData
    }
    if (typeof cell === "number") {
        return {
            userEnteredFormat: {
                numberFormat: {
                    type: "CURRENCY"
                }
            },
            userEnteredValue: {
                numberValue: cell
            }
        };
    }
    if (cell.startsWith("=")) {
        return {
            userEnteredFormat: {
                numberFormat: {
                    type: "CURRENCY"
                }
            },
            userEnteredValue: {
                formulaValue: cell
            }
        };
    }
    // Avoid extra '(apostrophe)
    // https://stackoverflow.com/questions/58173687/google-sheets-api-appending-extra-apostrophe
    return {
        userEnteredValue: {
            stringValue: String(cell)
        }
    };
};
