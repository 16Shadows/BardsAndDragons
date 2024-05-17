module.exports = {
    resolve: {
        fallback: {
            "url": require.resolve("url/"),
            "https": require.resolve("https-browserify"),
            "http": require.resolve("stream-http"),
            "util": require.resolve("util/")
        }
    }
}