const User = require('./models/User');
const MenuItem = require('./models/MenuItem');
const Review = require('./models/Review');
const Staff = require('./models/Staff');

const defaultMenuItems = [
    { name: "Spaghetti Carbonara", price: 110, category: "pasta", image: "Pics/1.jpeg" },
    { name: "Vesuvius Pomodoro", price: 120, category: "pasta", image: "Pics/2.jpeg" },
    { name: "Lasagna verdi", price: 150, category: "pasta", image: "Pics/Lasan.jpeg" },
    { name: "Margherita DOC", price: 130, category: "pizza", image: "Pics/Seg.jpeg" },
    { name: "Bianca al Tartufo", price: 180, category: "pizza", image: "Pics/3.jpeg" },
    { name: "The Garden Flame", price: 145, category: "pizza", image: "Pics/5.jpeg" },
    { name: "Sicilian Sunset", price: 65, category: "drinks", image: "Pics/6.jpeg" },
    { name: "Limonata Zenzero", price: 55, category: "drinks", image: "Pics/7.jpeg" },
    { name: "Espresso Tonic", price: 50, category: "drinks", image: "Pics/8.jpeg" },
    { name: "Classic Tiramisù", price: 85, category: "dessert", image: "Pics/Cake.jpeg" },
    { name: "Vanilla Panna Cotta", price: 75, category: "dessert", image: "Pics/9.jpeg" },
    { name: "Sicilian Cannoli", price: 80, category: "dessert", image: "Pics/10.jpeg" }
];

const defaultReviews = [
    { stars: 5, quote: "The Margherita DOC is easily the best in the city. You can really taste the quality of the wood-fired oven. An absolute must-visit.", initials: "MA", name: "Marco A." },
    { stars: 5, quote: "I love that they focus on quality ingredients. The lasagna was rich and authentic. Plus, the alcohol-free mocktails are actually creative and delicious!", initials: "SL", name: "Sarah L." },
    { stars: 5, quote: "The atmosphere is perfect for a business dinner. Professional service and the truffle tagliatelle was unforgettable.", initials: "JD", name: "Julian D." },
    { stars: 5, quote: "Finally, a high-end Italian restaurant that understands artisanal drinks! The Sicilian Sunset is refreshing and looks beautiful.", initials: "RK", name: "Robert K." },
    { stars: 5, quote: "As a student of business, I appreciate the branding here. But as a foodie, I appreciate that crust! Thin, crispy, and perfectly charred.", initials: "AH", name: "Ahmed H." },
    { stars: 5, quote: "The Tiramisu is life-changing. It's light, creamy, and has just the right amount of espresso kick. Great spot for dessert enthusiasts.", initials: "EM", name: "Elena M." }
];

const seedDatabase = async () => {
    try {
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            const defaultUsers = [
                { email: 'admin@flourandflame.com', password: 'Admin123!', role: 'Admin' },
                { email: 'staff@flourandflame.com', password: 'Staff123!', role: 'Staff' },
                { email: 'kitchen@flourandflame.com', password: 'Kitchen123!', role: 'Kitchen' }
            ];
            for (const u of defaultUsers) {
                await User.create(u);
            }
            console.log('Default users seeded');
        }

        const staffCount = await Staff.countDocuments();
        if (staffCount === 0) {
            await Staff.insertMany([
                { name: 'Admin User', email: 'admin@flourandflame.com', role: 'Admin' },
                { name: 'Front Desk', email: 'staff@flourandflame.com', role: 'Staff' },
                { name: 'Head Chef', email: 'kitchen@flourandflame.com', role: 'Kitchen' }
            ]);
            console.log('Default staff seeded');
        }

        const menuCount = await MenuItem.countDocuments();
        if (menuCount === 0) {
            await MenuItem.insertMany(defaultMenuItems);
            console.log('Default menu items seeded');
        }

        const reviewCount = await Review.countDocuments();
        if (reviewCount === 0) {
            await Review.insertMany(defaultReviews);
            console.log('Default reviews seeded');
        }
    } catch (err) {
        console.error('Seeding error:', err.message);
    }
};

module.exports = seedDatabase;
