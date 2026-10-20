import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';

import { DataProvider } from '@/context/DataContext';
import { FilterProvider } from '@/context/FilterContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { SyncProvider } from '@/context/SyncContext';
import { migrateDatabase } from '@/db/migrate';
import { DATABASE_NAME } from '@/db/schema';

// Khi chạy bằng Expo Go mà tắt mạng, Expo Go báo mất kết nối tới máy chạy Metro (chỉ có lúc phát triển,
// không phải lỗi của app); ẩn đi để thông báo này không che các nút khi demo chế độ offline
LogBox.ignoreLogs(['Cannot connect to Expo CLI']);

// Gốc ứng dụng: mở CSDL SQLite (tạo bảng + dữ liệu mẫu lần đầu), rồi bọc mọi màn hình bằng
// ngôn ngữ → đồng bộ MockAPI → dữ liệu → bộ lọc danh sách
export default function RootLayout() {
  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDatabase}>
      <LanguageProvider>
        <SyncProvider>
          <DataProvider>
            <FilterProvider>
              <StatusBar style="dark" />
              {/* Ẩn header mặc định, mỗi màn hình tự vẽ tiêu đề, nút quay lại và nút đổi ngôn ngữ */}
              <Stack screenOptions={{ headerShown: false }} />
            </FilterProvider>
          </DataProvider>
        </SyncProvider>
      </LanguageProvider>
    </SQLiteProvider>
  );
}
