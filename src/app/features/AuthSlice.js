import { createSlice } from "@reduxjs/toolkit"

function stripForStorage(item) {
    return {
        id: item.id,
        name: item.name,
        name_uz: item.name_uz ?? item.name,
        name_ru: item.name_ru ?? item.name,
        name_en: item.name_en ?? item.name,
        price: item.price,
        category: item.category,
        quantity: item.quantity ?? 1,
        status: item.status,
        desc: item.desc,
        imgs: (item.imgs ?? []).filter(url => url && !url.startsWith('data:')),
        options: item.options ?? [],
        selectedRam: item.selectedRam ?? null,
        selectedSsd: item.selectedSsd ?? null,
    }
}

const initialState = {
    userId: localStorage.getItem("user_id") || null,
    basketList: (JSON.parse(localStorage.getItem("basket_list")) || []).map(item => ({
        ...item,
        quantity: item.quantity ?? 1,
        selectedRam: item.selectedRam ?? null,
        selectedSsd: item.selectedSsd ?? null,
    }))
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        addBasket: (state, action) => {
            const item = stripForStorage(action.payload.basketList)
            const existing = state.basketList.find(el => el.id === item.id)
            if (existing) {
                existing.quantity = (existing.quantity ?? 1) + 1
            } else {
                state.basketList.push(item)
            }
            localStorage.setItem("basket_list", JSON.stringify(state.basketList))
        },
        removeBasket: (state, action) => {
            const existing = state.basketList.find(el => el.id === action.payload)
            if (existing) {
                if (existing.quantity > 1) {
                    existing.quantity -= 1
                } else {
                    state.basketList = state.basketList.filter(el => el.id !== action.payload)
                }
            }
            localStorage.setItem("basket_list", JSON.stringify(state.basketList))
        },
        deleteBasket: (state, action) => {
            state.basketList = state.basketList.filter(el => el.id !== action.payload)
            localStorage.setItem("basket_list", JSON.stringify(state.basketList))
        },
        clearBasket: (state) => {
            state.basketList = []
            localStorage.setItem("basket_list", JSON.stringify([]))  // ← to'g'irlandi
        },
        setUserId: (state, action) => {
            state.userId = action.payload
        }
    }
})

export const { addBasket, removeBasket, deleteBasket, clearBasket, setUserId } = authSlice.actions
export default authSlice.reducer