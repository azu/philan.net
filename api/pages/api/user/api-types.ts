export type CreateUserRequestBody = {
    id: string;
    name: string;
    budget: number;
};

export type UpdateUserRequestBody = {
    id: string;
    name: string;
    budget: number;
};

export type UserResponseObject = {
    isLogin: true;
    id: string;
    name: string;
    defaultCurrency: string;
    avatarUrl?: string;
    spreadsheetUrl: string;
};

//
export type GetUserResponseBody =
    | UserResponseObject
    | {
          isLogin: false;
      };
