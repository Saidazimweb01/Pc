import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import logo from "../../../images/logoo.png"
import search from "../../../images/search-icon.svg"
import profile from "../../../images/profile-icon.svg"
import basket from "../../../images/basket-icon.svg"
import "./Header.css"
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'



function Header() {
    const { t } = useTranslation()


    const NAV_LINKS = [
        { label: t("nav.models"), to: '/search' },
        { label: t("nav.catalog"), to: null, catalog: true },
      
        { label: t("nav.build"), to: '/my-orders-status' },
    ]

    const CATALOG_ITEMS = [
        { label: t("catalog.computers"), to: '/categories/PC' },
        { label: t("catalog.monoblocks"), to: '/categories/mono' },
        { label: t("catalog.laptops"), to: '/categories/laptop' },
        { label: t("catalog.cases"), to: '/categories/corpus' },
        { label: t("catalog.accessories"), to: '/categories/accessories' },
    ]
    const navigate = useNavigate()
    const location = useLocation()
    const basketList = useSelector((state) => state.auth.basketList)

    const [openCatalog, setOpenCatalog] = useState(false)
    const [burgerOpen, setBurgerOpen] = useState(false)

    // Route o'zgarganda menuni yopish
    useEffect(() => {
        setBurgerOpen(false)
        setOpenCatalog(false)
    }, [location.pathname])

    // Burger ochiq bo'lsa scroll ni bloklash
    useEffect(() => {
        document.body.style.overflow = burgerOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [burgerOpen])

    const totalCount = basketList?.reduce((sum, item) => sum + (item.quantity ?? 1), 0) ?? 0

    return (
        <>
            <header className='cite-head'>
                <div className="container">
                    <div className="cite-head__inner">

                        {/* Logo */}
                        <Link className='cite-head__logo' to={"/"}>
                            <img src={logo} alt="logo" />
                        </Link>

                        {/* Desktop nav */}
                        <ul className="cite-head__list">
                            {NAV_LINKS.map((item) =>
                                item.catalog ? (
                                    <li key={item.label} className="cite-head__item cite-head__item--catalog">
                                        <button
                                            className={`cite-head__link cite-head__link--btn ${openCatalog ? 'active' : ''}`}
                                            onClick={() => setOpenCatalog(p => !p)}
                                        >
                                            {item.label}
                                            <svg className={`catalog-arrow ${openCatalog ? 'open' : ''}`} fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2}>
                                                <polyline points="2,4 6,8 10,4" />
                                            </svg>
                                        </button>

                                        {openCatalog && (
                                            <div className="cite-head__dropdown">
                                                {CATALOG_ITEMS.map(c => (
                                                    <Link
                                                        key={c.to}
                                                        className="dropdown__item"
                                                        to={c.to}
                                                        onClick={() => setOpenCatalog(false)}
                                                    >
                                                        {c.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </li>
                                ) : (
                                    <li key={item.label} className="cite-head__item">
                                        <Link className='cite-head__link' to={item.to ?? '#'}>
                                            {item.label}
                                        </Link>
                                    </li>
                                )
                            )}
                        </ul>

                        {/* Right icons */}
                        <div className="cite-head__box">
                            <button className='cite-head__btns' onClick={() => navigate("/search?s")}>
                                <img src={search} alt="search" />
                            </button>
                            <button className='cite-head__btns' onClick={()=> navigate("/settings")}>
                                <img src={profile} alt="profile" />
                            </button>
                            <button className='cite-head__btns cite-head__btns--basket' onClick={() => navigate("/basketItems")}>
                                <img src={basket} alt="basket" />
                                {totalCount > 0 && (
                                    <span className='cite-head__basket-len'>{totalCount}</span>
                                )}
                            </button>

                            {/* Burger */}
                            <button
                                className={`cite-head__burger ${burgerOpen ? 'open' : ''}`}
                                onClick={() => setBurgerOpen(p => !p)}
                                aria-label="Меню"
                            >
                                <span />
                                <span />
                                <span />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Overlay */}
            {burgerOpen && (
                <div className="cite-head__overlay" onClick={() => setBurgerOpen(false)} />
            )}

            {/* Mobile drawer */}
            <nav className={`cite-head__drawer ${burgerOpen ? 'open' : ''}`}>
                <div className="drawer__top">
                    <Link className='cite-head__logo' to={"/"}>
                        <img src={logo} alt="logo" />
                    </Link>
                    <button className="drawer__close" onClick={() => setBurgerOpen(false)}>
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <line x1="6" y1="6" x2="18" y2="18" />
                            <line x1="18" y1="6" x2="6" y2="18" />
                        </svg>
                    </button>
                </div>

                <ul className="drawer__list">
                    {NAV_LINKS.map(item =>
                        item.catalog ? (
                            <li key={item.label}>
                                <button
                                    className={`drawer__link drawer__link--catalog ${openCatalog ? 'open' : ''}`}
                                    onClick={() => setOpenCatalog(p => !p)}
                                >
                                    {item.label}
                                    <svg className={`catalog-arrow ${openCatalog ? 'open' : ''}`} fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2}>
                                        <polyline points="2,4 6,8 10,4" />
                                    </svg>
                                </button>
                                {openCatalog && (
                                    <ul className="drawer__sub">
                                        {CATALOG_ITEMS.map(c => (
                                            <li key={c.to}>
                                                <Link className="drawer__sub-link" to={c.to}>
                                                    {c.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ) : (
                            <li key={item.label}>
                                <Link className="drawer__link" to={item.to ?? '#'}>
                                    {item.label}
                                </Link>
                            </li>
                        )
                    )}
                </ul>

                <div className="drawer__actions">
                    <button className="drawer__action-btn" onClick={() => { navigate("/search?s"); setBurgerOpen(false) }}>
                        <img src={search} alt="search" /> Поиск
                    </button>
                    <button className="drawer__action-btn" onClick={() => { navigate("/basketItems"); setBurgerOpen(false) }}>
                        <img src={basket} alt="basket" /> Корзина
                        {totalCount > 0 && <span className="drawer__count">{totalCount}</span>}
                    </button>
                    <button className="drawer__action-btn">
                        <img src={profile} alt="profile" /> Профиль
                    </button>
                </div>
            </nav>
        </>
    )
}

export default Header