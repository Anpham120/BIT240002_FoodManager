import type { SQLiteDatabase } from 'expo-sqlite';

import type { Dish, DishImage, DishInput } from '@/types';

import { newId, writeTransaction } from './database';
import type { DishImageRow, DishRecord, DishRow } from './schema';

// Đọc/ghi bảng BIT240002_Dish và bảng ảnh BIT240002_DishImage

// Ảnh của nhiều món, gom theo Id món; giữ đúng thứ tự đã thêm
async function getImagesByDish(db: SQLiteDatabase): Promise<Map<string, DishImage[]>> {
  const rows = await db.getAllAsync<DishImageRow>(`SELECT * FROM BIT240002_DishImage ORDER BY BIT240002_Id`);
  const byDish = new Map<string, DishImage[]>();
  for (const row of rows) {
    const images = byDish.get(row.BIT240002_DishId) ?? [];
    images.push({ imageUrl: row.BIT240002_ImageUrl, isThumbnail: row.BIT240002_IsThumbnail === 1 });
    byDish.set(row.BIT240002_DishId, images);
  }
  return byDish;
}

function toDish(row: DishRow, images: DishImage[]): Dish {
  return {
    id: row.BIT240002_Id,
    name: row.BIT240002_Name,
    price: row.BIT240002_Price,
    preparationTime: row.BIT240002_PreparationTime,
    isAvailable: row.BIT240002_IsAvailable === 1,
    description: row.BIT240002_Description,
    dishCategoryId: row.BIT240002_DishCategoryId,
    images,
    syncStatus: row.BIT240002_SyncStatus,
  };
}

// Tất cả món hiện có (bỏ các món đã xóa đang chờ đồng bộ), kèm danh sách ảnh
export async function getDishes(db: SQLiteDatabase): Promise<Dish[]> {
  const rows = await db.getAllAsync<DishRow>(`SELECT * FROM BIT240002_Dish WHERE BIT240002_SyncStatus <> 'deleted'`);
  const imagesByDish = await getImagesByDish(db);
  return rows.map((row) => toDish(row, imagesByDish.get(row.BIT240002_Id) ?? []));
}

// Thay toàn bộ ảnh của một món bằng danh sách mới (theo đúng thứ tự)
async function replaceImages(db: SQLiteDatabase, dishId: string, images: DishImage[]) {
  await db.runAsync(`DELETE FROM BIT240002_DishImage WHERE BIT240002_DishId = ?`, dishId);
  for (const image of images) {
    await db.runAsync(
      `INSERT INTO BIT240002_DishImage (BIT240002_DishId, BIT240002_ImageUrl, BIT240002_IsThumbnail) VALUES (?, ?, ?)`,
      dishId,
      image.imageUrl,
      image.isThumbnail ? 1 : 0,
    );
  }
}

