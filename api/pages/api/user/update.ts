import nextConnect from "next-connect";
import { NextApiRequestWithSession, withSession } from "../../../api-utils/with-session";
import { NextApiResponse } from "next";
import { createOAuthClient } from "../../../api-utils/create-OAuth";
import { validateCreateUserRequestBody } from "./api-types.validator";
import { createUserKvs } from "../../../api-utils/userKvs";

const handler = nextConnect<NextApiRequestWithSession, NextApiResponse>()
    .use(withSession())
    .get(async (req, res) => {
        const { id, name } = validateCreateUserRequestBody(req.body);
        const userKVS = createUserKvs();
        const user = await userKVS.findByGoogleId(req.session.googleUserId);
        if (!user) {
            throw new Error("No user");
        }
        const client = createOAuthClient(user.credentials);
        const { token } = await client.getAccessToken();
        // check DB
        const oldUser = await userKVS.findByGoogleId(id);
        if (oldUser === undefined) {
            throw new Error("Already used");
        }
        if (!token) {
            throw new Error("No accessToken");
        }
        // Save
        await userKVS.updateUser(user.id, {
            ...oldUser,
            name
        });
        res.json({
            ok: true
        });
    });
export default handler;
