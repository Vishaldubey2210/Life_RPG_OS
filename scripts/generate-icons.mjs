import sharp from 'sharp'
import { mkdir } from 'fs/promises'

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]

const svgIcon = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="80" fill="#7C3AED"/>
  <text x="256" y="340" text-anchor="middle" 
        font-size="280" font-family="Arial">⚔️</text>
</svg>
`

await mkdir('./public/icons', { recursive: true })

for (const size of sizes) {
  await sharp(Buffer.from(svgIcon))
    .resize(size, size)
    .png()
    .toFile(`./public/icons/icon-${size}x${size}.png`)
  console.log(`Generated ${size}x${size}`)
}
