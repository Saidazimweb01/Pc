import React, { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useGetProductsQuery } from '../../app/services/pcApi'
import { addBasket, removeBasket } from '../../app/features/AuthSlice'
import basket from "../../images/basket-new.svg"
import Header from '../homePage/header/Header'
import Footer from '../homePage/footer/Footer'
import "./Search.css"
import { getLocalized } from '../../UI/localize'

function SkeletonCard() {
    return (
        <li className="new-products__item skeleton-card">
            <div className="new-products__photo skeleton-photo">
                <div className="skeleton-img skeleton-pulse" />
            </div>
            <div className="new-products__inner">
                <div className="skeleton-line skeleton-pulse" style={{ width: '90%', height: '14px', marginBottom: '10px' }} />
                <div className="skeleton-line skeleton-pulse" style={{ width: '70%', height: '14px', marginBottom: '10px' }} />
                <div className="skeleton-line skeleton-pulse" style={{ width: '50%', height: '14px', marginBottom: '24px' }} />
                <div className="new-products__box">
                    <div className="skeleton-line skeleton-pulse" style={{ width: '100px', height: '16px' }} />
                    <div className="skeleton-circle skeleton-pulse" />
                </div>
            </div>
        </li>
    )
}

function Search() {
    const { t } = useTranslation()
    const { data: products, isLoading } = useGetProductsQuery()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const basketList = useSelector(state => state.auth.basketList)
    const [searchParams] = useSearchParams()
    const prod = products?.[0]

    const models = searchParams.has("models")
    const [searchQuery, setSearchQuery] = useState('')
    const [filterOpen, setFilterOpen] = useState(false)
    const [sortBy, setSortBy] = useState('default')

    const [selectedCategories, setSelectedCategories] = useState([])
    const [selectedGpus, setSelectedGpus] = useState([])
    const [selectedCpus, setSelectedCpus] = useState([])
    const [selectedDisplays, setSelectedDisplays] = useState([])
    const [selectedHzList, setSelectedHzList] = useState([])
    const [selectedDpiList, setSelectedDpiList] = useState([])
    const [priceRange, setPriceRange] = useState([0, 9999])
    let localName = getLocalized(prod, "name")
    useEffect(() => {
        localStorage.setItem("basket_list", JSON.stringify(basketList))
    }, [basketList])

    const maxPrice = useMemo(() => {
        if (!products?.length) return 9999
        return Math.max(...products.map(p => p.price ?? 0))
    }, [products])

    useEffect(() => {
        if (maxPrice) setPriceRange([0, maxPrice])
    }, [maxPrice])

    // Filter options
    const categories = useMemo(() => [...new Set(products?.map(p => p.category).filter(Boolean))], [products])
    const gpus = useMemo(() => [...new Set(products?.flatMap(p => p.options?.map(o => o.gpu).filter(Boolean) ?? []))], [products])
    const cpus = useMemo(() => [...new Set(products?.flatMap(p => p.options?.map(o => o.cpu).filter(Boolean) ?? []))], [products])
    const displays = useMemo(() => [...new Set(products?.flatMap(p => p.options?.map(o => o.display || o.monitor).filter(Boolean) ?? []))], [products])
    const hzList = useMemo(() => [...new Set(products?.flatMap(p => p.options?.map(o => o.hz).filter(v => v && v !== 0) ?? []))].sort((a, b) => a - b), [products])
    const dpiList = useMemo(() => [...new Set(products?.flatMap(p => p.options?.map(o => o.dpi).filter(v => v && v !== 0) ?? []))].sort((a, b) => a - b), [products])

    const toggle = (setter) => (val) =>
        setter(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])

    const resetFilters = () => {
        setSelectedCategories([])
        setSelectedGpus([])
        setSelectedCpus([])
        setSelectedDisplays([])
        setSelectedHzList([])
        setSelectedDpiList([])
        setPriceRange([0, maxPrice])
        setSortBy('default')
    }

    const activeCount = selectedCategories.length + selectedGpus.length + selectedCpus.length +
        selectedDisplays.length + selectedHzList.length + selectedDpiList.length +
        (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0)

    const filtered = useMemo(() => {
        let r = products ?? []
        if (searchQuery.trim()) r = r.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()))
        if (selectedCategories.length) r = r.filter(p => selectedCategories.includes(p.category))
        if (selectedGpus.length) r = r.filter(p => p.options?.some(o => selectedGpus.includes(o.gpu)))
        if (selectedCpus.length) r = r.filter(p => p.options?.some(o => selectedCpus.includes(o.cpu)))
        if (selectedDisplays.length) r = r.filter(p => p.options?.some(o => selectedDisplays.includes(o.display) || selectedDisplays.includes(o.monitor)))
        if (selectedHzList.length) r = r.filter(p => p.options?.some(o => selectedHzList.includes(o.hz)))
        if (selectedDpiList.length) r = r.filter(p => p.options?.some(o => selectedDpiList.includes(o.dpi)))
        r = r.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])

        if (sortBy === 'price-asc') r = [...r].sort((a, b) => a.price - b.price)
        if (sortBy === 'price-desc') r = [...r].sort((a, b) => b.price - a.price)
        if (sortBy === 'name') r = [...r].sort((a, b) => a.name?.localeCompare(b.name))
        return r
    }, [products, searchQuery, selectedCategories, selectedGpus, selectedCpus, selectedDisplays, selectedHzList, selectedDpiList, priceRange, sortBy])

    const FilterSection = ({ title, items, selected, onToggle, renderLabel }) => {
        if (!items.length) return null
        return (
            <div className="filter-group">
                <p className="filter-group__title">{title}</p>
                <div className="filter-chips">
                    {items.map(item => (
                        <button
                            key={item}
                            className={`filter-chip ${selected.includes(item) ? 'active' : ''}`}
                            onClick={() => onToggle(item)}
                        >
                            {renderLabel ? renderLabel(item) : item}
                        </button>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <>
            <Header />
            <section className="search-page">
                <div className="container">
                    <div className='search-map'>
                        <Link to={"/"}>{t('search_page.home')} /</Link>
                        <span>{models ? t('nav.models') : t('footer.links.search')}</span>
                    </div>

                    <div className="search-page__top">
                        <div className="search-page__bar-wrap">
                            <svg className="search-page__bar-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                className="search-page__bar"
                                type="text"
                                placeholder={t('search_page.placeholder')}
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                            {searchQuery && <button className="search-page__bar-clear" onClick={() => setSearchQuery('')}>✕</button>}
                        </div>

                        <div className="search-page__top-right">
                            <select className="search-page__sort" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                                <option value="default">{t('search_page.sort.default')}</option>
                                <option value="price-asc">{t('search_page.sort.price_asc')}</option>
                                <option value="price-desc">{t('search_page.sort.price_desc')}</option>
                                <option value="name">{t('search_page.sort.name')}</option>
                            </select>

                            <button className={`search-page__filter-btn ${filterOpen ? 'active' : ''}`} onClick={() => setFilterOpen(!filterOpen)}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
                                </svg>
                                {t('search_page.filters')}
                                {activeCount > 0 && <span className="search-page__filter-badge">{activeCount}</span>}
                            </button>
                        </div>
                    </div>

                    <div className="search-page__meta-row">
                        <p className="search-page__result-count">
                            {isLoading ? t('search_page.loading') : t('search_page.found', { count: filtered.length })}
                        </p>
                        {activeCount > 0 && (
                            <button className="search-page__reset-inline" onClick={resetFilters}>
                                {t('search_page.reset_filters')}
                            </button>
                        )}
                    </div>

                    <div className={`search-page__filter-panel ${filterOpen ? 'open' : ''}`}>
                        <div className="search-page__filter-inner">
                            <div className="search-page__filter-head">
                                <span>{t('search_page.filter_params')}</span>
                                {activeCount > 0 && <button className="search-page__reset" onClick={resetFilters}>{t('search_page.reset_all')}</button>}
                            </div>

                            <div className="search-page__filter-grid">
                                <div className="filter-group filter-group--price">
                                    <p className="filter-group__title">{t('search_page.price_title')}</p>
                                    <div className="filter-price-row">
                                        <div className="filter-price-field">
                                            <span className="filter-price-label">{t('search_page.price_from')}</span>
                                            <input type="number" className="filter-price-input" value={priceRange[0]} onChange={e => setPriceRange([Math.min(+e.target.value, priceRange[1]), priceRange[1]])} />
                                        </div>
                                        <div className="filter-price-dash">—</div>
                                        <div className="filter-price-field">
                                            <span className="filter-price-label">{t('search_page.price_to')}</span>
                                            <input type="number" className="filter-price-input" value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], Math.max(+e.target.value, priceRange[0])])} />
                                        </div>
                                    </div>
                                    <input type="range" className="filter-range" min={0} max={maxPrice} value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], Math.max(+e.target.value, priceRange[0])])} />
                                </div>

                                <FilterSection
                                    title={t('categories.label')}
                                    items={categories}
                                    selected={selectedCategories}
                                    onToggle={toggle(setSelectedCategories)}
                                    renderLabel={(v) => t(`filter_labels.${v?.toLowerCase()}`, { defaultValue: v })}
                                />
                                <FilterSection title={t('details.specs_gpu')} items={gpus} selected={selectedGpus} onToggle={toggle(setSelectedGpus)} />
                                <FilterSection title={t('details.specs_cpu')} items={cpus} selected={selectedCpus} onToggle={toggle(setSelectedCpus)} />
                                <FilterSection title={t('details.specs_display')} items={displays} selected={selectedDisplays} onToggle={toggle(setSelectedDisplays)} />
                                <FilterSection title={t('details.specs_hz')} items={hzList} selected={selectedHzList} onToggle={toggle(setSelectedHzList)} renderLabel={v => `${v} Hz`} />
                                <FilterSection title={t('details.specs_dpi')} items={dpiList} selected={selectedDpiList} onToggle={toggle(setSelectedDpiList)} renderLabel={v => `${v} dpi`} />
                            </div>
                        </div>
                    </div>

                    <ul className="new-products__list">
                        {isLoading
                            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
                            : filtered.length === 0
                                ? (
                                    <li className="search-page__empty">
                                        <div className="search-page__empty-icon">🔍</div>
                                        <p>{t('cat.not_found')}</p>
                                        <button className="search-page__reset-btn" onClick={resetFilters}>{t('search_page.reset_filters')}</button>
                                    </li>
                                )
                                : filtered.map(el => {
                                    const basketItem = basketList?.find(item => item.id === el.id)
                                    const qty = basketItem?.quantity ?? 0
                                    const inStock = el.status === 'yes'

                                    return (
                                        <li key={el.id} className={`new-products__item ${!inStock ? 'out-of-stock' : ''}`} onClick={() => navigate(`/details/${el.id}?models`)}>
                                            {!inStock && <span className="search-card__out-badge">{t('details.out_of_stock')}</span>}
                                            <div className="new-products__photo">
                                                {el.imgs?.[0] ? <img src={el.imgs[0]} alt={el.name} /> : <div style={{ fontSize: 36 }}>📦</div>}
                                            </div>
                                            <div className="new-products__inner">
                                                <h3 className="new-products__name">{localName}</h3>
                                                <div className="new-products__box">
                                                    <p className="new-products__price">{el.price} USD</p>
                                                    {inStock ? (
                                                        qty > 0 ? (
                                                            <div className="new-products__counter" onClick={e => e.stopPropagation()}>
                                                                <button onClick={() => dispatch(removeBasket(el.id))}>−</button>
                                                                <p>{qty}</p>
                                                                <button onClick={() => dispatch(addBasket({ basketList: el }))}>+</button>
                                                            </div>
                                                        ) : (
                                                            <button className="new-products__basket" onClick={e => { e.stopPropagation(); dispatch(addBasket({ basketList: el })) }}>
                                                                <img src={basket} alt="basket" />
                                                            </button>
                                                        )
                                                    ) : (
                                                        <button className="new-products__basket disabled" disabled onClick={e => e.stopPropagation()}>
                                                            <img src={basket} alt="basket" style={{ opacity: 0.3 }} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    )
                                })
                        }
                    </ul>
                </div>
            </section>
            <Footer />
        </>
    )
}

export default Search