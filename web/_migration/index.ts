import * as fs from "fs/promises";
import path from "path";
import { migrateToRecordsSheet } from "./2021-03-27/2021-03-27-create-budget-sheets";
import { User } from "../domain/User";

const TARGET_USERS_DIR = path.join(__dirname, ".target");

/**
 * Migration Function
 * @param user
 */
async function migrate(user: User) {
    await migrateToRecordsSheet({
        spreadsheetId: user.spreadsheetId,
        credentials: user.credentials
    });
}

async function migrationMain() {
    const files = await fs.readdir(TARGET_USERS_DIR, {
        withFileTypes: true
    });
    const jsonFilePaths = files
        .filter((file) => {
            return file.isFile() && path.extname(file.name) === ".json";
        })
        .map((file) => {
            return path.join(TARGET_USERS_DIR, file.name);
        });
    console.log("Migration targets count: " + jsonFilePaths.length);
    console.log("Migration targets: ", jsonFilePaths);
    for (const jsonFilePath of jsonFilePaths) {
        const user = JSON.parse(await fs.readFile(jsonFilePath, "utf-8"));
        try {
            await migrate(user);
            // delete file when success migration
            console.log("Migration success: " + user.id);
            await fs.unlink(jsonFilePath);
        } catch (error) {
            console.log("Migration Failed: " + user.id);
            console.error(error);
        }
    }
    console.log("Migration Finished!");
}

migrationMain().catch((error) => {
    console.error(error);
    process.exit(1);
});
