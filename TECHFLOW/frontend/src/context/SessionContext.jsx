import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState('');

  // Role-specific storage keys
  const roleKey = user ? (user.role || user.id || 'default').replace(/\s+/g, '_').toLowerCase() : 'guest';
  const STORAGE_SESSIONS_KEY = `techflow_chat_sessions_${roleKey}`;
  const STORAGE_ACTIVE_ID_KEY = `techflow_active_session_id_${roleKey}`;

  // Load stored sessions whenever roleKey changes (e.g. login/switch role)
  useEffect(() => {
    try {
      const storedSessions = localStorage.getItem(STORAGE_SESSIONS_KEY);
      const storedActiveId = localStorage.getItem(STORAGE_ACTIVE_ID_KEY);

      if (storedSessions) {
        const parsed = JSON.parse(storedSessions);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(storedActiveId || parsed[0].id);
          return;
        }
      }

      // Default initial session for this specific role
      const initialSession = {
        id: `sess_${Date.now().toString().slice(-6)}_${Math.random().toString(36).substring(2, 6)}`,
        title: 'Operations Assistant',
        role: user?.role || 'Backend Developer',
        createdAt: new Date().toISOString(),
        messages: []
      };
      setSessions([initialSession]);
      setActiveSessionId(initialSession.id);
      localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify([initialSession]));
      localStorage.setItem(STORAGE_ACTIVE_ID_KEY, initialSession.id);
    } catch (e) {
      console.error('Failed to load role sessions:', e);
    }
  }, [roleKey, user?.role]);

  // Save sessions whenever they update for the current role
  const saveSessions = (updatedSessions, newActiveId) => {
    setSessions(updatedSessions);
    localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(updatedSessions));
    if (newActiveId) {
      setActiveSessionId(newActiveId);
      localStorage.setItem(STORAGE_ACTIVE_ID_KEY, newActiveId);
    }
  };

  const createNewSession = (role = user?.role || 'Backend Developer', initialTitle = 'New Conversation') => {
    const newSession = {
      id: `sess_${Date.now().toString().slice(-6)}_${Math.random().toString(36).substring(2, 6)}`,
      title: initialTitle,
      role: role,
      createdAt: new Date().toISOString(),
      messages: []
    };
    const updated = [newSession, ...sessions];
    saveSessions(updated, newSession.id);
    return newSession;
  };

  const selectSession = (sessionId) => {
    setActiveSessionId(sessionId);
    localStorage.setItem(STORAGE_ACTIVE_ID_KEY, sessionId);
  };

  const updateSessionMessages = (sessionId, messages) => {
    const updated = sessions.map((sess) => {
      if (sess.id === sessionId) {
        // Auto-generate title from first user message if still default
        let title = sess.title;
        if ((!title || title === 'New Conversation' || title === 'Operations Assistant') && messages.length > 0) {
          const firstUserMsg = messages.find((m) => m.sender === 'user');
          if (firstUserMsg) {
            title = firstUserMsg.text.slice(0, 32) + (firstUserMsg.text.length > 32 ? '...' : '');
          }
        }
        return { ...sess, messages, title };
      }
      return sess;
    });
    saveSessions(updated);
  };

  const deleteSession = (sessionId) => {
    const filtered = sessions.filter((s) => s.id !== sessionId);
    if (filtered.length === 0) {
      const fallback = {
        id: `sess_${Date.now().toString().slice(-6)}_${Math.random().toString(36).substring(2, 6)}`,
        title: 'Operations Assistant',
        role: user?.role || 'Backend Developer',
        createdAt: new Date().toISOString(),
        messages: []
      };
      saveSessions([fallback], fallback.id);
    } else {
      const nextActive = activeSessionId === sessionId ? filtered[0].id : activeSessionId;
      saveSessions(filtered, nextActive);
    }
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  return (
    <SessionContext.Provider
      value={{
        sessions,
        activeSessionId,
        activeSession,
        createNewSession,
        selectSession,
        updateSessionMessages,
        deleteSession
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
