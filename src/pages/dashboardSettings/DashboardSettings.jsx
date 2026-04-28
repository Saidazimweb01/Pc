import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import '../dashboardPage/DashboardPage.css'
//CLAUDE YOKI GPT DAN T NI DASHBOARD PAGE GA TOGRI QILIB QOYIB BERISHINI TASHLASHIM KERAK!!!

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
function IconGlobe() {
  return (
    <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 1.5C8 1.5 5.5 4 5.5 8s2.5 6.5 2.5 6.5M8 1.5C8 1.5 10.5 4 10.5 8S8 14.5 8 14.5" />
      <line x1="1.5" y1="8" x2="14.5" y2="8" />
      <path d="M2 5h12M2 11h12" />
    </svg>
  )
}
function IconUser() {
  return (
    <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="8" cy="5.5" r="2.5" />
      <path d="M2.5 14c0-3.038 2.462-5 5.5-5s5.5 1.962 5.5 5" />
    </svg>
  )
}
function IconFlask() {
  return (
    <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}>
      <path d="M6 2v5L2.5 13.5A1 1 0 003.4 15h9.2a1 1 0 00.9-1.5L10 7V2" />
      <line x1="5" y1="2" x2="11" y2="2" />
      <line x1="4" y1="11" x2="12" y2="11" />
    </svg>
  )
}
function IconCheck() {
  return (
    <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2.2}>
      <polyline points="3,8 6.5,12 13,4" />
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
function IconMail() {
  return (
    <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}>
      <rect x="1.5" y="3.5" width="13" height="9" rx="1" />
      <polyline points="1.5,3.5 8,9 14.5,3.5" />
    </svg>
  )
}
function IconLock() {
  return (
    <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="7" width="10" height="7" rx="1" />
      <path d="M5 7V5a3 3 0 016 0v2" />
    </svg>
  )
}

// ─── Language data ────────────────────────────────────────
const LANGUAGES = [
  { code: 'uz', label: "O'zbekcha", flag: '🇺🇿', native: "O'zbek tili" },
  { code: 'ru', label: 'Русский',   flag: '🇷🇺', native: 'Русский язык' },
  { code: 'en', label: 'English',   flag: 'en', native: 'English' },
]

// ─── Beta Alert Modal ─────────────────────────────────────
function BetaAlert({ t, onClose }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="beta-modal">
        <div className="beta-modal-icon">
          <IconFlask />
        </div>
        <div className="beta-modal-tag">BETA TEST</div>
        <h3 className="beta-modal-title">{t('settings.title')}</h3>
        <p className="beta-modal-desc">{t('settings.label')}</p>
        <button className="beta-modal-btn" onClick={onClose}>
          <IconClose /> {t('settings.back')}
        </button>
      </div>
    </div>
  )
}

