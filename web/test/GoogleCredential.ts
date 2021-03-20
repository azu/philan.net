import { UserCredentials } from "../domain/User";

export const TEST_SPREADSHEET_ID = "1gmVOU7Zi_g6fV7aWPUnZhgKLd5EdltxeWbwlufM3Plc";
export const TEST_SPREADSHEET_URL =
    "https://docs.google.com/spreadsheets/d/1gmVOU7Zi_g6fV7aWPUnZhgKLd5EdltxeWbwlufM3Plc/edit";
export const hasTestCredential = () => {
    return Boolean(process.env.TEST_GOOGLE_CREDENTIAL_BASE64);
};
export const getTestCredential = () => {
    if (!process.env.TEST_GOOGLE_CREDENTIAL_BASE64) {
        throw new Error("process.env.TEST_GOOGLE_CREDENTIAL_BASE64 is not defined");
    }
    return JSON.parse(Buffer.from(process.env.TEST_GOOGLE_CREDENTIAL_BASE64, "base64").toString()) as UserCredentials;
};
