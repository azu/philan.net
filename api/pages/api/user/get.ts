import nextConnect from "next-connect";
import { NextApiRequestWithSession, withSession } from "../../../api-utils/with-session";
import { NextApiResponse } from "next";
import { createUserKvs } from "../../../api-utils/userKvs";
import { logger } from "../../../api-utils/logger";

const handler = nextConnect<NextApiRequestWithSession, NextApiResponse>()
    .use(withSession())
    .get(async (req, res) => {
        const userKVS = createUserKvs();
        logger.debug("Google UserId: %s", req.session.get("googleUserId"));
        const user = await userKVS.findByGoogleId(req.session.get("googleUserId"));
        if (!user) {
            return res.send({
                isLogin: false
            });
        }
        res.json({
            isLogin: true,
            id: user.id,
            name: user.name,
            avatarUrl: user.avatarUrl
        });
    });
export default handler;
