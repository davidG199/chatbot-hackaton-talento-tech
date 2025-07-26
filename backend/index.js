import express from "express";
import cors from "cors";
import dialogFlow from "@google-cloud/dialogflow";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuid } from "uuid";
import dotenv from "dotenv";

//CARGAR VARIBLES DE ENTORNO
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//inicio de la api express
const app = express();

const allowedOrigins = [
  "https://chatbot-hackaton-talento-tech.vercel.app", // tu frontend en Vercel
  "http://localhost:5173" // para desarrollo local
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());

//id de nuestro proyecto en dialogflow
const projectId = process.env.GOOGLE_PROJECT_ID;

//creamos la sesion con base en la url y las credenciales de la api de dialogflow
const sessionClient = new dialogFlow.SessionsClient({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
});

//montamos el endpoint
app.post("/dialogflow", async (req, res) => {
  try {
    const userMessage = req.body.query; //el mensaje es requerido y se pasa por query
    const sessionId = uuid(); // ID de sesión único por conversación
    const sessionPath = sessionClient.projectAgentSessionPath(
      projectId,
      sessionId
    );

    //creamos un objetos con la peticion
    const request = {
      session: sessionPath, //mandamos la sessionpath
      queryInput: {
        text: {
          text: userMessage, //aqui va lo que el usuario escribe
          languageCode: "es", // idioma
        },
      },
    };

    //manejamos la respuesta del servidor
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;

    //manejamos errores de respuesta
    res.json({
      reply: result.fulfillmentText || "No entendí lo que dijiste",
    });
  } catch (error) {
    console.error("Error con Dialogflow:", error);
    res.status(500).json({ reply: "Error al conectar con el bot" });
  }
});

//montamos nuestra api en el puerto 3001
app.listen(3001, () => console.log("Backend en el host: 3001"));
