import { NextApiResponse } from "next";
import { NextHandler } from "next-connect";
import { createUserKvs, WritableUserWithGoogleId } from "./userKvs";
import { NextApiRequestWithSession } from "./with-session";

export type NextApiRequestWithUserSession = NextApiRequestWithSession & {
    user: WritableUserWithGoogleId;
};
export const requireLogin = () => {
    return async (req: NextApiRequestWithSession, _res: NextApiResponse, next: NextHandler) => {
        const googleUserId = req.session.get("googleUserId");
        const userKVS = await createUserKvs();
        const user = await userKVS.findByGoogleId(googleUserId);
        if (!user) {
            return next(new Error("No user"));
        }
        (req as NextApiRequestWithUserSession).user = user;
        return next();
    };
};

export const requireAdmin = () => {
    const ADMIN_USER = ["azu"];
    return async (req: NextApiRequestWithUserSession, _res: NextApiResponse, next: NextHandler) => {
        if (process.env.NODE_ENV === "production") {
            return next(new Error("Can not use in production"));
        }
        if (!ADMIN_USER.includes(req.user.id)) {
            return next(new Error("No admin"));
        }
        return next();
    };
};
