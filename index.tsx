import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  ShoppingBag, 
  ChefHat, 
  Clock, 
  Search, 
  XCircle, 
  Download, 
  Upload,
  ToggleLeft, 
  ToggleRight, 
  Leaf, 
  Drumstick, 
  ArrowLeft, 
  TrendingUp, 
  AlertCircle, 
  Printer, 
  Menu as MenuIcon, 
  User, 
  Flame, 
  Coffee, 
  Utensils, 
  Pizza, 
  Sandwich, 
  Soup, 
  IceCream, 
  CircleDot, 
  Zap, 
  Crop, 
  GlassWater, 
  Beer, 
  DollarSign, 
  Martini, 
  AlignLeft,
  Egg,
  Croissant,
  Cookie,
  Carrot,
  X,
  LogOut,
  Box,
  Refrigerator,
  CheckSquare,
  Square,
  CheckCircle as CheckCircleIcon,
  FileSpreadsheet,
  Trash2,
  Plus,
  Minus,
  Edit,
  Save,
  RefreshCw,
  BedDouble,
  Home,
  Lock,
  Calendar,
  ClipboardList,
  Package,
  Truck,
  Activity,
  AlertTriangle,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  BarChart3,
  CalendarDays,
  MapPin
} from 'lucide-react';

// --- Types ---

type Category = string;
// ... (keep existing types unchanged) ...

type PrepTime = 'Quick' | 'Medium' | 'Slow';

interface MenuItem {
  id: string;
  name: string;
  category: Category;
  price: number;
  isVeg: boolean;
  prepTime: PrepTime;
  available: boolean;
  description: string;
  missingIngredients?: string[]; 
}

interface CartItem extends MenuItem {
  quantity: number;
}

interface Order {
  id: string;
  customerName: string;
  items: CartItem[];
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  totalAmount: number;
  timestamp: number;
  estimatedTime: number; 
}

type IngredientCategory = 'Dairy' | 'Vegetables' | 'Proteins' | 'Pantry' | 'Beverages' | 'Breads';

interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  inStock: boolean;
}

// --- New Types for Inventory & Calendar ---

type InventoryArea = 'Rooms' | 'Kitchen' | 'Open Area';
type InventoryStatus = 'Good' | 'Needs Replacement' | 'Damaged';

interface InventoryItem {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    area: InventoryArea;
    category: string;
    purchaseDate: string;
    cost: number;
    supplier: string;
    status: InventoryStatus;
    minStock: number;
}

interface PurchaseLog {
    id: string;
    date: string;
    itemId: string;
    itemName: string;
    quantity: number;
    cost: number;
    supplier: string;
    area: InventoryArea;
    invoiceNumber: string;
}

interface UsageLog {
    id: string;
    date: string;
    itemId: string;
    itemName: string;
    areaUsed: InventoryArea;
    quantityUsed: number;
    purpose: string;
}

type EventPriority = 'High' | 'Medium' | 'Low';
type EventCategory = 'Operations' | 'Maintenance' | 'Events' | 'Staff' | 'Inventory';
type EventStatus = 'Pending' | 'In Progress' | 'Completed';

interface CalendarEvent {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    priority: EventPriority;
    category: EventCategory;
    status: EventStatus;
    description: string;
}

// --- Master Ingredient List ---

const INITIAL_INGREDIENTS: Ingredient[] = [
    { id: 'milk', name: 'Milk', category: 'Dairy', inStock: true },
    { id: 'curd', name: 'Curd (Dahi)', category: 'Dairy', inStock: true },
    { id: 'paneer', name: 'Paneer', category: 'Dairy', inStock: true },
    { id: 'butter', name: 'Butter', category: 'Dairy', inStock: true },
    { id: 'cheese_slice', name: 'Cheese Slices', category: 'Dairy', inStock: true },
    { id: 'mozzarella', name: 'Mozzarella Cheese', category: 'Dairy', inStock: true },
    { id: 'cream', name: 'Fresh Cream', category: 'Dairy', inStock: true },
    { id: 'ice_cream', name: 'Vanilla Ice Cream', category: 'Dairy', inStock: true },
    { id: 'onion', name: 'Onion', category: 'Vegetables', inStock: true },
    { id: 'tomato', name: 'Tomato', category: 'Vegetables', inStock: true },
    { id: 'capsicum', name: 'Capsicum', category: 'Vegetables', inStock: true },
    { id: 'cucumber', name: 'Cucumber', category: 'Vegetables', inStock: true },
    { id: 'potato', name: 'Potato', category: 'Vegetables', inStock: true },
    { id: 'mushroom', name: 'Mushroom', category: 'Vegetables', inStock: true },
    { id: 'corn', name: 'Sweet Corn', category: 'Vegetables', inStock: true },
    { id: 'peas', name: 'Green Peas', category: 'Vegetables', inStock: true },
    { id: 'cauliflower', name: 'Cauliflower (Gobhi)', category: 'Vegetables', inStock: true },
    { id: 'lemon', name: 'Lemon', category: 'Vegetables', inStock: true },
    { id: 'coriander', name: 'Coriander/Mint', category: 'Vegetables', inStock: true },
    { id: 'garlic', name: 'Garlic', category: 'Vegetables', inStock: true },
    { id: 'ginger', name: 'Ginger', category: 'Vegetables', inStock: true },
    { id: 'chicken', name: 'Chicken', category: 'Proteins', inStock: true },
    { id: 'mutton', name: 'Mutton', category: 'Proteins', inStock: true },
    { id: 'egg', name: 'Eggs', category: 'Proteins', inStock: true },
    { id: 'maggi', name: 'Maggi Noodles', category: 'Pantry', inStock: true },
    { id: 'pasta_penne', name: 'Penne Pasta', category: 'Pantry', inStock: true },
    { id: 'rice', name: 'Basmati Rice', category: 'Pantry', inStock: true },
    { id: 'noodles', name: 'Hakka Noodles', category: 'Pantry', inStock: true },
    { id: 'burger_bun', name: 'Burger Buns', category: 'Breads', inStock: true },
    { id: 'bread', name: 'Bread Slices', category: 'Breads', inStock: true },
    { id: 'pizza_base', name: 'Pizza Base', category: 'Breads', inStock: true },
    { id: 'fries_frozen', name: 'Frozen Fries', category: 'Pantry', inStock: true },
    { id: 'momos_wrapper', name: 'Momos Wrapper/Flour', category: 'Pantry', inStock: true },
    { id: 'atta', name: 'Atta (Wheat Flour)', category: 'Breads', inStock: true },
    { id: 'maida', name: 'Maida (Refined Flour)', category: 'Breads', inStock: true },
    { id: 'coffee_powder', name: 'Coffee Powder', category: 'Beverages', inStock: true },
    { id: 'tea_leaves', name: 'Tea Leaves', category: 'Beverages', inStock: true },
    { id: 'sugar', name: 'Sugar/Syrup', category: 'Beverages', inStock: true },
    { id: 'soda', name: 'Soda Water', category: 'Beverages', inStock: true },
    { id: 'coconut_water', name: 'Coconut Water', category: 'Beverages', inStock: true },
    { id: 'syrup_blue', name: 'Blue Curacao Syrup', category: 'Beverages', inStock: true },
    { id: 'syrup_mint', name: 'Mint Syrup', category: 'Beverages', inStock: true },
    { id: 'syrup_kiwi', name: 'Kiwi Syrup', category: 'Beverages', inStock: true },
    { id: 'syrup_apple', name: 'Green Apple Syrup', category: 'Beverages', inStock: true },
    { id: 'syrup_mango', name: 'Mango Syrup', category: 'Beverages', inStock: true },
    { id: 'chocolate', name: 'Chocolate/Cocoa', category: 'Pantry', inStock: true },
    { id: 'oreo', name: 'Oreo Biscuits', category: 'Pantry', inStock: true },
    { id: 'kitkat', name: 'KitKat', category: 'Pantry', inStock: true },
    { id: 'banana', name: 'Banana', category: 'Vegetables', inStock: true },
    { id: 'papaya', name: 'Papaya', category: 'Vegetables', inStock: true },
];

// --- Initial Data for New Systems ---

const INITIAL_INVENTORY: InventoryItem[] = [
    { id: '1', name: 'Bed Sheets (King)', quantity: 12, unit: 'pcs', area: 'Rooms', category: 'Linen', purchaseDate: '2023-10-01', cost: 500, supplier: 'Kasol Textiles', status: 'Good', minStock: 5 },
    { id: '2', name: 'Towels', quantity: 20, unit: 'pcs', area: 'Rooms', category: 'Toiletries', purchaseDate: '2023-10-15', cost: 200, supplier: 'Kasol Textiles', status: 'Good', minStock: 10 },
    { id: '3', name: 'Fry Pan', quantity: 4, unit: 'pcs', area: 'Kitchen', category: 'Cookware', purchaseDate: '2023-09-01', cost: 1200, supplier: 'Chef Supply Co', status: 'Needs Replacement', minStock: 3 },
    { id: '4', name: 'Outdoor Chairs', quantity: 15, unit: 'pcs', area: 'Open Area', category: 'Furniture', purchaseDate: '2023-05-20', cost: 800, supplier: 'Local Woodworks', status: 'Good', minStock: 15 }
];

const INITIAL_EVENTS: CalendarEvent[] = [
    { id: '1', title: 'Staff Meeting', date: new Date().toISOString().split('T')[0], priority: 'High', category: 'Staff', status: 'Completed', description: 'Weekly briefing' },
    { id: '2', title: 'Generator Maintenance', date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], priority: 'High', category: 'Maintenance', status: 'Pending', description: 'Check oil and filters' }
];

