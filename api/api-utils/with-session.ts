import session, { Session } from "express-session";
import { createSessionStore } from "express-session-cloudflare-kv";
import { NextApiRequest } from "next";
import { UserCredentials } from "../domain/User";
import { env } from "./env";

export type NextApiRequestWithSession = NextApiRequest & {
    session: Session & {
        googleUserId: string;
        authState?: string;
        temporaryRegistration?: {
            credentials: UserCredentials;
        };
    };
};
export const withSession = () => {
    return session({
        secret: env.SESSION_COOKIE_SECRET,
        resave: true,
        saveUninitialized: true,
        store: createSessionStore({
            accountId: env.CF_accountId!,
            namespaceId: env.CF_namespace_session!,
            authEmail: env.CF_authEmail!,
            authKey: env.CF_authKey!
        })
    });
};
