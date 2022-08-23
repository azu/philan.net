import { NextApiRequest, NextApiResponse } from "next";

const getError = (error: Error & { code?: number }) => {
    // No HTTP Error code
    if (error.code && 400 <= error.code && error.code < 600) {
        return {
            status: 500,
            message: error.message
        };
    }
    // new Error('400: error message');
    const matched = error.message.match(/^([0-9]{3}):(.*)/);
    if (matched && matched[1] && matched[2]) {
        return {
            status: Number(matched[1]),
            message: matched[2].trim()
        };
    }
    // default is 500
    return {
        status: 500,
        message: error.message
    };
};

export const withToken = (handler: (req: NextApiRequest, res: NextApiResponse) => unknown) => {
    return async function withTokenHandler(req: NextApiRequest, res: NextApiResponse) {
        if (!req.query.token) {
            throw new Error("400: No token");
        }
        return handler(req, res);
    };
};
export const withError = (handler: (req: NextApiRequest, res: NextApiResponse) => unknown) => {
    return async function errorHandler(req: NextApiRequest, res: NextApiResponse) {
        try {
            return await handler(req, res);
        } catch (error: any) {
            const e = getError(error);
            return res.status(e.status).json({
                ok: false,
                message: e.message
            });
        }
    };
};
