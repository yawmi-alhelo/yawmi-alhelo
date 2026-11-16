import type { TaskGroup, TaskPreset, IngredientGroup, IngredientPreset } from './types';

// ==================== مجموعات المهام ====================

export const TASK_GROUPS: TaskGroup[] = [
  { id: 'home',     label: 'البيت',          emoji: '🏠' },
  { id: 'food',     label: 'الطعام',         emoji: '🍳' },
  { id: 'work',     label: 'عمل ودراسة',     emoji: '📚' },
  { id: 'health',   label: 'صحة ورياضة',     emoji: '💪' },
  { id: 'selfcare', label: 'عناية بالنفس',   emoji: '💅' },
  { id: 'social',   label: 'أهل وأصدقاء',    emoji: '👨‍👩‍👧' },
  { id: 'shopping', label: 'تسوق',           emoji: '🛒' },
  { id: 'rest',     label: 'راحة',           emoji: '☕' },
];

export const TASK_PRESETS: TaskPreset[] = [
  // البيت
  { id: 'clean_house', label: 'تنظيف البيت',    emoji: '🧹', defaultDuration: 45, defaultPeriod: 'morning', groupId: 'home' },
  { id: 'tidy_rooms',  label: 'ترتيب الغرف',     emoji: '🛏️', defaultDuration: 30, defaultPeriod: 'morning', groupId: 'home' },
  { id: 'laundry',     label: 'غسيل الملابس',   emoji: '👕', defaultDuration: 20, defaultPeriod: 'morning', groupId: 'home' },
  { id: 'ironing',     label: 'كوي الملابس',    emoji: '🔥', defaultDuration: 30, defaultPeriod: 'afternoon', groupId: 'home' },
  { id: 'clean_kitchen',label: 'تنظيف المطبخ',  emoji: '🍽️', defaultDuration: 30, defaultPeriod: 'evening', groupId: 'home' },
  { id: 'clean_bath',  label: 'تنظيف الحمام',   emoji: '🚿', defaultDuration: 20, defaultPeriod: 'morning', groupId: 'home' },
  // الطعام
  { id: 'breakfast',   label: 'تحضير الفطور',   emoji: '🥐', defaultDuration: 20, defaultPeriod: 'morning', groupId: 'food' },
  { id: 'lunch',       label: 'تحضير الغداء',   emoji: '🍲', defaultDuration: 60, defaultPeriod: 'beforeNoon', groupId: 'food' },
  { id: 'dinner',      label: 'تحضير العشاء',   emoji: '🍽️', defaultDuration: 45, defaultPeriod: 'maghrib', groupId: 'food' },
  { id: 'dishes',      label: 'غسل الأواني',    emoji: '🧼', defaultDuration: 15, defaultPeriod: 'noon', groupId: 'food' },
  // عمل/دراسة
  { id: 'study',       label: 'دراسة',          emoji: '📖', defaultDuration: 120, defaultPeriod: 'noon', groupId: 'work' },
  { id: 'work',        label: 'عمل / شغل',      emoji: '💼', defaultDuration: 240, defaultPeriod: 'morning', groupId: 'work' },
  { id: 'reading',     label: 'قراءة كتاب',     emoji: '📚', defaultDuration: 30, defaultPeriod: 'evening', groupId: 'work' },
  // صحة
  { id: 'exercise',    label: 'رياضة / مشي',    emoji: '🏃‍♀️', defaultDuration: 30, defaultPeriod: 'afternoon', groupId: 'health' },
  { id: 'water',       label: 'شرب 8 أكواب ماي',emoji: '💧', defaultDuration: 5, defaultPeriod: 'morning', groupId: 'health' },
  { id: 'sleep_early', label: 'نوم مبكر',       emoji: '🌙', defaultDuration: 480, defaultPeriod: 'beforeSleep', groupId: 'health' },
  // عناية
  { id: 'skincare',    label: 'عناية بالبشرة',  emoji: '✨', defaultDuration: 15, defaultPeriod: 'evening', groupId: 'selfcare' },
  { id: 'haircare',    label: 'عناية بالشعر',   emoji: '💇‍♀️', defaultDuration: 20, defaultPeriod: 'evening', groupId: 'selfcare' },
  { id: 'relax',       label: 'تمارين استرخاء', emoji: '🧘‍♀️', defaultDuration: 15, defaultPeriod: 'evening', groupId: 'selfcare' },
  // اجتماعي
  { id: 'family_visit',label: 'زيارة الأهل',    emoji: '🏡', defaultDuration: 90, defaultPeriod: 'maghrib', groupId: 'social' },
  { id: 'call_someone',label: 'الاتصال بشخص',   emoji: '📞', defaultDuration: 15, defaultPeriod: 'maghrib', groupId: 'social' },
  { id: 'friend_out',  label: 'خروج مع صديقة',  emoji: '👭', defaultDuration: 120, defaultPeriod: 'evening', groupId: 'social' },
  // تسوق
  { id: 'groceries',   label: 'تسوق بقالة',     emoji: '🛒', defaultDuration: 60, defaultPeriod: 'afternoon', groupId: 'shopping' },
  { id: 'supplies',    label: 'تسوق مستلزمات',  emoji: '🛍️', defaultDuration: 60, defaultPeriod: 'afternoon', groupId: 'shopping' },
  // راحة
  { id: 'break',       label: 'استراحة',        emoji: '☕', defaultDuration: 20, defaultPeriod: 'afternoon', groupId: 'rest' },
  { id: 'tv_show',     label: 'مشاهدة مسلسل',   emoji: '📺', defaultDuration: 45, defaultPeriod: 'evening', groupId: 'rest' },
  { id: 'nap',         label: 'قيلولة قصيرة',   emoji: '😴', defaultDuration: 30, defaultPeriod: 'afternoon', groupId: 'rest' },
];

