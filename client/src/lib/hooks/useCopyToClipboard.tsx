import React, { useState } from 'react'

export const useCopyToClipboard = () => {
    const [isCopying, setIsCopying] = useState(false)
    const [isCopied, setIsCopied] = useState(false)

    const copyText = (text: string) => {
        setIsCopying(true)

        navigator.clipboard.writeText(text)
            .then(() => {
                setIsCopied(true)
                setIsCopying(false)

                setTimeout(() => {
                    setIsCopied(false)
                }, 1000)
            })
            .catch(console.log)
    }

    return {
        copyText,
        isCopying,
        isCopied
    }
}
