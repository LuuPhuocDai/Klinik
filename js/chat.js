/**
 * chat.js
 * Xử lý: Chat widget & Video Call (Dùng cho Trang chủ)
 */

// === 1. XỬ LÝ CHAT ===
function toggleChat() {
    const chatWidget = document.getElementById('chat-widget');
    const btnFloat = document.querySelector('.chat-btn-float');
    
    if (chatWidget.style.display === 'none' || chatWidget.style.display === '') {
        chatWidget.style.display = 'flex';
        // Ẩn nút tròn khi mở chat để không bị vướng
        if(btnFloat) btnFloat.style.display = 'none'; 
        setTimeout(() => document.getElementById('chatInput').focus(), 100);
    } else {
        chatWidget.style.display = 'none';
        // Hiện lại nút tròn khi đóng chat
        if(btnFloat) btnFloat.style.display = 'block'; 
    }
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (text) {
        addMessage(text, 'user');
        input.value = "";
        // Giả lập bác sĩ trả lời tự động
        setTimeout(() => addMessage("Cảm ơn bạn. Bác sĩ sẽ phản hồi ngay lập tức.", 'doctor'), 1000);
    }
}

function handleEnter(e) { if(e.key === 'Enter') sendMessage(); }

function addMessage(text, sender) {
    const chatBody = document.getElementById('chatBody');
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    div.innerText = text;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// === 2. XỬ LÝ GỌI VIDEO/VOICE (WEBRTC) ===
let localStream;
let timerInterval;
let seconds = 0;

async function startCall(type) {
    const overlay = document.getElementById('call-overlay');
    const videoElem = document.getElementById('video-stream');
    const avatar = document.getElementById('callAvatar');
    
    overlay.style.display = 'flex';
    
    try {
        const constraints = { audio: true, video: type === 'video' };
        localStream = await navigator.mediaDevices.getUserMedia(constraints);

        if (type === 'video') {
            videoElem.srcObject = localStream;
            videoElem.style.display = 'block';
            avatar.style.display = 'none';
        } else {
            videoElem.style.display = 'none';
            avatar.style.display = 'block';
        }
        
        document.getElementById('callStatus').innerText = "Đã kết nối";
        startTimer();
    } catch (err) {
        alert("Không thể truy cập Camera/Micro. Vui lòng kiểm tra quyền trình duyệt.");
        endCall();
    }
}

function endCall() {
    if (localStream) localStream.getTracks().forEach(track => track.stop());
    document.getElementById('call-overlay').style.display = 'none';
    document.getElementById('video-stream').srcObject = null;
    clearInterval(timerInterval);
    seconds = 0;
}

function toggleMute() {
    if (localStream) {
        localStream.getAudioTracks()[0].enabled = !localStream.getAudioTracks()[0].enabled;
    }
}

function startTimer() {
    document.getElementById('callTimer').innerText = "00:00";
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        document.getElementById('callTimer').innerText = 
            `${mins<10?'0':''}${mins}:${secs<10?'0':''}${secs}`;
    }, 1000);
}