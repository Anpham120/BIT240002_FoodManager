/// <reference types="node" />
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';

import type { SQLiteDatabase } from 'expo-sqlite';

import { API_URL } from '@/api/client';
import { deleteCategory, getCategories, saveCategory } from '@/db/categories';
import { countPendingChanges } from '@/db/database';
import { deleteDish, getDishes, saveDish } from '@/db/dishes';
import { migrateDatabase } from '@/db/migrate';
import type { Dish, DishInput } from '@/types';

import { syncWithMockApi } from './syncEngine';

// Kiểm tra đồng bộ bằng SQLite thật (node:sqlite, trong bộ nhớ) và một MockAPI giả trong bộ nhớ

// Bọc node:sqlite theo đúng các hàm expo-sqlite mà app dùng
function openTestDatabase(): SQLiteDatabase {
  const raw = new DatabaseSync(':memory:');
  const args = (params: unknown[]) =>
    (params.length === 1 && Array.isArray(params[0]) ? params[0] : params) as SQLInputValue[];
  const db = {
    execAsync: async (sql: string) => raw.exec(sql),
    runAsync: async (sql: string, ...params: unknown[]) => {
      const result = raw.prepare(sql).run(...args(params));
      return { changes: Number(result.changes), lastInsertRowId: Number(result.lastInsertRowid) };
    },
    getAllAsync: async (sql: string, ...params: unknown[]) => raw.prepare(sql).all(...args(params)),
    getFirstAsync: async (sql: string, ...params: unknown[]) => raw.prepare(sql).get(...args(params)) ?? null,
    withTransactionAsync: async (task: () => Promise<void>) => {
      raw.exec('BEGIN');
      try {
        await task();
        raw.exec('COMMIT');
      } catch (error) {
        raw.exec('ROLLBACK');
        throw error;
      }
    },
  };
  return db as unknown as SQLiteDatabase;
}

type RemoteRow = { id: string } & Record<string, any>;

// MockAPI giả: GET/POST /resource, PUT/DELETE /resource/{id}; danh sách rỗng trả 404 "Not found" như MockAPI thật
function createMockApi() {
  const resources: Record<string, RemoteRow[]> = { BIT240002_DishCategory: [], BIT240002_Dish: [] };
  const state = { offline: false, loseNextResponse: false, nextId: 1 };
  const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });

  const fetchMock = jest.fn(async (url: string, init?: RequestInit) => {
    if (state.offline) throw new TypeError('Network request failed');
    const [name, id] = url.slice(API_URL.length + 1).split('/');
    const method = init?.method ?? 'GET';
    const list = resources[name];
    let response: Response;
    if (!list) response = reply(404, 'Not found');
    else if (method === 'GET') response = list.length > 0 ? reply(200, list) : reply(404, 'Not found');
    else if (method === 'POST') {
      const record = { ...JSON.parse(String(init?.body)), id: String(state.nextId++) };
      list.push(record);
      response = reply(201, record);
    } else {
      const index = list.findIndex((record) => record.id === id);
      if (index < 0) response = reply(404, 'Not found');
      else if (method === 'PUT') {
        list[index] = { ...list[index], ...JSON.parse(String(init?.body)), id };
        response = reply(200, list[index]);
      } else response = reply(200, list.splice(index, 1)[0]);
    }
    // Máy chủ đã làm xong nhưng phản hồi bị mất trên đường về (rớt mạng giữa chừng)
    if (state.loseNextResponse && method !== 'GET') {
      state.loseNextResponse = false;
      throw new TypeError('Network request failed');
    }
    return response;
  });

  return {
    resources,
    state,
    fetchMock,
    categories: () => resources.BIT240002_DishCategory,
    dishes: () => resources.BIT240002_Dish,
    dish: (id: string) => resources.BIT240002_Dish.find((record) => record.BIT240002_Id === id),
  };
}

const NEW_DISH: DishInput = {
  name: 'Bánh mì thịt',
  price: 30000,
  preparationTime: 7,
  isAvailable: true,
  description: 'Thêm khi offline',
  dishCategoryId: 'category-starter',
  images: [{ imageUrl: 'https://example.com/banh-mi.jpg', isThumbnail: true }],
};

function toInput({ id, syncStatus, ...input }: Dish): DishInput {
  return input;
}

async function localDish(db: SQLiteDatabase, id: string) {
  return (await getDishes(db)).find((dish) => dish.id === id);
}

let db: SQLiteDatabase;
let api: ReturnType<typeof createMockApi>;

beforeEach(async () => {
  db = openTestDatabase();
  await migrateDatabase(db);
  api = createMockApi();
  global.fetch = api.fetchMock as unknown as typeof fetch;
});

