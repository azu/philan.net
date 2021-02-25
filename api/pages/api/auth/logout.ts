import { NextApiResponse } from "next";
import nextConnect from "next-connect";
import { NextApiRequestWithSession, withSession } from "../../../api-utils/with-session";

const handler = nextConnect<NextApiRequestWithSession, NextApiResponse>()
    .use(withSession())
    .post(async (req, res) => {
        await req.session.destroy();
        res.send({ ok: true });
    });

export default handler;
