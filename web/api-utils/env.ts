const ENABLE_PRODUCTION_DATA = Boolean(process.env.APP_ENABLE_PRODUCTION_DATA);
export const env = {
    DEBUG: process.env.APP_DEBUG!,
    FORCE_NO_USE_CF: Boolean(process.env.APP_FORCE_NO_USE_CF === "1"),
    CLIENT_ID: ENABLE_PRODUCTION_DATA ? process.env.APP_PROD_CLIENT_ID! : process.env.APP_GOOGLE_OAUTH_CLIENT_ID!,
    CLIENT_SECRET: ENABLE_PRODUCTION_DATA
        ? process.env.APP_PROD_CLIENT_SECRET!
        : process.env.APP_GOOGLE_OAUTH_CLIENT_SECRET!,
    CF_accountId: process.env.APP_CF_accountId!,
    CF_authEmail: process.env.APP_CF_authEmail!,
    CF_authKey: process.env.APP_CF_authKey!,
    CF_namespace_user: ENABLE_PRODUCTION_DATA
        ? process.env.APP_PROD_CF_namespace_user!
        : process.env.APP_CF_namespace_user!,
    SESSION_COOKIE_SECRET: process.env.APP_SESSION_COOKIE_SECRET!,
    LOGFLARE_API_KEY: process.env.APP_LOGFLARE_API_KEY!,
    STATS_AWS_ACCESS_KEY_ID: process.env.APP_STATS_AWS_ACCESS_KEY_ID!,
    STATS_AWS_SECRET_ACCESS_KEY: process.env.APP_STATS_AWS_SECRET_ACCESS_KEY!,
    STATS_AWS_S3_REGION: "us-east-1",
    STATS_AWS_S3_BUCKETS_NAME: "philan.net",
    AWS_ATHENA_OUTPUT_S3_BUCKETS_NAME: "philan.net-athena",
    STATS_ENABLED: Boolean(process.env.APP_STATS_ENABLED === "true"),
    OAUTH_REDIRECT_URL: process.env.APP_OAUTH_REDIRECT_URL
};
export const hasCloudFlareEnv = () => {
    if (env.FORCE_NO_USE_CF) {
        return false;
    }
    return Boolean(env.CF_accountId && env.CF_authEmail && env.CF_authKey && env.CF_namespace_user);
};
