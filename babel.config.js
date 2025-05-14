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
						"@components/*": ["./src/components/*"],
						"@libs/*": ["./src/lib/*"],
						"@utils/*": ["./src/utils/*"],
						"@hooks/*": ["./hooks/*"],
						"@screens/*": ["./src/screens/*"],
						"@types/*": ["./src/types/*"],
						"@screens": ["./src/screens/*"],
						"@(donor)": ["./src/screens/(donor)/*"],
						"@(ngo)": ["./src/screens/(ngo)/*"],
						"@(volunteer)": ["./src/screens/(volunteer)/*"],
					},
				},
			],
		],
	}
}

