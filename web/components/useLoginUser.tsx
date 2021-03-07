import { createContext, useContext, useEffect, useState } from "react";
import { GetUserResponseBody, UserResponseObject } from "../pages/api/user/api-types";

// https://blog.stin.ink/articles/do-not-export-react-context
export type LoginUser = UserResponseObject;
const userContext = createContext<LoginUser | null>(null);
export const UserProvider: React.FC = ({ children }) => {
    const [user, setUser] = useState<LoginUser | null>(null);
    useEffect(() => {
        const abortController = new AbortController();
        fetch("/api/user/get", { signal: abortController.signal })
            .then((res) => res.json())
            .then((json: GetUserResponseBody) => {
                if (json.isLogin) {
                    setUser(json);
                }
                return json;
            })
            .catch((error) => {
                console.error("Failed to Fetch", error);
            });
        return () => {
            abortController.abort();
        };
    }, []);

    return <userContext.Provider value={user}>{children}</userContext.Provider>;
};

/**
 * get login user
 */
export function useLoginUser() {
    return useContext(userContext);
}
