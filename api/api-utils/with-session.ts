import { session } from "next-session";
import { createSessionStore } from "express-session-cloudflare-kv";
import { NextApiRequest } from "next";
import { UserCredentials } from "../domain/User";
import { env } from "./env";

export interface Session {
    googleUserId: string;
    authState?: string;
    temporaryRegistration?: {
        credentials: UserCredentials;
    };
}

export type NextApiRequestWithSession = NextApiRequest & {
    session: Session & {
        commit(): Promise<void>;
    };
};
export const withSession = () => {
    return session({
        store: createSessionStore({
            accountId: env.CF_accountId!,
            namespaceId: env.CF_namespace_session!,
            authEmail: env.CF_authEmail!,
            authKey: env.CF_authKey!
        }),
        cookie: {
            secure: process.env.NODE_ENV === "production"
        }
    });
};
