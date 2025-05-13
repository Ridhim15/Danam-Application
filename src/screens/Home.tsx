import { StatusBar } from "expo-status-bar"
import React from "react"
import { SafeAreaView } from "react-native"
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useNavigation } from '@react-navigation/native'
import { Link, router } from "expo-router"

const HomeScreen = () => {
	const navigation = useNavigation();

	const handleDonatePress = () => {
		// Using the navigate method with the screen name directly
		navigation.navigate("SchedulePickup")
	};

	return (
		<SafeAreaView>
			<ScrollView contentContainerStyle={styles.container}>
				<StatusBar style='auto' />
				{/* Header */}
				<Text style={styles.header}>Danam</Text>
				{/* Slideshow Image */}
				<Image source={require("../../assets/images/nange.jpg")} style={styles.slideshowImage} />
				{/* Subtitle */}
				<Text style={styles.subtitle}>
					Your Donations can change lives. Join us in our mission to help those in need
				</Text>
				{/* Donation Categories */}
				<View style={styles.gridContainer}>
					{[
						{ name: "Packaged Food", img: require("../../assets/images/paper-bag.png") },
						{ name: "Books", img: require("../../assets/images/book.png") },
						{ name: "Clothes", img: require("../../assets/images/brand.png") },
						{ name: "E-Waste", img: require("../../assets/images/ewaste.png") },
					].map((item, index) => (
						<View key={index} style={styles.gridItem}>
							<Image source={item.img} style={styles.gridImage} />
							<Text style={styles.gridText}>{item.name}</Text>
						</View>
					))}
				</View>
				<TouchableOpacity style={styles.donateButton} onPress={handleDonatePress}>
					<Text style={styles.donateButtonText}>Donate Now</Text>
				</TouchableOpacity>
				{/* Nearest NGOs */}
				<View style={styles.ngoContainer}>
					<Text style={styles.ngoTitle}>Nearest NGO's</Text>
					{[
						{ name: "Kalpvriksh - Ek Chota Prayas NGO", email: "kalpvriksh@ngo.org", img: require("../../assets/images/dalla.png") },
						{ name: "GARV - a genius and real voice NGO", email: "garv@ngo.org", img: require("../../assets/images/dalla.png") },
						{ name: "Self Awakening Mission NGO", email: "selfawakening@ngo.org", img: require("../../assets/images/dalla.png") },
						{ name: "Scope for Change", email: "scopeforchange@ngo.org", img: require("../../assets/images/dalla.png") },
						{ name: "Guru daani foundation", email: "gurudaani@foundation.org", img: require("../../assets/images/dalla.png") },
					].map((ngo, index) => (
						<View key={index} style={styles.ngoItem}>
							<Image source={ngo.img} style={styles.ngoImage} />
							<View>
								<Text style={styles.ngoName}>{ngo.name}</Text>
								<Text style={styles.ngoEmail}>{ngo.email}</Text>
							</View>
						</View>
					))}
				</View>
			</ScrollView>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		paddingVertical: 20,
		backgroundColor: "#F4ECFF", // Light Purple Background
	},
	header: {
		fontSize: 22,
		fontWeight: "bold",
		color: "#4A148C", // Deep Purple
		marginBottom: 10,
	},
	slideshowImage: {
		width: "90%",
		height: 150,
		borderRadius: 10,
		marginBottom: 15,
	},
	subtitle: {
		fontSize: 16,
		color: "#6A1B9A", // Medium Purple
		textAlign: "center",
		marginBottom: 20,
		paddingHorizontal: 20,
	},
	gridContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-around",
		width: "100%",
	},
	gridItem: {
		width: "40%",
		backgroundColor: "#EDE7F6", // Soft Purple Card Background
		borderRadius: 10,
		alignItems: "center",
		padding: 10,
		marginVertical: 10,
	},
	gridImage: {
		width: 80,
		height: 80,
		marginBottom: 8,
		borderRadius: 8,
	},
	gridText: {
		fontSize: 14,
		fontWeight: "bold",
		color: "#4A148C", // Deep Purple
	},
	ngoContainer: {
		width: "90%",
		backgroundColor: "#FFF",
		borderRadius: 10,
		padding: 15,
		marginTop: 20,
	},
	ngoTitle: {
		fontSize: 17, // Reduced from 18
		fontWeight: "bold",
		color: "#4A148C", // Deep Purple
		marginBottom: 10,
	},
	ngoItem: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 15,
	},
	ngoImage: {
		width: 40,
		height: 40,
		borderRadius: 20,
		marginRight: 10,
	},
	ngoName: {
		fontSize: 15, // Reduced from 16
		fontWeight: "bold",
		color: "#6A1B9A", // Medium Purple
	},
	donateButton: {
		backgroundColor: "#D1C4E9", // Light Purple
		paddingVertical: 12,
		paddingHorizontal: 30,
		borderRadius: 25,
		marginTop: 20,
		elevation: 3, // Shadow effect for Android
		shadowColor: "#000", // Shadow for iOS
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 3,
	},
	donateButtonText: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#333", // Dark text
	},
	ngoEmail: {
		fontSize: 13, // Reduced from 14
		color: "#757575", // Grey
	},
})

export default HomeScreen

