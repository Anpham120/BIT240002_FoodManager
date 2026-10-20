import type { SyncStatus } from '@/types';

// Quy định đặt tên theo MSSV: tên project, file CSDL, tên bảng (Table) và tên trường dữ liệu đều có tiền tố BIT240002_.
// Tên bảng và tên trường giống nhau ở SQLite (bảng, cột) và MockAPI (resource, trường JSON).

export const MSSV = 'BIT240002';
// Tên project, hiện ở đầu màn hình danh sách
export const PROJECT_NAME = `${MSSV}_FoodManager`;
// File CSDL SQLite trên máy
export const DATABASE_NAME = `${PROJECT_NAME}.db`;

// Bảng loại món, bảng món ăn và bảng ảnh của món (1 loại - n món, 1 món - n ảnh).
// Ràng buộc kiểm tra lại dữ liệu ở mức CSDL: tên không rỗng, giá > 0, thời gian chế biến > 0, loại món phải tồn tại.
export const CREATE_TABLES = `
CREATE TABLE IF NOT EXISTS BIT240002_DishCategory (
  BIT240002_Id TEXT PRIMARY KEY NOT NULL,
  BIT240002_Name TEXT NOT NULL CHECK (length(trim(BIT240002_Name)) > 0),
  BIT240002_Description TEXT NOT NULL DEFAULT '',
  BIT240002_UpdatedAt INTEGER NOT NULL,
  BIT240002_SyncStatus TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS BIT240002_Dish (
  BIT240002_Id TEXT PRIMARY KEY NOT NULL,
  BIT240002_Name TEXT NOT NULL CHECK (length(trim(BIT240002_Name)) > 0),
  BIT240002_Price INTEGER NOT NULL CHECK (BIT240002_Price > 0),
  BIT240002_PreparationTime INTEGER NOT NULL CHECK (BIT240002_PreparationTime > 0),
  BIT240002_IsAvailable INTEGER NOT NULL DEFAULT 1,
  BIT240002_Description TEXT NOT NULL DEFAULT '',
  -- Không có ON DELETE: SQLite từ chối xóa loại món khi còn món tham chiếu tới
  BIT240002_DishCategoryId TEXT NOT NULL REFERENCES BIT240002_DishCategory (BIT240002_Id),
  BIT240002_UpdatedAt INTEGER NOT NULL,
  BIT240002_SyncStatus TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS BIT240002_DishImage (
  BIT240002_Id INTEGER PRIMARY KEY AUTOINCREMENT,
  -- Xóa hẳn món thì ảnh của món bị xóa theo
  BIT240002_DishId TEXT NOT NULL REFERENCES BIT240002_Dish (BIT240002_Id) ON DELETE CASCADE,
  BIT240002_ImageUrl TEXT NOT NULL,
  BIT240002_IsThumbnail INTEGER NOT NULL DEFAULT 0,
  UNIQUE (BIT240002_DishId, BIT240002_ImageUrl)
);

-- Mỗi món có tối đa 1 ảnh đại diện (IsThumbnail = 1)
CREATE UNIQUE INDEX IF NOT EXISTS BIT240002_DishImage_OneThumbnail
  ON BIT240002_DishImage (BIT240002_DishId) WHERE BIT240002_IsThumbnail = 1;
`;

// Bản ghi loại món: một dòng bảng BIT240002_DishCategory, cũng là JSON gửi lên resource BIT240002_DishCategory
export type CategoryRecord = {
  // Id do app tự sinh, giống nhau ở SQLite và MockAPI
  BIT240002_Id: string;
  BIT240002_Name: string;
  BIT240002_Description: string;
  // Thời điểm sửa lần cuối (ms): khi đồng bộ, bản sửa sau thắng. 0 = dữ liệu mẫu chưa sửa lần nào
  BIT240002_UpdatedAt: number;
};

// Ảnh của món khi gửi lên MockAPI: phần tử của mảng BIT240002_DishImage nằm trong bản ghi món
export type DishImageRecord = {
  BIT240002_ImageUrl: string;
  BIT240002_IsThumbnail: boolean;
};

// Bản ghi món ăn gửi lên resource BIT240002_Dish
export type DishRecord = {
  BIT240002_Id: string;
  BIT240002_Name: string;
  BIT240002_Price: number;
  BIT240002_PreparationTime: number;
  BIT240002_IsAvailable: boolean;
  BIT240002_Description: string;
  BIT240002_DishCategoryId: string;
  BIT240002_DishImage: DishImageRecord[];
  BIT240002_UpdatedAt: number;
};

// Dòng đọc từ các bảng SQLite (boolean lưu dạng 0/1, thêm cột trạng thái đồng bộ)
export type CategoryRow = CategoryRecord & {
  BIT240002_SyncStatus: SyncStatus;
};

export type DishRow = {
  BIT240002_Id: string;
  BIT240002_Name: string;
  BIT240002_Price: number;
  BIT240002_PreparationTime: number;
  BIT240002_IsAvailable: number;
  BIT240002_Description: string;
  BIT240002_DishCategoryId: string;
  BIT240002_UpdatedAt: number;
  BIT240002_SyncStatus: SyncStatus;
};

export type DishImageRow = {
  BIT240002_Id: number;
  BIT240002_DishId: string;
  BIT240002_ImageUrl: string;
  BIT240002_IsThumbnail: number;
};
