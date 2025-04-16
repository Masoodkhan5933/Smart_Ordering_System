// controllers/userController.js
import { 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc,
    deleteDoc
  } from 'firebase/firestore';
  import { db } from '../Firebase/FirebaseConfig';
  
  const usersCollection = collection(db, 'users');
  
  export const createUserProfile = async (userId, userData) => {
    try {
      const userRef = doc(usersCollection, userId);
      await setDoc(userRef, userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  export const getUserProfile = async (userId) => {
    try {
      const userRef = doc(usersCollection, userId);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        return { success: true, data: docSnap.data() };
      } else {
        return { success: false, error: 'User not found' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  export const updateUserProfile = async (userId, updatedData) => {
    try {
      const userRef = doc(usersCollection, userId);
      await updateDoc(userRef, updatedData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  export const deleteUserProfile = async (userId) => {
    try {
      const userRef = doc(usersCollection, userId);
      await deleteDoc(userRef);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };