import React, { useState } from 'react'
import '../dashboardPage/DashboardPage.css'
import { useGetOrdersQuery, useUpdateOrderMutation, useDeleteOrderMutation } from '../../app/services/pcApi'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

// ─── Icons ───────────────────────────────────────────────
function IconProducts() {
    return <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}><rect x="1" y="1" width="6" height="6" rx="1" /><rect x="9" y="1" width="6" height="6" rx="1" /><rect x="1" y="9" width="6" height="6" rx="1" /><rect x="9" y="9" width="6" height="6" rx="1" /></svg>
}
function IconAnalytics() {
    return <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}><polyline points="2,12 6,7 9,10 14,4" /></svg>
}
function IconSettings() {
    return <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}><circle cx="8" cy="8" r="2.5" /><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.42 1.42M11.53 11.53l1.42 1.42M3.05 12.95l1.42-1.42M11.53 4.47l1.42-1.42" /></svg>
}
function IconLogout() {
    return <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}><path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6" /></svg>
}
function IconOrders() {
    return <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}><rect x="2" y="1" width="12" height="14" rx="1.5" /><line x1="5" y1="5" x2="11" y2="5" /><line x1="5" y1="8" x2="11" y2="8" /><line x1="5" y1="11" x2="8" y2="11" /></svg>
}
function IconClose() {
    return <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}><line x1="4" y1="4" x2="12" y2="12" /><line x1="12" y1="4" x2="4" y2="12" /></svg>
}
function IconUser() {
    return <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}><circle cx="8" cy="5.5" r="2.5" /><path d="M2.5 14c0-3.038 2.462-5 5.5-5s5.5 1.962 5.5 5" /></svg>
}
function IconPhone() {
    return <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}><path d="M3 2h3l1.5 3.5L6 7a9 9 0 004 4l1.5-1.5L15 11v3a1 1 0 01-1 1A13 13 0 012 3a1 1 0 011-1z" /></svg>
}
function IconCheck() {
    return <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2.2}><polyline points="3,8 6.5,12 13,4" /></svg>
}
function IconX() {
    return <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}><line x1="4" y1="4" x2="12" y2="12" /><line x1="12" y1="4" x2="4" y2="12" /></svg>
}

// ─── Status config ────────────────────────────────────────
const STATUS_CONFIG = {
    pending: { label: 'Kutilmoqda', color: '#e8a020', bg: 'rgba(232,160,32,0.12)', border: 'rgba(232,160,32,0.3)' },
    confirmed: { label: 'Tasdiqlangan', color: '#2ecc71', bg: 'rgba(46,204,113,0.12)', border: 'rgba(46,204,113,0.3)' },
    shipping: { label: 'Yetkazilmoqda', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)' },
    delivered: { label: 'Yetkazildi', color: '#2ecc71', bg: 'rgba(46,204,113,0.12)', border: 'rgba(46,204,113,0.3)' },
    cancelled: { label: 'Bekor qilindi', color: '#e74c3c', bg: 'rgba(231,76,60,0.12)', border: 'rgba(231,76,60,0.3)' },
}

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 600, letterSpacing: '0.5px',
            padding: '3px 10px', borderRadius: 20,
            color: cfg.color, background: cfg.bg,
            border: `1px solid ${cfg.border}`,
            whiteSpace: 'nowrap',
        }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
            {cfg.label}
        </span>
    )
}

