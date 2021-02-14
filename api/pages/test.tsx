import { useEffect, useMemo } from "react";
import { useLocalStorage } from 'react-use';
import * as SpreadSheetAPI from "./api/spreadsheet/api-types"
import dynamic from "next/dynamic";

function useSpreadSheet(token?: string) {
    const [spreadsheetId, setSpreadsheetId] = useLocalStorage<string>("spreadsheetId", "");
    const handlers = useMemo(
        () => ({
            create: () => {
                const param = new URLSearchParams([["token", token!]]);
                return fetch("/api/spreadsheet/create?" + param, {
                    method: "post",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                }).then(res => {
                    return res.json()
                }).then(res => {
                    setSpreadsheetId(res.spreadsheetId);
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
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        to: "philan.net",
                        amount: 100,
                        url: "https://philan.net",
                        memo: "THIS IS MEMO"
                    } as SpreadSheetAPI.AddRequestBody)
                })
            },
            get: () => {
                const param = new URLSearchParams([
                    ["token", token!],
                    ["spreadsheetId", spreadsheetId!]
                ],);
                return fetch("/api/spreadsheet/get?" + param).then(res => {
                    return res.json()
                }).then(res => {
                    console.log(res);
                })
            }
        }),
        [token, spreadsheetId]
    )

    return [spreadsheetId, handlers] as const
}


const DebugPage = () => {
    const [token, setToken] = useLocalStorage<string>("token", "");
    const [spreadsheetId, handlers] = useSpreadSheet(token);
    useEffect(() => {
        const code = (new URL(window.location.href)).searchParams.get("code");
        if (!code) {
            return;
        }
        (async function () {
            const eA = localStorage.getItem("access_token");
            if (eA) {
                return setToken(eA);
            }
            const res = await fetch("/api/auth/getToken?code=" + code).then(res => res.json())
            const access_token: string = res.tokens.access_token;
            setToken(access_token);
            localStorage.setItem("access_token", access_token);
        })();
    }, []);
    if (token) {
        return <div>
            <p>Spreadsheet: <a href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/`}>{spreadsheetId}</a></p>
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

            <footer>
                <label>
                    Re-Authorize: <a href={"/api/auth?state=test"}>Authorize</a>
                </label>
            </footer>
        </div>
    } else {
        return <div>
            <p><a href={"/api/auth?state=test"}>Authorize</a></p>
        </div>
    }
}
export default dynamic(
    async () => DebugPage,
    { loading: () => <p>...</p> }
)
