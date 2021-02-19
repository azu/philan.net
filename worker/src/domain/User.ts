export type User = {
    id: string;
    name: string;
    spreadsheetId?: string;
    google_token: string;
};

declare const USERS: KVNamespace;
export const getUser = async (id: string): Promise<User | undefined> => {
    const user = await USERS.get(id);
    if (!user) {
        return;
    }
    return JSON.parse(user);
};
const setUser = async (user: User) => {
    return USERS.put(
        user.id,
        JSON.stringify({
            id: user.id,
            name: user.name,
            spreadsheetId: user.spreadsheetId,
            google_token: user.google_token
        })
    );
};
export const validateUser = (user: any): user is User => {
    return typeof user.id === "string" && typeof user.name === "string" && typeof user.google_token === "string";
};
export const registerUser = async (newUser: User) => {
    const user = await USERS.get(newUser.id);
    if (user) {
        return new Error("already used");
    }
    if (!validateUser(newUser)) {
        return new Error("invalid user data");
    }
    return setUser(newUser);
};
export const updateUser = async (userId: string, userData: Exclude<User, "id">) => {
    const user = await USERS.get(userId);
    if (!user) {
        return new Error("not found user");
    }
    if (!validateUser(userData)) {
        return new Error("invalid user data");
    }
    return setUser({
        ...userData,
        id: userId
    });
};
