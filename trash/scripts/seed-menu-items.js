import PocketBase from 'pocketbase';

const PB_URL = process.env.PB_URL || 'http://127.0.0.1:8090';
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL;
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD;

if (!PB_ADMIN_EMAIL || !PB_ADMIN_PASSWORD) {
  console.error('Error: PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD environment variables are required');
  process.exit(1);
}

const pb = new PocketBase(PB_URL);

const menuItems = [
  {
    name: 'Desayuno El Arrocito',
    description: 'Chilaquiles verdes o rojos, huevos al gusto, frijoles, arroz y tortillas',
    price: 85,
    category: 'desayuno',
    image: '',
    active: true,
  },
  {
    name: 'Huevos Rancheros',
    description: 'Huevos fritos sobre tortilla con salsa ranchera, frijoles y arroz',
    price: 75,
    category: 'desayuno',
    image: '',
    active: true,
  },
  {
    name: 'Chilaquiles con Huevo',
    description: 'Tortilla frita con salsa verde o roja, crema, queso y huevo',
    price: 80,
    category: 'desayuno',
    image: '',
    active: true,
  },
  {
    name: 'Arroz a la Tumbada',
    description: 'Arroz rojo con mariscos y camarones, servido con limón y salsa',
    price: 145,
    category: 'arroz',
    image: '',
    active: true,
  },
  {
    name: 'Arroz con Pollo',
    description: 'Arroz rojo con pollo deshebrado y verduras',
    price: 95,
    category: 'arroz',
    image: '',
    active: true,
  },
  {
    name: 'Arroz con Carne',
    description: 'Arroz rojo con carne de res en trozos y verduras',
    price: 110,
    category: 'arroz',
    image: '',
    active: true,
  },
  {
    name: 'Mole Poblano',
    description: 'Pollo en mole poblano con arroz, frijoles y tortillas',
    price: 135,
    category: 'guisado',
    image: '',
    active: true,
  },
  {
    name: 'Bistec a la Mexicana',
    description: 'Bistec con salsa de jitomate, cebolla, chile y guacamole',
    price: 125,
    category: 'guisado',
    image: '',
    active: true,
  },
  {
    name: 'Cochinita Pibil',
    description: 'Cerdo marinado en achiote, servido con cebolla morada y habanero',
    price: 130,
    category: 'guisado',
    image: '',
    active: true,
  },
  {
    name: 'Coca-Cola 350ml',
    description: 'Refresco de cola 350ml',
    price: 25,
    category: 'bebida',
    image: '',
    active: true,
  },
  {
    name: 'Coca-Cola 600ml',
    description: 'Refresco de cola 600ml',
    price: 35,
    category: 'bebida',
    image: '',
    active: true,
  },
  {
    name: 'Agua Natural',
    description: 'Agua natural 1L',
    price: 20,
    category: 'bebida',
    image: '',
    active: true,
  },
  {
    name: 'Agua de Horchata',
    description: 'Agua de horchata preparada en casa',
    price: 30,
    category: 'bebida',
    image: '',
    active: true,
  },
  {
    name: 'Agua de Jamaica',
    description: 'Agua de jamaica natural',
    price: 30,
    category: 'bebida',
    image: '',
    active: true,
  },
  {
    name: 'Tacos de Canasta (3 pzs)',
    description: 'Tacos de frijol, papa o chicharrón',
    price: 45,
    category: 'antojito',
    image: '',
    active: true,
  },
  {
    name: 'Quesadilla de Flor de Calabaza',
    description: 'Quesadilla hecha a mano con queso Oaxaca',
    price: 55,
    category: 'antojito',
    image: '',
    active: true,
  },
  {
    name: 'Gordita de Chicharrón',
    description: 'Gordita de maíz rellena de chicharrón en salsa verde',
    price: 35,
    category: 'antojito',
    image: '',
    active: true,
  },
  {
    name: 'Flan Napolitano',
    description: 'Flan casero con caramelo',
    price: 45,
    category: 'postre',
    image: '',
    active: true,
  },
  {
    name: 'Pastel de Chocolate',
    description: 'Rebanada de pastel de chocolate',
    price: 50,
    category: 'postre',
    image: '',
    active: true,
  },
  {
    name: 'Extra Tortillas (4 pzs)',
    description: 'Tortillas de maíz adicionales',
    price: 10,
    category: 'extra',
    image: '',
    active: true,
  },
  {
    name: 'Extra Guacamole',
    description: 'Porción de guacamole',
    price: 25,
    category: 'extra',
    image: '',
    active: true,
  },
  {
    name: 'Extra Frijoles',
    description: 'Porción adicional de frijoles',
    price: 15,
    category: 'extra',
    image: '',
    active: true,
  },
];

async function seedMenu() {
  try {
    await pb.collection('_superusers').authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
    console.log('Authenticated with PocketBase');

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const item of menuItems) {
      try {
        const existing = await pb.collection('menu_items').getFirstListItem(`name="${item.name}"`).catch(() => null);

        if (existing) {
          await pb.collection('menu_items').update(existing.id, item);
          updated++;
        } else {
          await pb.collection('menu_items').create(item);
          created++;
        }
      } catch (err) {
        console.error(`Error with item "${item.name}":`, err.message);
        skipped++;
      }
    }

    console.log(`Menu seeded: ${created} created, ${updated} updated, ${skipped} skipped`);
    console.log('El Arrocito menu seeded successfully!');
  } catch (error) {
    console.error('Error seeding menu:', error);
    process.exit(1);
  }
}

seedMenu();
