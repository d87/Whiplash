'use strict';

const path = require('path');
const merge = require('webpack-merge');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// const eslintFormatter = require('react-dev-utils/eslintFormatter');

const ASSET_PATH = process.env.ASSET_PATH || '/';

// const TARGET = process.env.npm_lifecycle_event;
// console.log(TARGET)

const resolveApp = relativePath => path.resolve(__dirname, relativePath);
const paths = {
    appSrc: resolveApp("src"),
    appBuild: resolveApp("build"),
    appBuildSSR: resolveApp("build-ssr"),
    appHtml: resolveApp('public/index.html'),
}
const cleanPaths = [
    path.resolve(paths.appBuild, "*")
]

const cssIdentName = "[name]__[local]___[hash:base64:5]"

// const outdir = path.resolve(__dirname, 'build')


module.exports = (env = {}) => {
    const isProduction = env.production
    const isDev = !isProduction
    const isSSRBuild = env.ssrbundle
    const devServerHost = env.host
    const devServerPort = env.port
    const devServerProxy = "http://nevihta.d87:3000"
    const devServerProxyConfig = devServerProxy && {
        '/api': devServerProxy,
        '/static': devServerProxy,
        '/users': devServerProxy,
    }

    const baseConfig = {
        mode: "production",
        devtool: 'source-map',

        target: "web", //default

        entry: {
            app: [
                require.resolve('react-dev-utils/webpackHotDevClient'),
                require.resolve('react-error-overlay'),
                "./src/index.tsx",
            ],
        },
        output: {
            path: paths.appBuild,
            filename: '[name].bundle.js',
            chunkFilename: '[name].bundle.js',
            publicPath: ASSET_PATH,
        },

        resolve: {
            extensions: ['.js', '.json', '.jsx', '.ts', '.tsx', '.scss', '.css'],

            // plugins: [
            //     // Prevents users from importing files from outside of src/ (or node_modules/).
            //     new ModuleScopePlugin(),
            // ],
        },


        module: {
            strictExportPresence: true, // makes missing exports an error instead of warning
            rules: [ 
                {// ESLint
                    test: /\.(js|jsx)$/,
                    enforce: 'pre',
                    use: [
                        {
                            // options: { formatter: eslintFormatter, },
                            loader: require.resolve('eslint-loader'),
                        },
                    ],
                    include: paths.appSrc,
                },
                {// TSLint
                    test: /\.(ts|tsx)$/,
                    enforce: 'pre',
                    use: [
                        {
                            // options: { formatter: eslintFormatter, },
                            loader: require.resolve('tslint-loader'),
                        },
                    ],
                    include: paths.appSrc,
                },

                // Process JS with Babel.
                {
                    test: /\.(js|jsx|ts|tsx)$/,
                    include: paths.appSrc,
                    // exclude: [
                    //     path.resolve(__dirname, 'node_modules'),
                    // ],
                    loader: 'babel-loader',
                    options: {
                        //
                        // plugins: [
                        //     ["react-css-modules", {
                        //         generateScopedName: cssIdentName,
                        //         filetypes: {
                        //             ".scss": {
                        //                 "syntax": "postcss-scss"
                        //             },
                        //             ".sass": {
                        //                 "syntax": "sugarss"
                        //             }
                        //         },
                        //         "webpackHotModuleReloading": true
                        //     }]
                        // ],
                        // This is a feature of `babel-loader` for webpack (not Babel itself).
                        // It enables caching results in ./node_modules/.cache/babel-loader/
                        // directory for faster rebuilds.
                        cacheDirectory: true,
                    },
                },

                {
                    test: /\.(graphql|gql)$/,
                    exclude: /node_modules/,
                    loader: 'graphql-tag/loader'
                },
                


                // {
                //     test: /\.css$/, // css-loader for external styles without css-modules
                //     include: /node_modules/,
                //     use: [
                //         { loader: 'style-loader' },
                //         { loader: 'css-loader' }
                //     ]
                // },
                {
                    test: /\.(sa|sc|c)ss$/,
                    include: path.appSrc,
                    // exclude: /node_modules/,
                    use: [
                        isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                // modules: 'global', // Enables global scoped CSS by default
                                // And it doesn't work apparently.
                                sourceMap: true,
                                importLoaders: 1, // how many loaders were used before css-loader
                                // localIdentName: cssIdentName
                                // getLocalIdent: (loaderContext, localIdentName, localName, options) => {
                                //     const fileName = path.basename(loaderContext.resourcePath)
                                //     if(fileName.indexOf('global.scss') !== -1){
                                //       return localName
                                //     }else{
                                //       const name = fileName.replace(/\.[^/.]+$/, "")
                                //       return `${name}__${localName}`
                                //     }
                                // }
                            },
                        },
                        // 'postcss-loader',
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: true,
                            }
                        }
                    ],
                },
                
                {
                    test: /\.(woff|woff2)$/,
                    use: {
                        loader: 'url-loader',
                        options: {
                            name: 'fonts/[hash].[ext]',
                            limit: 5000,
                            mimetype: 'application/font-woff'
                        }
                    }
                },
                {
                    test: /\.(ttf|eot|svg)$/,
                    use: {
                        loader: 'file-loader',
                        options: {
                            name: 'fonts/[hash].[ext]'
                        }
                    }
                }
                // In production it's recommended to extract the style sheets into a dedicated file in production using the mini-css-extract-plugin. This way your styles are not dependent on JavaScript
            ]
        },


        plugins: [

            // Generates an `index.html` file with the <script> injected.
            new HtmlWebpackPlugin({
                inject: true,
                template: paths.appHtml,
            }),

            

            new MiniCssExtractPlugin({
                filename: "[name].css",
                chunkFilename: "[id].css"
            }),

            // Clean the build folder
            // new CleanWebpackPlugin(cleanPaths),

            // Generate Manifest
            new ManifestPlugin(),
        ],
    };




    const devConfig = {
        mode: "development",
        devtool: 'inline-source-map',

        // entry: {
            
        // },

        devServer: {
            contentBase: './build',

            // Enable history API fallback so HTML5 History API based
            // routing works. This is a good default that will come
            // in handy in more complicated setups.
            historyApiFallback: true,
            
            // https: true,

            // Unlike the cli flag, this doesn't set
            // HotModuleReplacementPlugin!
            hot: true,

            // stats: 'errors-only',

            host: devServerHost, // Defaults to `localhost`
            port: devServerPort, // Defaults to 8080

            proxy: devServerProxyConfig
        },

        plugins: [
            
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify('development')
            }),
            // This is necessary to emit hot updates (currently CSS only):
            new webpack.HotModuleReplacementPlugin()
        ]
    }

    const ssrBundleConfig = {
        output: {
            path: paths.appBuild,
            filename: '[name].bundle.js',
            libraryTarget: 'commonjs'
        }
    }

    let config = baseConfig

    if (!isProduction) {
        console.log("Switching to dev config")
        config = merge(
            config,
            devConfig
        )
    }
    else {
        config = merge(
            config,
            {
                // optimization: {
                //     splitChunks: {
                //         chunks: 'all'
                //     }
                // },
                plugins: [
                    new webpack.DefinePlugin({
                        'process.env.NODE_ENV': JSON.stringify('production')
                    }),
                ]
            }
        )
    }

    if (isSSRBuild) {
        config = merge(
            config,
            ssrBundleConfig
        )
    }
    

    return config
}
