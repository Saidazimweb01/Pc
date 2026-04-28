import React, { useEffect, useState } from 'react'
import "./MainCatalog.css"
import pc from "../../../images/pc.png"
import laptop from "../../../images/laptop.png"
import acc from "../../../images/acessuars.png"
import corpus from "../../../images/corpus.png"
import mono from "../../../images/monoblok.png"
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'



function MainCatalog() {
    const { t } = useTranslation()
    const categories = [
        { id: 1, title: t("cat.laptops.title"), desc: t("cat.laptops.description"), img: laptop, tag: 'Laptop' },
        { id: 2, title: t("cat.computers.title"), desc: t("cat.computers.description"), img: pc, tag: 'PC' },
        { id: 3, title: t("cat.monoblocks.title"), desc: t("cat.monoblocks.description"), img: mono, tag: 'Mono' },
        { id: 4, title: t("cat.cases.title"), desc: t("cat.cases.description"), img: corpus, tag: 'Corpus' },
        { id: 5, title: t("cat.accessories.title"), desc: t("cat.accessories.description"), img: acc, tag: 'access' },
    ]
    const [search, setSearch] = useState('')
    const [active, setActive] = useState(null)
    const navigate = useNavigate()

    const filtered = categories.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.desc.toLowerCase().includes(search.toLowerCase())
    )



    function navigatedBtn(cat) {
        setActive(active === cat.id ? null : cat.id)

        if (cat.tag === "access") {
            navigate("/category/access")
        } else {
            navigate(`/categories/${cat.tag}`)
        }
    }

    return (
        <section className='products'>
            <div className="container">

                <div className="mc__header">
                    <div className="mc__title-block">
                        <span className="mc__label">{t("cat.catalog")}</span>
                        <h2 className="mc__title">{t("cat.select_category")}</h2>
                    </div>

                    <div className="mc__search-wrap">
                        <svg className="mc__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            className="mc__search"
                            type="text"
                            placeholder={t("cat.search_placeholder")}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        {search && (
                            <button className="mc__search-clear" onClick={() => setSearch('')}>✕</button>
                        )}
                    </div>
                </div>

                <div className="mc__grid">
                    {filtered.length > 0 ? filtered.map((cat, i) => (
                        <div
                            key={cat.id}
                            className={`mc__card ${active === cat.id ? 'mc__card--active' : ''}`}
                            style={{ animationDelay: `${i * 0.08}s` }}
                            onClick={() =>
                                navigatedBtn(cat)
                            }
                        >
                            <div className="mc__card-glow" />
                            <div className="mc__img-wrap">
                                <img src={cat.img} alt={cat.title} className="mc__img" />
                            </div>
                            <div className="mc__card-body">
                                <h3 className="mc__card-title">{cat.title}</h3>
                                <p className="mc__card-desc">{cat.desc}</p>
                                <span className="mc__card-arrow">
                                    Смотреть
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                        <polyline points="12 5 19 12 12 19" />
                                    </svg>
                                </span>
                            </div>
                        </div>
                    )) : (
                        <div className="mc__empty">
                            <span>🔍</span>
                            <p>{t("cat.not_found")} «{search}»</p>
                        </div>
                    )}

                </div>

            </div>
        </section >
    )
}

export default MainCatalog