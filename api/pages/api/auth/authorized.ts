import { UserCredentials } from "../../../domain/User";
import nextConnect from "next-connect";
import { NextApiRequestWithSession, withSession } from "../../../api-utils/with-session";
import { NextApiResponse } from "next";
import { createOAuthClient } from "../../../api-utils/create-OAuth";
import { validateAuthorizedRequestQuery } from "./api-types.validator";
import { createUserKvs } from "../../../api-utils/userKvs";
import { logger } from "../../../api-utils/logger";

const handler = nextConnect<NextApiRequestWithSession, NextApiResponse>()
    .use(withSession())
    .get(async (req, res) => {
        const { code, state } = validateAuthorizedRequestQuery(req.query);
        // state check
        if (req.session.get("authState") !== state) {
            logger.warn("mismatch authState", {
                session: req.session.get("authState"),
                state
            });
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
        const googleId = payload.getUserId();
        if (!googleId) {
            throw new Error("Not found userId");
        }
        // update session.userId
        const kvs = createUserKvs();
        req.session.set("googleUserId", googleId);
        const user = await kvs.findByGoogleId(googleId);
        if (!user) {
            // redirect /philan/create
            req.session.set("tempCredentials", token.tokens as UserCredentials);
            req.session.unset("authState");
            await req.session.save();
            res.redirect("/philan/create");
        } else {
            // redirect /user/{id}
            const picture = payload.getPayload()?.["picture"];
            await kvs.updateUser(googleId, {
                ...user,
                avatarUrl: picture,
                credentials: token.tokens as UserCredentials
            });
            await req.session.save();
            res.redirect(`/user/${user.id}`);
        }
    });
export default handler;
