module.exports = function (api) {
	api.cache(true)
	return {
		presets: ["babel-preset-expo"],
		plugins: [
			[
				"module-resolver",
				{
					extensions: [".js", ".jsx", ".ts", ".tsx"],
					alias: {
						"@": "./",
						"@assets/*": ["./assets/*"],
						"@components/*": ["./components/*"],
						"@libs/*": ["./lib/*"],
						"@utils/*": ["./utils/*"],
						"@hooks/*": ["./hooks/*"],
						"@screens/*": ["./screens/*"],
						"@types/*": ["./types/*"],
					},
				},
			],
		],
	}
}

