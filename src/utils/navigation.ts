import { router } from 'expo-router';

// Quay lại màn hình trước; mở thẳng bằng link thì không có màn trước nên về danh sách
export function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}
