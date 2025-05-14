import React from "react"
import { Image, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native"
import { router } from "expo-router"

const RoleScreen = () => {
	return (
		<View style={styles.container}>
			<Image source={require("@assets/images/dalla.png")} style={styles.logo} />
			<Text style={styles.title}>Welcome to Danam!</Text>
			<Text style={styles.subtitle}>How would you like to contribute?</Text>

			<TouchableOpacity 
				style={[styles.button, styles.donorButton]}
				onPress={() => router.push("/(donor)/Home")}
			>
				<Text style={styles.buttonText}>I am a Donor</Text>
			</TouchableOpacity>

			<TouchableOpacity 
				style={[styles.button, styles.ngoButton]}
				onPress={() => {
					Alert.alert(
						"Feature Coming Soon",
						"The NGO dashboard is currently under development. We'll redirect you to the main screen for now.",
						[
							{ 
								text: "OK", 
								onPress: () => router.push("/(donor)/Home")
							}
						]
					);
				}}
			>
				<Text style={styles.buttonText}>I am an NGO</Text>
			</TouchableOpacity>

			<TouchableOpacity 
				style={[styles.button, styles.volunteerButton]}
				onPress={() => router.push("/(volunteer)/Volunteer")}
			>
				<Text style={styles.buttonText}>I am a Volunteer</Text>
			</TouchableOpacity>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#F3E5F5", // Soft Lavender
		paddingHorizontal: 20,
	},
	logo: {
		width: 150, // Enlarged logo
		height: 150,
		marginBottom: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#6A1B9A", // Deep Purple
		marginBottom: 10,
	},
	subtitle: {
		fontSize: 16,
		color: "#9575CD", // Soft Purple
		marginBottom: 20,
		textAlign: "center",
	},
	button: {
		width: "80%",
		padding: 15,
		marginVertical: 8,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		textAlign: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 3,
	},
	donorButton: {
		backgroundColor: "#AB47BC", // Medium Purple
	},
	ngoButton: {
		backgroundColor: "#8E24AA", // Dark Purple
	},
	volunteerButton: {
		backgroundColor: "#7B1FA2", // Rich Purple
	},
	buttonText: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#FFFFFF",
	},
})

export default RoleScreen

