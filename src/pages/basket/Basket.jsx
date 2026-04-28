import React, { useEffect, useState } from 'react'
import Header from '../homePage/header/Header'
import Footer from '../homePage/footer/Footer'
import "./Basket.css"
import { useDispatch, useSelector } from 'react-redux'
import { addBasket, removeBasket, deleteBasket } from '../../app/features/AuthSlice'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Modal from '../../UI/Modal'
import { getLocalized } from '../../UI/localize'
import TelegramLoginModal from '../../UI/TelegramLoginModal.jsx'
// import TelegramLoginModal from '../../UI/Telegramloginmodal'

// localStorage uchun yengil format — base64 rasmlarni o'chiradi,
// lekin options, selectedRam, selectedSsd ni SAQLAYDI
function stripForStorage(item) {
    return {
        id: item.id,
        name: item.name_ru || item.name_en || item.name_uz || item.name || '',
        name_ru: item.name_ru || item.name || '',
        name_en: item.name_en || item.name || '',
        name_uz: item.name_uz || item.name || '',
        price: item.price,
        category: item.category,
        quantity: item.quantity ?? 1,
        status: item.status,
        desc_ru: item.desc_ru || '',
        desc_en: item.desc_en || '',
        desc_uz: item.desc_uz || '',
        imgs: (item.imgs ?? []).filter(url => url && !url.startsWith('data:')),
        options: item.options ?? [],
        selectedRam: item.selectedRam ?? null,
        selectedSsd: item.selectedSsd ?? null,
    }
}

