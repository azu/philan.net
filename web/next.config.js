module.exports = {
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
