import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useGetOrdersQuery, useUpdateOrderMutation } from '../../app/services/pcApi'
import Header from '../homePage/header/Header'
import Footer from '../homePage/footer/Footer'
import { getLocalized } from '../../UI/localize'

function buildStatusMap(t) {
    return {
        pending:   { label: t('orders.status.pending'),   emoji: '⏳', color: '#e8a020', glow: 'rgba(232,160,32,0.12)',  step: 1 },
        confirmed: { label: t('orders.status.confirmed'), emoji: '✅', color: '#6381e8', glow: 'rgba(99,129,232,0.12)',  step: 2 },
        shipping:  { label: t('orders.status.shipping'),  emoji: '🚚', color: '#a78bfa', glow: 'rgba(167,139,250,0.12)', step: 3 },
        delivered: { label: t('orders.status.delivered'), emoji: '🎉', color: '#2ecc71', glow: 'rgba(46,204,113,0.12)', step: 4 },
        cancelled: { label: t('orders.status.cancelled'), emoji: '❌', color: '#e74c3c', glow: 'rgba(231,76,60,0.12)',  step: 0 },
    }
}

function buildSteps(t) {
    return [
        { key: 'pending',   label: t('orders.steps.pending'),   emoji: '📋' },
        { key: 'confirmed', label: t('orders.steps.confirmed'), emoji: '✅' },
        { key: 'shipping',  label: t('orders.steps.shipping'),  emoji: '🚚' },
        { key: 'delivered', label: t('orders.steps.delivered'), emoji: '🎉' },
    ]
}

function formatDate(str) {
    if (!str) return '—'
    const d = new Date(str)
    const uzTime = new Date(d.getTime() + 5 * 60 * 60 * 1000)
    const pad = n => String(n).padStart(2, '0')
    const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek']
    return `${pad(uzTime.getDate())} ${months[uzTime.getMonth()]} ${uzTime.getFullYear()}, ${pad(uzTime.getHours())}:${pad(uzTime.getMinutes())}`
}

/* ─── Stepper ─────────────────────────────────────────────────────────────── */
function Stepper({ status }) {
    const { t } = useTranslation()
    const STATUS = buildStatusMap(t)
    const STEPS  = buildSteps(t)

    if (status === 'cancelled') return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px', borderRadius: 12,
            background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)',
        }}>
            <span style={{ fontSize: 18 }}>❌</span>
            <span style={{ fontSize: 13, color: '#e74c3c', fontWeight: 600 }}>
                {t('orders.cancelled_banner')}
            </span>
        </div>
    )

    const current = STATUS[status]?.step ?? 1

    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
            {STEPS.map((s, i) => {
                const done   = current > i + 1
                const active = current === i + 1
                const cfg    = STATUS[s.key]
                const c      = done || active ? cfg.color : 'rgba(255,255,255,0.15)'
                return (
                    <React.Fragment key={s.key}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 56 }}>
                            <div style={{
                                width: 38, height: 38, borderRadius: '50%',
                                border: `2px solid ${c}`,
                                background: done || active ? cfg.glow : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: done ? 14 : active ? 18 : 12,
                                color: done || active ? cfg.color : 'rgba(255,255,255,0.2)',
                                fontWeight: 700, transition: 'all 0.3s',
                                boxShadow: active ? `0 0 14px ${cfg.color}35` : 'none',
                            }}>
                                {done ? '✓' : s.emoji}
                            </div>
                            <span style={{
                                fontSize: 10, fontWeight: 600, textAlign: 'center',
                                color: done || active ? cfg.color : 'rgba(255,255,255,0.2)',
                                lineHeight: 1.3,
                            }}>{s.label}</span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div style={{
                                flex: 1, height: 2, marginTop: 18,
                                background: current > i + 1
                                    ? `linear-gradient(90deg,${STATUS[STEPS[i].key].color},${STATUS[STEPS[i + 1].key].color})`
                                    : 'rgba(255,255,255,0.07)',
                                transition: 'background 0.4s',
                            }} />
                        )}
                    </React.Fragment>
                )
            })}
        </div>
    )
}

