import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { supabase } from "../initSupabase";
import { ActivityIndicator, View, Text, ScrollView, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import SecondScreen from "../screens/SecondScreen";
import MainTabs from "./MainTabs";
import ProfileDetailsScreen from "../prof_details";
import SchedulePickupScreen from "../screens/schedule";
import PickupScheduledScreen from "../screens/pickupScheduled";
import RoleScreen from "../screens/role";
import WelcomeScreen from "../screens/WelcomeScreen";
import VolunteerScreen from "../screens/Volunteer";
import NGODashboard from "../screens/(ngo)/NGODashboard";
import VolunteerProfile from "../screens/(volunteer)/VolunteerProfile";

// Key for storing profile completion status
const PROFILE_COMPLETED_KEY = "profile_completed_status";

const MainStack = createNativeStackNavigator();
const Main = () => {
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    const checkProfileStatus = async () => {
      try {
        // First check AsyncStorage for profile completion flag
        const storedProfileStatus = await AsyncStorage.getItem(PROFILE_COMPLETED_KEY);
        
        if (storedProfileStatus === "true") {
          // User has previously completed their profile, skip the form
          setProfileComplete(true);
          setLoading(false);
          return;
        }
        
        // No saved flag, check database for profile data
        const session = supabase.auth.session();
        
        if (!session?.user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("users")
          .select("name, role")
          .eq("auth_user_id", session.user.id)
          .single();
        
        if (error && error.code !== "PGRST116") {
          console.error("Error checking profile:", error);
          setProfileComplete(false);
        } else if (data) {
          // Consider profile complete if basic fields are filled
          const isComplete = !!data.name?.trim() && !!data.role?.trim();
          
          if (isComplete) {
            // Store completion status for future app launches
            await AsyncStorage.setItem(PROFILE_COMPLETED_KEY, "true");
          }
          
          setProfileComplete(isComplete);
        } else {
          // No profile data found
          setProfileComplete(false);
        }
      } catch (error) {
        console.error("Error checking profile:", error);
        setProfileComplete(false);
      } finally {
        setLoading(false);
      }
    };

    checkProfileStatus();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' }}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={profileComplete ? "WelcomeBack" : "ProfileDetails"}
    >
      <MainStack.Screen name="WelcomeBack" component={WelcomeScreen} />
      <MainStack.Screen name="RoleSelect" component={RoleScreen} />
      <MainStack.Screen name="MainTabs" component={MainTabs} />
      <MainStack.Screen name="ProfileDetails" component={ProfileDetailsScreen} />
      <MainStack.Screen name="SecondScreen" component={SecondScreen} />
      <MainStack.Screen name="SchedulePickup" component={SchedulePickupScreen} />
      <MainStack.Screen name="PickupScheduled" component={PickupScheduledScreen} />
      <MainStack.Screen name="Volunteer" component={VolunteerScreen} />
      <MainStack.Screen name="VolunteerProfile" component={VolunteerProfile} />
      <MainStack.Screen name="NGODashboard" component={NGODashboard} />
    </MainStack.Navigator>
  );
};

export default Main;
