import sharp from 'sharp';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const sources = [
  'pip/pip_avatar_cloud.png',
  'pip/pip_dream_lantern.png',
  'pip/pip_lullaby_box.png',
  'pip/pip_portrait.png',
  'production-art/backgrounds/star_theater.png',
  'production-art/backgrounds/dream_express_world.png',
  'production-art/derived/moonlight_room_empty.png',
  'production-art/derived/dream_express_world_no_beam.png',
  'production-art/sprites/dreamspace_paper_clouds.png',
  'production-art/sprites/orchestra_star_1.png',
  'production-art/sprites/orchestra_star_2.png',
  'production-art/sprites/orchestra_star_3.png',
];
const report = [];
for (const source of sources) {
  const input = `public/assets/${source}`;
  const output = `public/assets/optimized/${source.replace('.png', '.webp')}`;
  await mkdir(dirname(output), { recursive: true });
  await sharp(input).webp({ quality: 88, alphaQuality: 100, effort: 6 }).toFile(output);
  report.push({ source, output, originalBytes: (await stat(input)).size, optimizedBytes: (await stat(output)).size });
}
await sharp('public/assets/pip/pip_avatar_cloud.png').resize(48, 48, { fit: 'cover' }).webp({ quality: 85 }).toFile('public/assets/optimized/pip/favicon.webp');
await writeFile('public/assets/optimized/manifest.json', JSON.stringify({ operation: 'Format conversion only. Original dimensions and source artwork preserved.', images: report }, null, 2));
console.log(JSON.stringify({ originalBytes: report.reduce((sum, row) => sum + row.originalBytes, 0), optimizedBytes: report.reduce((sum, row) => sum + row.optimizedBytes, 0) }));