// --- Recipe Mapping ---
const ITEM_RECIPES: { [key: string]: string[] } = {
    'Hot Coffee': ['milk', 'coffee_powder', 'sugar'],
    'Masala Chai': ['milk', 'tea_leaves', 'sugar', 'ginger'],
    'Blue Crushers': ['syrup_blue', 'soda', 'lemon', 'sugar'],
    'Mint Mojito': ['syrup_mint', 'soda', 'lemon', 'coriander', 'sugar'],
    'Kiwi Mojito': ['syrup_kiwi', 'soda', 'lemon', 'sugar'],
    'Green Apple Mojito': ['syrup_apple', 'soda', 'lemon', 'sugar'],
    'Spicy Mango Soda': ['syrup_mango', 'soda', 'lemon'],
    'Fresh Lime Soda': ['soda', 'lemon', 'sugar'],
    'Coconut Water': ['coconut_water'],
    'Cold Coffee': ['milk', 'coffee_powder', 'sugar', 'ice_cream'],
    'Banana Shake': ['milk', 'banana', 'sugar'],
    'Chocobar Shake': ['milk', 'chocolate', 'sugar', 'ice_cream'],
    'Papaya Shake': ['milk', 'papaya', 'sugar'],
    'Oreo Shake': ['milk', 'oreo', 'sugar', 'ice_cream'],
    'KitKat Shake': ['milk', 'kitkat', 'sugar', 'ice_cream'],
    'Sweet Lassi': ['curd', 'sugar'],
    'Plain Maggi': ['maggi'],
    'Vegetable Maggi': ['maggi', 'onion', 'tomato', 'peas', 'carrot'],
    'Cheese Maggi': ['maggi', 'cheese_slice'],
    'Double Masala Maggi': ['maggi', 'onion', 'tomato'],
    'Tandoori Maggi': ['maggi', 'onion', 'capsicum'],
    'Burnt Garlic Maggi': ['maggi', 'garlic'],
    'Egg Maggi': ['maggi', 'egg', 'onion'],
    'Chicken Maggi': ['maggi', 'chicken', 'onion'],
    'Veg Fried Momos': ['momos_wrapper', 'onion', 'cabbage', 'carrot'],
    'Veg Tandoori Momos': ['momos_wrapper', 'onion', 'capsicum', 'curd'],
    'Paneer Fried Momos': ['momos_wrapper', 'paneer', 'onion'],
    'Corn Cheese Fried Momos': ['momos_wrapper', 'corn', 'cheese_slice'],
    'Chicken Fried Momos': ['momos_wrapper', 'chicken', 'onion'],
    'Chicken Tandoori Momos': ['momos_wrapper', 'chicken', 'curd'],
    'Nutella Sandwich': ['bread', 'chocolate'],
    'Corn Masala Sandwich': ['bread', 'corn', 'onion', 'butter'],
    'Bombay Kachha Sandwich': ['bread', 'cucumber', 'tomato', 'onion', 'butter'],
    'Veggie Grill Sandwich': ['bread', 'cucumber', 'tomato', 'onion', 'capsicum', 'butter'],
    'Cheese Chutney Sandwich': ['bread', 'cheese_slice', 'coriander', 'butter'],
    'Paneer Takatak Sandwich': ['bread', 'paneer', 'onion', 'capsicum', 'butter'],
    'Egg Sandwich': ['bread', 'egg', 'onion', 'butter'],
    'Veg Burger': ['burger_bun', 'potato', 'onion', 'tomato'],
    'Veg Cheese Burger': ['burger_bun', 'potato', 'cheese_slice', 'onion'],
    'Veg Paneer Burger': ['burger_bun', 'paneer', 'onion', 'tomato'],
    'Crispy Corn Burger': ['burger_bun', 'corn', 'potato'],
    'Chicken Burger': ['burger_bun', 'chicken', 'onion', 'tomato'],
    'Chicken Cheese Burger': ['burger_bun', 'chicken', 'cheese_slice'],
    'French Fries': ['fries_frozen'],
    'Masala Fries': ['fries_frozen'],
    'Cheese Fries': ['fries_frozen', 'cheese_slice'],
    'Peri Peri Fries': ['fries_frozen'],
    'Cheese Garlic Bread': ['bread', 'cheese_slice', 'garlic', 'butter'],
    'Bruschetta': ['bread', 'tomato', 'onion', 'cheese_slice', 'garlic'],
    'Margherita Pizza': ['pizza_base', 'mozzarella', 'tomato'],
    'Onion Pizza': ['pizza_base', 'mozzarella', 'onion'],
    'Veggie Delight Pizza': ['pizza_base', 'mozzarella', 'onion', 'capsicum', 'corn', 'tomato'],
    'Sweet Corn Pizza': ['pizza_base', 'mozzarella', 'corn'],
    'Paneer Wrapped Pizza': ['pizza_base', 'mozzarella', 'paneer', 'onion', 'capsicum'],
    'Cheese Burst Pizza': ['pizza_base', 'mozzarella', 'cheese_slice'],
    'Red Sauce Pasta': ['pasta_penne', 'tomato', 'garlic', 'onion'],
    'White Sauce Pasta': ['pasta_penne', 'milk', 'butter', 'cheese_slice', 'garlic'],
    'Pink Sauce Pasta': ['pasta_penne', 'milk', 'tomato', 'cheese_slice'],
    'Tomato Soup': ['tomato', 'butter', 'cream'],
    'Veg Soup': ['carrot', 'peas', 'corn', 'onion'],
    'Mix Veg Salad': ['cucumber', 'onion', 'tomato', 'carrot', 'lemon'],
    'Onion Salad': ['onion', 'lemon'],
    'Cucumber Salad': ['cucumber', 'lemon'],
    'Plain Dahi': ['curd'],
    'Jeera Raita': ['curd'],
    'Boondi Raita': ['curd'],
    'Mix Veg Raita': ['curd', 'onion', 'cucumber', 'tomato'],
    'Ice Cream': ['ice_cream'],
    'Gulab Jamun': ['sugar'],
    'Sizzling Brownie': ['chocolate', 'ice_cream'],
    'Chilly Paneer': ['paneer', 'onion', 'capsicum', 'garlic', 'ginger'],
    'Honey Crispy Potato': ['potato', 'garlic'],
    'Chilly Baby Corn': ['corn', 'onion', 'capsicum'],
    'Veg Fried Rice': ['rice', 'carrot', 'peas', 'onion', 'garlic'],
    'Mushroom Fried Rice': ['rice', 'mushroom', 'onion', 'garlic'],
    'Onion Fried Rice': ['rice', 'onion', 'garlic'],
    'Veg Fried Noodles': ['noodles', 'cabbage', 'carrot', 'onion'],
    'Mushroom Noodles': ['noodles', 'mushroom', 'onion'],
    'Egg Fried Rice': ['rice', 'egg', 'onion'],
    'Chicken Fried Rice': ['rice', 'chicken', 'onion'],
    'Egg Fried Noodles': ['noodles', 'egg', 'onion'],
    'Chilly Chkn Boneless': ['chicken', 'onion', 'capsicum', 'garlic'],
    'Chilly Chkn Bone': ['chicken', 'onion', 'capsicum', 'garlic'],
    'Butter Toast': ['bread', 'butter'],
    'Cheese Toast': ['bread', 'cheese_slice', 'butter'],
    'Aloo Paratha': ['atta', 'potato', 'onion', 'butter'],
    'Mix Veg Paratha': ['atta', 'potato', 'carrot', 'cauliflower', 'butter'],
    'Paneer Paratha': ['atta', 'paneer', 'onion', 'butter'],
    'Gobhi Paratha': ['atta', 'cauliflower', 'onion', 'butter'],
    'Pizza Paratha': ['atta', 'cheese_slice', 'corn', 'capsicum', 'butter'],
    'Butter Roti': ['atta', 'butter'],
    'Plain Roti': ['atta'],
    'Paneer Methi': ['paneer', 'cream', 'onion', 'tomato', 'butter'],
    'Paneer Butter': ['paneer', 'butter', 'cream', 'tomato'],
    'Paneer Hotel Style': ['paneer', 'onion', 'capsicum', 'tomato', 'cream'],
    'Kadai Paneer': ['paneer', 'onion', 'capsicum', 'tomato'],
    'Mix Veg': ['potato', 'carrot', 'peas', 'cauliflower', 'onion', 'tomato'],
    'Navratna Korma': ['potato', 'carrot', 'peas', 'paneer', 'cream'],
    'Malai Kofta': ['potato', 'paneer', 'cream', 'tomato'],
    'Mutter Paneer': ['paneer', 'peas', 'tomato', 'onion'],
    'Shahi Paneer': ['paneer', 'cream', 'tomato'],
    'Butter Paneer Masala': ['paneer', 'butter', 'cream', 'tomato', 'onion'],
    'Dal Fry': ['onion', 'tomato', 'garlic', 'butter'],
    'Dal Tadka': ['onion', 'tomato', 'garlic', 'butter'],
    'Plain Rice': ['rice'],
    'Jeera Rice': ['rice', 'butter'],
    'Garlic Lemon Rice': ['rice', 'garlic', 'lemon'],
    'Mushroom Tikka': ['mushroom', 'curd', 'onion', 'capsicum'],
    'Masala Aloo': ['potato', 'onion', 'tomato'],
    'Angara Paneer Tikka': ['paneer', 'curd', 'onion', 'capsicum'],
    'Malai Paneer Tikka': ['paneer', 'cream', 'curd', 'onion', 'capsicum'],
    'Paneer Garlic Tikka': ['paneer', 'garlic', 'curd'],
    'Tandoori Aloo': ['potato', 'curd'],
    'Omelette Simple': ['egg', 'onion'],
    'Omelette Plain': ['egg'],
    'Omelette Loaded': ['egg', 'onion', 'tomato', 'cheese_slice'],
    'Omelette Cheese': ['egg', 'cheese_slice'],
    'Omelette Pepper': ['egg'],
    'Omelette Butter': ['egg', 'butter'],
    'Egg Bhurji': ['egg', 'onion', 'tomato', 'coriander'],
    'Egg Curry': ['egg', 'onion', 'tomato'],
    'Chicken Curry': ['chicken', 'onion', 'tomato', 'garlic', 'ginger'],
    'Chicken Jalfrezi': ['chicken', 'onion', 'capsicum', 'tomato'],
    'Lemon Chicken': ['chicken', 'lemon', 'cream'],
    'Chicken Kebab': ['chicken', 'egg', 'onion', 'garlic'],
    'Mutton Rogan Josh': ['mutton', 'onion', 'curd', 'garlic'],
    'Mutton Curry': ['mutton', 'onion', 'tomato', 'garlic'],
    'Rara Mutton': ['mutton', 'onion', 'tomato', 'garlic'],
    'Mutton Kebab': ['mutton', 'onion', 'garlic'],
    'Tandoori Malai Chkn': ['chicken', 'cream', 'curd'],
    'Ginger Garlic Chkn': ['chicken', 'ginger', 'garlic', 'curd'],
    'Kali Mirch Chkn': ['chicken', 'curd', 'cream'],
    'Mutton Seekh Kebab': ['mutton', 'onion', 'garlic'],
};

const generateMenuId = () => Math.random().toString(36).substr(2, 9);

const RAW_MENU_DATA = {
  stay: [
      { cat: 'Stay', items: [['Room - Accommodates up to 3', 1800, 'Slow', '1 Double Bed | Attached Washroom | Cozy & Comfortable'], ['Room - Accommodates up to 8', 3500, 'Slow', '2 Double Beds | Attached Bathroom | Spacious & Family Friendly']] }
  ],
  veg: [
    { cat: 'Beverages (Hot)', items: [['Hot Coffee', 160, 'Quick'], ['Masala Chai', 50, 'Quick']] },
    { cat: 'Beverages (Cold)', items: [['Blue Crushers', 200, 'Quick'], ['Mint Mojito', 240, 'Quick'], ['Kiwi Mojito', 260, 'Quick'], ['Green Apple Mojito', 260, 'Quick'], ['Spicy Mango Soda', 200, 'Quick'], ['Fresh Lime Soda', 160, 'Quick'], ['Coconut Water', 120, 'Quick'], ['Cold Coffee', 240, 'Quick']] },
    { cat: 'Shakes/Lassi', items: [['Banana Shake', 200, 'Quick'], ['Chocobar Shake', 240, 'Quick'], ['Papaya Shake', 200, 'Quick'], ['Oreo Shake', 240, 'Quick'], ['KitKat Shake', 240, 'Quick'], ['Sweet Lassi', 160, 'Quick']] },
    { cat: 'Maggi', items: [['Plain Maggi', 80, 'Quick'], ['Vegetable Maggi', 100, 'Quick'], ['Cheese Maggi', 120, 'Quick'], ['Double Masala Maggi', 140, 'Quick'], ['Tandoori Maggi', 180, 'Quick'], ['Burnt Garlic Maggi', 180, 'Quick']] },
    { cat: 'Momos', items: [['Veg Fried Momos', 160, 'Quick'], ['Veg Tandoori Momos', 180, 'Medium'], ['Paneer Fried Momos', 200, 'Medium'], ['Corn Cheese Fried Momos', 200, 'Medium']] },
    { cat: 'Sandwiches', items: [['Nutella Sandwich', 160, 'Quick'], ['Corn Masala Sandwich', 160, 'Quick'], ['Bombay Kachha Sandwich', 150, 'Quick'], ['Veggie Grill Sandwich', 180, 'Medium'], ['Cheese Chutney Sandwich', 200, 'Quick'], ['Paneer Takatak Sandwich', 220, 'Medium']] },
    { cat: 'Burgers', items: [['Veg Burger', 130, 'Medium'], ['Veg Cheese Burger', 150, 'Medium'], ['Veg Paneer Burger', 160, 'Medium'], ['Crispy Corn Burger', 140, 'Medium']] },
    { cat: 'Fries/Sides', items: [['French Fries', 160, 'Quick'], ['Masala Fries', 200, 'Quick'], ['Cheese Fries', 240, 'Quick'], ['Peri Peri Fries', 220, 'Quick'], ['Cheese Garlic Bread', 140, 'Medium'], ['Bruschetta', 170, 'Medium']] },
    { cat: 'Pizza', items: [['Margherita Pizza', 200, 'Medium'], ['Onion Pizza', 260, 'Medium'], ['Veggie Delight Pizza', 280, 'Medium'], ['Sweet Corn Pizza', 260, 'Medium'], ['Paneer Wrapped Pizza', 320, 'Medium'], ['Cheese Burst Pizza', 440, 'Medium']] },
    { cat: 'Pasta', items: [['Red Sauce Pasta', 200, 'Medium'], ['White Sauce Pasta', 300, 'Medium'], ['Pink Sauce Pasta', 320, 'Medium']] },
    { cat: 'Soups', items: [['Tomato Soup', 160, 'Medium'], ['Veg Soup', 180, 'Medium']] },
    { cat: 'Salad/Raita', items: [['Mix Veg Salad', 100, 'Quick'], ['Onion Salad', 60, 'Quick'], ['Cucumber Salad', 80, 'Quick'], ['Plain Dahi', 80, 'Quick'], ['Jeera Raita', 100, 'Quick'], ['Boondi Raita', 120, 'Quick'], ['Mix Veg Raita', 140, 'Quick']] },
    { cat: 'Desserts', items: [['Ice Cream', 160, 'Quick'], ['Gulab Jamun', 120, 'Quick'], ['Sizzling Brownie', 300, 'Medium']] },
    { cat: 'Chinese', items: [['Chilly Paneer', 360, 'Medium'], ['Honey Crispy Potato', 300, 'Medium'], ['Chilly Baby Corn', 320, 'Medium'], ['Veg Fried Rice', 240, 'Medium'], ['Mushroom Fried Rice', 280, 'Medium'], ['Onion Fried Rice', 200, 'Medium'], ['Veg Fried Noodles', 240, 'Medium'], ['Mushroom Noodles', 280, 'Medium']] },
    { cat: 'Breakfast (Indian)', items: [['Butter Toast', 80, 'Quick'], ['Cheese Toast', 120, 'Quick'], ['Aloo Paratha', 100, 'Medium'], ['Mix Veg Paratha', 120, 'Medium'], ['Paneer Paratha', 140, 'Medium'], ['Gobhi Paratha', 120, 'Medium'], ['Pizza Paratha', 160, 'Medium'], ['Butter Roti', 30, 'Quick'], ['Plain Roti', 20, 'Quick']] },
    { cat: 'Veg Main Course', items: [['Paneer Methi', 360, 'Slow'], ['Paneer Butter', 400, 'Slow'], ['Paneer Hotel Style', 400, 'Slow'], ['Kadai Paneer', 400, 'Slow'], ['Mix Veg', 300, 'Slow'], ['Navratna Korma', 360, 'Slow'], ['Malai Kofta', 380, 'Slow'], ['Mutter Paneer', 360, 'Slow'], ['Shahi Paneer', 420, 'Slow'], ['Butter Paneer Masala', 420, 'Slow'], ['Dal Fry', 240, 'Slow'], ['Dal Tadka', 260, 'Slow']] },
    { cat: 'Rice (Indian)', items: [['Plain Rice', 120, 'Medium'], ['Jeera Rice', 160, 'Medium'], ['Garlic Lemon Rice', 180, 'Medium']] },
    { cat: 'Tandoor Starters', items: [['Mushroom Tikka', 400, 'Slow'], ['Masala Aloo', 300, 'Medium'], ['Angara Paneer Tikka', 440, 'Slow'], ['Malai Paneer Tikka', 440, 'Slow'], ['Paneer Garlic Tikka', 440, 'Slow'], ['Tandoori Aloo', 280, 'Medium']] },
  ],
  nonVeg: [
    { cat: 'Breakfast (Non-Veg)', items: [['Egg Sandwich', 140, 'Quick'], ['Omelette Simple', 80, 'Quick'], ['Omelette Plain', 100, 'Quick'], ['Omelette Loaded', 160, 'Quick'], ['Omelette Cheese', 140, 'Quick'], ['Omelette Pepper', 120, 'Quick'], ['Omelette Butter', 120, 'Quick']] },
    { cat: 'Maggi (Non-Veg)', items: [['Egg Maggi', 140, 'Quick'], ['Chicken Maggi', 200, 'Quick']] },
    { cat: 'Momos (Non-Veg)', items: [['Chicken Fried Momos', 220, 'Medium'], ['Chicken Tandoori Momos', 240, 'Medium']] },
    { cat: 'Burgers (Non-Veg)', items: [['Chicken Burger', 200, 'Medium'], ['Chicken Cheese Burger', 220, 'Medium']] },
    { cat: 'Egg Dishes', items: [['Egg Bhurji', 160, 'Medium'], ['Egg Curry', 200, 'Medium']] },
    { cat: 'Chinese (Non-Veg)', items: [['Egg Fried Rice', 280, 'Medium'], ['Chicken Fried Rice', 320, 'Medium'], ['Egg Fried Noodles', 280, 'Medium'], ['Chilly Chkn Boneless', 440, 'Medium'], ['Chilly Chkn Bone', 400, 'Medium']] },
    { cat: 'Chicken Main', items: [['Chicken Curry', 440, 'Slow'], ['Chicken Jalfrezi', 480, 'Slow'], ['Lemon Chicken', 480, 'Slow'], ['Chicken Kebab', 400, 'Slow']] },
    { cat: 'Mutton Main', items: [['Mutton Rogan Josh', 600, 'Slow'], ['Mutton Curry', 560, 'Slow'], ['Rara Mutton', 640, 'Slow'], ['Mutton Kebab', 500, 'Slow']] },
    { cat: 'Tandoor (Non-Veg)', items: [['Tandoori Malai Chkn', 480, 'Slow'], ['Ginger Garlic Chkn', 480, 'Slow'], ['Kali Mirch Chkn', 480, 'Slow'], ['Mutton Seekh Kebab', 560, 'Slow']] },
  ]
};

