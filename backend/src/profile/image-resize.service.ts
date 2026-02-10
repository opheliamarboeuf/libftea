import { Injectable } from '@nestjs/common';
import sharp from 'sharp'; 
import { join } from 'path';
import { unlink } from 'fs/promises';

@Injectable()
export class ImageResizeService {
// Resize avatar to 200x200 (standard profile picture size)
async resizeAvatar(filePath: string): Promise<string> {
	const outputPath = filePath.replace(/(\.\w+)$/, '-resized$1');
	
	await sharp(filePath)
	.resize(200, 200, {
		fit: 'cover', // Crop to fit perfectly
		position: 'center', // Center the crop
	})
	.jpeg({ quality: 85 }) // Good quality, smaller file size
	.toFile(outputPath);

	// Delete original uploaded file
	await unlink(filePath);

	return outputPath;
}

// Resize cover to 1200x300 (standard banner size, 4:1 ratio)
async resizeCover(filePath: string): Promise<string> {
	const outputPath = filePath.replace(/(\.\w+)$/, '-resized$1');
	
	await sharp(filePath)
	.resize(1200, 300, {
		fit: 'cover',
		position: 'center',
	})
	.jpeg({ quality: 85 })
	.toFile(outputPath);

	await unlink(filePath);

	return outputPath;
}
}