// ==================== مجموعات المكونات ====================

export const INGREDIENT_GROUPS: IngredientGroup[] = [
  { id: 'protein',  label: 'بروتين',       emoji: '🥩' },
  { id: 'veggies',  label: 'خضار',         emoji: '🥬' },
  { id: 'grains',   label: 'حبوب وأرز',    emoji: '🌾' },
  { id: 'dairy',    label: 'ألبان',        emoji: '🧀' },
  { id: 'pantry',   label: 'أساسيات',      emoji: '🧂' },
];

export const INGREDIENT_PRESETS: IngredientPreset[] = [
  // بروتين
  { id: 'chicken', label: 'دجاج',   emoji: '🍗', groupId: 'protein' },
  { id: 'meat',    label: 'لحم',    emoji: '🥩', groupId: 'protein' },
  { id: 'fish',    label: 'سمك',    emoji: '🐟', groupId: 'protein' },
  { id: 'eggs',    label: 'بيض',    emoji: '🥚', groupId: 'protein' },
  { id: 'tuna',    label: 'تونة',   emoji: '🐠', groupId: 'protein' },
  // خضار
  { id: 'onion',   label: 'بصل',    emoji: '🧅', groupId: 'veggies' },
  { id: 'tomato',  label: 'طماطة',  emoji: '🍅', groupId: 'veggies' },
  { id: 'potato',  label: 'بطاطا',  emoji: '🥔', groupId: 'veggies' },
  { id: 'carrot',  label: 'جزر',    emoji: '🥕', groupId: 'veggies' },
  { id: 'zucchini',label: 'كوسة',   emoji: '🥒', groupId: 'veggies' },
  { id: 'eggplant',label: 'باذنجان',emoji: '🍆', groupId: 'veggies' },
  { id: 'pepper',  label: 'فلفل',   emoji: '🫑', groupId: 'veggies' },
  { id: 'cucumber',label: 'خيار',   emoji: '🥒', groupId: 'veggies' },
  // حبوب
  { id: 'rice',    label: 'رز',     emoji: '🍚', groupId: 'grains' },
  { id: 'bulgur',  label: 'برغل',   emoji: '🌾', groupId: 'grains' },
  { id: 'pasta',   label: 'معكرونة',emoji: '🍝', groupId: 'grains' },
  { id: 'lentils', label: 'عدس',    emoji: '🫘', groupId: 'grains' },
  { id: 'chickpeas',label:'حمص',    emoji: '🫘', groupId: 'grains' },
  { id: 'beans',   label: 'فاصوليا',emoji: '🫘', groupId: 'grains' },
  // ألبان
  { id: 'yogurt',  label: 'لبن',    emoji: '🥛', groupId: 'dairy' },
  { id: 'cheese',  label: 'جبن',    emoji: '🧀', groupId: 'dairy' },
  { id: 'butter',  label: 'زبدة',   emoji: '🧈', groupId: 'dairy' },
  { id: 'cream',   label: 'كريمة',  emoji: '🥛', groupId: 'dairy' },
  // أساسيات
  { id: 'spices',  label: 'بهارات', emoji: '🌶️', groupId: 'pantry' },
  { id: 'paste',   label: 'معجون طماطة', emoji: '🍅', groupId: 'pantry' },
  { id: 'garlic',  label: 'ثوم',    emoji: '🧄', groupId: 'pantry' },
  { id: 'oil',     label: 'زيت',    emoji: '🫒', groupId: 'pantry' },
  { id: 'bread',   label: 'خبز',    emoji: '🍞', groupId: 'pantry' },
  { id: 'lemon',   label: 'ليمون',  emoji: '🍋', groupId: 'pantry' },
  { id: 'flour',   label: 'طحين',   emoji: '🌾', groupId: 'pantry' },
  // حلويات
  { id: 'sugar',     label: 'سكر',       emoji: '🍬', groupId: 'sweets' },
  { id: 'starch',    label: 'نشا',       emoji: '🥣', groupId: 'sweets' },
  { id: 'milk',      label: 'حليب',      emoji: '🥛', groupId: 'sweets' },
  { id: 'qaimar',    label: 'قيمر',      emoji: '🥛', groupId: 'sweets' },
  { id: 'pistachio', label: 'فستق',      emoji: '🌰', groupId: 'sweets' },
  { id: 'walnut',    label: 'جوز',       emoji: '🌰', groupId: 'sweets' },
  { id: 'yeast',     label: 'خميرة',     emoji: '🫧', groupId: 'sweets' },
  { id: 'honey',     label: 'عسل',       emoji: '🍯', groupId: 'sweets' },
  { id: 'rosewater', label: 'ماء ورد',   emoji: '💧', groupId: 'sweets' },
  { id: 'cocoa',     label: 'كاكاو',     emoji: '🍫', groupId: 'sweets' },
];

