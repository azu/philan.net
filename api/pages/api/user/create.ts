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
        const { id, name, budget } = validateCreateUserRequestBody(req.body);
        if (!req.session.temporaryRegistration) {
            throw new Error("Authorize before create");
        }
        const credentials = req.session.temporaryRegistration.credentials;
        const client = createOAuthClient(credentials);
        const verifiedIdTokenResponse = await client.verifyIdToken({
            idToken: credentials.id_token
        });
        const userId = verifiedIdTokenResponse.getUserId();
        if (!userId) {
            throw new Error("Not found userId");
        }
        // check DB
        const kvs = createUserKvs();
        const oldUser = await kvs.findByGoogleId(id);
        if (oldUser !== undefined) {
            throw new Error("Already used");
        }
        const spreadSheet = await createNewSheet(
            {
                budget
            },
            {
                credentials: credentials
            }
        );
        if (!spreadSheet.data.spreadsheetId) {
            throw new Error("Can not create spreadsheet: null");
        }
        // Save
        await kvs.updateUser(userId, {
            id,
            name,
            credentials,
            spreadsheetId: spreadSheet.data.spreadsheetId
        });
        // remove temporary
        delete req.session.temporaryRegistration;
        res.json({
            ok: true
        });
    });
export default handler;
