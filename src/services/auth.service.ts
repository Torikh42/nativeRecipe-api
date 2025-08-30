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

    // Remove redirectTo from the response if it exists, as it's not needed for mobile app
    if (data.session && data.session.user && (data.session as any).redirectTo) {
      delete (data.session as any).redirectTo;
    }

    // Jika pendaftaran berhasil, buat entri di tabel 'User' kustom
    if (data.user) {
      const { error: profileError } = await supabase.from("User").insert({
        id: data.user.id, // Gunakan ID dari Supabase Auth
        email: data.user.email, // Simpan email juga
        created_at: new Date().toISOString(), // Simpan tanggal pembuatan
      });

      if (profileError) {
        // Log error tetapi jangan hentikan pendaftaran utama
        console.error("Error creating user profile:", profileError.message)
      } else {
        console.log("User profile created successfully for:", data.user.email);
      } 
    } else {
      console.log("No user data returned");

    }

    return data;
  },

  async signIn(credentials: AuthCredentials) {
    console.log("Attempting Supabase sign-in for:", credentials.email); // Log 1
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      console.error("Supabase sign-in error:", error); // Log 2: Log the entire error object
      throw new AppError(error.message, 401); // 401 Unauthorized
    }
    console.log("Supabase sign-in successful. Data:", data); // Log 3: Log the entire data object
    return data;
  },
};
