import React, { useState, useRef } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Button, Portal, Modal, TextInput, Dialog } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import petService from '../services/petService';
import { COLORS, SPACING } from '../styles/theme';
import { validatePetData } from '../helpers';
import { petsStyles as styles } from '../styles/screenStyles';
import DateTimePicker from '@react-native-community/datetimepicker';

const SCREEN_NAME = 'AddPetScreen';

interface FormState {
  name: string;
  type: string;
  breed: string;
  sex: string;
  birthdate: string;
  notes: string;
}

export default function AddPetScreen() {
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);

  // Form state
  const [form, setForm] = useState<FormState>({
    name: '',
    type: '',
    breed: '',
    sex: '',
    birthdate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationDialogVisible, setValidationDialogVisible] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [messageDialogVisible, setMessageDialogVisible] = useState(false);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  // Handle form field changes
  const handleFieldChange = (field: keyof FormState, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle save pet
  const handleSavePet = async () => {
    console.log(`[${SCREEN_NAME}] handleSavePet called`);

    // Validate form data
    const validation = validatePetData(
      form.name,
      form.type,
      form.breed,
      form.sex,
      form.birthdate
    );

    if (!validation.valid) {
      console.warn(`[${SCREEN_NAME}] Validation failed:`, validation.message);
      setValidationMessage(validation.message || '');
      setValidationDialogVisible(true);
      return;
    }

    setIsSaving(true);
    console.log(`[${SCREEN_NAME}] Sending create request with data:`, form);

    try {
      const result = await petService.createPet({
        owner_id: '', // This will be set by the backend from the auth token
        ...form
      });

      console.log(`[${SCREEN_NAME}] Create response:`, result);

      if (result.success) {
        console.log(`[${SCREEN_NAME}] ✅ Pet created successfully:`, result.data?.name);
        setMessageTitle('Onnistui');
        setMessageContent('Lemmikki lisätty onnistuneesti');
        setMessageType('success');
        setMessageDialogVisible(true);

        // Navigate back after showing success message
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      } else {
        console.error(`[${SCREEN_NAME}] ❌ Create failed:`, result.message);
        setMessageTitle('Virhe');
        setMessageContent(result.message || 'Lemmikin lisääminen epäonnistui');
        setMessageType('error');
        setMessageDialogVisible(true);
      }
    } catch (error) {
      console.error(`[${SCREEN_NAME}] ❌ Exception in handleSavePet:`, error);
      setMessageTitle('Virhe');
      setMessageContent('Lemmikin lisääminen epäonnistui');
      setMessageType('error');
      setMessageDialogVisible(true);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle date picker change
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      handleFieldChange('birthdate', dateString);
    }
  };

  console.log(`[${SCREEN_NAME}] Rendering form`);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: SPACING['2xl'] }}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text variant="headlineMedium" style={styles.headerTitle}>
            Lisää uusi lemmikki
          </Text>
        </View>

        {/* Form Content */}
        <View style={{ padding: SPACING.lg }}>
          {/* Pet Name Field */}
          <TextInput
            label="Lemmikin nimi *"
            value={form.name}
            onChangeText={(value) => handleFieldChange('name', value)}
            mode="outlined"
            style={styles.editInput}
            placeholder="Esim. Fluffy"
            placeholderTextColor="rgba(0, 0, 0, 0.3)"
          />

          {/* Pet Type Field */}
          <TextInput
            label="Laji *"
            value={form.type}
            onChangeText={(value) => handleFieldChange('type', value)}
            mode="outlined"
            style={styles.editInput}
            placeholder="Esim. Koira, Kissa"
            placeholderTextColor="rgba(0, 0, 0, 0.3)"
          />

          {/* Pet Breed Field */}
          <TextInput
            label="Rotu *"
            value={form.breed}
            onChangeText={(value) => handleFieldChange('breed', value)}
            mode="outlined"
            style={styles.editInput}
            placeholder="Esim. Labradorinnoutaja"
            placeholderTextColor="rgba(0, 0, 0, 0.3)"
          />

          {/* Pet Sex Field */}
          <TextInput
            label="Sukupuoli *"
            value={form.sex}
            onChangeText={(value) => handleFieldChange('sex', value)}
            mode="outlined"
            style={styles.editInput}
            placeholder="Uros tai Naaras"
            placeholderTextColor="rgba(0, 0, 0, 0.3)"
          />

          {/* Birth Date Field */}
          <View onTouchStart={() => setShowDatePicker(true)}>
            <TextInput
              label="Syntymäpäivä *"
              value={new Date(form.birthdate).toLocaleDateString('fi-FI')}
              mode="outlined"
              style={styles.editInput}
              editable={false}
              right={<TextInput.Icon icon="calendar" />}
              placeholder="PP-KK-VVVV"
              placeholderTextColor="rgba(0, 0, 0, 0.3)"
            />
          </View>

          {/* Date Picker */}
          {showDatePicker && (
            <DateTimePicker
              value={new Date(form.birthdate)}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          {/* Notes Field */}
          <TextInput
            label="Muistiinpanot (valinnainen)"
            value={form.notes}
            onChangeText={(value) => handleFieldChange('notes', value)}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.editInput}
            placeholder="Lisää muistiinpanoja lemmikistä..."
            placeholderTextColor="rgba(0, 0, 0, 0.3)"
            onFocus={() => {
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 200);
            }}
          />

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.lg }}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              disabled={isSaving}
              style={{ flex: 1 }}
            >
              Peruuta
            </Button>
            <Button
              mode="contained"
              onPress={handleSavePet}
              loading={isSaving}
              disabled={isSaving}
              style={{ flex: 1 }}
            >
              Lisää lemmikki
            </Button>
          </View>
        </View>
      </ScrollView>

      {/* Dialogs */}
      <Portal>
        {/* Validation Error Dialog */}
        <Dialog
          visible={validationDialogVisible}
          onDismiss={() => setValidationDialogVisible(false)}
        >
          <Dialog.Title>Virhe</Dialog.Title>
          <Dialog.Content>
            <Text>{validationMessage}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setValidationDialogVisible(false)}>OK</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Success/Error Message Dialog */}
        <Dialog
          visible={messageDialogVisible}
          onDismiss={() => setMessageDialogVisible(false)}
        >
          <Dialog.Title style={{ color: messageType === 'error' ? COLORS.error : COLORS.primary }}>
            {messageTitle}
          </Dialog.Title>
          <Dialog.Content>
            <Text>{messageContent}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setMessageDialogVisible(false)}>OK</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}