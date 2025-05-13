import React, { useEffect, useState } from "react"
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Alert,
	ActivityIndicator,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	Modal,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { supabase } from "./initSupabase"
import { useNavigation } from "@react-navigation/native"
import { MainTabsParamList } from "./types/navigation"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"

// Key for storing profile completion status - must match MainStack.tsx
const PROFILE_COMPLETED_KEY = "profile_completed_status"

interface UserProfileForm {
	username: string
	email: string
	role: string
	phone: string
	address: string
}

const roles = ["Doner", "NGO", "Volunteer"]

const countryCodes = [
	{ name: "India", code: "+91" },
	{ name: "United States", code: "+1" },
	{ name: "United Kingdom", code: "+44" },
	{ name: "Canada", code: "+1" },
	{ name: "Australia", code: "+61" },
	{ name: "China", code: "+86" },
	{ name: "Japan", code: "+81" },
	{ name: "Germany", code: "+49" },
	{ name: "France", code: "+33" },
	{ name: "Italy", code: "+39" },
	{ name: "Spain", code: "+34" },
	{ name: "Brazil", code: "+55" },
	{ name: "Mexico", code: "+52" },
	{ name: "Russia", code: "+7" },
	{ name: "South Korea", code: "+82" },
]

type ProfileNavigationProp = NativeStackNavigationProp<MainTabsParamList, 'Home'>

