import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getUserOrders } from '../../Controllers/foodController';
import { auth } from '../../Firebase/FirebaseConfig';

const OrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUserId(currentUser.uid);
      fetchOrders(currentUser.uid);
    }
  }, []);

  const fetchOrders = async (userId) => {
    try {
      setLoading(true);
      const result = await getUserOrders(userId);
      if (result.success) {
        setOrders(result.data);
      } else {
        Alert.alert("Error", result.error || "Failed to load orders");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.orderItem}
      onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item.id.substring(0, 8)}</Text>
        <Text style={styles.orderDate}>
          {item.createdAt.toLocaleDateString()}
        </Text>
      </View>
      
      <View style={styles.orderStatus}>
        <Text style={[
          styles.statusText,
          item.status === 'delivered' && styles.deliveredStatus,
          item.status === 'cancelled' && styles.cancelledStatus
        ]}>
          {item.status.toUpperCase()}
        </Text>
        <Text style={styles.orderTotal}>${item.total.toFixed(2)}</Text>
      </View>
      
      <FlatList
        data={item.items.slice(0, 2)}
        renderItem={({ item: orderItem }) => (
          <View style={styles.orderProduct}>
            <Image 
              source={{ uri: orderItem.image || 'https://via.placeholder.com/50' }} 
              style={styles.productImage} 
            />
            <Text style={styles.productName}>
              {orderItem.name} × {orderItem.quantity}
            </Text>
          </View>
        )}
        keyExtractor={(item) => item.foodId}
      />
      
      {item.items.length > 2 && (
        <Text style={styles.moreItems}>
          +{item.items.length - 2} more items
        </Text>
      )}
    </TouchableOpacity>
  );

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
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Orders</Text>
        </View>
        
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="rgba(255,255,255,0.5)" />
            <Text style={styles.emptyText}>No orders yet</Text>
            <Text style={styles.emptySubtext}>
              Your completed orders will appear here
            </Text>
            <TouchableOpacity 
              style={styles.shopButton}
              onPress={() => navigation.navigate('FoodList')}
            >
              <Text style={styles.shopButtonText}>Browse Menu</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={orders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: '#FF4500',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContent: {
    padding: 16,
  },
  orderItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderId: {
    color: 'white',
    fontWeight: 'bold',
  },
  orderDate: {
    color: 'rgba(255,255,255,0.7)',
  },
  orderStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusText: {
    color: '#FFA500',
    fontWeight: 'bold',
  },
  deliveredStatus: {
    color: '#4CAF50',
  },
  cancelledStatus: {
    color: '#F44336',
  },
  orderTotal: {
    color: 'white',
    fontWeight: 'bold',
  },
  orderProduct: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  productName: {
    color: 'white',
    flex: 1,
  },
  moreItems: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },
});

export default OrdersScreen;