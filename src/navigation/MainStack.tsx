import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { supabase } from "../initSupabase";
import { ActivityIndicator, View } from "react-native";

import SecondScreen from "../screens/SecondScreen";
import MainTabs from "./MainTabs";
import ProfileDetailsScreen from "../prof_details";

const MainStack = createNativeStackNavigator();
const Main = () => {
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    const checkProfileStatus = async () => {
      try {
        const session = supabase.auth.session();
        
        if (!session?.user) {
          setLoading(false);
          return;
        }

        // Simplify the query to just check if a user record exists with essential fields
        const { data, error } = await supabase
          .from("users")
          .select("name, email, role")
          .eq("auth_user_id", session.user.id)
          .single();
        
        if (error && error.code !== "PGRST116") {
          console.error("Error checking profile status:", error);
        }
        
        // Consider the profile complete if we have the basic information
        const isComplete = data && !!data.name?.trim() && !!data.email?.trim();
        
        setProfileComplete(isComplete);
      } catch (error) {
        console.error("Error checking profile:", error);
      } finally {
        setLoading(false);
      }
    };

    checkProfileStatus();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={profileComplete ? "MainTabs" : "ProfileDetails"}
    >
      <MainStack.Screen name="ProfileDetails" component={ProfileDetailsScreen} />
      <MainStack.Screen name="MainTabs" component={MainTabs} />
      <MainStack.Screen name="SecondScreen" component={SecondScreen} />
    </MainStack.Navigator>
  );
};

export default Main;
