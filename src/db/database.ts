import type { SQLiteDatabase } from 'expo-sqlite';

// Mọi thao tác ghi SQLite xếp hàng chạy lần lượt, mỗi lượt một transaction:
// lưu của người dùng và ghi của tiến trình đồng bộ không chen vào nhau, lỗi giữa chừng thì không ghi gì cả
let writing: Promise<unknown> = Promise.resolve();

export function writeTransaction(db: SQLiteDatabase, task: () => Promise<void>): Promise<void> {
  const run = writing.then(() => db.withTransactionAsync(task));
  writing = run.catch(() => undefined);
  return run;
}

// Id do app tự sinh (thời gian + chuỗi ngẫu nhiên). Dùng chung cho SQLite và MockAPI
// nên tạo bản ghi khi offline vẫn có Id ngay, lên MockAPI không bị đổi và không bị trùng
export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// Số thay đổi trên máy chưa gửi lên MockAPI (thêm, sửa, xóa)
export async function countPendingChanges(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT
       (SELECT COUNT(*) FROM BIT240002_DishCategory WHERE BIT240002_SyncStatus <> 'synced') +
       (SELECT COUNT(*) FROM BIT240002_Dish WHERE BIT240002_SyncStatus <> 'synced') AS count`,
  );
  return row?.count ?? 0;
}