/* ─── OrderCard ────────────────────────────────────────────────────────────── */
function OrderCard({ order, onCancel }) {
    const { t } = useTranslation()
    const STATUS = buildStatusMap(t)

    const [open, setOpen]             = useState(false)
    const [cancelling, setCancelling] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const products = Array.isArray(order.products) ? order.products : []
    const total    = order.total_price || 0
    const cfg      = STATUS[order.status] || STATUS.pending
    const canCancel = order.status === 'pending' || order.status === 'confirmed'

    const handleCancel = async () => {
        setCancelling(true)
        await onCancel(order.id)
        setCancelling(false)
        setShowConfirm(false)
    }

    return (
        <>
            {/* ── Cancel confirm modal ── */}
            {showConfirm && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 999,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
                }} onClick={() => setShowConfirm(false)}>
                    <div style={{
                        background: '#1a1a1c', border: '1px solid rgba(231,76,60,0.25)',
                        borderRadius: 18, padding: '28px 24px', maxWidth: 340, width: '100%',
                        textAlign: 'center',
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
                            {t('orders.confirm_cancel.title')}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 20 }}>
                            {t('orders.confirm_cancel.desc')}
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => setShowConfirm(false)} style={{
                                flex: 1, padding: '11px', borderRadius: 10,
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(255,255,255,0.05)', color: '#fff',
                                fontWeight: 600, cursor: 'pointer', fontSize: 13,
                            }}>
                                {t('orders.confirm_cancel.no')}
                            </button>
                            <button onClick={handleCancel} disabled={cancelling} style={{
                                flex: 1, padding: '11px', borderRadius: 10,
                                border: '1px solid rgba(231,76,60,0.3)',
                                background: 'rgba(231,76,60,0.12)', color: '#e74c3c',
                                fontWeight: 700, cursor: 'pointer', fontSize: 13,
                            }}>
                                {cancelling ? '...' : t('orders.confirm_cancel.yes')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Card wrapper ── */}
            <div style={{
                borderRadius: 20, overflow: 'hidden',
                background: 'rgba(255,255,255,0.025)',
                border: `1px solid ${open ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)'}`,
                transition: 'border-color 0.2s',
            }}>
                {/* Header row */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '16px 20px', cursor: 'pointer', userSelect: 'none',
                }} onClick={() => setOpen(o => !o)}>
                    <div style={{
                        width: 50, height: 50, borderRadius: 14, flexShrink: 0,
                        background: cfg.glow, border: `1.5px solid ${cfg.color}50`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20, boxShadow: `0 4px 14px ${cfg.color}20`,
                    }}>{cfg.emoji}</div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                                #{order.id?.slice(0, 8)}
                            </span>
                            <span style={{
                                fontSize: 10, fontWeight: 700, letterSpacing: '0.5px',
                                padding: '2px 10px', borderRadius: 20,
                                color: cfg.color, background: cfg.glow,
                                border: `1px solid ${cfg.color}40`,
                            }}>{cfg.label}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                                🕐 {formatDate(order.created_at)}
                            </span>
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                                📦 {t('orders.meta.items_count', { count: products.length })}
                            </span>
                        </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>
                            ${Number(total).toLocaleString()}
                            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginLeft: 3 }}>
                                {t('orders.meta.currency')}
                            </span>
                        </div>
                        <div style={{
                            fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 4,
                            display: 'inline-block',
                            transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s',
                        }}>▼</div>
                    </div>
                </div>

                {/* Expanded body */}
                {open && (
                    <div style={{ padding: '4px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ padding: '16px 0 20px' }}>
                            <Stepper status={order.status} />
                        </div>

                        {/* Products list */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {products.map((item, i) => {
                                const name  = getLocalized(item, 'name') || item.name_ru || item.name_en || item.name_uz || '—'
                                const qty   = item.quantity || 1
                                const price =
                                    (item.price || 0) +
                                    (item.selectedRam?.price ?? 0) +
                                    (item.selectedSsd?.price ?? 0)
                                const ram = item.selectedRam
                                const ssd = item.selectedSsd
                                return (
                                    <div key={i} style={{
                                        display: 'flex', gap: 12, alignItems: 'center',
                                        background: 'rgba(0,0,0,0.18)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        borderRadius: 14, padding: '12px 14px',
                                    }}>
                                        <div style={{
                                            width: 56, height: 56, flexShrink: 0, borderRadius: 10,
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            {item.imgs?.[0]
                                                ? <img src={item.imgs[0]} alt={name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={e => e.target.style.opacity = '0.3'} />
                                                : <span style={{ fontSize: 24 }}>📦</span>
                                            }
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: '0 0 5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {name}
                                            </p>
                                            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                                                {item.category && (
                                                    <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 5, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>
                                                        {t(`userOrders.${item.category.toLowerCase()}`) || item.category}
                                                    </span>
                                                )}
                                                {ram?.size > 0 && (
                                                    <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 5, background: 'rgba(99,129,232,0.1)', border: '1px solid rgba(99,129,232,0.25)', color: '#6381e8' }}>
                                                        {t('basket.ram')} {ram.size}GB
                                                    </span>
                                                )}
                                                {ssd?.size > 0 && (
                                                    <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 5, background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.25)', color: '#2ecc71' }}>
                                                        {t('basket.ssd')} {ssd.size}{ssd.type}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                            {qty > 1 && (
                                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                                                    ${price.toLocaleString()} × {qty}
                                                </div>
                                            )}
                                            <div style={{ fontSize: 15, fontWeight: 700, color: '#FF6B3D' }}>
                                                ${(price * qty).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Total + cancel button */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
                            <div>
                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>
                                    {t('orders.total.label')}
                                </div>
                                <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>
                                    ${Number(total).toLocaleString()}
                                    <span style={{ fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.3)', marginLeft: 4 }}>
                                        {t('orders.meta.currency')}
                                    </span>
                                </div>
                            </div>
                            {canCancel && (
                                <button onClick={() => setShowConfirm(true)} style={{
                                    padding: '9px 16px', borderRadius: 10,
                                    border: '1px solid rgba(231,76,60,0.3)',
                                    background: 'rgba(231,76,60,0.08)', color: '#e74c3c',
                                    fontWeight: 600, fontSize: 12, cursor: 'pointer',
                                    transition: 'all 0.15s',
                                }}>
                                    ✕ {t('orders.actions.cancel')}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

/* ─── UserOrders (page) ────────────────────────────────────────────────────── */
function UserOrders() {
    const { t }    = useTranslation()
    const navigate = useNavigate()

    const { data: allOrders = [], isLoading } = useGetOrdersQuery()
    const [updateOrder] = useUpdateOrderMutation()

    const savedPhone = localStorage.getItem('user_phone') || localStorage.getItem('order_phone') || ''
    const savedName  = localStorage.getItem('user_name')  || localStorage.getItem('order_name')  || ''

    const normalize  = p => (p || '').replace(/\D/g, '')
    const normSaved  = normalize(savedPhone)

    const myOrders = normSaved
        ? [...allOrders]
            .filter(o => normalize(o.phone) === normSaved)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        : []

    const handleCancel = async (id) => {
        try {
            await updateOrder({ id, status: 'cancelled' }).unwrap()
        } catch (err) {
            console.error('Cancel error:', err)
        }
    }

    return (
        <>
            <style>{`
                .uorders-page {
                    min-height: 100vh;
                    background: #0a0a0c;
                    color: #f0f0f0;
                    padding: 120px 0 80px;
                }
                .uorders-wrap {
                    max-width: 700px;
                    margin: 0 auto;
                    padding: 0 20px;
                }
                .uorders-hero { margin-bottom: 28px; }
                .uorders-eyebrow {
                    font-size: 11px; letter-spacing: 3px; text-transform: uppercase;
                    color: rgba(255,255,255,0.25); display: block; margin-bottom: 8px;
                }
                .uorders-title {
                    font-size: clamp(22px, 4vw, 32px); font-weight: 800;
                    color: #fff; margin: 0 0 6px; letter-spacing: -0.5px;
                }
                .uorders-sub { font-size: 13px; color: rgba(255,255,255,0.3); margin: 0; }
                .uorders-user-chip {
                    display: inline-flex; align-items: center; gap: 10px;
                    padding: 10px 16px; border-radius: 12px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08); margin-bottom: 24px;
                }
                .uorders-list { display: flex; flex-direction: column; gap: 12px; }
                .uorders-empty { text-align: center; padding: 80px 24px; }
                .uorders-empty-icon { font-size: 52px; margin-bottom: 14px; }
                .uorders-empty-text { font-size: 15px; color: rgba(255,255,255,0.35); margin-bottom: 24px; }
                .uorders-empty-btn {
                    display: inline-block; padding: 12px 28px; border-radius: 14px;
                    background: linear-gradient(135deg, #e8532a, #c0392b);
                    color: #fff; font-weight: 700; font-size: 14px;
                    cursor: pointer; border: none; transition: opacity 0.2s;
                }
                .uorders-empty-btn:hover { opacity: 0.85; }
                @media (max-width: 480px) { .uorders-page { padding: 100px 0 60px; } }
            `}</style>

            <Header />
            <div className="uorders-page">
                <div className="uorders-wrap">

                    {/* Hero */}
                    <div className="uorders-hero">
                        <span className="uorders-eyebrow">{t('orders.page.cabinet')}</span>
                        <h1 className="uorders-title">{t('orders.page.title')}</h1>
                        <p className="uorders-sub">{t('orders.page.subtitle')}</p>
                    </div>

                    {/* User chip */}
                    {savedPhone && (
                        <div className="uorders-user-chip">
                            <span style={{ fontSize: 20 }}>👤</span>
                            <div>
                                {savedName && (
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{savedName}</div>
                                )}
                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{savedPhone}</div>
                            </div>
                            <span style={{
                                marginLeft: 8, fontSize: 11, padding: '3px 10px', borderRadius: 20,
                                background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.25)',
                                color: '#2ecc71', fontWeight: 600,
                            }}>
                                {t('orders.chip.orders_count', { count: myOrders.length })}
                            </span>
                        </div>
                    )}

                    {/* States */}
                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.25)', fontSize: 14 }}>
                            {t('orders.loading')}
                        </div>
                    ) : myOrders.length === 0 ? (
                        <div className="uorders-empty">
                            <div className="uorders-empty-icon">📭</div>
                            <div className="uorders-empty-text">{t('orders.empty.title')}</div>
                            <button className="uorders-empty-btn" onClick={() => navigate('/')}>
                                {t('orders.empty.cta')}
                            </button>
                        </div>
                    ) : (
                        <div className="uorders-list">
                            {myOrders.map(order => (
                                <OrderCard key={order.id} order={order} onCancel={handleCancel} />
                            ))}
                        </div>
                    )}

                </div>
            </div>
            <Footer />
        </>
    )
}

export default UserOrders