import { Auth } from "googleapis";

type DeepNonNullable<T> = {
    [P in keyof T]-?: NonNullable<T[P]>;
};
export type UserCredentials = DeepNonNullable<Auth.Credentials>;

export type User = {
    id: string;
    name: string;
    defaultCurrency: string; // ISO 4217 https://en.wikipedia.org/wiki/ISO_4217#Active_codes
    avatarUrl?: string;
    spreadsheetId: string;
    appsScriptId?: string; // Subscription integrated
    credentials: UserCredentials;
};
