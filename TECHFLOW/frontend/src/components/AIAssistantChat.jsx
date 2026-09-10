import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSession } from '../context/SessionContext';
import { sendAgentQuery } from '../services/api';
import FormattedMessage from './FormattedMessage';
import { 
  Bot, 
  Send, 
  Sparkles, 
  RotateCcw, 
  AlertCircle, 
  Clock, 
  Info, 
  CheckCircle2,
  Plus
} from 'lucide-react';

export default function AIAssistantChat({ samplePrompts = [], defaultInput = '', onInputConsumed }) {
  const { user } = useAuth();
  const { activeSession, updateSessionMessages, createNewSession } = useSession();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const messages = activeSession?.messages || [];

  // Sync defaultInput if triggered from quick action card
  useEffect(() => {
    if (defaultInput) {
      setQuery(defaultInput);
      if (onInputConsumed) onInputConsumed();
    }
  }, [defaultInput, onInputConsumed]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim() || loading || !activeSession) return;

    const currentQuery = query.trim();
    setQuery('');

    const userMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: currentQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      role: user?.role,
      userName: user?.name
    };

    const newMessagesList = [...messages, userMessage];
    updateSessionMessages(activeSession.id, newMessagesList);
    setLoading(true);

    try {
      const response = await sendAgentQuery({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        query: currentQuery,
        sessionId: activeSession.id
      });

      let botMessageText = '';
      let messageStatus = response.status || 'delivered';
      let rawData = null;

      if (response.status === 'success' || response.status === 'delivered') {
        if (response.data) {
          rawData = response.data;
          if (typeof response.data === 'string') {
            botMessageText = response.data;
          } else if (response.data.output) {
            botMessageText = response.data.output;
          } else if (response.data.response) {
            botMessageText = response.data.response;
          } else if (response.data.message) {
            botMessageText = response.data.message;
          } else if (response.data.text) {
            botMessageText = response.data.text;
          } else if (Array.isArray(response.data) && response.data.length > 0 && response.data[0].output) {
            botMessageText = response.data[0].output;
          } else {
            botMessageText = JSON.stringify(response.data, null, 2);
          }
        } else {
          botMessageText = 'Request received and processed by n8n workflow.';
        }
      } else if (response.status === 'not_configured') {
        botMessageText = 'n8n Webhook is ready for workflow connection. (Backend environment N8N_WEBHOOK_URL is currently unset or in local demo standby mode).';
        rawData = response.payloadSent;
      } else if (response.status === 'unreachable') {
        botMessageText = 'Could not reach the configured n8n webhook URL. Please ensure your n8n workflow is active and accepting incoming POST requests.';
      } else if (response.status === 'timeout') {
        botMessageText = 'The request to n8n timed out waiting for a response.';
      } else {
        botMessageText = response.message || 'Received response from application gateway.';
      }

      const botMessage = {
        id: `bot_${Date.now()}`,
        sender: 'agent',
        text: botMessageText,
        status: messageStatus,
        rawData: rawData,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      updateSessionMessages(activeSession.id, [...newMessagesList, botMessage]);
    } catch (err) {
      const errorMessage = {
        id: `err_${Date.now()}`,
        sender: 'agent',
        text: err.message || 'Failed to connect to application gateway backend.',
        status: 'error',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      updateSessionMessages(activeSession.id, [...newMessagesList, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    if (activeSession) {
      updateSessionMessages(activeSession.id, []);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/80 px-4 py-3">
        <div>
          <h2 className="text-sm font-bold text-gray-900">AI Assistant</h2>
          <p className="text-xs text-gray-500">
            Working as: <span className="font-semibold text-gray-800">{user?.role}</span>
          </p>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleClearChat}
            className="flex items-center gap-1 px-2.5 py-1 text-xs border border-gray-300 rounded bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-2xs"
            title="Clear current session chat history"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[340px] max-h-[540px] bg-gray-50/40">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8 px-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-2 border border-blue-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-gray-800">
              How can I help you today?
            </h3>
            <p className="mt-1 text-xs text-gray-500 max-w-md">
              Ask any question or instruction for your role (<span className="font-medium text-gray-700">{user?.role}</span>).
            </p>

            {samplePrompts.length > 0 && (
              <div className="mt-4 w-full max-w-lg">
                <div className="text-xs font-medium text-gray-500 mb-2">
                  Sample queries:
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {samplePrompts.map((promptText, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuery(promptText)}
                      className="border border-gray-200 bg-white px-3 py-1.5 rounded-md text-xs text-gray-700 hover:bg-gray-50 hover:border-gray-300 text-left transition-colors shadow-2xs"
                    >
                      "{promptText}"
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-lg p-3 text-sm shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white border border-blue-600'
                    : 'bg-white text-gray-900 border border-gray-200 w-full'
                }`}
              >
                {/* Meta header */}
                <div
                  className={`flex items-center gap-2 mb-1.5 text-xs ${
                    msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  <span className="font-semibold">
                    {msg.sender === 'user' ? 'You' : 'Assistant'}
                  </span>
                  <span className="ml-auto text-[11px]">{msg.timestamp}</span>
                </div>

                {/* Message Body */}
                {msg.sender === 'user' ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                ) : (
                  <FormattedMessage text={msg.text} />
                )}

                {/* Status if Agent */}
                {msg.sender === 'agent' && (
                  <div className="mt-2.5 pt-1.5 border-t border-gray-100 text-[11px] text-gray-500 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      {msg.status === 'delivered' || msg.status === 'success' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-medium">Status: success</span>
                        </>
                      ) : msg.status === 'not_configured' ? (
                        <>
                          <Info className="w-3.5 h-3.5 text-amber-600" />
                          <span className="text-amber-700">Gateway Standby Mode</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span className="text-rose-700">Status: {msg.status}</span>
                        </>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg p-3 text-xs text-gray-600 flex items-center gap-2 shadow-2xs">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse delay-75" />
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse delay-150" />
              </div>
              <span>Processing request with AI agent...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Query Input Box */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            placeholder="Type your message..."
            className="flex-1 px-3.5 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-2xs"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
