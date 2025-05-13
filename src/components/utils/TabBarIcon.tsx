import React from "react"
import { themeColor, useTheme } from "react-native-rapi-ui"
import { Ionicons } from "@expo/vector-icons"

export default ({ icon, focused }: { icon: any; focused: boolean }) => {
	return (
		<Ionicons
			name={icon}
			style={{ marginBottom: -7 }}
			size={24}
			color={
				focused
					? "#6A5ACD" // Strong purple for active
					: "#B39DDB" // Light purple for inactive
			}
		/>
	)
}

