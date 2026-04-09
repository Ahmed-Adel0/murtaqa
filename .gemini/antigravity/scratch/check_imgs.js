
import fs from 'fs';
import path from 'path';

// This is a scratch script to check for image mismatches
const teachersDataPath = 'c:/Users/Ahmed_Adel/Downloads/BeboCademy/src/lib/teachers-data.ts';
const imgsDirPath = 'c:/Users/Ahmed_Adel/Downloads/BeboCademy/public/assets/imgs';

const teachersData = fs.readFileSync(teachersDataPath, 'utf8');
const filesInPublic = fs.readdirSync(imgsDirPath);

const imgPathsInData = teachersData.match(/\/assets\/imgs\/[^"']+/g) || [];
const uniqueImgPaths = [...new Set(imgPathsInData)];

console.log('--- Images in Data but Missing in Folder ---');
uniqueImgPaths.forEach(p => {
    const filename = path.basename(p);
    if (!filesInPublic.includes(filename)) {
        console.log(`MISSING: ${filename} (Path in data: ${p})`);
    }
});

console.log('\n--- Images in Folder but Missing in Data ---');
filesInPublic.forEach(f => {
    const p = `/assets/imgs/${f}`;
    if (!uniqueImgPaths.includes(p)) {
        console.log(`EXTRA: ${f}`);
    }
});
