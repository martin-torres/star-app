# Weight-Based Menu Items Setup

This guide explains how to add weight-based menu items (Chicharrón, Carnitas, Morcón, Higado) to your PocketBase database.

## What Was Added

### Frontend Changes
1. **TypeScript Types** - Added optional `isWeightBased`, `weightPricePerKg`, and `weightInGrams` properties
2. **Data Mappers** - Updated to handle optional fields from database
3. **Weight Order Modal** - New modal component for weight-based ordering
4. **MenuView** - Updated to show weight-based items with modal trigger
5. **CheckoutView** - Updated to display weight in grams

### Database Scripts
1. **seed-weight-items.js** - Creates menu items with weight-based properties
2. **seed-especialidades-category.js** - Adds "especialidades" category to settings
3. **seed-all-weight-items.js** - Combined script (recommended)

## How to Use

### Step 1: Run the Seeding Script

```bash
node scripts/seed-all-weight-items.js
```

This will:
- Create 4 menu items: Chicharrón, Carnitas, Morcón, Higado
- Add the "especialidades" category to restaurant settings
- Auto-translate descriptions to English and Korean

### Step 2: Restart Your Development Server

```bash
npm run dev
```

### Step 3: Check the App

1. Open the app in your browser
2. Navigate to the Menu
3. You should see a new "Especialidades" category
4. Click on any item (e.g., Chicharrón)
5. The weight-based modal will open

## Database Items Created

| Item | Price per Kg | Category |
|------|--------------|----------|
| Chicharrón | 580 MXN | especialidades |
| Carnitas | 580 MXN | especialidades |
| Morcón | 420 MXN | especialidades |
| Higado | 250 MXN | especialidades |

## How It Works

### For Users
1. Click on a weight-based item
2. Modal opens showing price per kg
3. Enter grams or pesos
4. See live price calculation
5. Use quick presets (1/4 kg, 1/2 kg, etc.)
6. Confirm to add to cart

### In Cart
- Weight items show as "250g" (not "1x")
- Standard items show as "1x"
- Trash button only appears for single-item standard orders

## Database Schema

The items are created with these fields:
- `category`: "especialidades"
- `isWeightBased`: true
- `weightPricePerKg`: (580, 580, 420, 250)
- `price`: 0 (base price for weight-based items)
- `active`: true

## Troubleshooting

### Items Not Appearing
1. Make sure you ran the seeding script
2. Restart your development server
3. Check PocketBase Admin UI to verify items exist
4. Check restaurant_settings.categories to verify "especialidades" is present

### Modal Not Opening
1. Verify `isWeightBased: true` in database
2. Check browser console for errors
3. Ensure the item is in "especialidades" category

### Price Calculations Wrong
1. Verify `weightPricePerKg` is correct in database
2. Check that the item has `isWeightBased: true`
3. Restart the app after database changes

## Adding More Items

To add more weight-based items, edit `scripts/seed-all-weight-items.js`:

```javascript
{
  name: 'Your Item',
  description: '',
  price: 0,
  category: 'especialidades',
  image: '',
  isWeightBased: true,
  weightPricePerKg: 500, // Your price per kg
  active: true,
}
```

Then run the script again.

## Removing Items

To remove items from the database:
1. Go to PocketBase Admin UI (http://localhost:8090/_/)
2. Navigate to menu_items collection
3. Delete the items you want to remove
4. Restart your development server

## Notes

- The auto-translation hook will automatically create EN/KO translations for new items
- Items can be easily added or removed without code changes
- The system is fully backward compatible with existing items
- No database schema changes were required