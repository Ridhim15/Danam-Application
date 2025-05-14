import React from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"

import { themeColor, useTheme } from "react-native-rapi-ui"
import TabBarIcon from "../components/utils/TabBarIcon"
import TabBarText from "../components/utils/TabBarText"

import Home from "../screens/(donor)/Home"
import About from "../screens/About"
import Profile from "../screens/(donor)/Profile"
import ProfileDetailsScreen from "../prof_details"
import CommunityScreen from "../screens/Community" // Import from screens directory

const Tabs = createBottomTabNavigator()
const MainTabs = () => {
	const { isDarkmode } = useTheme()
	return (
		<Tabs.Navigator
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: "#6A5ACD", // Strong purple for active tab
				tabBarInactiveTintColor: "#B39DDB", // Light purple for inactive tab
				tabBarStyle: {
					borderTopColor: "#9575CD", // Medium purple border
					backgroundColor: "#F3EFFF", // Very light purple background
				},
			}}
		>
			{/* these icons using Ionicons */}
			<Tabs.Screen
				name='Community'
				component={CommunityScreen} // Using the CommunityScreen from screens directory
				options={{
					tabBarLabel: ({ focused }) => <TabBarText focused={focused} title='Community' />,
					tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} icon={"people-outline"} />,
				}}
			/>
			<Tabs.Screen
				name='Home'
				component={Home}
				options={{
					tabBarLabel: ({ focused }) => <TabBarText focused={focused} title='Home' />,
					tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} icon={"home"} />,
				}}
			/>
			<Tabs.Screen
				name='Profile'
				component={Profile}
				options={{
					tabBarLabel: ({ focused }) => <TabBarText focused={focused} title='Profile' />,
					tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} icon={"person-outline"} />,
				}}
			/>
		</Tabs.Navigator>
	)
}

export default MainTabs

