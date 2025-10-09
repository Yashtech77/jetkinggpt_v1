 
// import React, { useState, useEffect, useRef } from "react";
// import ReactMarkdown from "react-markdown";
// import { MessageCircle } from "lucide-react"; // <-- added import

// export default function ChatBox() {
//   const [messages, setMessages] = useState([]);
//   const [inputMessage, setInputMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const messagesEndRef = useRef(null);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const handleSendMessage = () => {
//     if (inputMessage.trim() === "") return;

//     const userMessage = {
//       id: Date.now().toString(),
//       type: "user",
//       content: inputMessage,
//       timestamp: new Date().toISOString(),
//     };

//     setMessages((prev) => [...prev, userMessage]);
//     setInputMessage("");
//     setIsLoading(true);

//     processUserQuery(userMessage.content);
//   };

//   const processUserQuery = async (query) => {
//     try {
//       const response = await fetch(
//         `${import.meta.env.VITE_API_BASE_URL}/api/ask`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ question: query }),
//         }
//       );

    
//       if (!response.ok)
//         throw new Error(`Server responded with ${response.status}`);

//       const data = await response.json();
//       const fullAnswer = data.answer || "Sorry, I couldn't understand that.";
//       const responseMessage = {
//         id: Date.now().toString(),
//         type: "bot",
//         content: fullAnswer,
//         timestamp: new Date().toISOString(),
//       };

//       setMessages((prev) => [...prev, responseMessage]);
//     } catch (error) {
//       console.error("API Error:", error);
//       setMessages((prev) => [
//         ...prev,
//         {
//           id: Date.now().toString(),
//           type: "bot",
//           content:
//             "An error occurred while fetching the response. Please try again.",
//           timestamp: new Date().toISOString(),
//         },
//       ]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="h-screen bg-[#F9FAFB] flex items-center justify-center">
//       <div className="flex flex-col  w-full h-[100vh] bg-white shadow-sm rounded-xl overflow-hidden">
//         {/* Header */}
//         <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
//           <h2 className="text-lg font-medium text-gray-800">
//             Jetking GPT  (POC)
//           </h2>
//         </div>

//         {/* Message Display */}
//         <div className="flex-1 overflow-auto px-6 py-4 space-y-6 bg-[#F9FAFB] relative">
//           {messages.length === 0 && !isLoading && (
//             <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 space-y-2">
//               <MessageCircle className="h-8 w-8 text-gray-300" />{" "}
//               {/* <-- updated icon */}
//               <h3 className="text-sm font-medium">
//                 Welcome to Jetking GPT! 
//               </h3>
               
//             </div>
//           )}

//           {messages.map((message) => (
//           <div
//   key={message.id}
//   className={`flex ${
//     message.type === "user" ? "justify-end pr-28" : "justify-start pl-28"
//   }`}
// >
//               <div
//                 className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow ${
//                   message.type === "user"
//                     ? "bg-blue-500 text-white rounded-br-none"
//                     : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
//                 }`}
//               >
//                 <ReactMarkdown>{message.content}</ReactMarkdown>
//               </div>
//             </div>
//           ))}

//           {isLoading && (
//             <div className="flex  ml-28">
//               <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2 text-sm text-gray-500 italic shadow rounded-bl-none ">
//                 <span className="dot-flash">Thinking</span>
//               </div>
//             </div>
//           )}

//           <div ref={messagesEndRef} />
//         </div>

//         {/* Input */}
//         <div className="border-t border-gray-200 px-6 py-4 pr-28 pl-28">
//           <div className="flex items-center bg-white border border-gray-300 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-blue-300">
//             <input
//               type="text"
//               className="flex-1 border-none outline-none text-sm text-gray-800 placeholder-gray-400"
//               placeholder="Ask about jetking"
//               value={inputMessage}
//               onChange={(e) => setInputMessage(e.target.value)}
//               onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
//               disabled={isLoading}
//             />
//             <button
//               onClick={handleSendMessage}
//               disabled={isLoading}
//               className={`ml-3 rounded-full p-2 transition ${
//                 isLoading
//                   ? "bg-gray-300 cursor-not-allowed"
//                   : "bg-blue-500 hover:bg-blue-600"
//               }`}
//             >
//               <svg
//                 className="h-4 w-4 text-white"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M5 12h14M12 5l7 7-7 7"
//                 />
//               </svg>
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { MessageCircle } from "lucide-react";

export default function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim() === "") return;

    const userMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    processUserQuery(userMessage.content);
  };

  const processUserQuery = async (query) => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ;
      
      const response = await fetch(`${apiBaseUrl}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: query }),
      });

      if (!response.ok)
        throw new Error(`Server responded with ${response.status}`);

      const data = await response.json();
      const fullAnswer = data.answer || "Sorry, I couldn't understand that.";
      const responseMessage = {
        id: Date.now().toString(),
        type: "bot",
        content: fullAnswer,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, responseMessage]);
    } catch (error) {
      console.error("API Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "bot",
          content:
            "An error occurred while fetching the response. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#F9FAFB] flex items-center justify-center">
      <div className="flex flex-col w-full h-[100vh] bg-white shadow-sm rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">
            Jetking GPT (POC)
          </h2>
        </div>

        {/* Message Display */}
        <div className="flex-1 overflow-auto px-6 py-4 space-y-6 bg-[#F9FAFB] relative">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 space-y-2">
              <MessageCircle className="h-8 w-8 text-gray-300" />
              <h3 className="text-sm font-medium">
                Welcome to Jetking GPT! 
              </h3>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === "user" ? "justify-end pr-28" : "justify-start pl-28"
              }`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow ${
                  message.type === "user"
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex ml-28">
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2 text-sm text-gray-500 italic shadow rounded-bl-none">
                <span className="dot-flash">Thinking</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 px-6 py-4 pr-28 pl-28">
          <div className="flex items-center bg-white border border-gray-300 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-blue-300">
            <input
              type="text"
              className="flex-1 border-none outline-none text-sm text-gray-800 placeholder-gray-400"
              placeholder="Ask about jetking"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading}
              className={`ml-3 rounded-full p-2 transition ${
                isLoading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              <svg
                className="h-4 w-4 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12h14M12 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}