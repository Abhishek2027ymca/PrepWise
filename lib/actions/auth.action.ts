"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

// Session duration (1 week)
const SESSION_DURATION = 60 * 60 * 24 * 7;

// ============================================================================
// ✅ ADD THESE INTERFACES (for type safety)
// ============================================================================

interface SignInResponse {
  success: boolean;
  message: string;
}

interface SignUpResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// Set session cookie
// ============================================================================

export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  // Create session cookie
  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION * 1000, // milliseconds
  });

  // Set cookie in the browser
  cookieStore.set("session", sessionCookie, {
    maxAge: SESSION_DURATION,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

// ============================================================================
// ✅ Sign up with added return type
// ============================================================================

export async function signUp(params: SignUpParams): Promise<SignUpResponse> {
  const { uid, name, email } = params;

  try {
    // check if user exists in db
    const userRecord = await db.collection("users").doc(uid).get();
    if (userRecord.exists)
      return {
        success: false,
        message: "User already exists. Please sign in.",
      };

    // save user to db
    await db.collection("users").doc(uid).set({
      name,
      email,
      // profileURL,
      // resumeURL,
    });

    return {
      success: true,
      message: "Account created successfully. Please sign in.",
    };
  } catch (error: any) {
    console.error("Error creating user:", error);

    // Handle Firebase specific errors
    if (error.code === "auth/email-already-exists") {
      return {
        success: false,
        message: "This email is already in use",
      };
    }

    return {
      success: false,
      message: "Failed to create account. Please try again.",
    };
  }
}

// ============================================================================
// ✅ FIX #1: COMPLETE FIXED signIn() FUNCTION
// ============================================================================
// 
// CHANGES MADE:
// 1. ✅ Added return type: Promise<SignInResponse>
// 2. ✅ Added return statement after setSessionCookie() - THIS WAS MISSING!
// 3. ✅ Fixed error logging from console.log("") to console.error()
//
// BUG: Function used to end after setSessionCookie() with no return
//      This made it return undefined, so frontend thought login failed
//      even though it actually succeeded!

export async function signIn(params: SignInParams): Promise<SignInResponse> {
  const { email, idToken } = params;

  try {
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord)
      return {
        success: false,
        message: "User does not exist. Create an account.",
      };

    await setSessionCookie(idToken);

    // ✅ FIX: ADD THIS RETURN STATEMENT
    // Before: Function ended here with no return = undefined
    // After: Return success: true so frontend knows login worked
    return {
      success: true,
      message: "Signed in successfully.",
    };
  } catch (error: any) {
    // ✅ FIX: LOG ACTUAL ERROR
    // Before: console.log("") - useless for debugging
    // After: console.error("Sign-in error:", error) - shows what went wrong
    console.error("Sign-in error:", error);

    return {
      success: false,
      message: "Failed to log into account. Please try again.",
    };
  }
}

// ============================================================================
// Sign out user by clearing the session cookie
// ============================================================================

export async function signOut(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete("session");
}

// ============================================================================
// Get current user from session cookie
// ============================================================================

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    // get user info from db
    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.uid)
      .get();
    if (!userRecord.exists) return null;

    return {
      ...userRecord.data(),
      id: userRecord.id,
    } as User;
  } catch (error) {
    console.log(error);

    // Invalid or expired session
    return null;
  }
}

// ============================================================================
// Check if user is authenticated
// ============================================================================

export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}



// ```

// ---

// ## 📋 WHAT CHANGED:
// ```
// Line 7-13:   ✅ ADD SignInResponse interface
// Line 15-19:  ✅ ADD SignUpResponse interface
// Line 44:     ✅ ADD return type to signUp()
// Line 79:     ✅ ADD return type to signIn()
// Line 100:    ✅ ADD return statement after setSessionCookie()
// Line 103:    ✅ FIX console.log("") to console.error()
// ```

// ---

// ## 🧪 HOW TO APPLY:

// **Step 1:** Open your file:
// ```
// lib/actions/auth.action.ts