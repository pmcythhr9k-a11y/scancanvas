const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dirs = [
  path.join(__dirname, '../public/demo-assets/rid87396'),
  path.join(__dirname, '../public/demo-assets/rid147131')
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

function downloadImageWithCurl(url, dest) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
    console.log(`Already exists: ${path.basename(dest)}`);
    return;
  }
  
  try {
    console.log(`Downloading ${path.basename(dest)}...`);
    // Use curl -L to follow redirects, -s for silent
    execSync(`curl -L -s -o "${dest}" "${url}"`);
  } catch (err) {
    console.error(`Failed to download ${url}: ${err.message}`);
  }
}

function run() {
  // rID 87396 (ACL tear, slices 1 to 25)
  console.log('Downloading rID 87396...');
  for (let i = 1; i <= 25; i++) {
    const filename = `ACL_tear,_Wrisberg_rip_and_posterolateral_corner_injury_(Radiopaedia_87396-103719_Sagittal_PD_fat_sat_${i}).jpg`;
    const url = `https://nccommons.org/wiki/Special:FilePath/${encodeURIComponent(filename)}`;
    const dest = path.join(dirs[0], `slice_${i.toString().padStart(2, '0')}.jpg`);
    downloadImageWithCurl(url, dest);
  }
  
  // rID 147131 (Normal, slices 32 to 62)
  console.log('Downloading rID 147131...');
  for (let i = 32; i <= 62; i++) {
    const filename = `Normal_MRI_Knee_(Radiopaedia_147131-122553_Sagittal_${i}).jpg`;
    const url = `https://nccommons.org/wiki/Special:FilePath/${encodeURIComponent(filename)}`;
    const destIdx = i - 31;
    const dest = path.join(dirs[1], `slice_${destIdx.toString().padStart(2, '0')}.jpg`);
    downloadImageWithCurl(url, dest);
  }
  
  console.log('Done downloading all images.');
}

run();
