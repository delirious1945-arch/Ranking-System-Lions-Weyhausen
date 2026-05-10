const fs = require('fs');
const path = require('path');

const filesToResolveHead = [
    'src/app/layout.tsx',
    'src/app/page.tsx',
    'src/components/ManualGameForm.tsx',
    'src/app/api/update-snapshot/route.ts',
    'src/app/history/[player_name]/page.tsx',
    'src/lib/match-service.ts'
];

filesToResolveHead.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let newContent = content.replace(/<<<<<<< HEAD\r?\n([\s\S]*?)=======\r?\n[\s\S]*?>>>>>>>[^\r\n]*\r?\n?/g, '$1');
        fs.writeFileSync(fullPath, newContent);
        console.log('Resolved HEAD for ' + file);
    } else {
        console.log('File not found: ' + file);
    }
});

// For lions-config.ts, keep remote (which is the bottom part)
const configPath = path.join(__dirname, 'src/lib/lions-config.ts');
if (fs.existsSync(configPath)) {
    let content = fs.readFileSync(configPath, 'utf8');
    let newContent = content.replace(/<<<<<<< HEAD\r?\n[\s\S]*?=======\r?\n([\s\S]*?)>>>>>>>[^\r\n]*\r?\n?/g, '$1');
    fs.writeFileSync(configPath, newContent);
    console.log('Resolved REMOTE for lions-config.ts');
}

