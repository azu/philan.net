import { Router, Sunder } from "sunder";

const app = new Sunder();
const router = new Router();
router.get("/auth", ({ response, params }) => {
    response.redirect("http://localhost:3000/api/auth");
});
router.get("/auth/callback", async (ctx) => {
    const url = "http://localhost:3000/api/getToken?" + ctx.url.searchParams;
    console.log("url→", url);
    const res = await fetch(url);
    console.log("fetched", res);
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
