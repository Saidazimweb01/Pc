import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
// import Default from './pages/defaultPage/Default'
import LoginPage from './pages/loginPage/LoginPage'
import DashboardPage from './pages/dashboardPage/DashboardPage'
import HomePage from './pages/homePage/HomePage'
import DetailsPage from './pages/detailsPage/DetailsPage'
import CategoriesDetail from './pages/categoriesDetail/CategoriesDetail'
import ScrollToTop from './ScrollToTop'
import Basket from './pages/basket/Basket'
import Search from './pages/search/Search'
import Create from './pages/create/Create'
// import Settings from './pages/Settings/Settings'
import Profile from './pages/settings/Settings'
import SettingsPage from './pages/dashboardSettings/DashboardSettings'
import Orders from './pages/orders/Orders'
import UserOrders from './pages/statusOrders/UserOrders'
import HeroImages from './pages/heroimages/HeroImages'
import AccessoriesPage from './pages/categoriesDetail/accessPage/AccessPage'
// import BrandsPage from './pages/brands/BrandsPage'


function App() {
  return (
    <>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path='/' element={
            <HomePage />
          } />
          <Route path='/login' element={
            <LoginPage />
          } />
          <Route path='/adm' element={
            <DashboardPage />
          } />
          <Route path='/adm/create' element={
            <Create />
          } />
          <Route path='/details/:id' element={
            <DetailsPage />
          } />
            <Route path='/category/access' element={
            <AccessoriesPage />
          } />
          <Route path='/categories/:category' element={
            <CategoriesDetail />
          } />
          <Route path='/basketItems' element={
            <Basket />
          } />
          <Route path='/search' element={
            <Search />
          } />
          <Route path='/adm/hero' element={
            <HeroImages />
          } />
        

          <Route path="/settings" element={<Profile />} />
          <Route path="/adm/settings" element={<SettingsPage />} />
          <Route path="/adm/orders" element={<Orders />} />
          <Route path="/my-orders-status" element={<UserOrders />} />

        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App