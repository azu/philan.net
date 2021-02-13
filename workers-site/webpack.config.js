const path = require('path')
const mode = process.env.NODE_ENV || 'production'

module.exports = {
    target: "webworker",
    entry: path.join(__dirname, './src/index.ts'),
    output: {
        filename: `worker.${mode}.js`,
        path: path.join(__dirname, 'dist'),
    },
    mode,
    context: path.resolve(__dirname),
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        plugins: [],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                    transpileOnly: true,
                },
            },
        ],
    },
}
