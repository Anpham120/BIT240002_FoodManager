import type { DishCategoryInput, DishInput } from '@/types';

// Dữ liệu mẫu tạo khi mở app lần đầu: 3 loại món, 5 món ăn (món "Gỏi gà" đang ngừng bán).
// Id cố định để cài lại app hoặc chạy trên máy khác vẫn khớp đúng bản ghi trên MockAPI, không sinh bản ghi trùng.

const IMAGE = {
  pho: 'https://www.themealdb.com/images/media/meals/pbzcrx1763765096.jpg',
  noodleSoup: 'https://www.themealdb.com/images/media/meals/ikizdm1763760862.jpg',
  grilledPork: 'https://www.themealdb.com/images/media/meals/qqwypw1504642429.jpg',
  noodleSalad: 'https://www.themealdb.com/images/media/meals/zry07j1763779321.jpg',
  rollsWraps: 'https://www.themealdb.com/images/media/meals/prrirc1763781360.jpg',
  rollsPrawn: 'https://www.themealdb.com/images/media/meals/9r2xrg1763771238.jpg',
  chickenSalad: 'https://www.themealdb.com/images/media/meals/pk8wtn1763758591.jpg',
  icedCoffee: 'https://www.thecocktaildb.com/images/media/drink/rqpypv1441245650.jpg',
  coffeeGlass: 'https://www.thecocktaildb.com/images/media/drink/ytprxy1454513855.jpg',
};

export const SEED_CATEGORIES: (DishCategoryInput & { id: string })[] = [
  { id: 'category-main', name: 'Món chính', description: 'Cơm, bún, phở ăn no' },
  { id: 'category-starter', name: 'Khai vị', description: 'Gỏi, cuốn và món ăn nhẹ' },
  { id: 'category-drink', name: 'Đồ uống', description: 'Cà phê, trà và nước giải khát' },
];

export const SEED_DISHES: (DishInput & { id: string })[] = [
  {
    id: 'dish-pho-bo',
    name: 'Phở bò',
    price: 55000,
    preparationTime: 15,
    isAvailable: true,
    description: 'Bánh phở, thịt bò tái chín, nước dùng hầm xương.',
    dishCategoryId: 'category-main',
    images: [
      { imageUrl: IMAGE.pho, isThumbnail: true },
      { imageUrl: IMAGE.noodleSoup, isThumbnail: false },
    ],
  },
  {
    id: 'dish-bun-thit-nuong',
    name: 'Bún thịt nướng',
    price: 50000,
    preparationTime: 20,
    isAvailable: true,
    description: 'Bún tươi, thịt heo nướng than, rau sống và nước mắm chua ngọt.',
    dishCategoryId: 'category-main',
    images: [
      { imageUrl: IMAGE.grilledPork, isThumbnail: true },
      { imageUrl: IMAGE.noodleSalad, isThumbnail: false },
    ],
  },
  {
    id: 'dish-goi-cuon',
    name: 'Gỏi cuốn',
    price: 35000,
    preparationTime: 10,
    isAvailable: true,
    description: 'Bánh tráng cuốn tôm, thịt, bún và rau thơm, chấm tương đậu phộng.',
    dishCategoryId: 'category-starter',
    images: [
      { imageUrl: IMAGE.rollsPrawn, isThumbnail: false },
      { imageUrl: IMAGE.rollsWraps, isThumbnail: true },
    ],
  },
  {
    id: 'dish-goi-ga',
    name: 'Gỏi gà',
    price: 45000,
    preparationTime: 25,
    isAvailable: false,
    description: 'Gà xé trộn bắp cải, hành tây và rau răm.',
    dishCategoryId: 'category-starter',
    images: [{ imageUrl: IMAGE.chickenSalad, isThumbnail: true }],
  },
  {
    id: 'dish-ca-phe-sua-da',
    name: 'Cà phê sữa đá',
    price: 25000,
    preparationTime: 5,
    isAvailable: true,
    description: 'Cà phê phin pha sữa đặc, thêm đá.',
    dishCategoryId: 'category-drink',
    images: [
      { imageUrl: IMAGE.icedCoffee, isThumbnail: true },
      { imageUrl: IMAGE.coffeeGlass, isThumbnail: false },
    ],
  },
];
