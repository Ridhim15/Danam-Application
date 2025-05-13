import React from "react"
import { View } from "react-native"
import { MainStackParamList } from "../types/navigation"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { Layout, Text, Button } from "react-native-rapi-ui"
import { supabase } from "../initSupabase"

export default function ({ navigation }: NativeStackScreenProps<MainStackParamList, "MainTabs">) {
	async function handleLogout() {
		await supabase.auth.signOut()
	}
	return (
		<Layout>
			<View
				style={{
					flex: 1,
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<Text>This is the Profile tab</Text>
				<Button
					text='Logout'
					status='danger'
					style={{ marginTop: 20, width: 200 }}
					onPress={handleLogout}
				/>
			</View>
		</Layout>
	)
}

