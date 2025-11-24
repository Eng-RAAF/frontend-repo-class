import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { messagesAPI, usersAPI } from '../services/api';
import Header from '../components/Header';

function Chat() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    fetchUsers();
  }, [user]);

  useEffect(() => {
    if (user && users.length > 0) {
      fetchUnreadCounts();
    }
  }, [users, user]);

  useEffect(() => {
    if (selectedUser && user) {
      fetchConversation();
      const interval = setInterval(fetchConversation, 2000); // Poll every 2 seconds
      return () => clearInterval(interval);
    }
  }, [selectedUser, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchUsers = async () => {
    try {
      const data = await usersAPI.getAll();
      // Filter out current user
      const otherUsers = data.filter(u => u.id !== user?.id);
      setUsers(otherUsers);
    } catch (error) {
      alert('Error fetching users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversation = async () => {
    if (!selectedUser || !user) return;
    
    try {
      const data = await messagesAPI.getConversation(user.id, selectedUser.id);
      setMessages(data);
      
      // Mark messages as read
      const unreadMessages = data.filter(
        m => m.receiverId === user.id && !m.read
      );
      for (const msg of unreadMessages) {
        await messagesAPI.markAsRead(msg.id);
      }
      
      fetchUnreadCounts();
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
  };

  const fetchUnreadCounts = async () => {
    if (!user || users.length === 0) return;
    
    try {
      const counts = {};
      for (const u of users) {
        // Get conversation to check unread from this user
        const conversation = await messagesAPI.getConversation(user.id, u.id);
        const unread = conversation.filter(
          m => m.receiverId === user.id && !m.read
        ).length;
        counts[u.id] = unread;
      }
      setUnreadCounts(counts);
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !user || sending) return;

    setSending(true);
    try {
      await messagesAPI.create({
        senderId: user.id,
        receiverId: selectedUser.id,
        content: newMessage.trim()
      });
      
      setNewMessage('');
      fetchConversation();
      fetchUnreadCounts();
    } catch (error) {
      alert('Error sending message: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 12rem)' }}>
      <Header
        title="Messages"
        subtitle="Chat with other users"
      />

      <div className="flex-1 flex bg-white rounded-xl shadow-lg overflow-hidden min-h-0">
        {/* Users List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900">Contacts</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {users.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No other users found
              </div>
            ) : (
              users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                    selectedUser?.id === u.id ? 'bg-indigo-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-semibold">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{u.name}</p>
                        <p className="text-sm text-gray-500">{u.email}</p>
                      </div>
                    </div>
                    {unreadCounts[u.id] > 0 && (
                      <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        {unreadCounts[u.id]}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-semibold">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedUser.name}</p>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((message) => {
                    const isOwn = message.senderId === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isOwn
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}
                        >
                          {!isOwn && (
                            <p className="text-xs font-semibold mb-1 opacity-75">
                              {message.sender.name}
                            </p>
                          )}
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isOwn ? 'text-indigo-100' : 'text-gray-500'
                            }`}
                          >
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-lg">Select a user to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;

