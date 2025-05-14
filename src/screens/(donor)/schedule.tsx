import React, { useState, useEffect } from "react"
import { 
    Image, 
    ScrollView, 
    StyleSheet, 
    Text, 
    TouchableOpacity, 
    View,
    TextInput,
    Modal,
    FlatList,
    SafeAreaView
} from "react-native"
import { useNavigation } from '@react-navigation/native'
import { StatusBar } from "expo-status-bar"
import { supabase } from "../../initSupabase"

const SchedulePickupScreen = () => {
    const navigation = useNavigation();
    const [donorName, setDonorName] = useState("Loading...");
    const [donorAddress, setDonorAddress] = useState("Loading...");
    const [showNgoDropdown, setShowNgoDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    interface Ngo {
        id: number;
        name: string;
        email: string;
        img: any;
    }
    
    const [selectedNgo, setSelectedNgo] = useState<Ngo | null>(null);
    
    // Item selection states
    const [showItemsModal, setShowItemsModal] = useState(false);
    const [selectedItemType, setSelectedItemType] = useState("");
    const [itemQuantity, setItemQuantity] = useState(1);
    interface DonationItem {
        id: number;
        type: string;
        quantity: number;
        icon: any;
    }

    const [donationItems, setDonationItems] = useState<DonationItem[]>([]);
    
    // Available item types
    const itemTypes = [
        { id: 1, name: "Food", icon: require("@assets/images/paper-bag.png") },
        { id: 2, name: "Books", icon: require("@assets/images/book.png") },
        { id: 3, name: "Clothes", icon: require("@assets/images/brand.png") },
        { id: 4, name: "Medicine", icon: require("@assets/images/medicine.png") },
    ];
    
    // Custom NGO list with your specified NGO names
    const ngoList = [
        { id: 1, name: "Kalpvriksh - Ek Chota Prayas NGO", email: "kalpvriksh@ngo.org", img: require("@assets/images/dalla.png") },
        { id: 2, name: "GARV - a genius and real voice NGO", email: "garv@ngo.org", img: require("@assets/images/dalla.png") },
        { id: 3, name: "Self Awakening Mission NGO", email: "selfawakening@ngo.org", img: require("@assets/images/dalla.png") },
        { id: 4, name: "Scope for Change", email: "scopeforchange@ngo.org", img: require("@assets/images/dalla.png") },
        { id: 5, name: "Guru daani foundation", email: "gurudaani@foundation.org", img: require("@assets/images/dalla.png") },
    ];
    
    // Filter NGOs based on search query
    const filteredNgos = ngoList.filter(ngo => 
        ngo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ngo.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Fetch donor data from database
    useEffect(() => {
        const fetchDonorData = async () => {
            try {
                const session = await supabase.auth.session();
                
                if (session?.user) {
                    const { data, error } = await supabase
                        .from("users")
                        .select("name, address")
                        .eq("auth_user_id", session.user.id)
                        .single();
                    
                    if (error) {
                        console.error("Error fetching donor data:", error);
                        setDonorName("User");
                        setDonorAddress("No address provided");
                    } else if (data) {
                        setDonorName(data.name || "User");
                        setDonorAddress(data.address || "No address provided");
                    }
                } else {
                    setDonorName("User");
                    setDonorAddress("No address provided");
                }
            } catch (error) {
                console.error("Error in fetchDonorData:", error);
                setDonorName("User");
                setDonorAddress("No address provided");
            }
        };
        
        fetchDonorData();
    }, []);
    
    const handleSchedulePickup = async () => {
        try {
            // Get current user session
            const session = await supabase.auth.session();
            
            if (!session?.user) {
                console.error("No user is logged in");
                alert("Please log in to schedule a pickup");
                return;
            }
            
            // Make sure an NGO is selected
            if (!selectedNgo) {
                alert("Please select an NGO for your donation");
                return;
            }
            
            // Get the user's UUID from the database
            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("auth_user_id")
                .eq("auth_user_id", session.user.id)
                .single();
                
            if (userError || !userData) {
                console.error("Error fetching user data:", userError);
                alert("Could not verify your user account. Please try again.");
                return;
            }
            
            // Initialize donation data with default values
            const donationData: Record<'meds' | 'books' | 'clothes' | 'food', number> & { ngo: string; status: string; uid: string } = {
                meds: 0,
                books: 0,
                clothes: 0,
                food: 0,
                ngo: selectedNgo.name,
                status: "pending", // Default status is pending
                uid: session.user.id // Use the UUID directly from the session
            };
            
            // Update quantities for each item type
            donationItems.forEach(item => {
                // Map the item types to database column names
                const itemTypeMap = {
                    "Medicine": "meds",
                    "Books": "books",
                    "Clothes": "clothes",
                    "Food": "food"
                };
                
                const dbField = itemTypeMap[item.type as keyof typeof itemTypeMap];
                if (dbField) {
                    (donationData[dbField as 'meds' | 'books' | 'clothes' | 'food'] as number) += item.quantity;
                }
            });
            
            console.log("Attempting to insert donation:", donationData);
            
            // Insert donation data into the donation table
            const { data, error } = await supabase
                .from("donation")
                .insert([donationData]);
                
            if (error) {
                console.error("Error storing donation data:", error);
                alert("There was an error scheduling your pickup. Please try again.");
                return;
            }
            
            console.log("Donation scheduled successfully:", data);
            navigation.navigate("PickupScheduled");
        } catch (err) {
            console.error("Error in handleSchedulePickup:", err);
            alert("An unexpected error occurred. Please try again.");
        }
    };

    const handleNgoSelect = (ngo: Ngo) => {
        setSelectedNgo(ngo);
        setShowNgoDropdown(false);
    };
    
    const handleAddItem = () => {
        if (selectedItemType && itemQuantity > 0) {
            const itemTypeInfo = itemTypes.find(item => item.name === selectedItemType);
            const newItem = {
                id: Date.now(),
                type: selectedItemType,
                quantity: itemQuantity,
                icon: itemTypeInfo ? itemTypeInfo.icon : null
            };
            
            setDonationItems([...donationItems, newItem]);
            setShowItemsModal(false);
            setItemQuantity(1); // Reset quantity for next item
        }
    };
    
    const handleRemoveItem = (itemId: number) => {
        setDonationItems(donationItems.filter(item => item.id !== itemId));
    };
    
    const calculateTotal = () => {
        return donationItems.reduce((total, item) => total + item.quantity, 0);
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                <StatusBar style='auto' />
                
                {/* Header */}
                <Text style={styles.headerTitle}>Danam</Text>
                
                {/* Pickup Details */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.row}>
                        <Text style={styles.label}>Address</Text>
                        <Text style={styles.value}>{donorAddress}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.row}>
                        <Text style={styles.label}>Pickup</Text>
                        <Text style={styles.value}>Free | Standard | 3-4 days</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.row}>
                        <Text style={styles.label}>Details of Donor</Text>
                        <Text style={styles.value}>{donorName}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.row}
                        onPress={() => setShowNgoDropdown(true)}
                    >
                        <Text style={styles.label}>Select NGO</Text>
                        <Text style={[styles.value, !selectedNgo && styles.dropdownPlaceholder]}>
                            {selectedNgo ? selectedNgo.name : "Select an NGO"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* NGO Selection Modal */}
                <Modal
                    visible={showNgoDropdown}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setShowNgoDropdown(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Select an NGO</Text>
                            
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search NGOs..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            
                            <FlatList
                                data={filteredNgos}
                                keyExtractor={item => item.id.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity 
                                        style={styles.ngoItem}
                                        onPress={() => handleNgoSelect(item)}
                                    >
                                        <Image source={item.img} style={styles.ngoImage} />
                                        <View>
                                            <Text style={styles.ngoName}>{item.name}</Text>
                                            <Text style={styles.ngoEmail}>{item.email}</Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            />
                            
                            <TouchableOpacity 
                                style={styles.closeButton}
                                onPress={() => setShowNgoDropdown(false)}
                            >
                                <Text style={styles.closeButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* Items Selection Section */}
                <View style={styles.itemSelectionContainer}>
                    <Text style={styles.sectionTitle}>Donation Items</Text>
                    
                    <TouchableOpacity 
                        style={styles.addItemButton}
                        onPress={() => setShowItemsModal(true)}
                    >
                        <Text style={styles.addItemButtonText}>+ Add Item</Text>
                    </TouchableOpacity>
                    
                    {donationItems.length === 0 ? (
                        <View style={styles.emptyItemsContainer}>
                            <Text style={styles.emptyItemsText}>
                                Add items to your donation
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.donationItemsContainer}>
                            {donationItems.map(item => (
                                <View key={item.id} style={styles.donationItem}>
                                    <Image source={item.icon} style={styles.donationItemIcon} />
                                    <View style={styles.donationItemDetails}>
                                        <Text style={styles.donationItemType}>{item.type}</Text>
                                        <Text style={styles.donationItemQuantity}>Quantity: {item.quantity}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.removeItemButton}
                                        onPress={() => handleRemoveItem(item.id)}
                                    >
                                        <Text style={styles.removeItemButtonText}>Remove</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
                
                {/* Item Selection Modal */}
                <Modal
                    visible={showItemsModal}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setShowItemsModal(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Select Item Type</Text>
                            
                            <View style={styles.itemTypesContainer}>
                                {itemTypes.map(item => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={[
                                            styles.itemTypeButton,
                                            selectedItemType === item.name && styles.selectedItemType
                                        ]}
                                        onPress={() => setSelectedItemType(item.name)}
                                    >
                                        <Image source={item.icon} style={styles.itemTypeIcon} />
                                        <Text style={styles.itemTypeName}>{item.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            
                            <Text style={styles.quantityLabel}>Quantity</Text>
                            <View style={styles.quantitySelector}>
                                <TouchableOpacity 
                                    style={styles.quantityButton}
                                    onPress={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                                >
                                    <Text style={styles.quantityButtonText}>-</Text>
                                </TouchableOpacity>
                                
                                <Text style={styles.quantityValue}>{itemQuantity}</Text>
                                
                                <TouchableOpacity 
                                    style={styles.quantityButton}
                                    onPress={() => setItemQuantity(itemQuantity + 1)}
                                >
                                    <Text style={styles.quantityButtonText}>+</Text>
                                </TouchableOpacity>
                            </View>
                            
                            <View style={styles.modalButtons}>
                                <TouchableOpacity 
                                    style={styles.cancelButton}
                                    onPress={() => setShowItemsModal(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={[
                                        styles.addButton,
                                        (!selectedItemType || itemQuantity < 1) && styles.disabledButton
                                    ]}
                                    onPress={handleAddItem}
                                    disabled={!selectedItemType || itemQuantity < 1}
                                >
                                    <Text style={styles.addButtonText}>Add to Donation</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Summary */}
                <View style={styles.summary}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryText}>Total items</Text>
                        <Text style={styles.summaryText}>{calculateTotal()}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryText}>Shipping total</Text>
                        <Text style={styles.summaryText}>Free</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryText}>Estimated impact</Text>
                        <Text style={styles.summaryText}>Helps {Math.max(1, Math.floor(calculateTotal() / 2))} people</Text>
                    </View>
                </View>

                {/* Schedule Pickup Button */}
                <TouchableOpacity 
                    onPress={handleSchedulePickup} 
                    style={[styles.scheduleButton, donationItems.length === 0 && styles.disabledButton]}
                    disabled={donationItems.length === 0}
                >
                    <Text style={styles.scheduleButtonText}>Schedule PickUp</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#F4ECFF", // Soft Lavender Background
        flex: 1,
    },
    contentContainer: {
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#4A148C",
        textAlign: "center",
        marginVertical: 20,
    },
    section: {
        backgroundColor: "#FFFFFF",
        margin: 15,
        borderRadius: 10,
        padding: 15,
        elevation: 2,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#4A148C", // Dark Purple
    },
    value: {
        fontSize: 14,
        color: "#757575",
    },
    dropdownPlaceholder: {
        color: "#9E9E9E", // Grey
        fontStyle: "italic",
    },
    itemSelectionContainer: {
        backgroundColor: "#FFFFFF",
        margin: 15,
        borderRadius: 10,
        padding: 15,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#4A148C",
        marginBottom: 10,
    },
    addItemButton: {
        backgroundColor: "#4A148C",
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: "center",
        marginBottom: 10,
    },
    addItemButtonText: {
        fontSize: 16,
        color: "#FFFFFF",
    },
    emptyItemsContainer: {
        alignItems: "center",
        marginTop: 10,
    },
    emptyItemsText: {
        fontSize: 14,
        color: "#757575",
    },
    donationItemsContainer: {
        marginTop: 10,
    },
    donationItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    donationItemIcon: {
        width: 40,
        height: 40,
        marginRight: 10,
    },
    donationItemDetails: {
        flex: 1,
    },
    donationItemType: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#4A148C",
    },
    donationItemQuantity: {
        fontSize: 14,
        color: "#757575",
    },
    removeItemButton: {
        backgroundColor: "#E0E0E0",
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    removeItemButtonText: {
        fontSize: 14,
        color: "#757575",
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        width: "80%",
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        padding: 20,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#4A148C",
        marginBottom: 10,
    },
    searchInput: {
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    ngoItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    ngoImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    ngoName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#4A148C",
    },
    ngoEmail: {
        fontSize: 14,
        color: "#757575",
    },
    closeButton: {
        backgroundColor: "#E0E0E0",
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: "center",
        marginTop: 10,
    },
    closeButtonText: {
        fontSize: 16,
        color: "#757575",
    },
    itemTypesContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    itemTypeButton: {
        alignItems: "center",
        padding: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        width: "48%",
        marginBottom: 10,
    },
    selectedItemType: {
        borderColor: "#4A148C",
        backgroundColor: "#EDE7F6",
    },
    itemTypeIcon: {
        width: 40,
        height: 40,
        marginBottom: 5,
    },
    itemTypeName: {
        fontSize: 14,
        color: "#757575",
    },
    quantityLabel: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#4A148C",
        marginBottom: 5,
    },
    quantitySelector: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },
    quantityButton: {
        backgroundColor: "#E0E0E0",
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    quantityButtonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#4A148C",
    },
    quantityValue: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#4A148C",
        marginHorizontal: 20,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    cancelButton: {
        backgroundColor: "#E0E0E0",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        width: "48%",
    },
    cancelButtonText: {
        fontSize: 16,
        color: "#757575",
        textAlign: "center",
    },
    addButton: {
        backgroundColor: "#4A148C",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        width: "48%",
    },
    addButtonText: {
        fontSize: 16,
        color: "#FFFFFF",
        textAlign: "center",
    },
    disabledButton: {
        backgroundColor: "#E0E0E0",
        opacity: 0.7,
    },
    summary: {
        backgroundColor: "#FFFFFF",
        margin: 15,
        padding: 15,
        borderRadius: 10,
        elevation: 2,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 4,
    },
    summaryText: {
        fontSize: 14,
        color: "#6A1B9A",
    },
    scheduleButton: {
        backgroundColor: "#4A14BC",
        paddingVertical: 12,
        borderRadius: 25,
        marginHorizontal: 20,
        marginBottom: 20,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center", // Ensure centering within parent
        width: "90%", // Adjust width for proper centering
    },
    scheduleButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "white",
        textAlign: "center", // Ensures text is centered
        width: "100%", // Forces text to take full width
    },
})

export default SchedulePickupScreen;

