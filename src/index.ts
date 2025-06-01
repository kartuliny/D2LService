import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { authRoutes } from "./modules/auth/interface/api/routes";
import { connectToDatabase } from "./shared/connection";
import dotenv from "dotenv";

//Cargar variables de entorno
dotenv.config();

//Inicializar aplicacion
const app: Hono = new Hono();

//Ruta principal
//GET BRINDAR INFORMACION
//POST PROCESES DATOS O INFORMACION 
app.route("/auth", authRoutes);

const backend = () => {
    serve({
        fetch: app.fetch,
        port: 3006
    }).addListener("listening", () => console.log("Server is running on port 3006"))
}

// //Ejecutar la aplicacion
connectToDatabase()
    .then(backend)
