
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
  MapPin,
  Phone,
  Hash,
  Play,
  CheckCircle2,
  Bell,
  ArrowUp
} from 'lucide-react';

// --- Types ---

type Category = string;

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

type ServiceType = 'Dine-in' | 'Takeaway' | 'Delivery';

interface CustomerInfo {
    name: string;
    phone: string;
    serviceType: ServiceType;
    tableNumber?: string;
}

interface Order {
  id: string;
  customerName: string; // Kept for backward compatibility, synced with customerInfo.name
  customerInfo: CustomerInfo;
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
    // ... (Keep recipes as is)
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

// --- New Components: PlaceOrderModal ---
const PlaceOrderModal = React.memo(({ isOpen, onClose, onSubmit, totalAmount }: { isOpen: boolean, onClose: () => void, onSubmit: (info: CustomerInfo) => void, totalAmount: number }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [serviceType, setServiceType] = useState<ServiceType>('Dine-in');
    const [tableNumber, setTableNumber] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!name || !phone) {
            alert('Please fill in Name and Phone Number');
            return;
        }
        if (serviceType === 'Dine-in' && !tableNumber) {
            alert('Please enter Table Number');
            return;
        }
        onSubmit({
            name,
            phone,
            serviceType,
            tableNumber: serviceType === 'Dine-in' ? tableNumber : undefined
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10 bg-slate-900">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <ShoppingBag className="w-6 h-6 text-[#00E5FF]" /> Place Order
                    </h2>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-1">Full Name</label>
                        <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-800 border border-white/10 rounded-lg p-3 text-white focus:border-[#00E5FF] outline-none" placeholder="Enter customer name" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-1">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"/>
                            <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" className="w-full bg-slate-800 border border-white/10 rounded-lg p-3 pl-10 text-white focus:border-[#00E5FF] outline-none" placeholder="Enter phone number" />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-2">Service Type</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['Dine-in', 'Takeaway', 'Delivery'] as ServiceType[]).map(type => (
                                <button 
                                    key={type}
                                    onClick={() => setServiceType(type)}
                                    className={`py-2 rounded-lg text-sm font-bold transition-all ${serviceType === type ? 'bg-[#00E5FF] text-black shadow-lg shadow-[#00E5FF]/20' : 'bg-slate-800 text-gray-400 hover:bg-slate-700'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {serviceType === 'Dine-in' && (
                        <div className="animate-fade-in">
                            <label className="block text-sm font-bold text-gray-400 mb-1">Table Number</label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"/>
                                <input value={tableNumber} onChange={e => setTableNumber(e.target.value)} className="w-full bg-slate-800 border border-white/10 rounded-lg p-3 pl-10 text-white focus:border-[#00E5FF] outline-none" placeholder="Enter table number" />
                            </div>
                        </div>
                    )}

                    <div className="pt-4 border-t border-white/10 mt-2">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-400">Total Amount</span>
                            <span className="text-xl font-bold text-white">₹{totalAmount}</span>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-gray-400 hover:bg-white/5 transition-colors">Cancel</button>
                            <button onClick={handleSubmit} className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-[#00E5FF] to-[#0099ff] text-black shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all active:scale-95">Confirm Order</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

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
                                        <button key={area} onClick={() => setFilterArea(area as any)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterArea === area ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
                                            {area}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-2 w-full md:w-auto">
                                     <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImport} className="hidden" id="csvImportInventory" />
                                     <label htmlFor="csvImportInventory" className="px-4 py-2 bg-green-600 text-white rounded-lg cursor-pointer font-medium text-sm flex items-center gap-2 hover:bg-green-700 transition-colors"><Upload className="w-4 h-4"/> Import CSV</label>
                                     <button onClick={exportInventoryCSV} className="px-4 py-2 bg-white border text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm flex items-center gap-2"><Download className="w-4 h-4"/> Export CSV</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white p-4 rounded-xl border shadow-sm">
                                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">{isEditing ? 'Edit Item' : 'Add New Item'} <Plus className="w-4 h-4"/></h3>
                                    <div className="space-y-3">
                                        <input value={newItem.name || ''} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full p-2 border rounded-lg text-sm" placeholder="Item Name" />
                                        <div className="grid grid-cols-2 gap-2">
                                            <input type="number" value={newItem.quantity || ''} onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})} className="w-full p-2 border rounded-lg text-sm" placeholder="Qty" />
                                            <input value={newItem.unit || ''} onChange={e => setNewItem({...newItem, unit: e.target.value})} className="w-full p-2 border rounded-lg text-sm" placeholder="Unit" />
                                        </div>
                                        <select value={newItem.area || 'Kitchen'} onChange={e => setNewItem({...newItem, area: e.target.value as any})} className="w-full p-2 border rounded-lg text-sm">
                                            <option value="Kitchen">Kitchen</option>
                                            <option value="Rooms">Rooms</option>
                                            <option value="Open Area">Open Area</option>
                                        </select>
                                        <button onClick={handleSaveItem} className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors">{isEditing ? 'Update Item' : 'Add Item'}</button>
                                        {isEditing && <button onClick={() => {setIsEditing(false); setNewItem({ area: 'Kitchen', unit: 'pcs', status: 'Good', minStock: 5 })}} className="w-full py-2 text-gray-500 text-sm">Cancel</button>}
                                    </div>
                                </div>
                                <div className="md:col-span-2 bg-white rounded-xl border shadow-sm overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                                            <tr>
                                                <th className="p-3">Item</th>
                                                <th className="p-3">Qty</th>
                                                <th className="p-3">Area</th>
                                                <th className="p-3">Status</th>
                                                <th className="p-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {filteredInventory.map((item: InventoryItem) => (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    <td className="p-3 font-medium">{item.name}</td>
                                                    <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${item.quantity <= item.minStock ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{item.quantity} {item.unit}</span></td>
                                                    <td className="p-3 text-gray-500">{item.area}</td>
                                                    <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${item.status === 'Good' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{item.status}</span></td>
                                                    <td className="p-3 text-right">
                                                        <button onClick={() => {setNewItem(item); setIsEditing(true)}} className="p-1 hover:bg-gray-200 rounded mr-1"><Edit className="w-4 h-4 text-blue-600"/></button>
                                                        <button className="p-1 hover:bg-gray-200 rounded"><Trash2 className="w-4 h-4 text-red-600"/></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'purchases' && (
                        <div className="text-center py-20 text-gray-400">
                            <ClipboardList className="w-16 h-16 mx-auto mb-4 opacity-20"/>
                            <h3 className="text-xl font-bold text-gray-500">Purchase Log System</h3>
                            <p>Coming soon...</p>
                        </div>
                    )}
                    {activeTab === 'usage' && (
                         <div className="text-center py-20 text-gray-400">
                            <Activity className="w-16 h-16 mx-auto mb-4 opacity-20"/>
                            <h3 className="text-xl font-bold text-gray-500">Usage Tracking System</h3>
                             <p>Coming soon...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

const CalendarPlanner = React.memo(({ isOpen, onClose, events, setEvents }: any) => {
     // Basic implementation placeholder
     if (!isOpen) return null;
     return (
        <div className="fixed inset-0 z-[90] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl h-[90vh] flex flex-col overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><CalendarDays className="w-6 h-6 text-purple-600"/> Calendar Planner</h2>
                    <button onClick={onClose}><X className="w-6 h-6 text-gray-500 hover:text-gray-800"/></button>
                </div>
                <div className="flex-1 flex items-center justify-center text-gray-400 flex-col">
                    <Calendar className="w-24 h-24 mb-6 opacity-20"/>
                    <h3 className="text-2xl font-bold text-gray-600">Planner Module</h3>
                    <p className="text-gray-400 mt-2">Full calendar and task management system coming soon.</p>
                </div>
            </div>
        </div>
     )
});

// --- Components ---

const CustomerView = React.memo(({ 
    menu, 
    cart, 
    addToCart, 
    removeFromCart, 
    isPlaceOrderModalOpen, 
    setPlaceOrderModalOpen, 
    activeCategory, 
    setActiveCategory, 
    activeOrder, 
    onNavigate, 
    toggleVegMode, 
    vegMode, 
    handlePlaceOrder 
}: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'time'>('time');
  const [showSidebar, setShowSidebar] = useState(false); // Mobile Drawer
  const [showScrollTop, setShowScrollTop] = useState(false); // For scroll button
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Scroll detection logic
  useEffect(() => {
      const handleScroll = () => {
          if (scrollRef.current) {
              setShowScrollTop(scrollRef.current.scrollTop > 300);
          }
      };
      const div = scrollRef.current;
      if (div) div.addEventListener('scroll', handleScroll);
      return () => { if(div) div.removeEventListener('scroll', handleScroll); }
  }, []);

  const scrollToTop = () => {
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categories = useMemo(() => {
    if (vegMode) {
        const vegCats = new Set(menu.filter((m: MenuItem) => m.isVeg).map((m: MenuItem) => m.category));
        return Array.from(vegCats) as string[];
    }
    return Array.from(new Set(menu.map((m: MenuItem) => m.category))) as string[];
  }, [menu, vegMode]);

  const groupedCategories = useMemo(() => {
      const groups: {[key: string]: string[]} = { 'Stay': [], 'Drinks': [], 'Fast Food': [], 'Main Course': [] };
      categories.forEach(cat => {
          const group = getCategoryGroup(cat);
          if (groups[group]) groups[group].push(cat);
          else groups['Main Course'].push(cat); // Fallback
      });
      return groups;
  }, [categories]);

  const getItemPriority = (item: MenuItem) => {
      const catLower = item.category.toLowerCase();
      if (catLower.includes('hot')) return 0; // Priority 0: Hot Drinks
      if (catLower.includes('beverage') || catLower.includes('drink') || catLower.includes('shake') || catLower.includes('lassi')) return 1;
      if (catLower.includes('maggi')) return 2;
      if (catLower.includes('sandwich')) return 3;
      if (catLower.includes('burger')) return 4;
      if (catLower.includes('omelette') || catLower.includes('egg')) return 5;
      if (catLower.includes('momos')) return 6;
      if (catLower.includes('chinese')) return 7;
      return 10; // Heavy items/Main course last
  };

  const sortedMenu = useMemo(() => {
    let filtered = menu.filter((item: MenuItem) => 
      (vegMode ? item.isVeg : true) &&
      (item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
       item.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (sortBy === 'time') {
        const timeWeight = { 'Quick': 1, 'Medium': 2, 'Slow': 3 };
        filtered.sort((a: MenuItem, b: MenuItem) => {
            const priorityA = getItemPriority(a);
            const priorityB = getItemPriority(b);
            if (priorityA !== priorityB) return priorityA - priorityB;
            
            if (timeWeight[a.prepTime] !== timeWeight[b.prepTime]) {
                return timeWeight[a.prepTime] - timeWeight[b.prepTime];
            }
            return a.price - b.price;
        });
    } else {
        filtered.sort((a: MenuItem, b: MenuItem) => a.price - b.price);
    }
    return filtered;
  }, [menu, searchQuery, vegMode, sortBy]);

  const totalAmount = cart.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);

  // Order Tracking View
  if (activeOrder && activeOrder.status !== 'completed' && activeOrder.status !== 'cancelled') {
      return (
          <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 animate-fade-in relative overflow-hidden">
               <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-700"></div>
              </div>

              <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10">
                  <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-[#00E5FF] to-[#0099ff] bg-clip-text text-transparent mb-2">Order Status</h2>
                      <p className="text-gray-400">Order #{activeOrder.id.slice(-4).toUpperCase()}</p>
                  </div>

                  <div className="space-y-8 relative">
                      {/* Progress Bar */}
                      <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-700">
                          <div className={`absolute top-0 left-0 w-full transition-all duration-1000 bg-[#00E5FF] shadow-[0_0_10px_#00E5FF] ${
                              activeOrder.status === 'pending' ? 'h-[10%]' :
                              activeOrder.status === 'preparing' ? 'h-[50%]' : 'h-[100%]'
                          }`}></div>
                      </div>

                      {/* Steps */}
                      <div className="relative pl-12">
                          <div className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                              activeOrder.status === 'pending' ? 'border-[#00E5FF] bg-[#00E5FF]/20 text-[#00E5FF] shadow-[0_0_15px_#00E5FF]' : 'border-[#00E5FF] bg-[#00E5FF] text-black'
                          }`}>
                              <CheckCircle2 className="w-5 h-5"/>
                          </div>
                          <h3 className={`text-lg font-bold ${activeOrder.status === 'pending' ? 'text-[#00E5FF]' : 'text-white'}`}>Order Sent</h3>
                          <p className="text-sm text-gray-400">Waiting for chef confirmation...</p>
                      </div>

                      <div className="relative pl-12">
                           <div className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                              activeOrder.status === 'preparing' ? 'border-yellow-400 bg-yellow-400/20 text-yellow-400 shadow-[0_0_15px_#FACC15] animate-pulse' : 
                              activeOrder.status === 'ready' || activeOrder.status === 'completed' ? 'border-yellow-400 bg-yellow-400 text-black' : 'border-gray-700 text-gray-700'
                          }`}>
                              <ChefHat className="w-5 h-5"/>
                          </div>
                          <h3 className={`text-lg font-bold ${activeOrder.status === 'preparing' ? 'text-yellow-400' : activeOrder.status === 'ready' ? 'text-white' : 'text-gray-600'}`}>Preparing</h3>
                          <p className="text-sm text-gray-400">Chef is working on your magic!</p>
                      </div>

                       <div className="relative pl-12">
                           <div className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                              activeOrder.status === 'ready' ? 'border-[#00FF00] bg-[#00FF00]/20 text-[#00FF00] shadow-[0_0_15px_#00FF00] animate-bounce' : 'border-gray-700 text-gray-700'
                          }`}>
                              <Bell className="w-5 h-5"/>
                          </div>
                          <h3 className={`text-lg font-bold ${activeOrder.status === 'ready' ? 'text-[#00FF00]' : 'text-gray-600'}`}>Order Ready!</h3>
                          <p className="text-sm text-gray-400">Please collect your delicious food.</p>
                      </div>
                  </div>

                  <div className="mt-10 pt-6 border-t border-white/10 text-center">
                       <p className="text-gray-400 mb-2">Estimated Time</p>
                       <div className="text-4xl font-bold text-white flex justify-center items-baseline gap-1">
                           {activeOrder.estimatedTime} <span className="text-base font-normal text-gray-500">mins</span>
                       </div>
                  </div>
                  
                  <button onClick={() => window.location.reload()} className="w-full mt-6 py-3 rounded-xl font-bold bg-white/5 hover:bg-white/10 text-white transition-all">
                      Place Another Order
                  </button>
              </div>
          </div>
      )
  }

  return (
    <div className="h-full flex flex-col bg-black overflow-hidden relative">
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 6px; } .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.4); }`}</style>
      {/* Header */}
      <header className="flex-none bg-black/80 backdrop-blur-md border-b border-white/10 p-4 sticky top-0 z-40">
         <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-3">
               <button onClick={() => setShowSidebar(true)} className="md:hidden p-2 text-white"><MenuIcon className="w-6 h-6" /></button>
               <div className="flex flex-col">
                  <h1 className="text-2xl font-black bg-gradient-to-r from-[#00E5FF] via-[#FF00FF] to-[#FFFF00] bg-clip-text text-transparent tracking-tighter neon-text">Skylark Café</h1>
                  <span className="text-[10px] text-gray-400 tracking-widest uppercase">Kasol | Himachal Pradesh</span>
               </div>
            </div>
            
            <div className="flex items-center gap-3">
                 <a href="https://maps.app.goo.gl/NUpz4bEUTTagFVUn9" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#00E5FF] border border-transparent hover:border-[#00E5FF]/50 transition-all hover:scale-110 hover:shadow-[0_0_10px_#00E5FF]"><MapPin className="w-5 h-5"/></a>
                 <button onClick={() => { const link=document.createElement('a');link.href='/skylark-cafe.apk';link.download='skylark-cafe.apk';link.click(); }} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#00FF00] border border-transparent hover:border-[#00FF00]/50 transition-all hover:scale-110 hover:shadow-[0_0_10px_#00FF00]"><Download className="w-5 h-5"/></button>
                 <button onClick={() => onNavigate('kitchen')} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#FF9100] border border-transparent hover:border-[#FF9100]/50 transition-all hover:scale-110 hover:shadow-[0_0_10px_#FF9100]"><ChefHat className="w-5 h-5"/></button>
                 <button onClick={() => onNavigate('admin')} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#FF00FF] border border-transparent hover:border-[#FF00FF]/50 transition-all hover:scale-110 hover:shadow-[0_0_10px_#FF00FF]"><Lock className="w-5 h-5"/></button>
            </div>
         </div>
         
         <div className="max-w-7xl mx-auto w-full mt-4 flex items-center justify-between gap-4">
             <div className="flex gap-2">
                 <button onClick={() => document.getElementById('cat-stay')?.scrollIntoView({behavior: 'smooth'})} className="px-4 py-1.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/50 text-[#00E5FF] text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_#00E5FF] hover:bg-[#00E5FF] hover:text-black transition-all">Stay</button>
                 <button onClick={() => document.getElementById('cat-menu')?.scrollIntoView({behavior: 'smooth'})} className="px-4 py-1.5 rounded-full bg-[#FF00FF]/10 border border-[#FF00FF]/50 text-[#FF00FF] text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_#FF00FF] hover:bg-[#FF00FF] hover:text-black transition-all">Café Menu</button>
             </div>
             
             <div className="flex items-center gap-3 bg-white/5 rounded-full p-1 pr-4 border border-white/10">
                <button onClick={toggleVegMode} className={`p-1.5 rounded-full transition-all duration-300 ${vegMode ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' : 'bg-gray-700'}`}>
                    <Leaf className={`w-4 h-4 ${vegMode ? 'text-black' : 'text-gray-400'}`} />
                </button>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Veg Only</span>
             </div>
         </div>
      </header>

      <div className="flex-1 flex min-h-0 relative">
         {/* Sidebar */}
         <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/95 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ease-out md:relative md:transform-none md:w-20 lg:w-64 ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
             <div className="h-full overflow-y-auto custom-scrollbar flex flex-col p-4">
                 <div className="md:hidden flex justify-between items-center mb-6">
                     <span className="text-xl font-bold text-white">Menu</span>
                     <button onClick={() => setShowSidebar(false)}><X className="w-6 h-6 text-gray-400"/></button>
                 </div>
                 
                 <div className="space-y-8">
                    {Object.entries(groupedCategories).map(([group, cats]) => (
                        <div key={group}>
                            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 pl-2">{group}</h3>
                            <div className="space-y-1">
                                {cats.map(cat => {
                                    const theme = getCategoryTheme(cat);
                                    const Icon = theme.icon;
                                    return (
                                        <button 
                                            key={cat}
                                            onClick={() => {
                                                document.getElementById(`cat-${cat}`)?.scrollIntoView({ behavior: 'smooth' });
                                                setShowSidebar(false);
                                            }}
                                            className="group w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-white/5 relative overflow-hidden"
                                        >
                                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300`} style={{backgroundColor: theme.hex}}></div>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg`} style={{backgroundColor: `${theme.hex}20`, color: theme.hex, boxShadow: `0 0 10px ${theme.hex}40`}}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <span className={`text-sm font-medium text-gray-400 transition-colors duration-200 group-hover:text-white md:hidden lg:block`}>{cat}</span>
                                            
                                            {/* Pop-up Art Icon */}
                                            <Icon 
                                                className="absolute -right-4 -bottom-4 w-16 h-16 opacity-0 group-hover:opacity-10 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12" 
                                                style={{color: theme.hex}}
                                                strokeWidth={1.5}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                 </div>
                 
                 <div className="mt-auto pt-6 border-t border-white/10">
                     <div className="relative">
                        <input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-800 border border-white/10 rounded-lg py-3 pl-10 text-white text-sm focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] outline-none transition-all" 
                            placeholder="Search menu..." 
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                     </div>
                     <div className="mt-4 flex items-center justify-between px-2">
                         <span className="text-xs text-gray-500">Sort by time</span>
                         <button onClick={() => setSortBy(prev => prev === 'price' ? 'time' : 'price')} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#00E5FF] transition-colors">
                            {sortBy === 'time' ? <Clock className="w-4 h-4" /> : <DollarSign className="w-4 h-4"/>}
                         </button>
                     </div>
                 </div>
             </div>
         </div>

         {/* Main Content - Fixed Scrolling Layout */}
         <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar min-w-0 relative scroll-smooth">
            <div className="max-w-5xl mx-auto p-4 sm:p-6 pb-32 space-y-8">
                {/* Scroll to Top Button */}
                {showScrollTop && (
                    <button 
                        onClick={scrollToTop} 
                        className="fixed bottom-24 right-6 z-[90] p-3 bg-[#00E5FF] text-black rounded-full shadow-[0_0_20px_#00E5FF] animate-fade-in hover:scale-110 transition-transform"
                    >
                        <ArrowUp className="w-6 h-6" />
                    </button>
                )}

                {/* Stay Section */}
                <div id="cat-stay" className="scroll-mt-6">
                    <div className="flex items-center gap-4 mb-6 sticky top-0 bg-black/95 backdrop-blur-md p-2 z-10 rounded-xl border border-white/5">
                         <BedDouble className="w-6 h-6 text-[#00E5FF]" />
                         <h2 className="text-xl font-black text-white uppercase tracking-wider">Stay at Skylark</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {sortedMenu.filter((i: MenuItem) => i.category === 'Stay').map((item: MenuItem) => (
                             <div key={item.id} className="group relative bg-slate-900/50 rounded-2xl border border-white/10 overflow-hidden hover:border-[#00E5FF]/50 transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,229,255,0.1)] h-40 sm:h-44">
                                 <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                 <div className="p-5 h-full flex flex-col relative z-10">
                                     <div className="flex justify-between items-start mb-2">
                                         <h3 className="font-bold text-lg text-white group-hover:text-[#00E5FF] transition-colors">{item.name}</h3>
                                         <span className="font-black text-lg text-[#00E5FF]">₹{item.price}</span>
                                     </div>
                                     <p className="text-sm text-gray-400 mb-4 line-clamp-2">{item.description}</p>
                                     <button className="mt-auto w-full py-2 rounded-lg bg-[#00E5FF]/10 text-[#00E5FF] font-bold text-sm border border-[#00E5FF]/20 hover:bg-[#00E5FF] hover:text-black transition-all">Check Availability</button>
                                 </div>
                             </div>
                         ))}
                    </div>
                </div>

                <div id="cat-menu" className="h-px bg-white/10 my-8"></div>

                {/* Menu Categories */}
                {Object.keys(groupedCategories).filter(k => k !== 'Stay').map(group => {
                    const groupCats = groupedCategories[group].filter(c => sortedMenu.some((i: MenuItem) => i.category === c));
                    if (groupCats.length === 0) return null;
                    
                    return (
                        <div key={group} className="space-y-8">
                             {groupCats.map(cat => {
                                 const catItems = sortedMenu.filter((i: MenuItem) => i.category === cat);
                                 if (catItems.length === 0) return null;
                                 const theme = getCategoryTheme(cat);
                                 const CatIcon = theme.icon;
                                 
                                 return (
                                     <div key={cat} id={`cat-${cat}`} className="scroll-mt-6">
                                         <div className="flex items-center gap-3 mb-4 sticky top-0 bg-black/95 backdrop-blur-md p-2 z-10 rounded-xl border border-white/5">
                                             <div className="p-2 rounded-lg" style={{backgroundColor: `${theme.hex}20`}}><CatIcon className="w-5 h-5" style={{color: theme.hex}}/></div>
                                             <h2 className="text-lg font-bold text-white uppercase tracking-wider" style={{color: theme.hex}}>{cat}</h2>
                                         </div>
                                         
                                         <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                             {catItems.map((item: MenuItem) => (
                                                 <div key={item.id} className={`group relative bg-transparent rounded-2xl border border-white/10 overflow-hidden hover:border-[${theme.hex}] transition-all duration-200 hover:shadow-[0_0_20px_${theme.hex}40] hover:scale-[1.02] h-32 ${!item.available ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                                                     <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300`} style={{backgroundColor: theme.hex}}></div>
                                                     
                                                     {/* Neon Pop Art Icon */}
                                                     <CatIcon 
                                                         className="absolute -right-6 -bottom-6 w-32 h-32 opacity-5 group-hover:opacity-20 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 z-0"
                                                         strokeWidth={1}
                                                         style={{color: theme.hex}} 
                                                     />

                                                     <div className="p-3 h-full flex flex-col relative z-10">
                                                         <div className="flex justify-between items-start mb-1">
                                                             <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-[#00FF00] shadow-[0_0_5px_#00FF00]' : 'bg-[#FF1744] shadow-[0_0_5px_#FF1744]'}`}></div>
                                                             {item.available ? (
                                                                 <button onClick={() => addToCart(item)} className={`p-2 -mt-2 -mr-2 rounded-bl-xl transition-all duration-200 active:scale-90 bg-[#000000]/40 backdrop-blur-sm hover:scale-105 ${item.isVeg ? 'text-[#00FF00] hover:bg-[#00FF00] hover:text-black' : 'text-[#FF1744] hover:bg-[#FF1744] hover:text-black'}`}>
                                                                     <Plus className="w-4 h-4 stroke-[3px]" />
                                                                 </button>
                                                             ) : (
                                                                 <span className="text-[10px] font-bold text-red-500 border border-red-500 px-1 rounded">SOLD OUT</span>
                                                             )}
                                                         </div>
                                                         
                                                         <h3 className="font-bold text-sm text-white leading-tight mb-1 line-clamp-2 group-hover:text-white transition-colors shadow-black drop-shadow-md">{item.name}</h3>
                                                         {/* <p className="text-[10px] text-gray-400 line-clamp-1 mb-auto">{item.description}</p> */}
                                                         
                                                         <div className="mt-auto flex items-end justify-between">
                                                             <span className={`text-xs font-bold shadow-black drop-shadow-sm`} style={{color: theme.hex}}>₹{item.price}</span>
                                                             <span className="text-[10px] font-bold text-gray-500 bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-md border border-white/5">{item.prepTime}</span>
                                                         </div>
                                                     </div>
                                                 </div>
                                             ))}
                                         </div>
                                     </div>
                                 );
                             })}
                        </div>
                    );
                })}
            </div>
         </div>
      </div>

      {/* Cart Float */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-50 animate-fade-in max-w-xl mx-auto">
            <div className="bg-slate-900/90 backdrop-blur-xl border border-[#00E5FF]/30 p-4 rounded-2xl shadow-[0_0_30px_rgba(0,229,255,0.15)]">
                <div className="flex justify-between items-center mb-3">
                    <div>
                        <span className="text-gray-400 text-xs uppercase tracking-wider">Total</span>
                        <div className="text-2xl font-bold text-white">₹{totalAmount}</div>
                    </div>
                    <div className="text-right">
                        <span className="text-gray-400 text-xs">{cart.reduce((a: number,b: CartItem) => a+b.quantity,0)} items</span>
                    </div>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 mb-2 custom-scrollbar">
                    {cart.map((item: CartItem) => (
                        <div key={item.id} className="flex-shrink-0 bg-white/5 rounded-lg p-2 flex items-center gap-2 border border-white/5 min-w-[120px]">
                             <div className="flex-1 min-w-0">
                                 <div className="text-xs font-bold text-white truncate">{item.name}</div>
                                 <div className="text-[10px] text-gray-400">₹{item.price * item.quantity}</div>
                             </div>
                             <div className="flex items-center gap-1 bg-black/40 rounded px-1">
                                 <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-white text-xs p-1"><Minus className="w-3 h-3"/></button>
                                 <span className="text-xs font-bold w-3 text-center">{item.quantity}</span>
                                 <button onClick={() => addToCart(item)} className="text-[#00E5FF] text-xs p-1"><Plus className="w-3 h-3"/></button>
                             </div>
                        </div>
                    ))}
                </div>
                <div className="flex gap-3">
                    <button onClick={() => { if(confirm('Clear cart?')) cart.forEach((i:CartItem)=>removeFromCart(i.id, true))}} className="p-3 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5"/></button>
                    <button onClick={() => setPlaceOrderModalOpen(true)} className="flex-1 bg-[#00E5FF] hover:bg-[#00b8cc] text-black font-bold py-3 rounded-xl shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2">
                        Place Order <ShoppingBag className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
});

const KitchenView = React.memo(({ orders, updateOrderStatus, menu, onLogout, onNavigate }: any) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing'>('all');
  const pendingOrders = orders.filter((o: Order) => o.status === 'pending');
  const preparingOrders = orders.filter((o: Order) => o.status === 'preparing');

  // Identify missing ingredients for orders
  const getOrderWarnings = (orderItems: CartItem[]) => {
      const warnings: string[] = [];
      orderItems.forEach(item => {
          const menuItem = menu.find((m: MenuItem) => m.id === item.id);
          if (menuItem && menuItem.missingIngredients && menuItem.missingIngredients.length > 0) {
              warnings.push(`${item.name}: Missing ${menuItem.missingIngredients.join(', ')}`);
          }
      });
      return warnings;
  };

  return (
    <div className="h-screen bg-slate-900 text-white flex flex-col">
      <header className="flex-none p-4 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
         <div className="flex items-center gap-4 w-full md:w-auto">
            <button onClick={() => onNavigate('customer')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-400" />
            </button>
            <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg"><ChefHat className="w-8 h-8 text-orange-500" /></div>
                <div>
                    <h1 className="text-2xl font-bold">Kitchen Display</h1>
                    <p className="text-xs text-gray-400">Live Order Tracking</p>
                </div>
            </div>
         </div>
         
         <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
            <div className="flex gap-4">
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{pendingOrders.length}</div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500">Pending</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{preparingOrders.length}</div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500">Cooking</div>
                </div>
            </div>
            <div className="flex gap-2">
                 <button onClick={() => { document.dispatchEvent(new CustomEvent('openInventory')) }} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-sm font-bold flex items-center gap-2"><Package className="w-4 h-4"/> Ingredients</button>
                 <button onClick={() => { document.dispatchEvent(new CustomEvent('openStock')) }} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-sm font-bold flex items-center gap-2"><Refrigerator className="w-4 h-4"/> Menu Stock</button>
                 <button onClick={onLogout} className="p-2 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors"><LogOut className="w-5 h-5" /></button>
            </div>
         </div>
      </header>

      {/* FIXED LAYOUT: Vertical Stack (flex-col) instead of horizontal row */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        
        {/* Column 1: New Orders */}
        <div className="flex-1 bg-slate-800/50 rounded-2xl border border-white/5 overflow-hidden flex flex-col min-h-[400px]">
             <div className="p-4 border-b border-white/5 bg-slate-800 flex justify-between items-center sticky top-0 z-10">
                 <h2 className="font-bold text-blue-400 flex items-center gap-2"><Bell className="w-5 h-5"/> NEW ORDERS <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full text-xs">{pendingOrders.length}</span></h2>
             </div>
             <div className="p-4 space-y-4 overflow-y-auto flex-1">
                 {pendingOrders.length === 0 && <div className="text-center text-gray-500 py-10 italic">No pending orders</div>}
                 {pendingOrders.map((order: Order) => {
                     const warnings = getOrderWarnings(order.items);
                     return (
                        <div key={order.id} className="bg-slate-700/50 rounded-xl p-4 border border-white/5 animate-fade-in hover:border-blue-500/30 transition-colors">
                            <div className="flex justify-between items-start mb-3 pb-3 border-b border-white/5">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-lg text-white">#{order.id.slice(-4).toUpperCase()}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${order.customerInfo.serviceType === 'Dine-in' ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'}`}>{order.customerInfo.serviceType}</span>
                                    </div>
                                    <div className="text-sm text-gray-400 font-medium mt-1">{order.customerInfo.name} {order.customerInfo.tableNumber && `• Table ${order.customerInfo.tableNumber}`}</div>
                                </div>
                                <div className="text-right text-xs text-gray-500 flex flex-col items-end">
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    <span>{Math.floor((Date.now() - order.timestamp) / 60000)}m ago</span>
                                </div>
                            </div>
                            
                            {warnings.length > 0 && (
                                <div className="mb-3 bg-red-500/10 border border-red-500/20 rounded-lg p-2 text-xs text-red-400">
                                    <div className="font-bold flex items-center gap-1 mb-1"><AlertTriangle className="w-3 h-3"/> Missing Ingredients</div>
                                    <ul className="list-disc list-inside opacity-80">{warnings.map((w,i) => <li key={i}>{w}</li>)}</ul>
                                </div>
                            )}

                            <div className="space-y-2 mb-4">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span className={`${item.isVeg ? 'text-green-400' : 'text-red-400'} font-medium flex items-center gap-2`}>
                                            <span className="bg-white/10 w-5 h-5 rounded flex items-center justify-center text-xs font-bold text-white">{item.quantity}</span>
                                            {item.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            
                            <button onClick={() => updateOrderStatus(order.id, 'preparing')} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                                <Flame className="w-4 h-4" /> Start Cooking
                            </button>
                        </div>
                     );
                 })}
             </div>
        </div>

        {/* Column 2: In Progress */}
        <div className="flex-1 bg-slate-800/50 rounded-2xl border border-white/5 overflow-hidden flex flex-col min-h-[400px]">
             <div className="p-4 border-b border-white/5 bg-slate-800 flex justify-between items-center sticky top-0 z-10">
                 <h2 className="font-bold text-yellow-400 flex items-center gap-2"><ChefHat className="w-5 h-5"/> IN PROGRESS <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full text-xs">{preparingOrders.length}</span></h2>
             </div>
             <div className="p-4 space-y-4 overflow-y-auto flex-1">
                 {preparingOrders.length === 0 && <div className="text-center text-gray-500 py-10 italic">No active orders</div>}
                 {preparingOrders.map((order: Order) => (
                    <div key={order.id} className="bg-slate-700/50 rounded-xl p-4 border-l-4 border-yellow-500 shadow-lg">
                        <div className="flex justify-between items-start mb-3">
                             <div>
                                <span className="font-bold text-lg text-white">#{order.id.slice(-4).toUpperCase()}</span>
                                <div className="text-sm text-gray-400">{order.customerInfo.name}</div>
                            </div>
                            <div className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-bold animate-pulse">COOKING</div>
                        </div>
                        <div className="space-y-1 mb-4 opacity-80">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="text-sm flex gap-2">
                                    <span className="font-bold">x{item.quantity}</span> {item.name}
                                </div>
                            ))}
                        </div>
                         <button onClick={() => updateOrderStatus(order.id, 'ready')} className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg shadow-lg shadow-green-600/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Mark Ready
                        </button>
                    </div>
                 ))}
             </div>
        </div>

      </div>
    </div>
  );
});

const AdminView = React.memo(({ 
    menu, 
    orders, 
    updateOrderStatus, 
    addMenuItem, 
    deleteMenuItem, 
    deleteOrder,
    toggleAvailability,
    onLogout,
    onNavigate 
}: any) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'menu' | 'orders'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  
  const totalRevenue = orders.filter((o:Order) => o.status !== 'cancelled').reduce((sum:number, o:Order) => sum + o.totalAmount, 0);
  const totalOrders = orders.length;
  const completedOrders = orders.filter((o:Order) => o.status === 'completed');
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Dashboard Charts Data
  const today = new Date().toLocaleDateString();
  const todayOrders = orders.filter((o:Order) => new Date(o.timestamp).toLocaleDateString() === today);
  const todayRevenue = todayOrders.reduce((sum:number, o:Order) => sum + o.totalAmount, 0);

  const topItems = useMemo(() => {
      const counts: {[key: string]: number} = {};
      orders.forEach((o:Order) => o.items.forEach(i => counts[i.name] = (counts[i.name] || 0) + i.quantity));
      return Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 5);
  }, [orders]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <header className="flex-none bg-slate-800 p-4 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-50">
          <div className="flex items-center gap-4 w-full md:w-auto">
              <button onClick={() => onNavigate('customer')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <ArrowLeft className="w-6 h-6 text-gray-400" />
              </button>
              <h1 className="text-xl font-bold flex items-center gap-2"><Lock className="w-5 h-5 text-purple-500"/> Manager Dashboard</h1>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
              <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-purple-600 text-white' : 'hover:bg-white/5'}`}>Overview</button>
              <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${activeTab === 'orders' ? 'bg-purple-600 text-white' : 'hover:bg-white/5'}`}>Transactions</button>
              <button onClick={() => setActiveTab('menu')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${activeTab === 'menu' ? 'bg-purple-600 text-white' : 'hover:bg-white/5'}`}>Menu Editor</button>
              <button onClick={() => { document.dispatchEvent(new CustomEvent('openInventory')) }} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-sm font-bold whitespace-nowrap flex items-center gap-2"><Package className="w-4 h-4"/> Inventory</button>
              <button onClick={() => { document.dispatchEvent(new CustomEvent('openPlanner')) }} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-sm font-bold whitespace-nowrap flex items-center gap-2"><CalendarDays className="w-4 h-4"/> Calendar Planner</button>
              <button onClick={onLogout} className="p-2 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors"><LogOut className="w-5 h-5" /></button>
          </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-slate-800 p-5 rounded-xl border border-white/5">
                          <div className="text-gray-400 text-xs uppercase font-bold mb-1">Total Revenue</div>
                          <div className="text-3xl font-bold text-[#00E5FF]">₹{totalRevenue.toLocaleString()}</div>
                          <div className="text-xs text-green-400 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> Lifetime</div>
                      </div>
                      <div className="bg-slate-800 p-5 rounded-xl border border-white/5">
                          <div className="text-gray-400 text-xs uppercase font-bold mb-1">Total Orders</div>
                          <div className="text-3xl font-bold text-white">{totalOrders}</div>
                      </div>
                      <div className="bg-slate-800 p-5 rounded-xl border border-white/5">
                          <div className="text-gray-400 text-xs uppercase font-bold mb-1">Avg Order Value</div>
                          <div className="text-3xl font-bold text-yellow-400">₹{avgOrderValue}</div>
                      </div>
                       <div className="bg-slate-800 p-5 rounded-xl border border-white/5">
                          <div className="text-gray-400 text-xs uppercase font-bold mb-1">Pending Actions</div>
                          <div className="text-3xl font-bold text-orange-500">{orders.filter((o:Order) => o.status === 'pending' || o.status === 'ready').length}</div>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Daily Snapshot */}
                      <div className="bg-slate-800 rounded-xl border border-white/5 p-6">
                          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-blue-400"/> Daily Snapshot ({today})</h3>
                          <div className="grid grid-cols-2 gap-4">
                              <div className="bg-slate-700/50 p-4 rounded-lg text-center">
                                  <div className="text-2xl font-bold text-white">₹{todayRevenue}</div>
                                  <div className="text-xs text-gray-400">Today's Revenue</div>
                              </div>
                              <div className="bg-slate-700/50 p-4 rounded-lg text-center">
                                  <div className="text-2xl font-bold text-white">{todayOrders.length}</div>
                                  <div className="text-xs text-gray-400">Orders Today</div>
                              </div>
                          </div>
                      </div>

                      {/* Top Selling Items */}
                      <div className="bg-slate-800 rounded-xl border border-white/5 p-6">
                           <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-green-400"/> Top Selling Items</h3>
                           <div className="space-y-3">
                               {topItems.map(([name, count], i) => (
                                   <div key={name} className="flex justify-between items-center p-2 bg-slate-700/30 rounded border border-white/5">
                                       <div className="flex items-center gap-3">
                                           <span className="font-bold text-gray-500 text-sm">#{i+1}</span>
                                           <span className="font-medium text-white">{name}</span>
                                       </div>
                                       <span className="font-bold text-[#00E5FF]">{count} sold</span>
                                   </div>
                               ))}
                           </div>
                      </div>
                  </div>

                  {/* Ready for Service Section */}
                  <div className="bg-slate-800 rounded-xl border border-white/5 overflow-hidden">
                      <div className="p-4 border-b border-white/5 bg-slate-800 flex justify-between items-center">
                          <h3 className="font-bold text-green-400 flex items-center gap-2"><Bell className="w-5 h-5"/> Ready to Serve</h3>
                      </div>
                      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                          {orders.filter((o:Order) => o.status === 'ready').map((order:Order) => (
                              <div key={order.id} className="bg-slate-700/50 p-4 rounded-xl border-l-4 border-green-500">
                                   <div className="flex justify-between mb-2">
                                       <span className="font-bold">#{order.id.slice(-4)}</span>
                                       <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">READY</span>
                                   </div>
                                   <div className="text-sm text-gray-300 mb-3">{order.customerInfo.name}</div>
                                   <button onClick={() => updateOrderStatus(order.id, 'completed')} className="w-full py-2 bg-green-600 text-white rounded font-bold text-sm hover:bg-green-500">Complete Order</button>
                              </div>
                          ))}
                          {orders.filter((o:Order) => o.status === 'ready').length === 0 && <div className="col-span-3 text-center text-gray-500 py-4">No orders waiting for service</div>}
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'orders' && (
              <div className="bg-slate-800 rounded-xl border border-white/5 overflow-hidden animate-fade-in">
                  <div className="p-4 border-b border-white/5 flex justify-between items-center">
                      <h3 className="font-bold">Recent Transactions</h3>
                      <div className="relative">
                          <input 
                              value={searchTerm} 
                              onChange={(e) => setSearchTerm(e.target.value)} 
                              className="bg-slate-700 border border-white/10 rounded-lg py-1 px-3 pl-9 text-sm outline-none focus:border-purple-500" 
                              placeholder="Search ID or Name..." 
                          />
                          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2"/>
                      </div>
                  </div>
                  <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-slate-700/50 text-gray-400">
                          <tr>
                              <th className="p-4">ID</th>
                              <th className="p-4">Customer</th>
                              <th className="p-4">Items</th>
                              <th className="p-4">Total</th>
                              <th className="p-4">Status</th>
                              <th className="p-4">Action</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                          {orders.filter((o:Order) => o.id.toLowerCase().includes(searchTerm.toLowerCase()) || o.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase())).map((order: Order) => (
                              <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                  <td className="p-4 font-mono text-xs">{order.id.slice(0,8)}</td>
                                  <td className="p-4 font-medium">{order.customerInfo.name}</td>
                                  <td className="p-4 text-gray-400">{order.items.map(i=>`${i.quantity}x ${i.name}`).join(', ')}</td>
                                  <td className="p-4 font-bold">₹{order.totalAmount}</td>
                                  <td className="p-4">
                                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                          order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                          order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                                          'bg-blue-500/20 text-blue-400'
                                      }`}>
                                          {order.status}
                                      </span>
                                  </td>
                                  <td className="p-4">
                                      <button onClick={() => deleteOrder(order.id)} className="p-2 hover:bg-red-500/20 rounded text-red-400 transition-colors"><Trash2 className="w-4 h-4"/></button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                  </div>
              </div>
          )}
          {activeTab === 'menu' && (
              <div className="bg-slate-800 rounded-xl border border-white/5 p-6 text-center text-gray-400 animate-fade-in">
                  <MenuIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <h3 className="text-xl font-bold text-white mb-2">Menu Editor</h3>
                  <p>Use the "Download Menu Data" button to get a CSV, edit it in Excel, and upload it back to update items in bulk.</p>
                  <div className="mt-6 flex justify-center gap-4">
                       <button onClick={() => generateCSV(menu)} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-500 flex items-center gap-2"><Download className="w-4 h-4"/> Download CSV</button>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
});

// --- Login View ---
const LoginView = React.memo(({ onLogin, onBack }: { onLogin: (type: 'kitchen' | 'admin') => void, onBack: () => void }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === 'skylarkcafe' && password === 'kitchen123') {
            if (rememberMe) localStorage.setItem('skylark_auth', JSON.stringify({ type: 'kitchen', user: username, time: Date.now() }));
            onLogin('kitchen');
        } else if (username === 'skylark' && password === 'sanskar321') {
            if (rememberMe) localStorage.setItem('skylark_auth', JSON.stringify({ type: 'admin', user: username, time: Date.now() }));
            onLogin('admin');
        } else {
            alert('Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl w-full max-w-md relative z-10 animate-fade-in">
                <button onClick={onBack} className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                </button>
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-white mb-2">Skylark Login</h1>
                    <p className="text-gray-400">Access restricted dashboard</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-2">Username</label>
                        <input value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[#00E5FF] outline-none" placeholder="Enter ID" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-2">Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[#00E5FF] outline-none" placeholder="Enter password" />
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="remember" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="w-4 h-4 rounded bg-slate-800 border-gray-600 text-purple-600 focus:ring-purple-600"/>
                        <label htmlFor="remember" className="text-sm text-gray-400 cursor-pointer select-none">Remember Me</label>
                    </div>

                    <button type="submit" className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all active:scale-95">
                        Secure Login
                    </button>
                </form>
            </div>
        </div>
    );
});

// --- App Component ---

const App = () => {
  const [view, setView] = useState<'customer' | 'kitchen' | 'admin' | 'login'>('customer');
  const [authTarget, setAuthTarget] = useState<'kitchen' | 'admin' | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>(INITIAL_MENU);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>(INITIAL_INGREDIENTS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  
  // Modals
  const [isPlaceOrderModalOpen, setPlaceOrderModalOpen] = useState(false);
  const [isInventoryOpen, setInventoryOpen] = useState(false);
  const [isStockOpen, setStockOpen] = useState(false);
  const [isPlannerOpen, setPlannerOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  
  const [vegMode, setVegMode] = useState(false);

  // Initialize & Persistence
  useEffect(() => {
      const savedOrders = localStorage.getItem('skylark_orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));
      
      const auth = localStorage.getItem('skylark_auth');
      if (auth) {
          const parsed = JSON.parse(auth);
          if (parsed && parsed.type) setView(parsed.type);
      }

      // Listen for custom events from child components
      const openInv = () => setInventoryOpen(true);
      const openPlan = () => setPlannerOpen(true);
      const openStock = () => setStockOpen(true);
      
      document.addEventListener('openInventory', openInv);
      document.addEventListener('openPlanner', openPlan);
      document.addEventListener('openStock', openStock);
      
      return () => {
          document.removeEventListener('openInventory', openInv);
          document.removeEventListener('openPlanner', openPlan);
          document.removeEventListener('openStock', openStock);
      }
  }, []);

  useEffect(() => {
      localStorage.setItem('skylark_orders', JSON.stringify(orders));
  }, [orders]);

  // Recipe Checking Logic
  useEffect(() => {
      const updatedMenu = menu.map(item => {
          const recipe = ITEM_RECIPES[item.name];
          if (!recipe) return { ...item, available: true, missingIngredients: [] };
          
          const missing = recipe.filter(ingId => {
              const ing = ingredients.find(i => i.id === ingId);
              return ing && !ing.inStock;
          });
          
          return {
              ...item,
              available: missing.length === 0,
              missingIngredients: missing.map(mid => ingredients.find(i => i.id === mid)?.name || mid)
          };
      });
      
      // Only update if changed to prevent loop
      const hasChanged = JSON.stringify(updatedMenu) !== JSON.stringify(menu);
      if (hasChanged) setMenu(updatedMenu);
  }, [ingredients]);

  const addToCart = useCallback((item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((itemId: string, removeAll = false) => {
    setCart(prev => {
      if (removeAll) return prev.filter(i => i.id !== itemId);
      const existing = prev.find(i => i.id === itemId);
      if (existing && existing.quantity > 1) return prev.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
      return prev.filter(i => i.id !== itemId);
    });
  }, []);

  const handlePlaceOrder = useCallback((customerInfo: CustomerInfo) => {
      const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const estTime = calculatePrepTime(cart);
      const newOrder: Order = {
          id: generateMenuId(),
          customerName: customerInfo.name,
          customerInfo,
          items: [...cart],
          status: 'pending',
          totalAmount,
          timestamp: Date.now(),
          estimatedTime: estTime
      };
      
      setOrders(prev => [newOrder, ...prev]);
      setCart([]);
      setActiveOrder(newOrder);
      // Could show confirmation screen here
  }, [cart]);

  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      if (activeOrder && activeOrder.id === orderId) {
          setActiveOrder(prev => prev ? { ...prev, status } : null);
      }
  }, [activeOrder]);

  const deleteOrder = useCallback((orderId: string) => {
      if(confirm('Are you sure you want to delete this order record permanently?')) {
          setOrders(prev => prev.filter(o => o.id !== orderId));
      }
  }, []);

  // Navigation Logic
  const handleNavigate = (target: 'kitchen' | 'admin' | 'customer') => {
      if (target === 'customer') {
          setView('customer');
          setAuthTarget(null);
          return;
      }
      // Check if already logged in
      const auth = localStorage.getItem('skylark_auth');
      if (auth) {
          const parsed = JSON.parse(auth);
          if (parsed.type === target) {
              setView(target);
              return;
          }
      }
      setAuthTarget(target);
      setView('login');
  };

  const handleLoginSuccess = (type: 'kitchen' | 'admin') => {
      setView(type);
  };
  
  const handleLogout = () => {
      localStorage.removeItem('skylark_auth');
      setView('customer');
      setAuthTarget(null);
  };

  return (
    <>
        {view === 'login' && <LoginView onLogin={handleLoginSuccess} onBack={() => setView('customer')} />}
        
        {view === 'customer' && (
            <CustomerView 
                menu={menu} 
                cart={cart} 
                addToCart={addToCart} 
                removeFromCart={removeFromCart} 
                isPlaceOrderModalOpen={isPlaceOrderModalOpen} 
                setPlaceOrderModalOpen={setPlaceOrderModalOpen} 
                activeOrder={activeOrder} 
                onNavigate={handleNavigate}
                toggleVegMode={() => setVegMode(!vegMode)}
                vegMode={vegMode}
            />
        )}
        
        {view === 'kitchen' && (
            <KitchenView 
                orders={orders} 
                updateOrderStatus={updateOrderStatus} 
                menu={menu} 
                onLogout={handleLogout} 
                onNavigate={handleNavigate} // Pass navigate prop
            />
        )}
        
        {view === 'admin' && (
            <AdminView 
                menu={menu} 
                orders={orders} 
                updateOrderStatus={updateOrderStatus} 
                deleteOrder={deleteOrder}
                onLogout={handleLogout}
                onNavigate={handleNavigate} // Pass navigate prop
            />
        )}

        {/* Shared Modals */}
        <PlaceOrderModal 
            isOpen={isPlaceOrderModalOpen} 
            onClose={() => setPlaceOrderModalOpen(false)} 
            onSubmit={handlePlaceOrder} 
            totalAmount={cart.reduce((sum, i) => sum + (i.price * i.quantity), 0)} 
        />
        
        <InventoryManager 
            isOpen={isInventoryOpen} 
            onClose={() => setInventoryOpen(false)} 
            inventory={inventory} 
            setInventory={setInventory} 
        />

        <CalendarPlanner 
            isOpen={isPlannerOpen} 
            onClose={() => setPlannerOpen(false)} 
            events={events} 
            setEvents={setEvents} 
        />
        
        {/* Stock Control Modal (Basic Implementation) */}
        {isStockOpen && (
             <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
                 <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                     <div className="flex justify-between mb-4">
                         <h2 className="font-bold text-xl text-black">Quick Stock Toggle</h2>
                         <button onClick={() => setStockOpen(false)}><X className="text-black"/></button>
                     </div>
                     <div className="grid grid-cols-2 gap-2">
                         {menu.map(item => (
                             <div key={item.id} className="flex justify-between items-center p-2 border rounded">
                                 <span className="text-sm font-medium">{item.name}</span>
                                 <button 
                                    onClick={() => setMenu(prev => prev.map(m => m.id === item.id ? {...m, available: !m.available} : m))}
                                    className={`px-2 py-1 rounded text-xs font-bold ${item.available ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                                 >
                                     {item.available ? 'In Stock' : 'Sold Out'}
                                 </button>
                             </div>
                         ))}
                     </div>
                 </div>
             </div>
        )}
    </>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