const buildMenu = (): MenuItem[] => {
  const menu: MenuItem[] = [];
  const DEFAULT_DESC = "A delicious blend of flavors";
  
  if (RAW_MENU_DATA.stay) {
      RAW_MENU_DATA.stay.forEach(catData => {
          catData.items.forEach((item: any) => {
              menu.push({
                id: generateMenuId(),
                name: item[0],
                category: catData.cat,
                price: item[1],
                isVeg: true,
                prepTime: item[2] as PrepTime,
                available: true,
                description: item[3] || DEFAULT_DESC
              });
          });
      });
  }

  RAW_MENU_DATA.veg.forEach(catData => {
    catData.items.forEach((item: any) => {
      menu.push({
        id: generateMenuId(),
        name: item[0],
        category: catData.cat,
        price: item[1],
        isVeg: true,
        prepTime: item[2] as PrepTime,
        available: true,
        description: item[3] || DEFAULT_DESC
      });
    });
  });
  RAW_MENU_DATA.nonVeg.forEach(catData => {
    catData.items.forEach((item: any) => {
      menu.push({
        id: generateMenuId(),
        name: item[0],
        category: catData.cat,
        price: item[1],
        isVeg: false,
        prepTime: item[2] as PrepTime,
        available: true,
        description: item[3] || DEFAULT_DESC
      });
    });
  });
  return menu;
};

const INITIAL_MENU = buildMenu();

// --- Utility Functions ---

const calculatePrepTime = (items: CartItem[]): number => {
  if (items.length === 0) return 0;
  let baseTime = 0;
  items.forEach(item => {
      let itemTime = 0;
      if (item.category === 'Stay') return; 
      if (item.prepTime === 'Quick') itemTime = 10;
      else if (item.prepTime === 'Medium') itemTime = 20;
      else if (item.prepTime === 'Slow') itemTime = 35;
      if (!item.isVeg) itemTime += 10;
      if (itemTime > baseTime) baseTime = itemTime;
  });
  const volumeBuffer = items.length > 2 ? (items.length - 2) * 5 : 0;
  return baseTime + volumeBuffer;
};

