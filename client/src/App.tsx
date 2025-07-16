// Import React hooks and styles
import { useState, useRef, useEffect } from 'react';
import './index.css';

// Define the shape of a chat message
interface Message {
  id: number; // Unique identifier for the message
  text: string; // The message content
  isUser: boolean; // True if sent by user, false if by AI
}

function App() {
  // State to hold all chat messages
  const [messages, setMessages] = useState<Message[]>([]);
  // State for the current input in the textarea
  const [inputText, setInputText] = useState('');
  // State to indicate if the AI is generating a response
  const [isLoading, setIsLoading] = useState(false);
  // State to keep track of the current chat thread (for context)
  const [threadId, setThreadId] = useState<number>(Date.now());
  // Ref to scroll to the bottom of the chat
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom whenever messages or loading state changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Helper to scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle changes in the textarea input
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  // Handle Enter key to send message (Shift+Enter for newline)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Send the user's message to the backend and handle the response
  const sendMessage = async () => {
    // Prevent sending empty messages or sending while loading
    if (inputText.trim() === '' || isLoading) return;

    // Create the user message object
    const userMessage = {
      id: Date.now(),
      text: inputText.trim(),
      isUser: true,
    };

    // Add the user message to the chat
    setMessages((prev) => [...prev, userMessage]);
    setInputText(''); // Clear input
    setIsLoading(true); // Show loading indicator

    try {
      // API endpoint for the backend
      const apiUrl = 'http://localhost:3000';
      // Send POST request to /generate endpoint
      const response = await fetch(`${apiUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage.text, // User's question
          video_id: 'Q7mS1VHm3Yw', // Hardcoded YouTube video ID
          thread_id: threadId, // Current chat thread
        }),
      });

      // If response is not OK, throw error
      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      // Get the AI's response as plain text
      const data = await response.text();

      // Create the AI message object
      const aiMessage = {
        id: Date.now(),
        text: data,
        isUser: false,
      };

      // Add the AI message to the chat
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      // Handle errors (e.g., network issues)
      console.error('Error:', error);
      const errorMessage = {
        id: Date.now(),
        text: 'Sorry, there was an error processing your request.',
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false); // Hide loading indicator
    }
  };

  // Reset the chat and start a new thread
  const resetChat = () => {
    setMessages([]); // Clear all messages
    setThreadId(Date.now()); // Generate a new thread ID
  };

  // Main UI rendering
  return (
    <div className='chat-root'>
      <div className='chat-container'>
        {/* Header with title and reset button */}
        <header className='chat-header'>
          <h1>AI Chat with Youtube Video</h1>
          <button className='reset-button' onClick={resetChat}>
            {/* SVG icon for reset */}
            <svg
              width='16'
              height='16'
              viewBox='0 0 16 16'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M8 3V1L4 5L8 9V7C10.21 7 12 8.79 12 11C12 13.21 10.21 15 8 15C5.79 15 4 13.21 4 11H2C2 14.31 4.69 17 8 17C11.31 17 14 14.31 14 11C14 7.69 11.31 5 8 5V3Z'
                fill='currentColor'
              />
            </svg>
            New Chat
          </button>
        </header>

        {/* Messages area */}
        <div className='messages-container'>
          {/* Show empty state if no messages */}
          {messages.length === 0 ? (
            <div className='empty-state'>
              <p>Start your conversation with the AI</p>
            </div>
          ) : (
            // Render each message
            messages.map((message) => (
              <div
                key={message.id}
                className={`message ${
                  message.isUser ? 'user-message' : 'ai-message'
                }`}
              >
                <div className='message-avatar'>
                  {message.isUser ? 'You' : 'AI'}
                </div>
                <div className='message-content'>{message.text}</div>
              </div>
            ))
          )}
          {/* Show loading indicator when waiting for AI response */}
          {isLoading && (
            <div className='message ai-message'>
              <div className='message-avatar'>AI</div>
              <div className='message-content loading'>
                <span className='dot'></span>
                <span className='dot'></span>
                <span className='dot'></span>
              </div>
            </div>
          )}
          {/* Dummy div to scroll to bottom */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area for typing messages */}
        <div className='input-container'>
          <textarea
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder='Type your message...'
            disabled={isLoading}
            rows={1}
          />
          <button
            className='send-button'
            onClick={sendMessage}
            disabled={inputText.trim() === '' || isLoading}
          >
            {/* SVG icon for send */}
            <svg
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z'
                fill='currentColor'
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Export the App component as default
export default App;
