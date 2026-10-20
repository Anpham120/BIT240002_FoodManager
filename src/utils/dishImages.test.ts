import { addImage, getThumbnailUrl, removeImage, setThumbnail } from './dishImages';

const A = 'https://example.com/a.jpg';
const B = 'https://example.com/b.jpg';
const C = 'https://example.com/c.jpg';

const thumbnails = (images: { isThumbnail: boolean }[]) => images.filter((image) => image.isThumbnail).length;

describe('ảnh của món: tối đa 1 ảnh đại diện', () => {
  it('ảnh đầu tiên tự làm ảnh đại diện, ảnh thêm sau thì không', () => {
    const images = addImage(addImage([], A), B);
    expect(images).toEqual([
      { imageUrl: A, isThumbnail: true },
      { imageUrl: B, isThumbnail: false },
    ]);
  });

  it('đổi ảnh đại diện: chỉ còn đúng 1 ảnh isThumbnail = true', () => {
    const images = setThumbnail(addImage(addImage(addImage([], A), B), C), C);
    expect(thumbnails(images)).toBe(1);
    expect(getThumbnailUrl(images)).toBe(C);
  });

  it('xóa ảnh đại diện thì ảnh đầu tiên còn lại thay thế', () => {
    const images = removeImage(addImage(addImage([], A), B), A);
    expect(images).toEqual([{ imageUrl: B, isThumbnail: true }]);
  });

  it('không có ảnh thì không có ảnh đại diện; chưa chọn thì lấy ảnh đầu', () => {
    expect(getThumbnailUrl([])).toBeUndefined();
    expect(getThumbnailUrl([{ imageUrl: B, isThumbnail: false }])).toBe(B);
  });
});
