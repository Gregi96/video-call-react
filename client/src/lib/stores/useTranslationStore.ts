import { useState } from 'react'
import { languages, Languages } from 'lib/locale'

export const useTranslationStore = () => {
    const [languagesState, setLanguagesState] = useState(languages[Languages.en_GB])

    const setLanguage = (languageKey: Languages) => setLanguagesState(languages[languageKey])

    return {
        T: languagesState,
        setLanguage
    }
}
