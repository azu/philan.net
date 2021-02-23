import { User } from "../domain/User";
import { createKVS } from "./kvs";

export const createUserKvs = () => {
    const kvs = createKVS<User>();
    return {
        findByGoogleId(id: string) {
            return kvs.get(id);
        },
        findByUserId(userId: string) {
            return kvs.get(`users:1:${userId}`);
        },
        async updateUser(id: string, user: User) {
            // double write for id and userId
            await kvs.set(id, user);
            await kvs.set(`users:1:${user.id}`, user);
        },
        async exists(id: string) {
            return (await kvs.get(id)) !== undefined;
        }
    };
};
