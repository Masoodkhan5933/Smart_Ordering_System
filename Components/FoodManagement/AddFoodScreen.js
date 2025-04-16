// AddFoodScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Image,
  Alert,
  KeyboardAvoidingView
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { createFood } from "../../Controllers/foodController";
import { auth } from "../../Firebase/FirebaseConfig";
const AddFoodScreen = () => {
  const user = auth.currentUser;
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [foodImage, setFoodImage] = useState(null);
  const [foodTitle, setFoodTitle] = useState("");
  const [price, setPrice] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [category, setCategory] = useState("Main Course");
  const [description, setDescription] = useState("");

  const categoryOptions = ["Appetizer", "Main Course", "Dessert", "Beverage"];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to select a food image.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFoodImage(result.assets[0].uri);
    }
  };

  const handleSaveFood = async () => {
    // Validate inputs
    if (!foodTitle.trim()) {
      Alert.alert("Error", "Please enter a food title");
      return;
    }
    if (!user) {
      Alert.alert("Error", "You must be logged in to add food items");
      return;
    }

    if (!foodImage) {
      Alert.alert("Error", "Please add a food image");
      return;
    }

    if (!price.trim()) {
      Alert.alert("Error", "Please enter a price");
      return;
    }

    setIsLoading(true);

    // Create food data object
    const foodData = {
      title: foodTitle,
      price: parseFloat(price),
      prepTime: prepTime ? parseInt(prepTime) : 0,
      category,
      description,
      image: foodImage, // In a real app, you would upload this to storage first
      userId: user.uid, // Current user ID
      isActive: true,
      orderedBy: [],
      favorites: [],
      keywords: generateKeywords(foodTitle, category),
      rating: 0,
      ratingCount: 0
    };

    try {
      // Call the controller method to create the food
      const result = await createFood(foodData);
      
      if (result.success) {
        Alert.alert(
          "Success", 
          "Food item added successfully!",
          [
            { 
              text: "OK", 
              onPress: () => navigation.navigate('Home') 
            }
          ]
        );
      } else {
        Alert.alert("Error", result.error || "Failed to add food item");
      }
    } catch (error) {
      Alert.alert("Error", error.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate keywords for search functionality
  const generateKeywords = (title, category) => {
    const words = title.toLowerCase().split(' ');
    words.push(category.toLowerCase());
    return [...new Set(words)]; // Remove duplicates
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
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add New Food Item</Text>
          <TouchableOpacity 
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSaveFood}
            disabled={isLoading}
          >
            {isLoading ? (
              <Text style={styles.saveButtonText}>Saving...</Text>
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Content */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView 
            style={styles.scrollContainer} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.formContainer}>
              {/* Food Image */}
              <TouchableOpacity style={styles.imagePickerContainer} onPress={pickImage}>
                {foodImage ? (
                  <Image source={{ uri: foodImage }} style={styles.foodImage} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="camera-outline" size={40} color="white" />
                    <Text style={styles.imagePlaceholderText}>Add Food Photo</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Food Title */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Food Title</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter food title"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={foodTitle}
                  onChangeText={setFoodTitle}
                />
              </View>

              {/* Price and Prep Time */}
              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Price (rs)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="0.00"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>Prep Time (mins)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Prep time"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={prepTime}
                    onChangeText={setPrepTime}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              {/* Category */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category</Text>
                <View style={styles.categoryContainer}>
                  {categoryOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.categoryOption,
                        category === option && styles.categoryOptionSelected
                      ]}
                      onPress={() => setCategory(option)}
                    >
                      <Text 
                        style={[
                          styles.categoryText,
                          category === option && styles.categoryTextSelected
                        ]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textAreaInput]}
                  placeholder="Describe your food item"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  saveButton: {
    backgroundColor: 'lightgreen',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  saveButtonDisabled: {
    backgroundColor: 'green',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  formContainer: {
    padding: 16,
  },
  imagePickerContainer: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
    borderRadius: 16,
  },
  imagePlaceholderText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: 'white',
    fontSize: 16,
  },
  textAreaInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  categoryOption: {
    width: '50%',
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryOptionSelected: {
    backgroundColor: 'lightgreen',
  },
  categoryText: {
    color: 'white',
    fontSize: 14,
  },
  categoryTextSelected: {
    fontWeight: 'bold',
  },
});

export default AddFoodScreen;