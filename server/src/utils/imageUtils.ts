// utils/imageUtils.ts

import sharp from 'sharp';
import { storage } from '../config/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function processAndUploadImage(fileBuffer: Buffer, fileName: string): Promise<string> {
    let outputBuffer = await sharp(fileBuffer)
        .resize({
            width: 1000,
            fit: 'inside',
            withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toBuffer();

    let currentQuality = 80;
    while (outputBuffer.byteLength > 500 * 1024 && currentQuality > 30) {
        currentQuality -= 10;
        outputBuffer = await sharp(fileBuffer)
            .resize({
                width: 1000,
                fit: 'inside',
                withoutEnlargement: true,
            })
            .webp({ quality: currentQuality })
            .toBuffer();
    }

    const storageRef = ref(storage, fileName);
    await uploadBytes(storageRef, outputBuffer, {
        contentType: 'image/webp',
    });

    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
}
