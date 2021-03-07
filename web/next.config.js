module.exports = {
    api: {
        bodyParser: {
            sizeLimit: "1mb"
        },
        externalResolver: true
    },
    async rewrites() {
        return [
            {
                source: "/user/:id.json",
                destination: "/user/json/:id"
            }
        ];
    },
    async headers() {
        return [
            {
                source: "/api/:path*",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "*" },
                    { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
                    {
                        key: "Access-Control-Allow-Headers",
                        value:
                            "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
                    }
                ]
            }
        ];
    }
};
