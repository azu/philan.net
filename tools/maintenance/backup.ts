// @ts-ignore
import KvStorage from "cloudflare-kv-storage-rest";
import { KVNamespace } from "@philan-net/web/api-utils/kvs";
import { env } from "@philan-net/web/api-utils/env";
import fetch from "node-fetch";

import FormData from "form-data";
import * as path from "path";
import * as fs from "fs/promises";
import dayjs from "dayjs";

async function backup() {
    const kvStorage = new KvStorage({
        namespace: env.CF_namespace_user!,
        accountId: env.CF_accountId!,
        authEmail: env.CF_authEmail,
        authKey: env.CF_authKey!,
        fetch,
        FormData
    }) as KVNamespace;
    const allItems: {
        key: string;
        value: any;
    }[] = [];
    let cursor = undefined;
    while (true) {
        const result: any = await kvStorage.list({
            cursor
        });
        for (const key of result.keys) {
            const item = await kvStorage.get(key.name);
            if (!item) {
                continue;
            }
            allItems.push({
                key,
                value: JSON.parse(item)
            });
        }
        if (result.list_complete) {
            return allItems;
        } else {
            cursor = result.cursor;
        }
    }
}

const BACKUP_DIR = path.join(__dirname, ".backup");

if (require.main === module) {
    (async function () {
        await fs.mkdir(BACKUP_DIR, {
            recursive: true
        });
        const allItems = await backup();
        const backupfile = path.join(BACKUP_DIR, dayjs().format("YYYY-MM-DDTHH:mm:ss") + ".json");
        await fs.writeFile(backupfile, JSON.stringify(allItems), "utf-8");
    })().catch((error) => {
        console.error(error);
        process.exit(1);
    });
}
