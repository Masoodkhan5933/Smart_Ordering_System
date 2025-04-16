import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { getCart, updateCartItem, removeFromCart, clearCart,createOrder } from "../../Controllers/foodController";
import { auth } from "../../Firebase/FirebaseConfig";

const CartScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUserId(currentUser.uid);
      fetchCart(currentUser.uid);
    }
  }, []);

  const fetchCart = async (userId) => {
    try {
      setIsLoading(true);
      const result = await getCart(userId);
      if (result.success) {
        setCartItems(result.data.items || []);
      } else {
        Alert.alert("Error", result.error || "Failed to load cart");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (foodId, newQuantity) => {
    if (!userId) return;
    
    if (newQuantity < 1) {
      Alert.alert(
        "Remove Item",
        "Do you want to remove this item from your cart?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Remove", 
            style: "destructive",
            onPress: () => removeItem(foodId)
          }
        ]
      );
      return;
    }
    
    try {
      setIsLoading(true);
      const result = await updateCartItem(userId, foodId, newQuantity);
      if (result.success) {
        fetchCart(userId);
      } else {
        Alert.alert("Error", result.error || "Failed to update quantity");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Add to your CartScreen.tsx
const handleCheckout = async () => {
  if (cartItems.length === 0) {
    Alert.alert("Empty Cart", "Please add items to your cart before checkout.");
    return;
  }

  setIsLoading(true);
  
  try {
    // In a real app, you would collect this from the user
    const deliveryAddress = {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA"
    };
    
    const paymentMethod = "card"; // or "cash" for cash on delivery
    
    const result = await createOrder(
      userId,
      cartItems,
      total,
      deliveryAddress,
      paymentMethod
    );
    
    if (result.success) {
      navigation.navigate('OrderConfirmation', { 
        orderId: result.orderId,
        total: total.toFixed(2)
      });
    } else {
      Alert.alert("Error", result.error || "Failed to create order");
    }
  } catch (error) {
    Alert.alert("Error", error.message);
  } finally {
    setIsLoading(false);
  }
};

  const removeItem = async (foodId) => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const result = await removeFromCart(userId, foodId);
      if (result.success) {
        fetchCart(userId);
      } else {
        Alert.alert("Error", result.error || "Failed to remove item");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCart = async () => {
    if (!userId || cartItems.length === 0) return;
    
    Alert.alert(
      "Clear Cart",
      "Are you sure you want to clear your cart?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear", 
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoading(true);
              const result = await clearCart(userId);
              if (result.success) {
                setCartItems([]);
              } else {
                Alert.alert("Error", result.error || "Failed to clear cart");
              }
            } catch (error) {
              Alert.alert("Error", error.message);
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 2.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + deliveryFee + tax;

  // Add to your CartScreen.tsx


  if (isLoading && cartItems.length === 0) {
    return (
      <LinearGradient 
        colors={["#4B89DC", "#3A6BC5", "#2A4D8F", "#1A3366"]} 
        style={styles.container}
      >
        <ActivityIndicator size="large" color="white" style={styles.loadingIndicator} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient 
      colors={["#4B89DC", "#3A6BC5", "#2A4D8F", "#1A3366"]} 
      style={styles.container}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Cart</Text>
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={handleClearCart}
            disabled={cartItems.length === 0}
          >
            <Ionicons name="trash-outline" size={22} color={cartItems.length === 0 ? "rgba(255,255,255,0.3)" : "white"} />
          </TouchableOpacity>
        </View>

        {/* Cart Items */}
        <ScrollView 
          style={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {cartItems.length > 0 ? (
            <>
              <View style={styles.cartItemsContainer}>
                {cartItems.map((item) => (
                  <View key={item.foodId} style={styles.cartItem}>
                    <Image 
                      source={{ uri: item.image || 'https://via.placeholder.com/150' }} 
                      style={styles.itemImage} 
                    />
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemTitle}>{item.name}</Text>
                      <Text style={styles.itemPrice}>{item.price.toFixed(2)} rs</Text>
                    </View>
                    <View style={styles.quantityControls}>
                      <TouchableOpacity 
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.foodId, item.quantity - 1)}
                      >
                        <Ionicons name="remove" size={18} color="white" />
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <TouchableOpacity 
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.foodId, item.quantity + 1)}
                      >
                        <Ionicons name="add" size={18} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>

              {/* Order Summary */}
              <View style={styles.summaryContainer}>
                <Text style={styles.summaryTitle}>Order Summary</Text>
                
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>{subtotal.toFixed(2)} rs</Text>
                </View>
                
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Delivery Fee</Text>
                  <Text style={styles.summaryValue}>{deliveryFee.toFixed(2)} rs</Text>
                </View>
                
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tax</Text>
                  <Text style={styles.summaryValue}>{tax.toFixed(2)} rs</Text>
                </View>
                
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>{total.toFixed(2)} rs</Text>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.emptyCartContainer}>
              <Ionicons name="cart-outline" size={80} color="white" />
              <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
              <Text style={styles.emptyCartText}>
                Looks like you haven't added any items to your cart yet.
              </Text>
              <TouchableOpacity 
                style={styles.browseButton}
                onPress={() => navigation.navigate('FoodList')}
              >
                <Text style={styles.browseButtonText}>Browse Menu</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Checkout Button */}
        {cartItems.length > 0 && (
          <LinearGradient
            colors={['rgba(26, 51, 102, 0.9)', 'rgba(26, 51, 102, 0.95)']}
            style={styles.checkoutContainer}
          >
            <TouchableOpacity 
              style={styles.checkoutButton}
              onPress={handleCheckout}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                  <Ionicons name="arrow-forward" size={20} color="white" />
                </>
              )}
            </TouchableOpacity>
          </LinearGradient>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};



const styles = StyleSheet.create({
    loadingIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  clearButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  cartItemsContainer: {
    marginBottom: 20,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemPrice: {
    color: 'lightgreen',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 20,
    padding: 4,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'lightgreen',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  promoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  promoInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
  },
  promoPlaceholder: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 8,
  },
  applyButton: {
    backgroundColor: 'lightgreen',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  summaryContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  summaryTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
  },
  summaryValue: {
    color: 'white',
    fontSize: 16,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    color: 'lightgreen',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyCartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 40,
  },
  emptyCartTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyCartText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  browseButton: {
    backgroundColor: 'lightgreen',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  browseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 80,
  },
  checkoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  checkoutButton: {
    backgroundColor: 'lightgreen',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  checkoutButtonDisabled: {
    backgroundColor: 'rgba(255, 69, 0, 0.5)',
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

export default CartScreen;