// ─── Settings Page ────────────────────────────────────────
function SettingsPage() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()

  const [showBeta, setShowBeta]       = useState(false)
  const [pendingLang, setPendingLang] = useState(i18n.language?.slice(0, 2) || 'ru')
  const [langSaved, setLangSaved]     = useState(false)

  const handleLangSave = () => {
    i18n.changeLanguage(pendingLang)
    localStorage.setItem('lang', pendingLang)
    setLangSaved(true)
    setTimeout(() => setLangSaved(false), 2500)
  }

  return (
    <>
      <style>{`
        .settings-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          max-width: 860px;
        }

        .s-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
        }
        .s-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          background: rgba(255,255,255,0.02);
        }
        .s-card-title {
          font-size: 11px;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 2px;
          color: var(--muted);
          text-transform: uppercase;
          font-weight: 500;
        }
        .s-card-icon {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          background: rgba(232,83,42,0.1);
          border: 1px solid rgba(232,83,42,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
        }
        .s-card-icon svg { width: 14px; height: 14px; }
        .s-card-body { padding: 20px; }

        .profile-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 20px;
        }
        .profile-avatar-lg {
          width: 68px;
          height: 68px;
          border-radius: 14px;
          background: linear-gradient(135deg, var(--accent), #c0392b);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          font-weight: 800;
          color: #fff;
          font-family: 'JetBrains Mono', monospace;
        }
        .profile-name-lg {
          font-size: 15px;
          font-weight: 700;
          color: var(--text);
          letter-spacing: 0.5px;
        }

        .field-stack { display: flex; flex-direction: column; gap: 10px; }
        .s-field { display: flex; flex-direction: column; gap: 5px; }
        .s-label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--muted);
        }
        .s-label svg { width: 11px; height: 11px; }
        .s-input {
          background: var(--head-btn-color);
          border: 1px solid var(--border);
          border-radius: 7px;
          padding: 9px 12px;
          color: var(--muted);
          font-family: 'Manrope', sans-serif;
          font-size: 13px;
          font-weight: 500;
          outline: none;
          width: 100%;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .beta-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 16px;
          padding: 10px 14px;
          background: rgba(232,83,42,0.07);
          border: 1px solid rgba(232,83,42,0.2);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .beta-banner:hover {
          background: rgba(232,83,42,0.13);
          border-color: rgba(232,83,42,0.4);
        }
        .beta-banner-icon {
          width: 26px;
          height: 26px;
          border-radius: 6px;
          background: rgba(232,83,42,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          flex-shrink: 0;
        }
        .beta-banner-icon svg { width: 13px; height: 13px; }
        .beta-banner-text { flex: 1; }
        .beta-banner-tag {
          font-size: 9px;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 2px;
          color: var(--accent);
          font-weight: 600;
          display: block;
          margin-bottom: 2px;
        }
        .beta-banner-desc { font-size: 12px; color: var(--muted); line-height: 1.4; }
        .beta-banner-arrow { color: var(--muted); font-size: 16px; }

        .s-lang-desc {
          font-size: 12px;
          color: var(--muted);
          font-family: 'JetBrains Mono', monospace;
          margin-bottom: 14px;
          line-height: 1.5;
        }

        .lang-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
        .lang-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: transparent;
          cursor: pointer;
          transition: all 0.15s;
          font-family: 'Manrope', sans-serif;
          text-align: left;
          width: 100%;
        }
        .lang-item:hover { background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.12); }
        .lang-item.selected { border-color: rgba(232,83,42,0.4); background: rgba(232,83,42,0.07); }
        .lang-flag { font-size: 18px; line-height: 1; flex-shrink: 0; }
        .lang-info { flex: 1; }
        .lang-name { font-size: 13px; font-weight: 600; color: var(--text); display: block; letter-spacing: 0.3px; }
        .lang-native { font-size: 11px; color: var(--muted); display: block; margin-top: 1px; font-family: 'JetBrains Mono', monospace; }
        .lang-dot {
          width: 18px; height: 18px; border-radius: 50%;
          border: 1.5px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; color: transparent; transition: all 0.15s;
        }
        .lang-item.selected .lang-dot { background: var(--accent); border-color: var(--accent); color: #fff; }
        .lang-dot svg { width: 10px; height: 10px; }

        .lang-save-btn {
          display: flex; align-items: center; justify-content: center; gap: 7px;
          padding: 10px; border-radius: 8px; border: none;
          background: var(--accent); color: #fff;
          font-family: 'Manrope', sans-serif; font-size: 13px;
          font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
          cursor: pointer; transition: all 0.2s; width: 100%;
        }
        .lang-save-btn:hover { background: var(--accent2); transform: translateY(-1px); }
        .lang-save-btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }
        .lang-save-btn svg { width: 14px; height: 14px; }

        .lang-saved {
          display: flex; align-items: center; justify-content: center;
          gap: 6px; margin-top: 10px; font-size: 12px;
          font-family: 'JetBrains Mono', monospace;
          color: var(--green); letter-spacing: 0.5px;
          animation: fadeUp 0.2s ease;
        }
        .lang-saved svg { width: 12px; height: 12px; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ─── BETA MODAL ─── */
        .beta-modal {
          background: var(--surface);
          border: 1px solid rgba(232,83,42,0.25);
          border-radius: 16px;
          width: 100%; max-width: 380px;
          padding: 36px 32px 28px;
          display: flex; flex-direction: column;
          align-items: center; text-align: center; gap: 12px;
        }
        .beta-modal-icon {
          width: 54px; height: 54px; border-radius: 14px;
          background: rgba(232,83,42,0.1);
          border: 1px solid rgba(232,83,42,0.25);
          display: flex; align-items: center; justify-content: center;
          color: var(--accent); margin-bottom: 4px;
        }
        .beta-modal-icon svg { width: 24px; height: 24px; }
        .beta-modal-tag {
          font-size: 10px; font-family: 'JetBrains Mono', monospace;
          letter-spacing: 3px; color: var(--accent);
          background: rgba(232,83,42,0.1);
          border: 1px solid rgba(232,83,42,0.25);
          border-radius: 4px; padding: 3px 10px; font-weight: 600;
        }
        .beta-modal-title { font-size: 18px; font-weight: 700; color: var(--text); letter-spacing: 0.5px; }
        .beta-modal-desc { font-size: 13px; color: var(--muted); line-height: 1.7; max-width: 280px; }
        .beta-modal-btn {
          display: flex; align-items: center; gap: 7px;
          margin-top: 8px; padding: 10px 24px; border-radius: 8px;
          border: 1px solid var(--border); background: var(--head-btn-color);
          color: var(--muted); font-family: 'Manrope', sans-serif;
          font-size: 13px; font-weight: 600; cursor: pointer;
          transition: all 0.2s; letter-spacing: 0.5px;
        }
        .beta-modal-btn svg { width: 13px; height: 13px; }
        .beta-modal-btn:hover { color: var(--text); border-color: rgba(255,255,255,0.15); }
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
            <button className="nav-item" onClick={() => navigate('/adm')}>
              <IconProducts /> {t('admin.sidebar.products')}
            </button>
            <button className="nav-item" onClick={()=> navigate("/adm/orders")}>
              <IconAnalytics /> {t('admin.sidebar.analytics')}
            </button>
            <button className="nav-item active">
              <IconSettings /> {t('admin.sidebar.settings')}
            </button>
          </nav>

          <div className="sidebar-logout">
            <button className="logout-btn" onClick={()=> navigate('/')}>
              <IconLogout /> {t('admin.sidebar.logout')}
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="main">
          <div className="topbar">
            <span className="topbar-title">{t('admin.sidebar.settings')}</span>
            <div className="topbar-right">
              <div className="topbar-stat">
                {t('settings.title')}: <span>1.0.0</span>
              </div>
            </div>
          </div>

          <div className="content">
            <div className="settings-grid">

              {/* ── Profile Card ── */}
              <div className="s-card">
                <div className="s-card-header">
                  <span className="s-card-title">{t('profile.title')}</span>
                  <div className="s-card-icon"><IconUser /></div>
                </div>
                <div className="s-card-body">
                  <div className="profile-center">
                    <div className="profile-avatar-lg">A</div>
                    <div className="profile-name-lg">Admin</div>
                    <span className="profile-badge">{t('admin.profile.prof')}</span>
                  </div>

                  <div className="field-stack">
                    <div className="s-field">
                      <label className="s-label"><IconUser /> {t('profile.name')}</label>
                      <input className="s-input" value="Admin" disabled readOnly />
                    </div>
                    <div className="s-field">
                      <label className="s-label"><IconMail /> {t('profile.email')}</label>
                      <input className="s-input" value="admin@gamepc.uz" disabled readOnly />
                    </div>
                    <div className="s-field">
                      <label className="s-label"><IconLock /> {t('profile.password')}</label>
                      <input className="s-input" type="password" value="••••••••" disabled readOnly />
                    </div>
                  </div>

                  <div className="beta-banner" onClick={() => setShowBeta(true)}>
                    <div className="beta-banner-icon"><IconFlask /></div>
                    <div className="beta-banner-text">
                      <span className="beta-banner-tag">BETA TEST</span>
                      <span className="beta-banner-desc">{t('settings.label')}</span>
                    </div>
                    <span className="beta-banner-arrow">›</span>
                  </div>
                </div>
              </div>

              {/* ── Language Card ── */}
              <div className="s-card">
                <div className="s-card-header">
                  <span className="s-card-title">{t('settings.language')}</span>
                  <div className="s-card-icon"><IconGlobe /></div>
                </div>
                <div className="s-card-body">
                  <p className="s-lang-desc">{t('settings.lang_desc')}</p>
                  <div className="lang-list">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        className={`lang-item ${pendingLang === lang.code ? 'selected' : ''}`}
                        onClick={() => setPendingLang(lang.code)}
                      >
                        <span className="lang-flag">{lang.flag}</span>
                        <div className="lang-info">
                          <span className="lang-name">{lang.label}</span>
                          <span className="lang-native">{lang.native}</span>
                        </div>
                        <div className="lang-dot">
                          {pendingLang === lang.code && <IconCheck />}
                        </div>
                      </button>
                    ))}
                  </div>

                  <button
                    className="lang-save-btn"
                    onClick={handleLangSave}
                    disabled={pendingLang === (i18n.language?.slice(0, 2) || 'ru')}
                  >
                    <IconCheck /> {t('profile.save')}
                  </button>

                  {langSaved && (
                    <div className="lang-saved">
                      <IconCheck /> {t('settings.saved')}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {showBeta && <BetaAlert t={t} onClose={() => setShowBeta(false)} />}
    </>
  )
}

export default SettingsPage