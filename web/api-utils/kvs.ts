// @ts-ignore
import KvStorage from "cloudflare-kv-storage-rest";
import fetch from "node-fetch";
import FormData from "form-data";
import { env, hasCloudFlareEnv } from "./env";
import { kvsEnvStorage } from "@kvs/env";
import * as fs from "fs";
import path from "path";

export type KVValue<Value> = Promise<Value | null>;
export type KVValueWithMetadata<Value, Metadata> = Promise<{
    value: Value | null;
    metadata: Metadata | null;
}>;

export interface KVNamespace {
    get(key: string): KVValue<string>;

    get(key: string, type: "text"): KVValue<string>;

    get<ExpectedValue = unknown>(key: string, type: "json"): KVValue<ExpectedValue>;

    get(key: string, type: "arrayBuffer"): KVValue<ArrayBuffer>;

    get(key: string, type: "stream"): KVValue<ReadableStream>;

    getWithMetadata<Metadata = unknown>(key: string): KVValueWithMetadata<string, Metadata>;

    getWithMetadata<Metadata = unknown>(key: string, type: "text"): KVValueWithMetadata<string, Metadata>;

    getWithMetadata<ExpectedValue = unknown, Metadata = unknown>(
        key: string,
        type: "json"
    ): KVValueWithMetadata<ExpectedValue, Metadata>;

    getWithMetadata<Metadata = unknown>(key: string, type: "arrayBuffer"): KVValueWithMetadata<ArrayBuffer, Metadata>;

    getWithMetadata<Metadata = unknown>(key: string, type: "stream"): KVValueWithMetadata<ReadableStream, Metadata>;

    put(
        key: string,
        value: string | ReadableStream | ArrayBuffer | FormData,
        options?: {
            expiration?: string | number;
            expirationTtl?: string | number;
            metadata?: any;
        }
    ): Promise<void>;

    delete(key: string): Promise<void>;

    list(options?: {
        prefix?: string;
        limit?: number;
        cursor?: string;
    }): Promise<{
        keys: { name: string; expiration?: number; metadata?: unknown }[];
        list_complete: boolean;
        cursor: string;
    }>;
}

type Storage<V> = {
    /**
     * Returns the value associated to the key.
     * If the key does not exist, returns `undefined`.
     */
    get: (key: string) => Promise<V | undefined>;
    /**
     * Sets the value for the key in the storage. Returns the storage.
     */
    set: (key: string, value: V) => Promise<void>;
    /**
     * Returns a boolean asserting whether a value has been associated to the key in the storage.
     */
    has: (key: string) => Promise<boolean>;
    list: ({
        prefix,
        limit,
        cursor
    }: {
        prefix: string;
        limit: number;
        cursor?: string;
    }) => Promise<{
        keys: { name: string; expiration?: number; metadata?: unknown }[];
        list_complete: boolean;
        cursor: string;
    }>;
};
const createLocalStorage = async <V>(): Promise<Storage<V>> => {
    const cacheDir = path.resolve(process.cwd(), ".cache", "kvs");
    await fs.promises.mkdir(cacheDir, {
        recursive: true
    });
    const storage = await kvsEnvStorage<any>({
        name: "KVS",
        version: 1,
        storeFilePath: cacheDir
    });
    return {
        /**
         * Returns the value associated to the key.
         * If the key does not exist, returns `undefined`.
         */
        get: async (key: string): Promise<V | undefined> => {
            return storage.get(key);
        },
        /**
         * Sets the value for the key in the storage. Returns the storage.
         */
        set: async (key: string, value: V): Promise<void> => {
            await storage.set(String(key), value);
            return;
        },
        /**
         * Returns a boolean asserting whether a value has been associated to the key in the storage.
         */
        has: async (key: string): Promise<boolean> => {
            const value = await storage.get(String(key));
            return value !== null;
        },
        list: async ({
            prefix,
            limit
        }: {
            prefix: string;
            limit: number;
        }): Promise<{
            keys: { name: string; expiration?: number; metadata?: unknown }[];
            list_complete: boolean;
            cursor: string;
        }> => {
            const out: { name: string; expiration?: number; metadata?: unknown }[] = [];
            for await (const [key] of storage) {
                if (key.startsWith(prefix) && out.length < limit)
                    out.push({
                        name: key
                    });
            }
            return {
                keys: out,
                list_complete: true,
                cursor: ""
            };
        }
    };
};
export const createKVS = async <V>(): Promise<Storage<V>> => {
    if (!hasCloudFlareEnv()) {
        return createLocalStorage<V>();
    }
    const kvStorage = new KvStorage({
        namespace: env.CF_namespace_user!,
        accountId: env.CF_accountId!,
        authEmail: env.CF_authEmail,
        authKey: env.CF_authKey!,
        fetch,
        FormData
    }) as KVNamespace;
    return {
        /**
         * Returns the value associated to the key.
         * If the key does not exist, returns `undefined`.
         */
        get: async (key: string): Promise<V | undefined> => {
            const value = await kvStorage.get(String(key));
            return value !== null ? JSON.parse(value) : undefined;
        },
        /**
         * Sets the value for the key in the storage. Returns the storage.
         */
        set: async (key: string, value: V): Promise<void> => {
            return kvStorage.put(String(key), JSON.stringify(value));
        },
        /**
         * Returns a boolean asserting whether a value has been associated to the key in the storage.
         */
        has: async (key: string): Promise<boolean> => {
            const value = await kvStorage.get(String(key));
            return value !== null;
        },
        list: async ({
            prefix,
            limit
        }: {
            prefix: string;
            limit: number;
        }): Promise<{
            keys: { name: string; expiration?: number; metadata?: unknown }[];
            list_complete: boolean;
            cursor: string;
        }> => {
            return kvStorage.list({
                prefix: prefix,
                limit
            });
        }
    };
};
