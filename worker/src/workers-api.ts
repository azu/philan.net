import { Router } from "sunder";
import cookie from "cookie";
import { ResponseData } from "sunder/util/response";
import { registerUser, updateUser, User } from "./domain/User";
import { createNewSession, loginAsUser, updateSessionWithTemp } from "./domain/Session";
import { HeadersShorthands } from "sunder/context";

declare const USERS: KVNamespace;
declare const DEBUG: string | undefined;

const API_HOST = typeof DEBUG !== "undefined" ? "https://philan-net-api.loca.lt" : "https://philan.net";

const setCookie = (response: ResponseData, values: [key: string, value: string][]) => {
    if (DEBUG) {
        response.set("Set-Cookie", `${values.map(([key, value]) => `${key}=${value}`).join("; ")}; HttpOnly`);
    } else {
        response.set("Set-Cookie", `${values.map(([key, value]) => `${key}=${value}`).join("; ")}; Secure; HttpOnly`);
    }
};
const corsHeader = (response: ResponseData) => {
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Methods", "POST,OPTIONS");
    response.set("Access-Control-Max-Age", "86400");
    response.set("Access-Control-Allow-Headers", "Content-Type");
};
const getSessionIdFromCookie = (request: Request & HeadersShorthands) => {
    return cookie.parse(request.get("Cookie") || "")["sid"];
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
router.get("/worker/login", async (context) => {
    const sessionId = await createNewSession();
    setCookie(context.response, [["sid", sessionId]]);
    context.response.body = "Login";
});
router.post("/worker/user/create", async (context) => {
    corsHeader(context.response);
    const userRequest: User = await context.request.json();
    const sessionId = getSessionIdFromCookie(context.request);
    const result = await registerUser(userRequest);
    if (result instanceof Error) {
        context.response.status = 400;
        context.response.body = {
            ok: false,
            message: result.message
        };
        return;
    }
    context.response.body = { ok: true };
});
router.post("/worker/user/:user", async (context) => {
    corsHeader(context.response);
    const userId = context.params.user;
    const userRequest: User = await context.request.json();
    const result = await updateUser(userId, userRequest);
    if (result instanceof Error) {
        context.response.status = 400;
        context.response.body = {
            ok: false,
            message: result.message
        };
        return;
    } else {
        context.response.body = { ok: true };
    }
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
    const SSRURL = `${API_HOST}/user/ID/${userData.google_token}`;
    const res = await fetch(SSRURL);
    if (res.body) {
        response.body = res.body;
    } else {
        response.body = "No response";
    }
});
router.get("/auth", async ({ response, params }) => {
    const uuid = createRandom();
    const sessionId = await createNewSession();
    setCookie(response, [
        [`philan-state`, uuid],
        [`sid`, sessionId]
    ]);
    response.redirect(`${API_HOST}/api/auth?state=${uuid}`);
});
router.get("/auth/callback", async (ctx) => {
    const state = ctx.url.searchParams.get("state");
    const cookieState = cookie.parse(ctx.request.get("Cookie") || "")["philan-state"];
    const sessionId = getSessionIdFromCookie(ctx.request);
    if (state !== cookieState) {
        console.error("state is mismatched", state, cookieState);
        ctx.response.body = "state error";
        return;
    }
    const code = `code=${encodeURIComponent(ctx.url.searchParams.get("code") || "")}`;
    const url = `${API_HOST}/api/auth/getToken?${code}`;
    const res = await fetch(url);
    const refreshToken = await res.json();
    await updateSessionWithTemp(sessionId, {
        googleToken: refreshToken.tokens.access_token
    });
    // user/create
    ctx.response.redirect(`/docs/user/create`);
});
export { router };
