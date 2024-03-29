if (process.env.BUILD_ENV) {
    require("dotenv").config({
        path: `.env.${process.env.BUILD_ENV || ""}`
    });
}
module.exports = {
    redirects() {
        return [
            process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "1"
                ? { source: "/((?!maintenance|_next).*)", destination: "/maintenance", permanent: false }
                : null
        ].filter(Boolean);
    },
    api: {
        bodyParser: {
            sizeLimit: "1mb"
        },
        externalResolver: true
    },
    env: {
        APP_CF_AUTHKEY: process.env.APP_CF_AUTHKEY,
        APP_CF_ACCOUNT_ID: process.env.APP_CF_ACCOUNT_ID,
        APP_CF_NAMESPACE_USER: process.env.APP_CF_NAMESPACE_USER,
        APP_CF_AUTH_EMAIL: process.env.APP_CF_AUTH_EMAIL,
        APP_LOGFLARE_API_KEY: process.env.APP_LOGFLARE_API_KEY,
        APP_SESSION_COOKIE_SECRET: process.env.APP_SESSION_COOKIE_SECRET,
        APP_STATS_ENABLED: process.env.APP_STATS_ENABLED,
        APP_STATS_AWS_ACCESS_KEY_ID: process.env.APP_STATS_AWS_ACCESS_KEY_ID,
        APP_STATS_AWS_SECRET_ACCESS_KEY: process.env.APP_STATS_AWS_SECRET_ACCESS_KEY,
        APP_GOOGLE_OAUTH_CLIENT_ID: process.env.APP_GOOGLE_OAUTH_CLIENT_ID,
        APP_GOOGLE_OAUTH_CLIENT_SECRET: process.env.APP_GOOGLE_OAUTH_CLIENT_SECRET,
        APP_OAUTH_REDIRECT_URL: process.env.APP_OAUTH_REDIRECT_URL,
        NEXT_PUBLIC_MAINTENANCE_MODE: process.env.NEXT_PUBLIC_MAINTENANCE_MODE
    },
    async headers() {
        return [];
    }
};
