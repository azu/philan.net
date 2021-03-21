import { getTestCredential, hasTestCredential, TEST_SPREADSHEET_ID } from "../../../../test/GoogleCredential";
import { migrateToRecordsSheet } from "../migration/2021-03-21-create-budget-sheets";

const describe = hasTestCredential() ? global.describe : global.describe.skip;
describe("migrate", () => {
    it("migrate ", async () => {
        jest.setTimeout(60 * 1000);
        const result = await migrateToRecordsSheet({
            spreadsheetId: TEST_SPREADSHEET_ID,
            credentials: getTestCredential(),
            dryRun: false
        });
        console.log(result);
    });
});
