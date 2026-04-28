import React, { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useDetailProductQuery, useGetProductsQuery } from '../../app/services/pcApi'
import { useTranslation } from 'react-i18next'
import "./DetailsPage.css"
import Header from '../homePage/header/Header'
import Footer from '../homePage/footer/Footer'
import { useDispatch, useSelector } from 'react-redux'
import { addBasket, removeBasket } from '../../app/features/AuthSlice'
import basket from "../../images/basket-new.svg"
import { getLocalized } from '../../UI/localize'   // ← import

// ─── Specs CSS fix (injected) ──────────────────────────
const SPECS_FIX_CSS = `
  .specs-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .spec-card {
    align-items: flex-start;
    min-width: 0;
  }
  .spec-body {
    min-width: 0;
    width: 100%;
  }
  .spec-value {
    white-space: normal;
    word-break: break-word;
    overflow-wrap: anywhere;
    overflow: visible;
    text-overflow: unset;
    font-size: 14px;
    line-height: 1.4;
  }
  .spec-label {
    white-space: nowrap;
  }
  /* 1 rasm bo'lsa gallery height fixed */
  .details__gallery--single .details__main-img-wrap {
    aspect-ratio: 4/3;
  }
`

// ─── Icons ───────────────────────────────────────────────
const Icons = {
    cpu:      (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="8" y="8" width="8" height="8" rx="1" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="12" y1="1" x2="12" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="12" y1="20" x2="12" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="12" x2="4" y2="12" /><line x1="1" y1="15" x2="4" y2="15" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="12" x2="23" y2="12" /><line x1="20" y1="15" x2="23" y2="15" /></svg>),
    gpu:      (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="6" width="22" height="13" rx="2" /><circle cx="8" cy="12" r="2.5" /><circle cx="15" cy="12" r="2.5" /><line x1="5" y1="19" x2="5" y2="22" /><line x1="19" y1="19" x2="19" y2="22" /></svg>),
    ram:      (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="10" rx="1" /><line x1="6" y1="7" x2="6" y2="17" /><line x1="10" y1="7" x2="10" y2="17" /><line x1="14" y1="7" x2="14" y2="17" /><line x1="18" y1="7" x2="18" y2="17" /><line x1="5" y1="4" x2="5" y2="7" /><line x1="9" y1="4" x2="9" y2="7" /><line x1="13" y1="4" x2="13" y2="7" /><line x1="17" y1="4" x2="17" y2="7" /></svg>),
    ssd:      (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><line x1="7" y1="8" x2="17" y2="8" /><line x1="7" y1="12" x2="17" y2="12" /><line x1="7" y1="16" x2="12" y2="16" /><circle cx="18" cy="16" r="1.5" fill="currentColor" stroke="none" /></svg>),
    board:    (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2" /><rect x="6" y="6" width="5" height="5" rx="1" /><rect x="13" y="6" width="5" height="5" rx="1" /><rect x="6" y="13" width="5" height="5" rx="1" /><line x1="13" y1="15" x2="18" y2="15" /><line x1="15" y1="13" x2="15" y2="18" /></svg>),
    hz:       (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="15" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="18" x2="12" y2="21" /><polyline points="6,12 9,8 12,12 15,7 18,12" /></svg>),
    dpi:      (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8 2 5 5.5 5 9v7l2 4h10l2-4V9c0-3.5-3-7-7-7z" /><line x1="12" y1="2" x2="12" y2="10" /><circle cx="12" cy="11" r="1.5" fill="currentColor" stroke="none" /></svg>),
    power:    (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><line x1="7" y1="7" x2="7" y2="3" /><line x1="17" y1="7" x2="17" y2="3" /><circle cx="12" cy="14" r="2.5" /><line x1="12" y1="11.5" x2="12" y2="9" /></svg>),
    cooling:  (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>),
    caseIcon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="9" y1="7" x2="15" y2="7" /><line x1="9" y1="11" x2="15" y2="11" /><circle cx="12" cy="17" r="1.5" /></svg>),
    battery:  (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="18" height="10" rx="2" /><line x1="22" y1="11" x2="22" y2="13" strokeWidth="2.5" strokeLinecap="round" /><line x1="7" y1="12" x2="13" y2="12" /><line x1="10" y1="9" x2="10" y2="15" /></svg>),
}

const POWER_KEYS = ['power', 'psu']

const getOptionMeta = (t) => ({
    cpu:     { label: t('details.specs_cpu'),     icon: Icons.cpu },
    gpu:     { label: t('details.specs_gpu'),     icon: Icons.gpu },
    board:   { label: t('details.specs_board'),   icon: Icons.board },
    hz:      { label: t('details.specs_hz'),      icon: Icons.hz,      unit: 'Hz' },
    dpi:     { label: t('details.specs_dpi'),     icon: Icons.dpi,     unit: 'dpi' },
    monitor: { label: t('details.specs_monitor'), icon: Icons.hz },
    display: { label: t('details.specs_display'), icon: Icons.hz },
    cooling: { label: t('details.specs_cooling'), icon: Icons.cooling },
    cooler:  { label: t('details.specs_cooling'), icon: Icons.cooling },
    case:    { label: t('details.specs_case'),    icon: Icons.caseIcon },
    corpus:  { label: t('details.specs_case'),    icon: Icons.caseIcon },
    color:   { label: t('details.specs_color'),   icon: Icons.caseIcon },
})

function SpecCard({ icon, label, value }) {
    return (
        <div className="spec-card">
            <span className="spec-icon">{icon}</span>
            <div className="spec-body">
                <span className="spec-label">{label}</span>
                <span className="spec-value">{value}</span>
            </div>
        </div>
    )
}

// ─── Similar Card ─────────────────────────────────────────
function SimilarCard({ el, basketList, dispatch, navigate, catLabel }) {
    const basketItem = basketList?.find(item => item.id === el.id)
    const qty = basketItem?.quantity ?? 0
    const opt = el.options?.[0] ?? {}
    const localName = getLocalized(el, 'name')   // ← localized

    return (
        <div
            className="similar-card"
            onClick={() => navigate(`/details/${el.id}?category&type=${el.category}`)}
        >
            <div className="similar-card__img-wrap">
                {el.imgs?.[0]
                    ? <img src={el.imgs[0]} alt={localName} />
                    : <div className="similar-card__placeholder">📦</div>
                }
                <span className="similar-card__badge">{catLabel}</span>
            </div>

            <div className="similar-card__body">
                <p className="similar-card__name">{localName}</p>

                {(opt.cpu || opt.gpu) && (
                    <div className="similar-card__specs">
                        {opt.cpu && <span>{opt.cpu}</span>}
                        {opt.gpu && <span>{opt.gpu}</span>}
                    </div>
                )}

                <div className="similar-card__footer">
                    <span className="similar-card__price">{el.price.toLocaleString()} USD</span>
                    {qty > 0 ? (
                        <div className="similar-card__counter" onClick={e => e.stopPropagation()}>
                            <button onClick={() => dispatch(removeBasket(el.id))}>−</button>
                            <span>{qty}</span>
                            <button onClick={() => dispatch(addBasket({ basketList: el }))}>+</button>
                        </div>
                    ) : (
                        <button
                            className="similar-card__btn"
                            onClick={e => { e.stopPropagation(); dispatch(addBasket({ basketList: el })) }}
                        >
                            <img src={basket} alt="basket" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

// ─── Similar Section ──────────────────────────────────────
function SimilarSection({ currentId, category }) {
    const { t } = useTranslation()
    const { data: allProducts } = useGetProductsQuery()
    const navigate   = useNavigate()
    const dispatch   = useDispatch()
    const basketList = useSelector(state => state.auth.basketList)

    const similar = allProducts
        ?.filter(p => p.category === category && p.id !== currentId && p.status === 'yes')
        ?.slice(0, 6) ?? []

    if (similar.length === 0) return null

    return (
        <section className="similar">
            <div className="container">
                <div className="similar__header">
                    <div>
                        <p className="similar__label">{t('details.similar_label')}</p>
                        <h2 className="similar__title">{t('details.similar')}</h2>
                    </div>
                    <button
                        className="similar__all-btn"
                        onClick={() => navigate(`/categories/${category}`)}
                    >
                        {t('details.all_products')}
                    </button>
                </div>
                <div className="similar__grid">
                    {similar.map(el => (
                        <SimilarCard
                            key={el.id}
                            el={el}
                            basketList={basketList}
                            dispatch={dispatch}
                            navigate={navigate}
                            catLabel={t(`create.categories.${el.category}`, el.category)}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}

// ─── Main ─────────────────────────────────────────────────
function DetailsPage() {
    const { t, i18n } = useTranslation()
    const { id }      = useParams()
    const { data: detailPage, isLoading } = useDetailProductQuery(id)
    const [activeImg, setActiveImg] = useState(0)
    const dispatch   = useDispatch()
    const navigate   = useNavigate()
    const basketList = useSelector(state => state.auth.basketList)
    const details    = detailPage?.[0]
    const [searchParams] = useSearchParams()

    const news       = searchParams.has("new")
    const basket_p   = searchParams.has("basket")
    const models     = searchParams.has("models")
    const categories = searchParams.has("category")
    const type       = searchParams.get("type")

    const [selectedRam, setSelectedRam] = useState(null)
    const [selectedSsd, setSelectedSsd] = useState(null)

    const opt = details?.options?.[0]

    const ramList = Array.isArray(opt?.ram) && opt.ram.some(r => r.size && r.size !== 0)
        ? opt.ram.filter(r => r.size && r.size !== 0)
        : null

    const ssdList = Array.isArray(opt?.ssd) && opt.ssd.some(s => s.size && s.size !== 0 && s.size !== '0' && s.type)
        ? opt.ssd.filter(s => s.size && s.size !== 0 && s.size !== '0' && s.type)
        : null

    useEffect(() => {
        if (details) {
            if (ramList) setSelectedRam(ramList[0])
            if (ssdList) setSelectedSsd(ssdList[0])
        }
    }, [details])

    useEffect(() => { window.scrollTo(0, 0) }, [id])

    const basePrice  = details?.price ?? 0
    const ramExtra   = selectedRam?.price ?? 0
    const ssdExtra   = selectedSsd?.price ?? 0
    const finalPrice = basePrice + ramExtra + ssdExtra

    const basketProduct = { ...details, price: finalPrice, selectedRam, selectedSsd }
    const basketItem    = basketList?.find(item => item.id === details?.id)
    const qty           = basketItem?.quantity ?? 0

    useEffect(() => {
        try {
            const light = (basketList ?? []).map(item => ({
                id:          item.id,
                name:        item.name,
                price:       item.price,
                category:    item.category,
                quantity:    item.quantity ?? 1,
                status:      item.status,
                imgs:        (item.imgs ?? []).filter(url => url && !url.startsWith('data:')),
                options:     item.options ?? [],
                selectedRam: item.selectedRam ?? null,
                selectedSsd: item.selectedSsd ?? null,
            }))
            localStorage.setItem("basket_list", JSON.stringify(light))
        } catch {
            localStorage.removeItem("basket_list")
        }
    }, [basketList])

    const OPTION_META = getOptionMeta(t)
    const dateLocale  = { en: 'en-US', uz: 'uz-UZ', ru: 'ru-RU' }[i18n.language?.slice(0, 2)] ?? 'ru-RU'

    // ── Localized fields ──────────────────────────────────
    const localName = getLocalized(details, 'name')
    const localDesc = getLocalized(details, 'desc')

    if (isLoading) {
        return (
            <>
                <Header />
                <section className="details">
                    <div className="container">
                        <div className="skeleton-wrapper">
                            <div className="skeleton skeleton-img" />
                            <div className="skeleton-info">
                                <div className="skeleton skeleton-title" />
                                <div className="skeleton skeleton-text" />
                                <div className="skeleton skeleton-price" />
                            </div>
                        </div>
                    </div>
                </section>
            </>
        )
    }

    if (!details) return null

    const inStock   = details.status === 'yes'
    const catLabel  = t(`create.categories.${details.category}`, details.category)
    const typeLabel = t(`create.categories.${type}`, type)

    return (
        <>
            <Header />
            <style>{SPECS_FIX_CSS}</style>
            <section className="details">
                <div className="details__bg-glow" />
                <div className="container">

                    {/* Breadcrumb */}
                    <div className="details__map">
                        <Link to="/">{t('categories.home')}</Link>
                        <span> / </span>
                        {models    && <><Link to="/search">{t('nav.models')}</Link><span> / </span></>}
                        {basket_p  && <><Link to="/basketItems">{t('basket.title')}</Link><span> / </span></>}
                        {categories && type && (
                            <><Link to={`/categories/${type}`}>{typeLabel}</Link><span> / </span></>
                        )}
                        {news && (<><span className="details__news">{t('news.new_arrivals')}</span><span> / </span></>)}
                        <span className="details__name-item">{localName}</span>
                    </div>

                    <div className="details__grid">

                        {/* Gallery */}
                        <div className={`details__gallery${!details.imgs || details.imgs.length <= 1 ? " details__gallery--single" : ""}`}>
                            <div className="details__main-img-wrap">
                                <img
                                    className="details__main-img"
                                    src={details.imgs?.[activeImg]}
                                    alt={localName}
                                />
                                <span className="details__badge">{catLabel}</span>
                            </div>
                            {details.imgs?.length > 1 && (
                            <div className="details__thumbs">
                                {details.imgs.map((img, i) => (
                                    <button
                                        key={i}
                                        className={`details__thumb ${activeImg === i ? 'active' : ''}`}
                                        onClick={() => setActiveImg(i)}
                                    >
                                        <img src={img} alt={`view-${i}`} />
                                    </button>
                                ))}
                            </div>
                        )}
                        </div>

                        {/* Info */}
                        <div className="details__info">
                            <p className="details__category">{catLabel}</p>
                            <h1 className="details__name">{localName}</h1>
                            <div className="details__divider" />
                            <p className="details__desc">{localDesc}</p>

                            {/* RAM */}
                            {ramList && (
                                <div className="details__variants">
                                    <p className="details__variants-title">
                                        <span className="details__variants-icon">{Icons.ram}</span>
                                        {t('details.ram')}
                                    </p>
                                    <div className="details__variants-list">
                                        {ramList.map((r, i) => (
                                            <button
                                                key={i}
                                                className={`details__variant-btn ${selectedRam?.size === r.size ? 'active' : ''}`}
                                                onClick={() => setSelectedRam(r)}
                                            >
                                                <span className="variant-size">{r.size} GB</span>
                                                <span className="variant-price">
                                                    {r.price > 0 ? `+$${r.price}` : t('details.base')}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* SSD */}
                            {ssdList && (
                                <div className="details__variants">
                                    <p className="details__variants-title">
                                        <span className="details__variants-icon">{Icons.ssd}</span>
                                        {t('details.ssd')}
                                    </p>
                                    <div className="details__variants-list">
                                        {ssdList.map((s, i) => (
                                            <button
                                                key={i}
                                                className={`details__variant-btn ${selectedSsd?.size === s.size && selectedSsd?.type === s.type ? 'active' : ''}`}
                                                onClick={() => setSelectedSsd(s)}
                                            >
                                                <span className="variant-size">{s.size} {s.type}</span>
                                                <span className="variant-price">
                                                    {s.price > 0 ? `+$${s.price}` : t('details.base')}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Price */}
                            <div className="details__price-row">
                                <div className="details__price-breakdown">
                                    <span className="details__price">
                                        {finalPrice.toLocaleString()} <em>USD</em>
                                    </span>
                                    {(ramExtra > 0 || ssdExtra > 0) && (
                                        <span className="details__price-hint">
                                            ${basePrice}
                                            {ramExtra > 0 && <> + <span className="hint-accent">${ramExtra} RAM</span></>}
                                            {ssdExtra > 0 && <> + <span className="hint-accent">${ssdExtra} SSD</span></>}
                                        </span>
                                    )}
                                </div>
                                <span className={`details__stock ${!inStock ? 'out' : ''}`}>
                                    {inStock ? t('details.in_stock') : t('details.out_of_stock')}
                                </span>
                            </div>

                            {/* Cart */}
                            <div className="details__actions">
                                {!inStock ? (
                                    <button className="btn-cart disabled" disabled>
                                        {t('details.out_of_stock')}
                                    </button>
                                ) : qty > 0 ? (
                                    <div className="details__counter">
                                        <button onClick={() => dispatch(removeBasket(details.id))}>−</button>
                                        <span>{qty}</span>
                                        <button onClick={() => dispatch(addBasket({ basketList: basketProduct }))}>+</button>
                                    </div>
                                ) : (
                                    <button
                                        className="btn-cart"
                                        onClick={() => dispatch(addBasket({ basketList: basketProduct }))}
                                    >
                                        {t('details.add_to_cart')}
                                    </button>
                                )}
                            </div>

                            {/* Meta */}
                            <div className="details__meta">
                                <div className="details__meta-item">
                                    <span className="meta-label">{t('details.id')}</span>
                                    <span className="meta-value">#{details.id}</span>
                                </div>
                                {/* <div className="details__meta-item">
                                    <span className="meta-label">{t('details.added_at')}</span>
                                    <span className="meta-value">
                                        {new Date(details.created_at).toLocaleDateString(dateLocale, {
                                            year: 'numeric', month: 'short', day: 'numeric'
                                        })}
                                    </span>
                                </div> */}
                            </div>

                            {/* Specs */}
                            {details.options?.map((opt, idx) => {
                                const specs = Object.entries(OPTION_META)
                                    .filter(([key]) => {
                                        const val = opt[key]
                                        if (val === undefined || val === null || val === '') return false
                                        if (Array.isArray(val)) return false
                                        if (typeof val === 'number') return val !== 0
                                        if (typeof val === 'string') return val.trim() !== '' && val.trim() !== '0'
                                        return true
                                    })
                                    .map(([key, meta]) => ({
                                        ...meta,
                                        value: meta.unit ? `${opt[key]} ${meta.unit}` : String(opt[key]),
                                    }))

                                const powerSpecs = POWER_KEYS
                                    .filter(key => {
                                        const val = opt[key]
                                        if (!val || Array.isArray(val)) return false
                                        if (typeof val === 'string') return val.trim() !== '' && val.trim() !== '0'
                                        if (typeof val === 'number') return val !== 0
                                        return false
                                    })
                                    .map(key => {
                                        const val = String(opt[key])
                                        const isBattery = val.toLowerCase().includes('hour')
                                        return {
                                            icon:  isBattery ? Icons.battery : Icons.power,
                                            label: isBattery ? t('details.specs_battery') : t('details.specs_power'),
                                            value: val,
                                        }
                                    })

                                const ramSpecs = Array.isArray(opt.ram) && opt.ram.some(r => r.size && r.size !== 0)
                                    ? [{ icon: Icons.ram, label: t('details.ram'), value: opt.ram.filter(r => r.size && r.size !== 0).map(r => `${r.size} GB`).join(' / ') }]
                                    : []

                                const ssdSpecs = Array.isArray(opt.ssd) && opt.ssd.some(s => s.size && s.size !== 0 && s.size !== '0' && s.type)
                                    ? [{ icon: Icons.ssd, label: t('details.ssd'), value: opt.ssd.filter(s => s.size && s.size !== 0 && s.size !== '0' && s.type).map(s => `${s.size} ${s.type}`).join(' / ') }]
                                    : []

                                const allSpecs = [...specs, ...powerSpecs, ...ramSpecs, ...ssdSpecs]
                                if (allSpecs.length === 0) return null

                                return (
                                    <div key={idx} className="details__specs">
                                        <h4 className="specs-title">
                                            <span className="specs-title-line" />
                                            {t('details.specs')}
                                            <span className="specs-title-line" />
                                        </h4>
                                        <div className="specs-grid">
                                            {allSpecs.map((spec, i) => (
                                                <SpecCard key={i} icon={spec.icon} label={spec.label} value={spec.value} />
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </section>

            <SimilarSection currentId={Number(id)} category={details.category} />
            <Footer />
        </>
    )
}

export default DetailsPage