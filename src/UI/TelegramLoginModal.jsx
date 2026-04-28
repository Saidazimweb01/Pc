import React, { useState, useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { setUserId } from '../app/features/AuthSlice'

// ── Styles ────────────────────────────────────────────────
const STYLES = `
.tg-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(10px);
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    animation: tgFadeIn 0.2s ease;
}
.tg-modal {
    width: 100%; max-width: 400px;
    background: #18181b;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 22px;
    overflow: hidden;
    box-shadow: 0 32px 100px rgba(0,0,0,0.6);
    animation: tgScaleIn 0.22s cubic-bezier(0.34,1.56,0.64,1);
}
.tg-header {
    padding: 28px 28px 20px;
    text-align: center;
    border-bottom: 1px solid rgba(255,255,255,0.06);
}
.tg-logo {
    width: 56px; height: 56px; border-radius: 16px;
    background: linear-gradient(135deg, #2AABEE, #1e8fd5);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 14px; font-size: 26px;
    box-shadow: 0 8px 24px rgba(42,171,238,0.3);
}
.tg-title {
    font-size: 17px; font-weight: 800;
    color: #fff; margin-bottom: 6px; letter-spacing: -0.3px;
}
.tg-sub {
    font-size: 13px; color: rgba(255,255,255,0.4);
    line-height: 1.5;
}
.tg-body { padding: 24px 28px 28px; }

/* Steps */
.tg-steps {
    display: flex; gap: 0;
    margin-bottom: 24px;
    background: rgba(255,255,255,0.04);
    border-radius: 10px; padding: 4px;
}
.tg-step-item {
    flex: 1; text-align: center;
    padding: 7px 6px; border-radius: 7px;
    font-size: 11px; font-weight: 600;
    color: rgba(255,255,255,0.25);
    transition: all 0.2s;
    letter-spacing: 0.3px;
}
.tg-step-item.active {
    background: rgba(42,171,238,0.15);
    color: #2AABEE;
}
.tg-step-item.done {
    color: rgba(46,204,113,0.7);
}

/* Input */
.tg-label {
    font-size: 11px; font-weight: 600; letter-spacing: 1.5px;
    text-transform: uppercase; color: rgba(255,255,255,0.3);
    margin-bottom: 8px;
}
.tg-input {
    width: 100%; background: rgba(255,255,255,0.05);
    border: 1.5px solid rgba(255,255,255,0.08);
    border-radius: 12px; padding: 13px 16px;
    color: #fff; font-size: 15px; font-weight: 500;
    outline: none; transition: border-color 0.15s;
    font-family: inherit; letter-spacing: 0.5px;
    box-sizing: border-box;
}
.tg-input:focus { border-color: rgba(42,171,238,0.5); }
.tg-input.error { border-color: rgba(231,76,60,0.5); }
.tg-input-hint {
    font-size: 12px; color: rgba(255,255,255,0.25);
    margin-top: 7px; line-height: 1.5;
}

/* OTP inputs */
.tg-otp-wrap {
    display: flex; gap: 10px; justify-content: center;
    margin-bottom: 4px;
}
.tg-otp-input {
    width: 58px; height: 64px;
    background: rgba(255,255,255,0.05);
    border: 1.5px solid rgba(255,255,255,0.1);
    border-radius: 14px; text-align: center;
    color: #fff; font-size: 24px; font-weight: 800;
    outline: none; transition: all 0.15s;
    font-family: 'JetBrains Mono', monospace;
    box-sizing: border-box;
}
.tg-otp-input:focus {
    border-color: rgba(42,171,238,0.6);
    background: rgba(42,171,238,0.06);
    transform: scale(1.04);
}
.tg-otp-input.filled {
    border-color: rgba(42,171,238,0.4);
    background: rgba(42,171,238,0.08);
    color: #2AABEE;
}
.tg-otp-input.error {
    border-color: rgba(231,76,60,0.5);
    background: rgba(231,76,60,0.06);
}

/* Buttons */
.tg-btn {
    width: 100%; padding: 14px;
    border-radius: 13px; border: none;
    font-family: inherit; font-size: 14px; font-weight: 700;
    cursor: pointer; transition: all 0.15s; letter-spacing: 0.3px;
    display: flex; align-items: center; justify-content: center; gap: 8px;
}
.tg-btn.primary {
    background: linear-gradient(135deg, #2AABEE, #1e8fd5);
    color: #fff;
    box-shadow: 0 4px 20px rgba(42,171,238,0.3);
}
.tg-btn.primary:hover { opacity: 0.88; transform: translateY(-1px); }
.tg-btn.primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
.tg-btn.secondary {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.5); margin-top: 8px;
    font-size: 13px;
}
.tg-btn.secondary:hover { color: #fff; background: rgba(255,255,255,0.08); }

/* Telegram link btn */
.tg-link-btn {
    width: 100%; padding: 14px;
    border-radius: 13px; border: none;
    background: linear-gradient(135deg, #2AABEE, #1e8fd5);
    color: #fff; font-family: inherit; font-size: 14px;
    font-weight: 700; cursor: pointer; text-decoration: none;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    box-shadow: 0 4px 20px rgba(42,171,238,0.3);
    transition: all 0.15s; letter-spacing: 0.3px;
}
.tg-link-btn:hover { opacity: 0.88; transform: translateY(-1px); }

/* Error / success */
.tg-error {
    background: rgba(231,76,60,0.1);
    border: 1px solid rgba(231,76,60,0.25);
    border-radius: 10px; padding: 10px 14px;
    font-size: 13px; color: #ff7675;
    margin-bottom: 14px; text-align: center;
}
.tg-success {
    text-align: center; padding: 8px 0 4px;
}
.tg-success-icon {
    font-size: 44px; margin-bottom: 12px; display: block;
}
.tg-success-title {
    font-size: 17px; font-weight: 800; color: #7CFFB2; margin-bottom: 6px;
}
.tg-success-sub {
    font-size: 13px; color: rgba(255,255,255,0.4); line-height: 1.5;
}

/* Waiting */
.tg-waiting {
    text-align: center; padding: 8px 0;
}
.tg-waiting-icon {
    font-size: 36px; margin-bottom: 10px; display: block;
    animation: tgPulse 1.5s ease-in-out infinite;
}
.tg-waiting-title {
    font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 6px;
}
.tg-waiting-sub {
    font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 4px;
}
.tg-waiting-phone {
    font-size: 14px; font-weight: 700; color: #2AABEE;
    font-family: 'JetBrains Mono', monospace;
}

/* Timer */
.tg-timer {
    font-size: 12px; color: rgba(255,255,255,0.3);
    text-align: center; margin-top: 8px;
}
.tg-timer span { color: #2AABEE; font-weight: 700; }

@keyframes tgFadeIn { from{opacity:0} to{opacity:1} }
@keyframes tgScaleIn { from{transform:scale(0.94);opacity:0} to{transform:scale(1);opacity:1} }
@keyframes tgPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
`

// ── OTP Input Component ───────────────────────────────────
function OtpInput({ value, onChange, hasError }) {
    const digits = (value + '    ').slice(0, 4).split('')
    const refs   = [useRef(), useRef(), useRef(), useRef()]

    const handleKey = (i, e) => {
        if (e.key === 'Backspace') {
            const arr = value.split('')
            arr[i] = ''
            const next = arr.join('').replace(/ /g, '')
            onChange(next)
            if (i > 0) refs[i - 1].current?.focus()
            return
        }
        if (!/^\d$/.test(e.key)) return
        const arr = value.padEnd(4, ' ').split('')
        arr[i] = e.key
        const next = arr.join('').replace(/ /g, '')
        onChange(next)
        if (i < 3) refs[i + 1].current?.focus()
    }

    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
        onChange(pasted)
        if (pasted.length === 4) refs[3].current?.focus()
        e.preventDefault()
    }

    return (
        <div className="tg-otp-wrap">
            {digits.map((d, i) => (
                <input
                    key={i}
                    ref={refs[i]}
                    className={`tg-otp-input ${d.trim() ? 'filled' : ''} ${hasError ? 'error' : ''}`}
                    type="text" inputMode="numeric"
                    maxLength={1}
                    value={d.trim()}
                    onChange={() => {}}
                    onKeyDown={e => handleKey(i, e)}
                    onPaste={handlePaste}
                    onFocus={() => refs[i].current?.select()}
                    autoFocus={i === 0}
                />
            ))}
        </div>
    )
}

