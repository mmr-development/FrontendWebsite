import { renderTemplate } from '../../utils/rendertemplate.js';
import * as api from '../../utils/api.js';
import {renderModal} from '../../utils/modal.js';

const chatMessageCache = {};
const chatSocketCache = {};

export const renderMessages = async (container, chat_id) => {
    if (chatMessageCache[chat_id]) {
        await renderTemplate('../../templates/partials/dashboard/pages/chat-messages.mustache', container, { messages: chatMessageCache[chat_id] });
        const chatContainer = document.getElementById('chat');
        if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    if (!chatSocketCache[chat_id]) {
        chatSocketCache[chat_id] = new WebSocket(api.wsurl + 'ws/chat/' + chat_id);
    }
    const socket = chatSocketCache[chat_id];

    socket.onopen = () => {
        socket.send(JSON.stringify({ type: 'history' }));
    };
    let myId;
    socket.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'history') {
            data.messages.forEach(element => {
                if (element.isSender === true) {
                    myId = element.sender_id;
                    return;
                }
            });
            data.messages.forEach(message => {
                if (message && message.first_name && message.last_name) {
                    message.full_name = `${message.first_name} ${message.last_name}`;
                } else if (message && message.first_name) {
                    message.full_name = message.first_name;
                } else if (message && message.last_name) {
                    message.full_name = message.last_name;
                } else {
                    message.full_name = 'Unknown';
                }
                if (message.content && message.content.images) {
                    message.content.images.forEach(image => {
                        if (image.url && image.url.startsWith('/uploads/')) {
                            image.url = api.baseurl + 'public' + image.url;
                        }
                    });
                }
                if(message && message.created_at) {
                    message.created_at_human = new Date(message.created_at).toLocaleString();
                }
            });
            chatMessageCache[chat_id] = data.messages || [];
            await renderTemplate('../../templates/partials/dashboard/pages/chat-messages.mustache', container, { messages: chatMessageCache[chat_id] });
            const chatContainer = document.getElementById('chat');
            if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
        }
        if (data.type === 'message') {
            if (myId) 
                data.message.isSender = data.message.sender_id === myId;
            chatMessageCache[chat_id] = chatMessageCache[chat_id] || [];
            if (data.message.content && data.message.content.images) {
                data.message.content.images.forEach(image => {
                    if (image.url && image.url.startsWith('/uploads/')) {
                        image.url = api.baseurl + 'public' + image.url;
                    }
                });
            }
            if (data.message && data.message.first_name && data.message.last_name) {
                data.message.full_name = `${data.message.first_name} ${data.message.last_name}`;
            } else if (data.message && data.message.first_name) {
                data.message.full_name = data.message.first_name;
            } else if (data.message && data.message.last_name) {
                data.message.full_name = data.message.last_name;
            } else {
                data.message.full_name = 'Unknown';
            }
            if(data.message && data.message.created_at) {
                data.message.created_at_human = new Date(data.message.created_at).toLocaleString();
            }
            let wasEmpty = chatMessageCache[chat_id].length === 0;
            if (wasEmpty) {
                await renderTemplate('../../templates/partials/dashboard/pages/chat-messages.mustache', container, { messages: [data.message] });
            } else {
                await renderTemplate('../../templates/partials/dashboard/pages/chat-messages.mustache', container, { messages: [data.message] }, true);
            }
            chatMessageCache[chat_id].push(data.message);
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
        // Send on button click
        sendButton.onclick = async (e) => {
            e.preventDefault();
            const message = messageInput.value.trim();
            if (!message) return;
            let socket = chatSocketCache[chat_id];
            const imageInput = form.querySelector('input[type="file"]');
            let content = { text: message };

            if (imageInput && imageInput.files.length > 0) {
                const files = imageInput.files;
                const formData = new FormData();
                for (let i = 0; i < files.length; i++) {
                    formData.append('files', files[i]);
                }
                let response = await api.postImage('chats/upload-images', formData);
                let result = await response.data.json();

                if (result.images && result.images.length > 0) {
                    content.images = result.images.map(image => ({
                        url: image.url,
                    }));
                }
            }

            if (!socket || socket.readyState !== 1) {
                socket = new WebSocket(api.wsurl + 'ws/chat/' + chat_id);
                chatSocketCache[chat_id] = socket;
                socket.onopen = () => {
                    socket.send(JSON.stringify({
                        action: 'message',
                        content: content
                    }));
                };
            } else {
                socket.send(JSON.stringify({
                    action: 'message',
                    content: content
                }));
            }
            messageInput.value = '';
            if (imageInput) imageInput.value = '';
        };
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (e.shiftKey) {
                    // Allow new line
                    return;
                }
                e.preventDefault();
                sendButton.click();
            }
        });
    }
};

export const renderChats = async (container, chatContainer) => {
    let chats = await api.get(`chats/support/`).then((res) => res.status === 200 ? res.data : []);
    let templatedata = {
        chats: chats.chats.map((chat) => {
            let lastMessage = chat.last_message || { content: { text: 'No messages yet' } };
            if(lastMessage.content.images) {
                lastMessage.content.text = 'Picture sent';
            }
            return {
                id: chat.id,
                name: chat.name ?? 'Chat Name 123',
                lastMessage: lastMessage,
                timestamp: chat.timestamp
                    ? new Date(chat.timestamp).toLocaleString()
                    : new Date().toLocaleString(),
            };
        })
    };

    await renderTemplate('../../templates/partials/dashboard/pages/chats.mustache', container, templatedata);
    let items = document.querySelectorAll('.chat-list-item');
    items.forEach((item) => {
        item.addEventListener('click', async () => {
            let chat_id = item.getAttribute('data-chat-id');
            await renderChat(chatContainer, chat_id);
        });
    });
    let createChatButton = document.getElementById('create-chat');
    if (createChatButton) {
        createChatButton.onclick = async () => {
            let participants = await api.get('couriers/').then((res) => res.status === 200 ? res.data : []);
            let couriers = participants.couriers;
            let options = couriers.map(courier => `<option value="${courier.user_id}" data-role="courier">${courier.email}</option>`).join('');
            renderModal({
                minWidth: '600px',
                title: 'Create New Chat',
                content: `
                <div class="c-modal__chat">
                                <label for="new-chat-name">Chat Name:</label>
                <input type="text" id="new-chat-name" name="chat_name" placeholder="Enter chat name" required style="width:100%;margin-bottom:10px;">
                <label for="new-chat-participants">Participants:</label>
                <select id="new-chat-participants" multiple required style="width:100%;min-height:100px;">
                    ${options}
                </select>
                </div>`,
                close: "Close",
                submit: "Submit",
                submitCallback: async () => {
                    let selectedOptions = document.getElementById('new-chat-participants').selectedOptions;
                    // get value and data-role from selected options
                    let participants = Array.from(selectedOptions).map(option => {
                        return {
                            user_id: option.value,
                            user_role: option.getAttribute('data-role') || 'courier'
                        };
                    });

                    let chatName = document.getElementById('new-chat-name').value.trim();
                    if (participants.length === 0) {
                        alert('Please select at least one participant.');
                        return;
                    }
                    let newChat = await api.post('chats', { participants: participants, name: chatName }).then(res => res.status === 201 ? res.data : null);
                    if (newChat) {
                        await renderChat(chatContainer, newChat.id);
                        await renderChats(container, chatContainer);
                    } else {
                        alert('Failed to create chat. Please try again.');
                    }
                },
                closeCallback: () => {}
            }, 'c-modal__chat').then(async () => {
            });
        };
    }
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