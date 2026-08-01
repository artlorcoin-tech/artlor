import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, Trash2, Image as ImageIcon, Plus, CheckCircle,
  AlertCircle, RefreshCw, ExternalLink, Tag, Edit3, Save, Layers, Sparkles, X, GripVertical
} from 'lucide-react'
import { publicUrl } from '../../publicUrl'
import {
  supabaseGetGalleryPaintings,
  supabaseUpdateGalleryPainting,
  supabaseAddGalleryPainting,
  supabaseGetGalleryReferences,
  supabaseAddGalleryReference,
  supabaseDeleteGalleryReference,
  supabaseUploadGalleryReferenceFile,
  supabaseReorderGalleryPaintings,
  supabaseDeleteGalleryPainting
} from '../../lib/supabase'

export default function GalleryReferencesAdmin() {
  const [paintings, setPaintings] = useState([])
  const [selectedPainting, setSelectedPainting] = useState(null)
  const [references, setReferences] = useState([])
  const [loading, setLoading] = useState(false)
  const [savingPainting, setSavingPainting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [creatingPainting, setCreatingPainting] = useState(false)
  const [deletingPainting, setDeletingPainting] = useState(false)
  const [showAddPaintingModal, setShowAddPaintingModal] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [savingOrder, setSavingOrder] = useState(false)

  // Drag and Drop state
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)
  const dragCounter = useRef(0)

  // New Painting Form State
  const [newTitle, setNewTitle] = useState('')
  const [newStyle, setNewStyle] = useState('Calligraphy')
  const [newCustomCategory, setNewCustomCategory] = useState('')
  const [newArtist, setNewArtist] = useState('Artlor Artist')
  const [newImageFile, setNewImageFile] = useState(null)
  const [newImagePreview, setNewImagePreview] = useState('')
  const [newImageUrl, setNewImageUrl] = useState('')
  const [newImageMode, setNewImageMode] = useState('file') // 'file' | 'url'

  // Painting Edit Form State
  const [editTitle, setEditTitle] = useState('')
  const [editStyle, setEditStyle] = useState('')
  const [customCategory, setCustomCategory] = useState('')
  const [editArtist, setEditArtist] = useState('')

  // Reference Upload Form State
  const [refFile, setRefFile] = useState(null)
  const [refFilePreview, setRefFilePreview] = useState('')
  const [refImageUrl, setRefImageUrl] = useState('')
  const [refCaption, setRefCaption] = useState('')
  const [refUploadMode, setRefUploadMode] = useState('file')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [paintingsData, refsData] = await Promise.all([
        supabaseGetGalleryPaintings(),
        supabaseGetGalleryReferences(),
      ])
      setPaintings(paintingsData)
      setReferences(refsData)

      if (paintingsData.length > 0) {
        setSelectedPainting((prev) => {
          if (!prev) return paintingsData[0]
          return paintingsData.find((p) => String(p.id) === String(prev.id)) || paintingsData[0]
        })
      }
    } catch (err) {
      console.error('[GalleryReferencesAdmin]', err)
      setError('Could not load gallery data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (selectedPainting) {
      setEditTitle(selectedPainting.title || '')
      setEditStyle(selectedPainting.style || '')
      setEditArtist(selectedPainting.artist || '')
      setCustomCategory('')
    }
  }, [selectedPainting])

  // Derive unique categories across paintings
  const existingCategories = Array.from(
    new Set(['Calligraphy', 'Sceneries', 'Abstract', 'Still Life', ...paintings.map((p) => p.style).filter(Boolean)])
  )

  // ────────────────── Drag & Drop Handlers ──────────────────
  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    // Set a transparent drag image for better UX
    const el = e.currentTarget
    e.dataTransfer.setDragImage(el, el.offsetWidth / 2, el.offsetHeight / 2)
  }

  const handleDragEnter = (e, index) => {
    e.preventDefault()
    dragCounter.current++
    if (index !== draggedIndex) {
      setDragOverIndex(index)
    }
  }

  const handleDragLeave = (e) => {
    dragCounter.current--
    if (dragCounter.current === 0) {
      setDragOverIndex(null)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault()
    dragCounter.current = 0
    setDragOverIndex(null)

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      return
    }

    // Reorder paintings array
    const reordered = [...paintings]
    const [dragged] = reordered.splice(draggedIndex, 1)
    reordered.splice(dropIndex, 0, dragged)

    // Optimistic update
    setPaintings(reordered)
    setDraggedIndex(null)

    // Save new order
    setSavingOrder(true)
    setError('')
    try {
      const orderedIds = reordered.map((p) => p.id)
      await supabaseReorderGalleryPaintings(orderedIds)
      setSuccess('✨ Gallery order updated!')
    } catch (err) {
      console.error(err)
      setError('Failed to save new order.')
    } finally {
      setSavingOrder(false)
    }
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
    dragCounter.current = 0
  }

  // Touch-based reorder (move up/down) for mobile
  const handleMoveUp = async (index) => {
    if (index === 0) return
    const reordered = [...paintings]
    ;[reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]]
    setPaintings(reordered)
    setSavingOrder(true)
    try {
      await supabaseReorderGalleryPaintings(reordered.map((p) => p.id))
      setSuccess('✨ Gallery order updated!')
    } catch (err) {
      setError('Failed to save order.')
    } finally {
      setSavingOrder(false)
    }
  }

  const handleMoveDown = async (index) => {
    if (index >= paintings.length - 1) return
    const reordered = [...paintings]
    ;[reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]]
    setPaintings(reordered)
    setSavingOrder(true)
    try {
      await supabaseReorderGalleryPaintings(reordered.map((p) => p.id))
      setSuccess('✨ Gallery order updated!')
    } catch (err) {
      setError('Failed to save order.')
    } finally {
      setSavingOrder(false)
    }
  }

  // Handle Creating a Brand New Painting
  const handleCreatePainting = async (e) => {
    e.preventDefault()
    setCreatingPainting(true)
    setError('')
    setSuccess('')

    const finalStyle = (newStyle === '__NEW__' ? newCustomCategory : newStyle).trim()

    if (!finalStyle) {
      setError('Category / Style is required.')
      setCreatingPainting(false)
      return
    }

    try {
      let finalImgUrl = newImageUrl.trim()
      if (newImageMode === 'file') {
        if (!newImageFile) {
          throw new Error('Please select an artwork image file.')
        }
        finalImgUrl = await supabaseUploadGalleryReferenceFile(newImageFile)
      } else {
        if (!finalImgUrl) {
          throw new Error('Please enter a valid artwork image URL.')
        }
      }

      const titleToSave = newTitle.trim() || `${finalStyle} Artwork`

      const created = await supabaseAddGalleryPainting({
        title: titleToSave,
        style: finalStyle,
        artist: newArtist.trim() || 'Artlor Artist',
        image: finalImgUrl,
      })

      setSuccess(`🎉 Successfully added new painting "${created.title}" to Gallery!`)
      setShowAddPaintingModal(false)
      setNewTitle('')
      setNewImageFile(null)
      setNewImagePreview('')
      setNewImageUrl('')
      setNewCustomCategory('')
      await loadData()
      if (created) setSelectedPainting(created)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to create new painting.')
    } finally {
      setCreatingPainting(false)
    }
  }

  // Save Painting Details Edits
  const handleSavePainting = async (e) => {
    e.preventDefault()
    if (!selectedPainting) return
    setSavingPainting(true)
    setError('')
    setSuccess('')

    const finalStyle = (editStyle === '__NEW__' ? customCategory : editStyle).trim()

    if (!finalStyle) {
      setError('Category / Style cannot be empty.')
      setSavingPainting(false)
      return
    }

    const titleToSave = editTitle.trim() || finalStyle || 'Artwork'

    try {
      const updated = await supabaseUpdateGalleryPainting(selectedPainting.id, {
        title: titleToSave,
        style: finalStyle,
        artist: editArtist.trim() || selectedPainting.artist,
      })

      setSuccess(`Updated details!`)
      await loadData()
    } catch (err) {
      console.error(err)
      setError('Failed to update painting details.')
    } finally {
      setSavingPainting(false)
    }
  }

  // Handle Deleting Artwork
  const handleDeletePainting = async () => {
    if (!selectedPainting) return
    const paintingTitle = selectedPainting.title || 'this painting'
    if (!window.confirm(`Are you sure you want to delete "${paintingTitle}" from the gallery? This action cannot be undone.`)) {
      return
    }

    setDeletingPainting(true)
    setError('')
    setSuccess('')
    try {
      await supabaseDeleteGalleryPainting(selectedPainting.id)
      setSuccess(`🗑️ Successfully deleted "${paintingTitle}" from the gallery!`)
      setSelectedPainting(null)
      await loadData()
    } catch (err) {
      console.error(err)
      setError('Failed to delete painting.')
    } finally {
      setDeletingPainting(false)
    }
  }


  const handleAddReference = async (e) => {
    e.preventDefault()
    if (!selectedPainting) return
    setError('')
    setSuccess('')
    setUploading(true)

    try {
      let finalUrl = refImageUrl.trim()

      if (refUploadMode === 'file') {
        if (!refFile) {
          throw new Error('Please select an image file to upload.')
        }
        finalUrl = await supabaseUploadGalleryReferenceFile(refFile)
      } else {
        if (!finalUrl) {
          throw new Error('Please enter a valid image URL.')
        }
      }

      await supabaseAddGalleryReference({
        painting_id: selectedPainting.id,
        painting_title: editTitle.trim() || selectedPainting.title,
        image_url: finalUrl,
        caption: refCaption.trim() || 'Reference Image',
      })

      setSuccess(`Reference picture added for "${editTitle || selectedPainting.title}"!`)
      setRefFile(null)
      setRefFilePreview('')
      setRefImageUrl('')
      setRefCaption('')
      await loadData()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to add reference image.')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteRef = async (id, refCaption) => {
    if (!window.confirm(`Are you sure you want to delete reference "${refCaption}"?`)) return
    setError('')
    try {
      await supabaseDeleteGalleryReference(id)
      setSuccess('Reference picture removed.')
      await loadData()
    } catch (err) {
      console.error(err)
      setError('Failed to delete reference picture.')
    }
  }

  const paintingRefs = selectedPainting
    ? references.filter((r) => String(r.painting_id) === String(selectedPainting.id))
    : []

  return (
    <div className="space-y-8">
      {/* Header Bar with Action Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.07] pb-4">
        <div>
          <h2 className="font-display text-xl font-medium text-white flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-[#c9934a]" />
            Gallery &amp; Artwork Management
          </h2>
          <p className="font-body text-xs text-white/50">
            Add new paintings, update titles &amp; categories, or attach customer reference photos.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddPaintingModal(true)}
            className="flex items-center gap-2 rounded-xl bg-[linear-gradient(125deg,var(--brand-brown-deep)_0%,var(--brand-brown)_52%,var(--brand-gold)_100%)] px-4 py-2.5 font-body text-xs font-semibold text-white shadow-md hover:opacity-90 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            + Add New Painting to Gallery
          </button>

          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-xs font-body text-white/70 hover:bg-white/[0.08] hover:text-white transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Alert Notifications */}
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

      {/* Paintings Grid Selection with Drag & Drop Reordering */}
      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-widest text-white/40">
              Gallery Order — Drag to Rearrange ({paintings.length})
            </label>
            <p className="font-body text-[10px] text-white/25 mt-0.5">
              Drag paintings to reorder how they appear in the public gallery. Use ↑↓ arrows on mobile.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {savingOrder && (
              <span className="flex items-center gap-1.5 text-[10px] font-body text-amber-400">
                <RefreshCw className="h-3 w-3 animate-spin" /> Saving order...
              </span>
            )}
            <button
              onClick={() => setShowAddPaintingModal(true)}
              className="text-xs font-body text-[#c9934a] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3 w-3" /> Add New Artwork
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {paintings.map((painting, index) => {
            const count = references.filter((r) => String(r.painting_id) === String(painting.id)).length
            const isSelected = selectedPainting?.id === painting.id
            const isDragging = draggedIndex === index
            const isDragOver = dragOverIndex === index
            return (
              <div
                key={painting.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                onClick={() => {
                  setSelectedPainting(painting)
                  setError('')
                  setSuccess('')
                }}
                className={`group relative flex flex-col items-center rounded-xl border p-2 transition cursor-grab active:cursor-grabbing text-left select-none ${
                  isDragging
                    ? 'opacity-40 scale-95 border-[#c9934a]/50 bg-[rgba(201,147,74,0.05)]'
                    : isDragOver
                    ? 'border-[#c9934a] bg-[rgba(201,147,74,0.15)] shadow-lg scale-105 ring-2 ring-[#c9934a]/30'
                    : isSelected
                    ? 'border-[#c9934a] bg-[rgba(201,147,74,0.12)] shadow-md'
                    : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'
                }`}
              >
                {/* Position Number Badge */}
                <span className="absolute top-1 left-1 flex h-4 min-w-[16px] items-center justify-center rounded-md bg-white/10 px-1 font-body text-[9px] font-bold text-white/60 z-10">
                  {index + 1}
                </span>

                {/* Drag Grip Icon */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-70 transition text-white/40 z-10">
                  <GripVertical className="h-3.5 w-3.5" />
                </div>

                {/* Mobile Move Arrows */}
                <div className="absolute -right-0 top-0 flex flex-col gap-0.5 z-10 sm:hidden">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleMoveUp(index) }}
                    disabled={index === 0 || savingOrder}
                    className="rounded bg-white/10 p-0.5 text-white/50 hover:bg-white/20 hover:text-white disabled:opacity-20 text-[10px] leading-none"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleMoveDown(index) }}
                    disabled={index >= paintings.length - 1 || savingOrder}
                    className="rounded bg-white/10 p-0.5 text-white/50 hover:bg-white/20 hover:text-white disabled:opacity-20 text-[10px] leading-none"
                  >
                    ▼
                  </button>
                </div>

                <img
                  src={publicUrl(painting.image)}
                  alt={painting.title}
                  className="h-16 w-full rounded-lg object-cover pointer-events-none"
                />
                <span className="mt-2 w-full truncate font-display text-xs text-white text-center">
                  {painting.title}
                </span>
                <span className="font-body text-[10px] text-[#c9934a] truncate w-full text-center">
                  {painting.style}
                </span>
                {count > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#c9934a] font-body text-[9px] font-bold text-black">
                    {count}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {selectedPainting && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Column 1: Edit Painting Title & Category Form */}
          <div className="lg:col-span-5 space-y-6">
            {/* Edit Details Card */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0d0d0f] p-5 space-y-4">
              <div className="flex items-center gap-3 border-b border-white/[0.07] pb-3">
                <img
                  src={publicUrl(selectedPainting.image)}
                  alt={selectedPainting.title}
                  className="h-12 w-12 rounded-lg object-cover border border-[#c9934a]/30"
                />
                <div>
                  <p className="font-body text-[10px] uppercase tracking-widest text-[#c9934a]">
                    Editing Artwork #{selectedPainting.id}
                  </p>
                  <h3 className="font-display text-base font-medium text-white">
                    Edit Title &amp; Category
                  </h3>
                </div>
              </div>

              <form onSubmit={handleSavePainting} className="space-y-4">
                <div>
                  <label className="mb-1 block font-body text-xs text-white/70 flex items-center gap-1.5">
                    <Edit3 className="h-3.5 w-3.5 text-[#c9934a]" />
                    Painting Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="e.g. Luminous Name (optional)"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 font-body text-xs text-white placeholder-white/20 focus:border-[#c9934a] focus:outline-none"
                  />
                </div>


                <div>
                  <label className="mb-1 block font-body text-xs text-white/70 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-[#c9934a]" />
                    Category / Style
                  </label>
                  <select
                    value={editStyle}
                    onChange={(e) => setEditStyle(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#161619] px-3.5 py-2.5 font-body text-xs text-white focus:border-[#c9934a] focus:outline-none cursor-pointer"
                  >
                    {existingCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="__NEW__">+ Add New Category...</option>
                  </select>

                  {editStyle === '__NEW__' && (
                    <div className="mt-2">
                      <input
                        type="text"
                        required
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Type new category name (e.g. Modern Resin)"
                        className="w-full rounded-xl border border-[#c9934a]/60 bg-white/[0.04] px-3.5 py-2.5 font-body text-xs text-white placeholder-white/20 focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-1 block font-body text-xs text-white/70">
                    Artist Name
                  </label>
                  <input
                    type="text"
                    value={editArtist}
                    onChange={(e) => setEditArtist(e.target.value)}
                    placeholder="e.g. Maryam, Muntaza, Hammad"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 font-body text-xs text-white placeholder-white/20 focus:border-[#c9934a] focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={savingPainting}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-[#c9934a]/40 bg-[rgba(201,147,74,0.15)] px-4 py-2.5 font-body text-xs font-semibold text-[#c9934a] hover:bg-[rgba(201,147,74,0.25)] transition cursor-pointer disabled:opacity-50"
                  >
                    {savingPainting ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Details
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDeletePainting}
                    disabled={deletingPainting}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 font-body text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition cursor-pointer disabled:opacity-50"
                    title="Delete this artwork permanently"
                  >
                    {deletingPainting ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Delete Artwork
                  </button>
                </div>
              </form>
            </div>

            {/* Reference Upload Card */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0d0d0f] p-5 space-y-4">
              <div className="border-b border-white/[0.07] pb-3">
                <h3 className="font-display text-base font-medium text-white flex items-center gap-2">
                  <Upload className="h-4 w-4 text-[#c9934a]" />
                  Attach Reference Photo
                </h3>
                <p className="font-body text-xs text-white/40">
                  Attach customer room photos or detail shots for "{editTitle || selectedPainting.title}"
                </p>
              </div>

              <form onSubmit={handleAddReference} className="space-y-4">
                <div className="flex gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
                  <button
                    type="button"
                    onClick={() => setRefUploadMode('file')}
                    className={`flex-1 rounded-lg py-1.5 font-body text-xs font-medium transition ${
                      refUploadMode === 'file' ? 'bg-[rgba(201,147,74,0.2)] text-[#c9934a]' : 'text-white/40'
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setRefUploadMode('url')}
                    className={`flex-1 rounded-lg py-1.5 font-body text-xs font-medium transition ${
                      refUploadMode === 'url' ? 'bg-[rgba(201,147,74,0.2)] text-[#c9934a]' : 'text-white/40'
                    }`}
                  >
                    Paste Image URL
                  </button>
                </div>

                {refUploadMode === 'file' ? (
                  <div>
                    <div className="relative flex min-h-[90px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-4 text-center hover:border-[#c9934a]/60 hover:bg-white/[0.04]">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const selected = e.target.files?.[0]
                          if (selected) {
                            setRefFile(selected)
                            setRefFilePreview(URL.createObjectURL(selected))
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      {refFilePreview ? (
                        <div className="relative w-full flex items-center gap-3">
                          <img src={refFilePreview} alt="Preview" className="h-12 w-12 rounded-lg object-cover border border-white/20" />
                          <div className="text-left overflow-hidden">
                            <p className="truncate font-body text-xs text-white font-medium">{refFile?.name}</p>
                            <p className="font-body text-[10px] text-white/40">{(refFile.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload className="mb-1 h-5 w-5 text-[#c9934a]" />
                          <p className="font-body text-xs text-white/80">Click or drag reference photo</p>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      placeholder="https://example.com/customer-photo.jpg"
                      value={refImageUrl}
                      onChange={(e) => setRefImageUrl(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 font-body text-xs text-white placeholder-white/20 focus:border-[#c9934a] focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <input
                    type="text"
                    placeholder="Caption (e.g. Living room wall preview)"
                    value={refCaption}
                    onChange={(e) => setRefCaption(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 font-body text-xs text-white placeholder-white/20 focus:border-[#c9934a] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 font-body text-xs font-semibold text-white hover:bg-white/20 transition disabled:opacity-50 cursor-pointer"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Upload Reference Photo
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Column 2: Reference Photos Grid */}
          <div className="lg:col-span-7 rounded-2xl border border-white/[0.08] bg-[#0d0d0f] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
              <div>
                <h3 className="font-display text-base font-medium text-white">
                  Attached Reference Photos ({paintingRefs.length})
                </h3>
                <p className="font-body text-xs text-white/40">
                  Showing customer photos for "{editTitle || selectedPainting.title}"
                </p>
              </div>
              <span className="rounded-full border border-[#c9934a]/30 bg-[rgba(201,147,74,0.1)] px-2.5 py-1 font-body text-[10px] font-medium text-[#c9934a]">
                Category: {editStyle || selectedPainting.style}
              </span>
            </div>

            {paintingRefs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-white/10 rounded-xl">
                <ImageIcon className="mb-3 h-10 w-10 text-white/20" />
                <p className="font-body text-xs font-medium text-white/60">
                  No reference photos attached yet.
                </p>
                <p className="font-body text-[11px] text-white/30 max-w-xs mt-1">
                  Upload customer photos or angle shots using the upload section.
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
                        onClick={() => handleDeleteRef(ref.id, ref.caption)}
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
      )}

      {/* Modal: + Add Brand New Painting to Gallery */}
      {showAddPaintingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d0d0f] p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="rounded-full bg-[rgba(201,147,74,0.15)] p-2 text-[#c9934a]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-medium text-white">
                    Add New Painting to Gallery
                  </h3>
                  <p className="font-body text-xs text-white/40">
                    Upload a new artwork image, specify title, category, and artist.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddPaintingModal(false)}
                className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePainting} className="space-y-4">
              {/* Title */}
              <div>
                <label className="mb-1 block font-body text-xs font-medium text-white/80">
                  Painting Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Celestial Harmony (optional)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 font-body text-xs text-white placeholder-white/20 focus:border-[#c9934a] focus:outline-none"
                />
              </div>


              {/* Category / Style */}
              <div>
                <label className="mb-1 block font-body text-xs font-medium text-white/80">
                  Category / Style *
                </label>
                <select
                  value={newStyle}
                  onChange={(e) => setNewStyle(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#161619] px-3.5 py-2.5 font-body text-xs text-white focus:border-[#c9934a] focus:outline-none cursor-pointer"
                >
                  {existingCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="__NEW__">+ Type Custom New Category...</option>
                </select>

                {newStyle === '__NEW__' && (
                  <input
                    type="text"
                    required
                    placeholder="Type new category name (e.g. Resin Art, Architecture)"
                    value={newCustomCategory}
                    onChange={(e) => setNewCustomCategory(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-[#c9934a]/60 bg-white/[0.04] px-3.5 py-2.5 font-body text-xs text-white placeholder-white/20 focus:outline-none"
                  />
                )}
              </div>

              {/* Artist Name */}
              <div>
                <label className="mb-1 block font-body text-xs font-medium text-white/80">
                  Artist Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maryam, Muntaza, Hammad"
                  value={newArtist}
                  onChange={(e) => setNewArtist(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 font-body text-xs text-white placeholder-white/20 focus:border-[#c9934a] focus:outline-none"
                />
              </div>

              {/* Image Upload Mode */}
              <div>
                <label className="mb-2 block font-body text-xs font-medium text-white/80">
                  Artwork Image *
                </label>

                <div className="mb-3 flex gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
                  <button
                    type="button"
                    onClick={() => setNewImageMode('file')}
                    className={`flex-1 rounded-lg py-1.5 font-body text-xs font-medium transition ${
                      newImageMode === 'file' ? 'bg-[rgba(201,147,74,0.2)] text-[#c9934a]' : 'text-white/40'
                    }`}
                  >
                    Upload Image File
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewImageMode('url')}
                    className={`flex-1 rounded-lg py-1.5 font-body text-xs font-medium transition ${
                      newImageMode === 'url' ? 'bg-[rgba(201,147,74,0.2)] text-[#c9934a]' : 'text-white/40'
                    }`}
                  >
                    Paste Image URL
                  </button>
                </div>

                {newImageMode === 'file' ? (
                  <div className="relative flex min-h-[110px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-4 text-center hover:border-[#c9934a]/60 hover:bg-white/[0.04]">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setNewImageFile(file)
                          setNewImagePreview(URL.createObjectURL(file))
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {newImagePreview ? (
                      <div className="relative flex items-center gap-3">
                        <img src={newImagePreview} alt="Preview" className="h-16 w-16 rounded-lg object-cover border border-[#c9934a]/40" />
                        <div className="text-left overflow-hidden">
                          <p className="truncate font-body text-xs text-white font-medium">{newImageFile?.name}</p>
                          <p className="font-body text-[10px] text-white/40">{(newImageFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="mb-1.5 h-6 w-6 text-[#c9934a]" />
                        <p className="font-body text-xs text-white/80">Click to upload artwork image</p>
                      </>
                    )}
                  </div>
                ) : (
                  <input
                    type="url"
                    placeholder="https://example.com/painting.png"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 font-body text-xs text-white placeholder-white/20 focus:border-[#c9934a] focus:outline-none"
                  />
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPaintingModal(false)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] py-2.5 font-body text-xs text-white/70 hover:bg-white/10"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creatingPainting}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(125deg,var(--brand-brown-deep)_0%,var(--brand-brown)_52%,var(--brand-gold)_100%)] py-2.5 font-body text-xs font-semibold text-white shadow-lg hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  {creatingPainting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Creating Painting...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Publish to Gallery
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
