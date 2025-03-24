export const ImageFilter = {
  normal: 'none',
  clarendon: 'saturate(1.2) contrast(1.2)',
  gingham: 'sepia(0.15) contrast(1.1) brightness(1.1)',
  moon: 'grayscale(1)',
  lark: 'brightness(1.1) contrast(.9) saturate(1.1)',
  reyes: 'sepia(0.22) brightness(1.1) contrast(0.85)',
  juno: 'saturate(1.4) contrast(1.1)',
  slumber: 'saturate(.66) brightness(1.05)',
  crema: 'sepia(0.5) contrast(1.1)',
  ludwig: 'saturate(1.3) contrast(1.3)',
  aden: 'sepia(0.2) brightness(1.15) saturate(1.4)',
  perpetua: 'contrast(1.1) brightness(1.25) saturate(1.1)',
} as const;

export type ImageFilter = keyof typeof ImageFilter;

export async function applyFilter(file: File, filter: ImageFilter): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (ctx) {
        ctx.filter = ImageFilter[filter];
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create blob'));
          },
          'image/jpeg',
          0.9
        );
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
} 