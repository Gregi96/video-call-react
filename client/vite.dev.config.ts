import { defineConfig } from 'vite'
import { config as configDotEnv } from 'dotenv'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

configDotEnv()

export default defineConfig({
    define: {
        'process.env': process.env
    },
    plugins: [
        react({
            babel: {
                plugins: [
                    [
                        'babel-plugin-styled-components',
                        {
                            displayName: true,
                            fileName: false
                        }]
                ]
            }
        }),
        tsconfigPaths({
            extensions: ['.ts', '.tsx'],
        })
    ],
    server: {
        open: true
    }
})
