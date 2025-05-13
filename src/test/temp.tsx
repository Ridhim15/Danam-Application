import React from "react"
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useNavigation } from '@react-navigation/native'

const SchedulePickupScreen = () => {
	const navigation = useNavigation();
	
	const handleSchedulePickup = () => {
		navigation.navigate('MainTabs');
	};

	return (
		<ScrollView style={styles.container}>
			{/* Pickup Details */}
			<View style={styles.section}>
				<TouchableOpacity style={styles.row}>
					<Text style={styles.label}>Address</Text>
					<Text style={styles.value}>Add Donor address</Text>
				</TouchableOpacity>

				<TouchableOpacity style={styles.row}>
					<Text style={styles.label}>Pickup</Text>
					<Text style={styles.value}>Free | Standard | 3-4 days</Text>
				</TouchableOpacity>

				<TouchableOpacity style={styles.row}>
					<Text style={styles.label}>Details of Donor</Text>
					<Text style={styles.value}>Name</Text>
				</TouchableOpacity>

				<TouchableOpacity style={styles.row}>
					<Text style={styles.label}>Select NGO</Text>
					<Text style={[styles.value, styles.dropdownPlaceholder]}>
						#Dropdown with nearest NGOs
					</Text>
				</TouchableOpacity>
			</View>

			{/* Items List */}
			<View style={styles.itemSection}>
				<Text style={styles.itemHeader}>ITEMS</Text>
				<Text style={styles.itemHeader}>DESCRIPTION</Text>
				<Text style={styles.itemHeader}>Quantity</Text>
			</View>

			{[
				{ name: "Product name", qty: 10, img: require("../../assets/images/cooking.png") },
				{ name: "Product name", qty: 8, img: require("../../assets/images/cooking.png") },
			].map((item, index) => (
				<View key={index} style={styles.itemRow}>
					<Image source={item.img} style={styles.itemImage} />
					<View style={styles.itemDetails}>
						<Text style={styles.brandText}>Brand</Text>
						<Text style={styles.itemName}>{item.name}</Text>
						<Text style={styles.itemDescription}>Description</Text>
					</View>
					<Text style={styles.quantity}>{item.qty}</Text>
				</View>
			))}

			{/* Summary */}
			<View style={styles.summary}>
				<View style={styles.summaryRow}>
					<Text style={styles.summaryText}>Subtotal (2)</Text>
					<Text style={styles.summaryText}>$0</Text>
				</View>
				<View style={styles.summaryRow}>
					<Text style={styles.summaryText}>Shipping total</Text>
					<Text style={styles.summaryText}>Free</Text>
				</View>
				<View style={styles.summaryRow}>
					<Text style={styles.summaryText}>Taxes</Text>
					<Text style={styles.summaryText}>0</Text>
				</View>
				<View style={styles.summaryRow}>
					<Text style={styles.totalText}>Total</Text>
					<Text style={styles.totalText}>0</Text>
				</View>
			</View>

			{/* Schedule Pickup Button */}
			<TouchableOpacity onPress={handleSchedulePickup} style={styles.scheduleButton}>
				<Text style={styles.scheduleButtonText}>Schedule PickUp</Text>
			</TouchableOpacity>
		</ScrollView>
	)
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#F4ECFF", // Soft Lavender Background
		flex: 1,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: "#6A1B9A", // Deep Purple
		paddingVertical: 15,
		paddingHorizontal: 20,
	},
	headerText: {
		fontSize: 18,
		fontWeight: "bold",
		color: "white",
	},
	section: {
		backgroundColor: "#FFFFFF",
		margin: 15,
		borderRadius: 10,
		padding: 15,
		elevation: 2,
	},
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#E0E0E0",
	},
	label: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#4A148C", // Dark Purple
	},
	value: {
		fontSize: 14,
		color: "#757575",
	},
	dropdownPlaceholder: {
		color: "#9E9E9E", // Grey
		fontStyle: "italic",
	},
	itemSection: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: 15,
		paddingVertical: 8,
		backgroundColor: "#EDE7F6", // Light Purple
		marginHorizontal: 15,
		borderRadius: 10,
		marginTop: 5,
	},
	itemHeader: {
		fontSize: 14,
		fontWeight: "bold",
		color: "#4A148C", // Deep Purple
	},
	itemRow: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#FFFFFF",
		marginHorizontal: 15,
		marginTop: 10,
		padding: 10,
		borderRadius: 10,
		elevation: 2,
	},
	itemImage: {
		width: 50,
		height: 50,
		borderRadius: 8,
	},
	itemDetails: {
		flex: 1,
		paddingLeft: 10,
	},
	brandText: {
		fontSize: 12,
		color: "#9E9E9E",
	},
	itemName: {
		fontSize: 14,
		fontWeight: "bold",
		color: "#4A148C",
	},
	itemDescription: {
		fontSize: 12,
		color: "#757575",
	},
	quantity: {
		fontSize: 14,
		fontWeight: "bold",
		color: "#4A148C",
	},
	summary: {
		backgroundColor: "#FFFFFF",
		margin: 15,
		padding: 15,
		borderRadius: 10,
		elevation: 2,
	},
	summaryRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: 4,
	},
	summaryText: {
		fontSize: 14,
		color: "#6A1B9A",
	},
	totalText: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#4A148C",
	},
	scheduleButton: {
		backgroundColor: "#4A14BC",
		paddingVertical: 12,
		borderRadius: 25,
		marginHorizontal: 20,
		marginBottom: 20,
		justifyContent: "center",
		alignItems: "center",
		alignSelf: "center", // Ensure centering within parent
		width: "90%", // Adjust width for proper centering
	},
	scheduleButtonText: {
		fontSize: 16,
		fontWeight: "bold",
		color: "white",
		textAlign: "center", // Ensures text is centered
		width: "100%", // Forces text to take full width
	},
})

export default SchedulePickupScreen;

