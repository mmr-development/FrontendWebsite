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
            chatMessageCache[chat_id] = data.messages || [];
            await renderTemplate('../../templates/partials/dashboard/pages/chat-messages.mustache', container, { messages: chatMessageCache[chat_id] });
            const chatContainer = document.getElementById('chat');
            if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
        }
        if (data.type === 'message') {
            if (myId) 
                data.message.isSender = data.message.sender_id === myId;
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
        // Send on button click
        sendButton.onclick = (e) => {
            e.preventDefault();
            const message = messageInput.value.trim();
            if (!message) return;
            let socket = chatSocketCache[chat_id];
            if (!socket || socket.readyState !== 1) {
                socket = new WebSocket(api.wsurl + 'ws/chat/' + chat_id);
                chatSocketCache[chat_id] = socket;
                socket.onopen = () => {
                    // get image upload if exists
                    const imageInput = form.querySelector('input[type="file"]');
                    if (imageInput && imageInput.files.length > 0) {
                        const file = imageInput.files[0];
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const imageData = e.target.result;
                            console.log('Sending message with image:', imageData);
                            socket.send(JSON.stringify({ action: 'message', content: { text: message, images: [imageData] } }));
                        };
                        reader.readAsDataURL(file);
                    } else {
                        socket.send(JSON.stringify({ action: 'message', content: { text: message } }));
                    }
                };
            } else {
                socket.send(JSON.stringify({ action: 'message', content: { text: message } }));
            }
            messageInput.value = '';
        };

        // Send on Enter, new line on Shift+Enter
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
    console.log('Chats:', chats);
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
                timestamp: chat.timestamp ?? new Date().toISOString(),
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
            console.log(participants);
            let couriers = participants.couriers;
            let options = couriers.map(courier => `<option value="${courier.user_id}" data-role="courier">${courier.email}</option>`).join('');
            renderModal({
                minWidth: '600px',
                title: 'Create New Chat',
                content: `
                <label for="new-chat-name">Chat Name:</label>
                <input type="text" id="new-chat-name" name="chat_name" placeholder="Enter chat name" required style="width:100%;margin-bottom:10px;">
                <label for="new-chat-participants">Participants:</label>
                <select id="new-chat-participants" multiple required style="width:100%;min-height:100px;">
                    ${options}
                </select>`,
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
                    console.log('Creating chat with participants:', participants);
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