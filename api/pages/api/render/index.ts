import next, { NextApiRequest, NextApiResponse } from "next";
import { parse } from "url";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, customServer: true });

const handle = app.getRequestHandler();
const handler = (req: NextApiRequest, res: NextApiResponse) => {
    const url = req.url;
    if (!url) {
        return res.status(400).send({ ok: false });
    }
    return app.prepare().then(() => {
        const parsedUrl = parse(url, true);
        if (parsedUrl.pathname === "/api/render") {
            return app.render(req, res, "/");
        } else {
            return handle(req, res, parsedUrl);
        }
    });
};

export default handler;
