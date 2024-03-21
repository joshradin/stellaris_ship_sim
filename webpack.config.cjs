const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = function (env, argv) {
    const isProduction =  argv.mode === 'production';
    return {
        target: 'web',
        mode: isProduction ? 'production' : 'development',
        devtool: isProduction ? 'source-map' : 'eval',
        cache: isProduction ? false : { type: 'filesystem' },
        plugins: [new HtmlWebpackPlugin({
            title: "Stellaris Ship Simulator",
            filename: "index.html",
            template: path.resolve(__dirname, "src/index.html")
        })],
        entry: {
            lib: {
                import: "./src/lib",
            },
            components: {
                import: "./src/components",
                dependOn: "lib"
            },
            App: {
                import: "./src/App",
                dependOn: ["lib", "components"]
            },
            index: {
                import: "./src/index.tsx",
                dependOn: ["App"]
            }
        },
        module: {
            rules: [
                {
                    test: /\.(sc|sa|c)ss$/,
                    use: ['style-loader', 'css-loader', 'sass-loader']
                },
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.json$/,
                    use: 'file-loader',
                    exclude: /node_modules/
                },
                {
                    test: /\.csv$/,
                    use: {
                        loader: "file-loader",
                        options: {
                            name: "static/[name].[ext]",
                            emitFile: true
                        }
                    },
                    exclude: /node_modules/,
                }
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js', '.css', '.scss', '.sass', '.json'],
        },
        output: {
            clean: isProduction,
            filename: isProduction ? 'bundle.[id].[chunkhash].js' : '[name].bundle.js',
            path: path.resolve(__dirname, 'dist'),
        },
        optimization: {
            runtimeChunk: 'single',
            splitChunks: {
                chunks: 'all',
                minSize: 20000,
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendor',
                        priority: -10,
                        maxSize: 31232,
                    },
                    default: {
                        priority: -20
                    }
                }
            }
        },
        externals: {
            react: 'React',
            'react-dom': 'ReactDOM'
        },
        devServer: {
            hot: true
        }
    };
}