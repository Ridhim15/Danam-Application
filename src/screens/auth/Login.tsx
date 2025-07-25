import React, { useState } from "react"
import { StatusBar } from "expo-status-bar"
import { ScrollView, TouchableOpacity, View, KeyboardAvoidingView, Image } from "react-native"
import { supabase } from "../../initSupabase"
import { AuthStackParamList } from "../../types/navigation"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { router } from "expo-router"

import { Layout, Text, TextInput, Button, useTheme, themeColor } from "react-native-rapi-ui"

export default function ({ navigation }: NativeStackScreenProps<AuthStackParamList, "Login">) {
	const { isDarkmode, setTheme } = useTheme()
	const [email, setEmail] = useState<string>("")
	const [password, setPassword] = useState<string>("")
	const [loading, setLoading] = useState<boolean>(false)

	async function login() {
		setLoading(true)
		const { user, error } = await supabase.auth.signIn({
			email: email,
			password: password,
		})
		if (!error && !user) {
			setLoading(false)
			alert("Check your email for the login link!")
		}
		if (error) {
			setLoading(false)
			alert(error.message)
		}
	}
	return (
		<KeyboardAvoidingView behavior='height' enabled style={{ flex: 1 }}>
			<Layout>
				<ScrollView
					contentContainerStyle={{
						flexGrow: 1,
					}}
				>
					<View
						style={{
							justifyContent: "center",
							alignItems: "center",
							width: "100%",
							backgroundColor: isDarkmode ? "#17171E" : themeColor.white100,
						}}
					>
						<Image
							resizeMode='contain'
							style={{
								width: "100%",
								height: 220,
							}}
							source={require("@assets/images/banner.png")}
						/>
					</View>
					<View
						style={{
							flex: 3,
							paddingHorizontal: 20,
							paddingBottom: 20,
							backgroundColor: isDarkmode ? themeColor.dark : themeColor.white,
						}}
					>
						<Text
							fontWeight='bold'
							style={{
								alignSelf: "center",
								padding: 30,
							}}
							size='h3'
						>
							Login
						</Text>
						<Text>Email</Text>
						<TextInput
							containerStyle={{ marginTop: 15 }}
							placeholder='Enter your email'
							value={email}
							autoCapitalize='none'
							autoCorrect={false}
							keyboardType='email-address'
							onChangeText={text => setEmail(text)}
						/>

						<Text style={{ marginTop: 15 }}>Password</Text>
						<TextInput
							containerStyle={{ marginTop: 15 }}
							placeholder='Enter your password'
							value={password}
							autoCapitalize='none'
							autoCorrect={false}
							secureTextEntry={true}
							onChangeText={text => setPassword(text)}
						/>
						<Button
							text={loading ? "Loading" : "Continue"}
							onPress={() => {
								login()
							}}
							style={{
								marginTop: 20,
							}}
							disabled={loading}
						/>

						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								marginTop: 15,
								justifyContent: "center",
							}}
						>
							<Text size='md'>Don't have an account?</Text>
							<TouchableOpacity
								onPress={() => {
									router.push("/auth/Register")
								}}
							>
								<Text
									size='md'
									fontWeight='bold'
									style={{
										marginLeft: 5,
									}}
								>
									Register here
								</Text>
							</TouchableOpacity>
						</View>
						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								marginTop: 10,
								justifyContent: "center",
							}}
						>
							<TouchableOpacity
								onPress={() => {
									router.push("/auth/ForgetPassword")
								}}
							>
								<Text size='md' fontWeight='bold'>
									Forget password
								</Text>
							</TouchableOpacity>
						</View>
						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								marginTop: 30,
								justifyContent: "center",
							}}
						>
							<TouchableOpacity
								onPress={() => {
									isDarkmode ? setTheme("light") : setTheme("dark")
								}}
							>
								<Text
									size='md'
									fontWeight='bold'
									style={{
										marginLeft: 5,
									}}
								>
									{isDarkmode ? "☀️ light theme" : "🌑 dark theme"}
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</ScrollView>
			</Layout>
		</KeyboardAvoidingView>
	)
}

