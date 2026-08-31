import fs from 'fs';
import path from 'path';
import https from 'https';

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const request = (currentUrl, redirectCount = 0) => {
      if (redirectCount > 5) {
        return reject(new Error('Too many redirects'));
      }
      https.get(currentUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return request(res.headers.location, redirectCount + 1);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`Failed with status code: ${res.statusCode}`));
        }
        const fileStream = fs.createWriteStream(destPath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
      }).on('error', (err) => {
        reject(err);
      });
    };
    request(url);
  });
}

async function main() {
  const baseDir = path.join(process.cwd(), 'public', 'demo', 'knee');
  const coronalPdDir = path.join(baseDir, 'coronal_pd');
  const coronalT1Dir = path.join(baseDir, 'coronal_t1');
  const axialPdDir = path.join(baseDir, 'axial_pd');
  
  fs.mkdirSync(coronalPdDir, { recursive: true });
  fs.mkdirSync(coronalT1Dir, { recursive: true });
  fs.mkdirSync(axialPdDir, { recursive: true });

  console.log('Downloading 25 slices of Front View Coronal PD-FS (rID 87396)...');
  for (let i = 1; i <= 25; i++) {
    const filename = `ACL_tear,_Wrisberg_rip_and_posterolateral_corner_injury_(Radiopaedia_87396-103719_Coronal_PD_fat_sat_${i}).jpg`;
    const url = `https://nccommons.org/wiki/Special:FilePath/${encodeURIComponent(filename)}`;
    const dest = path.join(coronalPdDir, `slice_${i}.jpg`);
    process.stdout.write(`Coronal PD ${i}/25... `);
    try {
      await downloadFile(url, dest);
      const size = fs.statSync(dest).size;
      console.log(`OK (${size} bytes)`);
    } catch (e) {
      console.log(`FAILED: ${e.message}`);
    }
  }

  console.log('\nDownloading 25 slices of Front View Coronal T1 (rID 87396)...');
  for (let i = 1; i <= 25; i++) {
    const filename = `ACL_tear,_Wrisberg_rip_and_posterolateral_corner_injury_(Radiopaedia_87396-103719_Coronal_T1_${i}).jpg`;
    const url = `https://nccommons.org/wiki/Special:FilePath/${encodeURIComponent(filename)}`;
    const dest = path.join(coronalT1Dir, `slice_${i}.jpg`);
    process.stdout.write(`Coronal T1 ${i}/25... `);
    try {
      await downloadFile(url, dest);
      const size = fs.statSync(dest).size;
      console.log(`OK (${size} bytes)`);
    } catch (e) {
      console.log(`FAILED: ${e.message}`);
    }
  }

  console.log('\nDownloading 25 slices of Cross-Section Axial PD-FS (rID 87396)...');
  for (let i = 1; i <= 25; i++) {
    const filename = `ACL_tear,_Wrisberg_rip_and_posterolateral_corner_injury_(Radiopaedia_87396-103719_Axial_PD_fat_sat_${i}).jpg`;
    const url = `https://nccommons.org/wiki/Special:FilePath/${encodeURIComponent(filename)}`;
    const dest = path.join(axialPdDir, `slice_${i}.jpg`);
    process.stdout.write(`Axial PD ${i}/25... `);
    try {
      await downloadFile(url, dest);
      const size = fs.statSync(dest).size;
      console.log(`OK (${size} bytes)`);
    } catch (e) {
      console.log(`FAILED: ${e.message}`);
    }
  }

  console.log('\nAll multi-planar knee series downloaded successfully!');
}

main().catch(console.error);
