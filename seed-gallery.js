const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedGallery() {
    console.log('Seeding gallery items...');

    const galleryItems = [
        {
            title: 'Cultural Celebration 2025',
            description: 'A vibrant celebration of our community heritage with traditional dances, music, and cultural performances. Members came together in traditional Kushwaha attire to honor our rich cultural legacy and pass it on to the next generation.',
            imageUrl: '/assets/gallery/cultural_event.png',
            category: 'event',
            eventDate: 'March 15, 2025',
            order: 1,
        },
        {
            title: 'Education Scholarship Program',
            description: 'Our annual scholarship program providing educational support to deserving students from the Kushwaha community. This workshop helped students with academic guidance, study materials, and mentorship for their future success.',
            imageUrl: '/assets/gallery/education_program.png',
            category: 'program',
            eventDate: 'January 20, 2025',
            order: 2,
        },
        {
            title: 'Community Unity Gathering',
            description: 'A large community gathering bringing together members from across Biratnagar. The event featured speeches from community leaders, cultural performances, and discussions about our collective future and welfare initiatives.',
            imageUrl: '/assets/gallery/community_gathering.png',
            category: 'event',
            eventDate: 'February 10, 2025',
            order: 3,
        },
        {
            title: 'Youth Empowerment Initiative',
            description: 'Empowering our youth through skill development workshops, career guidance sessions, and networking opportunities. This program focuses on building confidence and providing resources for the next generation of community leaders.',
            imageUrl: '/assets/gallery/youth_program.png',
            category: 'program',
            eventDate: 'December 5, 2024',
            order: 4,
        },
        {
            title: 'Festival of Lights Celebration',
            description: 'A joyous celebration of traditional festivals with beautiful rangoli decorations, oil lamps, and community prayers. Families came together to celebrate our cultural traditions and strengthen community bonds.',
            imageUrl: '/assets/gallery/festival_celebration.png',
            category: 'event',
            eventDate: 'November 12, 2024',
            order: 5,
        },
        {
            title: 'Free Health Camp',
            description: 'A community health initiative providing free medical checkups, consultations, and medicines to those in need. Medical professionals volunteered their time to serve the community and promote health awareness.',
            imageUrl: '/assets/gallery/health_camp.png',
            category: 'program',
            eventDate: 'October 28, 2024',
            order: 6,
        },
    ];

    for (const item of galleryItems) {
        await prisma.galleryItem.create({
            data: item,
        });
    }

    console.log('✅ Gallery items seeded successfully!');
}

seedGallery()
    .catch((error) => {
        console.error('Error seeding gallery:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
