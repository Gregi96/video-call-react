import React, { useEffect, useState } from 'react'

export const useCopyToClipboard = () => {
    const [isCopying, setIsCopying] = useState(false)
    const [isCopied, setIsCopied] = useState(false)

    useEffect(() => {
        if (!isCopied) {
            return
        }

        const timeoutId = setTimeout(() => setIsCopied(false), 1000)

        return () => clearTimeout(timeoutId)
    }, [isCopied])

    const copyText = (text: string) => {
        setIsCopying(true)

        if (!navigator?.clipboard) {
            setIsCopying(false)

            return console.warn('Clipboard not supported')
        }

        navigator.clipboard.writeText(text)
            .then(() => {
                setIsCopied(true)
                setIsCopying(false)
            })
            .catch()

    }

    return {
        copyText,
        isCopying,
        isCopied
    }
}
