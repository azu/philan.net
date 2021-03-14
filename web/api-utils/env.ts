export const env = {
    DEBUG: process.env.DEBUG!,
    CLIENT_ID: process.env.CLIENT_ID!,
    CLIENT_SECRET: process.env.CLIENT_SECRET!,
    FORCE_NO_USE_CF: process.env.FORCE_NO_USE_CF!,
    CF_accountId: process.env.CF_accountId!,
    CF_authEmail: process.env.CF_authEmail!,
    CF_authKey: process.env.CF_authKey!,
    CF_namespace_session: process.env.CF_namespace_session!,
    CF_namespace_user: process.env.CF_namespace_user!,
    SESSION_COOKIE_SECRET: process.env.SESSION_COOKIE_SECRET!,
    LOGFLARE_API_KEY: process.env.LOGFLARE_API_KEY!,
    STATS_AWS_ACCESS_KEY_ID: process.env.STATS_AWS_ACCESS_KEY_ID!,
    STATS_AWS_SECRET_ACCESS_KEY: process.env.STATS_AWS_SECRET_ACCESS_KEY!,
    STATS_AWS_S3_REGION: "us-east-1",
    STATS_AWS_S3_BUCKETS_NAME: "philan.net",
    AWS_ATHENA_OUTPUT_S3_BUCKETS_NAME: "philan.net-athena",
    STATS_ENABLED: Boolean(process.env.STATS_ENABLED === "true")
};
export const hasCloudFlareEnv = () => {
    if (env.FORCE_NO_USE_CF) {
        return false;
    }
    return Boolean(
        env.CF_accountId && env.CF_authEmail && env.CF_authKey && env.CF_namespace_session && env.CF_namespace_user
    );
};
