import React, { useState, useEffect } from 'react'
import './Create.css'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCreateProductMutation } from '../../app/services/pcApi'
import { supabase, BUCKET } from '../../app/services/pcApi'

const CATEGORY_FIELDS = {
    PC: ['cpu', 'gpu', 'board', 'power', 'cooler', 'corpus', 'system'],
    mono: ['cpu', 'gpu', 'display', 'hz'],
    corpus: ['corpus', 'cooler'],
    laptop: ['cpu', 'gpu', 'display', 'hz', 'system'],
    accessories: [],
}
const RAM_OPTIONS = ['16', '32']
const SSD_OPTIONS = [
    { label: '256 GB', size: 256, type: 'GB' },
    { label: '512 GB', size: 512, type: 'GB' },
    { label: '1 TB', size: 1, type: 'TB' },
    { label: '2 TB', size: 2, type: 'TB' },
]
const HAS_RAM = ['PC', 'mono', 'laptop']
const HAS_SSD = ['PC', 'mono', 'laptop']

const LANGS = [
    { code: 'ru', flag: '🇷🇺', label: 'Русский' },
    { code: 'en', flag: '🇬🇧', label: 'English' },
    { code: 'uz', flag: '🇺🇿', label: "O'zbek" },
]

// ─── Icons ───────────────────────────────────────────────
function IconBack() { return <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}><polyline points="10,4 6,8 10,12" /></svg> }
function IconArrow() { return <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}><polyline points="6,4 10,8 6,12" /></svg> }
function IconCheck() { return <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2.2}><polyline points="3,8 6.5,12 13,4" /></svg> }
function IconBigCheck() { return <svg fill="none" viewBox="0 0 32 32" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="6,16 13,24 26,8" /></svg> }
function IconImage() { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21,15 16,10 5,21" /></svg> }
function IconClose() { return <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2.2}><line x1="4" y1="4" x2="12" y2="12" /><line x1="12" y1="4" x2="4" y2="12" /></svg> }
function IconSend() { return <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}><line x1="2" y1="8" x2="14" y2="8" /><polyline points="9,3 14,8 9,13" /></svg> }
function IconChevron({ open }) {
    return (
        <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', width: 14, height: 14 }}>
            <polyline points="4,6 8,10 12,6" />
        </svg>
    )
}

// ─── Step indicator ───────────────────────────────────────
function StepIndicator({ current, category, t }) {
    const hasOptions = category && category !== 'accessories'
    const steps = hasOptions
        ? [t('create.steps.start'), t('create.steps.photos'), t('create.steps.info'), t('create.steps.options'), t('create.steps.price')]
        : [t('create.steps.start'), t('create.steps.photos'), t('create.steps.info'), t('create.steps.price')]
    const indicatorCurrent = (!hasOptions && current >= 4) ? current - 1 : current
    return (
        <div className="step-indicator">
            {steps.map((label, i) => {
                const done = i < indicatorCurrent, active = i === indicatorCurrent
                return (
                    <React.Fragment key={i}>
                        <div className={`step-dot ${done ? 'done' : active ? 'active' : ''}`}>
                            <div className="step-dot-circle">{done ? <IconCheck /> : i + 1}</div>
                            <span className="step-dot-label">{label}</span>
                        </div>
                        {i < steps.length - 1 && <div className={`step-line ${done ? 'done' : ''}`} />}
                    </React.Fragment>
                )
            })}
        </div>
    )
}

