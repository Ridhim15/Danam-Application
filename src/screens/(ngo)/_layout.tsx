import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import NGODashboard from "./NGODashboard";
import { View, Text } from "react-native";

// Placeholder screens for Community and Profile
const Community = () => (
  <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
    <Text>Community Page</Text>
  </View>
);
const Profile = () => (
  <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
    <Text>Profile Page</Text>
  </View>
);

const Tab = createBottomTabNavigator();

// This component is NOT automatically used by react-navigation.
// To use this layout, you must import and use it as a screen in your MainStack (in MainStack.tsx)
export default function NGOLayout() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#8a4baf",
        tabBarInactiveTintColor: "#888",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#e0d7f3",
          height: 60,
        },
        tabBarIcon: ({ color }) => {
          if (route.name === "Community")
            return <Ionicons name="people-outline" size={24} color={color} />;
          if (route.name === "Home")
            return <Ionicons name="home-outline" size={24} color={color} />;
          if (route.name === "Profile")
            return <Ionicons name="person-outline" size={24} color={color} />;
          return null;
        },
      })}
    >
      <Tab.Screen name="Community" component={Community} />
      <Tab.Screen name="Home" component={NGODashboard} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
