import { createUserKvs } from "../../../api-utils/userKvs";

export const getUserList = () => {
    const userKVS = createUserKvs();
    return userKVS.someUserNames();
};
