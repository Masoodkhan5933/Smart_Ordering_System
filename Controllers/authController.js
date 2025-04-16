// controllers/authController.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateEmail,
  updatePassword,
} from "firebase/auth";

import { getUserProfile } from "./userController";
import { auth } from "../Firebase/FirebaseConfig";
import { createUserProfile } from "./userController";
export const register = async (userData) => {
  try {
    // 1. Create authentication record
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );

    // 2. Prepare profile data (excluding password)
    const profileData = {
      uid: userCredential.user.uid,
      name: userData.name,
      email: userData.email,
      mobile: userData.mobile,
      userType: userData.userType || "user", // Default to 'user' if not provided
      createdAt: new Date().toISOString(),
      // Add any additional fields you want to store
    };

    // 3. Create user profile in Firestore
    await createUserProfile(userCredential.user.uid,profileData);

    return {
      success: true,
      user: userCredential.user,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const userData = await getUserProfile(userCredential.user.uid);
    console.log("User Data:", userData);
    if (!userData.success) {
        throw new Error(userData.error || "Failed to fetch user profile");
        }
    return { success: true, user: userCredential.user,userData: userData.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateUserEmail = async (newEmail) => {
  try {
    await updateEmail(auth.currentUser, newEmail);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateUserPassword = async (newPassword) => {
  try {
    await updatePassword(auth.currentUser, newPassword);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
