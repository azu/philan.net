import nextConnect from "next-connect";
import { NextApiRequestWithSession, withSession } from "../../../api-utils/with-session";
import { NextApiResponse } from "next";
import { createOAuthClient } from "../../../api-utils/create-OAuth";
import { validateCreateUserRequestBody } from "./api-types.validator";
import { createNewSheet } from "../spreadsheet/create";
import { createUserKvs } from "../../../api-utils/userKvs";

const handler = nextConnect<NextApiRequestWithSession, NextApiResponse>()
    .use(withSession())
    .post(async (req, res) => {
        const { id, name, budget, README, defaultCurrency } = validateCreateUserRequestBody(req.body);
        if (!req.session.get("tempCredentials")) {
            throw new Error("Authorize before create");
        }
        const credentials = req.session.get("tempCredentials");
        const client = createOAuthClient(credentials);
        const verifiedIdTokenResponse = await client.verifyIdToken({
            idToken: credentials.id_token
        });
        const googleId = verifiedIdTokenResponse.getUserId();
        if (!googleId) {
            throw new Error("Not found userId");
        }
        const picture = verifiedIdTokenResponse.getPayload()?.["picture"];
        // check DB
        const kvs = await createUserKvs();
        const oldUser = await kvs.findByGoogleId(id);
        if (oldUser !== undefined) {
            throw new Error("Already used");
        }
        const spreadSheet = await createNewSheet(
            {
                budget,
                README
            },
            {
                credentials: credentials
            }
        );
        if (!spreadSheet.data.spreadsheetId) {
            throw new Error("Can not create spreadsheet: null");
        }
        // Save
        await kvs.updateUser(googleId, {
            id,
            name,
            credentials,
            defaultCurrency,
            avatarUrl: picture,
            spreadsheetId: spreadSheet.data.spreadsheetId
        });
        // remove temporary
        req.session.unset("tempCredentials");
        await req.session.save();
        res.json({
            ok: true,
            id
        });
    });
export default handler;
