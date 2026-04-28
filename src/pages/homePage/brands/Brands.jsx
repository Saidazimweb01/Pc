import React, { useState, useEffect } from 'react'
import "./Brands.css"
import acer from "../../../images/acer.svg"
import asus from "../../../images/asus.svg"
import amd from "../../../images/amd.svg"
import cool from "../../../images/cool.svg"
import deel from "../../../images/dell.svg"
import gigabyte from "../../../images/gigabyte.svg"
import hp from "../../../images/hp.svg"
import intel from "../../../images/intel.svg"
import msi from "../../../images/msi.svg"
import razer from "../../../images/razer.svg"
import redragon from "../../../images/redragon.svg"
import toshiba from "../../../images/toshiba.svg"
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

const brands = [
    { id: 1, name: 'Acer', img: acer, url: 'https://www.acer.com' },
    { id: 2, name: 'Asus', img: asus, url: 'https://www.asus.com' },
    { id: 3, name: 'AMD', img: amd, url: 'https://www.amd.com' },
    { id: 4, name: 'DeepCool', img: cool, url: 'https://www.deepcool.com' },
    { id: 5, name: 'Dell', img: deel, url: 'https://www.dell.com' },
    { id: 6, name: 'Gigabyte', img: gigabyte, url: 'https://www.gigabyte.com' },
    { id: 7, name: 'HP', img: hp, url: 'https://www.hp.com' },
    { id: 8, name: 'Intel', img: intel, url: 'https://www.intel.com' },
    { id: 9, name: 'MSI', img: msi, url: 'https://www.msi.com' },
    { id: 10, name: 'Razer', img: razer, url: 'https://www.razer.com' },
    { id: 11, name: 'Redragon', img: redragon, url: 'https://www.redragonzone.com' },
    { id: 12, name: 'Toshiba', img: toshiba, url: 'https://www.toshiba.com' },
]
// Ekran kengligiga qarab nechta ko'rsatish:
// ≥1024 → 6 (bir qator), ≥640 → 4, ≥420 → 3, <420 → 3 (2 qator = 6)
function getVisibleCount() {
    const w = window.innerWidth
    if (w >= 1024) return 6
    if (w >= 640) return 4
    return 3
}

function Brands() {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const [showAll, setShowAll] = useState(false)
    const [visibleCount, setVisibleCount] = useState(getVisibleCount)

    useEffect(() => {
        const onResize = () => {
            setVisibleCount(getVisibleCount())
            setShowAll(false) // resize bo'lsa reset
        }
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    const visibleBrands = showAll ? brands : brands.slice(0, visibleCount)

    return (
        <section className='brands'>
            <div className="container">
                {/* <img src="ac" alt="" /> */}
                <div className="brands__header">
                    <span className="brands__label">{t("brands.label")}</span>
                    <h2 className="brands__title">{t("brands.title")}</h2>
                </div>

                <ul className='brands__list'>
                    {visibleBrands.map((brand, i) => (
                        <li
                            key={brand.id}
                            className='brands__item'
                            style={{ animationDelay: `${i * 0.06}s` }}

                        >
                            <a target='_blank' href={brand.url}>
                                <div className="brands__img-wrap">
                                    <img src={brand.img} alt={brand.name} className='brands__img' />
                                </div>
                                <span className="brands__name">{brand.name}</span>
                            </a>
                        </li>
                    ))}
                </ul>

                {brands.length > visibleCount && (
                    <div className="brands__footer">
                        <button
                            className='brands__btn'
                            onClick={() => setShowAll(prev => !prev)}
                        >
                            {showAll ? t("brands.hide") : t("brands.show_all")}
                            <svg
                                className={`brands__btn-icon ${showAll ? 'brands__btn-icon--up' : ''}`}
                                viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2"
                                width="16" height="16"
                            >
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </section>
    )
}

export default Brands