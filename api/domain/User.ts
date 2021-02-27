import { Auth } from "googleapis";

type DeepNonNullable<T> = {
    [P in keyof T]-?: NonNullable<T[P]>;
};
export type UserCredentials = DeepNonNullable<Auth.Credentials>;

export type User = {
    id: string;
    name: string;
    avatarUrl?: string;
    spreadsheetId: string;
    credentials: UserCredentials;
};
