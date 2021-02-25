import { NextApiResponse } from "next";
import nextConnect from "next-connect";
import { NextApiRequestWithSession, withSession } from "../../../api-utils/with-session";

const handler = nextConnect<NextApiRequestWithSession, NextApiResponse>()
    .use(withSession())
    .post(async (req, res, next) => {
        req.session.destroy((error) => {
            if (error) {
                return next(error);
            }
            res.send({ ok: true });
            next();
        });
    });

export default handler;
