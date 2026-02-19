# MyPet App - Material Design 3 Design System

Tämä dokumentti sisältää MyPet-sovelluksen Material Design 3 -yhteensopivan design systemin.

## 📋 Sisällysluettelo

1. [Yleiskatsaus](#yleiskatsaus)
2. [Värit (MD3 Color Roles)](#värit-md3-color-roles)
3. [Typografia (MD3 Typography Scale)](#typografia-md3-typography-scale)
4. [Spacing](#spacing)
5. [Border Radius (Shape Scale)](#border-radius-shape-scale)
6. [Elevation](#elevation)
7. [Layout](#layout)
8. [Käyttöohjeet](#käyttöohjeet)

---

## Yleiskatsaus

MyPet-sovellus noudattaa **Material Design 3 (MD3)** -periaatteita ja käyttää **React Native Paper 5** -kirjastoa komponentteihin. Kaikki tyylit on keskitetty `/src/styles/` -kansioon:

- **theme.ts**: MD3-värit, typografia, spacing, elevation, layout, common styles
- **authStyles.ts**: Kirjautumis- ja rekisteröintinäytöt
- **screenStyles.ts**: Kaikki päänäytöt (Home, Pets, Pet Profile, Walk, Health, Calendar, Settings, Profile)
- **index.ts**: Keskitetty export-tiedosto

---

## Värit (MD3 Color Roles)

Material Design 3 käyttää semanttisia väriroleja. MyPet käyttää lämmintä, ruskehtavan-mauve väripalettia, joka sopii lemmikkiteemaan. Värit määritellään `theme.ts`:ssä.

### Primary Colors (Lämmin ruskehtava-mauve)
- `primary`: #6f4f54 - Pääasiallinen brändiväri
- `onPrimary`: #FFFFFF - Teksti/ikonit primary-värin päällä
- `primaryContainer`: #E8DFD6 - Vaaleannettu primary
- `onPrimaryContainer`: #22181A - Teksti primaryContainer-värin päällä

### Secondary Colors (Lämmin harmaanruskea)
- `secondary`: #75685E - Toissijainen väri
- `onSecondary`: #FFFFFF - Teksti secondary-värin päällä
- `secondaryContainer`: #E8DFD6 - Vaaleannettu secondary
- `onSecondaryContainer`: #2B231C - Teksti secondaryContainer-värin päällä

### Tertiary Colors (Lämmin terrakotta)
- `tertiary`: #8B6355 - Aksentit ja korostukset
- `onTertiary`: #FFFFFF
- `tertiaryContainer`: #FFDDD3
- `onTertiaryContainer`: #331915

### Error Colors
- `error`: #B3261E - Virhetilanteet
- `onError`: #FFFFFF
- `errorContainer`: #F9DEDC
- `onErrorContainer`: #410E0B

### Background & Surface (Lämmin off-white)
- `background`: #FFF9F5 - Sovelluksen taustaväri (lämmin off-white)
- `onBackground`: #1F1B18 - Teksti taustan päällä
- `surface`: #FFFFFF - Komponenttien pinnat
- `onSurface`: #1F1B18 - Teksti pintojen päällä
- `surfaceVariant`: #EBE3DB - Vaihtoehtoinen pinta
- `onSurfaceVariant`: #4D4539 - Teksti surfaceVariant-värin päällä

### Outline Colors
- `outline`: #847B73 - Lämmin harmaa rajat
- `outlineVariant`: #D4CCC3 - Vaaleampi rajaus

### Inverse Colors
- `inverseSurface`: #342F2B
- `inverseOnSurface`: #F8F0EB
- `inversePrimary`: #E5C9A8

### Custom Status Colors
- `success`: #4CAF50 - Onnistumisviestit
- `warning`: #FF9800 - Varoitukset
- `info`: #2196F3 - Tiedotteet

### Calendar Event Colors
- `vaccination`: #4CAF50 - Rokotukset
- `veterinary`: #2196F3 - Eläinlääkärikäynnit
- `medication`: #FF9800 - Lääkitykset
- `grooming`: #9C27B0 - Hoitokäynnit
- `other`: #607D8B - Muut tapahtumat

### Utilities
- `shadow`: rgba(0, 0, 0, 0.15) - Varjot
- `scrim`: rgba(0, 0, 0, 0.32) - Tummennus
- `backdrop`: rgba(0, 0, 0, 0.5) - Taustapeite
- `dialogBackground`: rgba(255, 255, 255, 0.95) - Dialogien tausta
- `placeholderText`: rgba(0, 0, 0, 0.3) - Placeholder-teksti

### Käyttöesimerkkejä

```typescript
import { COLORS } from '../styles/theme';

// Primary-väri napeille
<Button 
  mode="contained" 
  buttonColor={COLORS.primary}
  textColor={COLORS.onPrimary}>
  Klikkaa
</Button>

// Kortti surface-värillä
<Card style={{ backgroundColor: COLORS.surface }}>
  <Card.Content>
    <Text style={{ color: COLORS.onSurface }}>Sisältö</Text>
  </Card.Content>
</Card>

// PrimaryContainer taustaväri
<View style={{ backgroundColor: COLORS.primaryContainer, padding: 16 }}>
  <Text style={{ color: COLORS.onPrimaryContainer }}>Otsikko</Text>
</View>
```

---

## Typografia (MD3 Typography Scale)

Material Design 3 määrittelee 13 tekstityyppiä. Kaikki arvot on määritelty `theme.ts`:ssä ja integroitu React Native Paperin teemaan.

### Display (Suuret otsikot)
- `displayLarge`: 57px / 64px / 400 - Suurimmat otsikot
- `displayMedium`: 45px / 52px / 400
- `displaySmall`: 36px / 44px / 400

### Headline (Otsikot)
- `headlineLarge`: 32px / 40px / 400 - Pääotsikot
- `headlineMedium`: 28px / 36px / 400
- `headlineSmall`: 24px / 32px / 400 - Näyttöjen otsikot

### Title (Osion otsikot)
- `titleLarge`: 22px / 28px / 400 - Korttien otsikot
- `titleMedium`: 16px / 24px / 500 - Listat ja alaotsikot
- `titleSmall`: 14px / 20px / 500

### Body (Leipäteksti)
- `bodyLarge`: 16px / 24px / 400 - Suurempi leipäteksti
- `bodyMedium`: 14px / 20px / 400 - Oletusleipäteksti
- `bodySmall`: 12px / 16px / 400 - Pieni leipäteksti

### Label (Napit, labelit)
- `labelLarge`: 14px / 20px / 500 - Napit
- `labelMedium`: 12px / 16px / 500 - Pienet napit, chipit
- `labelSmall`: 11px / 16px / 500 

### Käyttö React Native Paperissa

```tsx
import { Text } from 'react-native-paper';

<Text variant="displaySmall">Iso otsikko</Text>
<Text variant="headlineSmall">Näytön otsikko</Text>
<Text variant="titleLarge">Kortin otsikko</Text>
<Text variant="bodyMedium">Leipätekstiä tässä</Text>
<Text variant="labelLarge">Nappi</Text>
```

### Suora käyttö TYPOGRAPHY-objektista

```typescript
import { TYPOGRAPHY } from '../styles/theme';

<Text style={TYPOGRAPHY.headlineSmall}>Otsikko</Text>
<Text style={TYPOGRAPHY.bodyMedium}>Sisältö</Text>
```

---

## Spacing

Yhdenmukaiset välit asioiden välillä. Käytä aina näitä vakioita kovakoodattujen pikseliarvojen sijaan.

```typescript
export const SPACING = {
  xs: 4,    // Erittäin pieni
  sm: 8,    // Pieni
  md: 16,   // Keskikokoinen (oletusväli)
  lg: 24,   // Suuri
  xl: 32,   // Erittäin suuri
  '2xl': 40,
  '3xl': 48,
  '4xl': 64,
};
```

### Käyttöesimerkkejä

```typescript
import { SPACING } from '../styles/theme';

<View style={{ 
  padding: SPACING.md,           // 16px
  marginBottom: SPACING.lg,      // 24px
  gap: SPACING.sm                // 8px
}}>
  {/* Sisältö */}
</View>
```

---

## Border Radius (Shape Scale)

MD3 shape system muotojen pyöristyksille:

```typescript
export const BORDER_RADIUS = {
  none: 0,           // Ei pyöristystä
  extraSmall: 4,     // Erittäin pieni
  small: 8,          // Pieni
  medium: 12,        // Keskikokoinen
  large: 16,         // Suuri
  extraLarge: 28,    // Erittäin suuri
  full: 9999,        // Täysin pyöreä
};
```

### Käyttö

```typescript
import { BORDER_RADIUS } from '../styles/theme';

<View style={{ borderRadius: BORDER_RADIUS.medium }}>
  {/* Kortti pyöristetyillä kulmilla */}
</View>

<Image style={{ borderRadius: BORDER_RADIUS.full }} />
{/* Täysin pyöreä avatar */}
```

---

## Elevation

MD3 elevation järjestelmä (level0 - level5) luo syvyysvaikutelman varjostuksella. Käytä oikeaa tasoa komponenttityypille.

```typescript
import { ELEVATION } from '../styles/theme';

// Käyttöesimerkkejä
<Card style={ELEVATION.level2}>    // Kortit
<FAB style={ELEVATION.level3} />   // FAB-napit
<View style={ELEVATION.level4}>    // Modaalit
<View style={ELEVATION.level5}>    // Dialogit
```

### Elevation-tasot

- **level0**: Ei varjoa - pohja-elementit
- **level1**: Hyvin hienovarainen - hienovaraiset elementit
- **level2**: Kevyt - kortit, listaelementit
- **level3**: Keskikokoinen - FAB, nostettavat kortit
- **level4**: Korkea - modaalit, navigation drawers
- **level5**: Erittäin korkea - dialogit, date pickers

---

## Layout

Layout-vakiot näyttöjen ja komponenttien asetteluun:

```typescript
export const LAYOUT = {
  // Näytön reunavälit
  screenPadding: 24,      // Vakio näytön reunaväli
  screenPaddingSm: 16,    // Pienempi näytön reunaväli
  
  // Korttien välit
  cardPadding: 16,        // Kortin sisäväli
  cardMargin: 16,         // Korttien välimatka
  
  // Section-välit
  sectionSpacing: 32,     // Osioiden väli
  sectionTitleMargin: 16, // Otsikon alaväli
  
  // Lista-asettelut
  listItemHeight: 72,     // MD3 lista-elementin korkeus
  listItemPadding: 16,
  
  // Napit ja FAB
  buttonHeight: 40,
  buttonMinWidth: 64,
  fabSize: 56,
  fabMargin: 16,
  
  // Input fields
  inputHeight: 56,
  
  // Ikonit
  iconSmall: 18,
  iconMedium: 24,
  iconLarge: 32,
  iconXLarge: 48,
  
  // Avatarit
  avatarSmall: 32,
  avatarMedium: 40,
  avatarLarge: 64,
  avatarXLarge: 128,
};
```

### Käyttö

```typescript
import { LAYOUT } from '../styles/theme';

<View style={{ padding: LAYOUT.screenPadding }}>
  <Text>Näytön sisältö</Text>
</View>

<Avatar.Image 
  size={LAYOUT.avatarLarge} 
  source={{ uri: petImage }} 
/>
```

---

## Käyttöohjeet

### 1. Tuo design tokenit

```typescript
// Tuo tarvittavat komponentit theme.ts:stä
import { 
  COLORS, 
  TYPOGRAPHY, 
  SPACING, 
  BORDER_RADIUS, 
  ELEVATION,
  LAYOUT,
  COMMON_STYLES 
} from '../styles/theme';
```

### 2. Käytä MD3Theme React Native Paperissa

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

### 3. Käytä Paper-komponentteja variant-propseilla

```tsx
import { Text, Button, Card, FAB } from 'react-native-paper';

// Tekstit variant-propsilla
<Text variant="headlineSmall">Näytön otsikko</Text>
<Text variant="bodyMedium">Leipätekstiä</Text>
<Text variant="labelLarge">Kortin labelit</Text>

// Napit mode-propsilla
<Button mode="contained">Contained Button</Button>
<Button mode="outlined">Outlined Button</Button>
<Button mode="text">Text Button</Button>

// Kortit mode ja style -propseilla
<Card mode="elevated" style={ELEVATION.level2}>
  <Card.Content>
    <Text variant="titleLarge">Kortin otsikko</Text>
    <Text variant="bodyMedium">Kortin sisältö</Text>
  </Card.Content>
</Card>

// FAB
<FAB
  icon="plus"
  style={[styles.fab, ELEVATION.level3]}
  color={COLORS.onPrimaryContainer}
/>
```

### 4. Käytä tyylejä screen-tiedostoissa

```typescript
import { authStyles } from '../styles/authStyles';
import { homeStyles } from '../styles/screenStyles';

// LoginScreen.tsx
<View style={authStyles.container}>
  {/* Content */}
</View>

// HomeScreen.tsx
<View style={homeStyles.container}>
  <View style={homeStyles.header}>
    <Text style={homeStyles.title}>MyPet</Text>
  </View>
</View>
```

### 5. Luo omia tyylejä design tokenien avulla

```typescript
import { StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, ELEVATION } from '../styles/theme';

const styles = StyleSheet.create({
  customCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...ELEVATION.level2,
  },
  
  customText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.onSurface,
    marginBottom: SPACING.sm,
  },
  
  customButton: {
    backgroundColor: COLORS.primaryContainer,
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.md,
  },
});
```

### 6. Käytä COMMON_STYLES yleisiin tarkoituksiin

```typescript
import { COMMON_STYLES } from '../styles/theme';

// Valmiit tyylit yleisiin käyttötarkoituksiin
<View style={COMMON_STYLES.container}>
  <Text style={COMMON_STYLES.sectionTitle}>Osio</Text>
  <View style={COMMON_STYLES.row}>
    <Text>Rivi layout</Text>
  </View>
</View>
```

---

## Tiedostojen käyttötarkoitukset

### theme.ts
- **MD3 värit** (COLORS) - kaikki värirollit
- **Typografia** (TYPOGRAPHY) - MD3 typography scale
- **Spacing** (SPACING) - välimatkat
- **Border Radius** (BORDER_RADIUS) - MD3 shape scale
- **Elevation** (ELEVATION) - varjostukset
- **Layout** (LAYOUT) - asetteluarvot
- **Common Styles** (COMMON_STYLES) - usein käytetyt tyylit
- **MD3Theme** - React Native Paper teema-objekti

### authStyles.ts
Kirjautumis- ja rekisteröintinäkymien tyylit:
- Container ja scroll-asettelut
- Logo-asettelut
- Form-kentät ja napit
- Error-viestit
- Link-tyylit

### screenStyles.ts
Kaikki päänäyttöjen tyylit:
- **homeStyles** - kotinäyttö
- **petsStyles** - lemmikkilistat
- **petProfileStyles** - lemmikin profiili
- **addPetStyles** - lemmikin lisäys
- **walkStyles** - lenkkihistoria ja -seuranta
- **walkDetailStyles** - yksittäisen lenkin tiedot
- **mapStyles** - karttanäkymä
- **healthStyles** - terveystiedot
- **vaccinationStyles** - rokotukset
- **medicationStyles** - lääkitykset
- **visitStyles** - eläinlääkärikäynnit
- **weightStyles** - painonseuranta
- **calendarStyles** - kalenteri
- **settingsStyles** - asetukset
- **profileStyles** - käyttäjäprofiili

### index.ts
Keskitetty export kaikista tyyleistä helpompaa importtausta varten.

---

## Lisäresurssit

- [Material Design 3 Guidelines](https://m3.material.io/)
- [React Native Paper Documentation](https://callstack.github.io/react-native-paper/)
- [MD3 Color System](https://m3.material.io/styles/color/overview)
- [MD3 Typography](https://m3.material.io/styles/typography/overview)
- [MD3 Elevation](https://m3.material.io/styles/elevation/overview)

---

## Best Practices

### ✅ Käytä aina design tokeneja

```typescript
// ✅ Hyvä
<View style={{ padding: SPACING.md, backgroundColor: COLORS.surface }} />

// ❌ Huono
<View style={{ padding: 16, backgroundColor: '#ffffff' }} />
```

### ✅ Käytä Paper-komponentteja custom-komponenttien sijaan

```typescript
// ✅ Hyvä
<Button mode="contained">Click</Button>

// ❌ Huono
<TouchableOpacity style={customButtonStyle}>
  <Text>Click</Text>
</TouchableOpacity>
```

### ✅ Käytä variant-propseja Text-komponenteille

```typescript
// ✅ Hyvä
<Text variant="headlineSmall">Otsikko</Text>

// ❌ Huono
<Text style={{ fontSize: 24, fontWeight: '400' }}>Otsikko</Text>
```

### ✅ Käytä semanttisia väriroleja

```typescript
// ✅ Hyvä - semanttinen
<View style={{ backgroundColor: COLORS.primaryContainer }}>
  <Text style={{ color: COLORS.onPrimaryContainer }}>Text</Text>
</View>

// ❌ Huono - suorat värikoodit
<View style={{ backgroundColor: '#E8DFD6' }}>
  <Text style={{ color: '#22181A' }}>Text</Text>
</View>
```

---

**Versio:** 3.0 (Material Design 3)  
**Päivitetty:** Helmikuu 2026  
**React Native Paper:** 5.12  
**Material Design:** 3
