import type { SQLiteDatabase } from 'expo-sqlite';

import type { DishCategory, DishCategoryInput } from '@/types';

import { newId, writeTransaction } from './database';
import type { CategoryRecord, CategoryRow } from './schema';

// Đọc/ghi bảng BIT240002_DishCategory

function toCategory(row: CategoryRow): DishCategory {
  return {
    id: row.BIT240002_Id,
    name: row.BIT240002_Name,
    description: row.BIT240002_Description,
    syncStatus: row.BIT240002_SyncStatus,
  };
}

// Các loại món hiện có (bỏ các loại đã xóa đang chờ đồng bộ), xếp theo tên
export async function getCategories(db: SQLiteDatabase): Promise<DishCategory[]> {
  const rows = await db.getAllAsync<CategoryRow>(
    `SELECT * FROM BIT240002_DishCategory
     WHERE BIT240002_SyncStatus <> 'deleted'
     ORDER BY BIT240002_Name COLLATE NOCASE`,
  );
  return rows.map(toCategory);
}

// Thêm loại món mới với trạng thái pending (chờ gửi lên MockAPI)
export async function insertCategory(db: SQLiteDatabase, id: string, input: DishCategoryInput, updatedAt: number) {
  await db.runAsync(
    `INSERT INTO BIT240002_DishCategory
       (BIT240002_Id, BIT240002_Name, BIT240002_Description, BIT240002_UpdatedAt, BIT240002_SyncStatus)
     VALUES (?, ?, ?, ?, 'pending')`,
    id,
    input.name,
    input.description,
    updatedAt,
  );
}

// Thêm (id = undefined) hoặc sửa loại món. Trả về false nếu loại cần sửa không còn tồn tại
export async function saveCategory(db: SQLiteDatabase, id: string | undefined, input: DishCategoryInput) {
  let saved = true;
  await writeTransaction(db, async () => {
    if (!id) {
      await insertCategory(db, newId(), input, Date.now());
      return;
    }
    const result = await db.runAsync(
      `UPDATE BIT240002_DishCategory
       SET BIT240002_Name = ?, BIT240002_Description = ?, BIT240002_UpdatedAt = ?, BIT240002_SyncStatus = 'pending'
       WHERE BIT240002_Id = ? AND BIT240002_SyncStatus <> 'deleted'`,
      input.name,
      input.description,
      Date.now(),
      id,
    );
    saved = result.changes > 0;
  });
  return saved;
}

