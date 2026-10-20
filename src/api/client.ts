import type { Message } from '@/i18n';

// Địa chỉ API của project MockAPI (cần 2 resource BIT240002_DishCategory và BIT240002_Dish, xem README)
export const API_URL = 'https://6ad7277f95e98f36aef1ece8.mockapi.io/api/v1';

// Quá thời gian này mà máy chủ chưa trả lời thì báo lỗi, không chờ mãi
const TIMEOUT_MS = 15000;

// Lỗi khi gọi MockAPI
// - network: không tới được máy chủ (mất mạng, sai địa chỉ)
// - timeout: quá thời gian chờ
// - http: máy chủ trả mã lỗi (status)
export class ApiError extends Error {
  kind: 'network' | 'timeout' | 'http';
  status?: number;

  constructor(kind: 'network' | 'timeout' | 'http', status?: number) {
    super(status ? `HTTP ${status}` : kind);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

// Gọi một endpoint của MockAPI và trả về JSON đã parse; body (nếu có) được gửi lên dạng JSON
export async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    // fetch chỉ ném lỗi khi không tới được máy chủ
    throw new ApiError(timedOut ? 'timeout' : 'network');
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) throw new ApiError('http', response.status);
  return (await response.json()) as T;
}

// Lấy cả danh sách. MockAPI trả 404 "Not found" thay vì [] khi không có bản ghi nào, nên coi 404 là danh sách rỗng
export async function requestList<T>(path: string): Promise<T[]> {
  try {
    return await request<T[]>('GET', path);
  } catch (error) {
    if (isNotFound(error)) return [];
    throw error;
  }
}

export function isNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

// Câu báo lỗi (dạng khóa dịch) để hiện lên màn hình
export function describeApiError(error: unknown): Message {
  if (!(error instanceof ApiError)) return { key: 'errors.unknown' };
  if (error.kind === 'network') return { key: 'errors.network' };
  if (error.kind === 'timeout') return { key: 'errors.timeout' };
  if (error.status === 404) return { key: 'errors.apiNotFound' };
  return { key: 'errors.server', params: { status: error.status ?? 0 } };
}
