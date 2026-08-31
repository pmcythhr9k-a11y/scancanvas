import os
from PIL import Image
import numpy as np

def extract_normalized_pixels(image_path, size=(256, 256)):
    img = Image.open(image_path).convert('L')
    img = img.resize(size, Image.Resampling.LANCZOS)
    arr = np.array(img, dtype=np.float32)
    
    # Normalize to 0..1
    arr_min, arr_max = arr.min(), arr.max()
    if arr_max > arr_min:
        norm = (arr - arr_min) / (arr_max - arr_min)
    else:
        norm = arr / 255.0
    return norm

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    examples_dir = os.path.join(base_dir, 'public', 'clinical-examples')
    
    sag_t2_path = os.path.join(examples_dir, 'radiopaedia_case_589343_512.jpg')
    if not os.path.exists(sag_t2_path):
        sag_t2_path = os.path.join(examples_dir, 'sagittal_t2_fs.jpg')
    sag_t1_path = os.path.join(examples_dir, 'sagittal_t1.jpg')
    cor_pd_path = os.path.join(examples_dir, 'coronal_pd.jpg')
    cor_segond_path = os.path.join(examples_dir, 'radiopaedia-acl-coronal-segond.jpg')
    axial_t2_path = os.path.join(examples_dir, 'axial_t2.png')
    sag_acl_path = os.path.join(examples_dir, 'radiopaedia-acl-sagittal-t2.jpg')
    
    print('Extracting real clinical MRI grayscale textures...')
    sag_t2_norm = extract_normalized_pixels(sag_t2_path if os.path.exists(sag_t2_path) else sag_acl_path)
    sag_t1_norm = extract_normalized_pixels(sag_t1_path)
    cor_pd_norm = extract_normalized_pixels(cor_pd_path if os.path.exists(cor_pd_path) else cor_segond_path)
    axial_t2_norm = extract_normalized_pixels(axial_t2_path)
    sag_acl_norm = extract_normalized_pixels(sag_acl_path)
    
    # Quantize to 8-bit array strings for compact embedding (256x256 = 65,536 numbers per template)
    # We can quantize to uint8 (0..255) and store as base64 strings!
    import base64
    
    def to_b64(arr):
        u8 = (arr * 255).astype(np.uint8)
        return base64.b64encode(u8.tobytes()).decode('ascii')
    
    b64_sag_t2 = to_b64(sag_t2_norm)
    b64_sag_t1 = to_b64(sag_t1_norm)
    b64_cor_pd = to_b64(cor_pd_norm)
    b64_axial_t2 = to_b64(axial_t2_norm)
    b64_sag_acl = to_b64(sag_acl_norm)
    
    out_path = os.path.join(base_dir, 'lib', 'fixtures', 'clinical-mri-matrices.ts')
    with open(out_path, 'w') as f:
        f.write('// Real Clinical Knee MRI Grayscale Texture Matrices (Radiopaedia & Clinical Repositories)\n\n')
        f.write('export const CLINICAL_MRI_TEMPLATES = {\n')
        f.write(f'  sagittalT2Fs: "{b64_sag_t2}",\n')
        f.write(f'  sagittalT1: "{b64_sag_t1}",\n')
        f.write(f'  coronalPd: "{b64_cor_pd}",\n')
        f.write(f'  axialT2: "{b64_axial_t2}",\n')
        f.write(f'  sagittalAclTear: "{b64_sag_acl}",\n')
        f.write('};\n\n')
        f.write('''/**
 * Helper to decode base64 256x256 clinical MRI pixel template
 */
export function decodeClinicalTemplate(b64: string): Float32Array {
  if (typeof atob === 'undefined') {
    const buf = Buffer.from(b64, 'base64');
    const out = new Float32Array(buf.length);
    for (let i = 0; i < buf.length; i++) {
      out[i] = buf[i] / 255.0;
    }
    return out;
  }
  const binary = atob(b64);
  const len = binary.length;
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    out[i] = binary.charCodeAt(i) / 255.0;
  }
  return out;
}
''')
    
    print(f'Wrote real clinical MRI textures to {out_path} ({os.path.getsize(out_path)} bytes)')

if __name__ == '__main__':
    main()
