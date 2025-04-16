// controllers/foodController.js
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    arrayUnion,
    arrayRemove,
    serverTimestamp
  } from 'firebase/firestore';
  import { db } from '../Firebase/FirebaseConfig';
  import 'react-native-get-random-values';
  import { v4 as uuidv4 } from 'uuid';
  
  const foodsCollection = collection(db, 'foods');
  
  // Improved image upload function with better error handling
  const uploadImageToCloudinary = async (imageUri) => {
    try {
      // Validate image URI
      if (!imageUri || typeof imageUri !== 'string') {
        throw new Error('Invalid image URI');
      }
  
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        name: `food_${uuidv4()}.jpg`,
        type: 'image/jpeg'
      });
      formData.append('upload_preset', 'ml_default');
      formData.append('cloud_name', 'dnoqwcreg');
  
      const response = await fetch(
        'https://api.cloudinary.com/v1_1/dnoqwcreg/image/upload',
        {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
  
      const responseData = await response.json();
  
      if (!response.ok) {
        console.error('Cloudinary upload failed:', responseData);
        throw new Error(responseData.error?.message || 'Image upload failed');
      }
  
      if (!responseData.secure_url) {
        throw new Error('No image URL returned from Cloudinary');
      }
  
      return responseData.secure_url;
    } catch (error) {
      console.error('Image upload error:', error);
      throw new Error(`Image upload failed: ${error.message}`);
    }
  };
  
  // Main food controller functions
  export const createFood = async (foodData) => {
    try {
      if (!foodData?.userId) {
        throw new Error('User ID is required');
      }
  
      let imageUrl = '';
      if (foodData.image) {
        imageUrl = await uploadImageToCloudinary(foodData.image);
      }
  
      const foodRef = doc(foodsCollection);
      await setDoc(foodRef, {
        ...foodData,
        image: imageUrl,
        orderedBy: [],
        favorites: [],
        rating: 0,
        ratingCount: 0,
        isActive: true,
        keywords: [
          ...(foodData.name?.toLowerCase().split(' ') || []),
          ...(foodData.category?.toLowerCase().split(' ') || [])
        ],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
  
      return { success: true, id: foodRef.id };
    } catch (error) {
      console.error('Create food error:', error);
      return { success: false, error: error.message };
    }
  };
  
  export const getFood = async (foodId) => {
    try {
      if (!foodId) throw new Error('Food ID is required');
  
      const foodRef = doc(foodsCollection, foodId);
      const docSnap = await getDoc(foodRef);
      
      if (!docSnap.exists()) {
        throw new Error('Food item not found');
      }
  
      return { 
        success: true, 
        data: { 
          id: docSnap.id, 
          ...docSnap.data() 
        } 
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  export const getAllFoods = async () => {
    try {
      const q = query(
        foodsCollection, 
        where('isActive', '==', true), 
        // orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const foods = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
  
      return { success: true, data: foods };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  // ... [Keep all other functions with similar error handling improvements] ...
  
  export const updateFood = async (foodId, updatedData, userId) => {
    try {
      if (!foodId) throw new Error('Food ID is required');
      if (!userId) throw new Error('User ID is required');
  
      const foodRef = doc(foodsCollection, foodId);
      const foodSnap = await getDoc(foodRef);
      
      if (!foodSnap.exists()) {
        throw new Error('Food item not found');
      }
  
      const foodData = foodSnap.data();
      
      // Verify user is the creator or admin
      if (foodData.userId !== userId) {
        throw new Error('Unauthorized to update this food item');
      }
  
      // Prepare update data
      const updatePayload = {
        ...updatedData,
        updatedAt: serverTimestamp()
      };
  
      // Regenerate keywords if name or category changed
      if (updatedData.name || updatedData.category) {
        updatePayload.keywords = [
          ...(updatedData.name?.toLowerCase().split(' ') || foodData.name?.toLowerCase().split(' ') || []),
          ...(updatedData.category?.toLowerCase().split(' ') || foodData.category?.toLowerCase().split(' ') || [])
        ];
      }
  
      await updateDoc(foodRef, updatePayload);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  export const deleteFood = async (foodId, userId) => {
    try {
      if (!foodId) throw new Error('Food ID is required');
      if (!userId) throw new Error('User ID is required');
  
      const foodRef = doc(foodsCollection, foodId);
      const foodSnap = await getDoc(foodRef);
      
      if (!foodSnap.exists()) {
        throw new Error('Food item not found');
      }
  
      // Verify user is the creator or admin
      const foodData = foodSnap.data();
      if (foodData.userId !== userId) {
        throw new Error('Unauthorized to delete this food item');
      }
  
      // Soft delete by setting isActive to false
      await updateDoc(foodRef, {
        isActive: false,
        updatedAt: serverTimestamp()
      });
  
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  // ... [Other functions with similar improvements] ...
  
  export const rateFood = async (foodId, userId, rating) => {
    try {
      if (!foodId) throw new Error('Food ID is required');
      if (!userId) throw new Error('User ID is required');
      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        throw new Error('Rating must be a number between 1 and 5');
      }
  
      const foodRef = doc(foodsCollection, foodId);
      const foodSnap = await getDoc(foodRef);
      
      if (!foodSnap.exists()) {
        throw new Error('Food item not found');
      }
  
      const foodData = foodSnap.data();
      const currentRating = foodData.rating || 0;
      const currentRatingCount = foodData.ratingCount || 0;
      
      // Calculate new average rating
      const newRatingCount = currentRatingCount + 1;
      const newRating = parseFloat(
        ((currentRating * currentRatingCount) + rating) / newRatingCount
      ).toFixed(1);
  
      await updateDoc(foodRef, {
        rating: parseFloat(newRating),
        ratingCount: newRatingCount,
        updatedAt: serverTimestamp()
      });
  
      return { 
        success: true, 
        data: {
          newRating: parseFloat(newRating),
          newRatingCount
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };


  // Add to foodController.js

export const toggleFavorite = async (foodId, userId) => {
    try {
      if (!foodId) throw new Error('Food ID is required');
      if (!userId) throw new Error('User ID is required');
  
      const foodRef = doc(foodsCollection, foodId);
      const foodSnap = await getDoc(foodRef);
      
      if (!foodSnap.exists()) {
        throw new Error('Food item not found');
      }
  
      const foodData = foodSnap.data();
      const isFavorite = foodData.favorites?.includes(userId);
  
      await updateDoc(foodRef, {
        favorites: isFavorite 
          ? arrayRemove(userId) 
          : arrayUnion(userId),
        updatedAt: serverTimestamp()
      });
  
      return { 
        success: true, 
        isFavorite: !isFavorite 
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  export const getUserFavorites = async (userId) => {
    try {
      if (!userId) throw new Error('User ID is required');
  
      const q = query(
        foodsCollection,
        where('favorites', 'array-contains', userId),
        where('isActive', '==', true)
      );
      
      const snapshot = await getDocs(q);
      const favorites = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
  
      return { success: true, data: favorites };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };


  // Add to foodController.js

// Cart collection reference
const cartsCollection = collection(db, 'carts');

export const addToCart = async (userId, foodItem, quantity) => {
    try {
      if (!userId) throw new Error('User ID is required');
      if (!foodItem?.id) throw new Error('Food item is required');
      if (!quantity || quantity < 1) throw new Error('Invalid quantity');
  
      const cartRef = doc(cartsCollection, userId);
      const cartSnap = await getDoc(cartRef);
  
      // Prepare cart item data without timestamp
      const cartItem = {
        foodId: foodItem.id,
        name: foodItem.title || foodItem.name || 'Unknown Item',
        price: Number(foodItem.price) || 0,
        image: foodItem.image || 'https://via.placeholder.com/150',
        quantity: Number(quantity),
        totalPrice: (Number(foodItem.price) || 0) * Number(quantity)
        // Removed addedAt from here
      };
  
      if (cartSnap.exists()) {
        const cartData = cartSnap.data();
        const existingItems = cartData.items || [];
        const existingItemIndex = existingItems.findIndex(item => item.foodId === foodItem.id);
  
        if (existingItemIndex >= 0) {
          // Update existing item
          const updatedItems = [...existingItems];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + cartItem.quantity,
            totalPrice: updatedItems[existingItemIndex].totalPrice + cartItem.totalPrice
          };
  
          await updateDoc(cartRef, {
            items: updatedItems,
            updatedAt: serverTimestamp() // Timestamp only at document level
          });
        } else {
          // Add new item
          await updateDoc(cartRef, {
            items: [...existingItems, cartItem],
            updatedAt: serverTimestamp() // Timestamp only at document level
          });
        }
      } else {
        // Create new cart
        await setDoc(cartRef, {
          userId,
          items: [cartItem],
          createdAt: serverTimestamp(), // Document-level timestamp
          updatedAt: serverTimestamp() // Document-level timestamp
        });
      }
  
      return { success: true };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, error: error.message };
    }
  };

export const getCart = async (userId) => {
  try {
    if (!userId) throw new Error('User ID is required');

    const cartRef = doc(cartsCollection, userId);
    const cartSnap = await getDoc(cartRef);

    if (!cartSnap.exists()) {
      return { success: true, data: { items: [] } }; // Return empty cart if doesn't exist
    }

    return { success: true, data: cartSnap.data() };
  } catch (error) {
    return { success: false, error: error.message };
  }
};


// Add to foodController.js
export const clearCart = async (userId) => {
    try {
      if (!userId) throw new Error('User ID is required');
  
      const cartRef = doc(cartsCollection, userId);
      const cartSnap = await getDoc(cartRef);
  
      if (!cartSnap.exists()) {
        return { success: true }; // Cart already empty
      }
  
      await updateDoc(cartRef, {
        items: [],
        updatedAt: serverTimestamp()
      });
  
      return { success: true };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { success: false, error: error.message };
    }
  };
  






// Add to foodController.js
const ordersCollection = collection(db, 'orders');

export const createOrder = async (userId, cartItems, total, deliveryAddress, paymentMethod) => {
  try {
    if (!userId) throw new Error('User ID is required');
    if (!cartItems || cartItems.length === 0) throw new Error('Cart is empty');
    
    const orderRef = doc(ordersCollection);
    const orderData = {
      orderId: orderRef.id,
      userId,
      items: cartItems.map(item => ({
        foodId: item.foodId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      subtotal: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      deliveryFee: 2.99,
      tax: total * 0.08,
      total,
      status: 'processing', // processing, shipped, delivered, cancelled
      deliveryAddress: deliveryAddress || {},
      paymentMethod: paymentMethod || 'card',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(orderRef, orderData);
    
    // Clear the cart after successful order
    await clearCart(userId);
    
    return { 
      success: true, 
      orderId: orderRef.id 
    };
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, error: error.message };
  }
};


export const getUserOrders = async (userId) => {
  try {
    if (!userId) throw new Error('User ID is required');
    
    const q = query(
      ordersCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore timestamp to JS Date
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    }));
    
    return { success: true, data: orders };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getOrderDetails = async (orderId) => {
  try {
    if (!orderId) throw new Error('Order ID is required');
    
    const orderRef = doc(ordersCollection, orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) {
      throw new Error('Order not found');
    }
    
    // Get full food details for each item
    const itemsWithDetails = await Promise.all(
      orderSnap.data().items.map(async item => {
        const foodResult = await getFood(item.foodId);
        return {
          ...item,
          foodDetails: foodResult.success ? foodResult.data : null
        };
      })
    );
    
    return { 
      success: true, 
      data: {
        ...orderSnap.data(),
        items: itemsWithDetails,
        createdAt: orderSnap.data().createdAt?.toDate() || new Date(),
        updatedAt: orderSnap.data().updatedAt?.toDate() || new Date()
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};