// Xóa loại món; không cho xóa loại đang có món sử dụng.
// Trả về số món đang dùng loại này: 0 = đã xóa, lớn hơn 0 = không xóa
export async function deleteCategory(db: SQLiteDatabase, id: string): Promise<number> {
  let usedBy = 0;
  await writeTransaction(db, async () => {
    const row = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) AS count FROM BIT240002_Dish
       WHERE BIT240002_DishCategoryId = ? AND BIT240002_SyncStatus <> 'deleted'`,
      id,
    );
    usedBy = row?.count ?? 0;
    if (usedBy > 0) return;
    // Chưa xóa hẳn: đánh dấu deleted để lần đồng bộ sau xóa trên MockAPI rồi mới xóa khỏi SQLite
    await db.runAsync(
      `UPDATE BIT240002_DishCategory SET BIT240002_SyncStatus = 'deleted', BIT240002_UpdatedAt = ?
       WHERE BIT240002_Id = ?`,
      Date.now(),
      id,
    );
  });
  return usedBy;
}

// ---- Dùng cho đồng bộ (src/sync/syncEngine.ts). Các hàm ghi không tự mở transaction: syncEngine gọi chúng trong writeTransaction

// Các loại món thêm/sửa trên máy chưa gửi lên MockAPI, ở dạng bản ghi gửi đi
export async function getPendingCategoryRecords(db: SQLiteDatabase): Promise<CategoryRecord[]> {
  const rows = await db.getAllAsync<CategoryRow>(
    `SELECT * FROM BIT240002_DishCategory WHERE BIT240002_SyncStatus = 'pending'`,
  );
  return rows.map((row) => ({
    BIT240002_Id: row.BIT240002_Id,
    BIT240002_Name: row.BIT240002_Name,
    BIT240002_Description: row.BIT240002_Description,
    BIT240002_UpdatedAt: row.BIT240002_UpdatedAt,
  }));
}

export async function getDeletedCategoryIds(db: SQLiteDatabase): Promise<string[]> {
  const rows = await db.getAllAsync<{ BIT240002_Id: string }>(
    `SELECT BIT240002_Id FROM BIT240002_DishCategory WHERE BIT240002_SyncStatus = 'deleted'`,
  );
  return rows.map((row) => row.BIT240002_Id);
}

// Đã gửi xong: chỉ đổi sang synced nếu trong lúc gửi người dùng không sửa thêm (UpdatedAt vẫn như cũ)
export async function markCategorySynced(db: SQLiteDatabase, record: CategoryRecord) {
  await db.runAsync(
    `UPDATE BIT240002_DishCategory SET BIT240002_SyncStatus = 'synced'
     WHERE BIT240002_Id = ? AND BIT240002_UpdatedAt = ? AND BIT240002_SyncStatus = 'pending'`,
    record.BIT240002_Id,
    record.BIT240002_UpdatedAt,
  );
}

// Đã xóa trên MockAPI: xóa hẳn khỏi SQLite (nếu trên máy còn món tham chiếu tới thì để lần đồng bộ sau)
export async function purgeDeletedCategory(db: SQLiteDatabase, id: string) {
  await db.runAsync(
    `DELETE FROM BIT240002_DishCategory
     WHERE BIT240002_Id = ? AND BIT240002_SyncStatus = 'deleted'
       AND NOT EXISTS (SELECT 1 FROM BIT240002_Dish WHERE BIT240002_DishCategoryId = ?)`,
    id,
    id,
  );
}

// Id mọi loại món đang có trong SQLite: món kéo về từ MockAPI phải thuộc một trong các loại này
export async function getCategoryIds(db: SQLiteDatabase): Promise<Set<string>> {
  const rows = await db.getAllAsync<{ BIT240002_Id: string }>(`SELECT BIT240002_Id FROM BIT240002_DishCategory`);
  return new Set(rows.map((row) => row.BIT240002_Id));
}

// Trên MockAPI vẫn còn món dùng loại này (thêm từ nơi khác) nên không xóa: khôi phục loại món trên máy
export async function restoreDeletedCategory(db: SQLiteDatabase, id: string) {
  await db.runAsync(
    `UPDATE BIT240002_DishCategory SET BIT240002_SyncStatus = 'synced'
     WHERE BIT240002_Id = ? AND BIT240002_SyncStatus = 'deleted'`,
    id,
  );
}

// Chép bản ghi từ MockAPI xuống: thêm nếu chưa có, ghi đè nếu bản trên máy không có thay đổi chờ gửi
export async function applyRemoteCategory(db: SQLiteDatabase, record: CategoryRecord) {
  await db.runAsync(
    `INSERT INTO BIT240002_DishCategory
       (BIT240002_Id, BIT240002_Name, BIT240002_Description, BIT240002_UpdatedAt, BIT240002_SyncStatus)
     VALUES (?, ?, ?, ?, 'synced')
     ON CONFLICT (BIT240002_Id) DO UPDATE SET
       BIT240002_Name = excluded.BIT240002_Name,
       BIT240002_Description = excluded.BIT240002_Description,
       BIT240002_UpdatedAt = excluded.BIT240002_UpdatedAt
     WHERE BIT240002_DishCategory.BIT240002_SyncStatus = 'synced'`,
    record.BIT240002_Id,
    record.BIT240002_Name,
    record.BIT240002_Description,
    record.BIT240002_UpdatedAt,
  );
}

// Loại món đã đồng bộ nhưng không còn trên MockAPI (bị xóa ở nơi khác): xóa khỏi máy.
// Loại vẫn còn món trên máy dùng thì giữ lại và đánh dấu gửi lại lên MockAPI.
// MockAPI trả danh sách rỗng (có thể do sai địa chỉ) thì không xóa gì, gửi lại toàn bộ cho chắc.
// Trả về số loại món được đánh dấu gửi lại
export async function removeCategoriesMissingRemotely(db: SQLiteDatabase, remoteIds: string[]): Promise<number> {
  const now = Date.now();
  if (remoteIds.length === 0) {
    const result = await db.runAsync(
      `UPDATE BIT240002_DishCategory SET BIT240002_SyncStatus = 'pending' WHERE BIT240002_SyncStatus = 'synced'`,
    );
    return result.changes;
  }
  const marks = remoteIds.map(() => '?').join(', ');
  const requeued = await db.runAsync(
    `UPDATE BIT240002_DishCategory SET BIT240002_SyncStatus = 'pending', BIT240002_UpdatedAt = ?
     WHERE BIT240002_SyncStatus = 'synced' AND BIT240002_Id NOT IN (${marks})
       AND EXISTS (SELECT 1 FROM BIT240002_Dish WHERE BIT240002_DishCategoryId = BIT240002_DishCategory.BIT240002_Id)`,
    now,
    ...remoteIds,
  );
  await db.runAsync(
    `DELETE FROM BIT240002_DishCategory WHERE BIT240002_SyncStatus = 'synced' AND BIT240002_Id NOT IN (${marks})`,
    ...remoteIds,
  );
  return requeued.changes;
}
