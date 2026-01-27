const WELCOME_MESSAGES = [
    "Hello!", // English
    "Hola!", // Spanish
    "Bonjour!", // French
    "Guten Tag!", // German
    "Ciao!", // Italian
    "こんにちは!", // Japanese (Kon'nichiwa)
    "你好!", // Chinese (Nǐ hǎo)
    "안녕하세요!", // Korean (Annyeonghaseyo)
    "Olá!", // Portuguese
    "Привет!", // Russian (Privet)
    "مرحبا!", // Arabic (Marhaba)
    "नमस्ते!", // Hindi (Namaste)
    "Hej!", // Swedish
    "Hallo!", // Dutch
    "Γεια σας!", // Greek (Yia sas)
    "Merhaba!", // Turkish
    "Witaj!", // Polish
    "Hei!", // Finnish
    "Ahoj!", // Czech
    "Здравейте!", // Bulgarian (Zdraveĭte)
]

export function pickRandomWelcomeMessage(): string {
    return WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)];
}