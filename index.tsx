import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  ChefHat, 
  ShoppingCart, 
  Clock, 
  Search, 
  Menu, 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ChevronRight, 
  Star, 
  UtensilsCrossed, 
  Coffee, 
  Flame, 
  Users, 
  LayoutDashboard, 
  ClipboardList, 
  Settings, 
  LogOut,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Info,
  Printer,
  MapPin,
  DollarSign,
  Leaf,
  Croissant,
  Egg,
  Cookie,
  Carrot,
  GlassWater,
  Pizza,
  Soup,
  Drumstick,
  ChevronUp,
  ChevronDown,
  Download,
  Calendar,
  Package,
  Edit,
  Save,
  Upload,
  FileSpreadsheet,
  List,
  Activity,
  TrendingUp,
  Bed,
  ArrowUp
} from 'lucide-react';

// --- Types ---

type Category = 'Breakfast' | 'Maggi' | 'Salad' | 'Raita' | 'Rice' | 'Noodles' | 'Main Course' | 'Tandoor' | 'Chinese' | 'Soups' | 'Fries' | 'Beverages (Cold)' | 167
  | 'Shakes/Lassi' | 'Desserts' | 'Eggs' | 'Non-Veg Main' | 'Mutton' | 'Burgers' | 'Pasta' | 'Momos' | 'Pizza' | 'Breads' | 'Stay';

interface Ingredient {
  id: string;
  name: string;
  category: 'Dairy' | 'Vegetable' | 'Protein' | 'Grain' | 'Spice' | 'Sauce' | 'Other';
  inStock: boolean;
  unit: string;
}

interface MenuItem {
  name: string;
  price: number;
  category: Category;
  isVeg: boolean;
  available: boolean;
  description: string;
  prepTime: number; // minutes
  id: string;
  requiredIngredients: string[]; // IDs of ingredients
  missingIngredients?: string[]; // Computed field
}

interface CartItem extends MenuItem {
  quantity: number;
}

type ServiceType = 'Dine-in' | 'Takeaway' | 'Delivery';

interface CustomerInfo {
    name: string;
    phone: string;
    serviceType: ServiceType;
    tableNumber?: string;
}

interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  timestamp: Date;
  customerInfo: CustomerInfo;
  estimatedTime?: number; // minutes
}
181interface InventoryItem {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    area: 'Rooms' | 'Kitchen' | 'Open Area';
    category: string;
    purchaseDate: string;
    cost: number;
    supplier: string;
    status: 'Good' | 'Needs Replacement' | 'Damaged';
}

// --- Constants & Data ---

// Master Ingredient List
const MASTER_INGREDIENTS: Ingredient[] = [
  // Dairy
  { id: 'ing_milk', name: 'Milk', category: 'Dairy', inStock: true, unit: 'L' },
  { id: 'ing_cheese', name: 'Cheese', category: 'Dairy', inStock: true, unit: 'kg' },
  { id: 'ing_butter', name: 'Butter', category: 'Dairy', inStock: true, unit: 'kg' },
  { id: 'ing_paneer', name: 'Paneer', category: 'Dairy', inStock: true, unit: 'kg' },
  { id: 'ing_cream', name: 'Fresh Cream', category: 'Dairy', inStock: true, unit: 'L' },
  { id: 'ing_dahi', name: 'Curd (Dahi)', category: 'Dairy', inStock: true, unit: 'kg' },
  // Vegetables
  { id: 'ing_onion', name: 'Onion', category: 'Vegetable', inStock: true, unit: 'kg' },
  { id: 'ing_tomato', name: 'Tomato', category: 'Vegetable', inStock: true, unit: 'kg' },
  { id: 'ing_potato', name: 'Potato', category: 'Vegetable', inStock: true, unit: 'kg' },
  { id: 'ing_capsicum', name: 'Capsicum', category: 'Vegetable', inStock: true, unit: 'kg' },
  { id: 'ing_mushroom', name: 'Mushroom', category: 'Vegetable', inStock: true, unit: 'kg' },
  { id: 'ing_cucumber', name: 'Cucumber', category: 'Vegetable', inStock: true, unit: 'kg' },
  { id: 'ing_spinach', name: 'Spinach (Palak)', category: 'Vegetable', inStock: true, unit: 'kg' },
  { id: 'ing_coriander', name: 'Coriander', category: 'Vegetable', inStock: true, unit: 'kg' },
  { id: 'ing_lemon', name: 'Lemon', category: 'Vegetable', inStock: true, unit: 'pcs' },
  { id: 'ing_garlic', name: 'Garlic', category: 'Vegetable', inStock: true, unit: 'kg' },
  { id: 'ing_ginger', name: 'Ginger', category: 'Vegetable', inStock: true, unit: 'kg' },
  { id: 'ing_chilli', name: 'Green Chilli', category: 'Vegetable', inStock: true, unit: 'kg' },
  // Proteins
  { id: 'ing_chicken', name: 'Chicken', category: 'Protein', inStock: true, unit: 'kg' },
  { id: 'ing_mutton', name: 'Mutton', category: 'Protein', inStock: true, unit: 'kg' },
  { id: 'ing_egg', name: 'Eggs', category: 'Protein', inStock: true, unit: 'tray' },
  // Grains & Breads
  { id: 'ing_bread', name: 'Bread', category: 'Grain', inStock: true, unit: 'pack' },
  { id: 'ing_rice', name: 'Rice', category: 'Grain', inStock: true, unit: 'kg' },
  { id: 'ing_noodles', name: 'Noodles', category: 'Grain', inStock: true, unit: 'pack' },
  { id: 'ing_pasta', name: 'Pasta', category: 'Grain', inStock: true, unit: 'pack' },
  { id: 'ing_flour', name: 'Atta/Maida', category: 'Grain', inStock: true, unit: 'kg' },
  { id: 'ing_maggi', name: 'Maggi Pack', category: 'Grain', inStock: true, unit: 'pack' },
  // Pantry
  { id: 'ing_sugar', name: 'Sugar', category: 'Other', inStock: true, unit: 'kg' },
  { id: 'ing_tea', name: 'Tea Leaves', category: 'Other', inStock: true, unit: 'kg' },
  { id: 'ing_coffee', name: 'Coffee Powder', category: 'Other', inStock: true, unit: 'kg' },
  { id: 'ing_oil', name: 'Cooking Oil', category: 'Other', inStock: true, unit: 'L' },
  { id: 'ing_chocolate', name: 'Chocolate Syrup', category: 'Sauce', inStock: true, unit: 'btl' },
  { id: 'ing_mayo', name: 'Mayonnaise', category: 'Sauce', inStock: true, unit: 'btl' },
  { id: 'ing_ketchup', name: 'Ketchup', category: 'Sauce', inStock: true, unit: 'btl' },
];

// Helper to find ingredient IDs
const getIngIds = (names: string[]): string[] => {
    return names.map(n => MASTER_INGREDIENTS.find(i => i.name.toLowerCase().includes(n.toLowerCase()))?.id || '').filter(id => id !== '');
}

