import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  StatusBar,
  Platform
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../../initSupabase";
import { useNavigation } from "@react-navigation/native";

// Type for donation job
interface DonationJob {
  id: number;
  uid: string;
  meds: number;
  books: number;
  clothes: number;
  food: number;
  status: string;
  ngo: string;
  created_at: string;
  userName: string;
  userAddress: string;
  userPhone?: string; // add phone field
}

const VolunteerScreen = () => {
  const [jobs, setJobs] = useState<DonationJob[]>([]);
  const [acceptedJobs, setAcceptedJobs] = useState<DonationJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("notifications");
  const [showMyWork, setShowMyWork] = useState<boolean>(false);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // Function to get the primary donation type
  const getDonationType = (job: DonationJob): string => {
    const types = [
      { type: "Medicine", value: job.meds },
      { type: "Books", value: job.books },
      { type: "Clothes", value: job.clothes },
      { type: "Food", value: job.food },
    ];

    // Sort donation types by quantity
    types.sort((a, b) => b.value - a.value);

    // Return the type with highest quantity
    return types[0].value > 0 ? types[0].type : "Mixed";
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).replace(/\//g, '-');
  };

  // Format time for display
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  // Fetch all pending and accepted donation jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);

        // Query the donation table for pending donations
        const { data: pendingData, error: pendingError } = await supabase
          .from("donation")
          .select("*")
          .eq("status", "pending");

        if (pendingError) {
          console.error("Error fetching pending donations:", pendingError);
          return;
        }

        // Query the donation table for accepted donations
        const { data: acceptedData, error: acceptedError } = await supabase
          .from("donation")
          .select("*")
          .eq("status", "accepted");

        if (acceptedError) {
          console.error("Error fetching accepted donations:", acceptedError);
          return;
        }

        // Process pending jobs
        if (pendingData && pendingData.length > 0) {
          const pendingWithUserInfo = await Promise.all(
            pendingData.map(async (donation) => {
              // Get user details from the users table
              const { data: userData, error: userError } = await supabase
                .from("users")
                .select("name, address, phone") // fetch phone as well
                .eq("auth_user_id", donation.uid)
                .single();

              if (userError) {
                console.error("Error fetching user data:", userError);
                return {
                  ...donation,
                  userName: "User Name Not Set",
                  userAddress: "Not set by user",
                  userPhone: "Not set by user"
                };
              }

              return {
                ...donation,
                userName: userData?.name || "User Name Not Set",
                userAddress: userData?.address || "Not set by user",
                userPhone: userData?.phone || "Not set by user"
              };
            })
          );

          setJobs(pendingWithUserInfo);
        } else {
          setJobs([]);
        }

        // Process accepted jobs
        if (acceptedData && acceptedData.length > 0) {
          const acceptedWithUserInfo = await Promise.all(
            acceptedData.map(async (donation) => {
              // Get user details from the users table
              const { data: userData, error: userError } = await supabase
                .from("users")
                .select("name, address")
                .eq("auth_user_id", donation.uid)
                .single();

              if (userError) {
                console.error("Error fetching user data for accepted job:", userError);
                return {
                  ...donation,
                  userName: "Profile not found",
                  userAddress: "-"
                };
              }

              return {
                ...donation,
                userName: userData?.name || "Profile not found",
                userAddress: userData?.address || "-"
              };
            })
          );

          setAcceptedJobs(acceptedWithUserInfo);
        } else {
          setAcceptedJobs([]);
        }
      } catch (error) {
        console.error("Error in fetchJobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();

    // Set up a subscription to refresh jobs when the database changes
    const subscription = supabase
      .from("donation")
      .on("*", () => {
        fetchJobs();
      })
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeSubscription(subscription);
    };
  }, []);

  // Handle accepting a job
  const handleAcceptJob = async (jobId: number) => {
    try {
      // Update the job status to accepted
      const { error } = await supabase
        .from("donation")
        .update({ status: "accepted" })
        .eq("id", jobId);

      if (error) {
        console.error("Error accepting job:", error);
        Alert.alert("Error", "Failed to accept the job. Please try again.");
        return;
      }

      // Find the job that was accepted
      const acceptedJob = jobs.find(job => job.id === jobId);

      if (acceptedJob) {
        // Update local state - move job from pending to accepted
        setAcceptedJobs(prevAccepted => [...prevAccepted, { ...acceptedJob, status: "accepted" }]);
        setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
      }

      Alert.alert(
        "Success",
        "You have accepted this donation job!",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error in handleAcceptJob:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    }
  };

  // Handle marking a job as completed
  const handleMarkCompleted = async (jobId: number) => {
    try {
      // Update the job status to completed
      const { error } = await supabase
        .from("donation")
        .update({ status: "completed" })
        .eq("id", jobId);

      if (error) {
        console.error("Error marking job as completed:", error);
        Alert.alert("Error", "Failed to mark the job as completed. Please try again.");
        return;
      }

      // Update local state
      setAcceptedJobs(prevJobs =>
        prevJobs.map(job =>
          job.id === jobId
            ? { ...job, status: "completed" }
            : job
        )
      );

      Alert.alert(
        "Success",
        "Job marked as completed!",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error in handleMarkCompleted:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    }
  };

  // Go back to previous screen
  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#4A148C" barStyle="light-content" />

      {/* Header - Tabs with proper insets */}
      {showMyWork ? (
        // My Work Header with back button and proper insets
        <View style={[styles.myWorkHeader, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={() => setShowMyWork(false)} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.myWorkHeaderTitle}>My Work</Text>
        </View>
      ) : (
        // Main tabs header with proper insets
        <View style={[styles.tabs, { paddingTop: insets.top }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "notifications" && styles.activeTab]}
            onPress={() => setActiveTab("notifications")}
          >
            <Text style={[styles.tabText, activeTab === "notifications" && styles.activeTabText]}>Notifications</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "mywork" && styles.activeTab]}
            onPress={() => setActiveTab("mywork")}
          >
            <Text style={[styles.tabText, activeTab === "mywork" && styles.activeTabText]}>My Work</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content based on active tab */}
      {showMyWork ? (
        // My Work Detail View - Accepted Jobs
        <View style={styles.contentContainer}>
          <View style={styles.jobsSection}>
            <Text style={styles.jobsTitle}>Accepted Jobs</Text>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4A148C" />
                <Text style={styles.loadingText}>Loading jobs...</Text>
              </View>
            ) : acceptedJobs.length === 0 ? (
              <View style={styles.noJobsContainer}>
                <Text style={styles.noJobsText}>No accepted jobs</Text>
              </View>
            ) : (
              <ScrollView style={styles.jobsList} contentContainerStyle={styles.jobsListContent}>
                {acceptedJobs.map((job) => (
                  <View key={job.id} style={styles.acceptedJobCard}>
                    <Text style={styles.jobProfileTitle}>{job.userName}</Text>

                    <View style={styles.jobDetailRow}>
                      <Text style={styles.jobDetailLabel}>Address:</Text>
                      <Text style={styles.jobDetailValue}>{job.userAddress}</Text>
                    </View>

                    <View style={styles.jobDetailRow}>
                      <Text style={styles.jobDetailLabel}>Phone:</Text>
                      <Text style={styles.jobDetailValue}>-</Text>
                    </View>

                    <View style={styles.separator} />

                    <View style={styles.jobDetailRow}>
                      <Text style={styles.jobDetailLabel}>Service:</Text>
                      <Text style={styles.jobDetailValue}>{getDonationType(job)}</Text>
                    </View>

                    <View style={styles.jobDetailRow}>
                      <Text style={styles.jobDetailLabel}>Date:</Text>
                      <Text style={styles.jobDetailValue}>{formatDate(job.created_at)}</Text>
                    </View>

                    <View style={styles.jobDetailRow}>
                      <Text style={styles.jobDetailLabel}>Time:</Text>
                      <Text style={styles.jobDetailValue}>{formatTime(job.created_at)}</Text>
                    </View>

                    <View style={styles.jobDetailRow}>
                      <Text style={styles.jobDetailLabel}>Additional Info:</Text>
                      <Text style={styles.jobDetailValue}>-</Text>
                    </View>

                    {job.status === "accepted" ? (
                      <TouchableOpacity
                        style={styles.markCompletedButton}
                        onPress={() => handleMarkCompleted(job.id)}
                      >
                        <Text style={styles.markCompletedButtonText}>Mark as Completed</Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={styles.completedText}>Completed</Text>
                    )}
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      ) : (
        // Main tabs content
        <View style={styles.contentContainer}>
          {activeTab === "notifications" ? (
            // Available Jobs Section
            <View style={styles.jobsSection}>
              <Text style={styles.jobsTitle}>Available Donations</Text>

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4A148C" />
                  <Text style={styles.loadingText}>Loading donations...</Text>
                </View>
              ) : jobs.length === 0 ? (
                <View style={styles.noJobsContainer}>
                  <Text style={styles.noJobsText}>No pending donations available</Text>
                </View>
              ) : (
                <ScrollView style={styles.jobsList} contentContainerStyle={styles.jobsListContent}>
                  {jobs.map((job) => (
                    <View key={job.id} style={styles.availableJobCard}>
                      <View style={styles.jobHeader}>
                        <Image
                          source={require("@assets/images/profile_def_m.png")}
                          style={styles.userProfileImage}
                        />
                        <View style={styles.userInfo}>
                          <Text style={styles.userName}>{job.userName}</Text>
                          <Text style={styles.userId}>User ID: {job.uid.slice(0, 10)}...</Text>
                          <Text style={styles.pendingLabel}>Pending</Text>
                        </View>
                      </View>

                      <View style={styles.donationDetailsContainer}>
                        <Text style={styles.donationDetailsTitle}>Donation Items:</Text>
                        <View style={styles.donationItemsGrid}>
                          {job.meds > 0 && (
                            <View style={styles.donationItem}>
                              <Image
                                source={require("@assets/images/medicine.png")}
                                style={styles.donationItemIcon}
                              />
                              <Text style={styles.donationItemText}>Medicine: {job.meds}</Text>
                            </View>
                          )}
                          {job.books > 0 && (
                            <View style={styles.donationItem}>
                              <Image
                                source={require("@assets/images/book.png")}
                                style={styles.donationItemIcon}
                              />
                              <Text style={styles.donationItemText}>Books: {job.books}</Text>
                            </View>
                          )}
                          {job.clothes > 0 && (
                            <View style={styles.donationItem}>
                              <Image
                                source={require("@assets/images/laundry-machine.png")}
                                style={styles.donationItemIcon}
                              />
                              <Text style={styles.donationItemText}>Clothes: {job.clothes}</Text>
                            </View>
                          )}
                          {job.food > 0 && (
                            <View style={styles.donationItem}>
                              <Image
                                source={require("@assets/images/cooking.png")}
                                style={styles.donationItemIcon}
                              />
                              <Text style={styles.donationItemText}>Food: {job.food}</Text>
                            </View>
                          )}
                        </View>
                      </View>

                      <View style={styles.jobDetailRow}>
                        <Text style={styles.jobDetailLabel}>Address:</Text>
                        <Text style={styles.jobDetailValue}>{job.userAddress}</Text>
                      </View>

                      <View style={styles.jobDetailRow}>
                        <Text style={styles.jobDetailLabel}>Phone:</Text>
                        <Text style={styles.jobDetailValue}>{job.userPhone || "Not set by user"}</Text>
                      </View>

                      <View style={styles.jobDetailRow}>
                        <Text style={styles.jobDetailLabel}>Date:</Text>
                        <Text style={styles.jobDetailValue}>{formatDate(job.created_at)}</Text>
                      </View>

                      <View style={styles.jobDetailRow}>
                        <Text style={styles.jobDetailLabel}>Time:</Text>
                        <Text style={styles.jobDetailValue}>{formatTime(job.created_at)}</Text>
                      </View>

                      <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => handleAcceptJob(job.id)}
                      >
                        <Text style={styles.acceptButtonText}>Accept</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          ) : (
            // My Work Section (List of work categories)
            <View style={styles.myWorkSection}>
              <TouchableOpacity
                style={styles.myWorkCard}
                onPress={() => setShowMyWork(true)}
              >
                <Text style={styles.myWorkTitle}>My Accepted Jobs</Text>
                <Text style={styles.myWorkCount}>{acceptedJobs.length}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Bottom Navigation with proper insets */}
      {/* <View style={[styles.bottomNav, { paddingBottom: insets.bottom > 0 ? insets.bottom : 0 }]}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navText, styles.activeNavText]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('VolunteerProfile')}
        >
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4ECFF", // Light Purple
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: "#F4ECFF", // Light Purple
    display: "flex",
    flexDirection: "column",
  },
  contentContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#4A148C", // Deep Purple
    height: 50,
    zIndex: 1,
  },
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: "#6A1B9A", // Medium Purple
  },
  tabText: {
    color: "#B39DDB", // Light purple for inactive tab
    fontSize: 16,
    fontWeight: "bold",
  },
  activeTabText: {
    color: "#6A1B9A", // Medium Purple
  },
  myWorkHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4A148C", // Deep Purple
    height: 50,
    paddingHorizontal: 15,
    zIndex: 1,
  },
  backButton: {
    paddingRight: 15,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 24,
  },
  myWorkHeaderTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  jobsSection: {
    flex: 1,
    padding: 15,
  },
  jobsTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4A148C", // Deep Purple
    marginBottom: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6A1B9A", // Medium Purple
  },
  noJobsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  noJobsText: {
    fontSize: 16,
    color: "#6A1B9A", // Medium Purple
  },
  jobsList: {
    flex: 1,
  },
  jobsListContent: {
    paddingBottom: 20,
  },
  availableJobCard: {
    backgroundColor: "#EDE7F6", // Soft Purple Card Background
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  acceptedJobCard: {
    backgroundColor: "#EDE7F6", // Soft Purple Card Background
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  jobHeader: {
    flexDirection: "row",
    marginBottom: 15,
  },
  userProfileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
    justifyContent: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A148C", // Deep Purple
    marginBottom: 3,
  },
  userId: {
    fontSize: 12,
    color: "#6A1B9A", // Medium Purple
    marginBottom: 5,
  },
  pendingLabel: {
    fontSize: 14,
    color: "#FFA000",
    fontWeight: "bold",
  },
  donationDetailsContainer: {
    marginBottom: 15,
    backgroundColor: "#F4ECFF", // Light Purple
    padding: 10,
    borderRadius: 5,
  },
  donationDetailsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A148C", // Deep Purple
    marginBottom: 8,
  },
  donationItemsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -5,
  },
  donationItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    paddingHorizontal: 5,
    marginBottom: 8,
  },
  donationItemIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  donationItemText: {
    fontSize: 14,
    color: "#6A1B9A", // Medium Purple
  },
  errorBox: {
    backgroundColor: "#FFEBEE",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  errorText: {
    fontSize: 14,
    color: "#D32F2F",
  },
  jobDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  jobDetailLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A148C", // Deep Purple
  },
  jobDetailValue: {
    fontSize: 16,
    color: "#6A1B9A", // Medium Purple
    textAlign: "right",
    flex: 1,
    marginLeft: 10,
  },
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 10,
  },
  acceptButton: {
    backgroundColor: "#6A1B9A", // Medium Purple
    borderRadius: 5,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  acceptButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  markCompletedButton: {
    backgroundColor: "#4A148C", // Deep Purple
    borderRadius: 5,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  markCompletedButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  completedText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
    marginTop: 10,
  },
  jobProfileTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A148C", // Deep Purple
    marginBottom: 15,
  },
  myWorkSection: {
    padding: 15,
  },
  myWorkCard: {
    backgroundColor: "#EDE7F6", // Soft Purple Card Background
    borderRadius: 10,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  myWorkTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A148C", // Deep Purple
  },
  myWorkCount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6A1B9A", // Medium Purple
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#EDE7F6", // Soft Purple
    borderTopWidth: 1,
    borderTopColor: "#D1C4E9", // Light Purple
    height: 50,
    position: "relative",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  navItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  navText: {
    fontSize: 14,
    color: "#4A148C", // Deep Purple
  },
  activeNavText: {
    color: "#6A1B9A", // Medium Purple
    fontWeight: "bold",
  },
});

export default VolunteerScreen;