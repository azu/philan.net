import { Router, Sunder } from "sunder";
import cookie from "cookie"
import "@cloudflare/workers-types"

type User = {
    id: string;
    name: string;
    spreadsheetId: string;
    google_token: string;
};
type UserPage = {
    id: string;
    spreadsheetJSON: object
};

declare const USER_NAMESPACE: KVNamespace;

const app = new Sunder();
const router = new Router();
const createRandom = () => {
    const arr = new Uint8Array((40) / 2)
    crypto.getRandomValues(arr)
    return Array.from(arr, (dec) => dec.toString(16).padStart(2, "0")).join('')
}
router.get("/auth", ({ response, params }) => {
    const uuid = createRandom()
    response.set("Set-Cookie", `philan-state=${uuid}; Secure; HttpOnly`)
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
    // Store? Refresh Token with user
    console.log("fetched", JSON.stringify(refreshToken, null, 4));
});
app.use(async (ctx, next) => {
    const start = Date.now();
    await next();

    const ms = Date.now() - start;
    ctx.response.set('X-Response-Time', `${ms}ms`);
});
app.use(router.middleware);

addEventListener('fetch', (event) => {
    const fetchEvent = event; // Only required in Typescript
    // @ts-ignore
    fetchEvent.respondWith(app.handle(fetchEvent));
});
