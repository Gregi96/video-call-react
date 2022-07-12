import express from "express"
import http from "http"
import cors from "cors"

const port = 8080;
const app = express()
app.use(cors)
const server = http.createServer(app)

server.listen(port, () => {
    console.log("Listening to the server", port)
})
