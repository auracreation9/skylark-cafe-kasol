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
  ChevronUp,
  ChevronDown,
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
  customerName: string;
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

const ITEM_RECIPES: { [key: string]: string[] } = {
    'Hot Coffee': ['milk', 'coffee_powder', 'sugar'],
    'Masala Chai': ['milk', 'tea_leaves', 'sugar', 'ginger'],
    'Cold Coffee': ['milk', 'coffee_powder', 'sugar', 'ice_cream'],
    'Oreo Shake': ['milk', 'oreo', 'ice_cream', 'sugar'],
    'KitKat Shake': ['milk', 'kitkat', 'ice_cream', 'sugar'],
    'Banana Shake': ['milk', 'banana', 'sugar'],
    'Papaya Shake': ['milk', 'papaya', 'sugar'],
    'Butter Toast': ['bread', 'butter'],
    'Cheese Toast': ['bread', 'cheese_slice', 'butter'],
    'Nutella Sandwich': ['bread', 'chocolate', 'butter'],
    'Veg Burger': ['burger_bun', 'potato', 'onion', 'tomato', 'cucumber'],
    'Veg Cheese Burger': ['burger_bun', 'cheese_slice', 'potato', 'onion', 'tomato'],
    'Plain Maggi': ['maggi'],
    'Vegetable Maggi': ['maggi', 'onion', 'tomato', 'peas', 'carrot'],
    'Cheese Maggi': ['maggi', 'cheese_slice'],
    'Plain Fries': ['fries_frozen'],
    'Masala Fries': ['fries_frozen'],
    'Red Sauce Pasta': ['pasta_penne', 'tomato', 'onion', 'capsicum', 'corn'],
    'White Sauce Pasta': ['pasta_penne', 'milk', 'cheese_slice', 'corn', 'capsicum'],
    'Veg Momos': ['momos_wrapper', 'cabbage', 'carrot', 'onion'],
    'Paneer Momos': ['momos_wrapper', 'paneer', 'onion'],
    'Margherita Pizza': ['pizza_base', 'mozzarella', 'tomato'],
    'Veggie Pizza': ['pizza_base', 'mozzarella', 'onion', 'capsicum', 'corn', 'mushroom'],
    'Paneer Pizza': ['pizza_base', 'mozzarella', 'paneer', 'onion', 'capsicum'],
};

const generateMenuId = () => Math.random().toString(36).substr(2, 9);