const ProfileDetailsScreen = () => {
	const navigation = useNavigation<ProfileNavigationProp>()
	const [form, setForm] = useState<UserProfileForm>({
		username: "",
		email: "",
		role: "",
		phone: "",
		address: "",
	})
	const [loading, setLoading] = useState(true)
	const [submitting, setSubmitting] = useState(false)
	const [profileComplete, setProfileComplete] = useState(false)
	const [selectedCountry, setSelectedCountry] = useState(countryCodes[0])
	const [showCountryModal, setShowCountryModal] = useState(false)
	const [countrySearch, setCountrySearch] = useState("")
	const [isEditMode, setIsEditMode] = useState(false)

	// Check if profile is complete
	const isProfileComplete = (profile: UserProfileForm): boolean => {
		return (
			!!profile.username.trim() &&
			!!profile.email.trim() &&
			!!profile.role.trim() &&
			!!profile.phone.trim() &&
			!!profile.address.trim()
		)
	}

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const session = supabase.auth.session()
				if (!session?.user) {
					// Not logged in, navigate away
					Alert.alert("Error", "You must be logged in to access this page")
					setLoading(false)
					return
				}

				// Check if this form was opened from Edit Profile button
				const params = navigation.getState().routes.find(r => r.name === 'ProfileDetails')?.params
				const editMode = params && params.isEditMode
				setIsEditMode(!!editMode)

				// Simplify query to only include fields we know exist
				const { data, error } = await supabase
					.from("users")
					.select("name, email, role, address, phone, updated_at")
					.eq("auth_user_id", session.user.id)
					.single()
				
				if (error && error.code !== "PGRST116") throw error
				
				if (data) {
					const prefill = {
						username: data.name ?? "",
						email: data.email ?? session.user.email ?? "",
						role: data.role ?? "",
						phone: data.phone ?? "", // Use phone from database
						address: data.address ?? "",
					}
					console.log("Prefilled data:", prefill)
					setForm(prefill)
					
					// Consider profile complete if name and email are present
					const complete = !!prefill.username.trim() && !!prefill.email.trim() && !!prefill.role.trim()
					setProfileComplete(complete)
					
					// If profile is already complete and we're not in edit mode, redirect to MainTabs with Home tab
					if (complete && !editMode) {
						setTimeout(() => {
							navigation.navigate('MainTabs', { screen: 'Home' })
						}, 1000)
					}
				} else {
					// New user, prefill email
					setForm(f => ({
						...f,
						email: session.user.email || "",
					}))
				}
			} catch (e) {
				Alert.alert("Error", "Could not fetch profile info.")
			} finally {
				setLoading(false)
			}
		}
		fetchProfile()
	}, [navigation])

	const validate = () => {
		if (!form.username.trim()) return "Username is required"
		if (!form.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
			return "Valid email is required"
		if (!form.role.trim()) return "Role is required"
		if (!form.address.trim()) return "Address is required"
		if (!form.phone.trim() || !/^\+\d{1,3}\d{10}$/.test(form.phone))
			return "Valid phone number with country code required"
		return null
	}

	const handleSubmit = async () => {
		const errorMsg = validate()
		if (errorMsg) {
			Alert.alert("Validation Error", errorMsg)
			return
		}
		setSubmitting(true)
		try {
			const session = supabase.auth.session()
			if (!session?.user) throw new Error("Not logged in")
			
			// First check if a user record already exists
			const { data: existingUser, error: fetchError } = await supabase
				.from("users")
				.select("id")
				.eq("auth_user_id", session.user.id)
				.single()
				
			if (fetchError && fetchError.code !== "PGRST116") {
				// Error other than "not found"
				throw fetchError
			}
			
			// Build an object with the user data to update
			const userData: any = {
				name: form.username,
				email: form.email,
				role: form.role,
				phone: form.phone, // Add phone to save to the database
				updated_at: new Date().toISOString(),
			}
			
			// Add additional properties only if your database has these columns
			if (form.address) {
				userData.address = form.address
			}
			
			let error = null
			
			if (existingUser) {
				// Update existing record
				console.log("Updating existing user record with ID:", existingUser.id)
				const { error: updateError } = await supabase
					.from("users")
					.update(userData)
					.eq("id", existingUser.id)
				error = updateError
			} else {
				// Create new record only if one doesn't exist
				console.log("Creating new user record")
				userData.auth_user_id = session.user.id // Add auth_user_id only for new records
				const { error: insertError } = await supabase
					.from("users")
					.insert(userData)
				error = insertError
			}
			
			if (error) throw error
			
			// Mark the profile as completed in AsyncStorage
			try {
				await AsyncStorage.setItem(PROFILE_COMPLETED_KEY, "true")
				console.log("Profile marked as completed in AsyncStorage")
			} catch (storageError) {
				console.error("Error saving to AsyncStorage:", storageError)
			}
			
			Alert.alert("Success", "Profile updated successfully!", [
				{
					text: "Continue",
					onPress: () => navigation.navigate('MainTabs', { screen: 'Home' })
				}
			])
		} catch (e: any) {
			Alert.alert("Error", e.message || "Could not update profile.")
		} finally {
			setSubmitting(false)
		}
	}

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size='large' color='#6A1B9A' />
			</View>
		)
	}

	if (profileComplete && !isEditMode) {
		return (
			<View style={styles.loadingContainer}>
				<Text style={styles.messageText}>Profile is already complete!</Text>
				<Text style={styles.submessageText}>Redirecting to Home...</Text>
				<ActivityIndicator size='large' color='#6A1B9A' style={{ marginTop: 20 }} />
			</View>
		)
	}

	const titleText = isEditMode ? "Edit Your Profile" : "Complete Your Profile"
	const submitButtonText = isEditMode ? "Update Profile" : "Complete Profile"
	const subtitleText = isEditMode 
		? "You can edit your profile information below."
		: "Please provide the missing information to complete your profile. This will help us provide you with a better experience."

	return (
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			<ScrollView contentContainerStyle={styles.container}>
				<Text style={styles.title}>{titleText}</Text>
				<Text style={styles.subtitle}>
					{subtitleText}
				</Text>
				
				<View style={styles.inputGroup}>
					<Text style={styles.label}>Username</Text>
					<TextInput
						style={styles.input}
						value={form.username}
						onChangeText={text => setForm(f => ({ ...f, username: text }))}
						placeholder='Enter your name'
						autoCapitalize='words'
						editable={true} // Always allow name editing
					/>
				</View>

				<View style={styles.inputGroup}>
					<Text style={styles.label}>Email</Text>
					<TextInput
						style={[styles.input, !isEditMode && !!form.email ? styles.disabledInput : null]}
						value={form.email}
						onChangeText={text => setForm(f => ({ ...f, email: text }))}
						placeholder='Enter your email'
						keyboardType='email-address'
						autoCapitalize='none'
						autoCorrect={false}
						maxLength={100}
						editable={isEditMode || !form.email} // Only allow editing if in edit mode or email is empty
					/>
				</View>

				<View style={styles.inputGroup}>
					<View style={styles.roleRow}>
						<Text style={styles.label}>Role</Text>
						<View style={styles.roleButtonsContainer}>
							{roles.map(r => (
								<TouchableOpacity
									key={r}
									style={[
										styles.roleButton, 
										form.role === r && styles.roleButtonSelected,
										!isEditMode && !!form.role && form.role !== r && styles.disabledButton
									]}
									onPress={() => isEditMode || !form.role ? setForm(f => ({ ...f, role: r })) : null}
									disabled={!isEditMode && !!form.role && form.role !== r}
								>
									<Text
										style={[
											styles.roleButtonText,
											form.role === r && styles.roleButtonTextSelected,
											!isEditMode && !!form.role && form.role !== r && styles.disabledButtonText
										]}
									>
										{r.charAt(0).toUpperCase() + r.slice(1)}
									</Text>
								</TouchableOpacity>
							))}
						</View>
					</View>
				</View>

				<View style={styles.inputGroup}>
					<Text style={styles.label}>Address</Text>
					<TextInput
						style={[styles.input, styles.multilineInput]}
						value={form.address}
						onChangeText={text => setForm(f => ({ ...f, address: text }))}
						placeholder='Enter your address'
						multiline={true}
						numberOfLines={2}
						textAlignVertical="top"
						editable={isEditMode || !form.address} // Only allow editing if in edit mode or address is empty
					/>
				</View>

				<View style={styles.inputGroup}>
					<Text style={styles.label}>Phone Number *</Text>
					<View style={styles.phoneInputContainer}>
						<TouchableOpacity
							style={[styles.input, styles.countryCodeInput]}
							onPress={() => (isEditMode || !form.phone) && setShowCountryModal(true)}
							disabled={!isEditMode && !!form.phone}
						>
							<Text>{selectedCountry.code}</Text>
						</TouchableOpacity>
						<TextInput
							style={[
								styles.input, 
								styles.phoneInput,
								!isEditMode && !!form.phone ? styles.disabledInput : null
							]}
							value={
								form.phone.startsWith(selectedCountry.code)
									? form.phone.slice(selectedCountry.code.length)
									: form.phone
							}
							onChangeText={text => {
								// Simplified phone input handler
								const cleanText = text.replace(/[^0-9]/g, "")
								setForm(prev => ({
									...prev,
									phone: selectedCountry.code + cleanText,
								}))
							}}
							placeholder='Phone number'
							keyboardType='phone-pad'
							maxLength={10}
							editable={true} // Always allow editing
						/>
					</View>
				</View>
				<TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
					<Text style={styles.submitButtonText}>{submitting ? "Submitting..." : submitButtonText}</Text>
				</TouchableOpacity>
				<Modal
					visible={showCountryModal}
					transparent={true}
					animationType='slide'
					onRequestClose={() => setShowCountryModal(false)}
				>
					<View style={styles.modalContainer}>
						<View style={styles.modalContent}>
							<Text style={styles.modalTitle}>Select Country</Text>
							<TextInput
								style={[styles.input, styles.searchInput]}
								placeholder='Search countries...'
								value={countrySearch}
								onChangeText={setCountrySearch}
								autoCapitalize='none'
							/>
							<ScrollView style={styles.diseasesList}>
								{countryCodes
									.filter(
										country =>
											country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
											country.code.includes(countrySearch)
									)
									.map((country, index) => (
										<TouchableOpacity
											key={`country-${index}-${country.code}`}
											style={[
												styles.modalOption,
												selectedCountry.code === country.code && styles.selectedOption,
											]}
											onPress={() => {
												setSelectedCountry(country)
												setForm(f => ({
													...f,
													phone: country.code + f.phone.replace(/^\+\d+/, ""),
												}))
												setShowCountryModal(false)
												setCountrySearch("")
											}}
										>
											<Text
												style={[
													styles.modalOptionText,
													selectedCountry.code === country.code && styles.selectedOptionText,
												]}
											>
												{country.name} ({country.code})
											</Text>
										</TouchableOpacity>
									))}
							</ScrollView>
							<TouchableOpacity
								style={styles.modalDoneButton}
								onPress={() => {
									setShowCountryModal(false)
									setCountrySearch("")
								}}
							>
								<Text style={styles.modalDoneText}>Done</Text>
							</TouchableOpacity>
						</View>
					</View>
				</Modal>
			</ScrollView>
		</KeyboardAvoidingView>
	)
}

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		backgroundColor: "#F4ECFF", // Updated to Light Purple
		padding: 24,
		justifyContent: "center",
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#F4ECFF", // Updated to Light Purple
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#4A148C", // Updated to Deep Purple
		marginBottom: 10,
		textAlign: "center",
	},
	subtitle: {
		fontSize: 16,
		color: "#666",
		marginBottom: 24,
		textAlign: "center",
		lineHeight: 22,
	},
	messageText: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#4A148C", // Updated to Deep Purple
		marginBottom: 8,
	},
	submessageText: {
		fontSize: 16,
		color: "#666",
	},
	inputGroup: {
		marginBottom: 18,
	},
	label: {
		fontSize: 16,
		color: "#333",
		marginBottom: 6,
	},
	input: {
		backgroundColor: "white",
		padding: 12,
		borderRadius: 8,
		fontSize: 16,
		borderWidth: 1,
		borderColor: "#DDD",
	},
	roleRow: {
		flexDirection: "column",
		alignItems: "flex-start",
		marginTop: 6,
		marginBottom: 10,
	},
	roleButtonsContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
		marginTop: 6,
	},
	roleButton: {
		backgroundColor: "#EDE7F6", // Updated to Soft Purple
		paddingVertical: 10,
		paddingHorizontal: 14,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: "#D1C4E9", // Updated to Light Purple
		flex: 1,
		marginHorizontal: 5,
		alignItems: "center",
		maxWidth: "30%",
	},
	roleButtonSelected: {
		backgroundColor: "#4A148C", // Updated to Deep Purple
		borderColor: "#4A148C", // Updated to Deep Purple
	},
	roleButtonText: {
		color: "#6A1B9A", // Updated to Medium Purple
		fontWeight: "600",
		fontSize: 13,
		letterSpacing: 0.4,
	},
	roleButtonTextSelected: {
		color: "white",
		fontWeight: "700",
	},
	submitButton: {
		backgroundColor: "#4A148C", // Updated to Deep Purple
		paddingVertical: 14,
		borderRadius: 24,
		alignItems: "center",
		marginTop: 10,
	},
	submitButtonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "bold",
		letterSpacing: 1,
	},
	disabledInput: {
		backgroundColor: "#E0E0E0",
		color: "#888",
		borderColor: "#BDBDBD",
	},
	disabledInputText: {
		color: "#888",
	},
	disabledButton: {
		backgroundColor: "#F5F5F5",
		borderColor: "#E0E0E0",
		opacity: 0.7,
	},
	disabledButtonText: {
		color: "#BDBDBD",
	},
	userRole: {
		fontSize: 14,
		color: "#666",
		marginBottom: 8,
	},
	highlightText: {
		color: "#6A1B9A", // Updated to Medium Purple
		fontWeight: "700",
	},
	phoneInputContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	countryCodeInput: {
		width: 80,
		alignItems: "center",
	},
	phoneInput: {
		flex: 1,
	},
	multilineInput: {
		textAlignVertical: "top",
	},
	modalContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.5)",
	},
	modalContent: {
		width: "80%",
		backgroundColor: "white",
		borderRadius: 8,
		padding: 20,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 10,
	},
	searchInput: {
		marginBottom: 10,
	},
	diseasesList: {
		maxHeight: 200,
	},
	modalOption: {
		paddingVertical: 10,
		paddingHorizontal: 15,
		borderBottomWidth: 1,
		borderBottomColor: "#EEE",
	},
	selectedOption: {
		backgroundColor: "#EDE7F6", // Updated to Soft Purple
	},
	modalOptionText: {
		fontSize: 16,
	},
	selectedOptionText: {
		color: "#4A148C", // Updated to Deep Purple
		fontWeight: "bold",
	},
	modalDoneButton: {
		marginTop: 10,
		backgroundColor: "#4A148C", // Updated to Deep Purple
		paddingVertical: 10,
		borderRadius: 8,
		alignItems: "center",
	},
	modalDoneText: {
		color: "white",
		fontSize: 16,
		fontWeight: "bold",
	},
})

export default ProfileDetailsScreen