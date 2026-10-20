import type { SQLiteDatabase } from 'expo-sqlite';

import { isNotFound } from '@/api/client';
import {
  categoryApi,
  dishApi,
  keyOf,
  parseCategory,
  parseDish,
  type RemoteRecord,
  type RemoteResource,
} from '@/api/mockApi';
import {
  applyRemoteCategory,
  getCategoryIds,
  getDeletedCategoryIds,
  getPendingCategoryRecords,
  markCategorySynced,
  purgeDeletedCategory,
  removeCategoriesMissingRemotely,
  restoreDeletedCategory,
} from '@/db/categories';
import { writeTransaction } from '@/db/database';
import {
  applyRemoteDish,
  getDeletedDishIds,
  getPendingDishRecords,
  markDishSynced,
  purgeDeletedDish,
  removeDishesMissingRemotely,
} from '@/db/dishes';

// Đồng bộ hai chiều SQLite ↔ MockAPI. Mỗi bản ghi có BIT240002_Id do app sinh, giống nhau ở hai nơi,
// nên luôn tìm được bản tương ứng trên MockAPI: chưa có mới tạo, có rồi thì sửa, không bao giờ tạo trùng.

type SyncRecord = { BIT240002_Id: string; BIT240002_UpdatedAt: number };

function indexByKey(records: RemoteRecord[]): Map<string, RemoteRecord> {
  return new Map(records.map((record) => [keyOf(record), record]));
}

// PUT; nếu bản ghi vừa bị xóa trên MockAPI (sau lúc tải danh sách) thì tạo lại vì người dùng vừa sửa nó
async function updateOrCreate<T>(api: RemoteResource<T>, remoteId: string, record: T) {
  try {
    await api.update(remoteId, record);
  } catch (error) {
    if (!isNotFound(error)) throw error;
    await api.create(record);
  }
}

// Gửi các bản ghi thêm/sửa trên máy (pending) lên MockAPI rồi đánh dấu synced
async function pushPending<T extends SyncRecord>(
  records: T[],
  remote: RemoteRecord[],
  api: RemoteResource<T>,
  markSynced: (record: T) => Promise<void>,
) {
  const remoteByKey = indexByKey(remote);
  for (const record of records) {
    const existing = remoteByKey.get(record.BIT240002_Id);
    if (!existing) {
      // Dữ liệu mẫu chưa sửa (UpdatedAt = 0) chỉ gửi khi MockAPI còn trống:
      // cài lại app không làm sống lại bản ghi mẫu đã bị xóa trên MockAPI
      if (record.BIT240002_UpdatedAt > 0 || remote.length === 0) await api.create(record);
    } else if (record.BIT240002_UpdatedAt > (Number(existing.BIT240002_UpdatedAt) || 0)) {
      // Bản trên máy sửa sau bản trên MockAPI thì ghi đè lên MockAPI
      await updateOrCreate(api, existing.id, record);
    }
    // Bản trên MockAPI mới hơn thì không gửi: bước kéo về sẽ chép bản đó xuống máy
    await markSynced(record);
  }
}

// Xóa trên MockAPI các bản ghi đã xóa trên máy (MockAPI không còn thì thôi), rồi xóa hẳn khỏi SQLite
async function pushDeleted<T>(
  ids: string[],
  remote: RemoteRecord[],
  api: RemoteResource<T>,
  purge: (id: string) => Promise<void>,
) {
  const remoteByKey = indexByKey(remote);
  for (const id of ids) {
    const existing = remoteByKey.get(id);
    if (existing) {
      try {
        await api.remove(existing.id);
      } catch (error) {
        if (!isNotFound(error)) throw error;
      }
    }
    await purge(id);
  }
}

// Xóa loại món: MockAPI không có khóa ngoại nên xem danh sách món mới nhất trên MockAPI,
// còn món dùng loại này (thêm từ nơi khác) thì không xóa mà khôi phục loại món trên máy
async function pushDeletedCategories(db: SQLiteDatabase, remote: RemoteRecord[]) {
  const ids = await getDeletedCategoryIds(db);
  if (ids.length === 0) return;
  const usedIds = new Set((await dishApi.list()).map((dish) => String(dish.BIT240002_DishCategoryId)));
  const removable: string[] = [];
  for (const id of ids) {
    if (usedIds.has(id)) await writeTransaction(db, () => restoreDeletedCategory(db, id));
    else removable.push(id);
  }
  await pushDeleted(removable, remote, categoryApi, (id) => writeTransaction(db, () => purgeDeletedCategory(db, id)));
}

// Chép dữ liệu mới nhất trên MockAPI xuống SQLite trong một transaction.
// Trả về true nếu có bản ghi vừa được đánh dấu gửi lại (cần đồng bộ thêm một lượt)
async function pull(db: SQLiteDatabase): Promise<boolean> {
  const [remoteCategories, remoteDishes] = await Promise.all([categoryApi.list(), dishApi.list()]);
  let requeued = 0;
  await writeTransaction(db, async () => {
    for (const remote of remoteCategories) {
      const record = parseCategory(remote);
      if (record) await applyRemoteCategory(db, record);
    }
    const categoryIds = await getCategoryIds(db);
    for (const remote of remoteDishes) {
      const record = parseDish(remote);
      // Bỏ qua món thiếu thông tin bắt buộc hoặc thuộc loại món không có trên máy
      if (record && categoryIds.has(record.BIT240002_DishCategoryId)) await applyRemoteDish(db, record);
    }
    requeued += await removeDishesMissingRemotely(db, remoteDishes.map(keyOf));
    requeued += await removeCategoriesMissingRemotely(db, remoteCategories.map(keyOf));
  });
  return requeued > 0;
}

// Một lượt đồng bộ. Lỗi mạng/MockAPI làm dừng giữa chừng thì thay đổi chưa gửi vẫn nằm trong SQLite, lượt sau gửi tiếp
export async function syncWithMockApi(db: SQLiteDatabase): Promise<boolean> {
  // 1. Tải danh sách hiện có trên MockAPI để biết bản ghi nào đã có
  const [remoteCategories, remoteDishes] = await Promise.all([categoryApi.list(), dishApi.list()]);

  // 2. Gửi thay đổi trên máy lên: loại món trước vì món tham chiếu tới loại; khi xóa thì xóa món trước rồi mới xóa loại
  await pushPending(await getPendingCategoryRecords(db), remoteCategories, categoryApi, (record) =>
    writeTransaction(db, () => markCategorySynced(db, record)),
  );
  await pushPending(await getPendingDishRecords(db), remoteDishes, dishApi, (record) =>
    writeTransaction(db, () => markDishSynced(db, record)),
  );
  await pushDeleted(await getDeletedDishIds(db), remoteDishes, dishApi, (id) =>
    writeTransaction(db, () => purgeDeletedDish(db, id)),
  );
  await pushDeletedCategories(db, remoteCategories);

  // 3. Kéo dữ liệu mới nhất trên MockAPI về máy
  return pull(db);
}