const RAW_MENU_DATA = {
  stay: [
      { cat: 'Stay', items: [['Room - Accommodates up to 3', 1800, 'Slow', '1 Double Bed | Attached Washroom | Cozy & Comfortable'], ['Room - Accommodates up to 8', 3500, 'Slow', '2 Double Beds | Attached Bathroom | Spacious & Family Friendly']] }
  ],
  veg: [
    { cat: 'Beverages (Hot)', items: [['Hot Coffee', 30, 'Quick'], ['Masala Chai', 20, 'Quick'], ['Ginger Tea', 20, 'Quick'], ['Lemon Tea', 20, 'Quick'], ['Green Tea', 30, 'Quick'], ['Hot Chocolate', 60, 'Quick']] },
    { cat: 'Beverages (Cold)', items: [['Blue Crushers', 200, 'Quick'], ['Mint Mojito', 240, 'Quick'], ['Kiwi Mojito', 260, 'Quick'], ['Green Apple Mojito', 260, 'Quick'], ['Spicy Mango Soda', 200, 'Quick'], ['Fresh Lime Soda', 160, 'Quick'], ['Coconut Water', 120, 'Quick'], ['Cold Coffee', 240, 'Quick']] },
    { cat: 'Maggi', items: [['Plain Maggi', 80, 'Quick'], ['Cheese Maggi', 120, 'Quick'], ['Vegetable Maggi', 100, 'Quick'], ['Butter Maggi', 90, 'Quick'], ['Tandoori Maggi', 110, 'Quick']] },
    { cat: 'Breakfast', items: [['Butter Toast', 80, 'Quick'], ['Nutella Sandwich', 160, 'Quick'], ['Cheese Toast', 120, 'Quick'], ['Aloo Paratha', 100, 'Medium'], ['Mix Veg Paratha', 120, 'Medium'], ['Paneer Paratha', 140, 'Medium'], ['Gobhi Paratha', 120, 'Medium'], ['Pizza Paratha', 160, 'Medium'], ['Butter Roti', 30, 'Medium'], ['Plain Roti', 20, 'Medium']] },
    { cat: 'Sandwich', items: [['Veg Sandwich', 100, 'Quick'], ['Cheese Sandwich', 120, 'Quick'], ['Veg Grilled Sandwich', 140, 'Medium'], ['Paneer Grilled Sandwich', 160, 'Medium'], ['Corn Cheese Sandwich', 150, 'Medium'], ['Bombay Sandwich', 140, 'Medium'], ['Club Sandwich', 180, 'Medium']] },
    { cat: 'Burgers', items: [['Veg Burger', 120, 'Medium'], ['Veg Cheese Burger', 140, 'Medium'], ['Paneer Burger', 160, 'Medium'], ['Maharaja Burger', 200, 'Medium']] },
    { cat: 'Pasta', items: [['Red Sauce Pasta', 180, 'Medium'], ['White Sauce Pasta', 200, 'Medium'], ['Mix Sauce Pasta', 220, 'Medium']] },
    { cat: 'Pizza', items: [['Margherita Pizza', 200, 'Slow'], ['Veggie Delight Pizza', 240, 'Slow'], ['Paneer Tikka Pizza', 280, 'Slow'], ['Farmhouse Pizza', 260, 'Slow'], ['Mushroom Pizza', 260, 'Slow']] },
    { cat: 'Momos', items: [['Veg Steamed Momos', 100, 'Medium'], ['Veg Fried Momos', 120, 'Medium'], ['Paneer Steamed Momos', 140, 'Medium'], ['Paneer Fried Momos', 160, 'Medium'], ['Veg Kurkure Momos', 150, 'Medium']] },
    { cat: 'Fries', items: [['French Fries', 160, 'Quick'], ['Masala Fries', 200, 'Quick'], ['Cheese Fries', 240, 'Quick'], ['Peri Peri Fries', 180, 'Quick']] },
    { cat: 'Salad', items: [['Mix Veg Salad', 100, 'Quick'], ['Onion Salad', 60, 'Quick'], ['Cucumber Salad', 80, 'Quick'], ['Cucumber with Black Pepper Mayo', 120, 'Quick']] },
    { cat: 'Raita', items: [['Plain Dahi', 80, 'Quick'], ['Jeera Raita', 100, 'Quick'], ['Boondi Raita', 120, 'Quick'], ['Mix Veg Raita', 140, 'Quick']] },
    { cat: 'Shakes/Lassi', items: [['Banana Shake', 200, 'Quick'], ['Chocobar Shake', 240, 'Quick'], ['Papaya Shake', 200, 'Quick'], ['Sweet Lassi', 160, 'Quick'], ['Oreo Shake', 220, 'Quick'], ['Kitkat Shake', 240, 'Quick'], ['Strawberry Shake', 200, 'Quick']] },
    { cat: 'Chinese', items: [['Veg Noodles', 160, 'Medium'], ['Veg Hakka Noodles', 180, 'Medium'], ['Chilly Paneer', 360, 'Medium'], ['Veg Manchurian', 280, 'Medium'], ['Fried Rice', 180, 'Medium'], ['Schezwan Fried Rice', 200, 'Medium'], ['Honey Chilli Potato', 240, 'Medium'], ['Spring Rolls', 160, 'Medium']] },
    { cat: 'Soup', items: [['Tomato Soup', 100, 'Medium'], ['Veg Manchow Soup', 120, 'Medium'], ['Sweet Corn Soup', 120, 'Medium'], ['Hot & Sour Soup', 120, 'Medium']] },
    { cat: 'Main Course', items: [['Paneer Methi', 360, 'Slow'], ['Paneer Butter Masala', 400, 'Slow'], ['Paneer Hotel Style', 400, 'Slow'], ['Kadai Paneer', 400, 'Slow'], ['Mix Veg', 300, 'Slow'], ['Navratna Korma', 360, 'Slow'], ['Malai Kofta', 380, 'Slow'], ['Mutter Paneer', 360, 'Slow'], ['Shahi Paneer', 420, 'Slow'], ['Dal Fry', 240, 'Slow'], ['Dal Tadka', 260, 'Slow'], ['Jeera Rice', 120, 'Medium'], ['Plain Rice', 100, 'Medium']] },
    { cat: 'Tandoor', items: [['Mushroom Tikka', 400, 'Slow'], ['Masala Aloo', 300, 'Slow'], ['Angara Paneer Tikka', 440, 'Slow'], ['Malai Paneer Tikka', 440, 'Slow'], ['Paneer Garlic Tikka', 440, 'Slow'], ['Tandoori Aloo', 280, 'Slow']] },
    { cat: 'Desserts', items: [['Ice Cream', 160, 'Quick'], ['Gulab Jamun', 120, 'Quick']] }
  ],
  nonveg: [
    { cat: 'Breakfast', items: [['Egg Sandwich', 140, 'Quick'], ['Omelette Simple', 80, 'Quick'], ['Omelette Plain', 100, 'Quick'], ['Omelette Loaded', 160, 'Quick'], ['Omelette Cheese', 140, 'Quick'], ['Omelette Pepper', 120, 'Quick'], ['Omelette Butter', 120, 'Quick']] },
    { cat: 'Egg Dishes', items: [['Egg Bhurji', 160, 'Medium'], ['Egg Curry', 200, 'Medium']] },
    { cat: 'Maggi', items: [['Egg Maggi', 140, 'Quick'], ['Chicken Maggi', 200, 'Quick']] },
    { cat: 'Rice', items: [['Egg Fried Rice', 280, 'Medium'], ['Chicken Fried Rice', 320, 'Medium']] },
    { cat: 'Noodles', items: [['Egg Fried Noodles', 280, 'Medium'], ['Chicken Noodles', 320, 'Medium']] },
    { cat: 'Main Course', items: [['Chicken Curry', 440, 'Slow'], ['Chicken Jalfrezi Dry/Gravy', 480, 'Slow'], ['Lemon Chicken Dry/Gravy', 480, 'Slow'], ['Chicken Kebab', 400, 'Slow'], ['Butter Chicken', 500, 'Slow'], ['Kadhai Chicken', 480, 'Slow']] },
    { cat: 'Mutton', items: [['Mutton Rogan Josh', 600, 'Slow'], ['Mutton Curry', 560, 'Slow'], ['Rara Mutton', 640, 'Slow'], ['Mutton Kebab', 500, 'Slow']] },
    { cat: 'Tandoor', items: [['Tandoori Malai Chicken', 480, 'Slow'], ['Ginger Garlic Chicken', 480, 'Slow'], ['Kali Mirch Chicken', 480, 'Slow'], ['Mutton Seekh Kebab', 560, 'Slow'], ['Chicken Tikka', 450, 'Slow'], ['Tandoori Chicken', 500, 'Slow']] },
    { cat: 'Chinese', items: [['Chilly Chicken Boneless', 440, 'Medium'], ['Chilly Chicken With Bone', 400, 'Medium'], ['Chicken Momos', 200, 'Medium'], ['Chicken Fried Momos', 220, 'Medium'], ['Chicken Spring Rolls', 220, 'Medium'], ['Chicken Manchow Soup', 160, 'Medium']] }
  ]
};

const buildMenu = () => {
  const menu: MenuItem[] = [];
  
  // Stay Items
  RAW_MENU_DATA.stay.forEach(category => {
    category.items.forEach(item => {
      const [name, price, prepTime, description] = item as [string, number, PrepTime, string];
      menu.push({
        id: generateMenuId(),
        name,
        category: category.cat,
        price,
        isVeg: true, // Rooms are conceptually neutral
        prepTime,
        available: true,
        description
      });
    });
  });

  // Veg Items
  RAW_MENU_DATA.veg.forEach(category => {
    category.items.forEach(item => {
       // Check if description exists in the array, otherwise use default
       let name, price, prepTime, description;
       if (item.length === 4) {
           [name, price, prepTime, description] = item as [string, number, PrepTime, string];
       } else {
           [name, price, prepTime] = item as [string, number, PrepTime];
           description = "A delicious blend of flavors";
       }
      menu.push({
        id: generateMenuId(),
        name,
        category: category.cat,
        price,
        isVeg: true,
        prepTime,
        available: true,
        description
      });
    });
  });

  // Non-Veg Items
  RAW_MENU_DATA.nonveg.forEach(category => {
    category.items.forEach(item => {
       let name, price, prepTime, description;
       if (item.length === 4) {
           [name, price, prepTime, description] = item as [string, number, PrepTime, string];
       } else {
           [name, price, prepTime] = item as [string, number, PrepTime];
           description = "A delicious blend of flavors";
       }
      menu.push({
        id: generateMenuId(),
        name,
        category: category.cat,
        price,
        isVeg: false,
        prepTime,
        available: true,
        description
      });
    });
  });

  return menu;
};

const INITIAL_MENU = buildMenu();

// --- Components ---

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
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-3 rounded-full bg-cyan-500/80 text-black shadow-lg shadow-cyan-500/50 hover:bg-cyan-400 transition-all duration-300 animate-fade-in"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </>
  );
};

const Toast = ({ message, visible }: { message: string; visible: boolean }) => (
    <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="bg-green-500/90 backdrop-blur-md text-black px-6 py-3 rounded-full shadow-lg shadow-green-500/30 font-semibold flex items-center gap-2">
            <CheckCircleIcon size={20} />
            {message}
        </div>
    </div>
);

