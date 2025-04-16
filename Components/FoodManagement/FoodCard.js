// FoodCard.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

const FoodCard = ({ food, style }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity 
      style={[styles.card, style]}
      onPress={() => navigation.navigate('FoodDetails', { id: food.id })}
    >
      <Image source={{ uri: food.image }} style={styles.image} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      >
        <Text style={styles.title} numberOfLines={2}>{food.title}</Text>
        
        <View style={styles.details}>
          <Text style={styles.price}>${food.price}</Text>
          
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={14} color="white" />
            <Text style={styles.detailText}>{food.time} mins</Text>
          </View>
          
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FF4500" />
            <Text style={styles.detailText}>{food.rating}</Text>
          </View>
        </View>
      </LinearGradient>
      
      {food.isFavorite && (
        <View style={styles.favoriteIcon}>
          <Ionicons name="heart" size={18} color="#FF4500" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 200,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    height: '50%',
    justifyContent: 'flex-end',
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    color: '#FF4500',
    fontWeight: 'bold',
    fontSize: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FoodCard;