describe('dữ liệu mẫu và ràng buộc trong SQLite', () => {
  it('lần đầu mở app có 3 loại món và 5 món, chờ đồng bộ', async () => {
    expect(await getCategories(db)).toHaveLength(3);
    expect(await getDishes(db)).toHaveLength(5);
    expect(await countPendingChanges(db)).toBe(8);
  });

  it('không cho xóa loại món đang có món sử dụng', async () => {
    expect(await deleteCategory(db, 'category-main')).toBe(2);
    expect((await getCategories(db)).map((category) => category.id)).toContain('category-main');
  });

  it('CSDL từ chối ảnh đại diện thứ 2 của cùng một món', async () => {
    const twoThumbnails = {
      ...NEW_DISH,
      images: [
        { imageUrl: 'https://example.com/1.jpg', isThumbnail: true },
        { imageUrl: 'https://example.com/2.jpg', isThumbnail: true },
      ],
    };
    await expect(saveDish(db, undefined, twoThumbnails)).rejects.toThrow();
    expect(await getDishes(db)).toHaveLength(5);
  });
});

describe('syncWithMockApi', () => {
  it('MockAPI trống: gửi 3 loại + 5 món mẫu (ảnh nằm trong món), mọi bản ghi thành synced', async () => {
    await syncWithMockApi(db);
    expect(api.categories()).toHaveLength(3);
    expect(api.dishes()).toHaveLength(5);
    expect(await countPendingChanges(db)).toBe(0);
    expect(api.dish('dish-pho-bo')).toMatchObject({
      BIT240002_Name: 'Phở bò',
      BIT240002_Price: 55000,
      BIT240002_PreparationTime: 15,
      BIT240002_IsAvailable: true,
      BIT240002_DishCategoryId: 'category-main',
      BIT240002_DishImage: [
        { BIT240002_ImageUrl: expect.stringContaining('pbzcrx'), BIT240002_IsThumbnail: true },
        { BIT240002_ImageUrl: expect.any(String), BIT240002_IsThumbnail: false },
      ],
    });
  });

  it('đồng bộ nhiều lần không phát sinh bản ghi trùng', async () => {
    await syncWithMockApi(db);
    await syncWithMockApi(db);
    await syncWithMockApi(db);
    expect(api.categories()).toHaveLength(3);
    expect(api.dishes()).toHaveLength(5);
    expect(await getDishes(db)).toHaveLength(5);
  });

  it('tạo món khi offline: lưu SQLite (pending), có mạng lại thì lên MockAPI đúng 1 bản ghi', async () => {
    await syncWithMockApi(db);
    api.state.offline = true;
    await saveDish(db, undefined, NEW_DISH);
    await expect(syncWithMockApi(db)).rejects.toMatchObject({ kind: 'network' });
    const created = (await getDishes(db)).find((dish) => dish.name === NEW_DISH.name);
    expect(created?.syncStatus).toBe('pending');

    api.state.offline = false;
    await syncWithMockApi(db);
    expect(api.dishes().filter((dish) => dish.BIT240002_Name === NEW_DISH.name)).toHaveLength(1);
    expect(api.dish(created!.id)).toMatchObject({ BIT240002_Price: 30000, BIT240002_DishCategoryId: 'category-starter' });
    expect(await countPendingChanges(db)).toBe(0);
  });

  it('sửa món khi offline rồi có mạng: cập nhật lên MockAPI, không thêm bản ghi', async () => {
    await syncWithMockApi(db);
    api.state.offline = true;
    const pho = (await localDish(db, 'dish-pho-bo'))!;
    await saveDish(db, pho.id, { ...toInput(pho), price: 60000, isAvailable: false });
    api.state.offline = false;
    await syncWithMockApi(db);
    expect(api.dish('dish-pho-bo')).toMatchObject({ BIT240002_Price: 60000, BIT240002_IsAvailable: false });
    expect(api.dishes()).toHaveLength(5);
  });

  it('POST thành công nhưng mất phản hồi: lần đồng bộ sau không tạo trùng', async () => {
    await syncWithMockApi(db);
    await saveDish(db, undefined, NEW_DISH);
    api.state.loseNextResponse = true;
    await expect(syncWithMockApi(db)).rejects.toMatchObject({ kind: 'network' });
    expect(api.dishes()).toHaveLength(6);

    await syncWithMockApi(db);
    expect(api.dishes()).toHaveLength(6);
    expect(await countPendingChanges(db)).toBe(0);
  });

  it('xóa món: xóa trên MockAPI rồi xóa hẳn khỏi SQLite', async () => {
    await syncWithMockApi(db);
    await deleteDish(db, 'dish-goi-ga');
    expect(await localDish(db, 'dish-goi-ga')).toBeUndefined();
    expect(await countPendingChanges(db)).toBe(1);

    await syncWithMockApi(db);
    expect(api.dish('dish-goi-ga')).toBeUndefined();
    expect(await countPendingChanges(db)).toBe(0);
  });

  it('kéo thay đổi từ MockAPI về máy: sửa, thêm, xóa', async () => {
    await syncWithMockApi(db);
    Object.assign(api.dish('dish-pho-bo')!, { BIT240002_Name: 'Phở bò tái', BIT240002_UpdatedAt: Date.now() });
    api.dishes().push({ ...api.dish('dish-goi-cuon')!, id: '99', BIT240002_Id: 'remote-cha-gio', BIT240002_Name: 'Chả giò' });
    api.resources.BIT240002_Dish = api.dishes().filter((dish) => dish.BIT240002_Id !== 'dish-goi-ga');

    await syncWithMockApi(db);
    expect((await localDish(db, 'dish-pho-bo'))?.name).toBe('Phở bò tái');
    expect((await localDish(db, 'remote-cha-gio'))?.syncStatus).toBe('synced');
    expect(await localDish(db, 'dish-goi-ga')).toBeUndefined();
  });

  it('cùng một món bị sửa ở cả hai nơi: bản sửa sau thắng', async () => {
    await syncWithMockApi(db);
    // Trên MockAPI sửa trước
    Object.assign(api.dish('dish-pho-bo')!, { BIT240002_Price: 70000, BIT240002_UpdatedAt: Date.now() - 60000 });
    // Trên máy sửa sau
    const pho = (await localDish(db, 'dish-pho-bo'))!;
    await saveDish(db, pho.id, { ...toInput(pho), price: 65000 });
    await syncWithMockApi(db);
    expect(api.dish('dish-pho-bo')?.BIT240002_Price).toBe(65000);

    // Trên MockAPI sửa sau bản trên máy
    await saveDish(db, pho.id, { ...toInput(pho), price: 66000 });
    api.state.offline = true;
    await expect(syncWithMockApi(db)).rejects.toMatchObject({ kind: 'network' });
    Object.assign(api.dish('dish-pho-bo')!, { BIT240002_Price: 80000, BIT240002_UpdatedAt: Date.now() + 60000 });
    api.state.offline = false;
    await syncWithMockApi(db);
    expect((await localDish(db, 'dish-pho-bo'))?.price).toBe(80000);
    expect(api.dish('dish-pho-bo')?.BIT240002_Price).toBe(80000);
  });

  it('không xóa loại món trên MockAPI khi ở đó vẫn còn món dùng loại này', async () => {
    await saveCategory(db, undefined, { name: 'Tráng miệng', description: '' });
    await syncWithMockApi(db);
    const dessert = (await getCategories(db)).find((category) => category.name === 'Tráng miệng')!;
    // Máy khác vừa thêm món thuộc loại này lên MockAPI
    api.dishes().push({
      id: '99',
      BIT240002_Id: 'remote-che',
      BIT240002_Name: 'Chè đậu',
      BIT240002_Price: 20000,
      BIT240002_PreparationTime: 5,
      BIT240002_IsAvailable: true,
      BIT240002_Description: '',
      BIT240002_DishCategoryId: dessert.id,
      BIT240002_DishImage: [],
      BIT240002_UpdatedAt: Date.now(),
    });
    // Trên máy chưa có món đó nên vẫn xóa được loại
    expect(await deleteCategory(db, dessert.id)).toBe(0);

    await syncWithMockApi(db);
    expect(api.categories().map((category) => category.BIT240002_Id)).toContain(dessert.id);
    expect((await getCategories(db)).map((category) => category.id)).toContain(dessert.id);
    expect((await localDish(db, 'remote-che'))?.dishCategoryId).toBe(dessert.id);
  });

  it('cài lại app: dữ liệu mẫu không ghi đè hay làm sống lại dữ liệu đã đổi trên MockAPI', async () => {
    await syncWithMockApi(db);
    await deleteDish(db, 'dish-goi-ga');
    const pho = (await localDish(db, 'dish-pho-bo'))!;
    await saveDish(db, pho.id, { ...toInput(pho), price: 60000 });
    await syncWithMockApi(db);

    const fresh = openTestDatabase();
    await migrateDatabase(fresh);
    await syncWithMockApi(fresh);
    expect(api.dishes()).toHaveLength(4);
    expect(await localDish(fresh, 'dish-goi-ga')).toBeUndefined();
    expect((await localDish(fresh, 'dish-pho-bo'))?.price).toBe(60000);
    expect(await countPendingChanges(fresh)).toBe(0);
  });

  it('MockAPI bị xóa sạch: không xóa dữ liệu trên máy mà gửi lại lên', async () => {
    await syncWithMockApi(db);
    api.resources.BIT240002_Dish = [];
    expect(await syncWithMockApi(db)).toBe(true);
    expect(await getDishes(db)).toHaveLength(5);
    await syncWithMockApi(db);
    expect(api.dishes()).toHaveLength(5);
  });

  it('thiếu resource trên MockAPI (sai địa chỉ): báo lỗi 404, dữ liệu trên máy giữ nguyên', async () => {
    delete api.resources.BIT240002_Dish;
    await expect(syncWithMockApi(db)).rejects.toMatchObject({ kind: 'http', status: 404 });
    expect(await getDishes(db)).toHaveLength(5);
  });
});
