import { NextApiResponse } from "next";
import { createOAuthClient } from "../../../api-utils/oauth/createOAuthClient";
import nextConnect from "next-connect";
import { NextApiRequestWithSession, withSession } from "../../../api-utils/with-session";
import { randomBytes } from "crypto";
import { logger } from "../../../api-utils/logger";

const createRandom = () => {
    return randomBytes(40).reduce((p, i) => p + (i % 32).toString(32), "");
};

const handler = nextConnect<NextApiRequestWithSession, NextApiResponse>()
    .use(withSession())
    .get(async (req, res, next) => {
        const uuid = createRandom();
        req.session.set("authState", uuid);
        await req.session.save();
        // save state and redirect
        const client = createOAuthClient();
        const authUrl = client.generateAuthUrl({
            // require refresh_token
            access_type: "offline",
            prompt: "consent",
            scope: [
                "https://www.googleapis.com/auth/drive.file", // require to create and edit sheet
                "https://www.googleapis.com/auth/script.projects", // require to create apps script
                "openid", // id_token
                "profile" // aviator, default name, default id
            ],
            state: uuid
        });
        logger.info("start to auth", {
            state: uuid
        });
        res.redirect(authUrl);
        next();
    });

export default handler;
