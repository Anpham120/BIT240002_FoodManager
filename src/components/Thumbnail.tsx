import { Image } from 'expo-image';
import { useState } from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/components/Icon';
import { useLanguage } from '@/context/LanguageContext';
import { useSync } from '@/context/SyncContext';
import { colors } from '@/styles/theme';
import { styles } from '@/styles/thumbnail';

type ThumbnailProps = {
  // Link ảnh; không có ảnh hoặc tải lỗi thì hiện biểu tượng ảnh thay thế
  uri?: string;
  // Kích thước, bo góc của khung ảnh
  style: StyleProp<ViewStyle>;
  iconSize?: number;
  // Hiện thêm dòng chữ khi tải lỗi (khung ảnh lớn ở màn hình chi tiết)
  showStatus?: boolean;
};

// Ảnh tải từ link bằng expo-image: có cache, hiện mờ dần khi tải xong
export function Thumbnail({ uri, style, iconSize = 24, showStatus = false }: ThumbnailProps) {
  const { t } = useLanguage();
  const { online } = useSync();
  // Nhớ link đã tải lỗi và lúc đó có mạng hay không; đổi link khác hoặc có mạng trở lại thì tự tải lại
  const [failure, setFailure] = useState<{ uri: string; online: boolean | null }>();
  const failed = !!uri && failure?.uri === uri && failure.online === online;

  return (
    <View style={[styles.box, style]}>
      {uri && !failed ? (
        <Image
          source={{ uri }}
          style={styles.image}
          contentFit="cover"
          transition={200}
          onError={() => setFailure({ uri, online })}
        />
      ) : (
        <>
          <Icon name="image" color={colors.primaryMuted} size={iconSize} strokeWidth={1.8} />
          {showStatus && failed && <Text style={styles.status}>{t('common.imageLoadFailed')}</Text>}
        </>
      )}
    </View>
  );
}
