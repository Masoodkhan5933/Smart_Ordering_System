// FoodListScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { getAllFoods,getUserFavorites } from "../../Controllers/foodController";
import { auth } from "../../Firebase/FirebaseConfig";
const FoodListScreen = ({route}) => {

  const { isFavourites } = route.params || {}; // Get category from route params if available
  console.log('isFavourites:', isFavourites);
  const navigation = useNavigation();
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const userId = auth.currentUser ? auth.currentUser.uid : null; // Get the current user's ID
  const fetchFoodItems = async () => {
    try {
      setLoading(true);
  
      if (isFavourites) {
        const result = await getUserFavorites(userId); 
        
        if (result.success) {
          setFoodItems(result.data);
        } else {
          console.error('Error fetching favourite food items:', result.error);
        }
  
      } else {
        const result = await getAllFoods();
  
        if (result.success) {
          setFoodItems(result.data);
        } else {
          console.error('Error fetching all food items:', result.error);
        }
      }
  
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchFoodItems();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFoodItems();
  };

  const renderFoodItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.foodCard}
      onPress={() => navigation.navigate('FoodDetails', { food: item })}
    >
      <Image 
        source={{ uri: item.image || 'https://via.placeholder.com/300' }} 
        style={styles.foodImage} 
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.foodGradient}
      >
        <Text style={styles.foodTitle}>{item.name}</Text>
        <View style={styles.foodDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.priceText}>${item.price}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color="white" />
            <Text style={styles.detailText}>{item.prepTime || 15} mins</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="star" size={16} color="lightgreen" />
            <Text style={styles.detailText}>{item.rating || '4.5'}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>All Foods</Text>
          <View style={styles.filterButtonPlaceholder} />
        </View>

        {/* Food List */}
        <FlatList
          data={foodItems}
          renderItem={renderFoodItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="white"
              colors={['white']}
            />
          }
          ListEmptyComponent={
            !loading && (
              <View style={styles.emptyContainer}>
                <Ionicons name="fast-food-outline" size={64} color="white" />
                <Text style={styles.emptyText}>No dishes available</Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={onRefresh}
                >
                  <Text style={styles.retryText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            )
          }
        />
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flex: 1,
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  filterButtonPlaceholder: {
    width: 40, // Maintains layout balance
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  foodCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    height: 200,
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  foodGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    height: '50%',
    justifyContent: 'flex-end',
  },
  foodTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  foodDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    color: 'white',
    marginLeft: 4,
  },
  priceText: {
    color: 'lightgreen',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    color: 'white',
    fontSize: 18,
    marginTop: 16,
  },
  retryButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default FoodListScreen;