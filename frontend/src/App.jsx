import { useState, useRef, useEffect } from "react";
import send from "./assets/send.svg";
import moon from "./assets/moon.svg";
import sun from "./assets/sun.svg";
import "./App.css"; 


function App() {
  //estado para manejar los mensajes del bot
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "¡Hola! soy tu asistente virtual ¿En que puedo ayudarte?",
    },
  ]);

  //estado para controlar el input del usuario
  const [input, setInput] = useState("");

  // Constante para cambiar de claro a oscuro
  const [darkMode, setDarkMode] = useState(false);

  const messagesEndRef = useRef(null);
  
  //funcion para cambiar el
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  //funcion para manejar el envio de mensajes del usuario
  const sendMessage = async () => {
    if (!input.trim()) return;

    //objeto con el mensaje del usuario
    const userMessage = { from: "user", text: input };
    //variable para setear el estado de los mensajes por lo que ingresado el usuario 
    const updateMessage = [...messages, userMessage];
    setMessages(updateMessage);

    //peticion a la api
    try {
      const res = await fetch("https://chatbot-hackaton-talento-tech.onrender.com/dialogflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }), //mandamos la input como query
      });
      //recibimos la data y la transformamos en json
      const data = await res.json();
      console.log(data); //verificamos la data

      //seteamos los mensajes con data traida de la api
      setMessages([...updateMessage, { from: "bot", text: data.reply }]);
    } catch {
      //manejamos errores
      setMessages([
        ...updateMessage,
        { from: "bot", text: " Error al conectar con el bot" },
      ]);
    }

    //seteamos el input a vacio despues de mandar la data
    setInput("");
  };

  //funcion para mandar el mensaje al presionar el enter
  const handleKeyPress = (e) => {
    if (e.key == "Enter") sendMessage();
  };

  // Scroll automático al final del chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <>
      <div
        className=
          {`flex flex-col h-screen ${darkMode ? "bg-gray-900" : "bg-gray-200"}`}>
        <header className=" bg-[#e2551d] text-white p-4 text-lg font-semibold flex items-center justify-center">
          <h1 className="">Chatbot HelpLean</h1>
          <button
            onClick={toggleDarkMode}
            className="absolute right-12 cursor-pointer p-1  rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 transition"
          >
            <img
              src={darkMode ? sun : moon}
              alt="toggle-mode"
              className="w-6 h-6"
            />
          </button>
        </header>
        <main className={`flex-1 overflow-y-auto p-4 space-y-4 ${darkMode ? "bg-gray-800" : "bg-gray-200"}`}>
          {/* El contenido de dialogflow va aqui */}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.from === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-xs break-words ${
                  msg.from === "user"
                    ? "bg-[#e2551d]/80 text-white rounded-br-none"
                    : darkMode
                      ? "bg-gray-600/60 text-white rounded-bl-none"
                      : "bg-gray-400/70 text-gray-800 rounded-bl-none"
                }`}
              >
                {msg.text || msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </main>

        <footer className={`p-4 flex justify-around gap-2 shadow ${darkMode ? "bg-gray-800" : "bg-gray-200"}`}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Preguntale al bot"
            onKeyDown={handleKeyPress}
            className={`w-4/5 block px-2 pl-4 focus:outline-none py-1 border-0 bg-gray-300 rounded-xl ${
              darkMode ? "bg-gray-700 text-white placeholder-gray-300" : ""
            }`} 
          />

          <button
            className="bg-[#e2551d] text-white p-4 rounded-4xl hover:bg-[#ffa480] cursor-pointer"
            onClick={sendMessage}
          >
            <img src={send} alt="send-icon" />
          </button>
        </footer>
      </div>
    </>
  );
}

export default App;