const PrintableMenu = ({ menu }: { menu: MenuItem[] }) => {
  const vegItems = menu.filter(i => i.isVeg && i.category !== 'Stay');
  const nonVegItems = menu.filter(i => !i.isVeg && i.category !== 'Stay');

  const groupByCategory = (items: MenuItem[]) => {
    const grouped: { [key: string]: MenuItem[] } = {};
    items.forEach(item => {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    });
    return grouped;
  };

  const vegGrouped = groupByCategory(vegItems);
  const nonVegGrouped = groupByCategory(nonVegItems);

  return (
    <div className="min-h-screen bg-[conic-gradient(at_center,_var(--tw-gradient-stops))] from-indigo-950 via-purple-950 to-black text-white p-8 print:p-0 print:bg-white print:text-black">
      <style>{`
        @media print {
          @page { size: landscape; margin: 0.5cm; }
          body { -webkit-print-color-adjust: exact; }
          .no-print { display: none; }
          .print-layout { column-count: 4; column-gap: 1rem; }
        }
        .mandala-bg {
            background-image: radial-gradient(circle at center, transparent 0%, #000 100%), repeating-conic-gradient(from 0deg, #4c1d95 0deg 10deg, #2e1065 10deg 20deg);
            opacity: 0.2;
        }
      `}</style>

      <div className="fixed inset-0 mandala-bg pointer-events-none print:hidden"></div>

      <div className="relative z-10 max-w-[297mm] mx-auto">
        <div className="text-center mb-8 print:mb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
                <h1 className="text-5xl font-bold font-serif tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 print:text-black">SKYLARK CAFÉ</h1>
            </div>
          <p className="text-xl text-cyan-300 tracking-[0.2em] uppercase text-shadow-sm print:text-gray-600">Kasol | Himachal Pradesh</p>
        </div>

        <div className="print-layout columns-1 md:columns-3 lg:columns-4 gap-6 space-y-6">
          {/* Veg Section */}
          <div className="break-inside-avoid mb-6">
            <h2 className="text-2xl font-bold text-green-400 border-b-2 border-green-500/50 pb-2 mb-4 uppercase tracking-widest print:text-green-700">Vegetarian</h2>
          </div>
          
          {Object.entries(vegGrouped).map(([category, items]) => (
            <div key={category} className="break-inside-avoid mb-6 bg-white/5 p-4 rounded-lg backdrop-blur-sm border border-white/10 print:bg-transparent print:border-none print:p-0">
              <h3 className="text-lg font-bold text-yellow-400 mb-3 uppercase border-l-4 border-yellow-500 pl-2 print:text-black">{category}</h3>
              <ul className="space-y-1">
                {items.map(item => (
                  <li key={item.id} className="flex justify-between text-sm group">
                    <span className="text-gray-200 font-medium group-hover:text-white print:text-gray-800">{item.name}</span>
                    <span className="text-cyan-300 font-bold print:text-black">₹{item.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Non-Veg Section */}
          <div className="break-inside-avoid mb-6 mt-8">
            <h2 className="text-2xl font-bold text-red-400 border-b-2 border-red-500/50 pb-2 mb-4 uppercase tracking-widest print:text-red-700">Non-Vegetarian</h2>
          </div>

          {Object.entries(nonVegGrouped).map(([category, items]) => (
            <div key={category} className="break-inside-avoid mb-6 bg-white/5 p-4 rounded-lg backdrop-blur-sm border border-white/10 print:bg-transparent print:border-none print:p-0">
              <h3 className="text-lg font-bold text-orange-400 mb-3 uppercase border-l-4 border-orange-500 pl-2 print:text-black">{category}</h3>
              <ul className="space-y-1">
                {items.map(item => (
                  <li key={item.id} className="flex justify-between text-sm group">
                    <span className="text-gray-200 font-medium group-hover:text-white print:text-gray-800">{item.name}</span>
                    <span className="text-cyan-300 font-bold print:text-black">₹{item.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PlaceOrderModal = ({ 
    isOpen, 
    onClose, 
    onSubmit 
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    onSubmit: (info: CustomerInfo) => void 
}) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [serviceType, setServiceType] = useState<ServiceType>('Dine-in');
    const [tableNumber, setTableNumber] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ name, phone, serviceType, tableNumber: serviceType === 'Dine-in' ? tableNumber : undefined });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl shadow-cyan-500/20">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Complete Your Order</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Name</label>
                        <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 outline-none" placeholder="Enter your name" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Phone Number</label>
                        <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 outline-none" placeholder="Enter phone number" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Service Type</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['Dine-in', 'Takeaway', 'Delivery'] as ServiceType[]).map(type => (
                                <button
                                    type="button"
                                    key={type}
                                    onClick={() => setServiceType(type)}
                                    className={`p-2 rounded-lg text-sm font-medium transition-all ${serviceType === type ? 'bg-cyan-500 text-black' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                    {serviceType === 'Dine-in' && (
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Table Number</label>
                            <input required type="text" value={tableNumber} onChange={e => setTableNumber(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 outline-none" placeholder="e.g. T-4" />
                        </div>
                    )}
                    <button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-cyan-500/30 mt-4">
                        Confirm Order
                    </button>
                </form>
            </div>
        </div>
    );
};

const CustomerView = React.memo(({ 
  menu, 
  cart, 
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  clearCart, 
  placeOrder, 
  onNavigate,
  toggleVegMode,
  isVegMode,
  onLogin
}: { 
  menu: MenuItem[]; 
  cart: CartItem[]; 
  addToCart: (item: MenuItem) => void; 
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  placeOrder: (info: CustomerInfo) => void;
  onNavigate: (view: 'kitchen' | 'admin') => void;
  toggleVegMode: () => void;
  isVegMode: boolean;
  onLogin: (type: 'chef' | 'admin') => void;
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'time'>('price');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const scrollSidebar = (direction: 'up' | 'down') => {
    if (sidebarRef.current) {
      const scrollAmount = 300;
      sidebarRef.current.scrollBy({
        top: direction === 'up' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Scroll Spy
  useEffect(() => {
      const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
              if (entry.isIntersecting) {
                  setActiveCategory(entry.target.id.replace('cat-', ''));
              }
          });
      }, { rootMargin: '-20% 0px -60% 0px' });

      document.querySelectorAll('section[id^="cat-"]').forEach(section => {
          observer.observe(section);
      });

      return () => observer.disconnect();
  }, [menu]);

  const categories = useMemo(() => Array.from(new Set(menu.map(item => item.category))), [menu]);

  const getCategoryIcon = (cat: string) => {
    if (cat.includes('Hot')) return <Coffee size={28} strokeWidth={1} />;
    if (cat.includes('Cold') || cat.includes('Beverages')) return <GlassWater size={28} strokeWidth={1} />;
    if (cat.includes('Burger')) return <Sandwich size={28} strokeWidth={1} />;
    if (cat.includes('Pizza')) return <Pizza size={28} strokeWidth={1} />;
    if (cat.includes('Sandwich') || cat.includes('Toast')) return <AlignLeft size={28} strokeWidth={1} />;
    if (cat.includes('Fries')) return <Crop size={28} strokeWidth={1} />;
    if (cat.includes('Momos')) return <CircleDot size={28} strokeWidth={1} />;
    if (cat.includes('Maggi') || cat.includes('Noodles') || cat.includes('Pasta')) return <Utensils size={28} strokeWidth={1} />;
    if (cat.includes('Rice') || cat.includes('Biryani')) return <Box size={28} strokeWidth={1} />;
    if (cat.includes('Main Course')) return <ChefHat size={28} strokeWidth={1} />;
    if (cat.includes('Dessert') || cat.includes('Shake')) return <IceCream size={28} strokeWidth={1} />;
    if (cat.includes('Tandoor')) return <Flame size={28} strokeWidth={1} />;
    if (cat.includes('Breakfast')) return <Croissant size={28} strokeWidth={1} />;
    if (cat.includes('Egg')) return <Egg size={28} strokeWidth={1} />;
    if (cat.includes('Salad')) return <Carrot size={28} strokeWidth={1} />;
    if (cat.includes('Cookie') || cat.includes('Biscuits')) return <Cookie size={28} strokeWidth={1} />;
    if (cat.includes('Soup')) return <Soup size={28} strokeWidth={1} />;
    if (cat.includes('Stay')) return <BedDouble size={28} strokeWidth={1} />;
    return <Utensils size={28} strokeWidth={1} />;
  };
  
  const getCategoryTheme = (cat: string) => {
      if (cat.includes('Hot')) return '#F59E0B'; // Amber
      if (cat.includes('Cold') || cat.includes('Beverages')) return '#06b6d4'; // Cyan
      if (cat.includes('Burger')) return '#F97316'; // Orange
      if (cat.includes('Pizza')) return '#EF4444'; // Red
      if (cat.includes('Fries')) return '#EAB308'; // Yellow
      if (cat.includes('Green') || cat.includes('Salad') || cat.includes('Veg')) return '#22C55E'; // Green
      if (cat.includes('Non') || cat.includes('Chicken') || cat.includes('Mutton')) return '#EF4444'; // Red
      if (cat.includes('Dessert') || cat.includes('Shake')) return '#EC4899'; // Pink
      if (cat.includes('Stay')) return '#A855F7'; // Purple
      return '#8B5CF6'; // Violet default
  };

  const groupedCategories = useMemo(() => {
      // Sort logic: Stay -> Hot -> Cold -> Quick -> Medium -> Slow
      const priorityOrder = ['Stay', 'Beverages (Hot)', 'Beverages (Cold)', 'Maggi', 'Momos', 'Fries', 'Sandwich', 'Burgers', 'Pasta', 'Pizza', 'Breakfast', 'Egg Dishes', 'Rice', 'Noodles', 'Main Course', 'Tandoor', 'Chinese', 'Soup', 'Salad', 'Raita', 'Shakes/Lassi', 'Desserts'];
      
      const sorted = [...categories].sort((a, b) => {
          const idxA = priorityOrder.indexOf(a);
          const idxB = priorityOrder.indexOf(b);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          return 0;
      });

      return {
          'Stay': sorted.filter(c => c === 'Stay'),
          'Drinks': sorted.filter(c => c.includes('Beverages') || c.includes('Shake') || c.includes('Lassi')),
          'Fast Food': sorted.filter(c => ['Maggi', 'Sandwich', 'Burgers', 'Pasta', 'Pizza', 'Momos', 'Fries'].includes(c)),
          'Main Course': sorted.filter(c => !['Stay', 'Beverages (Hot)', 'Beverages (Cold)', 'Maggi', 'Sandwich', 'Burgers', 'Pasta', 'Pizza', 'Momos', 'Fries', 'Shakes/Lassi'].includes(c))
      };
  }, [categories]);

  const sortedMenu = useMemo(() => {
    let processed = menu.filter(item => 
      (item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       item.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!isVegMode || item.isVeg)
    );

    if (sortBy === 'price') {
      processed.sort((a, b) => a.price - b.price);
    } else {
      const timeWeight = { 'Quick': 1, 'Medium': 2, 'Slow': 3 };
      processed.sort((a, b) => timeWeight[a.prepTime] - timeWeight[b.prepTime]);
    }

    return processed;
  }, [menu, searchTerm, sortBy, isVegMode]);

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const scrollToCategory = (cat: string) => {
    const element = document.getElementById(`cat-${cat}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-black text-white font-sans selection:bg-cyan-500/30">
       <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { bg: #000; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }
      `}</style>
      
      {/* Mobile Drawer Overlay */}
      {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar Navigation */}
      <div className={`fixed md:relative z-50 w-72 h-full bg-zinc-950/95 border-r border-white/5 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} flex flex-col`}>
        
        <div className="p-6 border-b border-white/5 flex-none">
           <h1 className="text-3xl font-bold font-serif tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-1">Skylark</h1>
           <p className="text-xs text-gray-500 tracking-[0.3em] uppercase">Café & Stay</p>
        </div>

        {/* Sidebar Scroll Up Button */}
        <button 
            onClick={() => scrollSidebar('up')}
            className="w-full flex items-center justify-center p-2 text-cyan-400 hover:bg-white/5 hover:text-cyan-300 transition-colors border-b border-white/5 flex-none"
        >
            <ChevronUp size={20} />
        </button>

        <div ref={sidebarRef} className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
            {Object.entries(groupedCategories).map(([group, cats]) => (
                cats.length > 0 && (
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
                                            {getCategoryIcon(cat)}
                                        </div>
                                        <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'} transition-colors`}>{cat}</span>
                                        
                                        {/* Pop-up Art Icon */}
                                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-20 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 pointer-events-none" style={{ color: color }}>
                                           {getCategoryIcon(cat)}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )
            ))}
        </div>
        
        {/* Sidebar Scroll Down Button */}
        <button 
            onClick={() => scrollSidebar('down')}
            className="w-full flex items-center justify-center p-2 text-cyan-400 hover:bg-white/5 hover:text-cyan-300 transition-colors border-t border-white/5 flex-none"
        >
            <ChevronDown size={20} />
        </button>

        <div className="p-4 bg-zinc-900 border-t border-white/5 flex-none">
            <div className="relative mb-4">
                <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Search menu..." 
                  className="w-full bg-black border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-cyan-500 outline-none placeholder:text-gray-600"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex gap-2">
                <button 
                  onClick={toggleVegMode}
                  className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${isVegMode ? 'bg-green-500/10 border-green-500 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.2)]' : 'bg-zinc-800 border-white/5 text-gray-400 hover:border-white/20'}`}
                >
                    <Leaf size={14} /> VEG
                </button>
                <button 
                  onClick={() => setSortBy(prev => prev === 'price' ? 'time' : 'price')}
                  className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-zinc-800 border border-white/5 text-gray-400 text-xs font-bold hover:border-white/20 transition-all"
                >
                    {sortBy === 'price' ? <DollarSign size={14} /> : <Clock size={14} />}
                    {sortBy === 'price' ? 'PRICE' : 'TIME'}
                </button>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/5 p-3 md:p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
                <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-gray-400 hover:text-white">
                    <AlignLeft size={24} />
                </button>
                <div className="md:hidden">
                    <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Skylark</h1>
                </div>
                
                {/* Quick Nav */}
                <div className="hidden sm:flex items-center bg-zinc-900/80 p-1 rounded-xl border border-white/10">
                   <button onClick={() => scrollToCategory('Stay')} className="px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-white/5 hover:text-white text-gray-400 transition-colors flex items-center gap-2">
                       <BedDouble size={16} /> Stay
                   </button>
                   <button onClick={() => scrollToCategory('Beverages (Hot)')} className="px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-white/5 hover:text-white text-gray-400 transition-colors flex items-center gap-2">
                       <Coffee size={16} /> Café Menu
                   </button>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button onClick={() => window.open('https://maps.app.goo.gl/NUpz4bEUTTagFVUn9', '_blank')} className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/5 hover:bg-cyan-500/20 border border-white/5 hover:border-cyan-500/50 flex items-center justify-center text-gray-400 hover:text-cyan-400 transition-all hover:scale-105">
                    <MapPin size={20} />
                </button>
                 <button 
                    onClick={() => onLogin('chef')}
                    className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/5 hover:bg-orange-500/20 border border-white/5 hover:border-orange-500/50 flex items-center justify-center text-gray-400 hover:text-orange-400 transition-all hover:scale-105"
                >
                    <ChefHat size={20} />
                </button>
                <button 
                    onClick={() => onLogin('admin')}
                    className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/5 hover:bg-purple-500/20 border border-white/5 hover:border-purple-500/50 flex items-center justify-center text-gray-400 hover:text-purple-400 transition-all hover:scale-105"
                >
                    <User size={20} />
                </button>
                
                <div className="h-8 w-px bg-white/10 mx-1"></div>

                <button 
                  onClick={() => setIsCartOpen(true)}
                  className="relative group flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 pl-2 pr-3 py-1.5 md:pl-3 md:pr-4 md:py-2 rounded-full hover:scale-105 transition-all shadow-lg shadow-cyan-500/20"
                >
                   <div className="relative">
                       <ShoppingBag size={20} className="text-white" />
                       {totalItems > 0 && (
                        <span className="absolute -top-2 -right-2 w-4 h-4 md:w-5 md:h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-black">
                            {totalItems}
                        </span>
                       )}
                   </div>
                   <span className="font-bold text-sm">₹{totalAmount}</span>
                </button>
            </div>
        </header>

        {/* Content Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 md:p-8 scroll-smooth">
            <div className="max-w-7xl mx-auto pb-32">
                
                {/* Menu Sections */}
                {categories.map(cat => {
                    const items = sortedMenu.filter(i => i.category === cat);
                    if (items.length === 0) return null;
                    const color = getCategoryTheme(cat);
                    const isActive = activeCategory === cat;

                    return (
                        <section key={cat} id={`cat-${cat}`} className="mb-8 md:mb-12 scroll-mt-24">
                           <div className="flex items-center gap-4 mb-4 md:mb-6">
                               <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white shadow-lg" style={{ color: color, boxShadow: isActive ? `0 0 20px ${color}30` : 'none' }}>
                                   {getCategoryIcon(cat)}
                               </div>
                               <h2 className="text-2xl md:text-3xl font-bold font-serif tracking-wide text-white uppercase" style={{ textShadow: `0 0 30px ${color}50` }}>{cat}</h2>
                               <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent"></div>
                           </div>

                           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                               {items.map(item => (
                                   <div key={item.id} className={`group relative bg-transparent border border-white/10 rounded-2xl p-3 md:p-4 hover:border-[${color}]/50 hover:shadow-[0_0_30px_${color}20] hover:scale-[1.02] transition-all duration-200 overflow-hidden min-h-[140px] md:h-44 flex flex-col`} style={{ borderColor: isActive ? `${color}40` : '' }}>
                                       
                                       {/* Neon Pop-up Art */}
                                       <div className="absolute -right-4 -bottom-4 text-white/5 group-hover:text-white/10 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 z-0" style={{ color: `${color}10` }}>
                                           {React.cloneElement(getCategoryIcon(cat) as React.ReactElement<any>, { size: 120 })}
                                       </div>
                                       
                                       <div className="relative z-10 flex justify-between items-start mb-2">
                                            <div className={`w-2.5 h-2.5 rounded-full ${item.isVeg ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`}></div>
                                            
                                            {item.available ? (
                                                <button 
                                                    onClick={() => addToCart(item)}
                                                    className={`p-2 rounded-xl bg-white/5 hover:scale-105 active:scale-95 transition-all border border-white/10 shadow-lg ${item.isVeg ? 'hover:bg-green-500 hover:text-black hover:border-green-500' : 'hover:bg-red-500 hover:text-white hover:border-red-500'}`}
                                                >
                                                    <Plus size={18} />
                                                </button>
                                            ) : (
                                                <span className="text-[10px] font-bold bg-zinc-800 px-2 py-1 rounded text-gray-500 border border-white/5">SOLD OUT</span>
                                            )}
                                       </div>

                                       <div className="relative z-10 flex-1">
                                           <h3 className={`font-bold text-base md:text-lg leading-tight mb-1 group-hover:text-[${color}] transition-colors`} style={{ color: isActive ? color : 'white' }}>{item.name}</h3>
                                           <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">{item.category}</p>
                                           <p className="text-xs md:text-[11px] text-gray-400 line-clamp-2 leading-relaxed">{item.description}</p>
                                       </div>

                                       <div className="relative z-10 mt-auto flex items-end justify-between">
                                           <span className="text-lg md:text-xl font-bold text-cyan-400">₹{item.price}</span>
                                           <div className="flex items-center gap-1 text-[10px] md:text-xs font-medium text-gray-500 bg-black/40 px-2 py-1 rounded-lg border border-white/5">
                                               <Clock size={10} /> {item.prepTime}
                                           </div>
                                       </div>
                                       
                                       {!item.available && <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] z-20 pointer-events-none" />}
                                   </div>
                               ))}
                           </div>
                        </section>
                    );
                })}
            </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[60]">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
           <div className="absolute right-0 top-0 h-full w-full max-w-md bg-zinc-900 border-l border-white/10 shadow-2xl flex flex-col animate-slide-in">
               <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
                   <h2 className="text-xl font-bold flex items-center gap-2">
                       <ShoppingBag className="text-cyan-400" /> Your Cart
                   </h2>
                   <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"><X size={20}/></button>
               </div>

               <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                   {cart.length === 0 ? (
                       <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                           <ShoppingBag size={64} strokeWidth={1} className="text-gray-700" />
                           <p>Your cart is empty</p>
                           <button onClick={() => setIsCartOpen(false)} className="px-6 py-2 bg-white/5 rounded-full text-sm hover:bg-white/10 text-white transition-colors">Browse Menu</button>
                       </div>
                   ) : (
                       <div className="space-y-4">
                           {cart.map(item => (
                               <div key={item.id} className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/5">
                                   <div className="flex-1">
                                       <div className="flex items-center gap-2 mb-1">
                                           <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                                           <h4 className="font-medium text-white">{item.name}</h4>
                                       </div>
                                       <p className="text-cyan-400 text-sm font-bold">₹{item.price * item.quantity}</p>
                                   </div>
                                   <div className="flex items-center gap-3 bg-zinc-800 rounded-lg p-1">
                                       <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-black/50 rounded text-gray-400 hover:text-white"><Minus size={16} /></button>
                                       <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                       <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-black/50 rounded text-gray-400 hover:text-white"><Plus size={16} /></button>
                                   </div>
                                   <button onClick={() => removeFromCart(item.id)} className="ml-3 text-red-500/50 hover:text-red-500"><Trash2 size={18} /></button>
                               </div>
                           ))}
                       </div>
                   )}
               </div>

               {cart.length > 0 && (
                   <div className="p-6 border-t border-white/10 bg-black/20 space-y-4">
                       <div className="space-y-2 text-sm text-gray-400">
                           <div className="flex justify-between"><span>Subtotal</span><span>₹{totalAmount}</span></div>
                           <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-white/10"><span>Total</span><span>₹{totalAmount}</span></div>
                       </div>
                       <div className="grid grid-cols-2 gap-3">
                            <button onClick={clearCart} className="py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 font-medium text-sm">Clear Cart</button>
                            <button onClick={() => setIsOrderModalOpen(true)} className="py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/25 hover:scale-[1.02] transition-transform">Place Order</button>
                       </div>
                   </div>
               )}
           </div>
        </div>
      )}

      {/* Modals */}
      <PlaceOrderModal isOpen={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)} onSubmit={placeOrder} />
      
      <ScrollToTop />
    </div>
  );
});