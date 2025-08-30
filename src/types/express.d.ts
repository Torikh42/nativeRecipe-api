import { User } from "@supabase/supabase-js";

// Ini akan menambahkan properti 'user' ke dalam interface Request dari Express
declare global {
  namespace Express {
    export interface Request {
      user?: User;
    }
  }
}
