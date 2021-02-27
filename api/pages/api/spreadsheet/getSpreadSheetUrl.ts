import nextConnect from "next-connect";
import { withSession } from "../../../api-utils/with-session";
import { NextApiResponse } from "next";
import { NextApiRequestWithUserSession, requireLogin } from "../../../api-utils/requireLogin";

const handler = nextConnect<NextApiRequestWithUserSession, NextApiResponse>()
    .use(withSession())
    .use(requireLogin())
    .get(async (req, res) => {
        const user = req.user;
        res.json({
            spreadsheetId: user.spreadsheetId
        });
    });
export default handler;
