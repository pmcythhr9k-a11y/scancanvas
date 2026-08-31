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
  const acuteDir = path.join(process.cwd(), 'public', 'demo', 'knee', 'acute');
  const normalDir = path.join(process.cwd(), 'public', 'demo', 'knee', 'normal');
  
  fs.mkdirSync(acuteDir, { recursive: true });
  fs.mkdirSync(normalDir, { recursive: true });

  console.log('Downloading 25 slices of acute ACL tear (rID 87396)...');
  for (let i = 1; i <= 25; i++) {
    const filename = `ACL_tear,_Wrisberg_rip_and_posterolateral_corner_injury_(Radiopaedia_87396-103719_Sagittal_PD_fat_sat_${i}).jpg`;
    const url = `https://nccommons.org/wiki/Special:FilePath/${encodeURIComponent(filename)}`;
    const dest = path.join(acuteDir, `slice_${i}.jpg`);
    process.stdout.write(`Downloading acute slice ${i}/25... `);
    try {
      await downloadFile(url, dest);
      const size = fs.statSync(dest).size;
      console.log(`OK (${size} bytes)`);
    } catch (e) {
      console.log(`FAILED: ${e.message}`);
    }
  }

  console.log('\nDownloading 31 slices of normal knee (rID 147131)...');
  for (let i = 32; i <= 62; i++) {
    const instanceNum = i - 31;
    const filename = `Normal_MRI_Knee_(Radiopaedia_147131-122553_Sagittal_${i}).jpg`;
    const url = `https://nccommons.org/wiki/Special:FilePath/${encodeURIComponent(filename)}`;
    const dest = path.join(normalDir, `slice_${instanceNum}.jpg`);
    process.stdout.write(`Downloading normal slice ${instanceNum}/31 (raw ${i})... `);
    try {
      await downloadFile(url, dest);
      const size = fs.statSync(dest).size;
      console.log(`OK (${size} bytes)`);
    } catch (e) {
      console.log(`FAILED: ${e.message}`);
    }
  }

  console.log('\nAll demo stacks downloaded successfully!');
}

main().catch(console.error);
