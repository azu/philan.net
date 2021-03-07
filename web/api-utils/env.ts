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
    LOGFLARE_API_KEY: process.env.LOGFLARE_API_KEY!
};
export const hasCloudFlareEnv = () => {
    if (env.FORCE_NO_USE_CF) {
        return false;
    }
    return Boolean(
        env.CF_accountId && env.CF_authEmail && env.CF_authKey && env.CF_namespace_session && env.CF_namespace_user
    );
};
