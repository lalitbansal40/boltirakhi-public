/**
 * Ready-made letters a sister can start from.
 *
 * These exist because a blank box is intimidating. Someone who opens it,
 * stares at it, and closes the tab has lost the part of the gift that made it
 * different — so the job here is to give her something she would actually
 * send, and let her change it.
 *
 * Which means they cannot read like greeting-card filler. "Dear brother, I
 * wish you happiness and prosperity" gets deleted by everyone who reads it,
 * and then she is back at a blank box. Each of these is written to sound like
 * one person talking to one other person, with something specific in it.
 *
 * ⚠️ Every template must stay under 500 characters — the textarea caps there
 * and a longer one would be cut off mid-sentence the moment it was inserted.
 *
 * ⚠️ No {{name}} placeholder anywhere. A half-substituted name is the most
 * obviously templated thing on a page, and she can type his name herself.
 */

export type LetterLang = 'hinglish' | 'hindi' | 'english';

export interface LetterTemplate {
  id: string;
  /** What the button says — describes the tone, not the content. */
  label: string;
  text: string;
}

/** Shown in the picker in its own script, not transliterated. */
export const LANG_LABELS: Record<LetterLang, string> = {
  hinglish: 'Hinglish',
  hindi: 'हिंदी',
  english: 'English',
};

/**
 * Hinglish is the default because it is how most people actually message their
 * siblings — not formal Hindi, not full English.
 */
export const DEFAULT_LANG: LetterLang = 'hinglish';

export const LETTER_TEMPLATES: Record<LetterLang, LetterTemplate[]> = {
  hinglish: [
    {
      id: 'hinglish-warm',
      label: 'Dil se',
      text: `Har saal iss din tere paas hoti thi. Iss baar rakhi courier se aa rahi hai, par baaki sab wahi hai.

Yaad hai jab tu chhota tha aur main tujhe daantti thi? Ab bhi daant sakti hoon, bas phone pe.

Khush rah. Khaana time pe kha. Aur haan — mujhe call karna, message nahi.`,
    },
    {
      id: 'hinglish-funny',
      label: 'Mazaak me',
      text: `Rakhi bhej di hai. Gift ka wait mat karwana iss baar, pichhli baar November tak aaya tha.

Waise tu bada ho gaya hai, par mere liye abhi bhi wahi hai jo mera homework churata tha.

Bandhwa lena kisi se. Aur video zaroor dekhna, mehnat ki hai.`,
    },
    {
      id: 'hinglish-short',
      label: 'Chhota sa',
      text: `Door hoon, par yaad roz aati hai.

Rakhi bandh lena. Khush rehna.`,
    },
  ],

  hindi: [
    {
      id: 'hindi-warm',
      label: 'दिल से',
      text: `हर साल इस दिन तुम्हारे पास होती थी। इस बार राखी डाक से आ रही है, पर बाकी सब वैसा ही है।

तुम्हें याद है, छोटे में मैं कितना डाँटती थी? अब भी डाँट सकती हूँ — बस फ़ोन पर।

ख़ुश रहो। समय पर खाना खाओ। और हाँ, फ़ोन करना — संदेश नहीं।`,
    },
    {
      id: 'hindi-funny',
      label: 'मज़ाक में',
      text: `राखी भेज दी है। इस बार तोहफ़े का इंतज़ार मत करवाना — पिछली बार नवंबर में आया था।

बड़े हो गए हो, पर मेरे लिए अब भी वही हो जो मेरा होमवर्क चुराता था।

किसी से बंधवा लेना। और वीडियो ज़रूर देखना, मेहनत की है।`,
    },
    {
      id: 'hindi-short',
      label: 'छोटा सा',
      text: `दूर हूँ, पर याद रोज़ आती है।

राखी बाँध लेना। ख़ुश रहना।`,
    },
  ],

  english: [
    {
      id: 'english-warm',
      label: 'From the heart',
      text: `Every year I was there to tie it myself. This time it comes by post, but nothing else has changed.

You were impossible as a child and I told you so often. I can still tell you — just over the phone now.

Eat properly. Sleep sometimes. And call me, don't text.`,
    },
    {
      id: 'english-funny',
      label: 'Something lighter',
      text: `The rakhi has been sent. Try to send my gift before November this time.

You have grown up, apparently. To me you are still the one who copied my homework and got a better mark for it.

Get someone to tie it for you. And watch the video — I recorded it four times.`,
    },
    {
      id: 'english-short',
      label: 'Short and simple',
      text: `Far away, but you are on my mind every day.

Wear it. Be happy.`,
    },
  ],
};

/**
 * Only three languages, and only ones written properly.
 *
 * Gujarati, Marathi and Tamil were asked for and are deliberately absent. A
 * template goes out under the sister's name to her own brother; a clumsy or
 * machine-translated one would put words in her mouth that she never chose,
 * and she would not necessarily notice before sending it.
 *
 * Adding one is small: a key here, a label above, and the Noto font for its
 * script in layout.tsx. The writing is the part that has to come from someone
 * who speaks it.
 */
