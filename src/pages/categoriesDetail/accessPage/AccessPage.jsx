import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useGetProductsQuery } from '../../../app/services/pcApi'
import Header from '../../homePage/header/Header'
import Footer from '../../homePage/footer/Footer'

// ─── Sub-kategoriyalar ────────────────────────────────────
const SUBCATEGORIES = [
    { key: 'GPU',      label: 'Videokarta',  icon: '🖥️',  color: '#6381e8', glow: 'rgba(99,129,232,0.12)'   },
    { key: 'CPU',      label: 'Prosessor',   icon: '⚡',  color: '#e8a020', glow: 'rgba(232,160,32,0.12)'   },
    { key: 'Board',    label: 'Ona plata',   icon: '🔌',  color: '#2ecc71', glow: 'rgba(46,204,113,0.12)'   },
    { key: 'Cooler',   label: 'Sovutgich',   icon: '❄️',  color: '#2AABEE', glow: 'rgba(42,171,238,0.12)'   },
    { key: 'Keyboard', label: 'Klaviatura',  icon: '⌨️',  color: '#a78bfa', glow: 'rgba(167,139,250,0.12)'  },
    { key: 'Monitor',  label: 'Monitor',     icon: '🖵',  color: '#FF6B3D', glow: 'rgba(255,107,61,0.12)'   },
    { key: 'Mouse',    label: 'Sichqoncha',  icon: '🖱️',  color: '#e8532a', glow: 'rgba(232,83,42,0.12)'    },
    { key: 'Chair',    label: 'Kreslo',      icon: '🪑',  color: '#e74c3c', glow: 'rgba(231,76,60,0.12)'    },
    { key: 'Headset',  label: 'Naushnik',    icon: '🎧',  color: '#2ecc71', glow: 'rgba(46,204,113,0.12)'   },
    { key: 'RAM',      label: 'RAM',         icon: '💾',  color: '#6381e8', glow: 'rgba(99,129,232,0.12)'   },
]

function AccessoriesPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { data: allProducts = [], isLoading } = useGetProductsQuery()

    // Har sub-kategoriya uchun product sonini hisoblash
    const countByKey = {}
    allProducts.forEach(p => {
        if (p.category) {
            const k = p.category.toLowerCase()
            countByKey[k] = (countByKey[k] || 0) + 1
        }
    })

    const getCount = (key) => countByKey[key.toLowerCase()] ?? 0

    return (
        <>
            <style>{`
                .acc-page {
                    min-height: 100vh;
                    margin-top:50px;
                    background: var(--bg, #131315);
                    padding-bottom: 80px;
                }
                .acc-hero {
                    padding: 40px 0 32px;
                }
                .acc-breadcrumb {
                    display: flex; align-items: center; gap: 6px;
                    font-size: 12px; color: rgba(255,255,255,0.35);
                    margin-bottom: 20px;
                }
                .acc-breadcrumb a {
                    color: rgba(255,255,255,0.35);
                    text-decoration: none;
                    transition: color 0.15s;
                }
                .acc-breadcrumb a:hover { color: #fff; }
                .acc-eyebrow {
                    font-size: 11px; letter-spacing: 3px;
                    text-transform: uppercase;
                    color: rgba(255,255,255,0.25);
                    display: block; margin-bottom: 8px;
                }
                .acc-title {
                    font-size: clamp(24px, 4vw, 36px);
                    font-weight: 800; color: #fff;
                    margin: 0 0 8px; letter-spacing: -0.5px;
                }
                .acc-sub {
                    font-size: 14px; color: rgba(255,255,255,0.35); margin: 0;
                }

                /* Grid */
                .acc-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                    gap: 14px;
                    margin-top: 32px;
                }

                /* Card */
                .acc-card {
                    background: rgba(255,255,255,0.025);
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 18px;
                    padding: 24px 20px 20px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex; flex-direction: column; gap: 14px;
                    position: relative; overflow: hidden;
                    text-align: left;
                }
                .acc-card:hover {
                    border-color: rgba(255,255,255,0.14);
                    background: rgba(255,255,255,0.04);
                    transform: translateY(-3px);
                }
                .acc-card::before {
                    content: '';
                    position: absolute; inset: 0;
                    background: var(--glow);
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                .acc-card:hover::before { opacity: 1; }

                .acc-card-icon {
                    width: 52px; height: 52px; border-radius: 14px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 24px; flex-shrink: 0;
                    border: 1.5px solid;
                }
                .acc-card-info {}
                .acc-card-label {
                    font-size: 14px; font-weight: 700; color: #fff;
                    margin-bottom: 4px; display: block;
                }
                .acc-card-count {
                    font-size: 12px; font-family: 'JetBrains Mono', monospace;
                    color: rgba(255,255,255,0.3);
                }
                .acc-card-arrow {
                    position: absolute; top: 16px; right: 16px;
                    font-size: 16px; color: rgba(255,255,255,0.2);
                    transition: all 0.2s;
                }
                .acc-card:hover .acc-card-arrow {
                    color: rgba(255,255,255,0.6);
                    transform: translateX(3px);
                }

                /* Skeleton */
                .acc-skeleton {
                    height: 140px; border-radius: 18px;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.06);
                    animation: accPulse 1.4s ease-in-out infinite;
                }
                @keyframes accPulse {
                    0%,100% { opacity: 0.5 }
                    50% { opacity: 1 }
                }

                @media (max-width: 480px) {
                    .acc-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
                    .acc-card { padding: 18px 14px 16px; }
                    .acc-card-icon { width: 44px; height: 44px; font-size: 20px; }
                    .acc-card-label { font-size: 13px; }
                }
            `}</style>

            <Header />
            <div className="acc-page">
                <div className="container">
                    <div className="acc-hero">
                        {/* Breadcrumb */}
                        <div className="acc-breadcrumb">
                            <Link to="/">{t('categories.home')}</Link>
                            <span>/</span>
                            <span style={{ color: '#fff' }}>{t('create.categories.accessories', 'Aksessuarlar')}</span>
                        </div>

                        <span className="acc-eyebrow">Kategoriyalar</span>
                        <h1 className="acc-title">{t('create.categories.accessories', 'Aksessuarlar')}</h1>
                        <p className="acc-sub">Kompyuter komponentlari va aksessuarlar</p>
                    </div>

                    {/* Grid */}
                    <div className="acc-grid">
                        {isLoading
                            ? Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="acc-skeleton" />
                            ))
                            : SUBCATEGORIES.map(sub => {
                                const count = getCount(sub.key)
                                return (
                                    <div
                                        key={sub.key}
                                        className="acc-card"
                                        style={{ '--glow': sub.glow }}
                                        onClick={() => navigate(`/categories/${sub.key}`)}
                                    >
                                        <div
                                            className="acc-card-icon"
                                            style={{
                                                background: sub.glow,
                                                borderColor: `${sub.color}50`,
                                            }}
                                        >
                                            {sub.icon}
                                        </div>
                                        <div className="acc-card-info">
                                            <span className="acc-card-label">{sub.label}</span>
                                            <span className="acc-card-count">
                                                {count > 0 ? `${count} ta mahsulot` : 'Hozircha bo\'sh'}
                                            </span>
                                        </div>
                                        <span className="acc-card-arrow">→</span>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default AccessoriesPage