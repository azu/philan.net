import { Router } from "sunder";
import cookie from "cookie";
import { ResponseData } from "sunder/util/response";

type User = {
    name: string;
    spreadsheetId?: string;
    google_token: string;
};

declare const USERS: KVNamespace;
declare const DEBUG: string | undefined;

const API_HOST = typeof DEBUG !== "undefined" ? "https://philan-net-api.loca.lt" : "https://philan-net.vercel.app";

const corsHeader = (response: ResponseData) => {
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Methods", "POST,OPTIONS");
    response.set("Access-Control-Max-Age", "86400");
    response.set("Access-Control-Allow-Headers", "Content-Type");
};
const router = new Router();
const createRandom = () => {
    const arr = new Uint8Array(40 / 2);
    crypto.getRandomValues(arr);
    return Array.from(arr, (dec) => dec.toString(16).padStart(2, "0")).join("");
};
router.get("/hi", async (context) => {
    // @ts-ignore
    context.response.body = process.env.DEBUG;
});
router.post("/worker/user/create", async (context) => {
    corsHeader(context.response);
    console.log(context.request);
    console.log("request", JSON.stringify(context.request.body));
    context.response.body = { ok: true };
});
// _next proxy
router.get("/_next/(.*)", async (context) => {
    const cache = caches.default;
    const pathname = new URL(context.request.url).pathname;
    const cacheKey = context.event.request;
    const response = await cache.match(cacheKey);
    if (response && response.body) {
        context.response.body = response.body;
        return;
    }
    const proxyURL = `${API_HOST}${pathname}`;
    const fetchedResponse = await fetch(proxyURL);
    await cache.put(cacheKey, fetchedResponse.clone());
    if (fetchedResponse.body) context.response.body = fetchedResponse.body;
    else context.response.body = "No response";
});
router.get("/docs/(.*)", async (context) => {
    const pathname = new URL(context.request.url).pathname.replace(/^\/docs/, "");
    const proxyURL = `${API_HOST}${pathname}`;
    console.log("→ " + proxyURL);
    const fetchedResponse = await fetch(proxyURL);
    if (fetchedResponse.body) context.response.body = fetchedResponse.body;
    else context.response.body = "No response";
});
router.get("/worker/user/meta/:user", async ({ request, response, params }) => {
    corsHeader(response);
    const user = params.user;
    console.log("user", user);
    const text = await USERS.get(user);
    if (!text) {
        response.body = "No user";
        return;
    }
    const userData = JSON.parse(text) as User;
    if (userData) response.body = JSON.stringify(userData.name);
    else {
        response.body = "No response";
    }
});
router.get("/worker/user/:user", async ({ request, response, params }) => {
    const user = params.user;
    const text = await USERS.get(user);
    if (!text) {
        response.body = "No user";
        return;
    }
    const userData = JSON.parse(text) as User;
    const SSRURL = `${API_HOST}/user/1FNux_fbqZsbTJpJ3AIcC3-RF7oywV7uJ8TDwZv19T2k/${userData.google_token}`;
    const res = await fetch(SSRURL);
    if (res.body) {
        response.body = res.body;
    } else {
        response.body = "No response";
    }
});
router.get("/auth", ({ response, params }) => {
    const uuid = createRandom();
    response.set("Set-Cookie", `philan-state=${uuid}; Secure; HttpOnly`);
    response.redirect(`${API_HOST}/api/auth?state=${uuid}`);
});
router.get("/auth/callback", async (ctx) => {
    const state = ctx.url.searchParams.get("state");
    const cookieState = cookie.parse(ctx.request.get("Cookie") || "")["philan-state"];
    if (state !== cookieState) {
        console.error("state is mismatched", state, cookieState);
        ctx.response.body = "state error";
        return;
    }
    const code = `code=${encodeURIComponent(ctx.url.searchParams.get("code") || "")}`;
    const url = `${API_HOST}/api/auth/getToken?${code}`;
    const res = await fetch(url);
    const refreshToken = await res.json();
    const user: User = {
        name: "azu",
        google_token: refreshToken.tokens.access_token
    };
    await USERS.put("azu", JSON.stringify(user));
    ctx.response.body = JSON.stringify(refreshToken, null, 4);
});
export { router };
