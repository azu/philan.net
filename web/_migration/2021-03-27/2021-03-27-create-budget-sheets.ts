import { google } from "googleapis";
import { UserCredentials } from "../../domain/User";
import { createOAuthClient } from "../../api-utils/create-OAuth";
import { logger } from "../../api-utils/logger";
import { createCopiedSheet } from "../migration-helper";
import { createRow } from "../../api-utils/spreadsheet-util";
import { SheetTitles } from "../../pages/api/spreadsheet/SpreadSheetSchema";

const sheets = google.sheets("v4");
export const migrateToRecordsSheet = async (meta: { spreadsheetId: string; credentials: UserCredentials }) => {
    const client = createOAuthClient(meta.credentials);
    const { token } = await client.getAccessToken();
    if (!token) {
        throw new Error("No Access Token");
    }
    const spreadsheet = await sheets.spreadsheets.get({
        oauth_token: token,
        spreadsheetId: meta.spreadsheetId,
        includeGridData: true
    });
    const oldRecordSheet = spreadsheet.data.sheets?.find((sheet) => {
        return sheet.properties?.title === SheetTitles.OLD_Records;
    });
    if (!oldRecordSheet) {
        throw new Error("Not found oldRecordSheet");
    }
    const oldRecordSheetId = oldRecordSheet?.properties?.sheetId;
    // original this is number
    // after migration this is = formula
    const budget = oldRecordSheet?.data?.[0].rowData?.[1]?.values?.[0]?.userEnteredValue?.numberValue;
    const README = oldRecordSheet?.data?.[0].rowData?.[1]?.values?.[3]?.userEnteredValue?.stringValue ?? "";
    const budgetSheet = spreadsheet?.data.sheets?.find((sheet) => {
        return sheet.properties?.title === SheetTitles.Budgets;
    });
    let budgetSheetId = budgetSheet ? budgetSheet?.properties?.sheetId : undefined;
    logger.info("oldRecordSheetId: " + oldRecordSheetId);
    logger.info("Budget: " + budget);
    const { copiedSheetId, completeOperation, revertOperation } = await createCopiedSheet({
        spreadsheetId: meta.spreadsheetId,
        token,
        originalSheet: oldRecordSheet
    });
    logger.info("Created working copy: " + copiedSheetId);
    try {
        // Create Records
        // Create Budgets → refer Records
        // Update Records → refer to Budgets
        // If failed
        // Remove Budgets
        // Remove Copied sheet
        {
            // rename "2021" to "Records" sheet
            await sheets.spreadsheets.batchUpdate({
                oauth_token: token,
                spreadsheetId: meta.spreadsheetId,
                fields: "*",
                requestBody: {
                    requests: [
                        {
                            updateSheetProperties: {
                                fields: "title", // rename only
                                properties: {
                                    sheetId: copiedSheetId,
                                    title: SheetTitles.Records
                                }
                            }
                        }
                    ]
                }
            });
            logger.info(`rename "2021" to "Records" sheet`);
        }
        // Budgets
        {
            // create
            if (!budgetSheet) {
                const createBudgetsSheetResponse = await sheets.spreadsheets.batchUpdate({
                    oauth_token: token,
                    spreadsheetId: meta.spreadsheetId,
                    fields: "*",
                    requestBody: {
                        includeSpreadsheetInResponse: true, // response includes sheet.id
                        requests: [
                            // create "Budgets" sheet
                            {
                                addSheet: {
                                    properties: {
                                        title: SheetTitles.Budgets,
                                        gridProperties: {
                                            frozenRowCount: 1
                                        }
                                    }
                                }
                            }
                        ]
                    }
                });
                const newBudgetsSheet = createBudgetsSheetResponse?.data?.updatedSpreadsheet?.sheets?.find((sheet) => {
                    return sheet.properties?.title === SheetTitles.Budgets;
                });
                budgetSheetId = newBudgetsSheet ? newBudgetsSheet?.properties?.sheetId : undefined;
                logger.info("Success to create Budgets Sheet: " + budgetSheetId);
            }
            logger.info("Try to update Budgets Sheet: " + budgetSheetId);
            if (budget !== undefined) {
                // add 2021 Formula
                const BudgetData = [
                    ["Year", "Budget", "Used", "Balance"],
                    [
                        "2021",
                        budget,
                        `=SUMIFS('${SheetTitles.Records}'!C:C,'${SheetTitles.Records}'!A:A,INDIRECT(ADDRESS(ROW(),COLUMN() - 2))&"-*")`,
                        "=INDIRECT(ADDRESS(ROW(),COLUMN() - 2))-INDIRECT(ADDRESS(ROW(),COLUMN() - 1))"
                    ]
                ] as (string | number)[][];
                await sheets.spreadsheets.batchUpdate({
                    oauth_token: token,
                    spreadsheetId: meta.spreadsheetId,
                    fields: "*",
                    requestBody: {
                        requests: [
                            // create "Budgets" sheet
                            {
                                updateCells: {
                                    fields: "*",
                                    range: {
                                        sheetId: budgetSheetId,
                                        startRowIndex: 0,
                                        endRowIndex: 2
                                    },
                                    rows: createRow(BudgetData)
                                }
                            }
                        ]
                    }
                });
            } else {
                logger.info("Budget value is already migration. stop to update Budget sheet");
            }
        }
        // Records
        {
            // Update Formula to refer Budgets
            const RecordData = [
                [
                    `="Budget("&YEAR(TODAY())&")"`,
                    `="Used("&YEAR(TODAY())&")"`,
                    `="Balance("&YEAR(TODAY())&")"`,
                    "README"
                ],
                [
                    `=IFERROR(Index(QUERY(${SheetTitles.Budgets}!A:B, "select * where A = '"&YEAR(TODAY())&"'", 0),1,2), 0)`,
                    `=SUMIFS(C:C,A:A, YEAR(TODAY())&"-*")`,
                    "=A2-B2",
                    README
                ]
            ] as (string | number)[][];
            await sheets.spreadsheets.batchUpdate({
                oauth_token: token,
                spreadsheetId: meta.spreadsheetId,
                fields: "*",
                requestBody: {
                    requests: [
                        {
                            updateCells: {
                                fields: "*",
                                range: {
                                    sheetId: copiedSheetId,
                                    startRowIndex: 0,
                                    endRowIndex: 2,
                                    startColumnIndex: 0,
                                    endColumnIndex: 4
                                },
                                rows: createRow(RecordData)
                            }
                        }
                    ]
                }
            });
            logger.info(`Update Records sheet with new definition`);
        }
        // Complete!
        await completeOperation(SheetTitles.Records);
    } catch (error) {
        logger.error(error);
        // delete copy and budget
        // → stay original sheet
        await revertOperation();
        if (budgetSheetId) {
            await sheets.spreadsheets.batchUpdate({
                oauth_token: token,
                spreadsheetId: meta.spreadsheetId,
                fields: "*",
                requestBody: {
                    requests: [
                        {
                            deleteSheet: {
                                sheetId: budgetSheetId
                            }
                        }
                    ]
                }
            });
        }
        throw error;
    }
};
