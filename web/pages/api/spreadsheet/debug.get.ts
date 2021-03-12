import { NextApiResponse } from "next";
import nextConnect from "next-connect";
import { withSession } from "../../../api-utils/with-session";
import { NextApiRequestWithUserSession, requireAdmin, requireLogin } from "../../../api-utils/requireLogin";
import { getSpreadSheet } from "./get";
import { createUserKvs } from "../../../api-utils/userKvs";

const handler = nextConnect<NextApiRequestWithUserSession, NextApiResponse>()
    .use(withSession())
    .use(requireLogin())
    .use(requireAdmin())
    .get(async (req, res) => {
        const queryUser = req.query.user;
        if (typeof queryUser !== "string") {
            throw new Error("No user");
        }
        const kvs = await createUserKvs();
        const targetUser = await kvs.findByUserId(queryUser);
        if (!targetUser) {
            throw new Error("No user:" + queryUser);
        }
        const response = await getSpreadSheet({
            credentials: targetUser.credentials,
            spreadsheetId: targetUser.spreadsheetId,
            defaultCurrency: targetUser.defaultCurrency
        });
        res.json(response);
    });

export default handler;
