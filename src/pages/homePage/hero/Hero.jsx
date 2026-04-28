import React, { useState, useEffect, useRef } from 'react'
import "./Hero.css"
import pcImage1 from "../../../images/pc-image1.jpg"
import pcImage2 from "../../../images/pc-image2.jpg"
import pcImage3 from "../../../images/pc-image3.jpg"
import pcImage4 from "../../../images/pc-image4.jpg"
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useGetHeroImagesQuery } from '../../../app/services/pcApi'


function Hero() {
  const { data: heroImages = [], isLoading } = useGetHeroImagesQuery()
  const images = heroImages
  .filter(img => img.active)
  .sort((a, b) => a.order - b.order)
  .map(img => img.url)
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const [prev, setPrev] = useState(null)
  const [fading, setFading] = useState(false)
  const [progKey, setProgKey] = useState(0)
  const lockRef = useRef(false)

  // Auto-advance every 2.5 s
useEffect(() => {
  if (!images.length) return
  const id = setInterval(goToNext, 2500)
  return () => clearInterval(id)
}, [current, images.length])

  const goTo = (index) => {
    if (index === current || lockRef.current) return
    lockRef.current = true
    setPrev(current)
    setFading(true)
    setProgKey(k => k + 1)
    setTimeout(() => {
      setCurrent(index)
      setPrev(null)
      setFading(false)
      lockRef.current = false
    }, 900)
  }

  const goToNext = () => goTo((current + 1) % images.length)
  const goToPrev = () => goTo((current - 1 + images.length) % images.length)

  return (
    <section className="showcase">

      {/* ── Background layers ── */}
      {prev !== null && (
        <div
          className="showcase__slide showcase__slide--behind"
          style={{ backgroundImage: `url(${images[prev]})` }}
        />
      )}
      <div
        className={`showcase__slide showcase__slide--front ${fading ? 'showcase__slide--entering' : ''
          }`}
        style={{ backgroundImage: `url(${images[current]})` }}
      />

      {/* ── Cinematic veil ── */}
      <div className="showcase__veil" />

      {/* ── Slide counter ── */}
      <div className="showcase__counter">
        <span className="showcase__counter-current">
          {String(current + 1).padStart(2, '0')}
        </span>
        <span>/</span>
        <span>{String(images.length).padStart(2, '0')}</span>
      </div>

      {/* ── Content ── */}
      <div className="showcase__body">

        <h1 className="showcase__heading">
          Your<span>Shop</span>
        </h1>
        <p className="showcase__sub">
          {t("home.performance")} · {t("home.power")} · {t("home.precision")}
        </p>
        <button className="showcase__cta" onClick={() => navigate("/search?models")}>
          {t("home.view_models")}
          <span className="showcase__cta-arrow">→</span>
        </button>
      </div>

      {/* ── Arrows ── */}
      <button className="showcase__nav showcase__nav--prev" onClick={goToPrev}>
        &#8592;
      </button>
      <button className="showcase__nav showcase__nav--next" onClick={goToNext}>
        &#8594;
      </button>

      {/* ── Vertical dots ── */}
      <div className="showcase__dots">
        {images.map((_, i) => (
          <button
            key={i}
            className={`showcase__dot ${i === current ? 'showcase__dot--on' : ''}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

      {/* ── Progress bar ── */}
      <div className="showcase__progress">
        <div key={progKey} className="showcase__progress-fill" />
      </div>

    </section>
  )
}

export default Hero