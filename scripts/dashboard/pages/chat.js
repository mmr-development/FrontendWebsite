import { renderTemplate } from '../../utils/rendertemplate.js';
import * as api from '../../utils/api.js';

// Message cache and socket cache
const chatMessageCache = {};
const chatSocketCache = {};

export const renderMessages = async (container, chat_id) => {
    // If messages are cached, render them immediately
    if (chatMessageCache[chat_id]) {
        await renderTemplate('../../templates/partials/dashboard/pages/chat-messages.mustache', container, { messages: chatMessageCache[chat_id] });
        const chatContainer = document.getElementById('chat');
        if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Connect to websocket if not already connected
    if (!chatSocketCache[chat_id]) {
        chatSocketCache[chat_id] = new WebSocket(api.wsurl + 'ws/chat/' + chat_id);
    }
    const socket = chatSocketCache[chat_id];

    socket.onopen = () => {
        socket.send(JSON.stringify({ type: 'history' }));
    };

    socket.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'history') {
            chatMessageCache[chat_id] = data.messages || [];
            await renderTemplate('../../templates/partials/dashboard/pages/chat-messages.mustache', container, { messages: chatMessageCache[chat_id] });
            const chatContainer = document.getElementById('chat');
            if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
        }
        if (data.type === 'message') {
            // Append new message to cache and DOM
            chatMessageCache[chat_id] = chatMessageCache[chat_id] || [];
            chatMessageCache[chat_id].push(data.message);
            await renderTemplate('../../templates/partials/dashboard/pages/chat-messages.mustache', container, { messages: [data.message] }, true);
            const chatContainer = document.getElementById('chat');
            if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    };
};

export const renderChat = async (container, chat_id) => {
    await renderTemplate('../../templates/partials/dashboard/pages/chat.mustache', container, { chat_id: chat_id });
    const chatContainer = document.getElementById(container);
    if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;

    await renderMessages('chat-messages', chat_id);

    const form = document.getElementById('send-message-form');
    const sendButton = form?.querySelector('button[type="submit"]');
    const messageInput = form?.querySelector('input[name="message"]');

    if (sendButton && messageInput) {
        sendButton.onclick = (e) => {
            e.preventDefault();
            const message = messageInput.value.trim();
            if (!message) return;
            // Use existing socket
            let socket = chatSocketCache[chat_id];
            if (!socket || socket.readyState !== 1) {
                socket = new WebSocket(api.wsurl + 'ws/chat/' + chat_id);
                chatSocketCache[chat_id] = socket;
                socket.onopen = () => {
                    socket.send(JSON.stringify({ action: 'message', content: { text: message } }));
                };
            } else {
                socket.send(JSON.stringify({ action: 'message', content: { text: message } }));
            }
            messageInput.value = '';
        };
    }
};

export const renderChats = async (container, chatContainer) => {
    let chats = await api.get(`chats`).then((res) => res.status === 200 ? res.data : []);
    let templatedata = {
        chats: chats.map((chat) => ({
            id: chat.id,
            name: chat.name ?? 'Chat Name',
            last_message: chat.last_message ?? 'No messages yet',
            timestamp: chat.timestamp ?? new Date().toISOString(),
        }))
    };

    await renderTemplate('../../templates/partials/dashboard/pages/chats.mustache', container, templatedata);
    let items = document.querySelectorAll('.chat-list-item');
    items.forEach((item) => {
        item.addEventListener('click', async () => {
            let chat_id = item.getAttribute('data-chat-id');
            await renderChat(chatContainer, chat_id);
        });
    });
};

export const renderChatTemplate = async (container) => {
    const chatContainer = document.createElement('div');
    chatContainer.id = 'chat-container';
    chatContainer.className = 'chat-container';
    const containerDiv = document.getElementById(container);
    if (!containerDiv) {
        console.error('Container not found:', container);
        return;
    }
    containerDiv.appendChild(chatContainer);

    let chatContainerDiv = document.getElementById('chat-container');
    const chatDiv = document.createElement('div');
    chatDiv.id = 'chat';
    chatDiv.className = 'chat';
    const chatsDiv = document.createElement('div');
    chatsDiv.id = 'chats';
    chatsDiv.className = 'chats';

    chatContainerDiv.appendChild(chatsDiv);
    chatContainerDiv.appendChild(chatDiv);

    await renderChats(chatsDiv.id, chatDiv.id);
};