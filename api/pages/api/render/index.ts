import next, { NextApiRequest, NextApiResponse } from "next";
import { parse } from "url";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });

const handle = app.getRequestHandler();
const handler = (req: NextApiRequest, res: NextApiResponse) => {
    const url = req.url;
    console.log("url", url);
    if (!url) {
        return res.status(400).send({ ok: false });
    }
    return app.prepare().then(() => {
        const parsedUrl = parse(url, true);
        console.log("parsedUrl", parsedUrl);
        if (parsedUrl.pathname === "/api/render") {
            return app.render(req, res, "/");
        } else {
            return handle(req, res, parsedUrl);
        }
    });
};

export default handler;
