import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useGetProductsQuery } from '../../app/services/pcApi'
import { addBasket, removeBasket } from '../../app/features/AuthSlice'
import basket from "../../images/basket-new.svg"
import "./CategoriesDetail.css"
import Header from '../homePage/header/Header'
import Footer from '../homePage/footer/Footer'
import { getLocalized } from '../../UI/localize'

// ─── Category → i18n key map ──────────────────────────────
// DB dagi qiymat → JSON dagi kalit
const CATEGORY_KEY_MAP = {
    pc: 'create.categories.PC',
    PC: 'create.categories.PC',
    mono: 'create.categories.mono',
    Mono: 'create.categories.mono',
    corpus: 'create.categories.corpus',
    Corpus: 'create.categories.corpus',
    laptop: 'create.categories.laptop',
    Laptop: 'create.categories.laptop',
    accessories: 'create.categories.accessories',
    Accessories: 'create.categories.accessories',
}



function Skeleton() {
    return (
        <li className="skeleton-card">
            <div className="skeleton-photo">
                <div className="skeleton-img skeleton-pulse" />
            </div>
            <div className="cat-detail__inner">
                <div className="skeleton-line skeleton-pulse" style={{ width: '90%', height: '14px', marginBottom: '10px' }} />
                <div className="skeleton-line skeleton-pulse" style={{ width: '60%', height: '14px', marginBottom: '24px' }} />
                <div className="cat-detail__box">
                    <div className="skeleton-line skeleton-pulse" style={{ width: '90px', height: '14px' }} />
                    <div className="skeleton-circle skeleton-pulse" />
                </div>
            </div>
        </li>
    )
}

function CategoriesDetail() {
    const { category } = useParams()
    const { t } = useTranslation()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const basketList = useSelector(state => state.auth.basketList)
    const [searchQuery, setSearchQuery] = useState('')

    const { data: allProducts, isLoading } = useGetProductsQuery()

    // Category label — i18n orqali
    const categoryLabel = t(CATEGORY_KEY_MAP[category] || `create.categories.${category}`, { defaultValue: category })

    // Filter
    const filtered = (allProducts || [])
        .filter(el => el.category?.toLowerCase().trim() === category?.toLowerCase().trim())
        .filter(el => el.status !== "no") // 🔥 mana shu qo‘shiladi
        .filter(el => {
            if (!searchQuery.trim()) return true
            const q = searchQuery.toLowerCase()
            const name = getLocalized(el, 'name').toLowerCase()
            return name.includes(q)
        })

          useEffect(() => {
  if (category === "access") {
    navigate("/category/access")
  }
}, [category])

    return (
        <>
            <Header />
            <section className='cat-detail'>
                <div className="container">

                    {/* Breadcrumb */}
                    <div className='cat-map'>
                        <Link to="/">{t('categories.home')} /</Link>
                        <span> {categoryLabel}</span>
                    </div>

                    {/* Header */}
                    <div className="cat-detail__header">
                        <div>
                            <p className="cat-detail__status">{t('categories.label')}</p>
                            <h2 className="cat-detail__title">{categoryLabel}</h2>
                            <p className="cat-detail__count">
                                {isLoading ? '...' : `${filtered.length} ${t('categories.products')}`}
                            </p>
                        </div>

                        <div className="cat-detail__search-wrap">
                            <span className="cat-detail__search-icon">🔍</span>
                            <input
                                className="cat-detail__search"
                                type="text"
                                placeholder={`${t('categories.search')} ${categoryLabel}...`}
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button className="cat-detail__search-clear" onClick={() => setSearchQuery('')}>✕</button>
                            )}
                        </div>
                    </div>

                    {/* List */}
                    <ul className="cat-detail__list">
                        {isLoading
                            ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)
                            : filtered.length > 0
                                ? filtered.map(el => {
                                    const basketItem = basketList?.find(item => item.id === el.id)
                                    const qty = basketItem?.quantity ?? 0
                                    const localName = getLocalized(el, 'name')

                                    return (
                                        <li
                                            key={el.id}
                                            className="cat-detail__item"
                                            onClick={() => navigate(`/details/${el.id}?category&type=${category}`)}
                                        >
                                            <div className="cat-detail__photo">
                                                {el.imgs?.[0]
                                                    ? <img src={el.imgs[0]} alt={localName} />
                                                    : <div className="cat-detail__photo-placeholder">📦</div>
                                                }

                                                {/* Not active badge (agar kerak bo‘lsa qoldirasan) */}
                                                {el.status !== 'yes' && (
                                                    <span style={{
                                                        position: 'absolute',
                                                        top: 8,
                                                        left: 8,
                                                        fontSize: 10,
                                                        fontWeight: 700,
                                                        padding: '3px 8px',
                                                        borderRadius: 20,
                                                        color: '#e74c3c',
                                                        background: 'rgba(231,76,60,0.12)',
                                                        border: '1px solid rgba(231,76,60,0.3)',
                                                        letterSpacing: '0.3px',
                                                    }}>
                                                        ● Not active
                                                    </span>
                                                )}
                                            </div>

                                            <div className="cat-detail__inner">
                                                <h3 className="cat-detail__name">{localName}</h3>

                                                <div className="cat-detail__box">
                                                    <p className="cat-detail__price">{el.price} USD</p>

                                                    {qty > 0 ? (
                                                        <div
                                                            className="cat-detail__counter"
                                                            onClick={e => e.stopPropagation()}
                                                        >
                                                            <button onClick={() => dispatch(removeBasket(el.id))}>−</button>
                                                            <p>{qty}</p>
                                                            <button onClick={() => dispatch(addBasket({ basketList: el }))}>+</button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            className="cat-detail__basket"
                                                            onClick={e => {
                                                                e.stopPropagation()
                                                                dispatch(addBasket({ basketList: el }))
                                                            }}
                                                        >
                                                            <img src={basket} alt="basket" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    )
                                })
                                : (
                                    <li className="cat-detail__empty">
                                        <div className="cat-detail__empty-icon">🔍</div>
                                        <p className="cat-detail__empty-text">
                                            {searchQuery
                                                ? `"${searchQuery}" ${t('categories.not_found')}`
                                                : `${categoryLabel} ${t('categories.empty')}`
                                            }
                                        </p>
                                    </li>
                                )
                        }
                    </ul>
                </div>
            </section>
            <Footer />
        </>
    )
}

export default CategoriesDetail