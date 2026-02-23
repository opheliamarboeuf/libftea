import { Injectable } from '@nestjs/common';
import sharp from 'sharp'; 
import { unlink } from 'fs/promises';

@Injectable()
export class ImageResizeService {

// Resize avatar to 200x200 (standard profile picture size)
async resizeAvatar(filePath: string): Promise<string> {
	const ext = filePath.split('.').pop()?.toLowerCase();
	const outputPath = filePath.replace(/(\.\w+)$/, `-resized.${ext}`); // extract the file extension

	// Create a Sharp transformer and resize the image to 800x800
	let transformer = sharp(filePath).resize(200, 200, {
		fit: 'cover', // Crop to fit perfectly
		position: 'center', // Center the crop
 	});

	// Apply format-specific transformations
	if (ext === 'jpg' || ext === 'jpeg') transformer = transformer.jpeg({ quality: 85 });
	if (ext === 'png') transformer = transformer.png({ compressionLevel: 9 });
	if (ext === 'webp') transformer = transformer.webp({ quality: 85 });

	// Execute the transformation and save the resized file
	await transformer.toFile(outputPath);
	// Delete original uploaded file
	await unlink(filePath);
	return outputPath;
}

// Resize cover to 1200x300 (standard banner size, 4:1 ratio)
async resizeCover(filePath: string): Promise<string> {
	const ext = filePath.split('.').pop(); 
	const outputPath = filePath.replace(/(\.\w+)$/, `-resized.${ext}`);

	let transformer = sharp(filePath).resize(1200, 300, {
		fit: 'cover',
		position: 'center',
 	});

	if (ext === 'jpg' || ext === 'jpeg') transformer = transformer.jpeg({ quality: 85 });
	if (ext === 'png') transformer = transformer.png({ compressionLevel: 9 });
	if (ext === 'webp') transformer = transformer.webp({ quality: 85 });

	await transformer.toFile(outputPath);
	await unlink(filePath);
	return outputPath;
}

// Resize user's post to 800x800 (standard post size, 1:1 ratio)
async resizePost(filePath: string): Promise<string> {
	const ext = filePath.split('.').pop(); 
	const outputPath = filePath.replace(/(\.\w+)$/, `-resized.${ext}`);

	let transformer = sharp(filePath).resize(800, 800, {
		fit: 'cover',
		position: 'center',
 	});

	if (ext === 'jpg' || ext === 'jpeg') transformer = transformer.jpeg({ quality: 85 });
	if (ext === 'png') transformer = transformer.png({ compressionLevel: 9 });
	if (ext === 'webp') transformer = transformer.webp({ quality: 85 });

	await transformer.toFile(outputPath);
	await unlink(filePath);
	return outputPath;
}	
}