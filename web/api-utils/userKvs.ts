import { User } from "../domain/User";
import { createKVS } from "./kvs";

export const createUserKvs = () => {
    const kvs = createKVS<User>();
    return {
        findByGoogleId(id?: string) {
            if (!id) {
                return;
            }
            return kvs.get(`google:1:${id}`);
        },
        findByUserId(userId: string) {
            return kvs.get(`users:1:${userId}`);
        },
        async updateUser(id: string, user: User) {
            // double write for id and userId
            await kvs.set(`google:1:${id}`, user);
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
