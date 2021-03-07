import pino from "pino";
import { logflarePinoVercel } from "pino-logflare";
import { env } from "./env";

const { stream, send } = logflarePinoVercel({
    apiKey: env.LOGFLARE_API_KEY,
    sourceToken: "522b1fb8-1e24-4022-8a3f-fa9b5c63e135"
});

export const logger = pino(
    {
        browser: {
            transmit: {
                // @ts-expect-error
                send: send
            }
        },
        level: "debug",
        base: {
            env: process.env.NODE_ENV || "ENV not set",
            revision: process.env.VERCEL_GITHUB_COMMIT_SHA
        }
    },
    stream
);
