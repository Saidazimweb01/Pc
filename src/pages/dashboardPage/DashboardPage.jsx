import React, { useState } from 'react'
import './DashboardPage.css'
import { useGetProductsQuery, useUpdateProductMutation } from '../../app/services/pcApi'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

// ─── Icons ───────────────────────────────────────────────
function IconProducts() {
  return (
    <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}>
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  )
}
function IconAnalytics() {
  return (
    <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}>
      <polyline points="2,12 6,7 9,10 14,4" />
    </svg>
  )
}
function IconSettings() {
  return (
    <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="8" cy="8" r="2.5" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.42 1.42M11.53 11.53l1.42 1.42M3.05 12.95l1.42-1.42M11.53 4.47l1.42-1.42" />
    </svg>
  )
}
function IconLogout() {
  return (
    <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}>
      <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6" />
    </svg>
  )
}
function IconOrders() {
  return (
    <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}>
      <rect x="2" y="1" width="12" height="14" rx="1.5"/>
      <line x1="5" y1="5" x2="11" y2="5"/>
      <line x1="5" y1="8" x2="11" y2="8"/>
      <line x1="5" y1="11" x2="8" y2="11"/>
    </svg>
  )
}
function IconEdit() {
  return (
    <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}>
      <path d="M11 2.5l2.5 2.5L5 13.5H2.5V11L11 2.5z" />
    </svg>
  )
}
function IconDelete() {
  return (
    <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}>
      <polyline points="3,5 13,5" />
      <path d="M5 5V3.5a.5.5 0 01.5-.5h5a.5.5 0 01.5.5V5M6 8v4M10 8v4M4 5l1 8.5a.5.5 0 00.5.5h5a.5.5 0 00.5-.5L12 5" />
    </svg>
  )
}
function IconClose() {
  return (
    <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}>
      <line x1="4" y1="4" x2="12" y2="12" />
      <line x1="12" y1="4" x2="4" y2="12" />
    </svg>
  )
}
function IconImage() {
  return (
    <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}>
      <rect x="1" y="1" width="14" height="14" rx="2"/>
      <circle cx="5.5" cy="5.5" r="1.5"/>
      <polyline points="1,11 5,7 8,10 11,7 15,11"/>
    </svg>
  )
}
function IconnImage() {
  return (
    <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}>
      <rect x="1" y="1" width="14" height="14" rx="2"/>
      <circle cx="5.5" cy="5.5" r="1.5"/>
      <polyline points="1,11 5,7 8,10 11,7 15,11"/>
    </svg>
  )
}
function IconPlus() {
  return (
    <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2.2}>
      <line x1="8" y1="3" x2="8" y2="13" />
      <line x1="3" y1="8" x2="13" y2="8" />
    </svg>
  )
}

