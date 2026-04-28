import React from 'react'
import Header from './header/Header'
import Hero from './hero/Hero'
import MainCatalog from './mainCatalog/MainCatalog'
import NewArrivlas from './newArrivals/NewArrivals'
import Brands from './brands/Brands'
import Footer from './footer/Footer'

function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <MainCatalog />
        <NewArrivlas />
        <Brands/>
      </main>
      <Footer/>
    </>

  )
}

export default HomePage