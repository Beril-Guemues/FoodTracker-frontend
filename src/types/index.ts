export interface Product {
  id?: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
}

export interface FoodEntry {
  id?: number;
  product: Product;
  amount: number;
  date: string;
}

export interface Goal {
  id?: number;
  type: 'abnehmen' | 'zunehmen' | 'muskeln_aufbauen' | 'gesund_ernaehren';
  userProfile: UserProfile;
}

export interface UserProfile {
  id?: number;
  weight: number;
  gender: 'male' | 'female';
  age: number;
  height: number;
  targetWeight: number;
  calorieNeed?: number;
  waterNeed?: number;
}

export interface OffProduct {
  code: string;
  product_name: string;
  nutriments?: {
    'energy-kcal_100g'?: number;
    'proteins_100g'?: number;
    'carbohydrates_100g'?: number;
  };
}
