import { UserCredentials } from "../../../domain/User";
import nextConnect from "next-connect";
import { NextApiRequestWithSession, withSession } from "../../../api-utils/with-session";
import { NextApiResponse } from "next";
import { createOAuthClient } from "../../../api-utils/create-OAuth";
import { validateAuthorizedRequestQuery } from "./api-types.validator";
import { createUserKvs } from "../../../api-utils/userKvs";

const handler = nextConnect<NextApiRequestWithSession, NextApiResponse>()
    .use(withSession())
    .get(async (req, res) => {
        const { code, state } = validateAuthorizedRequestQuery(req.query);
        // state check
        if (req.session.authState !== state) {
            console.log(req.session.authState, state);
            throw new Error("Invalid State. Please retry login.");
        }
        const client = createOAuthClient();
        const token = await client.getToken(code);
        const access_token = token.tokens.access_token;
        const idToken = token.tokens.id_token;
        if (!idToken || !access_token) {
            return res.status(400).json({
                ok: false,
                message: "invalid token"
            });
        }
        const payload = await client.verifyIdToken({
            idToken: idToken
        });
        const kvs = createUserKvs();
        const googleId = payload.getUserId();
        if (!googleId) {
            throw new Error("Not found userId");
        }
        // update session.userId
        req.session.googleUserId = googleId;
        const user = await kvs.findByGoogleId(googleId);
        if (!user) {
            // redirect /user/create
            req.session.temporaryRegistration = {
                credentials: token.tokens as UserCredentials
            };
            req.session.authState = undefined;
            res.redirect("/philan/create");
        } else {
            // redirect /editor
            await kvs.updateUser(googleId, {
                ...user,
                credentials: token.tokens as UserCredentials
            });
            res.redirect(`/user/${user.id}`);
        }
    });
export default handler;
