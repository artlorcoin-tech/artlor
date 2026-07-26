import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Trash2, Image, Plus, CheckCircle, AlertCircle, RefreshCw, ExternalLink, Tag } from 'lucide-react'
import { galleryPaintings } from '../../galleryPaintings'
import { publicUrl } from '../../publicUrl'
import {
  supabaseGetGalleryReferences,
  supabaseAddGalleryReference,
  supabaseDeleteGalleryReference,
  supabaseUploadGalleryReferenceFile
} from '../../lib/supabase'

export default function GalleryReferencesAdmin() {
  const [selectedPainting, setSelectedPainting] = useState(galleryPaintings[0])
  const [references, setReferences] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form State
  const [file, setFile] = useState(null)
  const [filePreview, setFilePreview] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [uploadMode, setUploadMode] = useState('file') // 'file' | 'url'

  const fetchReferences = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await supabaseGetGalleryReferences()
      setReferences(data)
    } catch (err) {
      console.error('[GalleryReferencesAdmin]', err)
      setError('Could not load reference photos. Ensure database table exists.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReferences()
  }, [fetchReferences])

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    setFile(selected)
    const previewUrl = URL.createObjectURL(selected)
    setFilePreview(previewUrl)
  }

  const handleAddReference = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setUploading(true)

    try {
      let finalUrl = imageUrl.trim()

      if (uploadMode === 'file') {
        if (!file) {
          throw new Error('Please select an image file to upload.')
        }
        finalUrl = await supabaseUploadGalleryReferenceFile(file)
      } else {
        if (!finalUrl) {
          throw new Error('Please enter a valid image URL.')
        }
      }

      await supabaseAddGalleryReference({
        painting_id: selectedPainting.id,
        painting_title: selectedPainting.title,
        image_url: finalUrl,
        caption: caption.trim() || 'Reference Image',
      })

      setSuccess(`Reference picture added for "${selectedPainting.title}"!`)
      setFile(null)
      setFilePreview('')
      setImageUrl('')
      setCaption('')
      await fetchReferences()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to add reference image.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id, refCaption) => {
    if (!window.confirm(`Are you sure you want to delete reference "${refCaption}"?`)) return
    setError('')
    try {
      await supabaseDeleteGalleryReference(id)
      setSuccess('Reference picture removed.')
      await fetchReferences()
    } catch (err) {
      console.error(err)
      setError('Failed to delete reference picture.')
    }
  }

  // Filter references for currently selected painting
  const paintingRefs = references.filter((r) => String(r.painting_id) === String(selectedPainting.id))

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.07] pb-4">
        <div>
          <h2 className="font-display text-xl font-medium text-white flex items-center gap-2">
            <Image className="h-5 w-5 text-[#c9934a]" />
            Gallery Reference Images
          </h2>
          <p className="font-body text-xs text-white/50">
            Upload and link customer reference pictures, wall previews, and detail photos to paintings in your gallery.
          </p>
        </div>
        <button
          onClick={fetchReferences}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-body text-white/70 hover:bg-white/[0.08] hover:text-white transition disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 font-body text-xs text-rose-300"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 font-body text-xs text-emerald-300"
          >
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Painting Selector */}
      <div>
        <label className="mb-3 block font-body text-xs font-semibold uppercase tracking-widest text-white/40">
          Select Painting to Manage ({galleryPaintings.length})
        </label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {galleryPaintings.map((painting) => {
            const count = references.filter((r) => String(r.painting_id) === String(painting.id)).length
            const isSelected = selectedPainting.id === painting.id
            return (
              <button
                key={painting.id}
                onClick={() => {
                  setSelectedPainting(painting)
                  setError('')
                  setSuccess('')
                }}
                className={`group relative flex flex-col items-center rounded-xl border p-2 transition cursor-pointer text-left ${
                  isSelected
                    ? 'border-[#c9934a] bg-[rgba(201,147,74,0.12)]'
                    : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'
                }`}
              >
                <img
                  src={publicUrl(painting.image)}
                  alt={painting.title}
                  className="h-16 w-full rounded-lg object-cover"
                />
                <span className="mt-2 w-full truncate font-display text-xs text-white text-center">
                  {painting.title}
                </span>
                <span className="font-body text-[10px] text-white/40">
                  {painting.style}
                </span>
                {count > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#c9934a] font-body text-[9px] font-bold text-black">
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. Upload / Add Reference Section */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Form Column */}
        <div className="lg:col-span-5 rounded-2xl border border-white/[0.08] bg-[#0d0d0f] p-5 space-y-4">
          <div className="flex items-center gap-3 border-b border-white/[0.07] pb-3">
            <img
              src={publicUrl(selectedPainting.image)}
              alt={selectedPainting.title}
              className="h-12 w-12 rounded-lg object-cover border border-[#c9934a]/30"
            />
            <div>
              <p className="font-body text-[10px] uppercase tracking-widest text-[#c9934a]">
                Adding for #{selectedPainting.id}
              </p>
              <h3 className="font-display text-base font-medium text-white">
                {selectedPainting.title}
              </h3>
              <p className="font-body text-xs text-white/40">
                Artist: {selectedPainting.artist} · {selectedPainting.style}
              </p>
            </div>
          </div>

          <form onSubmit={handleAddReference} className="space-y-4">
            {/* Mode switch */}
            <div className="flex gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`flex-1 rounded-lg py-1.5 font-body text-xs font-medium transition ${
                  uploadMode === 'file' ? 'bg-[rgba(201,147,74,0.2)] text-[#c9934a]' : 'text-white/40'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('url')}
                className={`flex-1 rounded-lg py-1.5 font-body text-xs font-medium transition ${
                  uploadMode === 'url' ? 'bg-[rgba(201,147,74,0.2)] text-[#c9934a]' : 'text-white/40'
                }`}
              >
                Paste Image URL
              </button>
            </div>

            {uploadMode === 'file' ? (
              <div>
                <label className="mb-2 block font-body text-xs text-white/70">
                  Choose Reference Image File
                </label>
                <div className="relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-4 text-center hover:border-[#c9934a]/60 hover:bg-white/[0.04]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {filePreview ? (
                    <div className="relative w-full flex items-center gap-3">
                      <img src={filePreview} alt="Preview" className="h-16 w-16 rounded-lg object-cover border border-white/20" />
                      <div className="text-left overflow-hidden">
                        <p className="truncate font-body text-xs text-white font-medium">{file?.name}</p>
                        <p className="font-body text-[10px] text-white/40">{(file.size / 1024).toFixed(1)} KB</p>
                        <span className="font-body text-[10px] text-[#c9934a]">Click to replace file</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="mb-2 h-6 w-6 text-[#c9934a]" />
                      <p className="font-body text-xs text-white/80">Click or drag image file here</p>
                      <p className="font-body text-[10px] text-white/30">PNG, JPG, WEBP up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <label className="mb-1 block font-body text-xs text-white/70">
                  Image Direct URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/customer-photo.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 font-body text-xs text-white placeholder-white/20 focus:border-[#c9934a] focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block font-body text-xs text-white/70 flex items-center gap-1">
                <Tag className="h-3 w-3 text-[#c9934a]" />
                Caption / Description (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Living room wall preview, close-up texture, etc."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 font-body text-xs text-white placeholder-white/20 focus:border-[#c9934a] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(125deg,var(--brand-brown-deep)_0%,var(--brand-brown)_52%,var(--brand-gold)_100%)] px-4 py-3 font-body text-xs font-semibold text-white shadow-lg transition hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              {uploading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Uploading Reference...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Upload & Attach Reference
                </>
              )}
            </button>
          </form>
        </div>

        {/* Existing References Grid Column */}
        <div className="lg:col-span-7 rounded-2xl border border-white/[0.08] bg-[#0d0d0f] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
            <div>
              <h3 className="font-display text-base font-medium text-white">
                Reference Photos ({paintingRefs.length})
              </h3>
              <p className="font-body text-xs text-white/40">
                Attached to "{selectedPainting.title}"
              </p>
            </div>
            <span className="rounded-full border border-[#c9934a]/30 bg-[rgba(201,147,74,0.1)] px-2.5 py-1 font-body text-[10px] font-medium text-[#c9934a]">
              ID: {selectedPainting.id}
            </span>
          </div>

          {paintingRefs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-white/10 rounded-xl">
              <Image className="mb-3 h-10 w-10 text-white/20" />
              <p className="font-body text-xs font-medium text-white/60">
                No reference photos uploaded yet for this painting.
              </p>
              <p className="font-body text-[11px] text-white/30 max-w-xs mt-1">
                Use the panel on the left to upload customer reference pictures, wall placements, or close-up detail shots.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {paintingRefs.map((ref) => (
                <div
                  key={ref.id}
                  className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] transition hover:border-white/20"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
                    <img
                      src={ref.image_url}
                      alt={ref.caption || 'Reference photo'}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <a
                      href={ref.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-2 right-2 rounded-lg bg-black/60 p-1.5 text-white/70 hover:text-white backdrop-blur-md"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                  <div className="p-3 flex items-start justify-between gap-2">
                    <div>
                      <p className="font-body text-xs text-white font-medium line-clamp-1">
                        {ref.caption || 'No caption'}
                      </p>
                      <p className="font-body text-[10px] text-white/30 mt-0.5">
                        {new Date(ref.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(ref.id, ref.caption)}
                      className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-2 text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
                      title="Delete reference photo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
