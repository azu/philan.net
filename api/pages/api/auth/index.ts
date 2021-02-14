import { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const handler = (req: NextApiRequest, res: NextApiResponse) => {
    const REDIRECT_URL =
        process.env.NODE_ENV === "development" ? "http://localhost:3000/test" : "http://localhost:8787/auth/callback";
    const state = req.query.state;
    if (typeof state !== "string") {
        throw new Error("No state");
    }
    const client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
    const authUrl = client.generateAuthUrl({
        access_type: "offline",
        scope: [
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/drive" // require to create sheet
        ],
        state
    });
    res.redirect(authUrl);
};

export default handler;
