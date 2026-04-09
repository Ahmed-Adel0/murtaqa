
import fs from 'fs';
import path from 'path';

const teachersDataPath = 'c:/Users/Ahmed_Adel/Downloads/BeboCademy/src/lib/teachers-data.ts';
const imgsDirPath = 'c:/Users/Ahmed_Adel/Downloads/BeboCademy/public/assets/imgs';

const mapping = {
  "محمد أبو الحديد.jpeg": "mohammed-abu-alhadid.jpeg",
  "أحمد عنتر.jpeg": "ahmed-antar.jpeg",
  "هشام محمد.jpeg": "hisham-mohammed.jpeg",
  "محمد الشعراوي.jpeg": "mohammed-shaarawi.jpeg",
  "اسماعيل عبد المغني.jpeg": "ismaeel-abdelmoghni.jpeg",
  "ابراهيم عيد.jpeg": "ibrahim-eid.jpeg",
  "احمد عطا صابر.jpg": "ahmed-ata-saber.jpg",
  "سيد قاعود.jpeg": "sayed-qaoud.jpeg",
  "محمد علي محجوب.jpeg": "mohammed-ali-mahjoub.jpeg",
  "نادر صابر.jpeg": "nader-saber.jpeg",
  "ياسر صابر.jpeg": "yaser-saber.jpeg",
  "رمضان الهوارى.jpeg": "ramadan-al-hawari.jpeg",
  "عبدالمنعم حسام.jpeg": "abdelmonem-hossam.jpeg",
  "محمد عبد الحكيم.jpeg": "mohammed-abdelhakim.jpeg",
  "محمد  احمد سعد.jpg": "mohammed-ahmed-saad.jpg",
  "هاشم السواق.jpg": "hashem-al-sawaq.jpg",
  "محمود مسلم.jpeg": "mahmoud-muslim.jpeg",
  "فتوح قطب البسيوني.jpg": "fatouh-qutb.jpg",
  "مصطفي عبد الرازق.jpeg": "mustafa-abdelrazek.jpeg",
  "أحمد معروف.jpeg": "ahmed-marouf.jpeg",
  "هاني عبد الوهاب العوضي.jpeg": "hany-elawady.jpeg",
  "رضا محمد الصابر.jpeg": "reda-amar.jpeg",
  "محمد عبد العليم.jpeg": "mohammed-abdelalim.jpeg",
  "أحمد السيد محمد.jpeg": "ahmed-elsayed.jpeg",
  "عبدالعزيز علي.jpeg": "abdelaziz-ali.jpeg",
  "محمد عبدالسلام.jpeg": "mohammed-abdessalam.jpeg",
  "محمد عبد الحميد.jpeg": "mohammed-abdelhamid.jpeg",
  "رياض عبدالعظيم سلام.jpeg": "ryad-salam.jpeg",
  "عبداللطيف شاكر .jpeg": "abdellatif-shaker.jpeg",
  "محمد عبد الله موسى.jpeg": "mohammed-moussa.jpeg",
  "احمد جاد.jpeg": "ahmed-gad.jpeg"
};

// 1. Rename files physically
console.log('Renaming files...');
for (const [arabic, english] of Object.entries(mapping)) {
  const oldPath = path.join(imgsDirPath, arabic);
  const newPath = path.join(imgsDirPath, english);
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`Renamed: ${arabic} -> ${english}`);
  } else {
    console.log(`Skipped (not found): ${arabic}`);
  }
}

// 2. Update teachers-data.ts
console.log('Updating teachers-data.ts...');
let content = fs.readFileSync(teachersDataPath, 'utf8');
for (const [arabic, english] of Object.entries(mapping)) {
  const oldRef = `/assets/imgs/${arabic}`;
  const newRef = `/assets/imgs/${english}`;
  content = content.split(oldRef).join(newRef);
}

fs.writeFileSync(teachersDataPath, content);
console.log('Done!');
