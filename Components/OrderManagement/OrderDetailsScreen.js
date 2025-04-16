import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getOrderDetails } from '../../Controllers/foodController';

const OrderDetailsScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
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

    fetchOrderDetails();
  }, [orderId]);

  if (loading || !order) {
    return (
      <LinearGradient colors={["#4B89DC", "#3A6BC5", "#2A4D8F", "#1A3366"]} style={styles.container}>
        <ActivityIndicator size="large" color="white" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#4B89DC", "#3A6BC5", "#2A4D8F", "#1A3366"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
        </View>
        
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>Order #{order.id.substring(0, 8)}</Text>
            <Text style={styles.orderDate}>
              Placed on {order.createdAt.toLocaleDateString()} at {order.createdAt.toLocaleTimeString()}
            </Text>
            
            <View style={styles.statusContainer}>
              <Text style={[
                styles.statusText,
                order.status === 'delivered' && styles.deliveredStatus,
                order.status === 'cancelled' && styles.cancelledStatus
              ]}>
                {order.status.toUpperCase()}
              </Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <View style={styles.addressContainer}>
              <Text style={styles.addressText}>
                {order.deliveryAddress.street}
              </Text>
              <Text style={styles.addressText}>
                {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
              </Text>
              <Text style={styles.addressText}>
                {order.deliveryAddress.country}
              </Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <Text style={styles.paymentMethod}>
              {order.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Cash on Delivery'}
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Items</Text>
            {order.items.map((item) => (
              <View key={item.foodId} style={styles.orderItem}>
                <Image 
                  source={{ uri: item.image || 'https://via.placeholder.com/80' }} 
                  style={styles.itemImage} 
                />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>${item.price.toFixed(2)} × {item.quantity}</Text>
                </View>
                <Text style={styles.itemTotal}>
                  ${(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
          
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${order.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>${order.deliveryFee.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax</Text>
              <Text style={styles.summaryValue}>${order.tax.toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${order.total.toFixed(2)}</Text>
            </View>
          </View>
        </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  orderInfo: {
    marginBottom: 24,
  },
  orderId: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderDate: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  statusContainer: {
    marginTop: 12,
  },
  statusText: {
    color: '#FFA500',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deliveredStatus: {
    color: '#4CAF50',
  },
  cancelledStatus: {
    color: '#F44336',
  },
  section: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  addressContainer: {
    marginTop: 8,
  },
  addressText: {
    color: 'white',
    marginBottom: 4,
  },
  paymentMethod: {
    color: 'white',
    marginTop: 8,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    color: 'white',
    fontSize: 16,
    marginBottom: 4,
  },
  itemPrice: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  itemTotal: {
    color: 'white',
    fontWeight: 'bold',
  },
  summary: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.7)',
  },
  summaryValue: {
    color: 'white',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    color: 'white',
    fontWeight: 'bold',
  },
  totalValue: {
    color: '#FF4500',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default OrderDetailsScreen;