const RAW_MENU_DATA: { [key in Category]?: [string, number, string?, string?][] } = {
  'Beverages (Hot)': [
    ['Masala Chai', 50, '5 mins', 'Spiced Indian tea'],
    ['Hot Coffee', 80, '5 mins', 'Steaming hot cappuccino']
  ],
  'Breakfast': [
    ['Butter Toast', 90, '10 mins', 'Crispy toast served with generous butter'],    ['Nutella Sandwich', 160, '10 mins', 'Loaded with creamy Nutella spread'],
    ['Cheese Toast', 120, '10 mins', 'Topped with melted mozzarella cheese'],
    ['Aloo Paratha', 180, '15 mins', 'Stuffed with spiced mashed potatoes'],    ['Mix Veg Paratha', 120, '15 mins', 'Stuffed with mixed vegetables'],
    ['Mix Veg Paratha', 200, '15 mins', 'Stuffed with mixed vegetables'],
    ['Paneer Paratha', 220, '15 mins', 'Stuffed with fresh spiced paneer'],
    ['Gobhi Paratha', 180, '15 mins', 'Stuffed with spiced cauliflower'],
    ['Pizza Paratha', 280, '20 mins', 'Fusion paratha with pizza fillings'],
    ['Butter Roti', 50, '10 mins', 'Soft wheat flatbread with butter'],
    ['Plain Roti', 40, '10 mins', 'Traditional soft wheat flatbread'] ,
    'Maggi': [
    ['Plain Maggi', 90, '10 mins', 'Classic comfort food'],
    ['Cheese Maggi', 140, '10 mins', 'Loaded with grated cheese'],
    ['Vegetable Maggi', 120, '15 mins', 'Cooked with fresh garden veggies'],
    ['Egg Maggi', 140, '15 mins', 'Classic Maggi with scrambled eggs'],
    ['Chicken Maggi', 200, '20 mins', 'Maggi with tender chicken chunks']  ],
  'Salad': [
    ['Mix Veg Salad', 100, '10 mins', 'Fresh seasonal vegetables'],
    ['Onion Salad', 60, '5 mins', 'Sliced onions with lemon and spices'],
    ['Cucumber Salad', 80, '5 mins', 'Fresh crunchy cucumber slices'],
    ['Cucumber with Black Pepper Mayo', 120, '10 mins', 'Cucumber tossed in creamy mayo']
  ],
  'Raita': [
    ['Plain Dahi', 80, '5 mins', 'Fresh homemade yogurt'],
    ['Jeera Raita', 100, '5 mins', 'Yogurt spiced with roasted cumin'],
    ['Boondi Raita', 120, '5 mins', 'Yogurt with crispy chickpea pearls'],
    ['Mix Veg Raita', 140, '10 mins', 'Yogurt with chopped vegetables']
  ],
  'Rice': [
    ['Plain Rice', 120, '15 mins', 'Steamed basmati rice'],
    ['Jeera Rice', 160, '15 mins', 'Rice tempered with cumin seeds'],
    ['Garlic Lemon Rice', 180, '20 mins', 'Tangy and garlicky fried rice'],
    ['Veg Fried Rice', 240, '20 mins', 'Wok-tossed rice with veggies'],
    ['Mushroom Fried Rice', 280, '20 mins', 'Fried rice with fresh mushrooms'],
    ['Onion Fried Rice', 200, '20 mins', 'Fried rice with caramelized onions'],
    ['Egg Fried Rice', 280, '20 mins', 'Wok-tossed rice with eggs'],
    ['Chicken Fried Rice', 320, '25 mins', 'Fried rice with chicken chunks']
  ],
  'Noodles': [
    ['Veg Fried Noodles', 240, '20 mins', 'Stir-fried noodles with veggies'],
    ['Mushroom Noodles', 280, '20 mins', 'Noodles tossed with mushrooms'],
    ['Egg Fried Noodles', 280, '20 mins', 'Noodles stir-fried with eggs']
  ],
  'Main Course': [
    ['Paneer Methi', 360, '30 mins', 'Paneer cooked with fenugreek leaves'],
    ['Paneer Butter', 400, '30 mins', 'Rich tomato-based paneer gravy'],
    ['Paneer Hotel Style', 400, '30 mins', 'Spicy restaurant-style paneer'],
    ['Kadai Paneer', 400, '30 mins', 'Paneer cooked with bell peppers'],
    ['Mix Veg', 300, '25 mins', 'Assorted vegetables in spiced gravy'],
    ['Navratna Korma', 360, '30 mins', 'Rich creamy curry with fruits/nuts'],
    ['Malai Kofta', 380, '35 mins', 'Potato-paneer balls in white gravy'],
    ['Mutter Paneer', 360, '30 mins', 'Peas and paneer in tomato gravy'],
    ['Shahi Paneer', 420, '30 mins', 'Royal creamy paneer curry'],
    ['Butter Paneer Masala', 420, '30 mins', 'Rich buttery paneer gravy'],
    ['Dal Fry', 240, '20 mins', 'Yellow lentils tempered with spices'],
    ['Dal Tadka', 260, '20 mins', 'Yellow lentils with garlic tadka']
  ],
  'Tandoor': [
    ['Mushroom Tikka', 400, '30 mins', 'Char-grilled spiced mushrooms'],
    ['Masala Aloo', 300, '25 mins', 'Spiced tandoori potatoes'],
    ['Angara Paneer Tikka', 440, '30 mins', 'Spicy smoked paneer tikka'],
    ['Malai Paneer Tikka', 440, '30 mins', 'Creamy mild paneer tikka'],
    ['Paneer Garlic Tikka', 440, '30 mins', 'Garlic infused paneer tikka'],
    ['Tandoori Aloo', 280, '25 mins', 'Marinated potatoes roasted in clay oven'],
    ['Tandoori Malai Chicken', 480, '35 mins', 'Creamy grilled chicken'],
    ['Ginger Garlic Chicken', 480, '35 mins', 'Chicken with strong ginger garlic flavors'],
    ['Kali Mirch Chicken', 480, '35 mins', 'Peppery tandoori chicken'],
    ['Mutton Seekh Kebab', 560, '35 mins', 'Minced mutton skewers']
  ],
  'Chinese': [
    ['Chilly Paneer', 360, '25 mins', 'Crispy paneer in spicy soy sauce'],
    ['Honey Crispy Potato', 300, '20 mins', 'Sweet and spicy crispy potatoes'],
    ['Chilly Baby Corn', 320, '25 mins', 'Crispy baby corn in chili sauce'],
    ['Chilly Chicken Boneless', 440, '30 mins', 'Spicy boneless chicken'],
    ['Chilly Chicken With Bone', 400, '30 mins', 'Traditional chili chicken']
  ],
  'Soups': [
    ['Tomato Soup', 160, '15 mins', 'Classic creamy tomato soup'],
    ['Veg Soup', 180, '15 mins', 'Mixed vegetable soup']
  ],
  'Fries': [
    ['French Fries', 160, '15 mins', 'Crispy golden potato fries'],
    ['Masala Fries', 200, '15 mins', 'Fries tossed in spicy masala'],
    ['Cheese Fries', 240, '15 mins', 'Fries topped with melted cheese']
  ],
  'Beverages (Cold)': [
    ['Blue Crushers', 200, '5 mins', 'Refreshing blue curacao drink'],
    ['Mint Mojito', 240, '5 mins', 'Minty lime refresher'],
    ['Kiwi Mojito', 260, '5 mins', 'Kiwi flavored mojito'],
    ['Green Apple Mojito', 260, '5 mins', 'Green apple flavored mojito'],
    ['Spicy Mango Soda', 200, '5 mins', 'Mango soda with a spicy kick'],
    ['Fresh Lime Soda', 160, '5 mins', 'Classic lemon soda'],
    ['Coconut Water', 120, '5 mins', 'Fresh tender coconut water'],
    ['Cold Coffee', 240, '10 mins', 'Chilled creamy coffee']
  ],
  'Shakes/Lassi': [
    ['Banana Shake', 200, '10 mins', 'Creamy fresh banana shake'],
    ['Chocobar Shake', 240, '10 mins', 'Shake made with chocobar ice cream'],
    ['Papaya Shake', 200, '10 mins', 'Fresh papaya shake'],
    ['Sweet Lassi', 160, '10 mins', 'Traditional sweet yogurt drink']
  ],
  'Desserts': [
    ['Ice Cream', 160, '5 mins', 'Scoop of vanilla/chocolate ice cream'],
    ['Gulab Jamun', 120, '5 mins', 'Warm sweet syrup dumplings']
  ],
  'Eggs': [
      ['Egg Sandwich', 140, '15 mins', 'Sandwich with boiled/fried egg'],
      ['Omelette Simple', 80, '10 mins', 'Basic beaten egg omelette'],
      ['Omelette Plain', 100, '10 mins', 'Seasoned plain omelette'],
      ['Omelette Loaded', 160, '15 mins', 'Omelette with veggies and cheese'],
      ['Omelette Cheese', 140, '15 mins', 'Cheesy fluffy omelette'],
      ['Omelette Pepper', 120, '10 mins', 'Omelette with black pepper'],
      ['Omelette Butter', 120, '10 mins', 'Butter fried omelette'],
      ['Egg Bhurji', 160, '15 mins', 'Spiced scrambled eggs'],
      ['Egg Curry', 200, '25 mins', 'Boiled eggs in spicy gravy']
  ],
  'Non-Veg Main': [
      ['Chicken Curry', 440, '35 mins', 'Homestyle chicken curry'],
      ['Chicken Jalfrezi Dry/Gravy', 480, '35 mins', 'Spicy stir-fried chicken with veggies'],
      ['Lemon Chicken Dry/Gravy', 480, '35 mins', 'Tangy lemon flavored chicken'],
      ['Chicken Kebab', 400, '30 mins', 'Spiced minced chicken kebabs']
  ],
  'Mutton': [
      ['Mutton Rogan Josh', 600, '45 mins', 'Kashmiri style mutton curry'],
      ['Mutton Curry', 560, '45 mins', 'Traditional mutton curry'],
      ['Rara Mutton', 640, '45 mins', 'Mutton chunks in minced mutton gravy'],
      ['Mutton Kebab', 500, '35 mins', 'Spiced grilled mutton patties']
  ],
  'Burgers': [
      ['Veg Burger', 130, '15 mins', 'Classic veg patty burger'],
      ['Veg Cheese Burger', 150, '15 mins', 'Veg burger with cheese slice'],
      ['Chicken Burger', 180, '20 mins', 'Crispy chicken patty burger']
  ],
  'Pasta': [
      ['Red Sauce Pasta', 200, '20 mins', 'Pasta in tangy tomato sauce'],
      ['White Sauce Pasta', 300, '20 mins', 'Pasta in creamy white sauce'],
      ['Mixed Sauce Pasta', 320, '20 mins', 'Pasta in pink sauce']
  ],
  'Momos': [
      ['Veg Steamed Momos', 160, '15 mins', 'Steamed dumplings with veg filling'],
      ['Veg Fried Momos', 180, '20 mins', 'Fried crispy momos'],
      ['Chicken Steamed Momos', 200, '20 mins', 'Steamed dumplings with chicken'],
      ['Chicken Fried Momos', 220, '20 mins', 'Fried chicken momos']
  ],
  'Pizza': [
      ['Margherita Pizza', 200, '20 mins', 'Classic cheese and tomato pizza'],
      ['Veggie Delight Pizza', 280, '25 mins', 'Pizza loaded with vegetables'],
      ['Paneer Pizza', 320, '25 mins', 'Pizza topped with spiced paneer']
  ],
  'Breads': [
      ['Butter Naan', 60, '5 mins', 'Leavened flatbread with butter'],
      ['Garlic Naan', 80, '5 mins', 'Naan topped with garlic and butter'],
      ['Tandoori Roti', 30, '5 mins', 'Crispy whole wheat flatbread']
  ],
  'Stay': [
      ['Room - Accommodates up to 3', 1800, 'N/A', '1 Double Bed | Attached Washroom | Cozy & Comfortable (4 Available)'],
      ['Room - Accommodates up to 8', 3500, 'N/A', '2 Double Beds | Attached Bathroom | Spacious & Family Friendly (2 Available)']
  ]
};

// Mapping logic to link menu items to ingredients
const getRecipeIngredients = (itemName: string, category: Category): string[] => {
    const lowerName = itemName.toLowerCase();
    const ids: string[] = [];

    // Basic mapping heuristics
    if (category.includes('Beverages') || category.includes('Shakes')) {
        if (lowerName.includes('coffee') || lowerName.includes('shake') || lowerName.includes('tea') || lowerName.includes('lassi')) ids.push('ing_milk', 'ing_sugar');
        if (lowerName.includes('chocolate')) ids.push('ing_chocolate');
    }
    if (category === 'Maggi') ids.push('ing_maggi');
    if (category === 'Eggs' || lowerName.includes('egg')) ids.push('ing_egg', 'ing_oil', 'ing_onion');
    if (lowerName.includes('paneer')) ids.push('ing_paneer');
    if (lowerName.includes('chicken')) ids.push('ing_chicken');
    if (lowerName.includes('mutton')) ids.push('ing_mutton');
    if (lowerName.includes('cheese') || lowerName.includes('pizza')) ids.push('ing_cheese');
    if (lowerName.includes('sandwich') || lowerName.includes('toast') || lowerName.includes('burger')) ids.push('ing_bread', 'ing_butter');
    if (lowerName.includes('paratha') || lowerName.includes('roti') || lowerName.includes('naan')) ids.push('ing_flour', 'ing_butter');
    if (category === 'Rice' || category === 'Noodles' || lowerName.includes('fried rice')) {
        if (lowerName.includes('rice')) ids.push('ing_rice');
        if (lowerName.includes('noodles')) ids.push('ing_noodles');
        ids.push('ing_oil', 'ing_onion', 'ing_capsicum');
    }
    if (category === 'Main Course' || category === 'Non-Veg Main') ids.push('ing_onion', 'ing_tomato', 'ing_oil', 'ing_ginger', 'ing_garlic');
    
    return [...new Set(ids)]; // Remove duplicates
}

const buildMenu = (): MenuItem[] => {
  const menu: MenuItem[] = [];
  let idCounter = 1;

  (Object.keys(RAW_MENU_DATA) as Category[]).forEach(category => {
    RAW_MENU_DATA[category]?.forEach(item => {
      menu.push({
        name: item[0],
        price: item[1],
        category: category,
        isVeg: !['Non-Veg Main', 'Mutton', 'Eggs', 'Chicken', 'Fish'].includes(category) && 
               !item[0].toLowerCase().includes('chicken') && 
               !item[0].toLowerCase().includes('egg') &&
               !item[0].toLowerCase().includes('mutton'),
        available: true,
        description: item[3] || 'A delicious blend of flavors',
        prepTime: item[2] ? parseInt(item[2]) : 15,
        id: `item_${idCounter++}`,
        requiredIngredients: getRecipeIngredients(item[0], category)
      });
    });
  });

  return menu;
};

// --- Utilities ---

const generateCSV = (data: any[], filename: string) => {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(fieldName => JSON.stringify(row[fieldName], (key, value) => value === null ? '' : value)).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const parseMenuCSV = (csvText: string): Partial<MenuItem>[] => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const items: Partial<MenuItem>[] = [];

    for(let i=1; i<lines.length; i++) {
        if(!lines[i].trim()) continue;
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const item: any = {};
        headers.forEach((h, index) => {
            if (h === 'price' || h === 'prepTime') item[h] = parseFloat(values[index]);
            else if (h === 'available' || h === 'isVeg') item[h] = values[index].toLowerCase() === 'true';
            else item[h] = values[index];
        });
        items.push(item);
    }
    return items;
};

const getCategoryTheme = (category: string) => {
    if (category === 'Stay') return '#FFFFFF'; // White
    if (category.includes('Non-Veg') || category.includes('Chicken') || category.includes('Mutton') || category.includes('Momos')) return '#FF00FF'; // Bright Magenta
    if (category === 'Eggs') return '#FFFF00'; // Bright Yellow
    if (category.includes('Beverages (Hot)') || category.includes('Coffee') || category.includes('Tea')) return '#FF9100'; // Bright Amber
    if (category.includes('Beverages') || category.includes('Mojito') || category.includes('Cold')) return '#00E5FF'; // Bright Cyan
    if (category.includes('Paneer') || category.includes('Veg') || category.includes('Salad') || category.includes('Raita')) return '#00FF00'; // Bright Green
    if (category === 'Burgers' || category === 'Fries' || category === 'Pizza' || category === 'Pasta') return '#FF5500'; // Bright Orange
    if (category === 'Desserts' || category.includes('Shake')) return '#FF0099'; // Bright Pink
    if (category === 'Maggi' || category === 'Noodles') return '#FFFF00'; // Bright Yellow
    if (category === 'Rice' || category === 'Breads' || category === 'Tandoor') return '#FF3333'; // Bright Red
    return '#00E5FF'; // Default Cyan
};

const getCategoryIcon = (category: string) => {
    if (category === 'Stay') return <Bed size={20} />;
    if (category.includes('Beverages (Hot)')) return <Coffee size={20} />;
    if (category.includes('Beverages')) return <GlassWater size={20} />;
    if (category === 'Burgers') return <div className="font-bold text-xs">🍔</div>;
    if (category === 'Pizza') return <Pizza size={20} />;
    if (category === 'Pasta') return <div className="font-bold text-xs">🍝</div>;
    if (category === 'Fries') return <div className="font-bold text-xs">🍟</div>;
    if (category === 'Momos') return <div className="font-bold text-xs">🥟</div>;
    if (category === 'Desserts' || category.includes('Shake')) return <Cookie size={20} />;
    if (category === 'Salad') return <Carrot size={20} />;
    if (category === 'Eggs') return <Egg size={20} />;
    if (category === 'Maggi' || category === 'Noodles') return <div className="font-bold text-xs">🍜</div>;
    if (category.includes('Rice')) return <div className="font-bold text-xs">🍚</div>;
    if (category.includes('Breads')) return <Croissant size={20} />;
    if (category.includes('Non-Veg') || category.includes('Chicken') || category.includes('Mutton')) return <Drumstick size={20} />;
    if (category === 'Soups') return <Soup size={20} />;
    if (category === 'Chinese') return <div className="font-bold text-xs">🥡</div>;
    if (category === 'Tandoor') return <Flame size={20} />;
    return <UtensilsCrossed size={20} />;
};


// --- Components ---

const LoginView = ({ onLogin, onBack }: { onLogin: (type: 'kitchen' | 'admin', save: boolean) => void, onBack: () => void }) => {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(true);

    const handleLogin = () => {
        if (id === 'skylarkcafe' && password === 'kitchen123') {
            onLogin('kitchen', rememberMe);
        } else if (id === 'skylark' && password === 'sanskar321') {
            onLogin('admin', rememberMe);
        } else {
            setError('Invalid Credentials');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
            <div className="bg-zinc-900 p-8 rounded-2xl border border-white/10 shadow-2xl w-full max-w-md relative">
                <button onClick={onBack} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                    <X size={24} />
                </button>
                <h2 className="text-3xl font-bold text-white mb-6 text-center">Secure Login</h2>
                {error && <p className="text-red-500 text-center mb-4 bg-red-500/10 p-2 rounded">{error}</p>}
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-400 text-sm mb-2">User ID</label>
                        <input 
                            type="text" 
                            value={id} 
                            onChange={e => setId(e.target.value)}
                            className="w-full bg-black border border-white/20 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none"
                            placeholder="Enter ID"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-black border border-white/20 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none"
                            placeholder="Enter Password"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            id="remember" 
                            checked={rememberMe} 
                            onChange={e => setRememberMe(e.target.checked)}
                            className="w-4 h-4 accent-cyan-500"
                        />
                        <label htmlFor="remember" className="text-gray-400 text-sm cursor-pointer select-none">Remember Me</label>
                    </div>
                    <button 
                        onClick={handleLogin}
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-lg transition-colors mt-4 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                    >
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
};

const PlaceOrderModal = ({ isOpen, onClose, onSubmit }: { isOpen: boolean, onClose: () => void, onSubmit: (info: CustomerInfo) => void }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [serviceType, setServiceType] = useState<ServiceType>('Dine-in');
    const [tableNumber, setTableNumber] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!name || !phone) return alert('Please fill Name and Phone');
        if (serviceType === 'Dine-in' && !tableNumber) return alert('Please enter Table Number');
        onSubmit({ name, phone, serviceType, tableNumber: serviceType === 'Dine-in' ? tableNumber : undefined });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Place Order</h2>
                    <button onClick={onClose}><X className="text-gray-400" /></button>
                </div>
                <div className="space-y-4">
                    <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white" />
                    <input type="tel" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white" />
                    <div className="grid grid-cols-3 gap-2">
                        {(['Dine-in', 'Takeaway', 'Delivery'] as ServiceType[]).map(type => (
                            <button key={type} onClick={() => setServiceType(type)} className={`p-2 rounded-lg text-sm font-medium border ${serviceType === type ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-transparent text-gray-400 border-zinc-700'}`}>
                                {type}
                            </button>
                        ))}
                    </div>
                    {serviceType === 'Dine-in' && (
                        <input type="text" placeholder="Table Number" value={tableNumber} onChange={e => setTableNumber(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white" />
                    )}
                    <button onClick={handleSubmit} className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.4)]">Confirm Order</button>
                </div>
            </div>
        </div>
    );
};

const OrderConfirmation = ({ orderId, estimatedTime, status, onBack }: { orderId: string, estimatedTime: number, status: Order['status'], onBack: () => void }) => {
    const getStatusStep = () => {
        switch(status) {
            case 'pending': return 1;
            case 'preparing': return 2;
            case 'ready': return 3;
            case 'completed': return 4;
            default: return 0;
        }
    };
    const step = getStatusStep();

    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-8">
            <div className="bg-green-500/20 p-6 rounded-full mb-4 animate-pulse">
                <CheckCircle size={64} className="text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-white">Order Placed!</h2>
            <p className="text-gray-400 text-lg">Order ID: <span className="text-cyan-400 font-mono">#{orderId.slice(-4)}</span></p>
            
            <div className="w-full max-w-md bg-zinc-800 rounded-xl p-6 border border-white/5">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Status</span>
                    <span className="text-white font-bold capitalize">{status}</span>
                </div>
                <div className="w-full bg-black h-2 rounded-full overflow-hidden mb-6">
                    <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-1000"
                        style={{ width: `${step * 25}%` }}
                    />
                </div>
                <p className="text-xl font-bold text-white mb-2">
                    {status === 'ready' ? 'Your Order is Ready!' : `Estimated time: ${estimatedTime} mins`}
                </p>
                <p className="text-sm text-gray-500">
                    {status === 'pending' && 'Waiting for confirmation...'}
                    {status === 'preparing' && 'Chef is preparing your food...'}
                    {status === 'ready' && 'Please collect your order!'}
                    {status === 'completed' && 'Order completed. Enjoy!'}
                </p>
            </div>

            <button onClick={onBack} className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-3 rounded-xl border border-white/10 transition-all">
                Back to Menu
            </button>
        </div>
    );
};

