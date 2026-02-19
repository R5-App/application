import React from 'react';
import { View, Image, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../styles/theme';
import { avatarStyles as styles, AVATAR_SIZES } from '../styles/screenStyles';
import avatarService from '../services/avatarService';

interface AvatarDisplayProps {
  avatarId?: number;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  style?: any;
}

export default function AvatarDisplay({
  avatarId,
  size = 'medium',
  onPress,
  style,
}: AvatarDisplayProps) {
  const config = AVATAR_SIZES[size as keyof typeof AVATAR_SIZES];

  if (avatarId) {
    const imageUrl = avatarService.getAvatarImageUrl(avatarId);

    return (
      <Pressable onPress={onPress}>
        <View
          style={[
            styles.container,
            {
              width: config.container,
              height: config.container,
              borderRadius: config.container / 2,
            },
            style,
          ]}
        >
          <Image
            source={{ uri: imageUrl }}
            style={[
              styles.image,
              {
                width: config.container,
                height: config.container,
                borderRadius: config.container / 2,
              },
            ]}
          />
        </View>
      </Pressable>
    );
  }

  // Placeholder with paw icon
  return (
    <Pressable onPress={onPress}>
      <View
        style={[
          styles.placeholder,
          {
            width: config.container,
            height: config.container,
            borderRadius: config.container / 2,
          },
          style,
        ]}
      >
        <MaterialCommunityIcons name="paw" size={config.icon} color={COLORS.primary} />
      </View>
    </Pressable>
  );
}