// ─── Format date ──────────────────────────────────────────
function formatDate(str) {
    if (!str) return '—'

    const d = new Date(str)

    const date = d.toLocaleDateString('uz-UZ', {
        timeZone: 'Asia/Tashkent'
    })

    const time = d.toLocaleTimeString('uz-UZ', {
        timeZone: 'Asia/Tashkent',
        hour: '2-digit',
        minute: '2-digit'
    })

    return `${date} ${time}`
}
// ─── Order Detail Modal ───────────────────────────────────
function OrderModal({ order, onClose, onStatusChange, currentStatus }) {
    if (!order) return null
    const products = Array.isArray(order.products) ? order.products : []
    const total = order.total_price || 0
    const [updating, setUpdating] = useState(false)
    // currentStatus — parent dan keladi, o'zgarsa darhol yangilanadi
    const status = currentStatus ?? order.status ?? 'pending'

    const handleStatus = async (newStatus) => {
        setUpdating(true)
        await onStatusChange(order.id, newStatus)
        setUpdating(false)
        // onClose() EMAS — modal ochiq qolsin, status o'zgarganini ko'rsin
        // onStatusChange ichida setSelected yangilanadi
    }

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal order-modal">
                <button className="modal-close" onClick={onClose}><IconClose /></button>

                <div className="modal-body">
                    {/* Header */}
                    <div className="order-modal__header">
                        <div>
                            <div className="order-modal__id">#{order.id?.slice(0, 8)}</div>
                            <div className="order-modal__date">{formatDate(order.created_at)}</div>
                        </div>
                        <StatusBadge status={status} />
                    </div>

                    {/* Mijoz */}
                    <div className="order-modal__section">
                        <div className="modal-section-title">Mijoz</div>
                        <div className="order-modal__info-grid">
                            {order.name && (
                                <div className="order-info-row">
                                    <span className="order-info-icon"><IconUser /></span>
                                    <span className="order-info-val">{order.name}</span>
                                </div>
                            )}
                            {order.phone && (
                                <div className="order-info-row">
                                    <span className="order-info-icon"><IconPhone /></span>
                                    <span className="order-info-val">{order.phone}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mahsulotlar */}
                    <div className="order-modal__section">
                        <div className="modal-section-title">
                            Mahsulotlar
                            <span style={{ marginLeft: 8, fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: 'var(--muted)', background: 'var(--head-btn-color)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 7px' }}>
                                {products.length} ta
                            </span>
                        </div>
                        {products.length === 0
                            ? <div style={{ color: 'var(--muted)', fontSize: 13, padding: '10px 0' }}>Mahsulotlar topilmadi</div>
                            : (
                                <div className="order-items-list">
                                    {products.map((item, i) => {
                                        const lang = localStorage.getItem('i18nextLng')?.slice(0, 2) || 'ru'
                                        const name = item[`name_${lang}`] || item.name_ru || item.name_en || item.name_uz || item.name || '—'
                                        const qty = item.quantity || 1
                                        const price = item.price || 0
                                        const ram = item.selectedRam
                                        const ssd = item.selectedSsd
                                        return (
                                            <div key={i} className="order-item-row">
                                                <div className="order-item-img-wrap">
                                                    {item.imgs?.[0]
                                                        ? <img src={item.imgs[0]} alt={name} className="order-item-img" onError={e => e.target.style.opacity = '0.2'} />
                                                        : <div className="order-item-placeholder">📦</div>
                                                    }
                                                </div>
                                                <div className="order-item-info">
                                                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>ID #{item.id}</div>
                                                    <div className="order-item-name">{name}</div>
                                                    <div className="order-item-specs">
                                                        {item.category && <span className="order-item-badge">{item.category}</span>}
                                                        {ram?.size > 0 && <span className="order-item-badge" style={{ color: '#6381e8', borderColor: 'rgba(99,129,232,0.3)' }}>RAM {ram.size} GB</span>}
                                                        {ssd?.size > 0 && <span className="order-item-badge" style={{ color: '#2ecc71', borderColor: 'rgba(46,204,113,0.3)' }}>SSD {ssd.size} {ssd.type}</span>}
                                                    </div>
                                                </div>
                                                <div className="order-item-right">
                                                    <div className="order-item-qty">
                                                        <span className="order-item-unit-price">${price.toLocaleString()}</span>
                                                        <span className="order-item-x">× {qty}</span>
                                                    </div>
                                                    <div className="order-item-price">${(price * qty).toLocaleString()}</div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )
                        }
                    </div>

                    {/* Total */}
                    <div className="order-modal__total">
                        <div>
                            <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2, fontFamily: "'JetBrains Mono',monospace", letterSpacing: '1px', textTransform: 'uppercase' }}>Jami</div>
                            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{products.length} ta mahsulot</div>
                        </div>
                        <span className="order-modal__total-val">${Number(total).toLocaleString()} <em style={{ fontSize: 13, fontWeight: 400 }}>USD</em></span>
                    </div>

                    {/* Status almashtirish */}
                    <div className="order-status-actions">
                        <div className="order-status-label">Statusni o'zgartirish:</div>
                        <div className="order-status-btns">
                            {status !== 'confirmed' && (
                                <button className="order-status-btn confirm" onClick={() => handleStatus('confirmed')} disabled={updating}>
                                    <IconCheck /> Tasdiqlash
                                </button>
                            )}
                            {status !== 'shipping' && (
                                <button className="order-status-btn shipping" onClick={() => handleStatus('shipping')} disabled={updating}>
                                    🚚 Yetkazilmoqda
                                </button>
                            )}
                            {status !== 'delivered' && (
                                <button className="order-status-btn delivered" onClick={() => handleStatus('delivered')} disabled={updating}>
                                    <IconCheck /> Yetkazildi
                                </button>
                            )}
                            {status !== 'cancelled' && (
                                <button className="order-status-btn cancel" onClick={() => handleStatus('cancelled')} disabled={updating}>
                                    <IconX /> Bekor qilish
                                </button>
                            )}
                            {status !== 'pending' && (
                                <button className="order-status-btn pending" onClick={() => handleStatus('pending')} disabled={updating}>
                                    Kutilmoqdaga qaytarish
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Orders Page ──────────────────────────────────────────
function Orders() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { data: rawOrders = [], isLoading, isError } = useGetOrdersQuery()
    const [updateOrder] = useUpdateOrderMutation()
    const [deleteOrder] = useDeleteOrderMutation()
    const [selected, setSelected] = useState(null)
    const [filterStatus, setFilterStatus] = useState('all')
    const [search, setSearch] = useState('')

    // Yangi zakazlar tepada — created_at bo'yicha descending sort
    const orders = [...rawOrders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    const filtered = orders.filter(o => {
        const matchStatus = filterStatus === 'all' || o.status === filterStatus
        const q = search.toLowerCase()
        const matchSearch = !q
            || String(o.id).toLowerCase().includes(q)
            || (o.name || '').toLowerCase().includes(q)
            || (o.phone || '').includes(q)
        return matchStatus && matchSearch
    })

    const totalRevenue = orders.reduce((s, o) => s + (Number(o.total_price) || 0), 0)
    const pendingCount = orders.filter(o => o.status === 'pending').length
    const todayCount = orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).length

    const handleDelete = async (e, id) => {
        e.stopPropagation()
        if (!window.confirm('Buyurtmani o\'chirishni tasdiqlaysizmi?')) return
        try {
            await deleteOrder(id).unwrap()
        } catch (err) {
            console.error('Delete error:', err)
        }
    }

    const handleStatusChange = async (id, status) => {
        // unwrap ishlatmaymiz — Supabase 204 qaytarsa xato tashlaydi
        updateOrder({ id, status }).then(() => {
            // RTK Query cache yangilanadi, rawOrders o'zgaradi
            // selected ni ham darhol yangilaymiz
            if (selected?.id === id) {
                setSelected(prev => prev ? { ...prev, status } : prev)
            }
        })
    }

    return (
        <>
            <style>{`
                /* ── RESPONSIVE ADMIN ── */
                @media (max-width: 768px) {
                    .admin-root { flex-direction: column; }
                    .sidebar {
                        width: 100%; min-height: auto;
                        flex-direction: row; flex-wrap: wrap;
                        position: static;
                        padding: 0;
                    }
                    .sidebar-logo { padding: 12px 16px 10px; border-bottom: none; border-right: 1px solid var(--border); }
                    .sidebar-profile { padding: 10px 14px; border-bottom: none; border-right: 1px solid var(--border); }
                    .sidebar-nav {
                        flex: 1; flex-direction: row; padding: 8px 10px;
                        gap: 2px; overflow-x: auto; align-items: center;
                        border-bottom: 1px solid var(--border);
                    }
                    .sidebar-nav::-webkit-scrollbar { display: none; }
                    .nav-item { padding: 8px 10px; font-size: 12px; white-space: nowrap; flex-shrink: 0; }
                    .sidebar-logout { padding: 8px 10px; border-top: none; }
                    .logout-btn { padding: 8px 10px; font-size: 12px; }
                    .content { padding: 16px; }
                    .topbar { padding: 0 16px; }
                    .orders-stats { gap: 8px; }
                    .orders-stat-card { min-width: 100px; padding: 10px 14px; }
                    .orders-stat-val { font-size: 18px; }
                    table { font-size: 12px; }
                    thead th, td { padding: 10px 12px; }
                    .orders-toolbar { flex-direction: column; align-items: flex-start; gap: 8px; }
                    .orders-search { width: 100%; }
                    .status-filters { gap: 4px; }
                    .status-filter-btn { padding: 4px 8px; font-size: 11px; }
                }
                @media (max-width: 480px) {
                    .sidebar { flex-direction: column; }
                    .sidebar-logo, .sidebar-profile { border-right: none; border-bottom: 1px solid var(--border); }
                    .sidebar-nav { flex-direction: row; }
                    .orders-stat-card { flex: 1 1 calc(50% - 4px); }
                    /* Jadvalda ba'zi ustunlarni yashirish */
                    .hide-mobile { display: none !important; }
                }

                /* ── ORDERS SPECIFIC ── */
                .orders-search {
                    background: var(--head-btn-color);
                    border: 1px solid var(--border);
                    border-radius: 7px;
                    padding: 7px 12px;
                    color: var(--text);
                    font-family: 'Manrope', sans-serif;
                    font-size: 13px;
                    outline: none;
                    width: 220px;
                    transition: border-color 0.15s;
                }
                .orders-search:focus { border-color: rgba(232,83,42,0.4); }
                .orders-search::placeholder { color: var(--muted); }

                .status-filters { display: flex; gap: 6px; flex-wrap: wrap; }
                .status-filter-btn {
                    padding: 5px 12px; border-radius: 20px;
                    border: 1px solid var(--border); background: transparent;
                    color: var(--muted); font-family: 'Manrope', sans-serif;
                    font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s;
                }
                .status-filter-btn:hover { color: var(--text); border-color: rgba(255,255,255,0.15); }
                .status-filter-btn.active { background: rgba(232,83,42,0.12); border-color: rgba(232,83,42,0.35); color: var(--accent); }

                /* Stats */
                .orders-stats { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
                .orders-stat-card {
                    background: var(--surface); border: 1px solid var(--border);
                    border-radius: 10px; padding: 14px 20px;
                    display: flex; flex-direction: column; gap: 4px; min-width: 140px;
                }
                .orders-stat-label { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); font-family: 'JetBrains Mono', monospace; }
                .orders-stat-val { font-size: 22px; font-weight: 800; color: var(--accent2); font-family: 'JetBrains Mono', monospace; }

                /* Toolbar */
                .orders-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }

                /* Table */
                tbody tr { cursor: pointer; }
                .td-customer { display: flex; flex-direction: column; gap: 2px; }
                .td-customer-name { font-size: 13px; font-weight: 600; color: var(--text); }
                .td-customer-phone { font-size: 11px; color: var(--muted); font-family: 'JetBrains Mono', monospace; }
                .td-total { font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 700; color: var(--accent2); }
                .td-items-count { font-size: 12px; color: var(--muted); font-family: 'JetBrains Mono', monospace; background: var(--head-btn-color); border: 1px solid var(--border); border-radius: 5px; padding: 2px 8px; }
                .td-date { font-size: 12px; color: var(--muted); font-family: 'JetBrains Mono', monospace; white-space: nowrap; }

                /* NEW badge */
                .td-new-badge {
                    display: inline-block; font-size: 9px; font-family: 'JetBrains Mono', monospace;
                    letter-spacing: 1px; background: rgba(99,129,232,0.15);
                    border: 1px solid rgba(99,129,232,0.3); color: #6381e8;
                    border-radius: 4px; padding: 1px 5px; margin-left: 5px;
                    vertical-align: middle;
                }

                /* Order modal */
                .order-modal { max-width: 600px; }
                .order-modal__header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
                .order-modal__id { font-family: 'JetBrains Mono', monospace; font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
                .order-modal__date { font-size: 12px; color: var(--muted); font-family: 'JetBrains Mono', monospace; }
                .order-modal__section { margin-bottom: 18px; }
                .order-modal__info-grid { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
                .order-info-row { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--text); }
                .order-info-icon { width: 28px; height: 28px; border-radius: 7px; background: rgba(232,83,42,0.1); border: 1px solid rgba(232,83,42,0.2); display: flex; align-items: center; justify-content: center; color: var(--accent); flex-shrink: 0; }
                .order-info-icon svg { width: 13px; height: 13px; }

                .order-items-list { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
                .order-item-row { display: flex; align-items: center; gap: 12px; background: var(--head-btn-color); border: 1px solid var(--border); border-radius: 9px; padding: 10px 14px; }
                .order-item-img-wrap { width: 52px; height: 52px; flex-shrink: 0; border-radius: 8px; overflow: hidden; background: var(--surface2); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; }
                .order-item-img { width: 100%; height: 100%; object-fit: contain; }
                .order-item-placeholder { font-size: 22px; }
                .order-item-info { flex: 1; min-width: 0; }
                .order-item-name { font-size: 13px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .order-item-specs { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 4px; }
                .order-item-badge { font-size: 10px; font-family: 'JetBrains Mono', monospace; color: var(--muted); background: var(--head-btn-color); border: 1px solid var(--border); border-radius: 4px; padding: 1px 6px; }
                .order-item-right { text-align: right; flex-shrink: 0; }
                .order-item-qty { display: flex; flex-direction: column; align-items: flex-end; gap: 1px; }
                .order-item-unit-price { font-size: 11px; color: var(--muted); font-family: 'JetBrains Mono', monospace; }
                .order-item-x { font-size: 11px; color: var(--muted); font-family: 'JetBrains Mono', monospace; }
                .order-item-price { font-size: 14px; font-weight: 700; color: var(--accent2); font-family: 'JetBrains Mono', monospace; }

                .order-modal__total { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; background: rgba(232,83,42,0.07); border: 1px solid rgba(232,83,42,0.2); border-radius: 10px; font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 16px; }
                .order-modal__total-val { font-family: 'JetBrains Mono', monospace; font-size: 20px; font-weight: 700; color: var(--accent2); }

                /* Status actions */
                .order-status-actions { border-top: 1px solid var(--border); padding-top: 14px; }
                .order-status-label { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); font-family: 'JetBrains Mono', monospace; margin-bottom: 10px; }
                .order-status-btns { display: flex; gap: 8px; flex-wrap: wrap; }
                .order-status-btn {
                    display: flex; align-items: center; gap: 6px;
                    padding: 8px 14px; border-radius: 8px; border: 1px solid;
                    font-family: 'Manrope', sans-serif; font-size: 12px; font-weight: 600;
                    cursor: pointer; transition: all 0.15s;
                }
                .order-status-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .order-status-btn svg { width: 12px; height: 12px; }
                .order-status-btn.confirm { color: #2ecc71; background: rgba(46,204,113,0.1); border-color: rgba(46,204,113,0.3); }
                .order-status-btn.confirm:hover { background: rgba(46,204,113,0.2); }
                .order-status-btn.delivered { color: #6381e8; background: rgba(99,129,232,0.1); border-color: rgba(99,129,232,0.3); }
                .order-status-btn.delivered:hover { background: rgba(99,129,232,0.2); }
                .order-status-btn.cancel { color: var(--red); background: rgba(231,76,60,0.1); border-color: rgba(231,76,60,0.3); }
                .order-status-btn.cancel:hover { background: rgba(231,76,60,0.2); }
                .order-status-btn.shipping { color: #a78bfa; background: rgba(167,139,250,0.1); border-color: rgba(167,139,250,0.3); }
                .order-status-btn.shipping:hover { background: rgba(167,139,250,0.2); }
                .order-status-btn.pending { color: var(--muted); background: var(--head-btn-color); border-color: var(--border); }
                .order-status-btn.shipping { color: #a78bfa; background: rgba(167,139,250,0.1); border-color: rgba(167,139,250,0.3); }
                .order-status-btn.shipping:hover { background: rgba(167,139,250,0.2); }
                .order-status-btn.pending:hover { color: var(--text); border-color: rgba(255,255,255,0.2); }
            `}</style>

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
                        <button className="nav-item active">
                            <IconOrders /> {t('admin.sidebar.orders')}
                        </button>
                        <button className="nav-item">
                            <IconAnalytics /> {t('admin.sidebar.analytics')}
                        </button>
                        <button className="nav-item" onClick={() => navigate('/adm/settings')}>
                            <IconSettings /> {t('admin.sidebar.settings')}
                        </button>
                    </nav>
                    <div className="sidebar-logout">
                        <button className="logout-btn">
                            <IconLogout /> {t('admin.sidebar.logout')}
                        </button>
                    </div>
                </aside>

                {/* ── Main ── */}
                <div className="main">
                    <div className="topbar">
                        <span className="topbar-title">Buyurtmalar</span>
                        <div className="topbar-right">
                            <div className="topbar-stat">Jami: <span>{orders.length}</span></div>
                            <div className="topbar-stat">Kutilmoqda: <span>{pendingCount}</span></div>
                        </div>
                    </div>

                    <div className="content">
                        {/* Stats */}
                        <div className="orders-stats">
                            <div className="orders-stat-card">
                                <span className="orders-stat-label">Jami</span>
                                <span className="orders-stat-val">{orders.length}</span>
                            </div>
                            <div className="orders-stat-card">
                                <span className="orders-stat-label">Kutilmoqda</span>
                                <span className="orders-stat-val" style={{ color: '#e8a020' }}>{pendingCount}</span>
                            </div>
                            <div className="orders-stat-card">
                                <span className="orders-stat-label">Daromad</span>
                                <span className="orders-stat-val">${totalRevenue.toLocaleString()}</span>
                            </div>
                            <div className="orders-stat-card">
                                <span className="orders-stat-label">Bugun</span>
                                <span className="orders-stat-val">{todayCount}</span>
                            </div>
                        </div>

                        <div className="table-wrap">
                            <div className="table-header">
                                <div className="orders-toolbar">
                                    <h2>Barcha buyurtmalar</h2>
                                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                                        <input
                                            className="orders-search"
                                            placeholder="ID, ism yoki telefon..."
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                        />
                                        <div className="status-filters">
                                            {['all', 'pending', 'confirmed', 'shipping', 'delivered', 'cancelled'].map(s => (
                                                <button
                                                    key={s}
                                                    className={`status-filter-btn ${filterStatus === s ? 'active' : ''}`}
                                                    onClick={() => setFilterStatus(s)}
                                                >
                                                    {s === 'all' ? 'Barchasi' : STATUS_CONFIG[s]?.label || s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Mijoz</th>
                                        <th>Mahsulotlar</th>
                                        <th>Jami</th>
                                        <th>Status</th>
                                        <th className="hide-mobile">Sana</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading && (
                                        <tr className="state-row"><td colSpan={6}><div className="spinner" /> Yuklanmoqda...</td></tr>
                                    )}
                                    {isError && (
                                        <tr className="state-row"><td colSpan={6}>Xatolik yuz berdi</td></tr>
                                    )}
                                    {!isLoading && !isError && filtered.length === 0 && (
                                        <tr className="state-row"><td colSpan={6}>Buyurtmalar topilmadi</td></tr>
                                    )}
                                    {filtered.map(o => {
                                        const prods = Array.isArray(o.products) ? o.products : []
                                        const total = o.total_price || 0
                                        const isNew = o.status === 'pending'
                                        return (
                                            <tr key={o.id} onClick={() => setSelected(o)} style={isNew ? { background: 'rgba(232,160,32,0.04)' } : {}}>
                                                <td>
                                                    <span className="td-id">#{o.id?.slice(0, 8)}</span>
                                                    {isNew && <span className="td-new-badge">NEW</span>}
                                                </td>
                                                <td>
                                                    <div className="td-customer">
                                                        <span className="td-customer-name">{o.name || '—'}</span>
                                                        {o.phone && <span className="td-customer-phone">{o.phone}</span>}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <div style={{ display: 'flex', gap: 4 }}>
                                                            {prods.slice(0, 3).map((p, i) => (
                                                                p.imgs?.[0]
                                                                    ? <img key={i} src={p.imgs[0]} alt="" style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 6, background: 'var(--head-btn-color)', border: '1px solid var(--border)' }} onError={e => e.target.style.display = 'none'} />
                                                                    : <div key={i} style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--head-btn-color)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📦</div>
                                                            ))}
                                                            {prods.length > 3 && (
                                                                <div style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--head-btn-color)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--muted)', fontFamily: "'JetBrains Mono',monospace" }}>
                                                                    +{prods.length - 3}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="td-items-count">{prods.length} ta</span>
                                                    </div>
                                                </td>
                                                <td><span className="td-total">${Number(total).toLocaleString()}</span></td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <StatusBadge status={o.status || 'pending'} />
                                                        {o.status === 'cancelled' && (
                                                            <button
                                                                onClick={e => handleDelete(e, o.id)}
                                                                title="O'chirish"
                                                                style={{
                                                                    width: 28, height: 28, borderRadius: 6,
                                                                    border: '1px solid rgba(231,76,60,0.3)',
                                                                    background: 'rgba(231,76,60,0.1)',
                                                                    color: '#e74c3c', cursor: 'pointer',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    fontSize: 12, transition: 'all 0.15s', flexShrink: 0,
                                                                }}
                                                                onMouseOver={e => e.currentTarget.style.background = 'rgba(231,76,60,0.22)'}
                                                                onMouseOut={e => e.currentTarget.style.background = 'rgba(231,76,60,0.1)'}
                                                            >🗑</button>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="hide-mobile">
                                                    <span className="td-date">{formatDate(o.created_at)}</span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {selected && (
                <OrderModal
                    order={selected}
                    onClose={() => setSelected(null)}
                    onStatusChange={handleStatusChange}
                    currentStatus={selected.status}
                />
            )}
        </>
    )
}

export default Orders