import React from "react";
import { 
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from "expo-status-bar";

const PickupScheduledScreen = () => {
    const navigation = useNavigation();

    const handleBackToHome = () => {
        navigation.navigate('MainTabs');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="auto" />
            
            <View style={styles.contentContainer}>
                {/* Danam Logo */}
                <Image 
                    source={require("../../assets/icons/logo.png")} 
                    style={styles.logo} 
                    resizeMode="contain"
                />
                
                {/* Heading */}
                <Text style={styles.heading}>Pickup Scheduled</Text>
                
                {/* Message */}
                <Text style={styles.message}>
                    A volunteer is on the way to pick up the items, you are making a change
                </Text>
                
                {/* Back to Home Button */}
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={handleBackToHome}
                >
                    <Text style={styles.backButtonText}>Back to Home</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F4ECFF",
    },
    contentContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 30,
    },
    heading: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#4A148C",
        textAlign: "center",
        marginBottom: 20,
    },
    message: {
        fontSize: 18,
        color: "#6A1B9A",
        textAlign: "center",
        marginBottom: 40,
        lineHeight: 24,
    },
    backButton: {
        backgroundColor: "#4A148C",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginTop: 20,
        width: "80%",
        alignItems: "center",
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
});

export default PickupScheduledScreen;