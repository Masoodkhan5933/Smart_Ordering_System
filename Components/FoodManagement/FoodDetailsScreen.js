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
  ActivityIndicator,
  Alert
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { getFood, toggleFavorite, addToCart } from "../../Controllers/foodController";
import { auth } from "../../Firebase/FirebaseConfig";

const FoodDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { food: initialFood } = route.params || {};
  
  const [food, setFood] = useState(initialFood);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(!initialFood);
  const [addingToCart, setAddingToCart] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Get current user ID
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUserId(currentUser.uid);
    }

    if (!initialFood && route.params?.id) {
      fetchFoodDetails(route.params.id);
    } else if (initialFood) {
      checkFavoriteStatus(initialFood.id, currentUser?.uid);
    }
  }, []);

  const fetchFoodDetails = async (foodId) => {
    try {
      setLoading(true);
      const result = await getFood(foodId);
      if (result.success) {
        setFood(result.data);
        checkFavoriteStatus(foodId, userId);
      }
    } catch (error) {
      console.error('Error fetching food details:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async (foodId, userId) => {
    try {
      if (!foodId || !userId) return;
      
      const result = await getFood(foodId);
      if (result.success) {
        const isFav = result.data.favorites?.includes(userId) || false;
        setIsFavorite(isFav);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      if (!food?.id || !userId) return;
      
      const result = await toggleFavorite(food.id, userId);
      if (result.success) {
        setIsFavorite(result.isFavorite);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!food || !userId) return;
    
    try {
      setAddingToCart(true);
      const result = await addToCart(userId, food, quantity);
      
      if (result.success) {
        Alert.alert(
          "Added to Cart",
          `${quantity} ${food.name} has been added to your cart`,
          [
            {
              text: "View Cart",
              onPress: () => navigation.navigate('Cart'),
              style: "default"
            },
            {
              text: "Continue Shopping",
              style: "cancel"
            }
          ]
        );
      } else {
        Alert.alert("Error", "Could not add item to cart. Please try again.");
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert("Error", "An error occurred while adding to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading || !food) {
    return (
      <LinearGradient 
        colors={["#4B89DC", "#3A6BC5", "#2A4D8F", "#1A3366"]} 
        style={[styles.container, styles.loadingContainer]}
      >
        <ActivityIndicator size="large" color="white" />
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
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: food.image || 'https://via.placeholder.com/600x400?text=Food+Image' }} 
            style={styles.foodImage} 
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageOverlay}
          />
          
          {/* Header Buttons */}
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.rightButtons}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={handleToggleFavorite}
              >
                <Ionicons 
                  name={isFavorite ? "heart" : "heart-outline"} 
                  size={24} 
                  color={isFavorite ? "red" : "white"} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Food Content */}
        <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {/* Food Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.foodTitle}>{food.name}</Text>
          </View>

          {/* Restaurant Info */}
          {food.restaurant && (
            <View style={styles.restaurantContainer}>
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{food.restaurant.name}</Text>
                <View style={styles.restaurantDetails}>
                  <View style={styles.restaurantDetail}>
                    <Ionicons name="location-outline" size={16} color="white" />
                    <Text style={styles.restaurantDetailText}>{food.restaurant.distance || 'N/A'}</Text>
                  </View>
                  <View style={styles.restaurantDetail}>
                    <Ionicons name="time-outline" size={16} color="white" />
                    <Text style={styles.restaurantDetailText}>{food.restaurant.deliveryTime || 'N/A'}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Price and Quantity */}
          <View style={styles.priceQuantityContainer}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.priceValue}>{(food.price * quantity).toFixed(2)} rs</Text>
            </View>
            <View style={styles.quantityContainer}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={decreaseQuantity}
              >
                <Ionicons name="remove" size={20} color="white" />
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={increaseQuantity}
              >
                <Ionicons name="add" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          {food.description && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{food.description}</Text>
            </View>
          )}

          {/* Ingredients */}
          {food.ingredients && food.ingredients.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Ingredients</Text>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                style={styles.ingredientsList}
              >
                {food.ingredients.map((ingredient, index) => (
                  <View key={index} style={styles.ingredientItem}>
                    <View style={styles.bulletPoint} />
                    <Text style={styles.ingredientText}>{ingredient}</Text>
                  </View>
                ))}
              </LinearGradient>
            </View>
          )}

          {/* Bottom padding */}
          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Add to Cart Button */}
        <LinearGradient
          colors={['rgba(26, 51, 102, 0.9)', 'rgba(26, 51, 102, 0.95)']}
          style={styles.addToCartContainer}
        >
          <TouchableOpacity 
            style={styles.addToCartButton} 
            onPress={handleAddToCart}
            disabled={addingToCart}
          >
            {addingToCart ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.addToCartText}>Add to Cart - {(food.price * quantity).toFixed(2)} rs</Text>
                <Ionicons name="cart" size={20} color="white" />
              </>
            )}
          </TouchableOpacity>
        </LinearGradient>
      </SafeAreaView>
    </LinearGradient>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  imageContainer: {
    height: 250,
    position: 'relative',
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  headerButtons: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  rightButtons: {
    flexDirection: 'row',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingHorizontal: 20,
  },
  titleContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  foodTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
  },
  restaurantContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  restaurantDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  restaurantDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 4,
  },
  restaurantDetailText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginLeft: 4,
  },
  viewRestaurantButton: {
    backgroundColor: 'rgba(255, 69, 0, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  viewRestaurantText: {
    color: 'lightgreen',
    fontWeight: 'bold',
  },
  priceQuantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  priceValue: {
    color: 'lightgreen',
    fontSize: 24,
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 20,
    padding: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'lightgreen',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 12,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  descriptionText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 24,
  },
  ingredientsList: {
    borderRadius: 12,
    padding: 16,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'lightgreen',
    marginRight: 12,
  },
  ingredientText: {
    color: 'white',
    fontSize: 16,
  },
  nutritionContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  nutritionLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 4,
  },
  bottomPadding: {
    height: 80,
  },
  addToCartContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  addToCartButton: {
    backgroundColor: 'lightgreen',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  addToCartText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

export default FoodDetailsScreen;