import { google } from "googleapis";
import { NextApiRequest, NextApiResponse } from "next";

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const REDIRECT_URL =
        process.env.NODE_ENV === "development"
            ? process.env.DEBUG
                ? "http://localhost:8787/auth/callback"
                : "http://localhost:3000/test"
            : "http://localhost:8787/auth/callback";
    const code = req.query.code;
    if (typeof code !== "string") {
        return res.status(400).json({
            ok: false,
            message: "invalid code"
        });
    }
    console.log("code", code);
    const client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
    const token = await client.getToken(code);
    res.json(token);
};
export default handler;
