import { useEffect, useMemo } from "react";
import { useLocalStorage } from "react-use";
import * as SpreadSheetAPI from "./api/spreadsheet/api-types";
import dynamic from "next/dynamic";

function useSpreadSheet(token?: string) {
    const [spreadsheetId, setspreadsheetId] = useLocalStorage<string>("spreadsheetId", "");
    const handlers = useMemo(
        () => ({
            create: () => {
                const param = new URLSearchParams([["token", token!]]);
                return fetch("/api/spreadsheet/create?" + param, {
                    method: "post",
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                    .then((res) => {
                        return res.json();
                    })
                    .then((res) => {
                        setspreadsheetId(res.spreadsheetId);
                    });
            },
            add: () => {
                const param = new URLSearchParams([
                    ["token", token!],
                    ["spreadsheetId", spreadsheetId!]
                ]);
                return fetch("/api/spreadsheet/add?" + param, {
                    method: "post",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        to: "philan.net",
                        amount: 100,
                        url: "https://philan.net",
                        memo: "THIS IS MEMO"
                    } as SpreadSheetAPI.AddRequestBody)
                });
            },
            get: () => {
                const param = new URLSearchParams([
                    ["token", token!],
                    ["spreadsheetId", spreadsheetId!]
                ]);
                return fetch("/api/spreadsheet/get?" + param)
                    .then((res) => {
                        return res.json();
                    })
                    .then((res) => {
                        console.log(res);
                    });
            }
        }),
        [token, spreadsheetId]
    );

    return [spreadsheetId, handlers] as const;
}

const DebugPage = () => {
    const [token, setToken, removeToken] = useLocalStorage<string>("token", "");
    const [spreadsheetId, handlers] = useSpreadSheet(token);
    const authorize = () => {
        removeToken();
        location.href = "/api/auth?state=test";
    };
    useEffect(() => {
        const code = new URL(window.location.href).searchParams.get("code");
        if (!code) {
            return;
        }
        if (token) {
            return;
        }
        (async function () {
            const res = await fetch("/api/auth/getToken?code=" + code).then((res) => res.json());
            const access_token: string = res.tokens.access_token;
            setToken(access_token);
            localStorage.setItem("access_token", access_token);
        })();
    }, []);
    if (token) {
        return (
            <div>
                <h2>SpredSheet</h2>
                <p>
                    : <a href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/`}>{spreadsheetId}</a>
                </p>
                <ul>
                    <li>
                        <button onClick={handlers.create}>Create</button>
                    </li>
                    <li>
                        <button onClick={handlers.add}>Add</button>
                    </li>

                    <li>
                        <button onClick={handlers.get}>Get</button>
                    </li>
                </ul>
                <h2>Page</h2>
                <ul>
                    <li>
                        <a href={`/user/${spreadsheetId}/${token}`}>User</a>
                    </li>
                </ul>
                <footer>
                    <label>
                        Re-Authorize: <button onClick={authorize}>Authorize</button>
                    </label>
                </footer>
            </div>
        );
    } else {
        return (
            <div>
                <p>
                    <a href={"/api/auth?state=test"}>Authorize</a>
                </p>
            </div>
        );
    }
};
export default dynamic(
    async () => {
        if (process.env.NODE_ENV !== "development") {
            return () => null;
        }
        return DebugPage;
    },
    { loading: () => <p>...</p> }
);