// ─── Product Modal ────────────────────────────────────────
function ProductModal({ product, onClose, t, getCategoryLabel }) {
  const opt = product.options?.[0] || {}

  const specs = [
    { key: t('details.specs_cpu'),     val: opt.cpu },
    { key: t('details.specs_gpu'),     val: opt.gpu },
    { key: t('details.specs_board'),   val: opt.board },
    { key: t('details.specs_power'),   val: opt.power },
    { key: t('details.specs_cooling'), val: opt.cooler },
    { key: t('details.specs_case'),    val: opt.corpus },
    { key: t('details.specs_display'), val: opt.display },
    { key: t('details.specs_hz'),      val: opt.hz > 0 ? `${opt.hz} Hz` : null },
    { key: t('details.specs_dpi'),     val: opt.dpi > 0 ? opt.dpi : null },
  ].filter(s => s.val && String(s.val).trim() !== '')

  const ramBase     = opt.ram?.find(r => r.price === 0 && r.size > 0)
  const ramVariants = opt.ram?.filter(r => r.size > 0 && r.price > 0) || []
  const showRam     = ramBase || ramVariants.length > 0

  const ssdBase     = opt.ssd?.find(s => s.price === 0 && s.size > 0)
  const ssdVariants = opt.ssd?.filter(s => s.size > 0 && s.price > 0) || []
  const showSsd     = ssdBase || ssdVariants.length > 0

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>
          <IconClose />
        </button>

        {product.imgs?.length > 0 && (
          <div className="modal-imgs">
            {product.imgs.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="modal-img"
                onError={e => (e.target.style.display = 'none')}
              />
            ))}
          </div>
        )}

        <div className="modal-body">
          <div className="modal-meta">
            <span className="meta-chip">{t('admin.table.id')}: #{product.id}</span>
            <span className="meta-chip">{getCategoryLabel(product.category)}</span>
            <span className={`status-badge status-${product.status}`}>
              <span className="status-dot" />
              {product.status === 'yes' ? t('admin.status.active') : t('admin.status.inactive')}
            </span>
            <span className="meta-chip">
              {new Date(product.created_at).toLocaleDateString('ru-RU')}
            </span>
          </div>

          <div className="modal-name">{product.name}</div>
          <div className="modal-price">${product.price?.toLocaleString()}</div>
          <div className="modal-desc">{product.desc}</div>

          {specs.length > 0 && (
            <div className="section-gap">
              <div className="modal-section-title">{t('admin.modal.specs')}</div>
              <div className="specs-grid">
                {specs.map((s, i) => (
                  <div key={i} className="spec-row">
                    <span className="spec-key">{s.key}</span>
                    <span className="spec-val">{s.val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showRam && (
            <div className="section-gap">
              <div className="modal-section-title">{t('admin.modal.ram')}</div>
              <div className="variants-row">
                {ramBase && (
                  <span className="variant-chip">{ramBase.size} GB ({t('admin.modal.base')})</span>
                )}
                {ramVariants.map((r, i) => (
                  <span key={i} className="variant-chip">{r.size} GB +${r.price}</span>
                ))}
              </div>
            </div>
          )}

          {showSsd && (
            <div className="section-gap">
              <div className="modal-section-title">{t('admin.modal.ssd')}</div>
              <div className="variants-row">
                {ssdBase && (
                  <span className="variant-chip">{ssdBase.size} {ssdBase.type} ({t('admin.modal.base')})</span>
                )}
                {ssdVariants.map((s, i) => (
                  <span key={i} className="variant-chip">{s.size} {s.type} +${s.price}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    
  )
}

// ─── Main Page ────────────────────────────────────────────
function DashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)
  const [updateProduct] = useUpdateProductMutation()

  const handleToggleStatus = async (e, p) => {
    e.stopPropagation()
    const newStatus = p.status === 'yes' ? 'no' : 'yes'
    try {
      await updateProduct({ id: p.id, status: newStatus }).unwrap()
    } catch (err) {
      console.error('Status update error:', err)
    }
  }

  const { data: getProducts, isLoading, isError } = useGetProductsQuery()

  const CATEGORY_LABELS = {
    PC:          t('admin.categories.pc'),
    pc:          t('admin.categories.pc'),
    mono:        t('admin.categories.mono'),
    Mono:        t('admin.categories.mono'),
    corpus:      t('admin.categories.corpus'),
    Corpus:      t('admin.categories.corpus'),
    accessories: t('admin.categories.accessories'),
    Accessories: t('admin.categories.accessories'),
  }
  const getCategoryLabel = (cat) => CATEGORY_LABELS[cat] || cat

  const products     = getProducts || []
  const activeCount  = products.filter(p => p.status === 'yes').length
  const totalRevenue = products
    .filter(p => p.status === 'yes')
    .reduce((sum, p) => sum + (p.price || 0), 0)

  return (
    <>
      <style>{`
        /* ── RESPONSIVE ADMIN ── */
        @media (max-width: 900px) {
          .admin-root { flex-direction: column; }
          .sidebar {
            width: 100%; min-height: auto; position: static;
            flex-direction: row; flex-wrap: wrap;
          }
          .sidebar-logo { padding: 12px 16px; border-bottom: none; border-right: 1px solid var(--border); }
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
          .topbar-right { gap: 8px; }
        }
        @media (max-width: 600px) {
          .sidebar { flex-direction: column; }
          .sidebar-logo, .sidebar-profile { border-right: none; border-bottom: 1px solid var(--border); }
          .sidebar-nav { flex-direction: row; border-bottom: 1px solid var(--border); }
          /* Jadvalda ba'zi ustunlarni yashirish */
          .col-hide { display: none !important; }
          .table-header { flex-direction: column; gap: 10px; align-items: flex-start; }
        }
        /* Active/deactivate button */
        .action-btn.activate {
          border-color: rgba(46,204,113,0.3);
          color: var(--green);
          background: rgba(46,204,113,0.08);
          font-size: 11px;
        }
        .action-btn.activate:hover { background: rgba(46,204,113,0.18); }
        .action-btn.deactivate {
          border-color: rgba(232,160,32,0.3);
          color: #e8a020;
          background: rgba(232,160,32,0.08);
          font-size: 11px;
        }
        .action-btn.deactivate:hover { background: rgba(232,160,32,0.18); }
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
          <button className="nav-item active">
            <IconProducts /> {t('admin.sidebar.products')}
          </button>
          <button className="nav-item" onClick={() => navigate('/adm/orders')}>
            <IconOrders /> {t('admin.sidebar.orders')}
          </button>
          <button className="nav-item">
            <IconAnalytics /> {t('admin.sidebar.analytics')}
          </button>
          <button className="nav-item" onClick={() => navigate('/adm/hero')}>
            <IconImage /> Rasmlar
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
          <span className="topbar-title">{t('admin.topbar.title')}</span>
          <div className="topbar-right">
            <div className="topbar-stat">
              {t('admin.topbar.active')}: <span>{activeCount}</span>
            </div>
            <div className="topbar-stat">
              {t('admin.topbar.revenue')}: <span>${totalRevenue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="content">
          <div className="table-wrap">
            <div className="table-header">
              <h2>{t('admin.table.title')}</h2>
              <button className="add-btn" onClick={() => navigate('/adm/create')}>
                <IconPlus /> {t('admin.table.add')}
              </button>
            </div>

            <table>
              <thead>
                <tr>
                  <th>{t('admin.table.id')}</th>
                  <th>{t('admin.table.photo')}</th>
                  <th>{t('admin.table.name')}</th>
                  <th>{t('admin.table.price')}</th>
                  <th>{t('admin.table.cpu')}</th>
                  <th>{t('admin.table.gpu')}</th>
                  <th>{t('admin.table.category')}</th>
                  <th>{t('admin.table.status')}</th>
                  <th>{t('admin.table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr className="state-row">
                    <td colSpan={9}>
                      <div className="spinner" />
                      {t('admin.table.loading')}
                    </td>
                  </tr>
                )}

                {isError && (
                  <tr className="state-row">
                    <td colSpan={9}>{t('admin.table.error')}</td>
                  </tr>
                )}

                {!isLoading && !isError && products.length === 0 && (
                  <tr className="state-row">
                    <td colSpan={9}>{t('admin.table.empty')}</td>
                  </tr>
                )}

                {products.map(p => {
                  const opt = p.options?.[0] || {}
                  return (
                    <tr key={p.id} onClick={() => setSelected(p)}>
                      <td>
                        <span className="td-id">#{p.id}</span>
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        <img
                          src={p.imgs?.[0]}
                          className="td-img"
                          alt=""
                          onError={e => (e.target.style.opacity = '0.2')}
                        />
                      </td>
                      <td>
                        <div className="td-name">{p.name}</div>
                      </td>
                      <td>
                        <span className="td-price">${p.price?.toLocaleString()}</span>
                      </td>
                      <td>
                        <span className="td-cpu">{opt.cpu || '—'}</span>
                      </td>
                      <td>
                        <span className="td-cpu">{opt.gpu || '—'}</span>
                      </td>
                      <td>
                        <span className="td-cat">{getCategoryLabel(p.category)}</span>
                      </td>
                      <td>
                        <span className={`status-badge status-${p.status}`}>
                          <span className="status-dot" />
                          {p.status === 'yes' ? t('admin.status.active') : t('admin.status.inactive')}
                        </span>
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        <div className="actions">
                          <button className="action-btn edit" title={t('admin.table.edit')}>
                            <IconEdit />
                          </button>
                          <button className="action-btn del" title={t('admin.table.delete')}>
                            <IconDelete />
                          </button>
                          <button
                            className={`action-btn ${p.status === 'yes' ? 'deactivate' : 'activate'}`}
                            title={p.status === 'yes' ? 'Deaktiv qilish' : 'Aktiv qilish'}
                            onClick={e => handleToggleStatus(e, p)}
                          >
                            {p.status === 'yes' ? '⏸' : '▶'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selected && (
        <ProductModal
          product={selected}
          onClose={() => setSelected(null)}
          t={t}
          getCategoryLabel={getCategoryLabel}
        />
      )}
    </div>
    </>
  )
}

export default DashboardPage