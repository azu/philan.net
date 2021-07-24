export type CreateUserRequestBody = {
    id: string;
    name: string;
    README: string;
    budget: number;
    defaultCurrency: string;
};

export type CreateUserResponseBody = {
    ok: true;
    id: string;
};
export type UpdateUserRequestBody = {
    name: string;
    budget: number;
    defaultCurrency: string;
    spreadsheetId: string;
};

export type UserResponseObject = {
    isLogin: true;
    id: string;
    name: string;
    defaultCurrency: string;
    avatarUrl?: string;
    spreadsheetUrl: string;
    appsScriptUrl?: string;
};

//
export type GetUserResponseBody =
    | UserResponseObject
    | {
          isLogin: false;
      };
