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

//
export type GetUserResponseBody =
    | {
          isLogin: true;
          id: string;
          name: string;
          avatarUrl: string;
          spreadsheetUrl: string;
      }
    | {
          isLogin: false;
      };
