import nextConnect from "next-connect";
import { withSession } from "../../../api-utils/with-session";
import { NextApiResponse } from "next";
import { validateUpdateUserRequestBody } from "./api-types.validator";
import { createUserKvs } from "../../../api-utils/userKvs";
import { NextApiRequestWithUserSession, requireLogin } from "../../../api-utils/requireLogin";

const handler = nextConnect<NextApiRequestWithUserSession, NextApiResponse>()
    .use(withSession())
    .use(requireLogin())
    .post(async (req, res) => {
        const { name, defaultCurrency, spreadsheetId } = validateUpdateUserRequestBody(req.body);
        const userKVS = await createUserKvs();
        // check DB
        const currentUser = req.user;
        await userKVS.updateUser(req.session.get("googleUserId")!, {
            ...currentUser,
            name,
            defaultCurrency,
            spreadsheetId: spreadsheetId
        });
        res.json({
            ok: true
        });
    });
export default handler;
