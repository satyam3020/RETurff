const https = require('https');

const urls = [
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018',
    'https://images.unsplash.com/photo-1459865264687-595d652de67e',
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e',
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2', // Slots fallback
    'https://images.unsplash.com/photo-1622228514585-783bf2fcc02f', // Pickleball
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8', // Padel
    // finding better football turf:
    'https://images.unsplash.com/photo-1518605363189-e1f98bc4351b',
    // a great stadium shot
    'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9',
    'https://images.unsplash.com/photo-1518091043644-c1d44570a2c9',
    'https://images.unsplash.com/photo-1554629947-334ff61d85dc'
];

urls.forEach(url => {
    https.get(url + '?w=800', res => {
        console.log(`${res.statusCode} - ${url}`);
    });
});