// Thêm món mới với trạng thái pending (chờ gửi lên MockAPI)
export async function insertDish(db: SQLiteDatabase, id: string, input: DishInput, updatedAt: number) {
  await db.runAsync(
    `INSERT INTO BIT240002_Dish
       (BIT240002_Id, BIT240002_Name, BIT240002_Price, BIT240002_PreparationTime, BIT240002_IsAvailable,
        BIT240002_Description, BIT240002_DishCategoryId, BIT240002_UpdatedAt, BIT240002_SyncStatus)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    id,
    input.name,
    input.price,
    input.preparationTime,
    input.isAvailable ? 1 : 0,
    input.description,
    input.dishCategoryId,
    updatedAt,
  );
  await replaceImages(db, id, input.images);
}

// Thêm (id = undefined) hoặc sửa món cùng danh sách ảnh. Trả về false nếu món cần sửa không còn tồn tại
export async function saveDish(db: SQLiteDatabase, id: string | undefined, input: DishInput) {
  let saved = true;
  await writeTransaction(db, async () => {
    if (!id) {
      await insertDish(db, newId(), input, Date.now());
      return;
    }
    const result = await db.runAsync(
      `UPDATE BIT240002_Dish
       SET BIT240002_Name = ?, BIT240002_Price = ?, BIT240002_PreparationTime = ?, BIT240002_IsAvailable = ?,
           BIT240002_Description = ?, BIT240002_DishCategoryId = ?, BIT240002_UpdatedAt = ?, BIT240002_SyncStatus = 'pending'
       WHERE BIT240002_Id = ? AND BIT240002_SyncStatus <> 'deleted'`,
      input.name,
      input.price,
      input.preparationTime,
      input.isAvailable ? 1 : 0,
      input.description,
      input.dishCategoryId,
      Date.now(),
      id,
    );
    saved = result.changes > 0;
    if (saved) await replaceImages(db, id, input.images);
  });
  return saved;
}

// Xóa món: đánh dấu deleted để lần đồng bộ sau xóa trên MockAPI rồi mới xóa hẳn khỏi SQLite
export async function deleteDish(db: SQLiteDatabase, id: string) {
  await writeTransaction(db, async () => {
    await db.runAsync(
      `UPDATE BIT240002_Dish SET BIT240002_SyncStatus = 'deleted', BIT240002_UpdatedAt = ? WHERE BIT240002_Id = ?`,
      Date.now(),
      id,
    );
  });
}

// ---- Dùng cho đồng bộ (src/sync/syncEngine.ts). Các hàm ghi không tự mở transaction: syncEngine gọi chúng trong writeTransaction

// Các món thêm/sửa trên máy chưa gửi lên MockAPI, ở dạng bản ghi gửi đi (ảnh nằm trong món)
export async function getPendingDishRecords(db: SQLiteDatabase): Promise<DishRecord[]> {
  const rows = await db.getAllAsync<DishRow>(`SELECT * FROM BIT240002_Dish WHERE BIT240002_SyncStatus = 'pending'`);
  const imagesByDish = await getImagesByDish(db);
  return rows.map((row) => ({
    BIT240002_Id: row.BIT240002_Id,
    BIT240002_Name: row.BIT240002_Name,
    BIT240002_Price: row.BIT240002_Price,
    BIT240002_PreparationTime: row.BIT240002_PreparationTime,
    BIT240002_IsAvailable: row.BIT240002_IsAvailable === 1,
    BIT240002_Description: row.BIT240002_Description,
    BIT240002_DishCategoryId: row.BIT240002_DishCategoryId,
    BIT240002_DishImage: (imagesByDish.get(row.BIT240002_Id) ?? []).map((image) => ({
      BIT240002_ImageUrl: image.imageUrl,
      BIT240002_IsThumbnail: image.isThumbnail,
    })),
    BIT240002_UpdatedAt: row.BIT240002_UpdatedAt,
  }));
}

export async function getDeletedDishIds(db: SQLiteDatabase): Promise<string[]> {
  const rows = await db.getAllAsync<{ BIT240002_Id: string }>(
    `SELECT BIT240002_Id FROM BIT240002_Dish WHERE BIT240002_SyncStatus = 'deleted'`,
  );
  return rows.map((row) => row.BIT240002_Id);
}

// Đã gửi xong: chỉ đổi sang synced nếu trong lúc gửi người dùng không sửa thêm (UpdatedAt vẫn như cũ)
export async function markDishSynced(db: SQLiteDatabase, record: DishRecord) {
  await db.runAsync(
    `UPDATE BIT240002_Dish SET BIT240002_SyncStatus = 'synced'
     WHERE BIT240002_Id = ? AND BIT240002_UpdatedAt = ? AND BIT240002_SyncStatus = 'pending'`,
    record.BIT240002_Id,
    record.BIT240002_UpdatedAt,
  );
}

// Đã xóa trên MockAPI: xóa hẳn khỏi SQLite (ảnh của món tự xóa theo nhờ ON DELETE CASCADE)
export async function purgeDeletedDish(db: SQLiteDatabase, id: string) {
  await db.runAsync(`DELETE FROM BIT240002_Dish WHERE BIT240002_Id = ? AND BIT240002_SyncStatus = 'deleted'`, id);
}

// Chép bản ghi từ MockAPI xuống: thêm nếu chưa có, ghi đè nếu bản trên máy không có thay đổi chờ gửi.
// Loại món của bản ghi phải có trên máy (syncEngine đã kiểm tra trước khi gọi)
export async function applyRemoteDish(db: SQLiteDatabase, record: DishRecord) {
  const result = await db.runAsync(
    `INSERT INTO BIT240002_Dish
       (BIT240002_Id, BIT240002_Name, BIT240002_Price, BIT240002_PreparationTime, BIT240002_IsAvailable,
        BIT240002_Description, BIT240002_DishCategoryId, BIT240002_UpdatedAt, BIT240002_SyncStatus)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'synced')
     ON CONFLICT (BIT240002_Id) DO UPDATE SET
       BIT240002_Name = excluded.BIT240002_Name,
       BIT240002_Price = excluded.BIT240002_Price,
       BIT240002_PreparationTime = excluded.BIT240002_PreparationTime,
       BIT240002_IsAvailable = excluded.BIT240002_IsAvailable,
       BIT240002_Description = excluded.BIT240002_Description,
       BIT240002_DishCategoryId = excluded.BIT240002_DishCategoryId,
       BIT240002_UpdatedAt = excluded.BIT240002_UpdatedAt
     WHERE BIT240002_Dish.BIT240002_SyncStatus = 'synced'`,
    record.BIT240002_Id,
    record.BIT240002_Name,
    record.BIT240002_Price,
    record.BIT240002_PreparationTime,
    record.BIT240002_IsAvailable ? 1 : 0,
    record.BIT240002_Description,
    record.BIT240002_DishCategoryId,
    record.BIT240002_UpdatedAt,
  );
  if (result.changes === 0) return;
  await replaceImages(
    db,
    record.BIT240002_Id,
    record.BIT240002_DishImage.map((image) => ({
      imageUrl: image.BIT240002_ImageUrl,
      isThumbnail: image.BIT240002_IsThumbnail,
    })),
  );
}

// Món đã đồng bộ nhưng không còn trên MockAPI (bị xóa ở nơi khác): xóa khỏi máy.
// MockAPI trả danh sách rỗng (có thể do sai địa chỉ) thì không xóa gì, đánh dấu gửi lại toàn bộ cho chắc.
// Trả về số món được đánh dấu gửi lại
export async function removeDishesMissingRemotely(db: SQLiteDatabase, remoteIds: string[]): Promise<number> {
  if (remoteIds.length === 0) {
    const result = await db.runAsync(
      `UPDATE BIT240002_Dish SET BIT240002_SyncStatus = 'pending' WHERE BIT240002_SyncStatus = 'synced'`,
    );
    return result.changes;
  }
  const marks = remoteIds.map(() => '?').join(', ');
  await db.runAsync(
    `DELETE FROM BIT240002_Dish WHERE BIT240002_SyncStatus = 'synced' AND BIT240002_Id NOT IN (${marks})`,
    ...remoteIds,
  );
  return 0;
}
