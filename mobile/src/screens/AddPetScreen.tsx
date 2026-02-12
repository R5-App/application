import React, { useState, useRef } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Button, Portal, TextInput, Dialog } from 'react-native-paper';
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

  const handleFieldChange = (field: keyof FormState, value: string) => {
    console.log(`[${SCREEN_NAME}] ${field} changed to: ${value}`);
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSavePet = async () => {
    console.log(`[${SCREEN_NAME}] handleSavePet called`);

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
        console.log(`[${SCREEN_NAME}] Pet created successfully:`, result.data?.name);
        setMessageTitle('Onnistui');
        setMessageContent('Lemmikki lisätty onnistuneesti');
        setMessageType('success');
        setMessageDialogVisible(true);

    // Navigate back after showing success message
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      } else {
        console.error(`[${SCREEN_NAME}] Create failed:`, result.message);
        setMessageTitle('Virhe');
        setMessageContent(result.message || 'Lemmikin lisääminen epäonnistui');
        setMessageType('error');
        setMessageDialogVisible(true);
      }
    } catch (error) {
      console.error(`[${SCREEN_NAME}] Exception in handleSavePet:`, error);
      setMessageTitle('Virhe');
      setMessageContent('Lemmikin lisääminen epäonnistui');
      setMessageType('error');
      setMessageDialogVisible(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    console.log(`[${SCREEN_NAME}] Date selected:`, selectedDate?.toISOString().split('T')[0]);
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
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* HEADER */}
        <View style={styles.headerContainer}>
          <Text variant="headlineMedium" style={styles.headerTitle}>
            Lisää uusi lemmikki
          </Text>
        </View>

        {/* FORM CONTENT */}
        <View style={styles.formContainer}>
          {/* NAME FIELD */}
          <TextInput
            label="Lemmikin nimi *"
            value={form.name}
            onChangeText={(value) => handleFieldChange('name', value)}
            mode="outlined"
            style={styles.input}
            placeholder="Esim. Fluffy"
          />

          {/* TYPE FIELD */}
          <TextInput
            label="Laji *"
            value={form.type}
            onChangeText={(value) => handleFieldChange('type', value)}
            mode="outlined"
            style={styles.input}
            placeholder="Esim. Koira, Kissa"
          />

          {/* BREED FIELD */}
          <TextInput
            label="Rotu *"
            value={form.breed}
            onChangeText={(value) => handleFieldChange('breed', value)}
            mode="outlined"
            style={styles.input}
            placeholder="Esim. Labradorinnoutaja"
          />

          {/* SEX FIELD */}
          <TextInput
            label="Sukupuoli *"
            value={form.sex}
            onChangeText={(value) => handleFieldChange('sex', value)}
            mode="outlined"
            style={styles.input}
            placeholder="Uros tai Naaras"
          />

          {/* BIRTH DATE FIELD */}
          <View onTouchStart={() => {
            console.log(`[${SCREEN_NAME}] Date picker opened`);
            setShowDatePicker(true);
          }}>
            <TextInput
              label="Syntymäpäivä *"
              value={new Date(form.birthdate).toLocaleDateString('fi-FI')}
              mode="outlined"
              style={styles.input}
              editable={false}
              right={<TextInput.Icon icon="calendar" />}
            />
          </View>

          {/* DATE PICKER */}
          {showDatePicker && (
            <DateTimePicker
              value={new Date(form.birthdate)}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          {/* NOTES FIELD */}
          <TextInput
            label="Muistiinpanot (valinnainen)"
            value={form.notes}
            onChangeText={(value) => handleFieldChange('notes', value)}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
            placeholder="Lisää muistiinpanoja lemmikistä..."
            onFocus={() => {
              console.log(`[${SCREEN_NAME}] Notes field focused, scrolling to end`);
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 200);
            }}
          />

          {/* ACTION BUTTONS */}
          <View style={styles.actionButtonsContainer}>
            {/* CANCEL BUTTON */}
            <Button
              mode="outlined"
              onPress={() => {
                console.log(`[${SCREEN_NAME}] Cancel button pressed, navigating back`);
                navigation.goBack();
              }}
              disabled={isSaving}
              style={styles.modalButton}
            >
              Peruuta
            </Button>

            {/* SAVE BUTTON */}
            <Button
              mode="contained"
              onPress={handleSavePet}
              loading={isSaving}
              disabled={isSaving}
              style={styles.modalButton}
            >
              Lisää lemmikki
            </Button>
          </View>
        </View>
      </ScrollView>

      {/* DIALOGS */}
      <Portal>
        {/* VALIDATION ERROR DIALOG */}
        <Dialog
          visible={validationDialogVisible}
          onDismiss={() => setValidationDialogVisible(false)}
        >
          <Dialog.Title>Virhe</Dialog.Title>
          <Dialog.Content>
            <Text>{validationMessage}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {
              console.log(`[${SCREEN_NAME}] Validation dialog closed`);
              setValidationDialogVisible(false);
            }}>
              OK
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* SUCCESS/ERROR MESSAGE DIALOG */}
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
            <Button onPress={() => {
              console.log(`[${SCREEN_NAME}] Message dialog closed`);
              setMessageDialogVisible(false);
            }}>
              OK
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}