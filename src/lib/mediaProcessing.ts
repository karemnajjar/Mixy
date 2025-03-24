import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const ffmpeg = createFFmpeg({ log: true });

export class MediaProcessor {
  private static instance: MediaProcessor;
  private initialized = false;

  private constructor() {}

  static async getInstance(): Promise<MediaProcessor> {
    if (!MediaProcessor.instance) {
      MediaProcessor.instance = new MediaProcessor();
      await MediaProcessor.instance.init();
    }
    return MediaProcessor.instance;
  }

  private async init() {
    if (!this.initialized) {
      await ffmpeg.load();
      this.initialized = true;
    }
  }

  async generateThumbnail(videoFile: File): Promise<Blob> {
    const inputName = 'input.mp4';
    const outputName = 'thumbnail.jpg';

    ffmpeg.FS('writeFile', inputName, await fetchFile(videoFile));

    await ffmpeg.run(
      '-i', inputName,
      '-ss', '00:00:01',
      '-frames:v', '1',
      outputName
    );

    const data = ffmpeg.FS('readFile', outputName);
    return new Blob([data.buffer], { type: 'image/jpeg' });
  }

  async compressVideo(videoFile: File): Promise<Blob> {
    const inputName = 'input.mp4';
    const outputName = 'output.mp4';

    ffmpeg.FS('writeFile', inputName, await fetchFile(videoFile));

    await ffmpeg.run(
      '-i', inputName,
      '-c:v', 'libx264',
      '-crf', '28',
      '-preset', 'medium',
      '-c:a', 'aac',
      '-b:a', '128k',
      outputName
    );

    const data = ffmpeg.FS('readFile', outputName);
    return new Blob([data.buffer], { type: 'video/mp4' });
  }

  async cropImage(
    imageFile: File,
    aspectRatio: number = 1
  ): Promise<Blob> {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    return new Promise((resolve) => {
      img.onload = () => {
        const { width, height } = img;
        let newWidth = width;
        let newHeight = height;

        if (width / height > aspectRatio) {
          newWidth = height * aspectRatio;
        } else {
          newHeight = width / aspectRatio;
        }

        canvas.width = newWidth;
        canvas.height = newHeight;

        ctx?.drawImage(
          img,
          (width - newWidth) / 2,
          (height - newHeight) / 2,
          newWidth,
          newHeight,
          0,
          0,
          newWidth,
          newHeight
        );

        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/jpeg', 0.9);
      };

      img.src = URL.createObjectURL(imageFile);
    });
  }
} 