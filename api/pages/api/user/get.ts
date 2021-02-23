import nextConnect from "next-connect";
import { NextApiRequestWithSession, withSession } from "../../../api-utils/with-session";
import { NextApiResponse } from "next";
import { createUserKvs } from "../../../api-utils/userKvs";

const handler = nextConnect<NextApiRequestWithSession, NextApiResponse>()
    .use(withSession())
    .post(async (req, res) => {
        const userKVS = createUserKvs();
        const user = await userKVS.findByGoogleId(req.session.googleUserId);
        if (!user) {
            throw new Error("No user");
        }
        res.json(user);
    });
export default handler;
