import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView,ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getOrderDetails } from '../../Controllers/foodController'; // Adjust the import path as necessary

const OrderConfirmationScreen = ({ route, navigation }) => {
  const { orderId, total } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const result = await getOrderDetails(orderId);
        if (result.success) {
          setOrder(result.data);
        } else {
          Alert.alert("Error", result.error || "Failed to load order details");
        }
      } catch (error) {
        Alert.alert("Error", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <LinearGradient colors={["#4B89DC", "#3A6BC5", "#2A4D8F", "#1A3366"]} style={styles.container}>
        <ActivityIndicator size="large" color="white" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#4B89DC", "#3A6BC5", "#2A4D8F", "#1A3366"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
            <Text style={styles.title}>Order Confirmed!</Text>
            <Text style={styles.subtitle}>Your order has been placed successfully</Text>
          </View>
          
          <View style={styles.orderInfo}>
            <Text style={styles.infoText}>Order #: {orderId}</Text>
            <Text style={styles.infoText}>Total: ${total}</Text>
            <Text style={styles.infoText}>Status: {order?.status || 'processing'}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.trackButton}
            onPress={() => navigation.navigate('OrderTracking', { orderId })}
          >
            <Text style={styles.trackButtonText}>Track Your Order</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.homeButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
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
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginTop: 5,
  },
  orderInfo: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    marginBottom: 30,
  },
  infoText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
  },
  trackButton: {
    backgroundColor: '#FF4500',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  trackButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  homeButton: {
    borderWidth: 1,
    borderColor: 'white',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  homeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default OrderConfirmationScreen;