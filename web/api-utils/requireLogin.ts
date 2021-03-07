import { NextApiResponse } from "next";
import { NextHandler } from "next-connect";
import { User } from "../domain/User";
import { createUserKvs } from "./userKvs";
import { NextApiRequestWithSession } from "./with-session";

export type NextApiRequestWithUserSession = NextApiRequestWithSession & {
    user: User;
};
export const requireLogin = () => {
    return async (req: NextApiRequestWithSession, _res: NextApiResponse, next: NextHandler) => {
        const userKVS = await createUserKvs();
        const user = await userKVS.findByGoogleId(req.session.get("googleUserId"));
        if (!user) {
            return next(new Error("No user"));
        }
        (req as NextApiRequestWithUserSession).user = user;
        return next();
    };
};
