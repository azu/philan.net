const path = require("path");
const GasPlugin = require("gas-webpack-plugin");

module.exports = {
    context: __dirname,
    devtool: false,
    entry: {
        main: path.resolve(__dirname, "subscription.ts")
    },
    output: {
        path: path.resolve(__dirname, "../pages/api/subscription"),
        filename: "subscription.gs"
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                options: {
                    transpileOnly: true
                }
            }
        ]
    },
    plugins: [new GasPlugin()]
};
