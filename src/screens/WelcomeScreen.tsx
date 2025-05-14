import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Animated, 
  Dimensions,
  SafeAreaView
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../initSupabase";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState("there");
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  useEffect(() => {
    // Fetch user's name if available
    const fetchUserName = async () => {
      try {
        const session = supabase.auth.session();
        if (session?.user) {
          const { data, error } = await supabase
            .from("users")
            .select("name")
            .eq("auth_user_id", session.user.id)
            .single();
          
          if (!error && data?.name) {
            setUserName(data.name.split(" ")[0]); // Get first name
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserName();

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto navigate after a delay (optional)
    const timer = setTimeout(() => {
      handleContinue();
    }, 3000);

    return () => clearTimeout(timer);
  }, [fadeAnim, slideAnim]);

  const handleContinue = () => {
    router.push("/role");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={[
          styles.content, 
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }] 
          }
        ]}
      >
        <Image 
          source={require("@assets/images/banner.png")} 
          style={styles.logo} 
        />
        
        <View style={styles.textContainer}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>{userName}!</Text>
          <Text style={styles.subtitleText}>
            Thank you for being part of our community making a difference.
          </Text>
        </View>

        <View style={styles.impactContainer}>
          <Text style={styles.impactTitle}>Your Impact So Far</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Donations</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>NGOs Helped</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>85</Text>
              <Text style={styles.statLabel}>Lives Impacted</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4ECFF", // Light purple background
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 24,
  },
  textContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 26,
    color: "#4A148C", // Deep Purple
    fontWeight: "500",
  },
  nameText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#6A1B9A", // Medium Purple
    marginBottom: 16,
  },
  subtitleText: {
    fontSize: 16,
    color: "#9575CD", // Soft Purple
    textAlign: "center",
    lineHeight: 24,
  },
  impactContainer: {
    width: "100%",
    backgroundColor: "#EDE7F6", // Soft Purple
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  impactTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A148C", // Deep Purple
    marginBottom: 16,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6A1B9A", // Medium Purple
  },
  statLabel: {
    fontSize: 14,
    color: "#9575CD", // Soft Purple
    marginTop: 4,
  },
  button: {
    backgroundColor: "#6A1B9A", // Medium Purple
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default WelcomeScreen;