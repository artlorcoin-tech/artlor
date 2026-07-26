import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Image as ImageIcon, Sparkles, ChevronRight, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { publicUrl } from '../publicUrl'

export default function GalleryReferenceModal({ painting, references = [], onClose }) {
  const navigate = useNavigate()
  const [activePhoto, setActivePhoto] = useState(
    references.length > 0
      ? { type: 'ref', url: references[0].image_url, caption: references[0].caption }
      : { type: 'main', url: publicUrl(painting.image), caption: 'Original Artwork' }
  )

  if (!painting) return null

  // All photos array (Main painting + reference photos)
  const allPhotos = [
    { type: 'main', url: publicUrl(painting.image), caption: 'Masterpiece View' },
    ...references.map((r) => ({ type: 'ref', url: r.image_url, caption: r.caption || 'Customer Reference' })),
  ]

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="relative z-10 w-full max-w-4xl overflow-hidden rounded-3xl border border-[rgba(201,147,74,0.3)] bg-[#121114] text-white shadow-2xl my-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white/70 hover:bg-black hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[85vh] overflow-y-auto">
            {/* Image Preview Column */}
            <div className="lg:col-span-7 bg-black/50 p-6 flex flex-col justify-between items-center border-b lg:border-b-0 lg:border-r border-white/10">
              <div className="relative w-full flex-1 flex items-center justify-center min-h-[260px] sm:min-h-[360px] max-h-[460px] overflow-hidden rounded-2xl border border-white/10 bg-black">
                <img
                  src={activePhoto.url}
                  alt={activePhoto.caption}
                  className="h-full w-full object-contain max-h-[440px]"
                />
                <span className="absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1 font-body text-xs text-white/90 backdrop-blur-md border border-white/10">
                  {activePhoto.caption}
                </span>
              </div>

              {/* Thumbnails strip */}
              {allPhotos.length > 1 && (
                <div className="w-full mt-4 flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
                  {allPhotos.map((photo, idx) => {
                    const isSelected = activePhoto.url === photo.url
                    return (
                      <button
                        key={idx}
                        onClick={() => setActivePhoto(photo)}
                        className={`relative shrink-0 rounded-lg overflow-hidden border-2 transition cursor-pointer ${
                          isSelected ? 'border-[#c9934a] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={photo.url} alt={photo.caption} className="h-14 w-14 object-cover" />
                        {photo.type === 'ref' && (
                          <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#c9934a] font-body text-[8px] font-bold text-black">
                            Ref
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Content Details Column */}
            <div className="lg:col-span-5 p-6 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded-full bg-[rgba(201,147,74,0.15)] px-3 py-1 font-body text-[11px] font-medium text-[#c9934a] border border-[#c9934a]/30">
                    {painting.style}
                  </span>
                  <span className="font-body text-xs text-white/40">
                    Artist: {painting.artist}
                  </span>
                </div>

                <h2 className="font-display text-2xl sm:text-3xl text-white">
                  {painting.title}
                </h2>

                <p className="mt-3 font-body text-xs text-white/70 leading-relaxed">
                  Handcrafted on premium canvas using high-grade acrylics and oils. Order an exact recreation or customize colors and dimensions to fit your space.
                </p>

                {/* Reference images status box */}
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-body text-xs font-semibold uppercase tracking-wider text-[#c9934a] flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5" />
                      Reference Photos ({references.length})
                    </span>
                  </div>

                  {references.length > 0 ? (
                    <p className="font-body text-xs text-white/60">
                      Select thumbnail images on the left to inspect customer wall placements, frame details, and real lighting references.
                    </p>
                  ) : (
                    <p className="font-body text-xs text-white/50 italic">
                      No custom reference pictures uploaded for this piece yet. Request a custom room mock-up when ordering!
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => {
                    onClose()
                    navigate('/quick-order', { state: { painting } })
                  }}
                  className="pill-btn w-full flex items-center justify-center gap-2 rounded-full border border-[var(--brand-gold)] bg-[linear-gradient(125deg,var(--brand-brown-deep)_0%,var(--brand-brown)_52%,var(--brand-gold)_100%)] px-6 py-3.5 font-body text-sm font-semibold text-[var(--brand-cream)] shadow-lg transition hover:scale-[1.02] cursor-pointer"
                >
                  Order This Painting
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() => {
                    onClose()
                    navigate('/order')
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 font-body text-xs text-white/80 hover:bg-white/10 hover:text-white transition cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#c9934a]" />
                  Customize Size &amp; Colors
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