// ─── Success Screen ───────────────────────────────────────
function SuccessScreen({ productName, t }) {
    const navigate = useNavigate()
    const [count, setCount] = useState(3)
    useEffect(() => {
        const iv = setInterval(() => setCount(p => {
            if (p <= 1) { clearInterval(iv); navigate('/adm'); return 0 }
            return p - 1
        }), 1000)
        return () => clearInterval(iv)
    }, [navigate])
    return (
        <div className="success-screen">
            <div className="success-icon"><IconBigCheck /></div>
            <h2>{t('create.success')}</h2>
            <p>«{productName}»<br />{t('create.success_sub')}</p>
            <div className="success-countdown">
                {t('create.redirect')} <span className="countdown-num">{count}</span> {t('create.sec')}
            </div>
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────
function Create() {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const [createProduct, { isLoading }] = useCreateProductMutation()

    const CATEGORIES = [
        { value: 'PC', label: t('create.categories.PC') },
        { value: 'mono', label: t('create.categories.mono') },
        { value: 'corpus', label: t('create.categories.corpus') },
        { value: 'laptop', label: t('create.categories.laptop') },
        { value: 'accessories', label: t('create.categories.accessories') },
    ]
    const FIELD_LABELS = {
        cpu: t('create.fields.cpu'),
        gpu: t('create.fields.gpu'),
        board: t('create.fields.board'),
        power: t('create.fields.power'),
        cooler: t('create.fields.cooler'),
        corpus: t('create.fields.corpus'),
        display: t('create.fields.display'),
        hz: t('create.fields.hz'),
        system: t('create.fields.os'),
    }

    const [step, setStep] = useState(0)
    const [category, setCategory] = useState('')
    const [fields, setFields] = useState({})
    const [brand, setBrand] = useState('')   // ← brand
    const [price, setPrice] = useState('')
    const [images, setImages] = useState([null, null, null])
    const [uploading, setUploading] = useState(false)

    const [langs, setLangs] = useState({
        ru: { name: '', desc: '' },
        en: { name: '', desc: '' },
        uz: { name: '', desc: '' },
    })
    const [openLang, setOpenLang] = useState(null)

    const setLangField = (lang, field, val) =>
        setLangs(prev => ({ ...prev, [lang]: { ...prev[lang], [field]: val } }))
    const toggleLang = (code) => setOpenLang(prev => prev === code ? null : code)

    const anyLangFilled = Object.values(langs).some(l => l.name.trim())
    const primaryName = langs.ru.name.trim() || langs.en.name.trim() || langs.uz.name.trim() || ''

    // ── Images ───────────────────────────────────────────
    const handleImageChange = (index, file) => {
        if (!file) return
        const preview = URL.createObjectURL(file)
        setImages(prev => {
            const next = [...prev]
            if (next[index]?.preview) URL.revokeObjectURL(next[index].preview)
            next[index] = { file, preview }
            return next
        })
    }
    const removeImage = (index) => {
        setImages(prev => {
            const next = [...prev]
            if (next[index]?.preview) URL.revokeObjectURL(next[index].preview)
            next[index] = null
            return next
        })
    }
    const uploadImages = async () => {
        const urls = []
        for (const img of images) {
            if (!img) continue
            const ext = img.file.name.split('.').pop()
            const path = `products/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
            const { error } = await supabase.storage.from(BUCKET).upload(path, img.file)
            if (error) throw error
            const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
            urls.push(data.publicUrl)
        }
        return urls
    }

    // ── Options ──────────────────────────────────────────
    const setField = (key, val) => setFields(prev => ({ ...prev, [key]: val }))

    const [ram, setRam] = useState(RAM_OPTIONS.map(size => ({ size, checked: false, price: '' })))
    const [ssd, setSsd] = useState(SSD_OPTIONS.map(opt => ({ ...opt, checked: false, price: '' })))

    const toggleRam = (size) => setRam(prev => prev.map(r => r.size === size ? { ...r, checked: !r.checked } : r))
    const setRamPrice = (size, val) => setRam(prev => prev.map(r => r.size === size ? { ...r, price: val.replace(/[^0-9]/g, '') } : r))
    const toggleSsd = (label) => setSsd(prev => prev.map(s => s.label === label ? { ...s, checked: !s.checked } : s))
    const setSsdPrice = (label, val) => setSsd(prev => prev.map(s => s.label === label ? { ...s, price: val.replace(/[^0-9]/g, '') } : s))

    const checkedRam = ram.filter(r => r.checked)
    const checkedSsd = ssd.filter(s => s.checked)

    const catFields = CATEGORY_FIELDS[category] || []
    const filledCount = catFields.filter(k => fields[k] !== undefined && String(fields[k]).trim() !== '').length
    const isFieldEnabled = (idx) => idx === 0 || catFields.slice(0, idx).every(k => fields[k] !== undefined && String(fields[k]).trim() !== '')
    const optionsValid = () =>
        catFields.every(k => fields[k] !== undefined && String(fields[k]).trim() !== '') &&
        (!HAS_RAM.includes(category) || checkedRam.length > 0) &&
        (!HAS_SSD.includes(category) || checkedSsd.length > 0)

    const totalRequired = catFields.length + (HAS_RAM.includes(category) ? 1 : 0) + (HAS_SSD.includes(category) ? 1 : 0)
    const totalFilled = filledCount + (checkedRam.length > 0 ? 1 : 0) + (checkedSsd.length > 0 ? 1 : 0)
    const progressPct = totalRequired > 0 ? Math.round((totalFilled / totalRequired) * 100) : 100

    const canGoNext = () => {
        if (step === 1) return images.some(Boolean)
        if (step === 2) return category && anyLangFilled
        if (step === 3) return optionsValid()
        if (step === 4) return Number(price) > 0
        return true
    }

    // ── Submit ───────────────────────────────────────────
    const handleSubmit = async () => {
        const option = { hz: 0, dpi: 0, display: '', ...fields }
        const ramArray = HAS_RAM.includes(category) && checkedRam.length > 0
            ? checkedRam.map((r, i) => ({ size: Number(r.size), price: i === 0 ? 0 : Number(r.price) || 0 }))
            : [{ size: 0, price: 0 }]
        const ssdArray = HAS_SSD.includes(category) && checkedSsd.length > 0
            ? checkedSsd.map((s, i) => ({ size: s.size, type: s.type, price: i === 0 ? 0 : Number(s.price) || 0 }))
            : [{ size: 0, type: 'GB', price: 0 }]
        try {
            setUploading(true)
            const imgUrls = await uploadImages()
            const payload = {
                name_ru: langs.ru.name, name_en: langs.en.name, name_uz: langs.uz.name,
                desc_ru: langs.ru.desc, desc_en: langs.en.desc, desc_uz: langs.uz.desc,
                brand: brand.trim(),   // ← brand
                category,
                system: fields.system || '',
                price: Number(price) || 0,
                imgs: imgUrls,
                status: 'yes',
                options: [{ ...option, ram: ramArray, ssd: ssdArray }],
            }
            await createProduct(payload).unwrap()
            setStep(5)
        } catch (err) {
            console.error('Error:', err)
        } finally {
            setUploading(false)
        }
    }

    const isBusy = isLoading || uploading
    const nextStep = category === 'accessories' ? 4 : 3

    return (
        <div className="create-page">
            <button className="create-back" onClick={() => navigate('/adm')}>
                <IconBack /> {t('create.back')}
            </button>

            {step > 0 && step < 5 && (
                <StepIndicator current={step} category={category} t={t} />
            )}

            <div className="create-card">

                {/* ── STEP 0: Welcome ── */}
                {step === 0 && (
                    <>
                        <div className="welcome-icon">🖥️</div>
                        <h1>{t('create.title')}</h1>
                        <p className="subtitle">{t('create.subtitle')}</p>
                        <button className="btn-primary" onClick={() => setStep(1)}>
                            {t('create.start')} <IconArrow />
                        </button>
                    </>
                )}

                {/* ── STEP 1: Images ── */}
                {step === 1 && (
                    <>
                        <div className="step-header">
                            <h2>{t('create.photos.title')}</h2>
                            <p>{t('create.photos.desc')}</p>
                        </div>
                        <div className="imgs-grid">
                            {images.map((img, i) => (
                                <div className="img-slot" key={i}>
                                    {img ? (
                                        <>
                                            <img src={img.preview} alt="" />
                                            <button className="img-remove" onClick={() => removeImage(i)}><IconClose /></button>
                                        </>
                                    ) : (
                                        <>
                                            <IconImage />
                                            <span>{t('create.photos.slot')} {i + 1}</span>
                                            <input type="file" accept="image/*" onChange={e => handleImageChange(i, e.target.files[0])} />
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                        <p className="img-hint">{t('create.photos.hint')}</p>
                        <button className="btn-primary" onClick={() => setStep(2)} disabled={!canGoNext()}>
                            {t('create.next')} <IconArrow />
                        </button>
                        <button className="btn-secondary" onClick={() => setStep(0)}>
                            <IconBack /> {t('create.prev')}
                        </button>
                    </>
                )}

                {/* ── STEP 2: Info — Category + Brand + Lang blocks ── */}
                {step === 2 && (
                    <>
                        <div className="step-header">
                            <h2>{t('create.info.title')}</h2>
                            <p>{t('create.info.desc')}</p>
                        </div>

                        {/* Kategoriya */}
                        <div className="field">
                            <label>{t('create.info.cat_label')}</label>
                            <select value={category} onChange={e => { setCategory(e.target.value); setFields({}) }}>
                                <option value="" disabled>{t('create.info.cat_ph')}</option>
                                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>

                        {/* Brand — kategoriya tanlangandan keyin */}
                        {category && (
                            <div className="field">
                                <label>{t('create.fields.brand')}</label>
                                <input
                                    type="text"
                                    placeholder={t('create.fields.brand_ph')}
                                    value={brand}
                                    onChange={e => setBrand(e.target.value)}
                                />
                            </div>
                        )}

                        {/* Til bloklari */}
                        {category && (
                            <div className="lang-blocks-wrap">
                                <div className="lang-blocks-label">{t('create.info.translations_label')}</div>
                                <div className="lang-blocks-hint">{t('create.info.translations_hint')}</div>

                                {LANGS.map(({ code, flag, label }) => {
                                    const isOpen = openLang === code
                                    const filled = langs[code].name.trim() || langs[code].desc.trim()
                                    return (
                                        <div key={code} className={`lang-block ${isOpen ? 'lang-block--open' : ''} ${filled ? 'lang-block--filled' : ''}`}>
                                            <button className="lang-block-header" onClick={() => toggleLang(code)}>
                                                <span className="lang-block-flag">{flag}</span>
                                                <span className="lang-block-name">{label}</span>
                                                {filled && !isOpen && (
                                                    <span className="lang-block-preview">
                                                        {langs[code].name.slice(0, 30)}{langs[code].name.length > 30 ? '…' : ''}
                                                    </span>
                                                )}
                                                <span className="lang-block-status">
                                                    {filled ? <span className="lang-dot-filled" /> : <span className="lang-dot-empty" />}
                                                </span>
                                                <span className="lang-block-chevron"><IconChevron open={isOpen} /></span>
                                            </button>
                                            {isOpen && (
                                                <div className="lang-block-body">
                                                    <div className="field">
                                                        <label>{t('create.info.name_label')} <span className="lang-tag">{code.toUpperCase()}</span></label>
                                                        <input
                                                            type="text"
                                                            placeholder={t('create.info.name_ph')}
                                                            value={langs[code].name}
                                                            onChange={e => setLangField(code, 'name', e.target.value)}
                                                            autoFocus
                                                        />
                                                    </div>
                                                    <div className="field">
                                                        <label>{t('create.info.desc_label')} <span className="lang-tag">{code.toUpperCase()}</span></label>
                                                        <textarea
                                                            placeholder={t('create.info.desc_ph')}
                                                            value={langs[code].desc}
                                                            onChange={e => setLangField(code, 'desc', e.target.value)}
                                                            rows={3}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}

                                {!anyLangFilled && (
                                    <div className="lang-warn">{t('create.info.translations_required')}</div>
                                )}
                            </div>
                        )}

                        <button className="btn-primary" onClick={() => setStep(nextStep)} disabled={!canGoNext()}>
                            {t('create.next')} <IconArrow />
                        </button>
                        <button className="btn-secondary" onClick={() => setStep(1)}>
                            <IconBack /> {t('create.prev')}
                        </button>
                    </>
                )}

                {/* ── STEP 3: Options ── */}
                {step === 3 && (
                    <>
                        <div className="step-header">
                            <h2>{t('create.options.title')}</h2>
                            <p>{t('create.options.desc')}</p>
                        </div>
                        <div className="options-progress">
                            <div className="options-progress-bar">
                                <div className="options-progress-fill" style={{ width: `${progressPct}%` }} />
                            </div>
                            <span className="options-progress-label">{totalFilled}/{totalRequired}</span>
                        </div>
                        {catFields.length > 0 && (
                            <div className="options-grid">
                                {catFields.map((key, idx) => {
                                    const enabled = isFieldEnabled(idx)
                                    const filled = fields[key] !== undefined && String(fields[key]).trim() !== ''
                                    return (
                                        <div className={`field ${!enabled ? 'field-locked' : ''} ${filled ? 'field-filled' : ''}`} key={key}>
                                            <label>
                                                {FIELD_LABELS[key]}
                                                <span className="field-required">*</span>
                                                {filled && <span className="field-ok"><IconCheck /></span>}
                                            </label>
                                            <input
                                                type={key === 'hz' ? 'number' : 'text'}
                                                placeholder={enabled ? (key === 'hz' ? '60' : FIELD_LABELS[key]) : '—'}
                                                value={fields[key] || ''}
                                                disabled={!enabled}
                                                onChange={e => setField(key, e.target.value)}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                        {HAS_RAM.includes(category) && (
                            <div className={`variants-section ${filledCount < catFields.length ? 'section-locked' : ''}`}>
                                <div className="variants-section-title">
                                    {t('create.options.ram_title')}
                                    <span className="field-required">*</span>
                                    {checkedRam.length > 0 && <span className="field-ok"><IconCheck /></span>}
                                </div>
                                <div className="variants-cards">
                                    {ram.map(r => {
                                        const isBase = r.checked && checkedRam[0]?.size === r.size
                                        const ok = filledCount >= catFields.length
                                        return (
                                            <div key={r.size} className={`variant-card ${r.checked ? 'active' : ''} ${!ok ? 'variant-disabled' : ''}`}>
                                                <div className="variant-checkbox" onClick={() => ok && toggleRam(r.size)}><IconCheck /></div>
                                                <span className="variant-label">{r.size} GB</span>
                                                {r.checked && ok ? (isBase
                                                    ? <span className="variant-price-free">{t('create.options.base')}</span>
                                                    : <div className="variant-price-wrap"><span>+$</span><input className="variant-price-input" type="text" inputMode="numeric" placeholder="0" value={r.price} onChange={e => setRamPrice(r.size, e.target.value)} /></div>
                                                ) : null}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                        {HAS_SSD.includes(category) && (
                            <div className={`variants-section ${checkedRam.length === 0 ? 'section-locked' : ''}`}>
                                <div className="variants-section-title">
                                    {t('create.options.ssd_title')}
                                    <span className="field-required">*</span>
                                    {checkedSsd.length > 0 && <span className="field-ok"><IconCheck /></span>}
                                </div>
                                <div className="variants-cards">
                                    {ssd.map(s => {
                                        const isBase = s.checked && checkedSsd[0]?.label === s.label
                                        const ok = checkedRam.length > 0
                                        return (
                                            <div key={s.label} className={`variant-card ${s.checked ? 'active' : ''} ${!ok ? 'variant-disabled' : ''}`}>
                                                <div className="variant-checkbox" onClick={() => ok && toggleSsd(s.label)}><IconCheck /></div>
                                                <span className="variant-label">{s.label}</span>
                                                {s.checked && ok ? (isBase
                                                    ? <span className="variant-price-free">{t('create.options.base')}</span>
                                                    : <div className="variant-price-wrap"><span>+$</span><input className="variant-price-input" type="text" inputMode="numeric" placeholder="0" value={s.price} onChange={e => setSsdPrice(s.label, e.target.value)} /></div>
                                                ) : null}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                        <button className="btn-primary" onClick={() => setStep(4)} disabled={!canGoNext()}>
                            {t('create.next')} <IconArrow />
                        </button>
                        <button className="btn-secondary" onClick={() => setStep(2)}>
                            <IconBack /> {t('create.prev')}
                        </button>
                    </>
                )}

                {/* ── STEP 4: Price ── */}
                {step === 4 && (
                    <>
                        <div className="step-header">
                            <h2>{t('create.price.title')}</h2>
                            <p>{t('create.price.desc')}</p>
                        </div>
                        <div className="field">
                            <label>{t('create.price.label')}</label>
                            <div className="price-wrap">
                                <span className="price-symbol">$</span>
                                <input
                                    className="price-input"
                                    type="text" inputMode="numeric" placeholder="0"
                                    value={price}
                                    onChange={e => setPrice(e.target.value.replace(/[^0-9]/g, ''))}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <button className="btn-primary" onClick={handleSubmit} disabled={isBusy || !canGoNext()}>
                            {uploading ? t('create.uploading') : isLoading ? t('create.saving') : <><IconSend /> {t('create.publish')}</>}
                        </button>
                        <button className="btn-secondary" onClick={() => setStep(category === 'accessories' ? 2 : 3)}>
                            <IconBack /> {t('create.prev')}
                        </button>
                    </>
                )}

                {/* ── STEP 5: Success ── */}
                {step === 5 && <SuccessScreen productName={primaryName} t={t} />}

            </div>
        </div>
    )
}

export default Create