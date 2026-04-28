import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Header from '../homePage/header/Header'
import Footer from '../homePage/footer/Footer'
import './Settings.css'
import { useLoginUpMutation } from '../../app/services/pcApi'
import TelegramLoginModal from '../../UI/TelegramLoginModal.jsx'

const LANGUAGES = [
    { code: 'en', flag: 'EN', label: 'English' },
    { code: 'ru', flag: '🇷🇺', label: 'Русский' },
    { code: 'uz', flag: '🇺🇿', label: "O'zbek" },
]

function Profile() {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const [signUp] = useLoginUpMutation()

    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [avatar, setAvatar] = useState(null)
    const [name, setName] = useState('')
    const [surname, setSurname] = useState('')
    const [email, setEmail] = useState('')
    const [editMode, setEditMode] = useState(false)
    const [saved, setSaved] = useState(false)
    const [langSaved, setLangSaved] = useState(false)

    const [authMode, setAuthMode] = useState('login')
    const [formEmail, setFormEmail] = useState('')
    const [formPass, setFormPass] = useState('')
    const [formName, setFormName] = useState('')
    const [formSurname, setFormSurname] = useState('')
    const [tgOpen, setTgOpen] = useState(false)

    const fileRef = useRef()

    const handleAvatarChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (ev) => setAvatar(ev.target.result)
        reader.readAsDataURL(file)
    }

    const handleSave = () => {
        setSaved(true)
        setEditMode(false)
        setTimeout(() => setSaved(false), 2000)
    }

    const handleLogin = (e) => {
        e.preventDefault()
        setIsLoggedIn(true)
        setEmail(formEmail)
    }

    const handleSignup = (e) => {
        e.preventDefault()
        setIsLoggedIn(true)
        setName(formName)
        setSurname(formSurname)
        setEmail(formEmail)
    }

    const handleLogout = () => {
        setIsLoggedIn(false)
        setAvatar(null)
        setName('')
        setSurname('')
        setEmail('')
        setFormEmail('')
        setFormPass('')
        setFormName('')
        setFormSurname('')
    }

    const handleLangChange = (code) => {
        i18n.changeLanguage(code)
        setLangSaved(true)
        setTimeout(() => setLangSaved(false), 2000)
    }

    const initials = (name?.[0] ?? '') + (surname?.[0] ?? '') || '?'

    const LangCard = () => (
        <div className="profile-card profile-lang-card">
            <div className="profile-lang-section">
                <div className="profile-info-header">
                    <p className="profile-section-label">{t('settings.language')}</p>
                    {langSaved && (
                        <span className="profile-saved">✓ {t('settings.saved')}</span>
                    )}
                </div>
                <p className="profile-lang-desc">{t('settings.lang_desc')}</p>
                <div className="profile-lang-grid">
                    {LANGUAGES.map(lang => (
                        <button
                            key={lang.code}
                            className={`profile-lang-btn${i18n.language === lang.code ? ' active' : ''}`}
                            onClick={() => handleLangChange(lang.code)}
                        >
                            <span className="profile-lang-flag">{lang.flag}</span>
                            <span className="profile-lang-label">{lang.label}</span>
                            <span className="profile-lang-dot" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )

    return (
        <>
            <Header />
            <section className="profile-page">
                <div className="container">
                    <button className="profile-back" onClick={() => navigate(-1)}>
                        <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}>
                            <polyline points="10,4 6,8 10,12" />
                        </svg>
                        {t('settings.back')}
                    </button>
                    <button onClick={() => setTgOpen(true)}>
                        ✈️ Telegram orqali kirish
                    </button>

                    <TelegramLoginModal
                        open={tgOpen}
                        onClose={() => setTgOpen(false)}
                        onSuccess={(user) => console.log('Logged in:', user)}
                    />

                    <div className="profile-header">
                        <p className="profile-label">{t('profile.label')}</p>
                        <h1 className="profile-title">{t('profile.title')}</h1>
                    </div>

                    {isLoggedIn ? (
                        <div className="profile-two-col">
                            {/* CHAP — Profil kartasi */}
                            <div className="profile-card">
                                <div className="profile-avatar-section">
                                    <div
                                        className="profile-avatar"
                                        onClick={() => fileRef.current?.click()}
                                        title={t('profile.change_photo')}
                                    >
                                        {avatar
                                            ? <img src={avatar} alt="avatar" />
                                            : <span className="profile-avatar-initials">{initials}</span>
                                        }
                                        <div className="profile-avatar-overlay">
                                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                                                <circle cx="12" cy="13" r="4" />
                                            </svg>
                                        </div>
                                    </div>
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={handleAvatarChange}
                                    />
                                    <p className="profile-avatar-hint">{t('profile.change_photo')}</p>
                                </div>

                                <div className="profile-divider" />

                                <div className="profile-info-section">
                                    <div className="profile-info-header">
                                        <p className="profile-section-label">{t('profile.info')}</p>
                                        {saved && <span className="profile-saved">✓ {t('profile.saved')}</span>}
                                        {!editMode && (
                                            <button className="profile-edit-btn" onClick={() => setEditMode(true)}>
                                                <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}>
                                                    <path d="M11 2.5l2.5 2.5L5 13.5H2.5V11L11 2.5z" />
                                                </svg>
                                                {t('profile.edit')}
                                            </button>
                                        )}
                                    </div>
                                    <div className="profile-fields">
                                        <div className="profile-field-row">
                                            <div className="profile-field">
                                                <label>{t('profile.name')}</label>
                                                {editMode
                                                    ? <input value={name} onChange={e => setName(e.target.value)} placeholder={t('profile.name_ph')} />
                                                    : <p className="profile-field-val">{name || <span className="profile-empty">{t('profile.name_ph')}</span>}</p>
                                                }
                                            </div>
                                            <div className="profile-field">
                                                <label>{t('profile.surname')}</label>
                                                {editMode
                                                    ? <input value={surname} onChange={e => setSurname(e.target.value)} placeholder={t('profile.surname_ph')} />
                                                    : <p className="profile-field-val">{surname || <span className="profile-empty">{t('profile.surname_ph')}</span>}</p>
                                                }
                                            </div>
                                        </div>
                                        <div className="profile-field">
                                            <label>{t('profile.email')}</label>
                                            <p className="profile-field-val profile-field-email">
                                                {email}
                                                <span className="profile-email-badge">
                                                    <svg fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth={2}>
                                                        <polyline points="2,7 5.5,11 12,3" />
                                                    </svg>
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    {editMode && (
                                        <div className="profile-edit-actions">
                                            <button className="profile-save-btn" onClick={handleSave}>{t('profile.save')}</button>
                                            <button className="profile-cancel-btn" onClick={() => setEditMode(false)}>{t('profile.cancel')}</button>
                                        </div>
                                    )}
                                </div>

                                <div className="profile-divider" />

                                <div className="profile-logout-section">
                                    <button className="profile-logout-btn" onClick={handleLogout}>
                                        <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}>
                                            <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6" />
                                        </svg>
                                        {t('profile.logout')}
                                    </button>
                                </div>
                            </div>

                            {/* O'NG — Til kartasi */}
                            <LangCard />
                        </div>

                    ) : (
                        <div className="profile-two-col">
                            {/* CHAP — Login kartasi */}
                            <div className="profile-card profile-card--auth">
                                <div className="profile-guest-icon">
                                    <svg fill="none" viewBox="0 0 48 48" stroke="currentColor" strokeWidth={1.2}>
                                        <circle cx="24" cy="18" r="8" />
                                        <path d="M8 42c0-8.837 7.163-16 16-16s16 7.163 16 16" />
                                    </svg>
                                </div>
                                <h2 className="profile-guest-title">
                                    {authMode === 'login' ? t('profile.login_title') : t('profile.signup_title')}
                                </h2>
                                <p className="profile-guest-desc">
                                    {authMode === 'login' ? t('profile.login_desc') : t('profile.signup_desc')}
                                </p>

                                <form className="profile-form" onSubmit={authMode === 'login' ? handleLogin : handleSignup}>
                                    {authMode === 'signup' && (
                                        <div className="profile-form-row">
                                            <div className="profile-form-field">
                                                <label>{t('profile.name')}</label>
                                                <input type="text" placeholder={t('profile.name_ph')} value={formName} onChange={e => setFormName(e.target.value)} required />
                                            </div>
                                            <div className="profile-form-field">
                                                <label>{t('profile.surname')}</label>
                                                <input type="text" placeholder={t('profile.surname_ph')} value={formSurname} onChange={e => setFormSurname(e.target.value)} required />
                                            </div>
                                        </div>
                                    )}
                                    <div className="profile-form-field">
                                        <label>{t('profile.email')}</label>
                                        <input type="email" placeholder="example@mail.com" value={formEmail} onChange={e => setFormEmail(e.target.value)} required />
                                    </div>
                                    <div className="profile-form-field">
                                        <label>{t('profile.password')}</label>
                                        <input type="password" placeholder="••••••••" value={formPass} onChange={e => setFormPass(e.target.value)} required />
                                    </div>
                                    <button type="submit" className="profile-auth-btn">
                                        {authMode === 'login' ? t('profile.login_btn') : t('profile.signup_btn')}
                                    </button>
                                </form>

                                <div className="profile-auth-toggle">
                                    <span>{authMode === 'login' ? t('profile.no_account') : t('profile.has_account')}</span>
                                    <button className="profile-toggle-btn" onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}>
                                        {authMode === 'login' ? t('profile.signup_link') : t('profile.login_link')}
                                    </button>
                                </div>
                            </div>

                            {/* O'NG — Til kartasi */}
                            <LangCard />
                        </div>
                    )}
                </div>
            </section>
            <Footer />
        </>
    )
}

export default Profile