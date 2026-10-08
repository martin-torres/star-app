# Star Multi-Tenant Restaurant App - Setup Guide

## Overview

Star is a multi-tenant restaurant app supporting two modes:
- **To-Go**: Takeout and delivery orders (original Dulceria behavior)
- **Dine-In**: QR-code scanning, table selection, and in-restaurant dining experience
- **Both**: Both modes available simultaneously

Each restaurant is a tenant with its own data isolated by `restaurant_id`.

## Prerequisites

- Node.js 18+
- PocketBase server running
- A PocketBase admin account

## Quick Start

### 1. Clone and install

```bash
cd ~/templates/star-app
npm install
```

### 2. Start PocketBase

```bash
# Download pocketbase from https://pocketbase.io
./pocketbase serve --http=127.0.0.1:8090
```

### 3. Setup Collections

The PocketBase schema is defined in `pocketbase-schema.json`.

Run the setup script to create all collections:

```bash
PB_ADMIN_EMAIL=admin@example.com PB_ADMIN_PASSWORD=yourpassword npm run setup
```

This creates the following collections:
- `restaurants` - Multi-tenant restaurant profiles
- `menu_items` - Menu items with restaurant_id relation
- `tables` - Dine-in tables with location and QR codes
- `orders` - Orders (pickup, delivery, and dine-in)
- `promos` - Promotions per restaurant
- `visitors` - Visitor tracking per restaurant
- `settings` - Per-restaurant settings
- `dining_sessions` - Active dining sessions (optional)
- `bill_requests` - Bill requests for dine-in (optional)

### 4. Configure Environment

Create `.env` in the project root:

```env
VITE_POCKETBASE_URL=http://localhost:8090
VITE_ADMIN_EMAIL=admin@example.com
VITE_ADMIN_PASSWORD=yourpassword
```

### 5. Create a Restaurant

Via PocketBase Admin UI or API:
1. Go to http://localhost:8090/_/ (Admin UI)
2. Create a new entry in the `restaurants` collection
3. Set at minimum: name, slug (unique), currency, mode ('to-go', 'dine-in', or 'both')
4. Note the auto-generated ID

### 6. Create Settings

Run the seed script (creates sample settings):

```bash
PB_ADMIN_EMAIL=admin@example.com PB_ADMIN_PASSWORD=yourpassword npm run seed:settings
```

Or create via Admin UI in the `settings` collection with:
- `restaurant_id`: relation to your restaurant
- `data`: JSON object with your app settings (name, colors, etc.)

### 7. Start Development Server

```bash
npm run dev
```

### 8. Access the App

- **To-Go mode**: `http://localhost:5173?restaurant_id=YOUR_RESTAURANT_ID`
- **Dine-In mode**: `http://localhost:5173?restaurant_id=YOUR_RESTAURANT_ID` (auto-detected from settings mode)
- **Admin panel**: `http://localhost:5173?mode=dashboard` (PIN: 1234)
- **Kitchen view**: `http://localhost:5173?mode=admin`
- **Data/Analytics**: `http://localhost:5173?mode=data`

## Multi-Tenant URL Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| `restaurant_id` | ID | Load data for specific restaurant |
| `mode` | `admin`, `data`, `dashboard` | Switch to internal views |

## Collection Schema

See `pocketbase-schema.json` for the full schema definition.

Key fields:
- **restaurants.mode**: `"to-go"`, `"dine-in"`, or `"both"`
- **tables.location**: `"patio"`, `"window"`, `"balcony"`, `"middle"`, `"bar"`, `"private"`, `"outdoor"`
- **orders.order_type**: `"pickup"`, `"delivery"`, `"dine-in"`
- **orders.table_id**: Relation to tables (for dine-in orders)

## Dine-In Flow

1. Customer scans QR code on table
2. App loads restaurant info
3. Customer selects a table
4. Menu is displayed for ordering
5. Orders are sent to kitchen
6. Customer can request bill and pay

## Deployment

See `DEPLOYMENT.md` for production deployment instructions using Docker and Fly.io.

## Generating QR Codes for Tables

Use the `generate-qr.py` script:

```bash
python3 generate-qr.py --restaurant-id YOUR_ID --table-id TABLE_ID
```

Or use any QR generator with the URL format:
`https://yourdomain.com?restaurant_id=TABLE_ID`
