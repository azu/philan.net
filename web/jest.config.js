const path = require("path");
require("dotenv").config({
    // also defined TEST_GOOGLE_CREDENTIAL_BASE64
    path: !process.env.CI ? path.resolve(process.cwd(), ".env") : path.resolve(process.cwd(), ".env.example")
});
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node"
};
