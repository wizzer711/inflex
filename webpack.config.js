let path = require('path');

let webpack = require('webpack');

let ExtractTextWebpackPlugin = require("extract-text-webpack-plugin");

let CopyWebpackPlugin = require('copy-webpack-plugin');

let OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');

let Bump = require("bump-webpack-plugin");

module.exports = {

    entry: {
        'inflex': ['./src/js/inflex.js', './src/less/inflex.less'],
        'inflex.min': ['./src/js/inflex.js', './src/less/inflex.less'],
    },

    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'js/[name].js',
        library: 'Inflex',
        libraryTarget: 'umd'
    },

    watchOptions: {
        
        ignored: /node_modules/
    },

    module: {

        rules: [

            { 
                
                test: /\.js$/,

                exclude: /node_modules/,

                use: [{
                    loader: "babel-loader"
                }, {
                    loader: "jshint-loader"
                }]
            },

            {

                test: /\.less$/,

                use: ExtractTextWebpackPlugin.extract({
                    use: [{
                    loader: "css-loader"
                    }, {
                        loader: "postcss-loader", options: {
                            plugins: function() {
                                return [require('autoprefixer')]
                            }
                        }
                    }, {
                        loader: "less-loader", options: {
                            paths: [
                                './src/less/imports'
                            ]
                        }
                    }],
                    fallback: 'style-loader'

                })
            }

        ]

    },

    plugins: [

        new ExtractTextWebpackPlugin({
    
            filename: './css/[name].css'
        }),

        new CopyWebpackPlugin([{
            from: './node_modules/material-design-icons/iconfont/',
            to: 'fonts/icons/',
            toType: 'dir'
        }],
        {
            ignore: ['*.md', 'codepoints', '*.css']
        }),

        new OptimizeCssAssetsWebpackPlugin({

            assetNameRegExp: /\.min\.css$/,
            cssProcessorOptions: { discardComments: { removeAll: false } }
        }),

        new webpack.optimize.UglifyJsPlugin({

            include: /\.min\.js$/,
            exclude: /node_modules/,
            minimize: true
        })
    ]
  
};

if (process.env.NODE_BUMP === 'true'){

    module.exports.plugins.push(

        new Bump([

            'package.json'
        ])
    );

}