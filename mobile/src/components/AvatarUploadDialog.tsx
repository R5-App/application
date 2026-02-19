import React, { useState } from 'react';
import { Dialog, Portal, Button, Text } from 'react-native-paper';
import { View, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import avatarService from '../services/avatarService';
import { avatarStyles as styles } from '../styles/screenStyles';

interface AvatarUploadDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onSuccess: (avatarId: number) => void;
  petId?: number; // If provided, uploads pet avatar; otherwise user avatar
  title?: string;
  description?: string;
}

export default function AvatarUploadDialog({
  visible,
  onDismiss,
  onSuccess,
  petId,
  title = 'Upload Avatar',
  description = 'Select an image from your gallery',
}: AvatarUploadDialogProps) {
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    try {
      setError(null);

      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setError('Camera roll permission required');
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square for easier circular display
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0]);
      }
    } catch (err) {
      setError('Failed to pick image');
      console.error('Image picker error:', err);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const response = await avatarService.uploadAvatar(selectedImage, petId);

      if (response.success && response.data) {
        onSuccess(response.data.id);
        // Reset state
        setSelectedImage(null);
        onDismiss();
      } else {
        setError(response.message || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDismiss = () => {
    setSelectedImage(null);
    setError(null);
    onDismiss();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleDismiss}>
        <Dialog.Title>{title}</Dialog.Title>

        <Dialog.Content>
          <Text variant="bodyMedium" style={styles.description}>
            {description}
          </Text>

          {selectedImage && (
            <View style={styles.previewContainer}>
              <Image source={{ uri: selectedImage.uri }} style={styles.preview} />
              <Text variant="bodySmall" style={styles.fileName}>
                {selectedImage.name}
              </Text>
            </View>
          )}

          {error && (
            <Text variant="bodySmall" style={styles.error}>
              {error}
            </Text>
          )}
        </Dialog.Content>

        <Dialog.Actions style={styles.actions}>
          <Button onPress={handleDismiss} disabled={uploading}>
            Peruuta
          </Button>

          {!selectedImage ? (
            <Button onPress={pickImage} disabled={uploading} mode="contained">
              Valitse kuva
            </Button>
          ) : (
            <Button onPress={handleUpload} disabled={uploading} mode="contained">
              {uploading ? <ActivityIndicator size="small" /> : 'Lataa'}
            </Button>
          )}
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

