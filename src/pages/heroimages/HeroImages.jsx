import React, { useState, useRef } from 'react'
import '../dashboardPage/DashboardPage.css'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useGetHeroImagesQuery } from '../../app/services/pcApi'
import { supabase, BUCKET } from '../../app/services/pcApi'

// ─── Icons ───────────────────────────────────────────────
function IconProducts() { return <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}><rect x="1" y="1" width="6" height="6" rx="1" /><rect x="9" y="1" width="6" height="6" rx="1" /><rect x="1" y="9" width="6" height="6" rx="1" /><rect x="9" y="9" width="6" height="6" rx="1" /></svg> }
function IconOrders() { return <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}><rect x="2" y="1" width="12" height="14" rx="1.5" /><line x1="5" y1="5" x2="11" y2="5" /><line x1="5" y1="8" x2="11" y2="8" /><line x1="5" y1="11" x2="8" y2="11" /></svg> }
function IconSettings() { return <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}><circle cx="8" cy="8" r="2.5" /><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.42 1.42M11.53 11.53l1.42 1.42M3.05 12.95l1.42-1.42M11.53 4.47l1.42-1.42" /></svg> }
function IconLogout() { return <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}><path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6" /></svg> }
function IconImage() { return <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}><rect x="1" y="1" width="14" height="14" rx="2" /><circle cx="5.5" cy="5.5" r="1.5" /><polyline points="1,11 5,7 8,10 11,7 15,11" /></svg> }
function IconTrash() { return <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}><polyline points="3,5 13,5" /><path d="M5 5V3.5a.5.5 0 01.5-.5h5a.5.5 0 01.5.5V5M6 8v4M10 8v4M4 5l1 8.5a.5.5 0 00.5.5h5a.5.5 0 00.5-.5L12 5" /></svg> }
function IconUpload() { return <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}><path d="M8 1v10M5 4l3-3 3 3" /><path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" /></svg> }
function IconDrag() { return <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}><circle cx="5" cy="4" r="1" fill="currentColor" stroke="none" /><circle cx="5" cy="8" r="1" fill="currentColor" stroke="none" /><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="11" cy="4" r="1" fill="currentColor" stroke="none" /><circle cx="11" cy="8" r="1" fill="currentColor" stroke="none" /><circle cx="11" cy="12" r="1" fill="currentColor" stroke="none" /></svg> }

const MAX_IMAGES = 4

