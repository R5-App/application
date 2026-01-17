# MyPet App - Material Design 3 Design System

Tämä dokumentti sisältää MyPet-sovelluksen Material Design 3 -yhteensopivan design systemin.

## 📋 Sisällysluettelo

1. [Yleiskatsaus](#yleiskatsaus)
2. [Värit (MD3 Color Roles)](#värit-md3-color-roles)
3. [Typografia (MD3 Typography Scale)](#typografia-md3-typography-scale)
4. [Spacing](#spacing)
5. [Border Radius](#border-radius)
6. [Elevation](#elevation)
7. [Käyttöohjeet](#käyttöohjeet)

---

## Yleiskatsaus

MyPet-sovellus noudattaa **Material Design 3 (MD3)** -periaatteita ja käyttää **React Native Paper** -kirjastoa komponentteihin. Kaikki tyylit on keskitetty `/src/styles/` -kansioon:

- **theme.ts**: MD3-värit, typografia, spacing, elevation
- **authStyles.ts**: Kirjautumis- ja rekisteröintinäytöt
- **screenStyles.ts**: Päänäytöt (Home, Pets, Settings)

---

## Värit (MD3 Color Roles)

Material Design 3 käyttää semanttisia väriroleja. Värit määritellään `theme.ts`:ssä.

### Primary Colors
- `primary`: #6750A4 - Pääasiallinen brändiväri
- `onPrimary`: #FFFFFF - Teksti/ikonit primary-värin päällä
- `primaryContainer`: #EADDFF - Vaaleannettu primary
- `onPrimaryContainer`: #21005D - Teksti primaryContainer-värin päällä

### Secondary Colors
- `secondary`: #625B71 - Toissijainen väri
- `onSecondary`: #FFFFFF - Teksti secondary-värin päällä
- `secondaryContainer`: #E8DEF8 - Vaaleannettu secondary
- `onSecondaryContainer`: #1D192B - Teksti secondaryContainer-värin päällä

### Tertiary Colors
- `tertiary`: #7D5260 - Aksentit ja korostukset
- `onTertiary`: #FFFFFF
- `tertiaryContainer`: #FFD8E4
- `onTertiaryContainer`: #31111D

### Error Colors
- `error`: #B3261E - Virhetilanteet
- `onError`: #FFFFFF
- `errorContainer`: #F9DEDC
- `onErrorContainer`: #410E0B

### Background & Surface
- `background`: #FFFBFE - Sovelluksen taustaväri
- `onBackground`: #1C1B1F - Teksti taustan päällä
- `surface`: #FFFBFE - Komponenttien pinnat
- `onSurface`: #1C1B1F - Teksti pintojen päällä
- `surfaceVariant`: #E7E0EC - Vaihtoehtoinen pinta
- `onSurfaceVariant`: #49454F - Teksti surfaceVariant-värin päällä

### Käyttöesimerkkejä

```typescript
import { COLORS } from '../styles/theme';

// Primary-väri napeille
<Button style={{ backgroundColor: COLORS.primary }}>
  <Text style={{ color: COLORS.onPrimary }}>Klikkaa</Text>
</Button>

// Kortti
<Card style={{ backgroundColor: COLORS.surface }}>
  <Text style={{ color: COLORS.onSurface }}>Sisältö</Text>
</Card>
```

---

## Typografia (MD3 Typography Scale)

Material Design 3 määrittelee 13 tekstityyppiä.

### Display (Suuret otsikot)
- `displayLarge`: 57px / 64px / 400 - Suurimmat otsikot
- `displayMedium`: 45px / 52px / 400
- `displaySmall`: 36px / 44px / 400

### Headline (Otsikot)
- `headlineLarge`: 32px / 40px / 400
- `headlineMedium`: 28px / 36px / 400
- `headlineSmall`: 24px / 32px / 400

### Title (Osion otsikot)
- `titleLarge`: 22px / 28px / 400
- `titleMedium`: 16px / 24px / 500
- `titleSmall`: 14px / 20px / 500

### Body (Leipäteksti)
- `bodyLarge`: 16px / 24px / 400
- `bodyMedium`: 14px / 20px / 400 (oletus)
- `bodySmall`: 12px / 16px / 400

### Label (Napit, labelit)
- `labelLarge`: 14px / 20px / 500
- `labelMedium`: 12px / 16px / 500
- `labelSmall`: 11px / 16px / 500

### Käyttö React Native Paperissa

```tsx
<Text variant="displayLarge">Otsikko</Text>
<Text variant="bodyMedium">Leipätekstiä</Text>
<Text variant="labelLarge">Nappi</Text>
```

---

## Spacing

```typescript
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
};
```

---

## Border Radius

MD3 shape system:

```typescript
export const BORDER_RADIUS = {
  none: 0,
  extraSmall: 4,
  small: 8,
  medium: 12,
  large: 16,
  extraLarge: 28,
  full: 9999,
};
```

---

## Elevation

MD3 elevation järjestelmä (level0 - level5):

```typescript
import { ELEVATION } from '../styles/theme';

<View style={ELEVATION.level2}>  // Kortit
<FAB style={ELEVATION.level3} />  // FAB
<View style={ELEVATION.level5}>  // Dialogit
```

---

## Käyttöohjeet

### 1. Tuo design tokenit

```typescript
import { 
  COLORS, 
  TYPOGRAPHY, 
  SPACING, 
  BORDER_RADIUS, 
  ELEVATION,
  COMMON_STYLES 
} from '../styles/theme';
```

### 2. Käytä Paper variantteja

```tsx
import { Text, Button, Card } from 'react-native-paper';

<Text variant="displayLarge">Otsikko</Text>
<Button mode="contained">Nappi</Button>
<Card mode="elevated">Kortti</Card>
```

### 3. Käytä MD3Theme

```tsx
import { PaperProvider } from 'react-native-paper';
import MD3Theme from './styles/theme';

export default function App() {
  return (
    <PaperProvider theme={MD3Theme}>
      {/* Your app */}
    </PaperProvider>
  );
}
```

---

## Lisäresurssit

- [Material Design 3](https://m3.material.io/)
- [React Native Paper - MD3](https://callstack.github.io/react-native-paper/)
- [MD3 Color System](https://m3.material.io/styles/color/overview)

---

**Versio:** 2.0 (Material Design 3)  
**Päivitetty:** 2025
