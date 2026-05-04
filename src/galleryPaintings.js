/**
 * Real Artlor artwork (files in /public/gallery). Use with `publicUrl(...)`.
 */
export const galleryImages = {
  calligraphyAllahMaryam: 'gallery/calligraphy-allah-maryam.png',
  calligraphyNikahMuntaza: 'gallery/calligraphy-nikah-board-muntaza.png',
  landscapeBridgeHammad: 'gallery/landscape-bridge-hammad.png',
  stillLifeSeebah: 'gallery/still-life-florals-seebah.png',
  calligraphyGoldMuntaza: 'gallery/calligraphy-gold-muntaza.png',
  calligraphyCustomMuntaza: 'gallery/calligraphy-custom-pour-muntaza.png',
  landscapeVintageHammad: 'gallery/landscape-vintage-car-hammad.png',
  abstractMonoMuntaza: 'gallery/abstract-monochrome-muntaza.png',
}

/**
 * @typedef {{ id: number, title: string, style: string, artist: string, image: string }} GalleryPainting
 * @type {GalleryPainting[]}
 */
export const galleryPaintings = [
  {
    id: 1,
    title: 'Luminous Name',
    style: 'Calligraphy',
    artist: 'Maryam',
    image: galleryImages.calligraphyAllahMaryam,
  },
  {
    id: 2,
    title: 'Gilded Script',
    style: 'Calligraphy',
    artist: 'Muntaza',
    image: galleryImages.calligraphyGoldMuntaza,
  },
  {
    id: 3,
    title: 'Marbled Letter',
    style: 'Calligraphy',
    artist: 'Muntaza',
    image: galleryImages.calligraphyCustomMuntaza,
  },
  {
    id: 4,
    title: 'Verse & Vows',
    style: 'Calligraphy',
    artist: 'Muntaza',
    image: galleryImages.calligraphyNikahMuntaza,
  },
  {
    id: 5,
    title: 'Stone & Stream',
    style: 'Landscape',
    artist: 'Hammad',
    image: galleryImages.landscapeBridgeHammad,
  },
  {
    id: 6,
    title: 'Teal Road, Autumn Hills',
    style: 'Landscape',
    artist: 'Hammad',
    image: galleryImages.landscapeVintageHammad,
  },
  {
    id: 7,
    title: 'Monochrome Flow',
    style: 'Abstract',
    artist: 'Muntaza',
    image: galleryImages.abstractMonoMuntaza,
  },
  {
    id: 8,
    title: 'Florals in Bloom',
    style: 'Still Life',
    artist: 'Seebah',
    image: galleryImages.stillLifeSeebah,
  },
]
