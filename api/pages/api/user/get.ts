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
                login: false
            });
        }
        res.json({
            login: true
        });
    });
export default handler;
