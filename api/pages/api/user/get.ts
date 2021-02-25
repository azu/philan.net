import nextConnect from "next-connect";
import { NextApiRequestWithSession, withSession } from "../../../api-utils/with-session";
import { NextApiResponse } from "next";
import { createUserKvs } from "../../../api-utils/userKvs";

const handler = nextConnect<NextApiRequestWithSession, NextApiResponse>()
    .use(withSession())
    .get(async (req, res) => {
        const userKVS = createUserKvs();
        console.log('req.session.get("googleUserId")', req.session.get("googleUserId"));
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