// ── Main Modal ────────────────────────────────────────────
const BOT_USERNAME = 'pcshCheck_bot'
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY

function TelegramLoginModal({ open, onClose, onSuccess }) {
    const dispatch = useDispatch()
    const [step,  setStep]  = useState(1) // 1=phone, 2=telegram, 3=otp, 4=success
    const [phone, setPhone] = useState('')
    const [otp,   setOtp]   = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [timer, setTimer] = useState(0)

    // Countdown timer
    useEffect(() => {
        if (timer <= 0) return
        const iv = setInterval(() => setTimer(t => t - 1), 1000)
        return () => clearInterval(iv)
    }, [timer])

    const reset = () => {
        setStep(1); setPhone(''); setOtp('')
        setError(''); setLoading(false); setTimer(0)
    }

    const handleClose = () => { reset(); onClose() }

    // Step 1 → 2: telefon raqamini tekshir va Telegram ga yo'nalt
    const handlePhoneNext = () => {
        setError('')
        const clean = phone.replace(/\D/g, '')
        if (clean.length < 9) {
            setError("To'liq telefon raqam kiriting")
            return
        }
        // Telegram botga o'tish — phone raqamini start parametrida yuboramiz
        const encoded = encodeURIComponent(clean)
        const tgLink  = `https://t.me/${BOT_USERNAME}?start=${encoded}`
        window.open(tgLink, '_blank')
        setStep(2)
        setTimer(120) // 2 daqiqa kutish
    }

    // Step 2 → 3: kod qo'lda kiritishga o'tish
    const handleGoToCode = () => {
        setStep(3)
        setOtp('')
        setError('')
    }

    // Step 3: kodni Supabase orqali tekshirish
    const handleVerify = async () => {
        if (otp.length < 4) { setError("4 raqamli kodni to'liq kiriting"); return }
        setError(''); setLoading(true)
        try {
            // Bot phone ni "998..." formatda saqlaydi (+ va boshqa belgilarsiz)
            const clean = phone.replace(/\D/g, '')  // "+998 90..." → "99890..."
            // Supabase otp_codes jadvalidan tekshirish
            const res = await fetch(
                `${SUPABASE_URL}/rest/v1/otp_codes?phone=eq.${encodeURIComponent(clean)}&code=eq.${otp}&select=*`,
                {
                    headers: {
                        apikey: SUPABASE_KEY,
                        Authorization: `Bearer ${SUPABASE_KEY}`,
                    }
                }
            )
            const rows = await res.json()

            if (!rows || rows.length === 0) {
                setError('Kod noto\'g\'ri yoki muddati o\'tgan')
                setOtp('')
                return
            }

            const row = rows[0]

            // Muddatini tekshirish (5 daqiqa)
            const created = new Date(row.created_at)
            const now     = new Date()
            const diff    = (now - created) / 1000 / 60 // minutes
            if (diff > 5) {
                setError('Kod muddati o\'tgan. Qayta urinib ko\'ring.')
                setOtp('')
                // Eski kodni o'chirish
                await fetch(`${SUPABASE_URL}/rest/v1/otp_codes?id=eq.${row.id}`, {
                    method: 'DELETE',
                    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
                })
                return
            }

            // Kodni o'chirish (bir martalik)
            await fetch(`${SUPABASE_URL}/rest/v1/otp_codes?id=eq.${row.id}`, {
                method: 'DELETE',
                headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
            })

            // Users jadvalidan user olish (topilmasa ham davom etamiz)
            let user = null
            try {
                const userRes = await fetch(
                    `${SUPABASE_URL}/rest/v1/users?phone=eq.${encodeURIComponent(clean)}&select=*`,
                    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
                )
                const users = await userRes.json()
                user = users?.[0] || null
            } catch (_) {}

            // userId ni Redux ga saqlash — null bo'lsa ham (orders da null yuboriladi)
            const userId = user?.id || null
            dispatch(setUserId(userId))
            localStorage.setItem('user_id', userId || '')

            // localStorage ga saqlash — ikki key da (Modal va UserOrders bir xil o'qisin)
            localStorage.setItem('order_phone', clean)
            localStorage.setItem('order_name',  user?.name || '')
            localStorage.setItem('user_phone',  clean)
            localStorage.setItem('user_name',   user?.name || '')
            localStorage.setItem('has_ordered', '1')

            setStep(4)
            if (onSuccess) onSuccess({ ...user, phone: clean })

        } catch (err) {
            console.error('Verify error:', err)
            setError('Xatolik yuz berdi. Qayta urinib ko\'ring.')
        } finally {
            setLoading(false)
        }
    }

    if (!open) return null

    const stepLabels = ['Telefon', 'Telegram', 'Kod', 'Tayyor']

    return (
        <>
            <style>{STYLES}</style>
            <div className="tg-overlay" onClick={handleClose}>
                <div className="tg-modal" onClick={e => e.stopPropagation()}>

                    {/* Header */}
                    <div className="tg-header">
                        <div className="tg-logo">✈️</div>
                        <div className="tg-title">Telegram orqali kirish</div>
                        <div className="tg-sub">Tezkor va xavfsiz kirish usuli</div>
                    </div>

                    <div className="tg-body">
                        {/* Step indicator */}
                        <div className="tg-steps">
                            {stepLabels.map((label, i) => (
                                <div key={i} className={`tg-step-item ${step === i+1 ? 'active' : step > i+1 ? 'done' : ''}`}>
                                    {step > i+1 ? '✓ ' : ''}{label}
                                </div>
                            ))}
                        </div>

                        {/* ── Step 1: Telefon ── */}
                        {step === 1 && (
                            <>
                                <div className="tg-label">Telefon raqamingiz</div>
                                <input
                                    className={`tg-input ${error ? 'error' : ''}`}
                                    type="tel"
                                    placeholder="+998 90 123 45 67"
                                    value={phone}
                                    onChange={e => { setPhone(e.target.value); setError('') }}
                                    onKeyDown={e => e.key === 'Enter' && handlePhoneNext()}
                                    autoFocus
                                />
                                <div className="tg-input-hint">
                                    Buyurtmalaringizni kuzatish uchun telefon raqamingizni kiriting
                                </div>
                                {error && <div className="tg-error" style={{ marginTop: 12 }}>{error}</div>}
                                <button className="tg-btn primary" onClick={handlePhoneNext} style={{ marginTop: 18 }}>
                                    ✈️ Telegram orqali davom etish
                                </button>
                                <button className="tg-btn secondary" onClick={handleClose}>
                                    Bekor qilish
                                </button>
                            </>
                        )}

                        {/* ── Step 2: Telegram ga o'tish ── */}
                        {step === 2 && (
                            <>
                                <div className="tg-waiting">
                                    <span className="tg-waiting-icon">📱</span>
                                    <div className="tg-waiting-title">Telegram botga o'ting</div>
                                    <div className="tg-waiting-sub">
                                        Bot sizga 4 raqamli kod yuboradi
                                    </div>
                                    <div className="tg-waiting-phone">{phone}</div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
                                    <ol style={{ paddingLeft: 20, color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 2 }}>
                                        <li>Telegram botni oching</li>
                                        <li><strong style={{ color: 'rgba(255,255,255,0.7)' }}>«Kontakt yuborish»</strong> tugmasini bosing</li>
                                        <li>Bot sizga <strong style={{ color: '#2AABEE' }}>4 raqamli kod</strong> yuboradi</li>
                                        <li>Kodni bu yerga kiriting</li>
                                    </ol>

                                    <a
                                        href={`https://t.me/${BOT_USERNAME}?start=${encodeURIComponent(phone.replace(/\D/g, ''))}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="tg-link-btn"
                                    >
                                        ✈️ @{BOT_USERNAME} ni ochish
                                    </a>

                                    <button className="tg-btn primary" onClick={handleGoToCode}>
                                        Kodni oldim →
                                    </button>

                                    {timer > 0 && (
                                        <div className="tg-timer">
                                            Qayta yuborish: <span>{Math.floor(timer/60)}:{String(timer%60).padStart(2,'0')}</span>
                                        </div>
                                    )}
                                    <button className="tg-btn secondary" onClick={() => setStep(1)}>
                                        ← Orqaga
                                    </button>
                                </div>
                            </>
                        )}

                        {/* ── Step 3: OTP kiriting ── */}
                        {step === 3 && (
                            <>
                                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
                                        Telegram botdan kelgan kodni kiriting
                                    </div>
                                    <div style={{ fontSize: 13, color: '#2AABEE', fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>
                                        {phone}
                                    </div>
                                </div>

                                {error && <div className="tg-error">{error}</div>}

                                <OtpInput value={otp} onChange={setOtp} hasError={!!error} />

                                <div className="tg-input-hint" style={{ textAlign: 'center', marginTop: 10 }}>
                                    Kod 5 daqiqa davomida amal qiladi
                                </div>

                                <button
                                    className="tg-btn primary"
                                    onClick={handleVerify}
                                    disabled={otp.length < 4 || loading}
                                    style={{ marginTop: 18 }}
                                >
                                    {loading ? '⏳ Tekshirilmoqda...' : '✓ Tasdiqlash'}
                                </button>
                                <button className="tg-btn secondary" onClick={() => setStep(2)}>
                                    ← Orqaga
                                </button>
                            </>
                        )}

                        {/* ── Step 4: Muvaffaqiyat ── */}
                        {step === 4 && (
                            <>
                                <div className="tg-success">
                                    <span className="tg-success-icon">✅</span>
                                    <div className="tg-success-title">Muvaffaqiyatli kirdingiz!</div>
                                    <div className="tg-success-sub">
                                        Endi zakazlaringizni kuzatishingiz mumkin
                                    </div>
                                </div>
                                <button className="tg-btn primary" onClick={handleClose} style={{ marginTop: 20 }}>
                                    Davom etish →
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default TelegramLoginModal