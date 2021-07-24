import nextConnect from "next-connect";
import { NextApiRequestWithSession, withSession } from "../../../api-utils/with-session";
import { NextApiResponse } from "next";
import { createUserKvs } from "../../../api-utils/userKvs";
import { GetUserResponseBody } from "./api-types";

const handler = nextConnect<NextApiRequestWithSession, NextApiResponse<GetUserResponseBody>>()
    .use(withSession())
    .get(async (req, res) => {
        const googleUserId = req.session.get("googleUserId");
        // early return for reducing kvs requests
        if (!googleUserId) {
            return res.send({
                isLogin: false
            });
        }
        const userKVS = await createUserKvs();
        const user = await userKVS.findByGoogleId(googleUserId);
        if (!user) {
            return res.send({
                isLogin: false
            });
        }
        res.json({
            isLogin: true,
            id: user.id,
            name: user.name,
            defaultCurrency: user.defaultCurrency,
            avatarUrl: user.avatarUrl,
            spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${user.spreadsheetId}`,
            appsScriptUrl: user.appsScriptId
                ? `https://script.google.com/home/projects/${user.appsScriptId}`
                : undefined
        });
    });
export default handler;
