import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";

// Dummy user profile interface for frontend only
interface UserProfile {
  name?: string;
  email?: string;
  role?: string;
  address?: string;
  phone?: string;
}

const VolunteerProfile: React.FC = () => {
  // Dummy state for demonstration
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("en");
  const [profile] = useState<UserProfile>({
    name: "Volunteer Name",
    email: "volunteer@email.com",
    role: "Volunteer",
    address: "123 Main St, City, Country",
    phone: "+91 9876543210",
  });

  const t = (key: string): string => {
    const translations: { [key: string]: { [key: string]: string } } = {
      en: {
        myProfile: "My Profile",
        logout: "Logout",
        editProfile: "Edit Profile",
        contactInformation: "Contact Information",
        phone: "Phone",
        address: "Address",
        user: "User",
        notProvided: "Not Provided",
        age: "Age:",
        notAdded: "N/A",
      },
      hi: {
        myProfile: "मेरी प्रोफाइल",
        logout: "लॉगआउट",
        editProfile: "प्रोफाइल संपादित करें",
        contactInformation: "संपर्क जानकारी",
        phone: "फोन",
        address: "पता",
        user: "उपयोगकर्ता",
        notProvided: "प्रदान नहीं किया गया",
        age: "उम्र:",
        notAdded: "उपलब्ध नहीं",
      },
    };
    return translations[language][key] || key;
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "hi" : "en");
  };

  const handleLogout = () => {
    Alert.alert(t("logout"), "Logout pressed (frontend only)");
  };

  const handleEditProfile = () => {
    Alert.alert(t("editProfile"), "Edit Profile pressed (frontend only)");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6A1B9A" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Section with Curved Bottom */}
      <View style={styles.headerBackground}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>{t("myProfile")}</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={toggleLanguage} style={styles.languageButton}>
              <Ionicons name="language" size={24} color="white" />
              <Text style={styles.buttonText}>{language.toUpperCase()}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={24} color="white" />
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
                source={require("@assets/images/profile_def_m.png")}
                style={styles.profileImage}
              />
            </View>

            <View style={styles.profileDetails}>
              <Text style={styles.userName}>{profile.name || t("user")}</Text>
              <Text style={styles.userRole}>{profile.email || t("notProvided")}</Text>
              <Text style={[styles.userRole, styles.highlightText]}>
                {(profile.role || t("notProvided")).toLowerCase().replace(/^[a-z]/, c => c.toUpperCase())}
              </Text>
              <View style={styles.quickInfoRow}>
                {/* Since age isn't in our schema, we'll display a placeholder */}
                <Text style={styles.userDetail}>
                  {t("age")} {t("notAdded")}
                </Text>
              </View>
              <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
                <Text style={styles.editProfileText}>{t("editProfile")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Contact Info Section */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>{t("contactInformation")}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t("phone")}</Text>
            <Text style={styles.infoValue}>{profile.phone || t("notProvided")}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t("address")}</Text>
            <Text style={styles.infoValue}>{profile.address || t("notProvided")}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4ECFF", // Match Home.tsx theme
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4ECFF",
  },
  headerBackground: {
    backgroundColor: "#4A148C",
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
    marginTop: -60,
  },
  scrollViewContent: {
    paddingBottom: 30,
  },
  profileCard: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginTop: 0,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    padding: 16,
    zIndex: 10,
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
    borderColor: "#6A1B9A",
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
    color: "#6A1B9A",
    fontWeight: "bold",
  },
  editProfileButton: {
    backgroundColor: "#4A148C",
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
});

export default VolunteerProfile;
