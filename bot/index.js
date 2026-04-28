import TelegramBot from "node-telegram-bot-api"
import dotenv from "dotenv"
import { supabase } from "./supabase.js"

dotenv.config()

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true })
console.log("✅ BOT STARTED")

// ── /start PHONE bilan kelsa ──────────────────────────────
bot.onText(/\/start (.+)/, async (msg, match) => {
    const chatId   = msg.chat.id
    const phoneRaw = match[1]
    const phone    = decodeURIComponent(phoneRaw).replace(/\D/g, '')

    console.log(`📲 /start from chatId=${chatId}, phone=${phone}`)

    if (!phone || phone.length < 9) {
        return bot.sendMessage(chatId, "❌ Telefon raqam noto'g'ri. Saytdan qayta urinib ko'ring.")
    }

    try {
        // 1. Eski kodni o'chirish
        const { error: delErr } = await supabase
            .from("otp_codes")
            .delete()
            .eq("phone", phone)

        if (delErr) console.warn("Delete warn:", delErr.message)

        // 2. Yangi kod generate
        const code = String(Math.floor(1000 + Math.random() * 9000))
        console.log(`🔐 Generated code: ${code} for phone: ${phone}`)

        // 3. Kodni Supabase ga saqlash
        const { data: inserted, error: insertErr } = await supabase
            .from("otp_codes")
            .insert({ phone, code, chat_id: String(chatId) })
            .select()

        if (insertErr) {
            console.error("❌ Insert error:", JSON.stringify(insertErr))
            return bot.sendMessage(chatId,
                `❌ Server xatosi: ${insertErr.message}\n\nAdmin bilan bog'laning.`
            )
        }

        console.log("✅ OTP inserted:", inserted)

        // 4. Kodni userga yuborish
        await bot.sendMessage(
            chatId,
            `🔐 *Login kodi:*\n\n` +
            `\`${code}\`\n\n` +
            `⏰ 5 daqiqa davomida amal qiladi.\n` +
            `🌐 Kodni saytga kiriting.`,
            { parse_mode: "Markdown" }
        )

    } catch (err) {
        console.error("❌ Unexpected error:", err)
        bot.sendMessage(chatId, "❌ Kutilmagan xato yuz berdi. Qayta urinib ko'ring.")
    }
})

// ── /start parametrsiz ───────────────────────────────────
bot.onText(/^\/start$/, (msg) => {
    bot.sendMessage(
        msg.chat.id,
        "👋 *Hush kelibsiz!*\n\n" +
        "Bu bot GamePC saytiga kirish uchun.\n\n" +
        "📲 Saytdagi *«Telegram orqali kirish»* tugmasini bosing.",
        { parse_mode: "Markdown" }
    )
})