// ==================== قاعدة الأكلات العراقية (offline fallback) ====================

export interface LocalDish {
  name: string;
  emoji: string;
  meals: string[];           // فطور|غداء|عشاء|حلو
  needs: string[];           // IDs المكونات
  steps: string[];
  prepTime: number;
  cookTime: number;
}

export const IRAQI_DISHES: LocalDish[] = [
  // ========== فطور عراقي ==========
  { name: 'بيض بالطماطة (عجة)', emoji: '🍳', meals: ['فطور'], needs: ['eggs', 'tomato', 'onion', 'oil'], prepTime: 5, cookTime: 10,
    steps: ['حمري البصل بالزيت', 'ضيفي الطماطة المقطعة وقلبي', 'اكسري البيض فوقها', 'غطي 3 دقايق', 'قدميها مع خبز'] },
  { name: 'فول مدمس', emoji: '🫘', meals: ['فطور'], needs: ['beans', 'onion', 'tomato', 'lemon', 'oil'], prepTime: 3, cookTime: 10,
    steps: ['سخني الفول مع شوية ماي', 'ضيفي البصل والطماطة المفرومة', 'ضيفي الليمون والزيت', 'قدميه مع خبز حار'] },
  { name: 'كاهي وقيمر', emoji: '🥐', meals: ['فطور'], needs: ['butter', 'cheese', 'cream', 'bread'], prepTime: 2, cookTime: 5,
    steps: ['سخني عجينة الكاهي', 'ضيفي الزبدة والقيمر', 'قدميها مع شاي عراقي'] },
  { name: 'لبنة وزعتر', emoji: '🧀', meals: ['فطور'], needs: ['yogurt', 'oil', 'bread'], prepTime: 2, cookTime: 0,
    steps: ['حطي اللبنة بصحن', 'ضيفي زيت زيتون وزعتر', 'قدميها مع خبز'] },
  { name: 'جبن وخبز', emoji: '🧀', meals: ['فطور'], needs: ['cheese', 'bread'], prepTime: 1, cookTime: 3,
    steps: ['حطي الجبن بالخبز', 'سخني بالطاوة', 'قدميها مع شاي'] },
  { name: 'باقلاء بالزيت', emoji: '🫘', meals: ['فطور'], needs: ['beans', 'onion', 'tomato', 'oil'], prepTime: 5, cookTime: 15,
    steps: ['سخني الباقلاء', 'حمري البصل', 'ضيفي الطماطة', 'قدميها مع خبز'] },
  { name: 'عجينة عراقية بالجبن', emoji: '🍞', meals: ['فطور'], needs: ['bread', 'cheese', 'tomato', 'oil'], prepTime: 3, cookTime: 5,
    steps: ['حطي الجبن والطماطة بالخبز', 'سخني بالطاوة', 'قدميها مع شاي'] },
  { name: 'حلاوة طحينية وخبز', emoji: '🍯', meals: ['فطور', 'نواشف'], needs: ['bread'], prepTime: 1, cookTime: 0,
    steps: ['قطعي الخبز', 'حطي فوقه الحلاوة', 'قدميها مع شاي'] },

  // ========== غداء عراقي ==========
  { name: 'تمن ودجاج بالفرن', emoji: '🍗', meals: ['غداء'], needs: ['chicken', 'rice', 'onion', 'spices', 'oil'], prepTime: 15, cookTime: 50,
    steps: ['اغسلي الرز وانقعيه 20 دقيقة', 'قطعي الدجاج والبصل وحطيهم بقدر مع الزيت والبهارات', 'شوحي الدجاج 10 دقايق', 'ضيفي الرز والماء', 'خليها تغلي ثم خففي النار 25 دقيقة', 'قدميها مع سلطة'] },
  { name: 'كبسة دجاج', emoji: '🍛', meals: ['غداء'], needs: ['chicken', 'rice', 'tomato', 'onion', 'spices'], prepTime: 15, cookTime: 45,
    steps: ['حمري البصل', 'ضيفي الدجاج والبهارات', 'ضيفي الطماطة المعصورة', 'ضيفي الرز والماء', 'غطي 25 دقيقة'] },
  { name: 'برياني عراقي', emoji: '🍚', meals: ['غداء'], needs: ['chicken', 'rice', 'potato', 'carrot', 'onion', 'spices'], prepTime: 20, cookTime: 55,
    steps: ['حمري البصل والدجاج', 'ضيفي البطاطا والجزر', 'ضيفي البهارات والرز', 'ضيفي الماء', 'غطي واطبخي 30 دقيقة'] },
  { name: 'دولمة', emoji: '🥬', meals: ['غداء'], needs: ['meat', 'rice', 'onion', 'tomato', 'paste'], prepTime: 60, cookTime: 90,
    steps: ['حضري الحشوة', 'لفي أوراق العنب', 'رتبيها بالقدر مع أضلاع لحم', 'ضيفي الماء والملح', 'اطبخيها ساعة ونص'] },
  { name: 'مرقة بامية', emoji: '🍲', meals: ['غداء'], needs: ['meat', 'tomato', 'paste', 'onion', 'garlic'], prepTime: 10, cookTime: 40,
    steps: ['حمري البصل والثوم', 'ضيفي اللحم والبهارات', 'ضيفي معجون الطماطة والماء', 'ضيفي البامية', 'اطبخيها 20 دقيقة'] },
  { name: 'قيمة', emoji: '🥘', meals: ['غداء'], needs: ['meat', 'chickpeas', 'onion', 'tomato', 'spices'], prepTime: 15, cookTime: 60,
    steps: ['حمري اللحم والبصل', 'ضيفي الحمص المنقوع', 'ضيفي الماء والبهارات', 'اطبخيها ساعة', 'قدميها مع خبز أو رز'] },
  { name: 'مقلوبة باذنجان', emoji: '🍆', meals: ['غداء'], needs: ['eggplant', 'rice', 'meat', 'onion', 'spices'], prepTime: 20, cookTime: 45,
    steps: ['حمري الباذنجان', 'رتبي طبقات', 'ضيفي الماء والبهارات', 'اطبخيها 30 دقيقة', 'اقلبيها بالصحن'] },
  { name: 'طماطة محشي', emoji: '🍅', meals: ['غداء'], needs: ['tomato', 'rice', 'meat', 'onion', 'paste'], prepTime: 30, cookTime: 45,
    steps: ['فرغي الطماطة', 'حضري حشوة الرز واللحم', 'احشي الطماطة', 'رتبيها بالقدر', 'اطبخيها 30 دقيقة'] },
  { name: 'كبة حامض شلغم', emoji: '🥣', meals: ['غداء'], needs: ['meat', 'bulgur', 'onion', 'spices', 'paste'], prepTime: 60, cookTime: 40,
    steps: ['حضري عجينة الكبة', 'حضري الحشوة', 'اعملي أقراص', 'اطبخيها بمرقة الشلغم'] },

  // ========== عشاء عراقي ==========
  { name: 'شوربة عدس', emoji: '🥣', meals: ['عشاء'], needs: ['lentils', 'onion', 'carrot', 'oil', 'lemon'], prepTime: 5, cookTime: 30,
    steps: ['اغسلي العدس', 'حمري البصل والجزر', 'ضيفي العدس والماء', 'اطبخيها 25 دقيقة', 'اخلطيها بالخلاط'] },
  { name: 'معكرونة بالبشاميل', emoji: '🍝', meals: ['عشاء'], needs: ['pasta', 'meat', 'tomato', 'butter', 'cheese', 'paste'], prepTime: 20, cookTime: 40,
    steps: ['اسلقي المعكرونة', 'حضري صلصة اللحم', 'حضري البشاميل', 'رتبي طبقات', 'ادخليها الفرن 20 دقيقة'] },
  { name: 'شكشوكة', emoji: '🍳', meals: ['عشاء'], needs: ['eggs', 'tomato', 'onion', 'pepper', 'oil'], prepTime: 5, cookTime: 15,
    steps: ['حمري البصل والفلفل', 'ضيفي الطماطة', 'ضيفي البهارات', 'اكسري البيض', 'غطي 5 دقايق'] },
  { name: 'سلطة خضراء مع خبز', emoji: '🥗', meals: ['عشاء'], needs: ['cucumber', 'tomato', 'onion', 'bread', 'oil', 'lemon'], prepTime: 10, cookTime: 0,
    steps: ['قطعي الخيار والطماطة والبصل', 'ضيفي الليمون والزيت', 'قدميها مع خبز'] },
  { name: 'شوربة جزر', emoji: '🥕', meals: ['عشاء', 'فطور'], needs: ['carrot', 'onion', 'oil'], prepTime: 5, cookTime: 20,
    steps: ['قطعي الجزر والبصل', 'شوحيهم بالزيت', 'ضيفي الماء واطبخي', 'اخلطيها بالخلاط'] },

  // ========== نواشف (مع الشاي) ==========
  { name: 'كلجة', emoji: '🍪', meals: ['نواشف'], needs: ['butter', 'spices'], prepTime: 30, cookTime: 15,
    steps: ['اخلطي الطحين مع الزبدة والهيل', 'ضيفي الحليب واعجني', 'شكلي أقراص', 'اخبزيها 15 دقيقة', 'قدميها مع شاي'] },
  { name: 'بقلاوة', emoji: '🍯', meals: ['نواشف'], needs: ['butter'], prepTime: 20, cookTime: 25,
    steps: ['رتبي طبقات العجين', 'ضيفي الزبدة والمكسرات', 'اخبزيها', 'ضيفي القطر'] },
  { name: 'زلابية', emoji: '🍩', meals: ['نواشف'], needs: ['oil'], prepTime: 15, cookTime: 15,
    steps: ['حضري العجينة', 'سخني الزيت', 'اسكبي العجينة باشكال', 'اقليها', 'غطيها بالقطر'] },
  { name: 'تمر ومكسرات', emoji: '🌰', meals: ['نواشف', 'فطور'], needs: [], prepTime: 1, cookTime: 0,
    steps: ['حطي التمر والمكسرات بصحن', 'قدميها مع شاي أو قهوة'] },
  { name: 'بسكويت بالتمر', emoji: '🍪', meals: ['نواشف'], needs: ['butter'], prepTime: 20, cookTime: 15,
    steps: ['حضري العجينة', 'احشي التمر', 'اخبزيها بالفرن'] },

  // ========== حلويات ==========
  { name: 'كنافة عراقية', emoji: '🍮', meals: ['حلو'], needs: ['cream', 'butter', 'cheese'], prepTime: 20, cookTime: 30,
    steps: ['ادهني الصينية بالزبدة', 'رتبي طبقة عجين', 'ضيفي الجبن والقشطة', 'رتبي طبقة ثانية', 'اخبزيها', 'ضيفي القطر'] },
  { name: 'مهلبية', emoji: '🍮', meals: ['حلو'], needs: ['cream'], prepTime: 10, cookTime: 15,
    steps: ['اخلطي الحليب مع النشاء', 'اطبخي على نار هادية', 'ضيفي السكر وماء الورد', 'صبها بأكواب', 'زينيها بالفستق'] },

];


export { SWEET_INGREDIENTS } from './sweetPresets';

export { BREAKFAST_INGREDIENTS } from './breakfastPresets';

export { SNACK_INGREDIENTS } from './snackPresets';
