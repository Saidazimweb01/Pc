import React, { useEffect } from 'react'
import "./NewArrivals.css"
import basket from "../../../images/basket-new.svg"
import { useGetProductsQuery } from '../../../app/services/pcApi'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { addBasket, removeBasket } from '../../../app/features/AuthSlice'
import { useTranslation } from 'react-i18next'
import { getLocalized } from '../../../UI/localize'

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

function NewArrivals() {
    const { t } = useTranslation()

    const dispatch   = useDispatch()
    const navigate   = useNavigate()
    const { data: products, isLoading } = useGetProductsQuery()
    console.log(products);
    
    const basketList = useSelector((state) => state.auth.basketList)

    // localStorage ni AuthSlice boshqaradi — bu yerda qo'shimcha saqlash shart emas
    // (AuthSlice addBasket da o'zi saqlaydi)

    return (
        <section className='new-products'>
            <div className="container">
                <p className='new-products__status'>{t("news.newest_builds")}</p>
                <h2 className='new-products__title'>{t("news.new_arrivals")}</h2>

                <div className="new-products__scroll-wrap">
                    <ul className='new-products__list'>
                        {isLoading
                            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                            : products
                                ?.filter(el => el.category === "PC")
                                ?.filter(el => el.status !== "no")
                                .slice(0, 20)
                                
                                .map(el => {
                                    const basketItem = basketList?.find(item => item.id === el.id)
                                    const qty        = basketItem?.quantity ?? 0
                                    const localName  = getLocalized(el, 'name')

                                    return (
                                        <li key={el.id} className="new-products__item"
                                            onClick={() => navigate(`/details/${el.id}?new`)}>
                                            <div className='new-products__photo'>
                                                <img src={el.imgs?.[0]} alt={localName} />
                                            </div>
                                            <div className='new-products__inner'>
                                                <h3 className='new-products__name'>{localName}</h3>
                                                {el.status !== 'yes' && (
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: 5,
                                                        fontSize: 10, fontWeight: 700, letterSpacing: '0.5px',
                                                        padding: '3px 9px', borderRadius: 20, marginBottom: 6,
                                                        color: '#e74c3c',
                                                        background: 'rgba(231,76,60,0.1)',
                                                        border: '1px solid rgba(231,76,60,0.25)',
                                                    }}>
                                                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#e74c3c' }} />
                                                        Not active
                                                    </span>
                                                )}
                                                <div className="new-products__box">
                                                    <p className='new-products__price'>{el.price} USD</p>

                                                    {qty > 0 ? (
                                                        <div className='new-products__counter'
                                                            onClick={e => e.stopPropagation()}>
                                                            <button onClick={() => dispatch(removeBasket(el.id))}>−</button>
                                                            <p>{qty}</p>
                                                            <button onClick={() => dispatch(addBasket({ basketList: el }))}>+</button>
                                                        </div>
                                                    ) : (
                                                        <button className='new-products__basket'
                                                            onClick={e => {
                                                                e.stopPropagation()
                                                                dispatch(addBasket({ basketList: el }))
                                                            }}>
                                                            <img src={basket} alt="basket" />
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
            </div>
        </section>
    )
}

export default NewArrivals