function HeroImages() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const fileRef = useRef()

    const { data: heroData, refetch } = useGetHeroImagesQuery()
    const images = Array.isArray(heroData) ? heroData.slice(0, MAX_IMAGES) : []

    const [uploading, setUploading] = useState(false)
    const [deleting, setDeleting] = useState(null)
    const [dragOver, setDragOver] = useState(false)
    const [preview, setPreview] = useState(null) // full-screen preview

    // ── Upload ────────────────────────────────────────────
    const handleUpload = async (files) => {
        if (!files?.length) return
        if (images.length >= MAX_IMAGES) return

        const remaining = MAX_IMAGES - images.length
        const toUpload = Array.from(files).slice(0, remaining)

        setUploading(true)

        
        try {
            for (const file of toUpload) {
                const ext = file.name.split('.').pop()
                const path = `hero/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

                const { error: upErr } = await supabase.storage
                    .from(BUCKET)
                    .upload(path, file)
                if (upErr) throw upErr

                const { data: urlData } = supabase.storage
                    .from(BUCKET)
                    .getPublicUrl(path)

                await supabase
                    .from('hero_images')
                    .insert({
                        url: urlData.publicUrl,
                        path,
                        order: images.length,
                        active: true
                    })
            }
            refetch()
        } catch (err) {
            console.error('Upload error:', err)
        } finally {
            setUploading(false)
        }
    }

    // ── Delete ────────────────────────────────────────────
    const handleDelete = async (img) => {
        setDeleting(img.id)
        try {
            if (img.path) {
                await supabase.storage.from(BUCKET).remove([img.path])
            }
            await supabase.from('hero_images').delete().eq('id', img.id)
            refetch()
        } catch (err) {
            console.error('Delete error:', err)
        } finally {
            setDeleting(null)
        }
    }

    // ── Drag & drop ───────────────────────────────────────
    const handleDrop = (e) => {
        e.preventDefault()
        setDragOver(false)
        handleUpload(e.dataTransfer.files)
    }

    const slots = Array.from({ length: MAX_IMAGES })

    return (
        <>
            <style>{`
                /* ── RESPONSIVE ── */
                @media (max-width: 900px) {
                    .admin-root { flex-direction: column; }
                    .sidebar { width: 100%; min-height: auto; position: static; flex-direction: row; flex-wrap: wrap; }
                    .sidebar-logo { padding: 12px 16px; border-bottom: none; border-right: 1px solid var(--border); }
                    .sidebar-profile { padding: 10px 14px; border-bottom: none; border-right: 1px solid var(--border); }
                    .sidebar-nav { flex: 1; flex-direction: row; padding: 8px 10px; gap: 2px; overflow-x: auto; align-items: center; border-bottom: 1px solid var(--border); }
                    .sidebar-nav::-webkit-scrollbar { display: none; }
                    .nav-item { padding: 8px 10px; font-size: 12px; white-space: nowrap; flex-shrink: 0; }
                    .sidebar-logout { padding: 8px 10px; border-top: none; }
                    .content { padding: 16px; }
                    .topbar { padding: 0 16px; }
                }
                @media (max-width: 600px) {
                    .sidebar { flex-direction: column; }
                    .sidebar-logo, .sidebar-profile { border-right: none; border-bottom: 1px solid var(--border); }
                    .hero-slots { grid-template-columns: 1fr 1fr !important; }
                }

                /* ── HERO IMAGES SPECIFIC ── */
                .hero-wrap { display: flex; flex-direction: column; gap: 24px; max-width: 800px; }

                .hero-upload-zone {
                    border: 2px dashed var(--border);
                    border-radius: 14px;
                    padding: 32px 24px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: rgba(255,255,255,0.01);
                }
                .hero-upload-zone:hover,
                .hero-upload-zone.dragover {
                    border-color: var(--accent);
                    background: rgba(232,83,42,0.04);
                }
                .hero-upload-zone.disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                    pointer-events: none;
                }
                .hero-upload-icon {
                    width: 48px; height: 48px; border-radius: 12px;
                    background: rgba(232,83,42,0.1);
                    border: 1px solid rgba(232,83,42,0.2);
                    display: flex; align-items: center; justify-content: center;
                    color: var(--accent); margin: 0 auto 14px;
                }
                .hero-upload-icon svg { width: 22px; height: 22px; }
                .hero-upload-title {
                    font-size: 14px; font-weight: 700; color: var(--text);
                    margin-bottom: 6px;
                }
                .hero-upload-sub {
                    font-size: 12px; color: var(--muted);
                    font-family: 'JetBrains Mono', monospace;
                }
                .hero-upload-btn {
                    display: inline-flex; align-items: center; gap: 7px;
                    margin-top: 16px; padding: 9px 20px;
                    border-radius: 8px; border: none;
                    background: var(--accent); color: #fff;
                    font-family: 'Manrope', sans-serif;
                    font-size: 13px; font-weight: 700;
                    letter-spacing: 0.5px; cursor: pointer;
                    transition: all 0.15s;
                }
                .hero-upload-btn:hover { background: var(--accent2); transform: translateY(-1px); }
                .hero-upload-btn svg { width: 14px; height: 14px; }
                .hero-upload-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

                /* Counter */
                .hero-counter {
                    display: flex; align-items: center; gap: 8px;
                    padding: 10px 16px;
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: 10px;
                }
                .hero-counter-bar {
                    flex: 1; height: 4px; background: rgba(255,255,255,0.06);
                    border-radius: 99px; overflow: hidden;
                }
                .hero-counter-fill {
                    height: 100%; border-radius: 99px;
                    background: var(--accent);
                    transition: width 0.3s ease;
                }
                .hero-counter-text {
                    font-size: 11px; font-family: 'JetBrains Mono', monospace;
                    color: var(--muted); white-space: nowrap;
                }
                .hero-counter-text span { color: var(--accent); font-weight: 700; }

                /* Slots grid */
                .hero-slots {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 14px;
                }

                /* Slot */
                .hero-slot {
                    border-radius: 14px; overflow: hidden;
                    border: 1px solid var(--border);
                    background: var(--surface);
                    aspect-ratio: 16/7;
                    position: relative;
                    transition: border-color 0.2s;
                }
                .hero-slot.filled { border-color: rgba(255,255,255,0.1); }
                .hero-slot.empty {
                    display: flex; flex-direction: column;
                    align-items: center; justify-content: center;
                    gap: 8px; opacity: 0.3;
                }
                .hero-slot-num {
                    font-size: 11px; font-family: 'JetBrains Mono', monospace;
                    color: var(--muted); letter-spacing: 1px;
                }
                .hero-slot img {
                    width: 100%; height: 100%;
                    object-fit: cover;
                    display: block;
                }

                /* Slot overlay */
                .hero-slot-overlay {
                    position: absolute; inset: 0;
                    background: rgba(0,0,0,0);
                    display: flex; align-items: flex-start; justify-content: space-between;
                    padding: 10px 12px;
                    transition: background 0.2s;
                }
                .hero-slot.filled:hover .hero-slot-overlay {
                    background: rgba(0,0,0,0.45);
                }
                .hero-slot-badge {
                    font-size: 10px; font-family: 'JetBrains Mono', monospace;
                    letter-spacing: 1px;
                    background: rgba(0,0,0,0.6);
                    border: 1px solid rgba(255,255,255,0.12);
                    color: rgba(255,255,255,0.7);
                    padding: 3px 8px; border-radius: 6px;
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                .hero-slot.filled:hover .hero-slot-badge { opacity: 1; }

                .hero-slot-actions {
                    display: flex; gap: 6px;
                    opacity: 0; transition: opacity 0.2s;
                }
                .hero-slot.filled:hover .hero-slot-actions { opacity: 1; }

                .hero-slot-btn {
                    width: 30px; height: 30px; border-radius: 8px;
                    border: none; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    transition: all 0.15s;
                }
                .hero-slot-btn svg { width: 13px; height: 13px; }
                .hero-slot-btn.preview {
                    background: rgba(255,255,255,0.15);
                    color: #fff; border: 1px solid rgba(255,255,255,0.2);
                }
                .hero-slot-btn.preview:hover { background: rgba(255,255,255,0.25); }
                .hero-slot-btn.del {
                    background: rgba(231,76,60,0.2);
                    color: #e74c3c; border: 1px solid rgba(231,76,60,0.3);
                }
                .hero-slot-btn.del:hover { background: rgba(231,76,60,0.35); }
                .hero-slot-btn:disabled { opacity: 0.5; cursor: not-allowed; }

                /* Full preview */
                .hero-preview-overlay {
                    position: fixed; inset: 0; z-index: 999;
                    background: rgba(0,0,0,0.9); backdrop-filter: blur(12px);
                    display: flex; align-items: center; justify-content: center;
                    padding: 24px; cursor: pointer;
                }
                .hero-preview-img {
                    max-width: 90vw; max-height: 80vh;
                    border-radius: 12px;
                    box-shadow: 0 24px 80px rgba(0,0,0,0.6);
                    object-fit: contain;
                }
                .hero-preview-close {
                    position: fixed; top: 20px; right: 20px;
                    width: 36px; height: 36px; border-radius: 10px;
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.15);
                    color: #fff; font-size: 16px; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    transition: background 0.15s;
                }
                .hero-preview-close:hover { background: rgba(255,255,255,0.2); }

                /* Info card */
                .hero-info-card {
                    background: rgba(232,83,42,0.06);
                    border: 1px solid rgba(232,83,42,0.18);
                    border-radius: 10px; padding: 12px 16px;
                    display: flex; gap: 12px; align-items: flex-start;
                }
                .hero-info-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
                .hero-info-text { font-size: 12px; color: var(--muted); line-height: 1.6; }
                .hero-info-text strong { color: var(--text); }
            `}</style>

            {/* Full-screen preview */}
            {preview && (
                <div className="hero-preview-overlay" onClick={() => setPreview(null)}>
                    <button className="hero-preview-close" onClick={() => setPreview(null)}>✕</button>
                    <img src={preview} className="hero-preview-img" alt="preview" onClick={e => e.stopPropagation()} />
                </div>
            )}

            <div className="admin-root">
                {/* ── Sidebar ── */}
                <aside className="sidebar">
                    <div className="sidebar-logo">
                        <span>GamePC</span>
                        <small>ADMIN PANEL</small>
                    </div>
                    <div className="sidebar-profile">
                        <div className="avatar">A</div>
                        <div className="profile-info">
                            <span className="profile-badge">{t('admin.sidebar.admin')}</span>
                        </div>
                    </div>
                    <nav className="sidebar-nav">
                        <button className="nav-item" onClick={() => navigate('/adm')}>
                            <IconProducts /> {t('admin.sidebar.products')}
                        </button>
                        <button className="nav-item" onClick={() => navigate('/adm/orders')}>
                            <IconOrders /> {t('admin.sidebar.orders')}
                        </button>
                        <button className="nav-item active">
                            <IconImage /> Rasmlar
                        </button>
                        <button className="nav-item" onClick={() => navigate('/adm/settings')}>
                            <IconSettings /> {t('admin.sidebar.settings')}
                        </button>
                    </nav>
                    <div className="sidebar-logout">
                        <button className="logout-btn" onClick={() => navigate('/')}>
                            <IconLogout /> {t('admin.sidebar.logout')}
                        </button>
                    </div>
                </aside>

                {/* ── Main ── */}
                <div className="main">
                    <div className="topbar">
                        <span className="topbar-title">Hero Rasmlar</span>
                        <div className="topbar-right">
                            <div className="topbar-stat">
                                Maksimum: <span>{MAX_IMAGES} ta</span>
                            </div>
                            <div className="topbar-stat">
                                Yuklangan: <span>{images.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="content">
                        <div className="hero-wrap">

                            {/* Info */}
                            <div className="hero-info-card">
                                <span className="hero-info-icon">ℹ️</span>
                                <div className="hero-info-text">
                                    Bu yerda sayt bosh sahifasidagi <strong>carousel (slayder)</strong> uchun rasmlar saqlanadi.
                                    Maksimum <strong>{MAX_IMAGES} ta</strong> rasm qo'shish mumkin.
                                    Eng yaxshi nisbat: <strong>16:7</strong> (masalan 1920×840px).
                                    JPG, PNG, WEBP formatlar qo'llab-quvvatlanadi.
                                </div>
                            </div>

                            {/* Counter */}
                            <div className="hero-counter">
                                <div className="hero-counter-bar">
                                    <div className="hero-counter-fill" style={{ width: `${(images.length / MAX_IMAGES) * 100}%` }} />
                                </div>
                                <span className="hero-counter-text">
                                    <span>{images.length}</span> / {MAX_IMAGES} ta rasm
                                </span>
                            </div>

                            {/* Upload zone */}
                            <div
                                className={`hero-upload-zone ${dragOver ? 'dragover' : ''} ${images.length >= MAX_IMAGES ? 'disabled' : ''}`}
                                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                onClick={() => images.length < MAX_IMAGES && fileRef.current?.click()}
                            >
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    style={{ display: 'none' }}
                                    onChange={e => handleUpload(e.target.files)}
                                />
                                <div className="hero-upload-icon">
                                    <IconUpload />
                                </div>
                                {uploading ? (
                                    <>
                                        <div className="hero-upload-title">Yuklanmoqda...</div>
                                        <div className="hero-upload-sub">Iltimos kuting</div>
                                    </>
                                ) : images.length >= MAX_IMAGES ? (
                                    <>
                                        <div className="hero-upload-title">Maksimum rasm soni to'ldi</div>
                                        <div className="hero-upload-sub">Yangi rasm qo'shish uchun birini o'chiring</div>
                                    </>
                                ) : (
                                    <>
                                        <div className="hero-upload-title">
                                            Rasmni bu yerga tashlang yoki tanlang
                                        </div>
                                        <div className="hero-upload-sub">
                                            JPG · PNG · WEBP · Maksimum 10MB
                                        </div>
                                        <button className="hero-upload-btn" disabled={uploading} onClick={e => e.stopPropagation()}>
                                            <IconUpload /> Rasm tanlash
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Slots */}
                            <div className="hero-slots">
                                {slots.map((_, i) => {
                                    const img = images[i]
                                    return img ? (
                                        <div key={img.id} className="hero-slot filled">
                                            <img src={img.url} alt={`hero-${i + 1}`} />
                                            <div className="hero-slot-overlay">
                                                <span className="hero-slot-badge">#{i + 1}</span>
                                                <div className="hero-slot-actions">
                                                    <button
                                                        className="hero-slot-btn preview"
                                                        onClick={() => setPreview(img.url)}
                                                        title="Ko'rish"
                                                    >
                                                        <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}>
                                                            <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
                                                            <circle cx="8" cy="8" r="2" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        className="hero-slot-btn del"
                                                        onClick={() => handleDelete(img)}
                                                        disabled={deleting === img.id}
                                                        title="O'chirish"
                                                    >
                                                        {deleting === img.id
                                                            ? <div style={{ width: 12, height: 12, border: '2px solid #e74c3c', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                                                            : <IconTrash />
                                                        }
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div key={i} className="hero-slot empty">
                                            <IconImage />
                                            <span className="hero-slot-num">#{i + 1} bo'sh</span>
                                        </div>
                                    )
                                })}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default HeroImages