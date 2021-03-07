import { NextApiRequest } from "next";
import { UserCredentials } from "../domain/User";
import { ironSession, Session } from "next-iron-session";
import { env } from "./env";

export type NextApiRequestWithSession = NextApiRequest & {
    session: Session;
};
export type CookieSchema = {
    googleUserId: string;
    authState?: string;
    temporaryRegistration?: {
        credentials: UserCredentials;
    };
};
export const withSession = () => {
    return ironSession({
        cookieName: "irsid",
        password: env.SESSION_COOKIE_SECRET,
        cookieOptions: {
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            httpOnly: true
        }
    });
};