const generateCSV = (menu: MenuItem[]) => {
  const headers = ['Name', 'Category', 'Price', 'Available', 'PrepTime', 'IsVeg', 'Description'];
  const rows = menu.map(item => [
    `"${item.name}"`,
    `"${item.category}"`,
    item.price,
    item.available ? 'Yes' : 'No',
    item.prepTime,
    item.isVeg ? 'Yes' : 'No',
    `"${item.description.replace(/"/g, '""')}"`
  ]);
  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `skylark_menu_data_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const parseCSV = (csvText: string, currentMenu: MenuItem[]): MenuItem[] | null => {
    try {
        const lines = csvText.split('\n').map(line => line.trim()).filter(line => line);
        if (lines.length < 2) return null;
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
        const idxMap: {[key: string]: number} = {};
        headers.forEach((h, i) => idxMap[h] = i);
        if (idxMap['name'] === undefined || idxMap['price'] === undefined) return null;

        const newMenu = [...currentMenu];
        for (let i = 1; i < lines.length; i++) {
            const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)?.map(s => s.replace(/^"|"$/g, '').replace(/""/g, '"'));
            if (!row) continue;
            const name = row[idxMap['name']];
            const itemIndex = newMenu.findIndex(m => m.name.toLowerCase() === name?.toLowerCase());
            if (itemIndex !== -1 && name) {
                 if (idxMap['price'] !== undefined && row[idxMap['price']]) {
                     const price = parseFloat(row[idxMap['price']]);
                     if (!isNaN(price)) newMenu[itemIndex].price = price;
                 }
                 if (idxMap['available'] !== undefined && row[idxMap['available']]) {
                     const val = row[idxMap['available']].toLowerCase();
                     newMenu[itemIndex].available = (val === 'yes' || val === 'true' || val === '1');
                 }
                 if (idxMap['preptime'] !== undefined && row[idxMap['preptime']]) {
                     const val = row[idxMap['preptime']] as PrepTime;
                     if (['Quick', 'Medium', 'Slow'].includes(val)) newMenu[itemIndex].prepTime = val;
                 }
                 if (idxMap['description'] !== undefined && row[idxMap['description']]) {
                     newMenu[itemIndex].description = row[idxMap['description']];
                 }
            }
        }
        return newMenu;
    } catch (e) {
        return null;
    }
};

const parseInventoryCSV = (csvText: string): InventoryItem[] | null => {
    try {
        const lines = csvText.split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length < 2) return null;
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
        
        const idx = (key: string) => headers.findIndex(h => h.includes(key));
        
        const iId = idx('id');
        const iName = idx('name');
        const iQty = idx('quantity');
        const iUnit = idx('unit');
        const iArea = idx('area');
        const iCat = idx('category');
        const iCost = idx('cost');
        const iSupp = idx('supplier');
        const iStat = idx('status');
        
        if (iName === -1) return null;

        return lines.slice(1).map(line => {
             const row = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)?.map(s => s.replace(/^"|"$/g, '').replace(/""/g, '"'));
             if (!row) return null;
             
             return {
                 id: (iId > -1 && row[iId]) ? row[iId] : Math.random().toString(36).substr(2, 9),
                 name: row[iName] || 'Unknown',
                 quantity: iQty > -1 ? Number(row[iQty]) || 0 : 0,
                 unit: iUnit > -1 ? row[iUnit] : 'pcs',
                 area: (iArea > -1 ? row[iArea] : 'Kitchen') as any,
                 category: iCat > -1 ? row[iCat] : 'General',
                 purchaseDate: new Date().toISOString().split('T')[0],
                 cost: iCost > -1 ? Number(row[iCost]) || 0 : 0,
                 supplier: iSupp > -1 ? row[iSupp] : '',
                 status: (iStat > -1 ? row[iStat] : 'Good') as any,
                 minStock: 5
             } as InventoryItem;
        }).filter(Boolean) as InventoryItem[];
    } catch (e) {
        return null;
    }
};

// --- Enhanced Theme System (ULTRA BRIGHT NEON) ---

const getCategoryTheme = (cat: string) => {
  const lower = cat.toLowerCase();
  const themes = {
    cyan: { hex: '#00E5FF', text: 'text-[#00E5FF]', bg: 'bg-cyan-500', border: 'border-[#00E5FF]', shadow: 'shadow-[#00E5FF]', lightBg: 'bg-[#00E5FF]/10', neon: 'text-[#00E5FF]' },
    magenta: { hex: '#FF00FF', text: 'text-[#FF00FF]', bg: 'bg-fuchsia-500', border: 'border-[#FF00FF]', shadow: 'shadow-[#FF00FF]', lightBg: 'bg-[#FF00FF]/10', neon: 'text-[#FF00FF]' },
    yellow: { hex: '#FFFF00', text: 'text-[#FFFF00]', bg: 'bg-yellow-500', border: 'border-[#FFFF00]', shadow: 'shadow-[#FFFF00]', lightBg: 'bg-[#FFFF00]/10', neon: 'text-[#FFFF00]' },
    green: { hex: '#00FF00', text: 'text-[#00FF00]', bg: 'bg-green-500', border: 'border-[#00FF00]', shadow: 'shadow-[#00FF00]', lightBg: 'bg-[#00FF00]/10', neon: 'text-[#00FF00]' },
    orange: { hex: '#FF9100', text: 'text-[#FF9100]', bg: 'bg-orange-500', border: 'border-[#FF9100]', shadow: 'shadow-[#FF9100]', lightBg: 'bg-[#FF9100]/10', neon: 'text-[#FF9100]' },
    red: { hex: '#FF1744', text: 'text-[#FF1744]', bg: 'bg-red-500', border: 'border-[#FF1744]', shadow: 'shadow-[#FF1744]', lightBg: 'bg-[#FF1744]/10', neon: 'text-[#FF1744]' },
    white: { hex: '#FFFFFF', text: 'text-white', bg: 'bg-white', border: 'border-white', shadow: 'shadow-white', lightBg: 'bg-white/10', neon: 'text-white' }
  };

  if (cat === 'All') return { icon: Utensils, ...themes.magenta };
  if (cat === 'Stay') return { icon: BedDouble, ...themes.cyan };
  if (lower.includes('burger')) return { icon: Sandwich, ...themes.orange };
  if (lower.includes('pizza')) return { icon: Pizza, ...themes.yellow };
  if (lower.includes('sandwich')) return { icon: Sandwich, ...themes.orange };
  if (lower.includes('hot') || lower.includes('coffee') || lower.includes('chai')) return { icon: Coffee, ...themes.orange };
  if (lower.includes('beverage') || lower.includes('soda') || lower.includes('water') || lower.includes('mojito')) return { icon: GlassWater, ...themes.cyan };
  if (lower.includes('shake') || lower.includes('lassi')) return { icon: IceCream, ...themes.magenta };
  if (lower.includes('maggi') || lower.includes('noodle')) return { icon: Utensils, ...themes.yellow };
  if (lower.includes('pasta')) return { icon: Utensils, ...themes.yellow };
  if (lower.includes('momos')) return { icon: CircleDot, ...themes.orange };
  if (lower.includes('fries')) return { icon: Crop, ...themes.yellow };
  if (lower.includes('dessert') || lower.includes('ice cream') || lower.includes('brownie') || lower.includes('gulab')) return { icon: Cookie, ...themes.magenta };
  if (lower.includes('salad') || lower.includes('raita')) return { icon: Carrot, ...themes.green };
  if (lower.includes('egg') || lower.includes('omelette')) return { icon: Egg, ...themes.red };
  if (lower.includes('chicken') || lower.includes('mutton') || lower.includes('non-veg')) return { icon: Drumstick, ...themes.red };
  if (lower.includes('rice') || lower.includes('biryani')) return { icon: CircleDot, ...themes.orange };
  if (lower.includes('soup')) return { icon: Soup, ...themes.orange };
  if (lower.includes('tandoor')) return { icon: Flame, ...themes.red };
  if (lower.includes('chinese')) return { icon: Utensils, ...themes.red };
  if (lower.includes('breakfast') && lower.includes('veg')) return { icon: Croissant, ...themes.yellow };
  if (lower.includes('veg')) return { icon: Leaf, ...themes.green };
  
  return { icon: Utensils, ...themes.cyan };
};

const getCategoryGroup = (cat: string): string => {
    if (cat === 'All') return 'Menu';
    if (cat === 'Stay') return 'Stay';
    const lower = cat.toLowerCase();
    if (['beverages', 'shakes', 'lassi', 'coffee', 'tea'].some(k => lower.includes(k))) return 'Drinks';
    if (['maggi', 'momos', 'sandwiches', 'burgers', 'fries', 'pizza', 'pasta', 'soups', 'salad', 'raita', 'desserts', 'breakfast', 'egg'].some(k => lower.includes(k))) return 'Fast Food';
    return 'Main Course';
}

const Toast = ({ message, onClose }: { message: string, onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 1500);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div className="bg-green-600 text-white px-6 py-3 rounded-full shadow-[0_0_20px_rgba(0,255,0,0.6)] flex items-center gap-3 animate-fade-in border border-green-400 font-bold text-sm z-[100]">
       <CheckCircleIcon className="w-5 h-5 text-white" /> 
       {message}
    </div>
  );
};

// --- New Components: InventoryManager & CalendarPlanner ---

const InventoryManager = React.memo(({ isOpen, onClose, inventory, setInventory, purchaseLogs, setPurchaseLogs, usageLogs, setUsageLogs }: any) => {
    const [activeTab, setActiveTab] = useState<'stock' | 'purchases' | 'usage'>('stock');
    const [filterArea, setFilterArea] = useState<InventoryArea | 'All'>('All');
    const [search, setSearch] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // New Item State
    const [newItem, setNewItem] = useState<Partial<InventoryItem>>({ area: 'Kitchen', unit: 'pcs', status: 'Good', minStock: 5 });
    const [isEditing, setIsEditing] = useState(false);

    if (!isOpen) return null;

    const filteredInventory = inventory.filter((item: InventoryItem) => 
        (filterArea === 'All' || item.area === filterArea) && 
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleSaveItem = () => {
        if (newItem.name && newItem.quantity) {
            if (isEditing && newItem.id) {
                setInventory((prev: any) => prev.map((i: any) => i.id === newItem.id ? { ...newItem } : i));
            } else {
                setInventory((prev: any) => [...prev, { ...newItem, id: generateMenuId() }]);
            }
            setNewItem({ area: 'Kitchen', unit: 'pcs', status: 'Good', minStock: 5 });
            setIsEditing(false);
        }
    };

    const exportInventoryCSV = () => {
        const headers = ['ID', 'Name', 'Quantity', 'Unit', 'Area', 'Category', 'Cost', 'Supplier', 'Status'];
        const rows = inventory.map((i: InventoryItem) => [i.id, i.name, i.quantity, i.unit, i.area, i.category, i.cost, i.supplier, i.status]);
        const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'inventory_export.csv';
        document.body.appendChild(link);
        link.click();
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const csvText = event.target?.result as string;
            if (csvText) {
                const parsed = parseInventoryCSV(csvText);
                if (parsed) {
                    setInventory((prev: any) => [...prev, ...parsed]);
                    alert(`Imported ${parsed.length} inventory items.`);
                }
            }
        };
        reader.readAsText(file);
        if(fileInputRef.current) fileInputRef.current.value = '';
    }

    return (
        <div className="fixed inset-0 z-[90] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl h-[90vh] flex flex-col overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Package className="w-6 h-6 text-blue-600"/> Inventory Management</h2>
                    <button onClick={onClose}><X className="w-6 h-6 text-gray-500 hover:text-gray-800"/></button>
                </div>
                
                <div className="flex border-b bg-white">
                    <button onClick={() => setActiveTab('stock')} className={`flex-1 py-4 font-bold text-sm border-b-2 ${activeTab === 'stock' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>Current Stock</button>
                    <button onClick={() => setActiveTab('purchases')} className={`flex-1 py-4 font-bold text-sm border-b-2 ${activeTab === 'purchases' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>Purchase Log</button>
                    <button onClick={() => setActiveTab('usage')} className={`flex-1 py-4 font-bold text-sm border-b-2 ${activeTab === 'usage' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>Usage Log</button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {activeTab === 'stock' && (
                        <div className="space-y-6">
                            <div className="flex flex-wrap gap-4 items-center justify-between">
                                <div className="flex gap-2">
                                    {['All', 'Rooms', 'Kitchen', 'Open Area'].map(area => (
                                        <button key={area} onClick={() => setFilterArea(area as any)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterArea === area ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>{area}</button>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} className="border rounded-lg px-4 py-2 text-sm w-64" />
                                    <button onClick={exportInventoryCSV} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold"><Download className="w-4 h-4"/> Export CSV</button>
                                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold"><Upload className="w-4 h-4"/> Import CSV</button>
                                    <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".csv" />
                                </div>
                            </div>

                            {/* Add/Edit Form */}
                            <div className="bg-white p-4 rounded-xl shadow-sm border grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
                                <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold text-gray-500">Name</label><input className="w-full border rounded p-2 text-sm" value={newItem.name || ''} onChange={e => setNewItem({...newItem, name: e.target.value})} /></div>
                                <div><label className="text-xs font-bold text-gray-500">Qty</label><input type="number" className="w-full border rounded p-2 text-sm" value={newItem.quantity || ''} onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})} /></div>
                                <div><label className="text-xs font-bold text-gray-500">Unit</label><input className="w-full border rounded p-2 text-sm" value={newItem.unit || ''} onChange={e => setNewItem({...newItem, unit: e.target.value})} /></div>
                                <div><label className="text-xs font-bold text-gray-500">Area</label><select className="w-full border rounded p-2 text-sm" value={newItem.area} onChange={e => setNewItem({...newItem, area: e.target.value as any})}><option>Rooms</option><option>Kitchen</option><option>Open Area</option></select></div>
                                <div><label className="text-xs font-bold text-gray-500">Category</label><input className="w-full border rounded p-2 text-sm" value={newItem.category || ''} onChange={e => setNewItem({...newItem, category: e.target.value})} /></div>
                                <div><label className="text-xs font-bold text-gray-500">Cost</label><input type="number" className="w-full border rounded p-2 text-sm" value={newItem.cost || ''} onChange={e => setNewItem({...newItem, cost: Number(e.target.value)})} /></div>
                                <div><label className="text-xs font-bold text-gray-500">Supplier</label><input className="w-full border rounded p-2 text-sm" value={newItem.supplier || ''} onChange={e => setNewItem({...newItem, supplier: e.target.value})} /></div>
                                <div><label className="text-xs font-bold text-gray-500">Status</label><select className="w-full border rounded p-2 text-sm" value={newItem.status} onChange={e => setNewItem({...newItem, status: e.target.value as any})}><option>Good</option><option>Needs Replacement</option><option>Damaged</option></select></div>
                                <button onClick={handleSaveItem} className="bg-blue-600 text-white p-2 rounded-lg font-bold text-sm hover:bg-blue-700">{isEditing ? 'Update' : 'Add Item'}</button>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-500">
                                        <tr><th className="p-4">Name</th><th className="p-4">Stock</th><th className="p-4">Area</th><th className="p-4">Category</th><th className="p-4">Status</th><th className="p-4">Actions</th></tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {filteredInventory.map((item: InventoryItem) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="p-4 font-medium">{item.name}</td>
                                                <td className="p-4"><span className={`font-bold ${item.quantity <= item.minStock ? 'text-red-500' : 'text-green-600'}`}>{item.quantity} {item.unit}</span></td>
                                                <td className="p-4"><span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{item.area}</span></td>
                                                <td className="p-4 text-gray-500">{item.category}</td>
                                                <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs ${item.status === 'Good' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.status}</span></td>
                                                <td className="p-4 flex gap-2">
                                                    <button onClick={() => { setNewItem({...item}); setIsEditing(true); }} className="text-blue-600 hover:text-blue-800"><Edit className="w-4 h-4"/></button>
                                                    <button onClick={() => setInventory((prev: any) => prev.filter((i: any) => i.id !== item.id))} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4"/></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {activeTab === 'purchases' && (
                         <div className="text-center text-gray-500 py-10"><Truck className="w-16 h-16 mx-auto mb-4 opacity-20"/><p>Purchase Log tracking coming soon.</p></div>
                    )}
                    {activeTab === 'usage' && (
                         <div className="text-center text-gray-500 py-10"><Activity className="w-16 h-16 mx-auto mb-4 opacity-20"/><p>Usage Log tracking coming soon.</p></div>
                    )}
                </div>
            </div>
        </div>
    );
});

const CalendarPlanner = React.memo(({ isOpen, onClose, events, setEvents }: any) => {
    const [viewDate, setViewDate] = useState(new Date());
    const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({ priority: 'Medium', category: 'Operations', status: 'Pending' });
    const [filterCat, setFilterCat] = useState<EventCategory | 'All'>('All');

    if (!isOpen) return null;

    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const startDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
    
    const filteredEvents = events.filter((e: CalendarEvent) => filterCat === 'All' || e.category === filterCat);

    const handleAddEvent = () => {
        if(newEvent.title && newEvent.date) {
            setEvents((prev: any) => [...prev, { ...newEvent, id: generateMenuId() }]);
            setNewEvent({ priority: 'Medium', category: 'Operations', status: 'Pending', date: newEvent.date });
        }
    };

    const exportCalendarCSV = () => {
        const headers = ['ID', 'Title', 'Date', 'Priority', 'Category', 'Status', 'Description'];
        const rows = events.map((e: CalendarEvent) => [e.id, e.title, e.date, e.priority, e.category, e.status, e.description]);
        const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'planner_export.csv';
        document.body.appendChild(link);
        link.click();
    };

    return (
        <div className="fixed inset-0 z-[90] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
             <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl h-[90vh] flex flex-col overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Calendar className="w-6 h-6 text-purple-600"/> Calendar Planner</h2>
                    <button onClick={onClose}><X className="w-6 h-6 text-gray-500 hover:text-gray-800"/></button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-80 border-r bg-gray-50 p-4 overflow-y-auto">
                        <div className="mb-6">
                            <h3 className="font-bold text-gray-700 mb-3">Add Objective</h3>
                            <div className="space-y-3">
                                <input placeholder="Title" className="w-full border rounded p-2 text-sm" value={newEvent.title || ''} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
                                <input type="date" className="w-full border rounded p-2 text-sm" value={newEvent.date || ''} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                                <select className="w-full border rounded p-2 text-sm" value={newEvent.category} onChange={e => setNewEvent({...newEvent, category: e.target.value as any})}><option>Operations</option><option>Maintenance</option><option>Events</option><option>Staff</option><option>Inventory</option></select>
                                <select className="w-full border rounded p-2 text-sm" value={newEvent.priority} onChange={e => setNewEvent({...newEvent, priority: e.target.value as any})}><option>High</option><option>Medium</option><option>Low</option></select>
                                <textarea placeholder="Description" className="w-full border rounded p-2 text-sm h-20" value={newEvent.description || ''} onChange={e => setNewEvent({...newEvent, description: e.target.value})} />
                                <button onClick={handleAddEvent} className="w-full bg-purple-600 text-white font-bold py-2 rounded hover:bg-purple-700">Add Event</button>
                            </div>
                        </div>
                        <div className="mb-4 border-t pt-4">
                             <h3 className="font-bold text-gray-700 mb-3">Filters</h3>
                             <select className="w-full border rounded p-2 text-sm" value={filterCat} onChange={e => setFilterCat(e.target.value as any)}><option value="All">All Categories</option><option>Operations</option><option>Maintenance</option><option>Events</option><option>Staff</option><option>Inventory</option></select>
                             <button onClick={exportCalendarCSV} className="w-full mt-2 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded text-sm font-bold"><Download className="w-4 h-4"/> Export CSV</button>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="flex-1 p-6 overflow-y-auto">
                         <div className="flex justify-between items-center mb-6">
                             <h2 className="text-2xl font-bold text-gray-800">{viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                             <div className="flex gap-2">
                                 <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} className="p-2 border rounded hover:bg-gray-100"><ChevronLeft className="w-5 h-5"/></button>
                                 <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} className="p-2 border rounded hover:bg-gray-100"><ChevronRight className="w-5 h-5"/></button>
                             </div>
                         </div>

                         <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                             {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="bg-gray-100 p-2 text-center font-bold text-gray-500 text-sm">{d}</div>)}
                             {Array(startDay).fill(null).map((_, i) => <div key={`empty-${i}`} className="bg-white h-32"></div>)}
                             {Array(daysInMonth).fill(null).map((_, i) => {
                                 const day = i + 1;
                                 const dateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                 const dayEvents = filteredEvents.filter(e => e.date === dateStr);
                                 return (
                                     <div key={day} className="bg-white h-32 p-2 border-t hover:bg-gray-50 transition-colors relative group">
                                         <div className="font-bold text-gray-700 mb-1">{day}</div>
                                         <div className="space-y-1 overflow-y-auto max-h-[80px]">
                                             {dayEvents.map(e => (
                                                 <div key={e.id} className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium ${e.priority === 'High' ? 'bg-red-100 text-red-700' : e.priority === 'Medium' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                                     {e.title}
                                                 </div>
                                             ))}
                                         </div>
                                     </div>
                                 );
                             })}
                         </div>
                    </div>
                </div>
             </div>
        </div>
    );
});

const IngredientInventoryModal = React.memo(({ isOpen, onClose, ingredients, toggleIngredient, addIngredient, deleteIngredient }: { 
    isOpen: boolean; 
    onClose: () => void; 
    ingredients: Ingredient[]; 
    toggleIngredient: (id: string) => void; 
    addIngredient: (name: string, category: IngredientCategory) => void;
    deleteIngredient: (id: string) => void;
}) => {
    const [activeCategory, setActiveCategory] = useState<IngredientCategory | 'All'>('All');
    const [newIngName, setNewIngName] = useState('');
    const [newIngCat, setNewIngCat] = useState<IngredientCategory>('Pantry');

    if (!isOpen) return null;

    const categories: IngredientCategory[] = ['Dairy', 'Vegetables', 'Proteins', 'Pantry', 'Beverages', 'Breads'];
    const filteredIngredients = activeCategory === 'All' 
        ? ingredients 
        : ingredients.filter(i => i.category === activeCategory);

    return (
      <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
         <div className="bg-slate-900 border border-white/10 w-full max-w-4xl rounded-2xl shadow-2xl h-[85vh] flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900 rounded-t-2xl">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Refrigerator className="w-8 h-8 text-[#00E5FF]" />
                    Inventory Management
                </h2>
                <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                    <XCircle className="w-8 h-8 text-gray-400 hover:text-white" />
                </button>
            </div>

            <div className="p-4 bg-slate-800/50 border-b border-white/10 flex flex-col sm:flex-row gap-4 items-center">
                 <input 
                    value={newIngName} 
                    onChange={e => setNewIngName(e.target.value)} 
                    placeholder="New Ingredient Name" 
                    className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm w-full"
                 />
                 <select 
                    value={newIngCat} 
                    onChange={e => setNewIngCat(e.target.value as IngredientCategory)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm w-full sm:w-auto"
                 >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
                 <button 
                    onClick={() => {
                        if(newIngName) {
                            addIngredient(newIngName, newIngCat);
                            setNewIngName('');
                        }
                    }}
                    className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-bold text-sm whitespace-nowrap"
                 >
                    + Add
                 </button>
            </div>

            <div className="flex overflow-x-auto p-4 gap-2 border-b border-white/10 bg-slate-900/50 scrollbar-hide">
                <button onClick={() => setActiveCategory('All')} className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeCategory === 'All' ? 'bg-[#00E5FF] text-black' : 'bg-slate-800 text-gray-400'}`}>All Items</button>
                {categories.map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-purple-500 text-white' : 'bg-slate-800 text-gray-400'}`}>{cat}</button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-900">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filteredIngredients.map(ing => (
                        <div key={ing.id} className={`relative group p-3 rounded-xl border transition-all duration-150 flex flex-col items-start gap-2 ${ing.inStock ? 'bg-slate-800/50 border-green-500/30' : 'bg-red-900/10 border-red-500/30 opacity-70'}`}>
                            <div className="flex justify-between w-full items-start">
                                <button onClick={() => toggleIngredient(ing.id)} className="flex-1 text-left">
                                    <div className={`text-sm font-bold ${ing.inStock ? 'text-white' : 'text-red-400'}`}>{ing.name}</div>
                                    <div className="text-[10px] text-gray-500 uppercase mt-1">{ing.category}</div>
                                </button>
                                <button onClick={() => deleteIngredient(ing.id)} className="text-gray-600 hover:text-red-500 transition-colors p-1"><Trash2 className="w-4 h-4"/></button>
                            </div>
                            <button onClick={() => toggleIngredient(ing.id)} className="w-full flex justify-between items-center mt-2">
                                 <span className={`text-[10px] font-bold ${ing.inStock ? 'text-green-400' : 'text-red-400'}`}>{ing.inStock ? 'IN STOCK' : 'OUT'}</span>
                                 {ing.inStock ? <CheckSquare className="w-4 h-4 text-green-400" /> : <Square className="w-4 h-4 text-red-400" />}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
         </div>
      </div>
    );
});

const StockControlModal = React.memo(({ isOpen, onClose, menu, toggleAvailability }: { isOpen: boolean; onClose: () => void; menu: MenuItem[]; toggleAvailability: (id: string) => void; }) => {
    const [search, setSearch] = useState('');
    if (!isOpen) return null;
    const filtered = menu.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

    return (
      <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl max-h-[80vh] flex flex-col">
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-900 rounded-t-2xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Box className="w-6 h-6 text-purple-500" /> Menu Stock</h2>
            <button onClick={onClose}><XCircle className="w-6 h-6 text-gray-400 hover:text-white" /></button>
          </div>
          <div className="p-4 bg-slate-900"><input className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 text-white" placeholder="Search item..." value={search} onChange={e => setSearch(e.target.value)} autoFocus /></div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-900/50">
            {filtered.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-white/5">
                    <div>
                        <div className={`font-bold ${item.available ? 'text-white' : 'text-gray-500 line-through'}`}>{item.name}</div>
                        <div className="text-xs text-gray-400">{item.category}</div>
                        {item.missingIngredients?.length ? <div className="text-[10px] text-red-400 mt-1">Missing: {item.missingIngredients.join(', ')}</div> : null}
                    </div>
                    <button onClick={() => toggleAvailability(item.id)} disabled={!!item.missingIngredients?.length} className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 w-32 justify-center transition-all duration-100 ${item.available ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'} ${item.missingIngredients?.length ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}>
                        {item.available ? <ToggleRight className="w-5 h-5"/> : <ToggleLeft className="w-5 h-5"/>} {item.available ? 'In Stock' : 'Out'}
                    </button>
                </div>
            ))}
          </div>
        </div>
      </div>
    )
});

