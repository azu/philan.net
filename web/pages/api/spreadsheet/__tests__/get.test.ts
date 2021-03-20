import { getTestCredential, hasTestCredential, TEST_SPREADSHEET_ID } from "../../../../test/GoogleCredential";
import { getSpreadSheet } from "../get";

const describe = hasTestCredential() ? global.describe : global.describe.skip;
describe("get", () => {
    it("snapshot testing", async () => {
        const result = await getSpreadSheet({
            spreadsheetId: TEST_SPREADSHEET_ID,
            credentials: getTestCredential(),
            defaultCurrency: "JPY"
        });
        expect(result).toMatchSnapshot();
    });
});
