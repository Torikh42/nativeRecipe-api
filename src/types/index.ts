export interface UserProfile {
  full_name: string;
  email: string;
}

export interface Recipe {
  id: string;
  created_at: string;
  owner_id: string;
  title: string;
  description: string;
  instructions: string;
  image_url?: string;
  User?: UserProfile; 
}

export interface Ingredient {
  id: string;
  created_at: string;
  recipe_id: string;
  name: string;
  quantity: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
  fullName?: string; 
}