const MenuEditorModal = React.memo(({ isOpen, onClose, menu, onSave, onDelete }: { 
    isOpen: boolean; 
    onClose: () => void; 
    menu: MenuItem[]; 
    onSave: (item: MenuItem) => void;
    onDelete: (id: string) => void;
}) => {
    const [editItem, setEditItem] = useState<Partial<MenuItem> | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    if (!isOpen) return null;

    const filteredItems = menu.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleSave = () => {
        if (editItem && editItem.name && editItem.price) {
             const newItem: MenuItem = {
                 id: editItem.id || generateMenuId(),
                 name: editItem.name,
                 category: editItem.category || 'Fast Food',
                 price: Number(editItem.price),
                 isVeg: editItem.isVeg ?? true,
                 prepTime: editItem.prepTime || 'Medium',
                 available: editItem.available ?? true,
                 description: editItem.description || 'A delicious blend of flavors'
             };
             onSave(newItem);
             setEditItem(null);
             setIsEditing(false);
        }
    };

    return (
      <div className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl h-[85vh] flex flex-col overflow-hidden">
           <div className="p-6 border-b flex justify-between items-center bg-gray-50">
               <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Edit className="w-6 h-6 text-blue-600"/> Menu Editor</h2>
               <button onClick={onClose}><X className="w-6 h-6 text-gray-500 hover:text-gray-800"/></button>
           </div>
           
           <div className="flex flex-1 overflow-hidden">
               {/* Sidebar List */}
               <div className="w-1/3 border-r bg-gray-50 flex flex-col">
                   <div className="p-4 border-b">
                       <button onClick={() => { setEditItem({}); setIsEditing(true); }} className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold mb-3 flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"><Plus className="w-4 h-4"/> Add New Item</button>
                       <input className="w-full border rounded p-2 text-sm" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                   </div>
                   <div className="flex-1 overflow-y-auto">
                       {filteredItems.map(item => (
                           <div key={item.id} onClick={() => { setEditItem({...item}); setIsEditing(true); }} className={`p-3 border-b cursor-pointer hover:bg-white transition-colors ${editItem?.id === item.id ? 'bg-white border-l-4 border-l-blue-600 shadow-sm' : ''}`}>
                               <div className="font-bold text-gray-800 text-sm">{item.name}</div>
                               <div className="text-xs text-gray-500 flex justify-between mt-1"><span>{item.category}</span><span>₹{item.price}</span></div>
                           </div>
                       ))}
                   </div>
               </div>

               {/* Edit Form */}
               <div className="w-2/3 p-8 overflow-y-auto bg-white">
                   {isEditing ? (
                       <div className="space-y-4 max-w-lg mx-auto">
                           <h3 className="text-xl font-bold mb-6">{editItem?.id ? 'Edit Item' : 'New Item'}</h3>
                           <div>
                               <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
                               <input className="w-full border rounded p-2" value={editItem?.name || ''} onChange={e => setEditItem({...editItem, name: e.target.value})} />
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                               <div>
                                   <label className="block text-sm font-bold text-gray-700 mb-1">Price (₹)</label>
                                   <input type="number" className="w-full border rounded p-2" value={editItem?.price || ''} onChange={e => setEditItem({...editItem, price: Number(e.target.value)})} />
                               </div>
                               <div>
                                   <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                                   <input className="w-full border rounded p-2" value={editItem?.category || ''} onChange={e => setEditItem({...editItem, category: e.target.value})} list="categories" />
                                   <datalist id="categories"><option value="Fast Food"/><option value="Main Course"/><option value="Drinks"/><option value="Stay"/></datalist>
                               </div>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                               <div>
                                   <label className="block text-sm font-bold text-gray-700 mb-1">Prep Time</label>
                                   <select className="w-full border rounded p-2" value={editItem?.prepTime || 'Medium'} onChange={e => setEditItem({...editItem, prepTime: e.target.value as PrepTime})}>
                                       <option value="Quick">Quick</option><option value="Medium">Medium</option><option value="Slow">Slow</option>
                                   </select>
                               </div>
                               <div className="flex items-end pb-2">
                                   <label className="flex items-center gap-2 cursor-pointer">
                                       <input type="checkbox" className="w-5 h-5" checked={editItem?.isVeg ?? true} onChange={e => setEditItem({...editItem, isVeg: e.target.checked})} />
                                       <span className="font-bold text-gray-700">Vegetarian</span>
                                   </label>
                               </div>
                           </div>
                           <div>
                               <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                               <textarea className="w-full border rounded p-2 h-24" value={editItem?.description || ''} onChange={e => setEditItem({...editItem, description: e.target.value})} />
                           </div>
                           <div className="flex gap-3 pt-6">
                               <button onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold">Save Item</button>
                               {editItem?.id && <button onClick={() => { if(confirm('Delete this item?')) { onDelete(editItem.id!); setEditItem(null); setIsEditing(false); } }} className="px-4 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-bold">Delete</button>}
                               <button onClick={() => setIsEditing(false)} className="px-6 border border-gray-300 rounded-lg font-bold hover:bg-gray-50">Cancel</button>
                           </div>
                       </div>
                   ) : (
                       <div className="h-full flex flex-col items-center justify-center text-gray-400">
                           <Utensils className="w-16 h-16 mb-4 opacity-20"/>
                           <p>Select an item to edit or create new</p>
                       </div>
                   )}
               </div>
           </div>
        </div>
      </div>
    );
});

const OrderConfirmationView = React.memo(({ order, onBack }: { order: Order, onBack: () => void }) => {
    return (
        <div className="flex h-screen bg-black items-center justify-center p-4 relative overflow-hidden">
             <div className="absolute inset-0 opacity-30">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#4c1d95_0%,transparent_70%)] animate-pulse" />
             </div>
             <div className="bg-slate-900/90 backdrop-blur-xl border border-purple-500/30 p-8 rounded-3xl max-w-md w-full text-center relative z-10 shadow-[0_0_50px_rgba(139,92,246,0.3)] animate-fade-in">
                 <div className="mb-6 flex justify-center">
                     <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.5)]">
                         <CheckCircleIcon className="w-10 h-10 text-green-400" />
                     </div>
                 </div>
                 <h1 className="text-3xl font-black text-white mb-2">Order Placed!</h1>
                 <p className="text-gray-400 mb-6">Order ID: <span className="font-mono text-purple-400 font-bold">#{order.id.toUpperCase()}</span></p>
                 <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
                     <div className="flex justify-between text-sm text-gray-400 mb-4"><span>Estimated Wait Time</span><span className="text-white font-bold">{order.estimatedTime} mins</span></div>
                     <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden"><div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full w-1/3 animate-pulse"></div></div>
                     <p className="text-xs text-gray-500 mt-2">We're preparing your delicious food!</p>
                 </div>
                 <div className="space-y-3 max-h-40 overflow-y-auto mb-6 text-left bg-black/20 rounded-lg p-3 custom-scrollbar">
                     {order.items.map((item, idx) => (<div key={idx} className="flex justify-between text-sm border-b border-white/5 last:border-0 pb-1 mb-1"><span className="text-gray-300">{item.quantity}x {item.name}</span><span className="text-gray-500">₹{item.price * item.quantity}</span></div>))}
                     <div className="flex justify-between font-bold text-white pt-2 border-t border-white/10"><span>Total</span><span>₹{order.totalAmount}</span></div>
                 </div>
                 <button onClick={onBack} className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-transform active:scale-95">Back to Menu</button>
             </div>
        </div>
    );
});

// --- Login View ---

