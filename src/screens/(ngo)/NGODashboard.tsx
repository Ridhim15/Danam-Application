import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../initSupabase";

const volunteers = [
  {
    name: "Rahul Sharma",
    email: "rahul@volunteer.org",
    avatar: require("@assets/images/profile_def_m.png"),
    area: "North Delhi",
  },
  {
    name: "Priya Singh",
    email: "priya@volunteer.org",
    avatar: require("@assets/images/profile_def_m.png"),
    area: "South Delhi",
  },
  {
    name: "Amit Kumar",
    email: "amit@volunteer.org",
    avatar: require("@assets/images/profile_def_m.png"),
    area: "East Delhi",
  },
];

export default function NGODashboard({ navigation }: any) {
  const [activeTab, setActiveTab] = useState("home");
  const [donationStats, setDonationStats] = useState({
    food: 0,
    books: 0,
    clothes: 0,
    medical: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [ngoList, setNgoList] = useState<string[]>([]);
  const [selectedNgo, setSelectedNgo] = useState<string>("");
  const [showNgoModal, setShowNgoModal] = useState(false);

  useEffect(() => {
    // Fetch unique NGO names from the donation table
    const fetchNgos = async () => {
      const { data, error } = await supabase
        .from("donation")
        .select("ngo")
        .neq("ngo", null);
      if (!error && data) {
        const uniqueNgos = Array.from(new Set(data.map((row) => row.ngo).filter(Boolean)));
        setNgoList(uniqueNgos);
        if (uniqueNgos.length > 0 && !selectedNgo) setSelectedNgo(uniqueNgos[0]);
      }
    };
    fetchNgos();
  }, []);

  useEffect(() => {
    if (!selectedNgo) return;
    const fetchDonationStats = async () => {
      setLoadingStats(true);
      try {
        // Fetch all donations for the selected NGO
        const { data, error } = await supabase
          .from("donation")
          .select("meds, books, clothes, food")
          .eq("ngo", selectedNgo);
        if (error) throw error;
        let food = 0,
          books = 0,
          clothes = 0,
          medical = 0;
        data.forEach((row) => {
          food += row.food || 0;
          books += row.books || 0;
          clothes += row.clothes || 0;
          medical += row.meds || 0;
        });
        setDonationStats({ food, books, clothes, medical });
      } catch (e) {
        setDonationStats({ food: 0, books: 0, clothes: 0, medical: 0 });
      } finally {
        setLoadingStats(false);
      }
    };
    fetchDonationStats();
  }, [selectedNgo]);

  const donationItems = [
    {
      name: "Packaged Food",
      icon: "fast-food-outline",
      count: donationStats.food,
      color: "#F8D3A7",
      img: require("@assets/images/paper-bag.png"),
    },
    {
      name: "Books",
      icon: "book-outline",
      count: donationStats.books,
      color: "#FF6B6B",
      img: require("@assets/images/book.png"),
    },
    {
      name: "Clothes",
      icon: "shirt-outline",
      count: donationStats.clothes,
      color: "#FFB347",
      img: require("@assets/images/brand.png"),
    },
    {
      name: "Medical Aid",
      icon: "medkit-outline",
      count: donationStats.medical,
      color: "#77DD77",
      img: require("@assets/images/medicine.png"),
    },
  ];

  const totalDonations = donationItems.reduce((sum, item) => sum + item.count, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danam</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* NGO Info */}
        <View style={styles.ngoInfoContainer}>
          <Image
            source={require("@assets/images/logo.svg")}
            style={styles.ngoAvatar}
            resizeMode="cover"
          />
          <View style={{ flex: 1 }}>
            {/* Custom Dropdown for NGO Name */}
            <TouchableOpacity
              style={{ paddingVertical: 10, paddingHorizontal: 12, backgroundColor: '#f5f0ff', borderRadius: 8, borderWidth: 1, borderColor: '#8a4baf', marginBottom: 4 }}
              onPress={() => setShowNgoModal(true)}
              activeOpacity={0.7}
            >
              <Text style={{ color: '#8a4baf', fontWeight: 'bold', fontSize: 18 }}>
                {selectedNgo || 'Select NGO'}
              </Text>
            </TouchableOpacity>
            {/* Modal for NGO List */}
            {showNgoModal && (
              <View style={{ position: 'absolute', top: 50, left: 0, right: 0, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#8a4baf', zIndex: 100 }}>
                <ScrollView style={{ maxHeight: 200 }}>
                  {ngoList.map((ngo, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={{ padding: 12, borderBottomWidth: idx < ngoList.length - 1 ? 1 : 0, borderBottomColor: '#eee' }}
                      onPress={() => {
                        setSelectedNgo(ngo);
                        setShowNgoModal(false);
                      }}
                    >
                      <Text style={{ color: '#4A148C', fontWeight: selectedNgo === ngo ? 'bold' : 'normal' }}>{ngo}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity onPress={() => setShowNgoModal(false)} style={{ padding: 10, alignItems: 'center' }}>
                  <Text style={{ color: '#8a4baf', fontWeight: 'bold' }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
            <Text style={styles.ngoEmail}>{selectedNgo ? `${selectedNgo}@ngo.org` : ''}</Text>
          </View>
        </View>
        {/* Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={require("@assets/images/school kids.jpg")}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerText}>
              Your Donations can change lives. Join us in our mission to help those in need
            </Text>
          </View>
        </View>
        {/* Donation Stats */}
        <Text style={styles.sectionTitle}>Donation Statistics</Text>
        {loadingStats ? (
          <View style={{ alignItems: "center", marginVertical: 20 }}>
            <Text>Loading stats...</Text>
          </View>
        ) : (
          <View style={styles.statsGrid}>
            {donationItems.map((item, idx) => (
              <View key={idx} style={[styles.statCard, { backgroundColor: item.color }]}>
                <Image source={item.img} style={styles.statIcon} />
                <Text style={styles.statName}>{item.name}</Text>
                <Text style={styles.statCount}>{item.count}</Text>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${totalDonations > 0 ? (item.count / totalDonations) * 100 : 0}%`,
                        backgroundColor: "#8a4baf",
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        )}
        {/* Total Donations */}
        <View style={styles.totalCard}>
          <Text style={styles.totalTitle}>Total Donations</Text>
          <Text style={styles.totalCount}>{totalDonations}</Text>
        </View>
        {/* Volunteers List */}
        <Text style={styles.sectionTitle}>List of Volunteers</Text>
        <View style={styles.volunteerCard}>
          {volunteers.map((vol, idx) => (
            <View
              key={idx}
              style={[
                styles.volunteerRow,
                idx < volunteers.length - 1 && styles.volunteerRowBorder,
              ]}
            >
              <Image source={vol.avatar} style={styles.volunteerAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.volunteerName}>{vol.name}</Text>
                <Text style={styles.volunteerEmail}>{vol.email}</Text>
                <Text style={styles.volunteerArea}>Area: {vol.area}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      {/* Bottom Navigation */}
      {/* <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab("community")}
        >
          <Ionicons
            name="people-outline"
            size={24}
            color={activeTab === "community" ? "#8a4baf" : "#888"}
          />
          <Text
            style={[
              styles.navText,
              activeTab === "community" && styles.navTextActive,
            ]}
          >
            Community
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab("home")}
        >
          <Ionicons
            name="home-outline"
            size={24}
            color={activeTab === "home" ? "#8a4baf" : "#888"}
          />
          <Text
            style={[
              styles.navText,
              activeTab === "home" && styles.navTextActive,
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab("profile")}
        >
          <Ionicons
            name="person-outline"
            size={24}
            color={activeTab === "profile" ? "#8a4baf" : "#888"}
          />
          <Text
            style={[
              styles.navText,
              activeTab === "profile" && styles.navTextActive,
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f0ff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#8a4baf",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerPercent: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 6,
  },
  headerCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  ngoInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  ngoAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#8a4baf",
    marginRight: 12,
  },
  ngoName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8a4baf",
  },
  ngoEmail: {
    fontSize: 14,
    color: "#666",
  },
  bannerContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    height: 140,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  bannerText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8a4baf",
    marginLeft: 16,
    marginTop: 10,
    marginBottom: 6,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: 16,
    gap: 10,
  },
  statCard: {
    width: "47%",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    marginBottom: 6,
  },
  statName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#8a4baf",
    marginBottom: 2,
  },
  statCount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  progressBarBg: {
    width: "100%",
    height: 6,
    backgroundColor: "#e0d7f3",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  totalCard: {
    backgroundColor: "#8a4baf",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    marginTop: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  totalTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  totalCount: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  volunteerCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 24,
    paddingVertical: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  volunteerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  volunteerRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  volunteerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  volunteerName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#8a4baf",
  },
  volunteerEmail: {
    fontSize: 13,
    color: "#666",
  },
  volunteerArea: {
    fontSize: 12,
    color: "#999",
  },
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#e0d7f3",
    backgroundColor: "#fff",
    height: 60,
    alignItems: "center",
    justifyContent: "space-around",
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  navText: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
    fontWeight: "600",
  },
  navTextActive: {
    color: "#8a4baf",
  },
});
