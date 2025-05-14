import { Ionicons } from "@expo/vector-icons"
import React, { useEffect, useState } from "react"
import {
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	ActivityIndicator,
	Alert,
} from "react-native"
import { Session } from "@supabase/supabase-js"
import { supabase } from "../../initSupabase"
import { SafeAreaView } from "react-native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { MainStackParamList, AuthStackParamList } from "../../types/navigation"

// User profile interface based on the actual database schema with nullable fields
interface UserProfile {
	id?: number
	name?: string
	email?: string
	role?: string
	auth_user_id: string
	address?: string
	phone?: string
}

// If there's a language context in your app, uncomment and import it
// import { useLanguage } from "@context/LanguageContext"

export default function ({ navigation }: NativeStackScreenProps<MainStackParamList & AuthStackParamList, "MainTabs">) {
	const [session, setSession] = useState<Session | null>(null)
	const [profile, setProfile] = useState<UserProfile | null>(null)
	const [loading, setLoading] = useState(true)
	
	// If there's no language context, provide a simple alternative
	const [language, setLanguage] = useState("en")
	// Simple translation function
	const t = (key: string): string => {
		const translations: {[key: string]: {[key: string]: string}} = {
			en: {
				myProfile: "My Profile",
				logout: "Logout",
				logoutConfirmation: "Are you sure you want to logout?",
				cancel: "Cancel",
				logoutError: "Error logging out",
				error: "Error",
				user: "User",
				notProvided: "Not Provided",
				age: "Age:",
				notAdded: "N/A",
				editProfile: "Edit Profile",
				contactInformation: "Contact Information",
				phone: "Phone",
				address: "Address",
			},
			hi: {
				myProfile: "मेरी प्रोफाइल",
				logout: "लॉगआउट",
				logoutConfirmation: "क्या आप लॉगआउट करना चाहते हैं?",
				cancel: "रद्द करें",
				logoutError: "लॉगआउट करने में त्रुटि",
				error: "त्रुटि",
				user: "उपयोगकर्ता",
				notProvided: "प्रदान नहीं किया गया",
				age: "उम्र:",
				notAdded: "उपलब्ध नहीं",
				
				editProfile: "प्रोफाइल संपादित करें",
				
				
				contactInformation: "संपर्क जानकारी",
				phone: "फोन",
				address: "पता",
			}
		}
		return translations[language][key] || key
	}

	useEffect(() => {
		fetchUserProfile()
	}, [])

	const fetchUserProfile = async () => {
		try {
			// Get current session using Supabase v1 method
			const currentSession = supabase.auth.session()
			setSession(currentSession)

			if (currentSession?.user) {
				// Query for user profile data
				const { data, error } = await supabase
					.from("users")
					.select("*") // Make sure we're getting all fields including phone
					.eq("auth_user_id", currentSession.user.id)
					
				if (error) {
					console.error("Error fetching user profile:", error)
				}
				
				// Check if we got any results back
				if (data && data.length > 0) {
					console.log("User profile data fetched:", data[0]) // Log the retrieved profile data
					setProfile(data[0])
				} else {
					// Create a minimal profile with just the auth user ID and email
					const minimalProfile: UserProfile = {
						auth_user_id: currentSession.user.id,
						email: currentSession.user.email,
					}
					setProfile(minimalProfile)
					
					console.log("No profile found for this user. Using minimal profile.")
				}
			}
		} catch (error) {
			console.error("Error fetching profile:", error)
		} finally {
			setLoading(false)
		}
	}

	const handleLogout = async () => {
		Alert.alert(
			t("logout"),
			t("logoutConfirmation"),
			[
				{ text: t("cancel"), style: "cancel" },
				{
					text: t("logout"),
					style: "destructive",
					onPress: async () => {
						try {
							setLoading(true)
							const { error } = await supabase.auth.signOut()
							if (error) throw error
							// Navigate as per your routing structure
							navigation.navigate("Login" as never)
						} catch (error) {
							console.error("Error logging out:", error)
							Alert.alert(t("error"), t("logoutError"))
						} finally {
							setLoading(false)
						}
					},
				},
			],
			{ cancelable: true }
		)
	}

	const toggleLanguage = () => {
		setLanguage(language === "en" ? "hi" : "en")
	}

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size='large' color='#6A1B9A' />
			</View>
		)
	}

	// Get the user's name from profile or session metadata
	const userName = profile?.name || session?.user?.user_metadata?.name || t("user")

	return (
		<View style={styles.container}>
			{/* Header Section with Curved Bottom */}
			<View style={styles.headerBackground}>
				<View style={styles.headerContainer}>
					<Text style={styles.headerTitle}>{t("myProfile")}</Text>
					<View style={styles.headerButtons}>
						<TouchableOpacity onPress={toggleLanguage} style={styles.languageButton}>
							<Ionicons name='language' size={24} color='white' />
							<Text style={styles.buttonText}>{language.toUpperCase()}</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
							<Ionicons name='log-out-outline' size={24} color='white' />
							<Text style={styles.buttonText}>{t("logout")}</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>

			{/* Content Section */}
			<ScrollView
				showsVerticalScrollIndicator={false}
				style={styles.scrollView}
				contentContainerStyle={styles.scrollViewContent}
			>
				{/* Profile Card - Overlapping with Header */}
				<View style={styles.profileCard}>
					<View style={styles.profileCardContent}>
						<View style={styles.profileImageContainer}>
							<Image
								source={
									session?.user?.user_metadata?.picture
										? { uri: session.user.user_metadata.picture }
										: require("@assets/images/profile_def_m.png")
								}
								style={styles.profileImage}
							/>
						</View>

						<View style={styles.profileDetails}>
							<Text style={styles.userName}>{userName}</Text>
							<Text style={styles.userRole}>
								{(profile?.email || session?.user?.email || t("notProvided"))?.replace(/[{}]/g, "")}
							</Text>
							<Text style={[styles.userRole, styles.highlightText]}>
								{(profile?.role || session?.user?.user_metadata?.role || t("notProvided"))
									.toLowerCase()
									.replace(/^\w/, (c: string) => c.toUpperCase())}
							</Text>
							<View style={styles.quickInfoRow}>
								{/* Since age isn't in our schema, we'll display a placeholder */}
								<Text style={styles.userDetail}>
									{t("age")} {t("notAdded")}
								</Text>
								{/* Since blood_group isn't in pour schema, we'll display a placeholder */}
								
							</View>
							<TouchableOpacity 
								style={styles.editProfileButton} 
								onPress={() => navigation.navigate("ProfileDetails", { isEditMode: true, returnScreen: "MainTabs", userRole: "Donor" })}
							>
								<Text style={styles.editProfileText}>{t("editProfile")}</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>

				{/* We'll keep these sections as placeholders since they're not in the schema */}
				

				<View style={styles.infoCard}>
					<Text style={styles.sectionTitle}>{t("contactInformation")}</Text>
					<View style={styles.infoRow}>
						<Text style={styles.infoLabel}>{t("phone")}</Text>
						<Text style={styles.infoValue}>
							{profile?.phone || t("notProvided")}
						</Text>
					</View>
					<View style={styles.infoRow}>
						<Text style={styles.infoLabel}>{t("address")}</Text>
						<Text style={styles.infoValue}>
							{profile?.address || t("notProvided")}
						</Text>
					</View>
				</View>
			</ScrollView>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F4ECFF", // Updated to match Home.tsx theme
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#F4ECFF", // Updated to match Home.tsx theme
	},
	headerBackground: {
		backgroundColor: "#4A148C", // Updated from blue to Deep Purple
		height: 170,
		borderBottomLeftRadius: 0,
		borderBottomRightRadius: 0,
		overflow: "hidden",
		paddingTop: 10,
	},
	headerContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 16,
		paddingTop: 48,
		paddingBottom: 24,
	},
	headerTitle: {
		fontSize: 24,
		color: "white",
		fontWeight: "bold",
	},
	headerButtons: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	languageButton: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 20,
		gap: 6,
	},
	buttonText: {
		color: "white",
		fontWeight: "600",
		fontSize: 14,
	},
	logoutButton: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 20,
	},
	scrollView: {
		flex: 1,
		marginTop: -60, // Pulls content up to create overlap
	},
	scrollViewContent: {
		paddingBottom: 30,
	},
	profileCard: {
		backgroundColor: "white",
		marginHorizontal: 16,
		marginTop: 0, // The overlap is now handled by the ScrollView's marginTop
		borderRadius: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.2,
		shadowRadius: 10,
		elevation: 8,
		padding: 16,
		zIndex: 10, // Ensures the card is above other elements
	},
	profileCardContent: {
		flexDirection: "row",
		alignItems: "center",
	},
	profileImageContainer: {
		marginRight: 16,
	},
	profileImage: {
		width: 100,
		height: 100,
		borderRadius: 50,
		borderWidth: 3,
		borderColor: "#6A1B9A", // Updated from blue to Medium Purple
	},
	profileDetails: {
		flex: 1,
	},
	userName: {
		fontSize: 22,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 4,
	},
	userRole: {
		fontSize: 14,
		color: "#666",
		marginBottom: 8,
	},
	quickInfoRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		flexWrap: "wrap",
		marginBottom: 12,
	},
	userDetail: {
		fontSize: 14,
		color: "#666",
		marginBottom: 4,
	},
	highlightText: {
		color: "#6A1B9A", // Updated from blue to Medium Purple
		fontWeight: "bold",
	},
	editProfileButton: {
		backgroundColor: "#4A148C", // Updated from blue to Deep Purple
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderRadius: 20,
		alignSelf: "flex-start",
	},
	editProfileText: {
		color: "white",
		fontSize: 14,
		fontWeight: "600",
	},
	infoCard: {
		backgroundColor: "white",
		borderRadius: 16,
		padding: 16,
		margin: 16,
		marginTop: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
	},
	medicalInfoCard: {
		minHeight: 200, // Give more space to medical info
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: "#333",
		marginBottom: 16,
	},
	infoRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: "#F0F0F0",
	},
	infoLabel: {
		fontSize: 16,
		color: "#666",
		marginBottom: 8,
	},
	infoValue: {
		fontSize: 16,
		color: "#333",
		fontWeight: "500",
		flex: 2,
		textAlign: "right",
	},
	diseasesContainer: {
		padding: 8,
	},
	diseasesList: {
		flexDirection: "row",
		flexWrap: "wrap",
		marginTop: 8,
	},
	diseaseItem: {
		backgroundColor: "#EDE7F6", // Updated to Soft Purple
		borderRadius: 20,
		paddingVertical: 8,
		paddingHorizontal: 16,
		marginRight: 8,
		marginBottom: 8,
		borderWidth: 1,
		borderColor: "#D1C4E9", // Updated to Light Purple
	},
	diseaseText: {
		color: "#6A1B9A", // Updated from blue to Medium Purple
		fontWeight: "500",
	},
	noDataText: {
		fontSize: 16,
		color: "#999",
		fontStyle: "italic",
		marginTop: 8,
	},
})

