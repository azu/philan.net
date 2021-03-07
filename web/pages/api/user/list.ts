import { createUserKvs } from "../../../api-utils/userKvs";

export const getUserList = async () => {
    const userKVS = await createUserKvs();
    return userKVS.someUserNames();
};
