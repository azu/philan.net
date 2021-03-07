import { User } from "../domain/User";
import { createKVS } from "./kvs";

export const createUserKvs = async () => {
    const kvs = await createKVS<User>();
    return {
        findByGoogleId(googleID?: string) {
            if (!googleID) {
                return;
            }
            return kvs.get(`google:1:${googleID}`);
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
        async someUserNames(): Promise<string[]> {
            const res = await kvs.list({ prefix: "users:1:", limit: 100 });
            return res.keys.map(({ name }) => {
                return name.replace("users:1:", "");
            });
        }
    };
};
