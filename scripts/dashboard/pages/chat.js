import {renderTemplate} from '../../utils/rendertemplate.js';
import * as api from '../../utils/api.js';

export const renderMessages = async (container, chat_id) => {

    // connect to websocket
    const socket = new WebSocket(api.wsurl + 'ws/chat/' + chat_id );
    socket.onopen = () => {
        console.log('WebSocket connection established');
        // the server sends .then(history => socket.send(JSON.stringify({ type: 'history', messages: history })))
        socket.send(JSON.stringify({ type: 'history' }));
    }

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'history') {
            renderTemplate('../../templates/partials/dashboard/pages/chat-messages.mustache', container, { messages: data.messages }).then(() => {
                const chatContainer = document.getElementById('chat');
                if (chatContainer) {
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }
            });
        }
        if (data.type === 'message') {
            renderTemplate('../../templates/partials/dashboard/pages/chat-messages.mustache', container, { messages: [data.message] }, true);
        }
    };
}

export const renderChat = async (container, chat_id) => {
    console.log('rendering chat', chat_id);
    renderTemplate('../../templates/partials/dashboard/pages/chat.mustache', container, { chat_id: chat_id }).then(() => {
        const chatContainer = document.getElementById(container);
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
        renderMessages('chat-messages', chat_id);
        const form = document.getElementById('send-message-form');
        const sendButton = form.querySelector('button[type="submit"]');
        const messageInput = form.querySelector('input[name="message"]');
        if (sendButton && messageInput) {
            sendButton.addEventListener('click', () => {
                console.log('send button clicked');
                const message = messageInput.value;
                if (message) {
                    console.log('sending message', message);
                    const socket = new WebSocket(api.wsurl + 'ws/chat/' + chat_id);
                    socket.onopen = () => {
                        socket.send(JSON.stringify({ action: 'message', content:{
                            "text": message,
                        } }));
                        messageInput.value = '';
                    }
                }
            });
        }
    });
}

export const renderChats = async (container, chatContainer) => {
    console.log(container)
    let chats = await api.get(`chats`).then((res) => {
        if (res.status === 200) {
            return res.data;
        }
        return [];
    });
    let templatedata = {
        chats: chats.map((chat) => {
            return {
                id: chat.id,
                name: chat.name ?? 'Chat Name',
                last_message: chat.last_message ?? 'No messages yet',
                timestamp: chat.timestamp ?? new Date().toISOString(),
            }
        })
    };

    await renderTemplate('../../templates/partials/dashboard/pages/chats.mustache', container, templatedata).then(() => {
        let items = document.querySelectorAll('.chat-list-item');
        items.forEach((item) => {
            item.addEventListener('click', async (e) => {
                let chat_id = item.getAttribute('data-chat-id');
                
                await renderChat(chatContainer, chat_id);
            });
        });
    });
}


export const renderChatTemplate = async (container) => {
    console.log('rendering chat template');
    const chatDiv = document.createElement('div');
    chatDiv.id = 'chat';
    chatDiv.className = 'chat';
    const chatsDiv = document.createElement('div');
    chatsDiv.id = 'chats';
    chatsDiv.className = 'chats';
    // append the chat and chats div to the container
    const containerDiv = document.getElementById(container);
    if (containerDiv) {
        containerDiv.appendChild(chatsDiv);
        containerDiv.appendChild(chatDiv);
    } else {
        console.error('Container not found:', container);
        return;
    }

    await renderChats(chatsDiv.id,chatDiv.id);
}