# BIT240002_FoodManager – Quản lý món ăn

Bài kiểm tra giữa kỳ môn Phát triển ứng dụng di động.

- **Sinh viên:** Phạm Duy An
- **MSSV:** BIT240002
- **Công nghệ:** React Native (Expo SDK 57, Expo Router, TypeScript)
- **Lưu trữ:** SQLite trên máy (`expo-sqlite`), đồng bộ hai chiều với MockAPI qua REST API
- **Video 1 (demo ứng dụng):** [Xem trên Google Drive](https://drive.google.com/file/d/1jhR_X3GHaGVqhvk9KPV4JrAEryTsT18P/view?usp=sharing)
- **Video 2 (thuyết minh mã nguồn và chức năng):** [Xem trên Google Drive](https://drive.google.com/file/d/1u8nJh64S_WwdNJla1E_ydR0GbxnD1SMu/view?usp=sharing)

## Chạy ứng dụng

Yêu cầu: Node.js 22 trở lên (đã chạy với Node 24), Expo Go hỗ trợ SDK 57 hoặc Android emulator.

```bash
npm install
npm start          # quét QR bằng Expo Go (bản hỗ trợ SDK 57), hoặc bấm a để mở Android emulator
npm run android    # mở thẳng trên Android emulator / thiết bị
```

Kiểm tra mã nguồn:

```bash
npm test           # kiểm tra dữ liệu, lọc/sắp xếp, ảnh đại diện, đồng bộ offline → online
npm run lint
npx tsc --noEmit
```

## Cấu hình MockAPI

Project MockAPI của bài: `https://6ad7277f95e98f36aef1ece8.mockapi.io/api/v1`

- Loại món: <https://6ad7277f95e98f36aef1ece8.mockapi.io/api/v1/BIT240002_DishCategory>
- Món ăn: <https://6ad7277f95e98f36aef1ece8.mockapi.io/api/v1/BIT240002_Dish>

Muốn dùng project MockAPI khác:

1. Trên [mockapi.io](https://mockapi.io/) tạo project, rồi tạo 2 resource **để trống dữ liệu** (nếu MockAPI tự sinh dữ liệu giả thì xóa hết):

   | Resource | Trường (schema) |
   | --- | --- |
   | `BIT240002_DishCategory` | `BIT240002_Id` (String), `BIT240002_Name` (String), `BIT240002_Description` (String), `BIT240002_UpdatedAt` (Number) |
   | `BIT240002_Dish` | `BIT240002_Id` (String), `BIT240002_Name` (String), `BIT240002_Price` (Number), `BIT240002_PreparationTime` (Number), `BIT240002_IsAvailable` (Boolean), `BIT240002_Description` (String), `BIT240002_DishCategoryId` (String), `BIT240002_DishImage` (Array), `BIT240002_UpdatedAt` (Number) |

   Giữ nguyên trường `id` mặc định của MockAPI (MockAPI tự sinh, dùng trong URL sửa/xóa).
2. Sửa `API_URL` trong [src/api/client.ts](src/api/client.ts) thành địa chỉ project, dạng `https://<mã project>.mockapi.io/api/v1`.

Lần đầu mở app khi có mạng, dữ liệu mẫu (3 loại món, 5 món ăn) được tự gửi lên MockAPI.

## Thiết kế dữ liệu

Model trong code ([src/types.ts](src/types.ts)) đặt tên theo quy ước TypeScript: `DishCategory`, `Dish`, `DishImage`. Khi lưu, mọi bảng và trường đều có tiền tố `BIT240002_` ([src/db/schema.ts](src/db/schema.ts)):

| Bảng SQLite / resource MockAPI | Trường |
| --- | --- |
| `BIT240002_DishCategory` | `BIT240002_Id`, `BIT240002_Name`, `BIT240002_Description` |
| `BIT240002_Dish` | `BIT240002_Id`, `BIT240002_Name`, `BIT240002_Price`, `BIT240002_PreparationTime`, `BIT240002_IsAvailable`, `BIT240002_Description`, `BIT240002_DishCategoryId` |
| `BIT240002_DishImage` (trên MockAPI là mảng `BIT240002_DishImage` nằm trong món) | `BIT240002_DishId`, `BIT240002_ImageUrl`, `BIT240002_IsThumbnail` |

Hai trường dùng cho đồng bộ: `BIT240002_UpdatedAt` (thời điểm sửa cuối) và `BIT240002_SyncStatus` (chỉ có trong SQLite: `synced`, `pending`, `deleted`).

Quan hệ: 1 loại món – n món (`BIT240002_DishCategoryId` là khóa ngoại), 1 món – n ảnh. Ràng buộc ở mức CSDL: tên không rỗng, giá > 0, thời gian chế biến > 0, loại món phải tồn tại, mỗi món tối đa 1 ảnh đại diện (unique index), xóa món thì xóa ảnh theo.

Kiểm tra dữ liệu trên form ([src/utils/validation.ts](src/utils/validation.ts)): tên không rỗng, giá là số nguyên > 0, thời gian chế biến là số phút nguyên > 0, `DishCategoryId` có trong danh sách loại món, tên món không trùng trong cùng một loại, link ảnh đúng dạng `http(s)://` và không trùng.

## Mã nguồn liên quan đến MSSV

| Nội dung | Vị trí |
| --- | --- |
| Tên project `BIT240002_FoodManager` | `name`, `slug` trong [app.json](app.json); `name` trong [package.json](package.json); `MSSV`, `PROJECT_NAME` trong [src/db/schema.ts](src/db/schema.ts) (hiện ở đầu màn hình danh sách) |
| File CSDL `BIT240002_FoodManager.db` | `DATABASE_NAME` trong [src/db/schema.ts](src/db/schema.ts) |
| Tên bảng, tên cột | `CREATE_TABLES` và kiểu `CategoryRecord`, `DishRecord` trong [src/db/schema.ts](src/db/schema.ts); các câu SQL trong [src/db/categories.ts](src/db/categories.ts), [src/db/dishes.ts](src/db/dishes.ts) |
| Tên resource, tên trường trên MockAPI | `categoryApi`, `dishApi`, `parseCategory`, `parseDish` trong [src/api/mockApi.ts](src/api/mockApi.ts) |

## Chức năng

| Yêu cầu | Cách làm |
| --- | --- |
| Danh sách, chi tiết, thêm, sửa, xóa món | [src/app/index.tsx](src/app/index.tsx), [src/app/dish/[id].tsx](src/app/dish/[id].tsx), [src/app/dish-form.tsx](src/app/dish-form.tsx). Xóa có hộp thoại xác nhận. Form chọn loại món từ dữ liệu trong SQLite |
| Quản lý loại món | [src/app/categories.tsx](src/app/categories.tsx), [src/app/category-form.tsx](src/app/category-form.tsx). Không cho xóa loại món đang có món sử dụng |
| Tìm, lọc, sắp xếp | Tìm theo một phần tên (gõ không dấu vẫn tìm được); lọc theo loại, trạng thái đang bán, khoảng giá, phối hợp đồng thời; sắp xếp giá tăng/giảm, thời gian chế biến tăng ([src/utils/dishFilters.ts](src/utils/dishFilters.ts)). Điều kiện lưu ở [FilterContext](src/context/FilterContext.tsx) nên quay về danh sách vẫn giữ |
| Ảnh | Thêm ảnh bằng ImageUrl trong form, bấm ★ để đổi ảnh đại diện (luôn tối đa 1 ảnh, [src/utils/dishImages.ts](src/utils/dishImages.ts)); màn hình chi tiết hiện mọi ảnh (khung lớn + dải ảnh nhỏ) |
| Nhanh / Thông thường | `PreparationTime ≤ 15` phút là Quick / Nhanh, còn lại Regular / Thông thường; tính lúc hiển thị, không lưu thêm ([src/utils/format.ts](src/utils/format.ts)) |
| Xử lý lỗi | Id không tồn tại → màn hình "Không tìm thấy"; danh sách/ảnh trống → thông báo và ảnh thay thế; khoảng giá sai → báo lỗi, không lọc theo giá; nhập sai → báo dưới từng ô và hộp thoại; lỗi MockAPI (mất mạng, quá thời gian, mã HTTP) → thanh trạng thái báo lỗi, tự thử lại, dữ liệu vẫn giữ trong SQLite |
| Đa ngôn ngữ | Mặc định English, nút EN/VI ở đầu mọi màn hình. Bản dịch [src/i18n/en.ts](src/i18n/en.ts), [src/i18n/vi.ts](src/i18n/vi.ts) (TypeScript bắt buộc đủ khóa); ngôn ngữ lưu ở [LanguageContext](src/context/LanguageContext.tsx) bọc mọi màn hình nên chuyển màn hình vẫn giữ. Lỗi validation lưu dạng khóa dịch nên đổi ngôn ngữ là đổi theo |

## Luồng dữ liệu và đồng bộ

- **Đọc:** SQLite → [DataContext](src/context/DataContext.tsx) → các màn hình.
- **Ghi:** màn hình gọi `saveDish`/`deleteDish`/... → ghi SQLite với trạng thái `pending` (xóa thì đánh dấu `deleted`) → đọc lại để màn hình cập nhật ngay → yêu cầu đồng bộ. Mất mạng thì thay đổi nằm chờ trong SQLite, app vẫn dùng bình thường.
- **Phát hiện mạng** ([src/context/SyncContext.tsx](src/context/SyncContext.tsx)): `expo-network` báo mỗi khi trạng thái mạng đổi. Vừa có Internet trở lại thì tự đồng bộ, không có nút "Đồng bộ". Đồng bộ lỗi thì tự thử lại sau 5, 10, 20, rồi mỗi 30 giây.
- **Đồng bộ** ([src/sync/syncEngine.ts](src/sync/syncEngine.ts)):
  1. Tải danh sách trên MockAPI.
  2. Gửi các bản ghi `pending`: tìm theo `BIT240002_Id` (do app sinh, giống nhau ở SQLite và MockAPI). Chưa có thì `POST`, có rồi thì `PUT` nếu bản trên máy sửa sau. Vì vậy mất mạng giữa chừng rồi gửi lại cũng không tạo bản ghi trùng. Bản ghi `deleted` thì `DELETE` rồi xóa hẳn khỏi SQLite.
  3. Kéo dữ liệu mới nhất về SQLite: thêm, sửa, xóa theo MockAPI, bỏ qua bản ghi đang chờ gửi.

  Hai nơi cùng sửa một bản ghi thì bản sửa sau thắng (so `BIT240002_UpdatedAt`). Dữ liệu mẫu chưa sửa chỉ được gửi khi MockAPI còn trống, nên cài lại app không ghi đè dữ liệu đã có.

## Cấu trúc thư mục

```text
src/
  app/         các màn hình (Expo Router)
  api/         gọi MockAPI (client, 2 resource, kiểm tra dữ liệu tải về)
  db/          SQLite: tên bảng/trường (schema), tạo bảng + dữ liệu mẫu, đọc/ghi từng bảng
  sync/        đồng bộ SQLite ↔ MockAPI (kèm test)
  context/     ngôn ngữ, đồng bộ + trạng thái mạng, dữ liệu, bộ lọc danh sách
  i18n/        bản dịch English / Tiếng Việt
  components/  thành phần dùng chung: hộp thoại, ô nhập, ảnh, thanh đồng bộ, nút đổi ngôn ngữ
  styles/      style tách riêng cho từng màn hình và thành phần
  utils/       kiểm tra dữ liệu, lọc/sắp xếp, ảnh, định dạng (kèm test)
  types.ts     model DishCategory, Dish, DishImage
```
