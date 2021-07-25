// createOAuth wrapper
// re-use token in short time
import { Auth } from "googleapis";
import { createOAuthClient } from "./createOAuthClient";

export type GetTokenMeta =
    | {
          token: string;
      }
    | {
          credentials?: Auth.Credentials;
      };
/**
 * await getToken(meta); // => token
 * @param meta
 */
export const getToken = async (meta: GetTokenMeta): Promise<string> => {
    if ("token" in meta) {
        return meta.token;
    }
    const client = createOAuthClient(meta.credentials);
    const { token } = await client.getAccessToken();
    if (!token) {
        throw new Error("No Access Token");
    }
    return token;
};
