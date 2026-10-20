import type { CategoryRecord, DishImageRecord, DishRecord } from '@/db/schema';

import { request, requestList } from './client';

// Bản ghi đọc về từ MockAPI: có thêm trường id do MockAPI tự sinh (dùng trong URL sửa/xóa).
// Dữ liệu có thể bị sửa tay trên trang MockAPI nên chưa chắc đúng kiểu, phải kiểm tra trước khi ghi vào SQLite
export type RemoteRecord = { id: string } & Record<string, unknown>;

export type RemoteResource<T> = {
  list: () => Promise<RemoteRecord[]>;
  create: (record: T) => Promise<RemoteRecord>;
  update: (remoteId: string, record: T) => Promise<RemoteRecord>;
  remove: (remoteId: string) => Promise<RemoteRecord>;
};

// Các endpoint MockAPI sinh cho một resource: GET/POST /resource, PUT/DELETE /resource/{id}
function resource<T>(path: string): RemoteResource<T> {
  return {
    list: () => requestList<RemoteRecord>(path),
    create: (record) => request<RemoteRecord>('POST', path, record),
    update: (remoteId, record) => request<RemoteRecord>('PUT', `${path}/${remoteId}`, record),
    remove: (remoteId) => request<RemoteRecord>('DELETE', `${path}/${remoteId}`),
  };
}

// Hai resource trên MockAPI, đặt tên giống bảng SQLite (có tiền tố MSSV)
export const categoryApi = resource<CategoryRecord>('/BIT240002_DishCategory');
export const dishApi = resource<DishRecord>('/BIT240002_Dish');

// Khóa để ghép bản ghi MockAPI với bản ghi trên máy: BIT240002_Id do app sinh.
// Bản ghi tạo tay trên trang MockAPI có thể thiếu trường này thì dùng tạm id của MockAPI
export function keyOf(record: RemoteRecord): string {
  const id = record.BIT240002_Id;
  return typeof id === 'string' && id.trim() ? id : String(record.id);
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function positiveNumber(value: unknown): number | undefined {
  const number = typeof value === 'string' ? Number(value) : value;
  return typeof number === 'number' && Number.isFinite(number) && number > 0 ? number : undefined;
}

function isTrue(value: unknown): boolean {
  return value === true || value === 1 || value === 'true';
}

// Bản ghi loại món hợp lệ (tên không rỗng); không hợp lệ thì bỏ qua
export function parseCategory(remote: RemoteRecord): CategoryRecord | undefined {
  const name = text(remote.BIT240002_Name);
  if (!name) return undefined;
  return {
    BIT240002_Id: keyOf(remote),
    BIT240002_Name: name,
    BIT240002_Description: text(remote.BIT240002_Description),
    BIT240002_UpdatedAt: positiveNumber(remote.BIT240002_UpdatedAt) ?? 0,
  };
}

// Danh sách ảnh hợp lệ: bỏ link rỗng và link trùng, chỉ giữ tối đa 1 ảnh đại diện
function parseImages(value: unknown): DishImageRecord[] {
  if (!Array.isArray(value)) return [];
  const images: DishImageRecord[] = [];
  for (const item of value) {
    const url = text((item as Record<string, unknown> | null)?.BIT240002_ImageUrl);
    if (!url || images.some((image) => image.BIT240002_ImageUrl === url)) continue;
    const thumbnail = isTrue((item as Record<string, unknown>).BIT240002_IsThumbnail);
    images.push({
      BIT240002_ImageUrl: url,
      BIT240002_IsThumbnail: thumbnail && !images.some((image) => image.BIT240002_IsThumbnail),
    });
  }
  return images;
}

// Bản ghi món hợp lệ (tên không rỗng, giá > 0, thời gian chế biến > 0, có loại món); không hợp lệ thì bỏ qua
export function parseDish(remote: RemoteRecord): DishRecord | undefined {
  const name = text(remote.BIT240002_Name);
  // Giá (VNĐ) và thời gian chế biến (phút) là số nguyên
  const price = Math.round(positiveNumber(remote.BIT240002_Price) ?? 0);
  const preparationTime = Math.round(positiveNumber(remote.BIT240002_PreparationTime) ?? 0);
  const categoryId = text(remote.BIT240002_DishCategoryId);
  if (!name || price <= 0 || preparationTime <= 0 || !categoryId) return undefined;
  return {
    BIT240002_Id: keyOf(remote),
    BIT240002_Name: name,
    BIT240002_Price: price,
    BIT240002_PreparationTime: preparationTime,
    BIT240002_IsAvailable: isTrue(remote.BIT240002_IsAvailable),
    BIT240002_Description: text(remote.BIT240002_Description),
    BIT240002_DishCategoryId: categoryId,
    BIT240002_DishImage: parseImages(remote.BIT240002_DishImage),
    BIT240002_UpdatedAt: positiveNumber(remote.BIT240002_UpdatedAt) ?? 0,
  };
}
