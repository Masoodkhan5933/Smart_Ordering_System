import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { logout } from '../../Controllers/authController';
import { getAllFoods } from '../../Controllers/foodController';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [featuredDishes, setFeaturedDishes] = useState([]);
  const [categories, setCategories] = useState([
    { id: 1, name: "Italian", icon: "pizza", image: "https://plus.unsplash.com/premium_photo-1661762555601-47d088a26b50?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cGl6emF8ZW58MHx8MHx8fDA%3D" },
    { id: 2, name: "Mexican", icon: "taco", image: "https://plus.unsplash.com/premium_photo-1678051141689-1f7a7861b3b4?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dGFjb3xlbnwwfHwwfHx8MA%3D%3D" },
    { id: 3, name: "Asian", icon: "rice-bowl", image: "https://images.unsplash.com/photo-1628521061262-19b5cdb7eee5?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmljZSUyMGJvd2x8ZW58MHx8MHx8fDA%3D" },
    { id: 4, name: "Desserts", icon: "ice-cream", image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" }
  ]);

  useEffect(() => {
    fetchFoodData();
  }, []);

  const fetchFoodData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch featured dishes (first 3 items)
      const featuredResult = await getAllFoods();
      if (featuredResult.success) {
        setFeaturedDishes(featuredResult.data.slice(0, 3));
      }

      // Fetch popular dishes
      

    } catch (error) {
      Alert.alert('Error', 'Failed to load food data');
      console.error('Error fetching food data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const result = await logout();
      if (result.success) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } else {
        Alert.alert('Logout Failed', result.error || 'An error occurred during logout');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient 
      colors={["#4B89DC", "#3A6BC5", "#2A4D8F", "#1A3366"]} 
      style={styles.container}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={require("../../assets/app-icon.png")}
              style={styles.appIcon}
            />
            <Text style={styles.appName}>FoodDelivery</Text>
          </View>
          <TouchableOpacity 
            onPress={handleLogout} 
            disabled={isLoading} 
            style={styles.logoutButton}
          >
            {isLoading ? (
              <ActivityIndicator color="lightgreen" size="small" />
            ) : (
              <Ionicons name="log-out-outline" size={22} color="lightgreen" />
            )}
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <ScrollView 
          style={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Discover</Text>
            <Text style={styles.welcomeSubtitle}>Delicious Food</Text>
          </View>

          {/* Search Bar */}
          <TouchableOpacity 
            style={styles.searchBar}
            onPress={() => navigation.navigate('FoodList')}
          >
            <Ionicons name="search" size={20} color="#fff" />
            <Text style={styles.searchPlaceholder}>Search for food...</Text>
          </TouchableOpacity>

          {/* Featured Dishes Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Dishes</Text>
              <TouchableOpacity onPress={() => navigation.navigate('FoodList')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            
            {isLoading && featuredDishes.length === 0 ? (
              <ActivityIndicator size="large" color="white" />
            ) : (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.featuredContainer}
              >
                {featuredDishes.map((dish) => (
                  <TouchableOpacity 
                    key={dish.id} 
                    style={styles.featuredCard}
                    onPress={() => navigation.navigate('FoodDetails', { food: dish })}
                  >
                    <Image 
                      source={{ uri: dish.image || 'https://via.placeholder.com/400x400?text=Food+Image' }} 
                      style={styles.featuredImage} 
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(38, 163, 61, 0.8)']}
                      style={styles.featuredGradient}
                    >
                      <Text style={styles.featuredTitle}>{dish.name}</Text>
                      <View style={styles.featuredMeta}>
                        <Text style={styles.featuredPrice}>Rs {dish.price.toFixed(2)}</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Categories Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.categoriesGrid}>
              {categories.map((category) => (
                <TouchableOpacity 
                  key={category.id} 
                  style={styles.categoryCard}
                  onPress={() => navigation.navigate('FoodList', { category: category.name })}
                >
                  <Image source={{ uri: category.image }} style={styles.categoryImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(25, 109, 40, 0.8)']}
                    style={styles.categoryGradient}
                  >
                    <Ionicons name={category.icon} size={24} color="lightgreen" />
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

    
          
          {/* Bottom padding for navigation */}
          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Bottom Navigation */}
        <LinearGradient
          colors={['rgba(26, 51, 102, 0.9)', 'rgba(26, 51, 102, 0.95)']}
          style={styles.bottomNavContainer}
        >
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigation.navigate('FoodList')}
          >
            <Ionicons name="restaurant-outline" size={24} color="white" />
            <Text style={styles.navButtonText}>Foods</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigation.navigate('FoodList', { isFavourites: true })}
          >
            <Ionicons name="heart-outline" size={24} color="white" />
            <Text style={styles.navButtonText}>Favorites</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.addButtonContainer}
            onPress={() => navigation.navigate('AddFood')}
          >
            <View style={styles.addButton}>
              <Ionicons name="add" size={28} color="white" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigation.navigate('Orders')}
          >
            <MaterialIcons name="history" size={24} color="white" />
            <Text style={styles.navButtonText}>Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigation.navigate('Cart')}
          >
            <Ionicons name="cart" size={22} color="white" />
            <Text style={styles.navButtonText}>Cart</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
  },
  appName: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  welcomeSection: {
    marginTop: 20,
    marginBottom: 25,
  },
  welcomeTitle: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  welcomeSubtitle: {
    color: 'lightgreen',
    fontSize: 32,
    fontWeight: 'bold',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 30,
  },
  searchPlaceholder: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
    opacity: 0.7,
  },
  sectionContainer: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: 'lightgreen',
    fontSize: 14,
  },
  featuredContainer: {
    paddingRight: 20,
  },
  featuredCard: {
    width: 280,
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 15,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    padding: 15,
    justifyContent: 'flex-end',
  },
  featuredTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredPrice: {
    color: 'lightgreen',
    fontWeight: 'bold',
    fontSize: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 15,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
    opacity: 0.8,
  },
  bottomPadding: {
    height: 80,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },
  addButtonContainer: {
    alignItems: 'center',
    marginTop: -30,
  },
  addButton: {
    backgroundColor: 'lightgreen',
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(26, 51, 102, 0.8)',
  },
  navButtonText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
});

export default HomeScreen;