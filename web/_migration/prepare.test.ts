import path from "path";
import del from "del";
import * as fs from "fs/promises";
import { getTestCredential, TEST_SPREADSHEET_ID } from "../test/GoogleCredential";
import { User } from "../domain/User";

const TARGET_USERS_DIR = path.join(__dirname, ".target");

// prepare migration data for test env
// https://docs.google.com/spreadsheets/d/1gmVOU7Zi_g6fV7aWPUnZhgKLd5EdltxeWbwlufM3Plc/edit
async function prepareTest() {
    await del([TARGET_USERS_DIR]);
    await fs.mkdir(TARGET_USERS_DIR, {
        recursive: true
    });
    // Create dummy
    const user: User = {
        credentials: getTestCredential(),
        spreadsheetId: TEST_SPREADSHEET_ID,
        defaultCurrency: "JPY",
        name: "test",
        id: "test",
        avatarUrl: "https://example.com/test.png"
    };
    await fs.writeFile(path.join(TARGET_USERS_DIR, "test.json"), JSON.stringify(user));
}

prepareTest().catch((error) => {
    console.error(error);
    process.exit(1);
});
