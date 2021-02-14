import { google } from "googleapis";
import { NextApiRequest, NextApiResponse } from "next";

const YOUR_CLIENT_ID = process.env.CLIENT_ID
const YOUR_CLIENT_SECRET = process.env.CLIENT_SECRET
const YOUR_REDIRECT_URL = process.env.NODE_ENV === "development"
    ? "http://localhost:3000/test"
    : "http://localhost:8787/auth/callback"
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const code = req.query.code;
    if (typeof code !== "string") {
        return res.status(400).json({
            ok: false,
            message: "invalid code"
        })
    }
    console.log("code", code);
    const client = new google.auth.OAuth2(YOUR_CLIENT_ID, YOUR_CLIENT_SECRET, YOUR_REDIRECT_URL);
    const token = await client.getToken(code);
    res.json(token);
}
export default handler;
