import { NextApiResponse } from "next";
import nextConnect from "next-connect";
import { NextApiRequestWithSession, withSession } from "../../../api-utils/with-session";
import { randomBytes } from "crypto";

const createRandom = () => {
    return randomBytes(40).reduce((p, i) => p + (i % 32).toString(32), "");
};

const handler = nextConnect<NextApiRequestWithSession, NextApiResponse>()
    .use(withSession())
    .get(async (req, res) => {
        const uuid = createRandom();
        req.session.authState = uuid;
        res.json({
            uuid
        });
    });

export default handler;
