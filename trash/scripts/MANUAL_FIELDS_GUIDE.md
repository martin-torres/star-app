# Manual Fields Addition Guide

## Critical: You Must Add These Fields Manually

PocketBase v0.26.8 does not support programmatically adding fields to the schema. You must add them manually through the Admin UI.

## Steps to Add Fields

### 1. Open PocketBase Admin UI
- URL: http://localhost:8090/_/
- Login with your admin credentials

### 2. Add Fields to menu_items Collection

1. Click on **Collections** in the left sidebar
2. Click on **menu_items**
3. Click on **Add field** button
4. Add these 2 fields:

#### Field 1: isWeightBased
- **Name**: `isWeightBased`
- **Type**: `Bool`
- **Default**: `false`
- **Required**: No
- **System**: No
- **Hidden**: No
- **List**: No
- **Min**: (leave empty)
- **Max**: (leave empty)
- **Options**: (leave empty)

#### Field 2: weightPricePerKg
- **Name**: `weightPricePerKg`
- **Type**: `Number`
- **Default**: `0`
- **Required**: No
- **System**: No
- **Hidden**: No
- **List**: No
- **Min**: `0`
- **Max**: (leave empty)
- **Options**: (leave empty)

5. Click **Save**

### 3. Add Field to orders Collection

1. Click on **Collections** in the left sidebar
2. Click on **orders**
3. Click on **Add field** button
4. Add this field:

#### Field: weightInGrams
- **Name**: `weightInGrams`
- **Type**: `Number`
- **Default**: `0`
- **Required**: No
- **System**: No
- **Hidden**: No
- **List**: No
- **Min**: `0`
- **Max**: (leave empty)
- **Options**: (leave empty)

5. Click **Save**

### 4. Verify Items Have Correct Fields

1. Go to **Collections** → **menu_items**
2. Click on one of the items (e.g., Chicharrón)
3. Check that the item has:
   - `isWeightBased`: true
   - `weightPricePerKg`: 580
   - `category`: especialidades

### 5. Restart Your Development Server

```bash
npm run dev
```

### 6. Test the Modal

1. Open the app
2. Navigate to Menu
3. Click on any item in "Especialidades" category
4. The modal should now open with price per kg and two-way input

## Why This Is Necessary

PocketBase does not allow adding fields programmatically for security reasons. The schema must be defined manually to prevent accidental schema changes.

## After Adding Fields

Once you've added the fields manually, the items will have the correct data, and the modal will work properly.