const LoginView = React.memo(({ target, onLogin, onBack }: { target: 'kitchen' | 'admin', onLogin: () => void, onBack: () => void }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = () => {
        if (target === 'kitchen') {
            if (username === 'skylarkcafe' && password === 'kitchen123') {
                onLogin();
            } else {
                setError('Invalid Chef Credentials');
            }
        } else if (target === 'admin') {
            if (username === 'skylark' && password === 'sanskar321') {
                onLogin();
            } else {
                setError('Invalid Admin Credentials');
            }
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#312e81_0%,#000000_70%)]" />
             <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl w-full max-w-md relative z-10 shadow-2xl">
                 <div className="text-center mb-8">
                     <h1 className="text-3xl font-black text-white mb-2 flex items-center justify-center gap-2">
                         <Lock className="w-8 h-8 text-purple-500" />
                         {target === 'kitchen' ? 'Chef Login' : 'Admin Login'}
                     </h1>
                     <p className="text-gray-400">Please enter your credentials</p>
                 </div>
                 
                 <div className="space-y-4">
                     <div>
                         <label className="block text-gray-400 text-sm font-bold mb-2">Username</label>
                         <input 
                            type="text" 
                            value={username}
                            onChange={(e) => { setUsername(e.target.value); setError(''); }}
                            className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500 transition-colors"
                            placeholder="Enter ID"
                         />
                     </div>
                     <div>
                         <label className="block text-gray-400 text-sm font-bold mb-2">Password</label>
                         <input 
                            type="password" 
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(''); }}
                            className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500 transition-colors"
                            placeholder="Enter Password"
                         />
                     </div>
                     
                     {error && <div className="text-red-500 text-sm text-center font-bold animate-pulse">{error}</div>}
                     
                     <button 
                        onClick={handleLogin}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-purple-500/30"
                     >
                         Login
                     </button>
                     
                     <button 
                        onClick={onBack}
                        className="w-full bg-transparent text-gray-400 hover:text-white font-bold py-2 transition-colors"
                     >
                         Back to Menu
                     </button>
                 </div>
             </div>
        </div>
    );
});

// --- Customer View (Optimized) ---

