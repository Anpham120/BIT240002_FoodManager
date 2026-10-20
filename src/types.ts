// Model dùng trong code TypeScript (tên thuộc tính theo quy ước camelCase).
// Khi lưu vào SQLite và gửi lên MockAPI, mỗi thuộc tính đổi sang tên có tiền tố MSSV: xem src/db/schema.ts

// Trạng thái đồng bộ của một bản ghi trong SQLite so với MockAPI
// - synced: giống bản trên MockAPI
// - pending: mới thêm hoặc sửa trên máy, chưa gửi lên MockAPI
// - deleted: đã xóa trên máy, chờ xóa trên MockAPI rồi mới xóa hẳn khỏi SQLite
export type SyncStatus = 'synced' | 'pending' | 'deleted';

// Loại món ăn
export type DishCategory = {
  id: string;
  name: string;
  description: string;
  syncStatus: SyncStatus;
};

// Một ảnh của món ăn; mỗi món có tối đa 1 ảnh isThumbnail = true (ảnh đại diện)
export type DishImage = {
  imageUrl: string;
  isThumbnail: boolean;
};

// Món ăn; mỗi món thuộc đúng một loại qua dishCategoryId = DishCategory.id, có thể có nhiều ảnh
export type Dish = {
  id: string;
  name: string;
  // Giá bán (VNĐ)
  price: number;
  // Thời gian chế biến (phút)
  preparationTime: number;
  // true = đang bán, false = ngừng bán
  isAvailable: boolean;
  description: string;
  dishCategoryId: string;
  images: DishImage[];
  syncStatus: SyncStatus;
};

// Dữ liệu form gửi xuống tầng lưu trữ khi thêm/sửa; id và trạng thái đồng bộ do tầng lưu trữ quản lý
export type DishCategoryInput = Pick<DishCategory, 'name' | 'description'>;
export type DishInput = Omit<Dish, 'id' | 'syncStatus'>;
