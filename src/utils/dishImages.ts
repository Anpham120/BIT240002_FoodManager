import type { DishImage } from '@/types';

// Xử lý danh sách ảnh của món; luôn giữ tối đa 1 ảnh đại diện (isThumbnail = true)

// Link ảnh đại diện; dữ liệu chưa chọn ảnh đại diện thì lấy ảnh đầu tiên; không có ảnh thì undefined
export function getThumbnailUrl(images: DishImage[]): string | undefined {
  return (images.find((image) => image.isThumbnail) ?? images[0])?.imageUrl;
}

// Thêm ảnh vào cuối; ảnh đầu tiên của món tự làm ảnh đại diện
export function addImage(images: DishImage[], imageUrl: string): DishImage[] {
  return [...images, { imageUrl, isThumbnail: images.length === 0 }];
}

// Đổi ảnh đại diện: ảnh được chọn thành true, mọi ảnh khác về false
export function setThumbnail(images: DishImage[], imageUrl: string): DishImage[] {
  return images.map((image) => ({ ...image, isThumbnail: image.imageUrl === imageUrl }));
}

// Xóa ảnh; xóa đúng ảnh đại diện thì ảnh đầu tiên còn lại thay thế
export function removeImage(images: DishImage[], imageUrl: string): DishImage[] {
  const rest = images.filter((image) => image.imageUrl !== imageUrl);
  if (rest.length === 0 || rest.some((image) => image.isThumbnail)) return rest;
  return setThumbnail(rest, rest[0].imageUrl);
}
