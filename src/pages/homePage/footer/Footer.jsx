import React from 'react'
import "./Footer.css"
import { Link, useNavigate } from 'react-router-dom'
import logo from "../../../images/logoo.png"
import { useTranslation } from 'react-i18next'

function Footer() {
    const navigate = useNavigate()
    const { t } = useTranslation()
    return (
        <footer className='footer'>
            <div className="container">
                <div className="footer__top">

                    {/* Logo + Social + Description */}
                    <div className="footer__brand">
                        <div className="footer__logo">
                            <img width={60} src={logo} alt="" />
                        </div>
                        <div className="footer__socials">
                            <a href="#" className="footer__social">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.48 14.697l-2.95-.924c-.64-.203-.654-.64.136-.948l11.527-4.444c.537-.194 1.006.131.37.867z" />
                                </svg>
                            </a>
                            <a href="#" className="footer__social">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                                </svg>
                            </a>
                            <a href="#" className="footer__social">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>
                        </div>
                        <p className="footer__desc">
                            {t("footer.description")}
                        </p>
                    </div>

                    {/* Интернет магазин */}
                    <div className="footer__col">
                        <h4 className="footer__col-title"> {t("footer.shop_title")}</h4>
                        <ul className="footer__links">
                            <li><a href="/search" className="footer__link"> {t("footer.links.models")}</a></li>
                            <li><a href="/categories/PC" className="footer__link">{t("footer.links.catalog")}</a></li>
                            {/* <li><a href="/brands" className="footer__link">{t("footer.links.brands")}</a></li> */}
                        </ul>
                    </div>

                    {/* Категории */}
                    <div className="footer__col">
                        <h4 className="footer__col-title">{t("footer.categories_title")}</h4>
                        <ul className="footer__links">
                            <li><a href="/search" className="footer__link">{t("footer.links.search")}</a></li>
                            <li><a href="/categories/PC" className="footer__link">{t("footer.links.computers")}</a></li>
                            <li><a href="/categories/Mono" className="footer__link">{t("footer.links.monoblocks")}</a></li>
                            <li><a href="/categories/Laptop" className="footer__link">{t("footer.links.laptops")}</a></li>
                            <li><a href="/categories/Accessories" className="footer__link">{t("footer.links.components")}</a></li>
                        </ul>
                    </div>

                    {/* Персональное */}
                    <div className="footer__col">
                        <h4 className="footer__col-title">{t("footer.personal_title")}</h4>
                        <ul className="footer__links">
                            <li><a href="/my-orders-status" className="footer__link" >{t("footer.links.my_orders")}</a></li>
                            <li><a href="/basketItems" className="footer__link" >{t("footer.links.cart")}</a></li>
                        </ul>
                    </div>

                    {/* Контакты */}
                    <div className="footer__col footer__col--contacts">
                        <div className="footer__contact">
                            <div className="footer__contact-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.06 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
                                </svg>
                            </div>
                            <div>
                                <p className="footer__contact-label">{t("footer.contacts.phone")}</p>
                                <p className="footer__contact-value">Your phone number</p>
                            </div>
                        </div>

                        <div className="footer__contact">
                            <div className="footer__contact-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                </svg>
                            </div>
                            <div>
                                <p className="footer__contact-label">{t("footer.contacts.work_hours_label")}</p>
                                {/* <p className="footer__contact-value">{t("footer.contacts.work_hours_value")}</p> */}
                                <p className="footer__contact-value">Your work hour</p>
                            </div>
                        </div>

                        <div className="footer__contact">
                            <div className="footer__contact-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                                </svg>
                            </div>
                            <div>
                                <p className="footer__contact-label">{t("footer.contacts.address_label")}</p>
                                <p className="footer__contact-value">Your address</p>
                                {/* <p className="footer__contact-value">{t("footer.contacts.address_value")}</p> */}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bottom */}
                <div className="footer__bottom">
                    <p className="footer__copy">{t("footer.copy")}</p>
                    <p className="footer__made">{t("footer.made_by")} <Link target='_blank' to={"https://t.me/Akh_obc"}>SAID</Link></p>
                </div>
            </div>
        </footer>
    )
}

export default Footer