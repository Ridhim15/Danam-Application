import { Tabs } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

export default function TabsLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
			}}
		>
			<Tabs.Screen
				name='Community'
				options={{
					title: "Community",
					tabBarIcon: ({ size, color }) => (
						<Ionicons name='people-outline' size={size} color={color ?? "#4A148C"} />
					),
				}}
			/>

			<Tabs.Screen
				name='index'
				options={{
					title: "Home",
					tabBarIcon: ({ size, color }) => (
						<Ionicons name='home' size={size} color={color ?? "#4A148C"} />
					),
				}}
			/>
			<Tabs.Screen
				name='Profile'
				options={{
					title: "Profile",
					tabBarIcon: ({ size, color }) => (
						<Ionicons name='person-outline' size={size} color={color ?? "#4A148C"} />
					),
				}}
			/>
		</Tabs>
	)
}