const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        // Find the main scrollable container
        const mainContainer = document.querySelector('.custom-scrollbar.flex-1.min-h-0.min-w-0');
        if (mainContainer) {
            mainContainer.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
             window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        const mainContainer = document.querySelector('.custom-scrollbar.flex-1.min-h-0.min-w-0');
        if(mainContainer) {
            mainContainer.addEventListener('scroll', () => {
                if (mainContainer.scrollTop > 300) setIsVisible(true);
                else setIsVisible(false);
            });
        } else {
            window.addEventListener('scroll', toggleVisibility);
        }

        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    return (
        <div className={`fixed bottom-24 right-6 z-40 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <button 
                onClick={scrollToTop}
                className="p-3 bg-cyan-500 hover:bg-cyan-400 text-black rounded-full shadow-[0_0_15px_rgba(6,182,212,0.6)] transition-transform hover:scale-110"
            >
                <ArrowUp size={24} />
            </button>
        </div>
    );
};

const StockControlModal = ({ isOpen, onClose, menu, onToggle }: { isOpen: boolean, onClose: () => void, menu: MenuItem[], onToggle: (id: string) => void }) => {
    const [search, setSearch] = useState('');
    if (!isOpen) return null;
    
    const filtered = menu.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-2xl p-6 shadow-2xl flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Menu Stock Control</h2>
                    <button onClick={onClose}><X className="text-gray-400" /></button>
                </div>
                <input 
                    type="text" 
                    placeholder="Search Item..." 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white mb-4" 
                />
                <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                    {filtered.map(item => (
                        <div key={item.id} className="flex justify-between items-center p-3 bg-black/50 rounded-lg border border-white/5">
                            <span className={!item.available ? 'text-gray-500 line-through' : 'text-white'}>{item.name}</span>
                            <button 
                                onClick={() => onToggle(item.id)}
                                className={`px-4 py-2 rounded font-bold text-sm ${item.available ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}
                            >
                                {item.available ? 'In Stock' : 'Out of Stock'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const IngredientInventoryModal = ({ isOpen, onClose, ingredients, onToggle }: { isOpen: boolean, onClose: () => void, ingredients: Ingredient[], onToggle: (id: string) => void }) => {
    const [search, setSearch] = useState('');
    if (!isOpen) return null;

    const filtered = ingredients.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-2xl p-6 shadow-2xl flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Kitchen Ingredients</h2>
                    <button onClick={onClose}><X className="text-gray-400" /></button>
                </div>
                 <input 
                    type="text" 
                    placeholder="Search Ingredient..." 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white mb-4" 
                />
                <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                    {filtered.map(ing => (
                        <div key={ing.id} className="flex justify-between items-center p-3 bg-black/50 rounded-lg border border-white/5">
                            <div>
                                <div className={!ing.inStock ? 'text-gray-500 line-through' : 'text-white'}>{ing.name}</div>
                                <div className="text-xs text-gray-500">{ing.category}</div>
                            </div>
                            <button 
                                onClick={() => onToggle(ing.id)}
                                className={`px-4 py-2 rounded font-bold text-sm ${ing.inStock ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}
                            >
                                {ing.inStock ? 'Available' : 'Empty'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const InventoryManager = () => {
    const [items] = useState<InventoryItem[]>([
        { id: '1', name: 'Basmati Rice', quantity: 25, unit: 'kg', area: 'Kitchen', category: 'Grains', purchaseDate: '2023-10-01', cost: 1200, supplier: 'Local Mart', status: 'Good' },
        { id: '2', name: 'Cooking Oil', quantity: 10, unit: 'L', area: 'Kitchen', category: 'Pantry', purchaseDate: '2023-10-05', cost: 1500, supplier: 'Wholesale', status: 'Good' },
        { id: '3', name: 'Napkins', quantity: 500, unit: 'pcs', area: 'Open Area', category: 'Supplies', purchaseDate: '2023-09-20', cost: 300, supplier: 'Depot', status: 'Needs Replacement' }
    ]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Inventory Management</h2>
            <div className="bg-zinc-900 rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-left text-gray-400">
                    <thead className="bg-black text-gray-200">
                        <tr>
                            <th className="p-4">Item Name</th>
                            <th className="p-4">Quantity</th>
                            <th className="p-4">Area</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Last Purchase</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {items.map(item => (
                            <tr key={item.id}>
                                <td className="p-4 text-white">{item.name}</td>
                                <td className="p-4">{item.quantity} {item.unit}</td>
                                <td className="p-4">{item.area}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${item.status === 'Good' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="p-4">{item.purchaseDate}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const CalendarPlanner = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Shift & Event Calendar</h2>
            <div className="bg-zinc-900 p-8 rounded-xl border border-white/10 text-center text-gray-500">
                <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                <p>Calendar integration coming soon...</p>
            </div>
        </div>
    );
};

const MenuEditorModal = ({ menu, onClose, onUpdate }: { menu: MenuItem[], onClose: () => void, onUpdate: (m: MenuItem) => void }) => {
     return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                 <h2 className="text-2xl font-bold text-white">Menu Editor</h2>
                 <button onClick={onClose} className="text-gray-400 hover:text-white">Close</button>
            </div>
            <div className="grid gap-4">
                 {menu.map(item => (
                     <div key={item.id} className="bg-zinc-900 p-4 rounded-lg border border-white/10 flex justify-between">
                         <div>
                             <h4 className="font-bold text-white">{item.name}</h4>
                             <p className="text-sm text-gray-400">₹{item.price}</p>
                         </div>
                         <button className="text-cyan-400 text-sm">Edit</button>
                     </div>
                 ))}
            </div>
        </div>
    );
};

const CustomerView = React.memo(({ menu, cart, onAddToCart, onUpdateCartQuantity, onPlaceOrder, onNavigate, activeCategory, setActiveCategory }: any) => {
    const [sortBy, setSortBy] = useState<'price' | 'time'>('price');
    const [vegOnly, setVegOnly] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);

    const groupedCategories = useMemo(() => ({
        'Stay': ['Stay'],
        'Drinks': ['Beverages (Hot)', 'Beverages (Cold)', 'Shakes/Lassi'],
        'Fast Food': ['Maggi', 'Burgers', 'Pasta', 'Pizza', 'Momos', 'Fries', 'Salad', 'Soups', 'Eggs'],
        'Main Course': ['Main Course', 'Non-Veg Main', 'Mutton', 'Tandoor', 'Rice', 'Noodles', 'Chinese', 'Breads', 'Raita', 'Desserts']
    }), []);

    const scrollSidebar = (amount: number) => {
        sidebarRef.current?.scrollBy({ top: amount, behavior: 'smooth' });
    };

    // Scroll Spy
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if(entry.isIntersecting) {
                    setActiveCategory(entry.target.id.replace('cat-', ''));
                }
            });
        }, { rootMargin: '-100px 0px -50% 0px' });

        document.querySelectorAll('[id^="cat-"]').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, [setActiveCategory]);

    const sortedMenu = useMemo((): {[key: string]: MenuItem[]} => {
        let filtered = menu.filter((item: MenuItem) => 
            item.available && 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (!vegOnly || item.isVeg)
        );

        // Sorting logic
        if (sortBy === 'price') {
            filtered.sort((a: MenuItem, b: MenuItem) => a.price - b.price);
        } else {
            // Sort by Time: Quick (<=10) -> Medium (<=20) -> Slow (>20)
            filtered.sort((a: MenuItem, b: MenuItem) => a.prepTime - b.prepTime);
        }

        // Group items by category
        const grouped: {[key: string]: MenuItem[]} = {};
        // Use the predefined order from RAW_MENU_DATA keys + Stay
        const allCats = [...Object.keys(RAW_MENU_DATA)];
        
        allCats.forEach(cat => {
            const itemsInCat = filtered.filter((i: MenuItem) => i.category === cat);
            if (itemsInCat.length > 0) grouped[cat] = itemsInCat;
        });
        return grouped;
    }, [menu, searchTerm, sortBy, vegOnly]);

    const scrollToCategory = (cat: string) => {
        const el = document.getElementById(`cat-${cat}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setIsSidebarOpen(false);
        }
    };

    return (
        <div className="flex h-full bg-black text-white overflow-hidden flex-col md:flex-row">
            {/* Mobile Header - Only visible on small screens */}
            <div className="md:hidden flex items-center justify-between p-3 bg-black/80 backdrop-blur-md sticky top-0 z-40 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-white bg-zinc-900 rounded-lg border border-white/10">
                        <Menu size={20} />
                    </button>
                    <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Skylark</span>
                </div>
                <div className="flex gap-2">
                    <a href="https://maps.app.goo.gl/NUpz4bEUTTagFVUn9" target="_blank" rel="noreferrer" className="p-2 bg-white/5 rounded-full text-cyan-400 hover:bg-cyan-500/20 transition-colors border border-white/5">
                        <MapPin size={18} />
                    </a>
                    <button onClick={() => onNavigate('kitchen')} className="p-2 bg-white/5 rounded-full text-orange-400 hover:bg-orange-500/20 transition-colors border border-white/5">
                        <ChefHat size={18} />
                    </button>
                    <button onClick={() => onNavigate('admin')} className="p-2 bg-white/5 rounded-full text-purple-400 hover:bg-purple-500/20 transition-colors border border-white/5">
                        <LayoutDashboard size={18} />
                    </button>
                </div>
            </div>

            {/* Sidebar / Drawer */}
            <div className={`fixed inset-0 z-50 bg-black/90 backdrop-blur-md transition-transform duration-300 md:relative md:transform-none md:w-72 md:border-r md:border-white/10 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 hidden md:block">
                    <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-1">Skylark Café</h1>
                    <p className="text-xs text-gray-500 tracking-widest">KASOL | HIMACHAL</p>
                </div>

                <div className="p-4 md:hidden flex justify-between items-center border-b border-white/10">
                    <span className="font-bold text-lg">Menu Categories</span>
                    <button onClick={() => setIsSidebarOpen(false)}><X /></button>
                </div>
                
                {/* Scroll UP Button */}
                <button 
                    onClick={() => scrollSidebar(-300)} 
                    className="w-full flex justify-center items-center py-2 bg-black/50 hover:bg-white/5 border-b border-white/5 text-gray-400 hover:text-white transition-colors z-10"
                >
                    <ChevronUp size={20} />
                </button>

                {/* Scrollable Category List */}
                <div ref={sidebarRef} className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                    {(Object.entries(groupedCategories) as [string, string[]][]).map(([group, cats]) => (
                        cats.some(cat => sortedMenu[cat]) && (
                            <div key={group}>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 pl-2">{group}</h3>
                                <div className="space-y-2">
                                    {cats.map(cat => {
                                        const color = getCategoryTheme(cat);
                                        const isActive = activeCategory === cat;
                                        return (
                                            <button
                                                key={cat}
                                                onClick={() => scrollToCategory(cat)}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden border ${isActive ? `bg-[${color}]/10 border-[${color}] shadow-[0_0_15px_${color}40]` : 'bg-zinc-900/50 border-white/5 hover:border-white/20'}`}
                                                style={{ borderColor: isActive ? color : '' }}
                                            >
                                                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-[${color}]`} />
                                                <div className={`text-[${color}] p-2 rounded-lg bg-black/40 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_10px_${color}20]`} style={{ color: color }}>
                                                    {React.cloneElement(getCategoryIcon(cat) as any, { size: 20 })}
                                                </div>
                                                <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'} transition-colors`}>{cat}</span>
                                                
                                                {/* Pop-up Art Icon */}
                                                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-20 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 pointer-events-none" style={{ color: color }}>
                                                   {React.cloneElement(getCategoryIcon(cat) as any, { size: 48 })}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )
                    ))}
                </div>

                {/* Scroll DOWN Button */}
                <button 
                    onClick={() => scrollSidebar(300)} 
                    className="w-full flex justify-center items-center py-2 bg-black/50 hover:bg-white/5 border-t border-white/5 text-gray-400 hover:text-white transition-colors z-10"
                >
                    <ChevronDown size={20} />
                </button>

                {/* Sidebar Footer Controls */}
                <div className="p-4 bg-black border-t border-white/10 space-y-3 z-20">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search menu..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-10 pr-4 py-2 text-sm focus:border-cyan-500 focus:outline-none"
                        />
                    </div>
                    <div className="flex gap-2">
                         <button 
                            onClick={() => setVegOnly(!vegOnly)}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border transition-all ${vegOnly ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-zinc-900 border-zinc-700 text-gray-400'}`}
                        >
                            <Leaf size={14} /> {vegOnly ? 'VEG ONLY' : 'ALL FOOD'}
                        </button>
                        <button 
                            onClick={() => setSortBy(sortBy === 'price' ? 'time' : 'price')}
                            className="flex-1 bg-zinc-900 border border-zinc-700 hover:border-white/30 text-gray-400 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all"
                        >
                            {sortBy === 'price' ? <DollarSign size={14} /> : <Clock size={14} />}
                            {sortBy === 'price' ? 'PRICE' : 'TIME'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative min-h-0 min-w-0 bg-black">
                {/* Desktop Top Header */}
                <div className="hidden md:flex justify-between items-center p-6 sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-white/5">
                    <div className="flex gap-4">
                        <button onClick={() => scrollToCategory('Stay')} className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-bold transition-all">Stay</button>
                        <button onClick={() => scrollToCategory('Maggi')} className="px-6 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-full text-sm font-bold text-cyan-400 transition-all">Café Menu</button>
                    </div>
                    {/* Search Bar */}
                    <div className="flex-1 max-w-md mx-6 relative">
                         <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                         <input 
                            type="text" 
                            placeholder="Search dishes..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-zinc-900/50 border border-cyan-500/50 focus:border-cyan-400 rounded-xl pl-10 pr-8 py-2 text-sm text-white placeholder-gray-500 focus:outline-none transition-all backdrop-blur-md"
                         />
                         {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-2.5 text-gray-500 hover:text-white">
                                <X size={16} />
                            </button>
                         )}
                    </div>
                    <div className="flex gap-3">
                         <a href="https://maps.app.goo.gl/NUpz4bEUTTagFVUn9" target="_blank" rel="noreferrer" className="p-3 bg-zinc-900 rounded-full hover:scale-110 transition-all border border-white/10 group">
                            <MapPin size={20} className="text-cyan-400 group-hover:text-cyan-300" />
                        </a>
                        <button onClick={() => onNavigate('kitchen')} className="p-3 bg-zinc-900 rounded-full hover:scale-110 transition-all border border-white/10 group">
                            <ChefHat size={20} className="text-orange-400 group-hover:text-orange-300" />
                        </button>
                        <button onClick={() => onNavigate('admin')} className="p-3 bg-zinc-900 rounded-full hover:scale-110 transition-all border border-white/10 group">
                            <LayoutDashboard size={20} className="text-purple-400 group-hover:text-purple-300" />
                        </button>
                    </div>
                </div>

                {/* Mobile Search Bar Sticky */}
                <div className="md:hidden sticky top-0 z-20 p-4 bg-black/80 backdrop-blur-md border-b border-white/5">
                     <div className="relative">
                         <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                         <input 
                            type="text" 
                            placeholder="Search dishes..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-zinc-900 border border-cyan-500/50 rounded-xl pl-10 pr-8 py-2 text-sm text-white placeholder-gray-500 focus:outline-none"
                         />
                         {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-2.5 text-gray-500 hover:text-white">
                                <X size={16} />
                            </button>
                         )}
                    </div>
                </div>


                <div className="p-4 pb-32 space-y-8">
                     {/* Empty State for Search */}
                     {Object.keys(sortedMenu).length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <Search size={48} className="mb-4 opacity-50" />
                            <p className="text-lg font-medium">No dishes found matching "{searchTerm}"</p>
                            <button onClick={() => setSearchTerm('')} className="mt-4 text-cyan-400 hover:underline">Clear Search</button>
                        </div>
                     )}

                    {Object.entries(sortedMenu).map(([category, items]) => (
                        <div key={category} id={`cat-${category}`} className="scroll-mt-6">
                            <h2 className={`text-xl md:text-2xl font-black mb-4 md:mb-6 uppercase tracking-tighter flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 transition-all duration-500 ${activeCategory === category ? 'scale-105 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' : ''}`}>
                                {React.cloneElement(getCategoryIcon(category) as any, { size: 24, className: `text-[${getCategoryTheme(category)}]` })}
                                {category}
                            </h2>
                            {/* UPDATED GRID: grid-cols-2 on mobile (was grid-cols-1) */}
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                                {items.map((item: MenuItem) => {
                                    const themeColor = getCategoryTheme(category);
                                    return (
                                        <div key={item.id} 
                                             className={`group relative bg-transparent border border-white/5 hover:border-[${themeColor}]/50 rounded-2xl p-3 md:p-4 transition-all duration-200 hover:shadow-[0_0_20px_${themeColor}20] min-h-[140px] md:h-44 flex flex-col justify-between overflow-hidden ${!item.available ? 'opacity-50 grayscale pointer-events-none' : ''} ${activeCategory === category ? 'border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.05)]' : ''}`}>
                                            
                                            {/* Neon Pop-up Icon Background */}
                                            <div className={`absolute -right-6 -bottom-6 opacity-10 group-hover:opacity-20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 pointer-events-none text-[${themeColor}]`} style={{ color: themeColor }}>
                                                {React.cloneElement(getCategoryIcon(category) as any, { size: 120, strokeWidth: 1 })}
                                            </div>

                                            <div className="flex justify-between items-start relative z-10">
                                                <div className="flex gap-2">
                                                    <div className={`w-3 h-3 rounded-full mt-1 ${item.isVeg ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`} />
                                                    <div>
                                                        <h3 className="font-bold text-base md:text-lg leading-tight text-white group-hover:text-cyan-400 transition-colors">{item.name}</h3>
                                                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                                                    </div>
                                                </div>
                                                {/* ADD Button Top Right */}
                                                {item.available ? (
                                                    <button 
                                                        onClick={() => onAddToCart(item)}
                                                        className={`p-2 rounded-lg transition-all active:scale-90 active:rotate-3 shadow-lg font-bold text-xs ${item.isVeg ? 'bg-green-500 text-black hover:bg-green-400 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-red-500 text-white hover:bg-red-400 shadow-[0_0_10px_rgba(239,68,68,0.4)]'}`}
                                                    >
                                                        ADD
                                                    </button>
                                                ) : (
                                                    <span className="text-xs font-bold text-red-500 border border-red-500/50 px-2 py-1 rounded bg-red-500/10">SOLD OUT</span>
                                                )}
                                            </div>

                                            <div className="flex justify-between items-end mt-3 relative z-10">
                                                <div className="text-lg md:text-xl font-bold text-white">₹{item.price}</div>
                                                <div className="text-xs font-mono text-gray-500 flex items-center gap-1">
                                                    <Clock size={12} /> {item.prepTime}m
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Floating Cart Button (Mobile/Desktop) */}
            {cart.length > 0 && (
                <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-8 md:w-96 z-50">
                    <button onClick={onPlaceOrder} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center justify-between hover:scale-105 transition-transform active:scale-95 border border-white/20 backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                            <div className="bg-black/30 p-2 rounded-lg font-mono font-bold text-lg">{cart.reduce((a: any, b: any) => a + b.quantity, 0)} Items</div>
                            <div className="flex flex-col items-start">
                                <span className="text-xs text-green-100 uppercase font-bold tracking-wider">Total Payable</span>
                                <span className="text-xl font-black">₹{cart.reduce((a: any, b: any) => a + (b.price * b.quantity), 0)}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 font-bold bg-white/20 px-4 py-2 rounded-xl">
                            Place Order <ChevronRight size={18} />
                        </div>
                    </button>
                </div>
            )}

             {/* Scroll To Top Button */}
            <ScrollToTop />
        </div>
    );
});

const KitchenView = React.memo(({ orders, menu, updateOrderStatus, updateStockStatus, missingIngredients, ingredients, updateIngredientStatus, onLogout }: any) => {
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [isInvModalOpen, setIsInvModalOpen] = useState(false);

    const pendingOrders = orders.filter((o: Order) => o.status === 'pending');
    const prepOrders = orders.filter((o: Order) => o.status === 'preparing');

    return (
        <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
            <div className="p-4 md:p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/50">
                <div className="flex items-center gap-4">
                    <button onClick={onLogout} className="p-2 bg-zinc-800 rounded-full hover:bg-red-500/20 text-gray-400 hover:text-red-500 transition-colors"><ArrowLeft size={20} /></button>
                    <div>
                        <h1 className="text-2xl font-bold text-orange-500 flex items-center gap-2"><ChefHat /> Kitchen Display</h1>
                        <p className="text-xs text-gray-400">Live Order Management System</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                    <div className="flex gap-4 text-sm font-mono">
                        <span className="text-orange-400">Pending: {pendingOrders.length}</span>
                        <span className="text-blue-400">Prep: {prepOrders.length}</span>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                         <button onClick={() => setIsInvModalOpen(true)} className="flex-1 md:flex-none px-4 py-2 bg-zinc-800 border border-zinc-700 hover:border-white/30 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all">
                            <Package size={16} /> Ingredients
                        </button>
                        <button onClick={() => setIsStockModalOpen(true)} className="flex-1 md:flex-none px-4 py-2 bg-zinc-800 border border-zinc-700 hover:border-white/30 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all">
                            <List size={16} /> Menu Stock
                        </button>
                        <button onClick={onLogout} className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all">
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* NEW ORDERS COLUMN */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-orange-400 sticky top-0 bg-black/90 p-2 z-10 border-b border-orange-500/30">New Orders ({pendingOrders.length})</h2>
                    {pendingOrders.length === 0 ? (
                        <div className="text-gray-600 text-center p-8 border border-dashed border-zinc-800 rounded-xl">No pending orders</div>
                    ) : (
                        pendingOrders.map((order: Order) => (
                            <div key={order.id} className="bg-zinc-900 border-l-4 border-orange-500 rounded-r-xl p-4 shadow-lg animate-slide-in">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <span className="text-2xl font-bold text-white">#{order.id.slice(-4)}</span>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            <span className={`text-xs px-2 py-0.5 rounded font-bold ${order.customerInfo.serviceType === 'Dine-in' ? 'bg-blue-500/20 text-blue-400' : order.customerInfo.serviceType === 'Takeaway' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-purple-500/20 text-purple-400'}`}>
                                                {order.customerInfo.serviceType}
                                            </span>
                                            {order.customerInfo.tableNumber && <span className="text-xs px-2 py-0.5 rounded bg-zinc-700 text-white font-mono">Table {order.customerInfo.tableNumber}</span>}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">{order.customerInfo.name} • {order.customerInfo.phone}</p>
                                    </div>
                                    <span className="text-xs font-mono text-gray-500">{order.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                                <div className="space-y-2 mb-4">
                                    {order.items.map((item, idx) => {
                                        // Check for missing ingredients for this item
                                        const liveItem = (menu as MenuItem[]).find((m: MenuItem) => m.id === item.id);
                                        const hasMissing = liveItem && liveItem.missingIngredients && liveItem.missingIngredients.length > 0;
                                        
                                        return (
                                            <div key={idx} className={`flex justify-between items-center p-2 rounded ${hasMissing ? 'bg-red-500/10 border border-red-500/30' : 'bg-black/30'}`}>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-orange-400 bg-orange-400/10 px-2 rounded">x{item.quantity}</span>
                                                    <div>
                                                        <span className={`text-sm ${item.isVeg ? 'text-green-300' : 'text-red-300'}`}>{item.name}</span>
                                                        {hasMissing && (
                                                            <p className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                                                                <AlertCircle size={10} /> Missing: {liveItem?.missingIngredients?.map((mid: string) => ingredients.find((i: Ingredient) => i.id === mid)?.name).join(', ')}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <button 
                                    onClick={() => updateOrderStatus(order.id, 'preparing')}
                                    className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-black font-bold rounded-lg shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all flex items-center justify-center gap-2"
                                >
                                    <Flame size={18} /> Start Cooking
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* IN PROGRESS COLUMN */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-blue-400 sticky top-0 bg-black/90 p-2 z-10 border-b border-blue-500/30">In Progress ({prepOrders.length})</h2>
                     {prepOrders.length === 0 ? (
                        <div className="text-gray-600 text-center p-8 border border-dashed border-zinc-800 rounded-xl">No active orders</div>
                    ) : (
                        prepOrders.map((order: Order) => (
                            <div key={order.id} className="bg-zinc-900 border-l-4 border-blue-500 rounded-r-xl p-4 shadow-lg animate-slide-in">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <span className="text-2xl font-bold text-white">#{order.id.slice(-4)}</span>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                             <span className={`text-xs px-2 py-0.5 rounded font-bold ${order.customerInfo.serviceType === 'Dine-in' ? 'bg-blue-500/20 text-blue-400' : order.customerInfo.serviceType === 'Takeaway' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-purple-500/20 text-purple-400'}`}>
                                                {order.customerInfo.serviceType}
                                            </span>
                                            {order.customerInfo.tableNumber && <span className="text-xs px-2 py-0.5 rounded bg-zinc-700 text-white font-mono">Table {order.customerInfo.tableNumber}</span>}
                                        </div>
                                    </div>
                                    <Clock className="text-blue-400 animate-pulse" size={16} />
                                </div>
                                <div className="space-y-2 mb-4">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-gray-300 text-sm">
                                            <span>{item.quantity}x {item.name}</span>
                                        </div>
                                    ))}
                                </div>
                                <button 
                                    onClick={() => updateOrderStatus(order.id, 'ready')}
                                    className="w-full py-3 bg-blue-500 hover:bg-blue-400 text-black font-bold rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all flex items-center justify-center gap-2"
                                >
                                    <CheckCircle size={18} /> Mark Ready
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modals */}
            <StockControlModal isOpen={isStockModalOpen} onClose={() => setIsStockModalOpen(false)} menu={menu} onToggle={updateStockStatus} />
            <IngredientInventoryModal isOpen={isInvModalOpen} onClose={() => setIsInvModalOpen(false)} ingredients={ingredients} onToggle={updateIngredientStatus} />
        </div>
    );
});

const AdminView = React.memo(({ orders, menu, updateOrderStatus, onLogout, setMenu }: any) => {
    const [view, setView] = useState<'dashboard' | 'inventory' | 'calendar' | 'menu'>('dashboard');
    const [searchTerm, setSearchTerm] = useState('');

    // Calculate Stats
    const totalRevenue = useMemo(() => orders.filter((o: Order) => o.status === 'completed').reduce((acc: number, curr: Order) => acc + curr.total, 0), [orders]);
    const completedOrders = useMemo(() => orders.filter((o: Order) => o.status === 'completed').length, [orders]);
    const activeOrders = useMemo(() => orders.filter((o: Order) => o.status !== 'completed' && o.status !== 'cancelled').length, [orders]);
    
    // Daily Stats
    const today = new Date().toDateString();
    const todayOrders = useMemo(() => orders.filter((o: Order) => new Date(o.timestamp).toDateString() === today && o.status === 'completed'), [orders, today]);
    const todayRevenue = useMemo(() => todayOrders.reduce((acc: number, curr: Order) => acc + curr.total, 0), [todayOrders]);

    // Top Items
    const topItems = useMemo(() => {
        const counts: {[key: string]: number} = {};
        orders.forEach((o: Order) => {
            if(o.status === 'completed') {
                o.items.forEach((i: CartItem) => {
                    counts[i.name] = (counts[i.name] || 0) + i.quantity;
                });
            }
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    }, [orders]);

    // Filtered Transaction List
    const filteredOrders = useMemo(() => {
        return orders
            .filter((o: Order) => o.id.toLowerCase().includes(searchTerm.toLowerCase()) || o.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a: Order, b: Order) => b.timestamp.getTime() - a.timestamp.getTime());
    }, [orders, searchTerm]);

    // Handlers for CSV
    const handleDownloadMenu = () => {
        const data = menu.map((m: MenuItem) => ({
            Name: m.name,
            Category: m.category,
            Price: m.price,
            Available: m.available,
            PrepTime: m.prepTime,
            IsVeg: m.isVeg,
            Description: m.description
        }));
        generateCSV(data, 'skylark_menu_export.csv');
    };

    const handleExportPriceList = () => {
        const data = menu.map((m: MenuItem) => ({
            'Item Name': m.name,
            'Category': m.category,
            'Current Price': m.price,
            'Description': m.description
        }));
        generateCSV(data, 'skylark-menu-prices.csv');
    };

    const handleUploadMenu = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            const text = evt.target?.result as string;
            const updates = parseMenuCSV(text);
            if(updates.length) {
                // Merge logic would go here, for now we simulate state update via a hypothetical setter passed or reload
                // In a real app, we would update the 'menu' state with these values matching by name
                alert(`Parsed ${updates.length} items. Please implement state merge.`);
            }
        };
        reader.readAsText(file);
    };


    const renderContent = () => {
        switch(view) {
            case 'inventory': return <InventoryManager />;
            case 'calendar': return <CalendarPlanner />;
            case 'menu': return <MenuEditorModal menu={menu} onClose={() => setView('dashboard')} onUpdate={() => {}} />; // Placeholder
            default: return (
                <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-zinc-900 p-6 rounded-2xl border border-purple-500/20 shadow-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
                                    <h3 className="text-3xl font-bold text-white">₹{totalRevenue.toLocaleString()}</h3>
                                </div>
                                <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400"><DollarSign /></div>
                            </div>
                        </div>
                        <div className="bg-zinc-900 p-6 rounded-2xl border border-blue-500/20 shadow-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Total Orders</p>
                                    <h3 className="text-3xl font-bold text-white">{completedOrders}</h3>
                                </div>
                                <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400"><ClipboardList /></div>
                            </div>
                        </div>
                        <div className="bg-zinc-900 p-6 rounded-2xl border border-orange-500/20 shadow-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Active Now</p>
                                    <h3 className="text-3xl font-bold text-white">{activeOrders}</h3>
                                </div>
                                <div className="p-3 bg-orange-500/20 rounded-xl text-orange-400"><Activity /></div>
                            </div>
                        </div>
                    </div>

                    {/* Dashboard Summary */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                         <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><TrendingUp className="text-green-400" /> Daily Snapshot</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-black rounded-xl">
                                    <span className="text-gray-400">Today's Revenue</span>
                                    <span className="text-xl font-bold text-green-400">₹{todayRevenue.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-black rounded-xl">
                                    <span className="text-gray-400">Today's Orders</span>
                                    <span className="text-xl font-bold text-blue-400">{todayOrders.length}</span>
                                </div>
                            </div>
                         </div>
                         <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Star className="text-yellow-400" /> Top Selling Items</h3>
                             <div className="space-y-3">
                                {topItems.map(([name, count], idx) => (
                                    <div key={name} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0">
                                        <span className="flex items-center gap-3">
                                            <span className="text-xs font-mono text-gray-500">0{idx+1}</span>
                                            <span className="text-gray-300">{name}</span>
                                        </span>
                                        <span className="font-bold text-white">{count} sold</span>
                                    </div>
                                ))}
                                {topItems.length === 0 && <p className="text-gray-500 text-sm">No data yet</p>}
                             </div>
                         </div>
                    </div>

                    {/* Ready for Service Section */}
                    {orders.filter((o: Order) => o.status === 'ready').length > 0 && (
                        <div className="bg-blue-900/10 border border-blue-500/30 rounded-2xl p-6">
                            <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2"><UtensilsCrossed /> Ready for Service</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {orders.filter((o: Order) => o.status === 'ready').map((order: Order) => (
                                    <div key={order.id} className="bg-black p-4 rounded-xl border border-blue-500/20 flex flex-col justify-between h-full">
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <span className="font-bold text-white">#{order.id.slice(-4)}</span>
                                                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">{order.customerInfo.serviceType}</span>
                                            </div>
                                            <p className="text-sm text-gray-400 mb-2">{order.customerInfo.name}</p>
                                            <ul className="text-xs text-gray-500 space-y-1 mb-4">
                                                {order.items.map((i, idx) => <li key={idx}>{i.quantity}x {i.name}</li>)}
                                            </ul>
                                        </div>
                                        <button 
                                            onClick={() => updateOrderStatus(order.id, 'completed')}
                                            className="w-full py-2 bg-blue-500 hover:bg-blue-400 text-black font-bold rounded transition-colors"
                                        >
                                            Complete Order
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Transactions */}
                    <div className="bg-zinc-900 rounded-2xl border border-white/5 overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
                             <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search Name or Order ID"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full bg-black border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-purple-500 focus:outline-none text-white"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-400">
                                <thead className="bg-black text-gray-200 font-medium uppercase tracking-wider">
                                    <tr>
                                        <th className="p-4">Order ID</th>
                                        <th className="p-4">Customer</th>
                                        <th className="p-4">Items</th>
                                        <th className="p-4">Amount</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredOrders.length === 0 ? (
                                        <tr><td colSpan={6} className="p-8 text-center text-gray-600">No transactions found</td></tr>
                                    ) : (
                                        filteredOrders.slice(0, 10).map((order: Order) => (
                                            <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4 font-mono text-white">#{order.id.slice(-4)}</td>
                                                <td className="p-4">
                                                    <div className="font-bold text-white">{order.customerInfo.name}</div>
                                                    <div className="text-xs">{order.customerInfo.phone}</div>
                                                </td>
                                                <td className="p-4">{order.items.length} items</td>
                                                <td className="p-4 font-bold text-green-400">₹{order.total}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${order.status === 'completed' ? 'bg-green-500/20 text-green-400' : order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    {order.status !== 'completed' && order.status !== 'cancelled' && (
                                                         <button 
                                                            onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                                            className="p-2 hover:bg-red-500/20 text-red-500 rounded transition-colors"
                                                            title="Cancel Order"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
            <div className="p-4 md:p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/50">
                <div className="flex items-center gap-4">
                    <button onClick={onLogout} className="p-2 bg-zinc-800 rounded-full hover:bg-red-500/20 text-gray-400 hover:text-red-500 transition-colors"><ArrowLeft size={20} /></button>
                    <div>
                        <h1 className="text-2xl font-bold text-purple-500 flex items-center gap-2"><LayoutDashboard /> Admin Dashboard</h1>
                        <p className="text-xs text-gray-400">Manager Overview</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <button onClick={() => setView('dashboard')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'dashboard' ? 'bg-purple-500 text-black' : 'bg-zinc-800 text-gray-400'}`}>Overview</button>
                    <button onClick={() => setView('inventory')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'inventory' ? 'bg-purple-500 text-black' : 'bg-zinc-800 text-gray-400'}`}>Inventory</button>
                    <button onClick={() => setView('calendar')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'calendar' ? 'bg-purple-500 text-black' : 'bg-zinc-800 text-gray-400'}`}>Calendar</button>
                     <label className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-bold text-gray-300 cursor-pointer transition-all flex items-center gap-2">
                        <Upload size={14} /> Upload Menu
                        <input type="file" accept=".csv" onChange={handleUploadMenu} className="hidden" />
                    </label>
                    <button onClick={handleDownloadMenu} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-bold text-gray-300 transition-all flex items-center gap-2">
                        <Download size={14} /> Export Menu
                    </button>
                    <button onClick={handleExportPriceList} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-bold text-gray-300 transition-all flex items-center gap-2">
                        <FileSpreadsheet size={14} /> Export Prices CSV
                    </button>
                    <button onClick={onLogout} className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-lg text-sm font-bold flex items-center gap-2 transition-all">
                        <LogOut size={14} /> Logout
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
                {renderContent()}
            </div>
        </div>
    );
});

const PrintableMenu = React.memo(({ menu }: { menu: MenuItem[] }) => {
    const grouped = useMemo(() => {
        const g: {[key: string]: MenuItem[]} = {};
        menu.forEach(item => {
            if (item.available) {
                if (!g[item.category]) g[item.category] = [];
                g[item.category].push(item);
            }
        });
        return g;
    }, [menu]);

    return (
        <div className="min-h-screen bg-black text-white p-8 print:p-0 print:bg-white print:text-black">
            <div className="text-center mb-8 print:mb-4 border-b border-white/20 pb-4">
                <h1 className="text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 print:text-black">Skylark Café</h1>
                <p className="text-sm tracking-[0.5em] text-gray-400 uppercase">Kasol | Himachal Pradesh</p>
            </div>
            <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 print:columns-2">
                {Object.entries(grouped).map(([cat, items]) => (
                    <div key={cat} className="break-inside-avoid mb-6">
                        <h3 className="text-xl font-bold mb-3 border-b border-dashed border-white/20 pb-1 text-cyan-400 print:text-black print:border-black">{cat}</h3>
                        <ul className="space-y-2">
                            {(items as MenuItem[]).map(item => (
                                <li key={item.id} className="flex justify-between text-sm group">
                                    <span className={`${item.isVeg ? 'text-green-400 print:text-black' : 'text-red-400 print:text-black'} font-medium`}>{item.name}</span>
                                    <span className="font-mono font-bold opacity-75">₹{item.price}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
});

const App = () => {
    const [view, setView] = useState<'customer' | 'kitchen' | 'admin' | 'login' | 'printable' | 'order-confirmation'>('customer');
    const [activeCategory, setActiveCategory] = useState('Stay');
    const [menu, setMenu] = useState<MenuItem[]>(buildMenu());
    const [cart, setCart] = useState<CartItem[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
    const [ingredients, setIngredients] = useState<Ingredient[]>(MASTER_INGREDIENTS);
    const [authTarget, setAuthTarget] = useState<'kitchen' | 'admin' | null>(null);
    const [showPlaceOrderModal, setShowPlaceOrderModal] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    // Exit Confirmation
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = '';
            return '';
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    // Persist Orders
    useEffect(() => {
        const savedOrders = localStorage.getItem('skylark_orders');
        if (savedOrders) {
            try {
                const parsed = JSON.parse(savedOrders);
                // Restore Date objects
                parsed.forEach((o: any) => o.timestamp = new Date(o.timestamp));
                setOrders(parsed);
            } catch (e) { console.error("Failed to load orders", e); }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('skylark_orders', JSON.stringify(orders));
    }, [orders]);

    // Auth Persistence
    useEffect(() => {
        const auth = localStorage.getItem('skylark_auth');
        if (auth) {
            try {
                const { type } = JSON.parse(auth);
                if (type === 'kitchen' || type === 'admin') {
                    // Just verify it exists, don't auto-switch unless on root load logic
                }
            } catch(e) {}
        }
    }, []);

    useEffect(() => {
        const auth = localStorage.getItem('skylark_auth');
        if (auth) {
            try {
                const { type } = JSON.parse(auth);
                if (type === 'kitchen' || type === 'admin') {
                   setView(type);
                }
            } catch (e) {
                console.error("Invalid auth token", e);
                localStorage.removeItem('skylark_auth');
            }
        }
    }, []);

    const handleLogin = (type: 'kitchen' | 'admin', save: boolean) => {
        if (save) {
            localStorage.setItem('skylark_auth', JSON.stringify({ type, timestamp: Date.now() }));
        }
        setView(type);
    };

    const handleLogout = () => {
        localStorage.removeItem('skylark_auth');
        setView('customer');
    };

    const checkAuthAndNavigate = (target: 'kitchen' | 'admin') => {
        const auth = localStorage.getItem('skylark_auth');
        if (auth) {
            try {
                 const { type } = JSON.parse(auth);
                 if (type === target) {
                     setView(target);
                     return;
                 }
            } catch (e) { localStorage.removeItem('skylark_auth'); }
        }
        setAuthTarget(target);
        setView('login');
    };

    const addToCart = (item: MenuItem) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
        showToast(`Added ${item.name} to cart`);
    };

    const updateCartQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter(i => i.quantity > 0));
    };

    const placeOrder = (customerInfo: CustomerInfo) => {
        // Calculate Estimated Time
        let maxTime = 0;
        let penalty = 0;
        cart.forEach(item => {
            if (item.prepTime > maxTime) maxTime = item.prepTime;
            if (!item.isVeg) penalty = 5;
        });
        const estimatedTime = maxTime + penalty + 5; // +5 buffer

        const newOrder: Order = {
            id: Date.now().toString(),
            items: [...cart],
            total: cart.reduce((a, b) => a + (b.price * b.quantity), 0),
            status: 'pending',
            timestamp: new Date(),
            customerInfo: customerInfo,
            estimatedTime
        };
        setOrders(prev => [newOrder, ...prev]);
        setCart([]);
        setCurrentOrder(newOrder);
        setView('order-confirmation');
    };

    const updateOrderStatus = (id: string, status: Order['status']) => {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
        if (currentOrder && currentOrder.id === id) {
            setCurrentOrder(prev => prev ? { ...prev, status } : null);
        }
    };

    const toggleStock = (id: string) => {
        setMenu(prev => prev.map(i => i.id === id ? { ...i, available: !i.available } : i));
    };

    const toggleIngredient = (id: string) => {
        setIngredients(prev => {
            const newIngredients = prev.map(i => i.id === id ? { ...i, inStock: !i.inStock } : i);
            
            // Auto-update menu availability based on recipe
            const unavailableIngIds = newIngredients.filter(i => !i.inStock).map(i => i.id);
            setMenu(currentMenu => currentMenu.map(mItem => {
                 const missing = mItem.requiredIngredients.filter(reqId => unavailableIngIds.includes(reqId));
                 return { ...mItem, missingIngredients: missing };
            }));

            return newIngredients;
        });
    };
    
    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2000);
    };

    return (
        <div className="font-sans bg-black text-white">
             {/* Custom Scrollbar Styles */}
             <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.4); }
            `}</style>

             {/* Toast Notification */}
             {toast && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500/90 text-white px-6 py-3 rounded-full shadow-2xl z-[100] animate-fade-in flex items-center gap-2 backdrop-blur-sm">
                    <CheckCircle size={18} /> {toast}
                </div>
            )}

            {view === 'login' && <LoginView onLogin={(type, save) => { handleLogin(type, save); }} onBack={() => setView('customer')} />}
            
            {view === 'customer' && (
                <>
                    <CustomerView 
                        menu={menu} 
                        cart={cart} 
                        onAddToCart={addToCart} 
                        onUpdateCartQuantity={updateCartQuantity} 
                        onPlaceOrder={() => setShowPlaceOrderModal(true)}
                        onNavigate={checkAuthAndNavigate}
                        activeCategory={activeCategory}
                        setActiveCategory={setActiveCategory}
                    />
                    <PlaceOrderModal 
                        isOpen={showPlaceOrderModal} 
                        onClose={() => setShowPlaceOrderModal(false)} 
                        onSubmit={placeOrder} 
                    />
                </>
            )}

            {view === 'order-confirmation' && currentOrder && (
                <div className="h-screen bg-black">
                    <OrderConfirmation 
                        orderId={currentOrder.id} 
                        estimatedTime={currentOrder.estimatedTime || 20} 
                        status={currentOrder.status} 
                        onBack={() => setView('customer')} 
                    />
                </div>
            )}

            {view === 'kitchen' && (
                <KitchenView 
                    orders={orders} 
                    menu={menu}
                    updateOrderStatus={updateOrderStatus} 
                    updateStockStatus={toggleStock} 
                    ingredients={ingredients}
                    updateIngredientStatus={toggleIngredient}
                    onLogout={handleLogout}
                />
            )}

            {view === 'admin' && (
                <AdminView 
                    orders={orders} 
                    menu={menu}
                    updateOrderStatus={updateOrderStatus} 
                    onLogout={handleLogout}
                    setMenu={setMenu}
                />
            )}
            
            {view === 'printable' && <PrintableMenu menu={menu} />}
        </div>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
