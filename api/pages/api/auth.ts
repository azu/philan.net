import { NextApiRequest, NextApiResponse } from 'next'
import { google } from "googleapis";

const YOUR_CLIENT_ID = process.env.CLIENT_ID
const YOUR_CLIENT_SECRET = process.env.CLIENT_SECRET
const YOUR_REDIRECT_URL = "http://localhost:8787/auth/callback"
const handler = (req: NextApiRequest, res: NextApiResponse) => {
    const state = req.query.state;
    if (typeof state !== "string") {
        throw new Error("No state");
    }
    const client = new google.auth.OAuth2(YOUR_CLIENT_ID, YOUR_CLIENT_SECRET, YOUR_REDIRECT_URL)
    const authUrl = client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/spreadsheets',
            "https://www.googleapis.com/auth/drive" // require to create sheet
        ],
        state
    });
    res.redirect(authUrl);
}

export default handler
