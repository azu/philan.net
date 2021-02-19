import { getUser } from "./User";

export type Session = {
    userId?: string;
    temp?: {
        googleToken: string;
    };
};

declare const SESSIONS: KVNamespace;
export const getSession = async (id: string): Promise<Session | undefined> => {
    const session = await SESSIONS.get(id);
    if (!session) {
        return;
    }
    return JSON.parse(session);
};
const setSession = async (sessionId: string, session: Session) => {
    return SESSIONS.put(sessionId, JSON.stringify(session), {
        expirationTtl: 30 * 1000
    });
};
const deleteSession = async (sessionId: string) => {
    return SESSIONS.delete(sessionId);
};
const getUserBySession = async (session: Session) => {
    if (!session.userId) {
        return;
    }
    return getUser(session.userId);
};
const createRandom = () => {
    const arr = new Uint8Array(40 / 2);
    crypto.getRandomValues(arr);
    return Array.from(arr, (dec) => dec.toString(16).padStart(2, "0")).join("");
};
export const createNewSession = async (): Promise<string> => {
    return createRandom();
};
export const updateSessionWithTemp = async (id: string, tempData: Session["temp"]) => {
    await setSession(id, {
        temp: tempData
    });
};
export const loginAsUser = async (id: string, userId: string) => {
    await setSession(id, {
        userId
    });
};
export const logout = async (sessionId: string) => {
    return deleteSession(sessionId);
};
