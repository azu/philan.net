import { createUserKvs } from "../api-utils/userKvs";
import * as fs from "fs/promises";
import path from "path";

const TARGET_USERS_DIR = path.join(__dirname, ".target");

async function prepareMain() {
    await fs.mkdir(TARGET_USERS_DIR, {
        recursive: true
    });
    // Create .target/users.json
    const userKVS = await createUserKvs();
    for await (const { userId, user } of userKVS.allUsers()) {
        const savedFilePath = path.join(TARGET_USERS_DIR, userId + ".json");
        console.log(`Save: ${savedFilePath}`);
        await fs.writeFile(savedFilePath, JSON.stringify(user));
    }
}

prepareMain().catch((error) => {
    console.error(error);
    process.exit(1);
});
