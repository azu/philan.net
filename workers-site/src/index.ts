import { Router, Sunder } from "sunder";
import cookie from "cookie";

type User = {
    name: string;
    spreadsheetId?: string;
    google_token: string;
};

declare const USERS: KVNamespace;

const app = new Sunder();
const router = new Router();
const createRandom = () => {
    const arr = new Uint8Array(40 / 2);
    crypto.getRandomValues(arr);
    return Array.from(arr, (dec) => dec.toString(16).padStart(2, "0")).join("");
};
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
    const proxyURL = `https://philan-net.vercel.app${pathname}`;
    const fetchedResponse = await fetch(proxyURL);
    await cache.put(cacheKey, fetchedResponse.clone());
    if (fetchedResponse.body) context.response.body = fetchedResponse.body;
    else context.response.body = "No response";
});
router.get("/user/:user", async ({ request, response, params }) => {
    const user = params.user;
    const text = await USERS.get(user);
    if (!text) {
        response.body = "No user";
        return;
    }
    const userData = JSON.parse(text) as User;
    const SSRURL = `https://philan-net.vercel.app/user/1FNux_fbqZsbTJpJ3AIcC3-RF7oywV7uJ8TDwZv19T2k/${userData.google_token}`;
    const res = await fetch(SSRURL);
    if (res.body) response.body = res.body;
    else {
        response.body = "No response";
    }
});
router.get("/auth", ({ response, params }) => {
    const uuid = createRandom();
    response.set("Set-Cookie", `philan-state=${uuid}; Secure; HttpOnly`);
    response.redirect("https://philan-net.vercel.app/api/auth?state=" + uuid);
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
    const url = "https://philan-net.vercel.app/api/auth/getToken?" + code;
    const res = await fetch(url);
    const refreshToken = await res.json();
    const user: User = {
        name: "azu",
        google_token: refreshToken.tokens.access_token
    };
    await USERS.put("azu", JSON.stringify(user));
    ctx.response.body = JSON.stringify(refreshToken, null, 4);
});
app.use(async (ctx, next) => {
    const start = Date.now();
    await next();

    const ms = Date.now() - start;
    ctx.response.set("X-Response-Time", `${ms}ms`);
});
app.use(router.middleware);

addEventListener("fetch", (event) => {
    const fetchEvent = event; // Only required in Typescript
    // @ts-ignore
    fetchEvent.respondWith(app.handle(fetchEvent));
});
