const fs = require('fs');
const { createCanvas } = require('canvas');

// Photo names and their corresponding emotions and colors
const photos = [
    ['111111', 'Extremely Sad', '#dc2626'],
    ['1010', 'Sad', '#ea580c'],
    ['999', 'Unhappy', '#d97706'],
    ['888', 'Neutral', '#65a30d'],
    ['777', 'Slightly Happy', '#16a34a'],
    ['666', 'Happy', '#0d9488'],
    ['555', 'Very Happy', '#0891b2'],
    ['444', 'Extremely Happy', '#2563eb'],
    ['333', 'Ecstatic', '#7c3aed'],
    ['222', 'Overjoyed', '#c026d3'],
    ['111', 'Perfect', '#ec4899']
];

function createPlaceholderImage(name, emotion, color, index) {
    const canvas = createCanvas(120, 120);
    const ctx = canvas.getContext('2d');
    
    // Fill background
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 120, 120);
    
    // Add white border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, 117, 117);
    
    // Add number
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(index.toString(), 60, 35);
    
    // Add emotion text
    ctx.font = '12px Arial';
    const words = emotion.split(' ');
    ctx.fillText(words[0], 60, 55);
    if (words.length > 1) {
        ctx.fillText(words[1], 60, 70);
    }
    
    // Save as PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`${name}.png`, buffer);
    console.log(`Created ${name}.png`);
}

// Create all images
photos.forEach(([name, emotion, color], index) => {
    createPlaceholderImage(name, emotion, color, index);
});

console.log('All placeholder images created successfully!');
