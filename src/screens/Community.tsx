import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, SafeAreaView } from "react-native";

const CommunityScreen = () => {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F4ECFF" }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, alignItems: "center" }}>
                <Text style={{ fontSize: 24, fontWeight: "bold", color: "#4A148C", textAlign: "center", marginBottom: 20, marginTop: 30 }}>
                    Join the Danam Community
                </Text>
                
                {/* WhatsApp Button */}
                <TouchableOpacity style={{ backgroundColor: "#25D366", padding: 15, borderRadius: 10, marginBottom: 20, width: "80%", alignItems: "center" }}>
                    <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>WhatsApp</Text>
                </TouchableOpacity>
                
                <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 10, color: "#6A1B9A" }}>
                    Follow Us
                </Text>
                
                {/* Social Media Buttons */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", width: "90%", marginBottom: 20 }}>
                    <TouchableOpacity style={{ backgroundColor: "#E1306C", padding: 15, borderRadius: 10, flex: 1, marginHorizontal: 5, alignItems: "center" }}>
                        <Text style={{ color: "white", fontWeight: "bold" }}>Instagram</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ backgroundColor: "#1DA1F2", padding: 15, borderRadius: 10, flex: 1, marginHorizontal: 5, alignItems: "center" }}>
                        <Text style={{ color: "white", fontWeight: "bold" }}>Twitter</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ backgroundColor: "#1877F2", padding: 15, borderRadius: 10, flex: 1, marginHorizontal: 5, alignItems: "center" }}>
                        <Text style={{ color: "white", fontWeight: "bold" }}>Facebook</Text>
                    </TouchableOpacity>
                </View>
                
                <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 10, color: "#6A1B9A" }}>
                    Upcoming Events
                </Text>
                
                {/* Event Cards */}
                <View style={{ width: "90%", backgroundColor: "#EDE7F6", padding: 15, borderRadius: 10, marginBottom: 15, shadowColor: "#000", shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 3 }}>
                    <Text style={{ fontWeight: "bold", fontSize: 18, color: "#4A148C" }}>Donation Drive</Text>
                    <Text style={{ fontWeight: "bold", marginTop: 5 }}>Date: June 15, 2025</Text>
                    <Text style={{ marginTop: 5 }}>Join us for our upcoming donation drive to collect clothes, books, and packaged food for those in need.</Text>
                </View>

                <View style={{ width: "90%", backgroundColor: "#EDE7F6", padding: 15, borderRadius: 10, marginBottom: 15, shadowColor: "#000", shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 3 }}>
                    <Text style={{ fontWeight: "bold", fontSize: 18, color: "#4A148C" }}>Danam Community Meetup</Text>
                    <Text style={{ fontWeight: "bold", marginTop: 5 }}>Date: July 10, 2025</Text>
                    <Text style={{ marginTop: 5 }}>Meet other community members in person at our Danam Community Meetup, an event to foster connections and discuss donation initiatives.</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default CommunityScreen;