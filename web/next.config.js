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
    async headers() {
        return [];
    }
};
