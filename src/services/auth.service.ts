import { supabase } from "../config/supabase";
import { AppError } from "../utils/errors";
import { AuthCredentials } from "../types";

export const AuthService = {
  async signUp(credentials: AuthCredentials) {
    console.log("Attempting Supabase signup for:", credentials.email);
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      console.error("Supabase signup error:", error.message);
      throw new AppError(error.message, 400);
    }
    console.log("Supabase signup successful. User data:", data.user);

    if (data.user) {
      const { error: profileError } = await supabase.from("User").insert({
        id: data.user.id, 
        email: data.user.email,
        full_name: credentials.fullName, 
      });

      if (profileError) {
        console.error("Error creating user profile:", profileError.message);
        throw new AppError("Could not create user profile.", 500);
      } else {
        console.log("User profile created successfully for:", data.user.email);
      }
    }

    return data;
  },

  async signIn(credentials: AuthCredentials) {
    console.log("Attempting Supabase sign-in for:", credentials.email); 
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      console.error("Supabase sign-in error:", error); 
      throw new AppError(error.message, 401); 
    }
    console.log("Supabase sign-in successful. Data:", data); 
    return data;
  },

  async signOut() {
    console.log("Attempting Supabase sign-out");
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Supabase sign-out error:", error.message);
      throw new AppError(error.message, 500);
    }
    console.log("Supabase sign-out successful");
  },
};
