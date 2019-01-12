const withTypescript = require("@zeit/next-typescript");
const withCSS = require("@zeit/next-css");
const withSass = require('@zeit/next-sass')
const withGraphql = require('next-plugin-graphql')

if (typeof require !== "undefined") {
  require.extensions[".css"] = file => {};
}

module.exports = withTypescript(withGraphql(withSass(withCSS())));