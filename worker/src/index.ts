import { Sunder } from "sunder";
import { router } from "./workers-api";

const app = new Sunder();
// app.use(async (ctx, next) => {
//     console.log(ctx.request.method, ctx.request.url)
//     const isWorkerEndpoint = new URL(ctx.request.url).pathname.startsWith("/worker/");
//     if (!isWorkerEndpoint) {
//         return;
//     }
//     ctx.response.set('Access-Control-Allow-Origin', "*")
//     ctx.response.set('Access-Control-Allow-Methods', 'POST,OPTIONS');
//     ctx.response.set('Access-Control-Max-Age', '86400');
//     ctx.response.set('Access-Control-Allow-Headers', 'Content-Type');
// });
app.use(router.middleware);
addEventListener("fetch", (event) => {
    const fetchEvent = event; // Only required in Typescript
    // @ts-ignore
    fetchEvent.respondWith(app.handle(fetchEvent));
});
