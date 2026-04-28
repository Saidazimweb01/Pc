import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

// ─── Supabase client (Storage uchun) ─────────────────────
export const supabase = createClient(supabaseUrl, supabaseKey)
export const BUCKET = import.meta.env.VITE_SUPABASE_BUCKET ?? 'product-images'

// ─── RTK Query API ────────────────────────────────────────
export const pcApi = createApi({
    reducerPath: "pcApi",
    baseQuery: fetchBaseQuery({
        baseUrl: supabaseUrl,
        prepareHeaders: (headers) => {
            headers.set("apikey", supabaseKey)
            headers.set("Authorization", `Bearer ${supabaseKey}`)
            headers.set("Content-Type", "application/json")
            return headers
        },
    }),

    tagTypes: ["Products"],
    endpoints: (builder) => ({
        getProducts: builder.query({
            query: () => "/rest/v1/pcs",
            providesTags: ["Products"]
        }),
        detailProduct: builder.query({
            query: (id) => `/rest/v1/pcs?id=eq.${id}`,
            providesTags: ["Products"]
        }),
        createProduct: builder.mutation({
            query: (data) => ({
                url: '/rest/v1/pcs',
                method: "POST",
                body: data,
                headers: { Prefer: "return=minimal" }
            }),
            invalidatesTags: ["Products"]
        }),
        login: builder.mutation({
            query: (data) => ({
                url: "/rest/v1/login",
                method: "post",
                body: data
            })
        }),
        loginUp: builder.mutation({
            query: (data) => ({
                url: "/rest/v1/signup",
                method: "post",
                body: data
            })
        }),
        getOrders: builder.query({
            query: () => ({ url: "/rest/v1/orders", method: "GET" }),
            providesTags: ['Orders']   // ← shu qo'shildi
        }),
        getHeroImages: builder.query({
            query: () => "/rest/v1/hero_images?select=*",
            providesTags: ["HeroImages"]
        }),
        createOrder: builder.mutation({
            query: (data) => ({
                url: "/rest/v1/orders",
                method: "POST",
                body: data,
                headers: {
                    // return=representation → 201 + body qaytaradi (unwrap ishlaydi)
                    // return=minimal → 204 + body yo'q (unwrap xato deydi)
                    Prefer: "return=representation"
                }
            }),
            invalidatesTags: ["Orders"]


        }),
        updateProduct: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/rest/v1/pcs?id=eq.${id}`,
                method: 'PATCH',
                body: data,
                headers: { Prefer: 'return=minimal' }
            }),
            invalidatesTags: ['Products']
        }),

        updateOrder: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/rest/v1/orders?id=eq.${id}`,
                method: 'PATCH',
                body: data,
                headers: { Prefer: 'return=minimal' }
            }),
            invalidatesTags: ['Orders']  // agar Orders tag qo'shsangiz
        }),

        // getOrders ga ham tag qo'shing:

        deleteOrder: builder.mutation({
            query: (id) => ({
                url: `/rest/v1/orders?id=eq.${id}`,
                method: 'DELETE',
                headers: { Prefer: 'return=minimal' }
            }),
            invalidatesTags: ['Orders']
        }),
    }),
})

export const {
    useGetProductsQuery,
    useDetailProductQuery,
    useCreateProductMutation,
    useLoginMutation,
    useLoginUpMutation,
    useGetOrdersQuery,
    useCreateOrderMutation,
    useUpdateProductMutation,
    useUpdateOrderMutation,
    useDeleteOrderMutation,
    useGetHeroImagesQuery
} = pcApi