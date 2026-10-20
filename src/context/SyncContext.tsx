import { addNetworkStateListener, getNetworkStateAsync, type NetworkState } from 'expo-network';
import { useSQLiteContext } from 'expo-sqlite';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { describeApiError } from '@/api/client';
import type { Message } from '@/i18n';
import { syncWithMockApi } from '@/sync/syncEngine';

type SyncContextValue = {
  // null = chưa biết (đang kiểm tra mạng lúc mở app)
  online: boolean | null;
  syncing: boolean;
  // Lỗi của lần đồng bộ gần nhất (sẽ tự thử lại); undefined = lần gần nhất thành công
  error?: Message;
  // Tăng sau mỗi lần đồng bộ để dữ liệu trên màn hình được đọc lại từ SQLite
  revision: number;
  requestSync: () => Promise<void>;
};

// Đồng bộ lỗi thì tự thử lại sau 5, 10, 20 giây, sau đó mỗi 30 giây (khi vẫn có mạng)
const RETRY_DELAYS = [5000, 10000, 20000, 30000];
// Số lượt chạy liền nhau tối đa trong một lần đồng bộ
const MAX_ROUNDS = 5;

const SyncContext = createContext<SyncContextValue | null>(null);

// Tự động đồng bộ SQLite ↔ MockAPI, người dùng không phải bấm nút "Đồng bộ":
// khi mở app, khi thiết bị có Internet trở lại, và sau mỗi lần thêm/sửa/xóa
export function SyncProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [online, setOnline] = useState<boolean | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<Message>();
  // Số lần đồng bộ lỗi liên tiếp (0 = lần gần nhất thành công)
  const [failures, setFailures] = useState(0);
  const [revision, setRevision] = useState(0);
  // Các giá trị đọc trong hàm bất đồng bộ để dùng ref (đổi giá trị không cần vẽ lại màn hình)
  const onlineRef = useRef(false);
  const runningRef = useRef<Promise<void> | null>(null);
  const againRef = useRef(false);

  const requestSync = useCallback((): Promise<void> => {
    // Mất mạng: thay đổi đã nằm trong SQLite, có mạng lại sẽ tự đồng bộ
    if (!onlineRef.current) return Promise.resolve();
    // Đang đồng bộ thì chạy thêm một lượt ngay sau lượt hiện tại để gửi nốt thay đổi mới
    if (runningRef.current) {
      againRef.current = true;
      return runningRef.current;
    }
    const run = (async () => {
      setSyncing(true);
      try {
        let rounds = 0;
        do {
          againRef.current = false;
          if (await syncWithMockApi(db)) againRef.current = true;
          rounds += 1;
        } while (againRef.current && onlineRef.current && rounds < MAX_ROUNDS);
        setError(undefined);
        setFailures(0);
      } catch (err) {
        // Lỗi mạng hoặc MockAPI: dữ liệu chưa gửi vẫn nằm trong SQLite, effect bên dưới hẹn giờ thử lại
        setError(describeApiError(err));
        setFailures((count) => count + 1);
      } finally {
        runningRef.current = null;
        setSyncing(false);
        setRevision((value) => value + 1);
      }
    })();
    runningRef.current = run;
    return run;
  }, [db]);

  // Đồng bộ lỗi mà vẫn có mạng: hẹn giờ thử lại; mất mạng thì hủy hẹn giờ
  useEffect(() => {
    if (failures === 0 || !online) return;
    const delay = RETRY_DELAYS[Math.min(failures, RETRY_DELAYS.length) - 1];
    const timer = setTimeout(() => void requestSync(), delay);
    return () => clearTimeout(timer);
  }, [failures, online, requestSync]);

  // Theo dõi trạng thái mạng của thiết bị (expo-network)
  useEffect(() => {
    const update = ({ isConnected, isInternetReachable }: NetworkState) => {
      // Có kết nối và ra được Internet (hệ điều hành không báo được thì coi như ra được)
      const isOnline = isConnected === true && isInternetReachable !== false;
      const cameOnline = isOnline && !onlineRef.current;
      onlineRef.current = isOnline;
      setOnline(isOnline);
      // Vừa có mạng trở lại (hoặc mở app khi đang có mạng): tự đồng bộ
      if (cameOnline) void requestSync();
    };
    getNetworkStateAsync().then(update, () => update({ isConnected: true }));
    const subscription = addNetworkStateListener(update);
    return () => subscription.remove();
  }, [requestSync]);

  const value = useMemo(
    () => ({ online, syncing, error, revision, requestSync }),
    [online, syncing, error, revision, requestSync],
  );
  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync() {
  const value = useContext(SyncContext);
  if (!value) throw new Error('useSync must be used inside SyncProvider');
  return value;
}