const CustomerView = React.memo(({ 
    menu, 
    cart, 
    addToCart, 
    updateCartQty,
    clearCart,
    placeOrder, 
    onNavigate 
}: { 
    menu: MenuItem[], 
    cart: CartItem[], 
    addToCart: (item: MenuItem) => void, 
    updateCartQty: (id: string, delta: number) => void,
    clearCart: () => void,
    placeOrder: (name: string) => void, 
    onNavigate: (target: 'kitchen' | 'admin') => void 
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'price' | 'time'>('price');
    const [showVegOnly, setShowVegOnly] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const categoryRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

    const categories: string[] = useMemo(() => Array.from(new Set(menu.map(item => item.category))), [menu]);

    const handleAddToCart = useCallback((item: MenuItem) => {
       addToCart(item);
       setToast(`Added ${item.name}`);
    }, [addToCart]);
    
    const getItemPriority = useCallback((item: MenuItem): number => {
        const cat = item.category.toLowerCase();
        const name = item.name.toLowerCase();
        if (cat.includes('stay')) return -1; // Stay items top priority if needed, or separate logic
        if (cat.includes('hot') && cat.includes('beverage')) return 0;
        if (cat.includes('hot') && !cat.includes('cold')) return 0.5;
        if (cat.includes('beverage') || cat.includes('drink') || cat.includes('coffee') || cat.includes('shake') || cat.includes('lassi')) return 1;
        if (cat.includes('maggi')) return 2;
        if (cat.includes('sandwich')) return 3;
        if (cat.includes('burger')) return 4;
        if (cat.includes('egg') || name.includes('omelette') || name.includes('egg')) return 5;
        if (cat.includes('momos') || cat.includes('fries') || cat.includes('salad') || cat.includes('soup')) return 6;
        if (cat.includes('chinese') || cat.includes('noodle') || cat.includes('rice')) return 7;
        if (cat.includes('pasta') || cat.includes('pizza')) return 8;
        return 9; 
    }, []);

    const groupedCategories = useMemo(() => {
        const groups: {[key: string]: string[]} = {};
        categories.forEach(cat => {
            const groupName = getCategoryGroup(cat);
            if(!groups[groupName]) groups[groupName] = [];
            groups[groupName].push(cat);
        });
        Object.keys(groups).forEach(group => {
            groups[group].sort((a, b) => {
                const itemA = menu.find(i => i.category === a) || { category: a, name: '' } as MenuItem;
                const itemB = menu.find(i => i.category === b) || { category: b, name: '' } as MenuItem;
                return getItemPriority(itemA) - getItemPriority(itemB);
            });
        });
        return groups;
    }, [categories, menu, getItemPriority]);
    
    const getPrepTimeWeight = (prepTime: PrepTime): number => {
      switch (prepTime) { case 'Quick': return 1; case 'Medium': return 2; case 'Slow': return 3; default: return 2; }
    };

    const menuBySection = useMemo(() => {
        const filtered = menu.filter(item => {
            return item.name.toLowerCase().includes(searchQuery.toLowerCase()) && (showVegOnly ? item.isVeg : true);
        });
        const sections: { [key: string]: MenuItem[] } = {};
        filtered.forEach(item => {
            if (!sections[item.category]) sections[item.category] = [];
            sections[item.category].push(item);
        });
        
        Object.keys(sections).forEach(cat => {
             sections[cat].sort((a, b) => {
                if (sortBy === 'time') {
                     const timeA = getPrepTimeWeight(a.prepTime);
                     const timeB = getPrepTimeWeight(b.prepTime);
                     if (timeA !== timeB) return timeA - timeB;
                     return getItemPriority(a) - getItemPriority(b);
                } else {
                     if (a.price !== b.price) return a.price - b.price;
                     return getItemPriority(a) - getItemPriority(b);
                }
             });
        });
        return Object.entries(sections).sort(([, itemsA], [, itemsB]) => {
             if (!itemsA.length) return 1;
             if (!itemsB.length) return -1;
             // Always force Stay category to top if present
             if (itemsA[0].category === 'Stay') return -1;
             if (itemsB[0].category === 'Stay') return 1;
             return getItemPriority(itemsA[0]) - getItemPriority(itemsB[0]);
        });
    }, [menu, searchQuery, showVegOnly, sortBy, getItemPriority]);

    const scrollToCategory = (cat: string) => {
        setIsSidebarOpen(false);
        categoryRefs.current[cat]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const scrollToStay = () => {
        const stayCat = menuBySection.find(([cat]) => cat === 'Stay');
        if (stayCat) scrollToCategory('Stay');
    };

    const scrollToFood = () => {
        const firstFoodCat = menuBySection.find(([cat]) => cat !== 'Stay');
        if (firstFoodCat) scrollToCategory(firstFoodCat[0]);
    };

    return (
      <div className="flex h-screen bg-black text-white overflow-hidden relative font-sans">
        {toast && <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100]"><Toast message={toast} onClose={() => setToast(null)} /></div>}
        {isSidebarOpen && <div className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm animate-fade-in" onClick={() => setIsSidebarOpen(false)} />}

        <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:block bg-black border-r border-white/10 shadow-2xl flex flex-col h-full`}>
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#00E5FF] to-[#FF00FF]">Skylark Café</h1>
                <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400"><X className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-hide">
                {['Stay', 'Drinks', 'Fast Food', 'Main Course'].map(group => (
                    groupedCategories[group] && groupedCategories[group].length > 0 ? (
                    <div key={group}>
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 pl-2">{group}</h3>
                        <div className="space-y-2">
                            {(groupedCategories[group] || []).map(cat => {
                                const theme = getCategoryTheme(cat);
                                const Icon = theme.icon;
                                return (
                                    <button 
                                      key={cat} 
                                      onClick={() => scrollToCategory(cat)} 
                                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden border border-transparent hover:border-white/10 text-left`}
                                      style={{
                                          '--neon-color': theme.hex
                                      } as React.CSSProperties}
                                    >
                                        {/* Neon Glow Background on Hover */}
                                        <div className="absolute inset-0 bg-[var(--neon-color)] opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                                        
                                        {/* Pop-up Art Icon */}
                                        <div className="absolute -right-4 -bottom-4 opacity-0 group-hover:opacity-20 transition-all duration-500 transform rotate-12 group-hover:scale-150 group-hover:rotate-0 pointer-events-none">
                                           <Icon className="w-16 h-16 text-[var(--neon-color)]" strokeWidth={1.5} />
                                        </div>

                                        {/* Icon Container */}
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center relative z-10 group-hover:shadow-[0_0_15px_var(--neon-color)] transition-shadow duration-300 border border-white/5 group-hover:border-[var(--neon-color)]">
                                             <Icon className={`w-5 h-5 text-[var(--neon-color)] transition-transform duration-300 group-hover:scale-110`} />
                                        </div>
                                        
                                        {/* Text */}
                                        <span className="text-xs font-bold uppercase tracking-wide text-gray-300 group-hover:text-[var(--neon-color)] group-hover:drop-shadow-[0_0_5px_var(--neon-color)] transition-all duration-300 relative z-10">
                                            {cat}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    ) : null
                ))}
            </div>
            <div className="p-4 bg-black/80 backdrop-blur-md border-t border-white/10 space-y-3">
                 <div className="relative w-full"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" /><input type="text" placeholder="Search items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#00E5FF]/50 transition-all placeholder-gray-600" /></div>
                 <div className="flex items-center justify-between gap-2">
                    <button onClick={() => setShowVegOnly(!showVegOnly)} className={`flex-1 flex items-center justify-center gap-2 px-2 py-2 rounded-lg border transition-all text-[10px] font-bold uppercase tracking-wider ${showVegOnly ? 'bg-green-500/20 border-[#00FF00] text-[#00FF00]' : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10'}`}><Leaf className="w-3 h-3" /> {showVegOnly ? 'Veg' : 'All'}</button>
                    <button onClick={() => setSortBy(prev => prev === 'price' ? 'time' : 'price')} className="flex-1 flex items-center justify-center gap-2 px-2 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-[10px] font-bold text-gray-400 uppercase tracking-wider">{sortBy === 'price' ? <DollarSign className="w-3 h-3" /> : <Clock className="w-3 h-3" />}{sortBy === 'price' ? 'Price' : 'Time'}</button>
                 </div>
                 <div className="flex gap-2 pt-2 border-t border-white/5">
                     <button onClick={() => onNavigate('kitchen')} className="flex-1 py-2 text-xs text-gray-600 hover:text-white transition-colors flex justify-center flex-col items-center gap-1"><ChefHat className="w-4 h-4" /><span>Kitchen</span></button>
                     <button onClick={() => onNavigate('admin')} className="flex-1 py-2 text-xs text-gray-600 hover:text-white transition-colors flex justify-center flex-col items-center gap-1"><User className="w-4 h-4" /><span>Admin</span></button>
                 </div>
            </div>
        </div>

        <div className="flex-1 flex flex-col h-full relative z-10 w-full">
            {/* Responsive Header (Mobile & Desktop) */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-30 shadow-sm">
                 <div className="flex items-center gap-3">
                     <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-white"><MenuIcon className="w-6 h-6" /></button>
                     <span className="md:hidden text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00E5FF] to-[#FF00FF]">Skylark</span>
                 </div>

                 <div className="flex items-center gap-3">
                     {/* Location */}
                     <a 
                        href="https://maps.app.goo.gl/NUpz4bEUTTagFVUn9" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-[#00E5FF]/20 text-gray-300 hover:text-[#00E5FF] transition-all duration-300 border border-transparent hover:border-[#00E5FF]/30"
                        title="Location"
                     >
                        <MapPin className="w-5 h-5" />
                     </a>
                     
                     {/* Chef */}
                     <button 
                        onClick={() => onNavigate('kitchen')} 
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-orange-500/20 text-gray-300 hover:text-orange-500 transition-all duration-300 border border-transparent hover:border-orange-500/30"
                        title="Chef Login"
                     >
                        <ChefHat className="w-5 h-5" />
                     </button>
                     
                     {/* Admin */}
                     <button 
                        onClick={() => onNavigate('admin')} 
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-purple-500/20 text-gray-300 hover:text-purple-500 transition-all duration-300 border border-transparent hover:border-purple-500/30"
                        title="Admin Login"
                     >
                        <User className="w-5 h-5" />
                     </button>
                 </div>
            </div>

            {/* Sticky Navigation for Stay/Menu */}
            <div className="sticky top-0 md:top-0 z-20 flex bg-black/80 backdrop-blur-md border-b border-white/10">
                <button onClick={scrollToStay} className="flex-1 py-3 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white/5 transition-colors text-[#00E5FF]">
                    <Home className="w-4 h-4" /> Stay
                </button>
                <div className="w-[1px] bg-white/10"></div>
                <button onClick={scrollToFood} className="flex-1 py-3 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white/5 transition-colors text-[#FF00FF]">
                    <Utensils className="w-4 h-4" /> Café Menu
                </button>
            </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-6 scrollbar-hide scroll-smooth">
             <div className="pb-32 space-y-10 max-w-7xl mx-auto">
               {menuBySection.map(([category, items]) => {
                  const theme = getCategoryTheme(category);
                  const SectionIcon = theme.icon;
                  return (
                    <div key={category} ref={(el) => { categoryRefs.current[category] = el; }} className="scroll-mt-24">
                       <div className="flex items-center gap-3 mb-5 pl-2 border-l-4" style={{ borderColor: theme.neon.includes('#') ? theme.neon.match(/#\w+/)?.[0] : 'purple' }}>
                          <SectionIcon className={`w-5 h-5 ${theme.text}`} />
                          <h2 className={`text-lg sm:text-xl font-black tracking-wide uppercase ${theme.text}`}>{category}</h2>
                          <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
                       </div>
                       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                          {items.map((item) => {
                             const itemTheme = getCategoryTheme(item.category); 
                             const NeonIcon = itemTheme.icon;
                             return (
                             <div key={item.id} className={`group relative p-4 rounded-xl border overflow-hidden transition-transform duration-150 hover:scale-[1.02] hover:shadow-lg h-40 sm:h-44 flex flex-col justify-between bg-transparent ${item.available ? `border-${itemTheme.border.split('-')[1]}-500/30 hover:${itemTheme.border}` : 'border-white/10 opacity-50 grayscale cursor-not-allowed'}`} onClick={() => item.available && handleAddToCart(item)}>
                               <div className="absolute -right-4 -bottom-4 opacity-[0.08] group-hover:opacity-20 transition-opacity duration-200 transform rotate-[-10deg] group-hover:rotate-0 group-hover:scale-110 pointer-events-none"><NeonIcon strokeWidth={1} className={`w-28 h-28 sm:w-32 sm:h-32 ${itemTheme.neon} drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]`} /></div>
                               <div className="relative z-10 flex flex-col h-full">
                                  <div className="flex justify-between items-start w-full mb-1">
                                    <div className={`w-2.5 h-2.5 rounded-full border border-white/10 flex-shrink-0 ${item.available ? (item.isVeg ? 'bg-[#00FF00] shadow-[0_0_8px_#00FF00]' : 'bg-[#FF1744] shadow-[0_0_8px_#FF1744]') : 'bg-gray-500'}`} />
                                    <button onClick={(e) => { e.stopPropagation(); handleAddToCart(item); }} disabled={!item.available} className={`px-2.5 py-1 rounded-md text-[10px] font-bold text-white shadow-lg border transform transition-all duration-100 ease-out flex items-center gap-1 z-20 ${item.available ? (item.isVeg ? 'bg-green-600/80 hover:bg-green-500 border-green-500/30 hover:scale-105 active:scale-95' : 'bg-red-600/80 hover:bg-red-500 border-red-500/30 hover:scale-105 active:scale-95') : 'bg-gray-700 border-gray-600 cursor-not-allowed opacity-80'}`}>{item.available ? 'ADD' : 'SOLD OUT'}</button>
                                  </div>
                                  <div className="mt-auto">
                                    <h3 className={`text-sm font-bold leading-snug line-clamp-2 mb-1 drop-shadow-md ${item.available ? 'text-gray-100' : 'text-gray-500 line-through'}`}>{item.name}</h3>
                                    <p className="text-[10px] text-gray-400 leading-tight line-clamp-2 mb-2 opacity-80 font-medium">{item.description}</p>
                                    <div className="flex items-center justify-between"><span className="text-[10px] text-gray-400 uppercase font-medium truncate max-w-[60%]">{item.category}</span><span className={`text-sm font-bold ${item.available ? 'text-white' : 'text-gray-500'}`}>₹{item.price}</span></div>
                                  </div>
                               </div>
                             </div>
                          )})}
                       </div>
                    </div>
                  );
               })}
               {menuBySection.length === 0 && <div className="text-center py-20 text-gray-500"><p>No items found.</p></div>}
             </div>
          </div>

          {cart.length > 0 && (
             <div className="flex-shrink-0 bg-gray-900/95 backdrop-blur-xl border-t border-white/10 p-4 animate-slide-in absolute bottom-0 w-full z-40 shadow-2xl">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                   <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide flex-1">
                      <div className="flex flex-col shrink-0">
                          <span className="text-[10px] text-gray-400 uppercase font-bold">Total</span>
                          <span className="text-lg font-bold text-white">₹{cart.reduce((sum, i) => sum + (i.price * i.quantity), 0)}</span>
                      </div>
                      <div className="h-8 w-[1px] bg-white/10 hidden sm:block"></div>
                      <div className="flex gap-2 items-center">
                          {cart.map(item => (
                            <div key={item.id} className="flex items-center gap-2 bg-white/5 rounded-full px-2 py-1 border border-white/5 shrink-0">
                               <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-[#00FF00]' : 'bg-[#FF1744]'}`} />
                               <span className="text-xs text-gray-200 truncate max-w-[80px]">{item.name}</span>
                               <div className="flex items-center gap-1 bg-black/30 rounded px-1">
                                   <button onClick={() => updateCartQty(item.id, -1)} className="text-gray-400 hover:text-white"><Minus className="w-3 h-3"/></button>
                                   <span className="text-xs font-bold text-[#00E5FF]">{item.quantity}</span>
                                   <button onClick={() => updateCartQty(item.id, 1)} className="text-gray-400 hover:text-white"><Plus className="w-3 h-3"/></button>
                               </div>
                            </div>
                          ))}
                          <button onClick={clearCart} className="text-xs text-red-400 hover:text-red-300 underline ml-2">Clear</button>
                      </div>
                   </div>
                   <button onClick={() => { const name = prompt("Enter Customer Name:"); if (name) placeOrder(name); }} className="bg-white text-black hover:bg-gray-200 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap">Place Order <ArrowLeft className="w-4 h-4 rotate-180" /></button>
                </div>
             </div>
          )}
        </div>
      </div>
    );
});

// --- Kitchen View (Optimized) ---

const KitchenView = React.memo(({
    orders,
    setOrders,
    setView,
    ingredients,
    toggleIngredient,
    addIngredient,
    deleteIngredient,
    menu,
    toggleAvailability
}: any) => {
    const [showStockModal, setShowStockModal] = useState(false);
    const [showInventoryModal, setShowInventoryModal] = useState(false);
    const activeOrders = orders.filter((o: Order) => o.status !== 'completed' && o.status !== 'cancelled').sort((a: Order, b: Order) => b.timestamp - a.timestamp);
    const updateStatus = (orderId: string, status: Order['status']) => {
      setOrders((prev: Order[]) => prev.map(o => o.id === orderId ? { ...o, status } : o));
    };

    return (
      <div className="min-h-screen bg-slate-900 text-white p-6">
        <StockControlModal isOpen={showStockModal} onClose={() => setShowStockModal(false)} menu={menu} toggleAvailability={toggleAvailability} />
        <IngredientInventoryModal isOpen={showInventoryModal} onClose={() => setShowInventoryModal(false)} ingredients={ingredients} toggleIngredient={toggleIngredient} addIngredient={addIngredient} deleteIngredient={deleteIngredient} />
        
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
           <div className="flex items-center gap-4 w-full md:w-auto"><button onClick={() => setView('customer')} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><ArrowLeft className="w-6 h-6" /></button><h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2"><ChefHat className="w-6 h-6 md:w-8 md:h-8 text-orange-500" /> Kitchen Display</h1></div>
           <div className="flex flex-col gap-3 w-full md:w-auto">
                <div className="grid grid-cols-2 gap-3 w-full">
                    <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 text-center"><span className="text-gray-400 text-xs uppercase font-bold">Pending</span><div className="text-2xl font-bold text-[#FFFF00]">{orders.filter((o: Order) => o.status === 'pending').length}</div></div>
                    <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 text-center"><span className="text-gray-400 text-xs uppercase font-bold">Preparing</span><div className="text-2xl font-bold text-[#00E5FF]">{orders.filter((o: Order) => o.status === 'preparing').length}</div></div>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full">
                     <button onClick={() => setShowInventoryModal(true)} className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"><Refrigerator className="w-4 h-4" /> Ingredients</button>
                     <button onClick={() => setShowStockModal(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"><Box className="w-4 h-4" /> Menu Stock</button>
                </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activeOrders.map((order: Order) => (
            <div key={order.id} className={`bg-slate-800 rounded-xl border-l-4 shadow-xl overflow-hidden ${order.status === 'pending' ? 'border-yellow-500' : order.status === 'preparing' ? 'border-blue-500' : 'border-green-500'}`}>
              <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-start">
                <div><h3 className="text-xl font-bold text-white">#{order.id.toUpperCase()}</h3><p className="text-gray-400 text-sm">{order.customerName}</p></div>
                <div className="text-right"><div className="text-sm font-mono text-gray-400">{new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div><div className="text-xs text-gray-500 mt-1">{Math.floor((Date.now() - order.timestamp) / 60000)}m ago</div></div>
              </div>
              <div className="p-4 max-h-[300px] overflow-y-auto">
                {order.items.map((item, idx) => {
                    const liveItem = menu.find((m: MenuItem) => m.id === item.id);
                    const missing = liveItem?.missingIngredients;

                    return (
                        <div key={idx} className={`mb-3 pb-2 border-b border-slate-700/50 last:border-0 ${missing?.length ? 'bg-red-900/20 p-2 rounded-lg -mx-2 border border-red-500/30' : ''}`}>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-[#00FF00]' : 'bg-[#FF1744]'}`} />
                                    <div>
                                        <span className={`font-medium ${missing?.length ? 'text-red-200' : 'text-gray-200'}`}>{item.name}</span>
                                        <div className="text-xs text-gray-500">{item.category}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3"><span className="text-sm font-bold bg-slate-700 px-2 py-0.5 rounded text-white">x{item.quantity}</span></div>
                            </div>
                            {missing && missing.length > 0 && (
                                <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-red-400 uppercase tracking-wide">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>Missing: {missing.join(', ')}</span>
                                </div>
                            )}
                        </div>
                    );
                })}
              </div>
              <div className="p-4 bg-slate-700/30 border-t border-slate-700 flex gap-2">
                {order.status === 'pending' && <button onClick={() => updateStatus(order.id, 'preparing')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"><Flame className="w-4 h-4" /> Start Cooking</button>}
                {order.status === 'preparing' && <button onClick={() => updateStatus(order.id, 'ready')} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"><CheckCircleIcon className="w-4 h-4" /> Mark Ready</button>}
                {order.status === 'ready' && <button onClick={() => updateStatus(order.id, 'completed')} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-medium transition-colors">Complete</button>}
              </div>
            </div>
          ))}
          {activeOrders.length === 0 && <div className="col-span-full flex flex-col items-center justify-center h-64 text-gray-500"><ChefHat className="w-16 h-16 mb-4 opacity-20" /><p>No active orders</p></div>}
        </div>
      </div>
    );
});

const AdminView = React.memo(({
    orders,
    setOrders,
    setView,
    menu,
    setMenu,
    toggleAvailability,
    ingredients,
    toggleIngredient,
    addIngredient,
    deleteIngredient,
    addMenuItem,
    deleteMenuItem,
    inventory,
    setInventory,
    purchaseLogs,
    setPurchaseLogs,
    usageLogs,
    setUsageLogs,
    events,
    setEvents
}: any) => {
    const [showStockModal, setShowStockModal] = useState(false);
    const [showInventoryModal, setShowInventoryModal] = useState(false);
    const [showMenuEditor, setShowMenuEditor] = useState(false);
    const [showFullInventory, setShowFullInventory] = useState(false);
    const [showPlanner, setShowPlanner] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const completedOrders = orders.filter((o: Order) => o.status === 'completed' || o.status === 'cancelled');
    const totalRevenue = completedOrders.reduce((sum: number, o: Order) => sum + o.totalAmount, 0);

    // Calculate Daily Stats
    const today = new Date().toLocaleDateString();
    const todayOrdersList = orders.filter((o: Order) => new Date(o.timestamp).toLocaleDateString() === today);
    const todayRevenue = todayOrdersList.reduce((sum: number, o: Order) => sum + o.totalAmount, 0);
    const todayAvgOrderValue = todayOrdersList.length ? Math.round(todayRevenue / todayOrdersList.length) : 0;

    // Calculate Popular Items
    const popularItems = useMemo(() => {
        const itemCounts: { [key: string]: number } = {};
        orders.forEach((order: Order) => {
            order.items.forEach(item => {
                itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
            });
        });
        return Object.entries(itemCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5); // Top 5
    }, [orders]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const csvText = event.target?.result as string;
            if (csvText) {
                const newMenu = parseCSV(csvText, menu);
                if (newMenu) { setMenu(newMenu); alert(`Successfully updated ${newMenu.length} items.`); }
            }
        };
        reader.readAsText(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const deleteOrder = (id: string) => {
        if(confirm('Are you sure you want to delete this order?')) {
            setOrders((prev: Order[]) => prev.filter(o => o.id !== id));
        }
    }

    const filteredOrders = orders.filter((order: Order) => 
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a: Order, b: Order) => b.timestamp - a.timestamp);

    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
         <StockControlModal isOpen={showStockModal} onClose={() => setShowStockModal(false)} menu={menu} toggleAvailability={toggleAvailability} />
         <IngredientInventoryModal isOpen={showInventoryModal} onClose={() => setShowInventoryModal(false)} ingredients={ingredients} toggleIngredient={toggleIngredient} addIngredient={addIngredient} deleteIngredient={deleteIngredient} />
         <MenuEditorModal isOpen={showMenuEditor} onClose={() => setShowMenuEditor(false)} menu={menu} onSave={addMenuItem} onDelete={deleteMenuItem} />
         <InventoryManager isOpen={showFullInventory} onClose={() => setShowFullInventory(false)} inventory={inventory} setInventory={setInventory} purchaseLogs={purchaseLogs} setPurchaseLogs={setPurchaseLogs} usageLogs={usageLogs} setUsageLogs={setUsageLogs} />
         <CalendarPlanner isOpen={showPlanner} onClose={() => setShowPlanner(false)} events={events} setEvents={setEvents} />
         
         <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".csv,.xlsx" />

         <div className="bg-white border-b px-4 py-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-20 shadow-sm gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto"><button onClick={() => setView('customer')} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"><ArrowLeft className="w-6 h-6" /></button><h1 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2"><TrendingUp className="w-6 h-6 text-blue-600" /> Manager Dashboard</h1></div>
            <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
               <button onClick={() => setShowMenuEditor(true)} className="flex items-center gap-2 px-4 py-2 border border-orange-200 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 text-sm font-medium whitespace-nowrap"><Edit className="w-4 h-4" /> Edit Menu</button>
               <button onClick={() => setShowInventoryModal(true)} className="flex items-center gap-2 px-4 py-2 border border-cyan-200 bg-cyan-50 text-cyan-700 rounded-lg hover:bg-cyan-100 text-sm font-medium whitespace-nowrap"><Refrigerator className="w-4 h-4" /> Food Stock</button>
               <button onClick={() => setShowStockModal(true)} className="flex items-center gap-2 px-4 py-2 border border-purple-200 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 text-sm font-medium whitespace-nowrap"><Box className="w-4 h-4" /> Menu Stock</button>
               <button onClick={() => setShowFullInventory(true)} className="flex items-center gap-2 px-4 py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium whitespace-nowrap"><Package className="w-4 h-4" /> Inventory</button>
               <button onClick={() => setShowPlanner(true)} className="flex items-center gap-2 px-4 py-2 border border-pink-200 bg-pink-50 text-pink-700 rounded-lg hover:bg-pink-100 text-sm font-medium whitespace-nowrap"><Calendar className="w-4 h-4" /> Calendar Planner</button>
               <button onClick={() => generateCSV(menu)} className="flex items-center gap-2 px-4 py-2 border border-green-200 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-sm font-medium whitespace-nowrap"><Download className="w-4 h-4" /> Export</button>
               <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium whitespace-nowrap"><Upload className="w-4 h-4" /> Import</button>
               <button onClick={() => setView('printable')} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium shadow-sm whitespace-nowrap"><Printer className="w-4 h-4" /> Print</button>
            </div>
         </div>

         <div className="max-w-7xl mx-auto p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"><div className="text-gray-500 text-sm font-medium">Total Revenue</div><div className="text-3xl font-bold text-gray-900 mt-1">₹{totalRevenue.toLocaleString()}</div></div>
               <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"><div className="text-gray-500 text-sm font-medium">Total Orders</div><div className="text-3xl font-bold text-blue-600 mt-1">{orders.length}</div></div>
               <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"><div className="text-gray-500 text-sm font-medium">Avg Order Value</div><div className="text-3xl font-bold text-green-600 mt-1">₹{orders.length ? Math.round(totalRevenue / orders.length) : 0}</div></div>
               <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"><div className="text-gray-500 text-sm font-medium">Pending Orders</div><div className="text-3xl font-bold text-yellow-600 mt-1">{orders.filter((o: Order) => o.status === 'pending').length}</div></div>
            </div>

            {/* Dashboard Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><CalendarDays className="w-5 h-5 text-purple-600" /> Daily Snapshot ({new Date().toLocaleDateString()})</h2>
                  <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-100 text-center">
                          <div className="text-xs text-purple-600 font-bold uppercase mb-1">Revenue Today</div>
                          <div className="text-2xl font-bold text-gray-800">₹{todayRevenue.toLocaleString()}</div>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-center">
                          <div className="text-xs text-blue-600 font-bold uppercase mb-1">Orders Today</div>
                          <div className="text-2xl font-bold text-gray-800">{todayOrdersList.length}</div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg border border-green-100 text-center">
                          <div className="text-xs text-green-600 font-bold uppercase mb-1">Avg Value</div>
                          <div className="text-2xl font-bold text-gray-800">₹{todayAvgOrderValue}</div>
                      </div>
                  </div>
               </div>
               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-orange-500" /> Most Popular Items</h2>
                  <div className="space-y-3">
                      {popularItems.map(([name, count], index) => (
                          <div key={name} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                              <div className="flex items-center gap-3">
                                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' : index === 1 ? 'bg-gray-200 text-gray-600' : index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>{index + 1}</span>
                                  <span className="font-medium text-gray-700">{name}</span>
                              </div>
                              <span className="text-sm font-bold text-gray-900">{count} sold</span>
                          </div>
                      ))}
                      {popularItems.length === 0 && <div className="text-center text-gray-400 text-sm py-4">No sales data yet</div>}
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <h2 className="font-bold text-lg">Recent Transactions</h2>
                  <div className="relative w-full sm:w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Search Order ID or Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"/></div>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                     <thead className="bg-gray-50 text-gray-500 font-medium">
                        <tr><th className="px-6 py-3">Order ID</th><th className="px-6 py-3">Customer</th><th className="px-6 py-3">Items</th><th className="px-6 py-3">Amount</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Time</th><th className="px-6 py-3">Action</th></tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map((order: Order) => (
                               <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-6 py-3 font-mono text-gray-600">#{order.id}</td>
                                  <td className="px-6 py-3 font-medium text-gray-900">{order.customerName}</td>
                                  <td className="px-6 py-3 text-gray-600 max-w-xs truncate">{order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</td>
                                  <td className="px-6 py-3 font-bold text-gray-900">₹{order.totalAmount}</td>
                                  <td className="px-6 py-3"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === 'completed' ? 'bg-green-100 text-green-800' : order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></td>
                                  <td className="px-6 py-3 text-gray-500">{new Date(order.timestamp).toLocaleString()}</td>
                                  <td className="px-6 py-3"><button onClick={() => deleteOrder(order.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button></td>
                               </tr>
                            ))
                        ) : (<tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No transactions found.</td></tr>)}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>
      </div>
    );
});

const PrintableMenu = React.memo(({ menu, setView }: { menu: MenuItem[], setView: any }) => {
    const categories = Array.from(new Set(menu.map(item => item.category)));
    const grouped = categories.reduce((acc, cat) => {
        acc[cat] = menu.filter(i => i.category === cat && i.available);
        return acc;
    }, {} as Record<string, MenuItem[]>);

    return (
        <div className="bg-white min-h-screen p-8 text-black font-sans">
            <div className="fixed top-4 right-4 flex gap-4 print:hidden">
                <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow-lg font-bold flex items-center gap-2"><Printer className="w-4 h-4"/> Print</button>
                <button onClick={() => setView('admin')} className="bg-gray-800 text-white px-6 py-2 rounded-lg shadow-lg font-bold">Back</button>
            </div>
            
            <div className="max-w-4xl mx-auto border-4 border-black p-8 min-h-[29.7cm]">
                <div className="text-center mb-12 border-b-4 border-black pb-6">
                    <h1 className="text-6xl font-black uppercase tracking-tighter mb-2">Skylark Café</h1>
                    <p className="text-xl font-serif italic text-gray-600">Fine Dining & Luxury Stay</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    {Object.entries(grouped).map(([cat, items]) => (
                        items.length > 0 && (
                            <div key={cat} className="break-inside-avoid mb-6">
                                <h3 className="text-2xl font-black uppercase border-b-2 border-black mb-4 flex justify-between items-end">
                                    {cat}
                                </h3>
                                <div className="space-y-3">
                                    {items.map(item => (
                                        <div key={item.id} className="flex justify-between items-baseline group">
                                            <div className="flex-1 pr-4">
                                                <div className="font-bold text-lg leading-none">{item.name} {item.isVeg ? <span className="text-green-600 text-xs ml-1">●</span> : <span className="text-red-600 text-xs ml-1">●</span>}</div>
                                                <div className="text-xs text-gray-500 leading-tight mt-0.5 italic">{item.description}</div>
                                            </div>
                                            <div className="font-black text-xl">₹{item.price}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    ))}
                </div>
                
                <div className="mt-12 pt-6 border-t-4 border-black text-center text-sm font-bold uppercase tracking-widest text-gray-400">
                    Thank you for dining with us
                </div>
            </div>
        </div>
    );
});

const App = () => {
    const [view, setView] = useState<'customer' | 'kitchen' | 'admin' | 'login' | 'printable' | 'confirmation'>('customer');
    const [loginTarget, setLoginTarget] = useState<'kitchen' | 'admin' | null>(null);
    const [menu, setMenu] = useState<MenuItem[]>(INITIAL_MENU);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [ingredients, setIngredients] = useState<Ingredient[]>(INITIAL_INGREDIENTS);
    
    // New Data States
    const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
    const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
    const [purchaseLogs, setPurchaseLogs] = useState<PurchaseLog[]>([]);
    const [usageLogs, setUsageLogs] = useState<UsageLog[]>([]);
    const [lastOrder, setLastOrder] = useState<Order | null>(null);

    const addToCart = useCallback((item: MenuItem) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    }, []);

    const updateCartQty = useCallback((id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, quantity: Math.max(0, item.quantity + delta) };
            }
            return item;
        }).filter(item => item.quantity > 0));
    }, []);

    const clearCart = useCallback(() => setCart([]), []);

    const placeOrder = useCallback((customerName: string) => {
        if (cart.length === 0) return;
        const newOrder: Order = {
            id: Math.random().toString(36).substr(2, 5).toUpperCase(),
            customerName,
            items: [...cart],
            status: 'pending',
            totalAmount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            timestamp: Date.now(),
            estimatedTime: calculatePrepTime(cart)
        };
        setOrders(prev => [...prev, newOrder]);
        setCart([]);
        setLastOrder(newOrder);
        setView('confirmation');
    }, [cart]);

    const toggleIngredient = useCallback((id: string) => {
        setIngredients(prev => prev.map(i => i.id === id ? { ...i, inStock: !i.inStock } : i));
    }, []);

    const addIngredient = useCallback((name: string, category: IngredientCategory) => {
        const newIng: Ingredient = { id: generateMenuId(), name, category, inStock: true };
        setIngredients(prev => [...prev, newIng]);
    }, []);

    const deleteIngredient = useCallback((id: string) => {
        setIngredients(prev => prev.filter(i => i.id !== id));
    }, []);
    
    const toggleAvailability = useCallback((id: string) => {
        setMenu(prev => prev.map(i => i.id === id ? { ...i, available: !i.available } : i));
    }, []);

    const addMenuItem = useCallback((item: MenuItem) => {
        setMenu(prev => {
            const existingIdx = prev.findIndex(i => i.id === item.id);
            if (existingIdx >= 0) {
                const updated = [...prev];
                updated[existingIdx] = item;
                return updated;
            }
            return [...prev, item];
        });
    }, []);

    const deleteMenuItem = useCallback((id: string) => {
        setMenu(prev => prev.filter(i => i.id !== id));
    }, []);

    return (
        <>
            {view === 'customer' && (
                <CustomerView 
                    menu={menu} 
                    cart={cart} 
                    addToCart={addToCart} 
                    updateCartQty={updateCartQty} 
                    clearCart={clearCart} 
                    placeOrder={placeOrder} 
                    onNavigate={(target) => { setLoginTarget(target); setView('login'); }} 
                />
            )}
            {view === 'confirmation' && lastOrder && (
                <OrderConfirmationView order={lastOrder} onBack={() => { setLastOrder(null); setView('customer'); }} />
            )}
            {view === 'login' && loginTarget && (
                <LoginView 
                    target={loginTarget} 
                    onLogin={() => { setView(loginTarget); setLoginTarget(null); }} 
                    onBack={() => setView('customer')} 
                />
            )}
            {view === 'kitchen' && (
                <KitchenView 
                    orders={orders} 
                    setOrders={setOrders} 
                    setView={setView} 
                    ingredients={ingredients}
                    toggleIngredient={toggleIngredient}
                    addIngredient={addIngredient}
                    deleteIngredient={deleteIngredient}
                    menu={menu}
                    toggleAvailability={toggleAvailability}
                />
            )}
            {view === 'admin' && (
                <AdminView 
                    orders={orders} 
                    setOrders={setOrders} 
                    setView={setView} 
                    menu={menu}
                    setMenu={setMenu}
                    toggleAvailability={toggleAvailability}
                    ingredients={ingredients}
                    toggleIngredient={toggleIngredient}
                    addIngredient={addIngredient}
                    deleteIngredient={deleteIngredient}
                    addMenuItem={addMenuItem}
                    deleteMenuItem={deleteMenuItem}
                    inventory={inventory}
                    setInventory={setInventory}
                    purchaseLogs={purchaseLogs}
                    setPurchaseLogs={setPurchaseLogs}
                    usageLogs={usageLogs}
                    setUsageLogs={setUsageLogs}
                    events={events}
                    setEvents={setEvents}
                />
            )}
            {view === 'printable' && (
                <PrintableMenu menu={menu} setView={setView} />
            )}
        </>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);