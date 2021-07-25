import { google, Auth } from "googleapis";
import { env } from "../env";

export const createOAuthClient = (credentials?: Auth.Credentials) => {
    const CLIENT_ID = env.CLIENT_ID;
    const CLIENT_SECRET = env.CLIENT_SECRET;
    const REDIRECT_URL = process.env.VERCEL
        ? "https://philan.net/api/auth/authorized"
        : "http://localhost:3000/api/auth/authorized";
    const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
    if (credentials) {
        oAuth2Client.setCredentials(credentials);
    }
    return oAuth2Client;
};
