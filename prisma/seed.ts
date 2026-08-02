import { prisma } from "../src/lib/prisma.js"; // Keep curly braces



async function main() {
    const categories = [
        { name: 'Cycling', slug: 'cycling', description: 'Bicycles, helmets, and cycling gear' },
        { name: 'Camping', slug: 'camping', description: 'Tents, sleeping bags, and camp stoves' },
        { name: 'Fitness', slug: 'fitness', description: 'Dumbbells, yoga mats, and exercise gear' },
        { name: 'Water Sports', slug: 'water-sports', description: 'Kayaks, life jackets, and surfboards' },
    ];

    console.log('Seeding categories...');

    for (const category of categories) {
        await prisma.category.upsert({
            where: { slug: category.slug },
            update: {},
            create: category,
        });
    }

    console.log('Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });