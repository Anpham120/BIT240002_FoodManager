import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { View } from 'react-native';

import { ErrorState, LoadingState } from '@/components/StateView';
import * as categoryDb from '@/db/categories';
import { countPendingChanges } from '@/db/database';
import * as dishDb from '@/db/dishes';
import { common } from '@/styles/common';
import type { Dish, DishCategory, DishCategoryInput, DishInput } from '@/types';

import { useLanguage } from './LanguageContext';
import { useSync } from './SyncContext';

type Data = {
  categories: DishCategory[];
  dishes: Dish[];
  // Số thay đổi trên máy chưa gửi lên MockAPI
  pendingCount: number;
};

type DataContextValue = Data & {
  // Trả về false nếu bản ghi cần sửa không còn tồn tại
  saveCategory: (id: string | undefined, input: DishCategoryInput) => Promise<boolean>;
  // Trả về số món đang dùng loại này (0 = đã xóa)
  deleteCategory: (id: string) => Promise<number>;
  saveDish: (id: string | undefined, input: DishInput) => Promise<boolean>;
  deleteDish: (id: string) => Promise<void>;
};

const DataContext = createContext<DataContextValue | null>(null);

// Đọc toàn bộ dữ liệu cần hiển thị từ SQLite
async function readData(db: SQLiteDatabase): Promise<Data> {
  const [categories, dishes, pendingCount] = await Promise.all([
    categoryDb.getCategories(db),
    dishDb.getDishes(db),
    countPendingChanges(db),
  ]);
  return { categories, dishes, pendingCount };
}

// Dữ liệu dùng chung cho mọi màn hình, đọc từ SQLite.
// Luồng ghi: màn hình gọi saveDish/deleteDish/... → ghi SQLite → đọc lại để màn hình cập nhật ngay
// → yêu cầu đồng bộ lên MockAPI (mất mạng thì thay đổi nằm chờ trong SQLite)
export function DataProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const { t } = useLanguage();
  const { revision, requestSync } = useSync();
  const [data, setData] = useState<Data | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  // Tăng khi bấm "Thử lại" để đọc lại
  const [attempt, setAttempt] = useState(0);

  // Đọc khi mở app và sau mỗi lần đồng bộ (dữ liệu từ MockAPI vừa được ghi xuống SQLite)
  useEffect(() => {
    let active = true;
    readData(db).then(
      (next) => {
        if (!active) return;
        setData(next);
        setLoadFailed(false);
      },
      () => {
        if (active) setLoadFailed(true);
      },
    );
    return () => {
      active = false;
    };
  }, [db, revision, attempt]);

  // Sau khi ghi SQLite: đọc lại cho màn hình cập nhật, rồi yêu cầu đồng bộ (không chờ đồng bộ xong)
  const afterWrite = useCallback(async () => {
    setData(await readData(db));
    void requestSync();
  }, [db, requestSync]);

  const value = useMemo<DataContextValue | null>(
    () =>
      data && {
        ...data,
        saveCategory: async (id, input) => {
          const saved = await categoryDb.saveCategory(db, id, input);
          await afterWrite();
          return saved;
        },
        deleteCategory: async (id) => {
          const usedBy = await categoryDb.deleteCategory(db, id);
          if (usedBy === 0) await afterWrite();
          return usedBy;
        },
        saveDish: async (id, input) => {
          const saved = await dishDb.saveDish(db, id, input);
          await afterWrite();
          return saved;
        },
        deleteDish: async (id) => {
          await dishDb.deleteDish(db, id);
          await afterWrite();
        },
      },
    [data, db, afterWrite],
  );

  if (!value) {
    return (
      <View style={common.safeArea}>
        {loadFailed ? (
          <ErrorState
            title={t('common.loadFailedTitle')}
            message={t('errors.unknown')}
            onRetry={() => setAttempt((count) => count + 1)}
          />
        ) : (
          <LoadingState />
        )}
      </View>
    );
  }
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const value = useContext(DataContext);
  if (!value) throw new Error('useData must be used inside DataProvider');
  return value;
}