// ─── BasketItemOptions ────────────────────────────────────
function BasketItemOptions({ item, onOptionChange }) {
    const { t } = useTranslation()
    const option = item.options?.[0]
    if (!option) return null

    const ramList = option.ram?.filter(r => r.size && r.size !== 0) ?? []
    const ssdList = option.ssd?.filter(s => s.size && s.size !== 0) ?? []

    const hasRam = ramList.length > 1
    const hasSsd = ssdList.length > 1

    if (!hasRam && !hasSsd) return null

    const selectedRamSize = item.selectedRam?.size ?? ramList[0]?.size
    const selectedSsdSize = item.selectedSsd?.size ?? ssdList[0]?.size
    const selectedSsdType = item.selectedSsd?.type ?? ssdList[0]?.type

    return (
        <div className="basket__item-options" onClick={e => e.stopPropagation()}>
            {hasRam && (
                <div className="basket__option-group">
                    <span className="basket__option-label">{t('basket.ram')}</span>
                    <div className="basket__option-chips">
                        {ramList.map((r, i) => (
                            <button
                                key={i}
                                className={`basket__option-chip ${selectedRamSize === r.size ? 'active' : ''}`}
                                onClick={() => onOptionChange(item.id, { selectedRam: r })}
                            >
                                {r.size} GB
                                {r.price > 0 && <em> +{r.price}$</em>}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {hasSsd && (
                <div className="basket__option-group">
                    <span className="basket__option-label">{t('basket.ssd')}</span>
                    <div className="basket__option-chips">
                        {ssdList.map((s, i) => (
                            <button
                                key={i}
                                className={`basket__option-chip ${selectedSsdSize === s.size && selectedSsdType === s.type ? 'active' : ''}`}
                                onClick={() => onOptionChange(item.id, { selectedSsd: s })}
                            >
                                {s.size} {s.type}
                                {s.price > 0 && <em> +{s.price}$</em>}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Basket ───────────────────────────────────────────────
function Basket() {
    const [open, setOpen] = useState(null)
    console.log("OPEN STATE:", open)
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const basketList = useSelector(state => state.auth.basketList)
    const basket = basketList?.[0]
    const navigate = useNavigate()
    let localName = getLocalized(basket, "name")

    // Local state: har item uchun tanlangan RAM/SSD
    // Boshlang'ich qiymatni Redux state dan olamiz
    const [itemOptions, setItemOptions] = useState(() => {
        const initial = {}
        basketList?.forEach(item => {
            initial[item.id] = {
                selectedRam: item.selectedRam ?? null,
                selectedSsd: item.selectedSsd ?? null,
            }
        })
        return initial
    })

    // localStorage ga saqlash — options bilan
    useEffect(() => {
        try {
            // itemOptions dan selectedRam/Ssd ni basketList ga birlashtirish
            const enriched = (basketList ?? []).map(item => ({
                ...stripForStorage(item),
                selectedRam: itemOptions[item.id]?.selectedRam ?? item.selectedRam ?? null,
                selectedSsd: itemOptions[item.id]?.selectedSsd ?? item.selectedSsd ?? null,
            }))
            localStorage.setItem("basket_list", JSON.stringify(enriched))
        } catch (e) {
            try {
                localStorage.removeItem("basket_list")
                const enriched = (basketList ?? []).map(item => stripForStorage(item))
                localStorage.setItem("basket_list", JSON.stringify(enriched))
            } catch {
                console.warn("localStorage saqlanmadi:", e)
            }
        }
    }, [basketList, itemOptions])

    const handleOptionChange = (itemId, changes) => {
        setItemOptions(prev => ({
            ...prev,
            [itemId]: { ...(prev[itemId] ?? {}), ...changes }
        }))
    }

    // Narx hisoblash
    const getItemExtraPrice = (item) => {
        const opts = itemOptions[item.id] ?? {}
        const option = item.options?.[0]
        const ramList = option?.ram?.filter(r => r.size && r.size !== 0) ?? []
        const ssdList = option?.ssd?.filter(s => s.size && s.size !== 0) ?? []

        let ramExtra = 0
        let ssdExtra = 0

        if (ramList.length > 1) {
            const selRam = opts.selectedRam ?? item.selectedRam ?? ramList[0]
            const found = ramList.find(r => r.size === selRam?.size)
            ramExtra = found?.price ?? 0
        }

        if (ssdList.length > 1) {
            const selSsd = opts.selectedSsd ?? item.selectedSsd ?? ssdList[0]
            const found = ssdList.find(s => s.size === selSsd?.size && s.type === selSsd?.type)
            ssdExtra = found?.price ?? 0
        }

        return ramExtra + ssdExtra
    }

    const getItemTotalPrice = (item) => {
        return (item.price + getItemExtraPrice(item)) * (item.quantity ?? 1)
    }

    const total = basketList?.reduce((sum, item) => sum + getItemTotalPrice(item), 0) ?? 0

    const enrichedItem = (item) => ({
        ...item,
        selectedRam: itemOptions[item.id]?.selectedRam ?? item.selectedRam ?? null,
        selectedSsd: itemOptions[item.id]?.selectedSsd ?? item.selectedSsd ?? null,
    })
    const handleOrderClick = () => {
        const hasOrdered = localStorage.getItem('has_ordered')

        if (!hasOrdered) {
            setOpen('telegram')   // ✅ boolean emas
        } else {
            setOpen('order')
        }
    }
    return (
        <>
            <Header />
            <section className="basket">
                <div className="container">
                    <div className="basket-map">
                        <Link to="/">{t('basket.home')} /</Link>
                        <span>{t('basket.title')}</span>
                    </div>

                    <div className="basket__head">
                        <div>
                            <h2 className="basket__title">{t('basket.title')}</h2>
                        </div>
                        <span className="basket__badge">
                            {basketList?.length ?? 0} {t('basket.products')}
                        </span>
                    </div>

                    <div className="basket__layout">
                        {/* LEFT — Items */}
                        <ul className="basket__list">
                            {!basketList?.length ? (
                                <li className="basket__empty">
                                    <div className="basket__empty-icon">🛒</div>
                                    <p className="basket__empty-text">{t('basket.empty')}</p>
                                </li>
                            ) : (
                                basketList.map((item, index) => {
                                    const rich = enrichedItem(item)
                                    const localName = getLocalized(rich, "name") // HAR ITEM uchun tilga mos nom
                                    const extraPrice = getItemExtraPrice(item)
                                    const unitPrice = item.price + extraPrice
                                    const totalPrice = unitPrice * (item.quantity ?? 1)

                                    return (
                                        <li
                                            key={index}
                                            className="basket__item"
                                            onClick={() => navigate(`/details/${item.id}?basket`)}
                                        >
                                            <div className="basket__photo">
                                                {item.imgs?.[0]
                                                    ? <img src={item.imgs[0]} alt={localName} />
                                                    : <div className="basket__photo-placeholder">📦</div>
                                                }
                                            </div>

                                            <div className="basket__info">
                                                <span className="basket__category">
                                                    {t(`create.categories.${item.category}`, item.category)}
                                                </span>
                                                <h3 className="basket__name">{localName}</h3>

                                                <BasketItemOptions
                                                    item={rich}
                                                    onOptionChange={handleOptionChange}
                                                />

                                                <p className="basket__price">
                                                    {totalPrice.toLocaleString()}
                                                    <em> USD</em>
                                                    {extraPrice > 0 && (
                                                        <span className="basket__price-extra">
                                                            ({item.price} + {extraPrice}$ {t('basket.extra')})
                                                        </span>
                                                    )}
                                                </p>
                                            </div>

                                            <div
                                                className="basket__counter"
                                                onClick={e => e.stopPropagation()}
                                            >
                                                <button
                                                    className="basket__counter-btn"
                                                    onClick={() => dispatch(removeBasket(item.id))}
                                                >−</button>
                                                <span className="basket__counter-num">{item.quantity ?? 1}</span>
                                                <button
                                                    className="basket__counter-btn"
                                                    onClick={() => dispatch(addBasket({ basketList: item }))}
                                                >+</button>
                                            </div>

                                            <button
                                                className="basket__delete"
                                                onClick={e => {
                                                    e.stopPropagation()
                                                    dispatch(deleteBasket(item.id))
                                                }}
                                            >🗑</button>
                                        </li>
                                    )
                                })
                            )}
                        </ul>

                        {/* RIGHT — Summary */}
                        {!!basketList?.length && (
                            <div className="basket__summary">
                                <p className="basket__summary-title">{t('basket.total')}</p>

                                <div className="basket__summary-rows">
                                    <div className="basket__summary-row">
                                        <span>{t('basket.items_count')}</span>
                                        <span>{basketList.length} {t('basket.sht')}</span>
                                    </div>
                                    <div className="basket__summary-row">
                                        <span>{t('basket.amount')}</span>
                                        <span>{total.toLocaleString()} USD</span>
                                    </div>
                                </div>

                                <div className="basket__divider" />

                                <div className="basket__total-row">
                                    <span>{t('basket.total')}</span>
                                    <span>{total.toLocaleString()} USD</span>
                                </div>

                                <button className="basket__order-btn" onClick={handleOrderClick}>
                                    {t('basket.order')} <span>→</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>
            <Footer />
            {open === 'telegram' && (
                <TelegramLoginModal
                    open={true}
                    onClose={() => setOpen(null)}
                    onSuccess={(user) => {
                        const phone = localStorage.getItem('temp_phone') || ''

                        localStorage.setItem('user_phone', phone)
                        localStorage.setItem('has_ordered', '1')

                        setOpen('order')
                    }}
                />
            )}

            {open === 'order' && (
                <Modal

                    enrichedList={basketList.map(enrichedItem)}
                    open={true}
                    onClose={() => setOpen(null)}
                />
            )}
        </>
    )
}

export default Basket