import React from "react"
import { useNavigation, useRoute } from "@react-navigation/native"
import ProfileDetailsComponent, { UserProfileForm } from "../components/ProfileDetailsComponent"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { MainTabsParamList } from "../types/navigation"

const ProfileDetailsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainTabsParamList>>()
  const route = useRoute()
  // Extract params if any (e.g., isEditMode, userRole)
  const params = (route as any).params || {}
  return (
    <ProfileDetailsComponent
      isEditMode={!!params.isEditMode}
      userRole={params.userRole}
      onComplete={() => {
        if (params.returnScreen) {
          navigation.navigate(params.returnScreen)
        } else {
          navigation.navigate("Home")
        }
      }}
    />
  )
}

export default ProfileDetailsScreen