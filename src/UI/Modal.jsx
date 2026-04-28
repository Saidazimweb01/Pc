import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateOrderMutation } from '../app/services/pcApi'
import { useSelector, useDispatch } from 'react-redux'
import { clearBasket } from '../app/features/AuthSlice'
import { getLocalized } from './localize'

function prepareItems(basketList) {
    return basketList.map(item => {
        const ramExtra = item.selectedRam?.price ?? 0
        const ssdExtra = item.selectedSsd?.price ?? 0
        return {
            id: item.id,
            name_ru: item.name_ru || item.name || '',
            name_en: item.name_en || item.name || '',
            name_uz: item.name_uz || item.name || '',
            price: item.price + ramExtra + ssdExtra,  // ← to'liq narx
            quantity: item.quantity ?? 1,
            category: item.category,
            imgs: item.imgs?.slice(0, 1) ?? [],
            selectedRam: item.selectedRam
                ? { size: item.selectedRam.size, price: item.selectedRam.price }
                : null,

            selectedSsd: item.selectedSsd
                ? { size: item.selectedSsd.size, type: item.selectedSsd.type, price: item.selectedSsd.price }
                : null,
        }
    })
}

// ── Mini product row ──────────────────────────────────────
function OrderItem({ item }) {
    const name = getLocalized(item, 'name') || item.name_ru || item.name || '—'
    const qty = item.quantity || 1
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 0',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
            {item.imgs?.[0] && (
                <img src={item.imgs[0]} alt={name} style={{
                    width: 36, height: 36, objectFit: 'contain', borderRadius: 8,
                    background: 'rgba(0,0,0,0.2)', flexShrink: 0,
                }} onError={e => e.target.style.display = 'none'} />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {name}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                    {item.selectedRam?.size ? `RAM ${item.selectedRam.size}GB` : ''}
                    {item.selectedRam?.size && item.selectedSsd?.size ? ' · ' : ''}
                    {item.selectedSsd?.size ? `SSD ${item.selectedSsd.size}${item.selectedSsd.type}` : ''}
                </div>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', flexShrink: 0, textAlign: 'right' }}>
                {qty > 1 && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>×{qty}</div>}
                ${((item.price + (item.selectedRam?.price ?? 0) + (item.selectedSsd?.price ?? 0)) * qty).toLocaleString()}
            </div>
        </div>
    )
}

// ── Success screen ────────────────────────────────────────
function SuccessScreen({ onClose, onViewOrders }) {
    return (
        <div className="checkout-overlay" onClick={e => e.stopPropagation()}>
            <div className="checkout-modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
                <div style={{
                    padding: '40px 28px 32px',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 16, textAlign: 'center',
                }}>
                    {/* Animatsiyali icon */}
                    <div style={{
                        width: 72, height: 72, borderRadius: 20,
                        background: 'linear-gradient(135deg, rgba(46,204,113,0.15), rgba(46,204,113,0.05))',
                        border: '1.5px solid rgba(46,204,113,0.35)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 34,
                        boxShadow: '0 0 40px rgba(46,204,113,0.15)',
                    }}>✅</div>

                    <div>
                        <div style={{
                            color: '#7CFFB2', fontWeight: 800,
                            fontSize: 18, marginBottom: 8, letterSpacing: '-0.3px',
                        }}>
                            Buyurtma qabul qilindi!
                        </div>
                        <div style={{
                            color: 'rgba(255,255,255,0.45)',
                            fontSize: 13, lineHeight: 1.6,
                        }}>
                            Operatorimiz tez orada siz bilan<br />
                            bog'lanadi. Zakazlaringizni<br />
                            kuzating.
                        </div>
                    </div>

                    {/* Divider */}
                    <div style={{
                        width: '100%', height: 1,
                        background: 'rgba(255,255,255,0.06)',
                    }} />

                    <button
                        onClick={onViewOrders}
                        style={{
                            width: '100%', padding: '13px', borderRadius: 13,
                            border: 'none',
                            background: 'linear-gradient(135deg, #e8532a, #c0392b)',
                            color: '#fff', fontWeight: 700, cursor: 'pointer',
                            fontSize: 14, letterSpacing: '0.2px', transition: 'opacity 0.15s',
                        }}
                        onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
                        onMouseOut={e => e.currentTarget.style.opacity = '1'}
                    >
                        Zakazlarimni ko'rish →
                    </button>
                    <button
                        onClick={onClose}
                        style={{
                            width: '100%', padding: '10px', borderRadius: 13,
                            border: '1px solid rgba(255,255,255,0.08)',
                            background: 'transparent',
                            color: 'rgba(255,255,255,0.35)', fontWeight: 500,
                            cursor: 'pointer', fontSize: 13, transition: 'color 0.15s',
                        }}
                        onMouseOver={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                        onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
                    >
                        Yopish
                    </button>
                </div>
            </div>
        </div>
    )
}

// ── Main Modal ────────────────────────────────────────────
function Modal({ open, onClose, enrichedList }) {
    const [orderMutation, { isLoading }] = useCreateOrderMutation()
    const navigate = useNavigate()
    const reduxBasket = useSelector(state => state.auth.basketList)
    // enrichedList — Basket.jsx dan RAM/SSD bilan keladi, yo'q bo'lsa redux dan
    const basketList = enrichedList || reduxBasket
    const rawUserId = useSelector(state => state.auth.userId)
    const userId = rawUserId && rawUserId !== 'null' && rawUserId !== '' ? rawUserId : null
    const dispatch = useDispatch()

    const [name, setName] = useState(() => localStorage.getItem('order_name') || '')
    const [phone, setPhone] = useState(() => localStorage.getItem('order_phone') || '')
    const [phone2, setPhone2] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    // Narx hisoblash — selectedRam/Ssd extra narxini ham qo'shish
    const getItemTotal = (item) => {
        const basePrice = item.price || 0
        const ramExtra = item.selectedRam?.price ?? 0
        const ssdExtra = item.selectedSsd?.price ?? 0
        return (basePrice + ramExtra + ssdExtra) * (item.quantity || 1)
    }
    const total = basketList?.reduce((s, i) => s + getItemTotal(i), 0) ?? 0

    if (!open) return null

    // ── Success ekrani — basket allaqachon tozalangan ──
    if (success) {
        return (
            <SuccessScreen
                onClose={() => { setSuccess(false); onClose() }}
                onViewOrders={() => { setSuccess(false); onClose(); navigate('/my-orders-status') }}
            />
        )
    }

    // ── Buyurtma yuborish ─────────────────────────────
    const doOrder = (n, p) => {
        setError('')

        // try/catch ishlatmaymiz — Supabase 204 qaytarsa catch ga tushadi
        // Shuning uchun .then() ishlatamiz
        orderMutation({
            user_id: userId,
            name: n,
            phone: p,
            products: prepareItems(basketList),
            total_price: total,
            status: 'pending',
        }).then(() => {
            // Muvaffaqiyatli — xato bo'lsa ham 204 bu yerga keladi
            localStorage.setItem('has_ordered', '1')
            // ikki key da saqlaymiz — UserOrders qaysinisini topishini kafolatlaymiz
            localStorage.setItem('order_name', n)
            localStorage.setItem('order_phone', p)
            localStorage.setItem('user_name', n)
            localStorage.setItem('user_phone', p)
            dispatch(clearBasket())
            setSuccess(true)
        })
    }

    // ── Har doim bir xil forma — birinchi ham, keyingi ham ──
    // Faqat farqi: name/phone localStorage dan avvaldan to'ldirilgan bo'ladi
    const handleSubmit = () => {
        setError('')
        if (!name.trim()) { setError("Ismingizni kiriting"); return }
        if (!phone.trim()) { setError("Telefon raqamini kiriting"); return }

        const hasOrdered = !!localStorage.getItem('has_ordered')

        if (!hasOrdered) {
            // Birinchi marta — telefon tasdiqlash
            if (!phone2.trim()) { setError("Telefonni qayta kiriting"); return }
            if (phone !== phone2) { setError("Telefon raqamlar mos emas"); return }
        }

        doOrder(name, phone)
    }

    const hasOrdered = !!localStorage.getItem('has_ordered')

    return (
        <div className="checkout-overlay" onClick={onClose}>
            <div className="checkout-modal" onClick={e => e.stopPropagation()}>

                <div className="checkout-header">
                    <h2>{hasOrdered ? 'Buyurtmani tasdiqlash' : 'Buyurtma berish'}</h2>
                    <button onClick={onClose}>✕</button>
                </div>

                <div className="checkout-body">

                    {/* Mahsulotlar mini-ro'yxati */}
                    {basketList?.length > 0 && (
                        <div style={{
                            background: 'rgba(0,0,0,0.2)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: 12, padding: '4px 12px', marginBottom: 2,
                        }}>
                            {basketList.map((item, i) => <OrderItem key={i} item={item} />)}
                        </div>
                    )}

                    {/* Ism */}
                    <div style={{ position: 'relative' }}>
                        <input
                            placeholder="Ismingiz"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            style={hasOrdered && name ? { borderColor: 'rgba(46,204,113,0.4)', background: 'rgba(46,204,113,0.04)' } : {}}
                        />
                    </div>

                    {/* Telefon */}
                    <input
                        placeholder="+998901234567"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        style={hasOrdered && phone ? { borderColor: 'rgba(46,204,113,0.4)', background: 'rgba(46,204,113,0.04)' } : {}}
                    />

                    {/* Telefon tasdiqlash — faqat birinchi marta */}
                    {!hasOrdered && (
                        <input
                            placeholder="Telefonni qayta yozing"
                            value={phone2}
                            onChange={e => setPhone2(e.target.value)}
                        />
                    )}

                    {error && (
                        <div className="checkout-error">{error}</div>
                    )}

                    {/* Summary */}
                    <div className="checkout-summary">
                        <div>
                            <span>Mahsulotlar</span>
                            <b>{basketList?.length ?? 0} ta</b>
                        </div>
                        <div>
                            <span>Jami summa</span>
                            <b>${total.toLocaleString()} USD</b>
                        </div>
                    </div>

                    <button
                        className="checkout-btn"
                        onClick={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading
                            ? 'Yuborilmoqda...'
                            : hasOrdered
                                ? '✓ Tasdiqlash va buyurtma berish'
                                : 'Buyurtma berish'
                        }
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Modal