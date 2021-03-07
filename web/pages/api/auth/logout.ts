import { NextApiResponse } from "next";
import nextConnect from "next-connect";
import { NextApiRequestWithSession, withSession } from "../../../api-utils/with-session";

const handler = nextConnect<NextApiRequestWithSession, NextApiResponse>()
    .use(withSession())
    .post(async (req, res) => {
        req.session.destroy();
        res.setHeader("Clear-Site-Data", `"cache", "cookies"`);
        res.send({ ok: true });
    });

export default handler;
