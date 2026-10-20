import type { SQLiteDatabase } from 'expo-sqlite';

import { insertCategory } from './categories';
import { insertDish } from './dishes';
import { CREATE_TABLES } from './schema';
import { SEED_CATEGORIES, SEED_DISHES } from './seed';

const DATABASE_VERSION = 1;

// Chạy mỗi lần mở app (onInit của SQLiteProvider), trước khi vẽ màn hình đầu tiên:
// bật khóa ngoại; lần đầu (user_version = 0) thì tạo bảng và thêm dữ liệu mẫu
export async function migrateDatabase(db: SQLiteDatabase) {
  // Khóa ngoại của SQLite mặc định tắt và phải bật lại mỗi lần mở kết nối
  await db.execAsync('PRAGMA foreign_keys = ON');
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  if ((row?.user_version ?? 0) >= DATABASE_VERSION) return;

  await db.execAsync('PRAGMA journal_mode = WAL');
  await db.withTransactionAsync(async () => {
    await db.execAsync(CREATE_TABLES);
    // UpdatedAt = 0 đánh dấu dữ liệu mẫu chưa sửa: chỉ gửi lên khi MockAPI còn trống (xem syncEngine)
    for (const { id, ...input } of SEED_CATEGORIES) await insertCategory(db, id, input, 0);
    for (const { id, ...input } of SEED_DISHES) await insertDish(db, id, input, 0);
  });
  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
