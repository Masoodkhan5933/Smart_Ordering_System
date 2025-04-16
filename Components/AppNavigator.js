import 'react-native-gesture-handler';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from './LoginScreen/loginScreen';
import SignupScreen from './SignupScreen/signupScreen';
import HomeScreen from './HomeScreen/HomeScreen';
import FoodCard from './FoodManagement/FoodCard';
import FoodDetailsScreen from './FoodManagement/FoodDetailsScreen';
import FoodListScreen from './FoodManagement/FoodListScreen';
import AddFoodScreen from './FoodManagement/AddFoodScreen';
import CartScreen from './FoodManagement/CartScreen';
import OrderConfirmationScreen from './FoodManagement/orderConfirmationScreen';
import OrderDetailsScreen from './OrderManagement/OrderDetailsScreen';
import OrdersScreen from './OrderManagement/OrdersScreen';
const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#ffffff' }
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="FoodCard" component={FoodCard} />
        <Stack.Screen name="FoodDetails" component={FoodDetailsScreen} />
        <Stack.Screen name="FoodList" component={FoodListScreen} />
        <Stack.Screen name="AddFood" component={AddFoodScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
        <Stack.Screen name="Orders" component={OrdersScreen} />
      </Stack.Navigator>
  );
}