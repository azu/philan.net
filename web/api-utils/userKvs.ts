import { User } from "../domain/User";
import { createKVS } from "./kvs";

// google: need to update user
// users: read only use-case
export type WritableUserWithGoogleId = User & {
    googleId: string;
};
export const createUserKvs = async () => {
    const kvs = await createKVS<User>();
    return {
        async findByGoogleId(googleId?: string): Promise<WritableUserWithGoogleId | undefined> {
            if (!googleId) {
                return;
            }
            const user = await kvs.get(`google:1:${googleId}`);
            if (!user) {
                return user;
            }
            return {
                ...user,
                googleId
            };
        },
        findByUserId(userId: string) {
            return kvs.get(`users:1:${userId}`);
        },
        async updateUser(googleID: string, user: User) {
            // double write for id and userId
            await kvs.set(`google:1:${googleID}`, user);
            await kvs.set(`users:1:${user.id}`, user);
        },
        async exists(id: string) {
            return (await kvs.get(id)) !== undefined;
        },
        async *allUsers() {
            let cursor: undefined | string = undefined;
            while (true) {
                const result: any = await kvs.list({
                    cursor,
                    limit: 1000,
                    prefix: "users:1:"
                });
                for (const key of result.keys) {
                    const user = await kvs.get(key.name);
                    if (!user) {
                        continue;
                    }
                    yield {
                        userId: key.name,
                        user: user
                    };
                }
                if (result.list_complete) {
                    return;
                } else {
                    cursor = result.cursor;
                }
            }
        },
        async someUserNames(): Promise<string[]> {
            const res = await kvs.list({ prefix: "users:1:", limit: 100 });
            return res.keys.map(({ name }) => {
                return name.replace("users:1:", "");
            });
        }
    };
};
