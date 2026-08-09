from telegram import (
    Update,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    KeyboardButton,
    ReplyKeyboardMarkup,
    ReplyKeyboardRemove,
    WebAppInfo
)

from telegram.ext import (
    Application,
    CommandHandler,
    CallbackQueryHandler,
    ContextTypes,
    MessageHandler,
    filters
)


TOKEN = "8989958927:AAFTI6ClS_XgqLEkNg599bMTBgZI-2BQklA"
WEBAPP_URL = "https://getachew-fikadu-jirata.vercel.app"



# =========================
# START COMMAND
# =========================

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):

    keyboard = [
        [
            InlineKeyboardButton(
                "🇪🇹 Afaan Oromoo",
                callback_data="oromo"
            )
        ],
        [
            InlineKeyboardButton(
                "🇪🇹 አማርኛ",
                callback_data="amharic"
            )
        ],
        [
            InlineKeyboardButton(
                "🇬🇧 English",
                callback_data="english"
            )
        ]
    ]


    reply_markup = InlineKeyboardMarkup(keyboard)


    text = (
        "🚗 Getachew Fikadu Jirata\n\n"
        "Maaloo Afaan filadhaa.\n"
        "━━━━━━━━━━━━━━\n"
        "እባክዎ ቋንቋ ይምረጡ።\n"
        "━━━━━━━━━━━━━━\n"
        "Please select your language."
    )


    await update.message.reply_text(
        text,
        reply_markup=reply_markup
    )



# =========================
# LANGUAGE SELECTION
# =========================

async def language_selected(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):

    query = update.callback_query

    await query.answer()


    language = query.data


    context.user_data["language"] = language



    if language == "amharic":

        message = (
            "እባክዎ የስልክ ቁጥርዎን ያጋሩ።"
        )

        button = (
            "📱 ስልክ ቁጥር አጋራ"
        )


    elif language == "oromo":

        message = (
            "Maaloo lakkoofsa bilbilaa keessanii qoodaa."
        )

        button = (
            "📱 Lakkoofsa Bilbilaa Qoodi"
        )


    else:

        message = (
            "Please share your phone number."
        )

        button = (
            "📱 Share Phone Number"
        )



    phone_keyboard = [
        [
            KeyboardButton(
                button,
                request_contact=True
            )
        ]
    ]


    reply_markup = ReplyKeyboardMarkup(
        phone_keyboard,
        resize_keyboard=True,
        one_time_keyboard=True
    )



    await query.message.reply_text(
        message,
        reply_markup=reply_markup
    )



# =========================
# RECEIVE PHONE NUMBER
# =========================

async def receive_phone(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):

    language = context.user_data.get(
        "language",
        "english"
    )

    if language == "amharic":
        message = "ስልክ ቁጥርዎን ተቀቃል ተውልዎ አልይ"
    elif language == "oromo":
        message = "Bilbilaa keessanii qoodaa dhufteessa."
    else:
        message = "Phone number received successfully."

    await update.message.reply_text(
        message,
        reply_markup=ReplyKeyboardRemove()
    )



    app_button = [
        [
            KeyboardButton(
                "🚗 Open Getachew Fikadu app",
                web_app=WebAppInfo(url=WEBAPP_URL)
            )
        ]
    ]


    app_menu = ReplyKeyboardMarkup(
        app_button,
        resize_keyboard=True
    )


    await update.message.reply_text(
        "🚗 Tap the button below to open the Getachew Fikadu app:",
        reply_markup=app_menu
    )



# =========================
# APP BUTTON CLICK
# =========================

async def app_clicked(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):

    keyboard = [
        [
            InlineKeyboardButton(
                "🚗 Open App",
                web_app=WebAppInfo(url=WEBAPP_URL)
            )
        ]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    await update.message.reply_text(
        "Welcome to Getachew Fikadu app 🚗\n\n"
        "Tap the button below to open the application:",
        reply_markup=reply_markup
    )



# =========================
# BOT SETUP
# =========================

app = Application.builder().token(TOKEN).build()


app.add_handler(
    CommandHandler(
        "start",
        start
    )
)


app.add_handler(
    CallbackQueryHandler(
        language_selected
    )
)


app.add_handler(
    MessageHandler(
        filters.CONTACT,
        receive_phone
    )
)


app.add_handler(
    MessageHandler(
        filters.TEXT & ~filters.COMMAND,
        app_clicked
    )
)



print("🚗 BruhTesfa Bot is running...")


app.run_polling()
