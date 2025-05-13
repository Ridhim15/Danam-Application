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
import { supabase } from "./initSupabase"
import { useNavigation } from "@react-navigation/native"
import { MainTabsParamList } from "./types/navigation"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"

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

				// Simplify query to only include fields we know exist
				const { data, error } = await supabase
					.from("users")
					.select("name, email, role, address, updated_at")
					.eq("auth_user_id", session.user.id)
					.single()
				
				if (error && error.code !== "PGRST116") throw error
				
				if (data) {
					const prefill = {
						username: data.name ?? "",
						email: data.email ?? session.user.email ?? "",
						role: data.role ?? "",
						phone: "", // Default to empty string as phone_no doesn't exist
						address: data.address ?? "",
					}
					console.log("Prefilled data:", prefill)
					setForm(prefill)
					
					// Consider profile complete if name and email are present
					const complete = !!prefill.username.trim() && !!prefill.email.trim() && !!prefill.role.trim()
					setProfileComplete(complete)
					
					// If profile is already complete, redirect to MainTabs with Home tab
					if (complete) {
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
			
			// Build an object with only the fields we need to update
			const userData: any = {
				auth_user_id: session.user.id,
				name: form.username,
				email: form.email,
				role: form.role,
				updated_at: new Date().toISOString(),
			}
			
			// Add additional properties only if your database has these columns
			if (form.address) {
				userData.address = form.address
			}
			
			const { error } = await supabase.from("users").upsert(userData)
			if (error) throw error
			
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
				<ActivityIndicator size='large' color='#2196F3' />
			</View>
		)
	}

	if (profileComplete) {
		return (
			<View style={styles.loadingContainer}>
				<Text style={styles.messageText}>Profile is already complete!</Text>
				<Text style={styles.submessageText}>Redirecting to Home...</Text>
				<ActivityIndicator size='large' color='#2196F3' style={{ marginTop: 20 }} />
			</View>
		)
	}

	return (
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			<ScrollView contentContainerStyle={styles.container}>
				<Text style={styles.title}>Complete Your Profile</Text>
				<Text style={styles.subtitle}>
					Please provide the missing information to complete your profile. This will help us provide you with a better experience.
				</Text>
				
				<View style={styles.inputGroup}>
					<Text style={styles.label}>Username</Text>
					<TextInput
						style={styles.input}
						value={form.username}
						onChangeText={text => setForm(f => ({ ...f, username: text }))}
						placeholder='Enter your name'
						autoCapitalize='words'
					/>
				</View>

				<View style={styles.inputGroup}>
					<Text style={styles.label}>Email</Text>
					<TextInput
						style={styles.input}
						value={form.email}
						onChangeText={text => setForm(f => ({ ...f, email: text }))}
						placeholder='Enter your email'
						keyboardType='email-address'
						autoCapitalize='none'
						autoCorrect={false}
						maxLength={100}
					/>
				</View>

				<View style={styles.inputGroup}>
					<View style={styles.roleRow}>
						<Text style={styles.label}>Role</Text>
						<View style={styles.roleButtonsContainer}>
							{roles.map(r => (
								<TouchableOpacity
									key={r}
									style={[styles.roleButton, form.role === r && styles.roleButtonSelected]}
									onPress={() => setForm(f => ({ ...f, role: r }))}
								>
									<Text
										style={[
											styles.roleButtonText,
											form.role === r && styles.roleButtonTextSelected,
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
					/>
				</View>

				<View style={styles.inputGroup}>
					<Text style={styles.label}>Phone Number *</Text>
					<View style={styles.phoneInputContainer}>
						<TouchableOpacity
							style={[styles.input, styles.countryCodeInput]}
							onPress={() => setShowCountryModal(true)}
						>
							<Text>{selectedCountry.code}</Text>
						</TouchableOpacity>
						<TextInput
							style={[styles.input, styles.phoneInput]}
							value={
								form.phone.startsWith(selectedCountry.code)
									? form.phone.slice(selectedCountry.code.length)
									: form.phone
							}
							onChangeText={text => {
								const cleanText = text.replace(/[^0-9]/g, "").slice(0, 10)
								setForm(prev => ({
									...prev,
									phone: selectedCountry.code + cleanText,
								}))
							}}
							placeholder='Phone number'
							keyboardType='phone-pad'
							maxLength={10}
						/>
					</View>
				</View>
				<TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
					<Text style={styles.submitButtonText}>{submitting ? "Submitting..." : "Complete Profile"}</Text>
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
		backgroundColor: "#F5F5F5",
		padding: 24,
		justifyContent: "center",
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#F5F5F5",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#2196F3",
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
		color: "#2196F3",
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
		backgroundColor: "#E3F2FD",
		paddingVertical: 10,
		paddingHorizontal: 14,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: "#BBDEFB",
		flex: 1,
		marginHorizontal: 5,
		alignItems: "center",
		maxWidth: "30%",
	},
	roleButtonSelected: {
		backgroundColor: "#1976D2",
		borderColor: "#1976D2",
	},
	roleButtonText: {
		color: "#2196F3",
		fontWeight: "600",
		fontSize: 13,
		letterSpacing: 0.4,
	},
	roleButtonTextSelected: {
		color: "white",
		fontWeight: "700",
	},
	submitButton: {
		backgroundColor: "#1976D2",
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
	userRole: {
		fontSize: 14,
		color: "#666",
		marginBottom: 8,
	},
	highlightText: {
		color: "#2196F3",
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
		backgroundColor: "#E3F2FD",
	},
	modalOptionText: {
		fontSize: 16,
	},
	selectedOptionText: {
		color: "#1976D2",
		fontWeight: "bold",
	},
	modalDoneButton: {
		marginTop: 10,
		backgroundColor: "#1976D2",
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