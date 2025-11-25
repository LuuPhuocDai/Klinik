/**
 * support.js
 * Xử lý: Chat widget, Google Search, Video Call (WebRTC)
 */

// === 1. LOGIC CHO CHAT ===
function toggleChat() {
    const chatWidget = document.getElementById('chat-widget');
    if (chatWidget.style.display === 'none' || chatWidget.style.display === '') {
        chatWidget.style.display = 'flex';
        setTimeout(() => document.getElementById('chatInput').focus(), 100);
    } else {
        chatWidget.style.display = 'none';
    }
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const messageText = input.value.trim();
    const chatBody = document.getElementById('chatBody');

    if (messageText !== "") {
        addMessage(messageText, 'user');
        input.value = "";
        
        const typingIndicator = document.getElementById('typingIndicator');
        typingIndicator.style.display = 'block';
        chatBody.scrollTop = chatBody.scrollHeight;

        setTimeout(() => {
            typingIndicator.style.display = 'none';
            const botReply = getAutoReply(messageText);
            addMessage(botReply, 'doctor');
        }, 1500);
    }
}

function handleEnter(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function addMessage(text, sender) {
    const chatBody = document.getElementById('chatBody');
    const typingIndicator = document.getElementById('typingIndicator');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender} animate__animated animate__fadeInUp`;
    msgDiv.innerText = text;
    chatBody.insertBefore(msgDiv, typingIndicator);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function getAutoReply(userMsg) {
    const msg = userMsg.toLowerCase();
    if (msg.includes('đặt lịch') || msg.includes('hẹn')) {
        return "Bạn muốn đặt lịch khám chuyên khoa nào ạ? Bạn có thể để lại số điện thoại, lễ tân sẽ gọi lại ngay.";
    } else if (msg.includes('giá') || msg.includes('chi phí')) {
        return "Chi phí khám tổng quát là 300.000đ. Bạn có BHYT không ạ?";
    } else if (msg.includes('địa chỉ') || msg.includes('ở đâu')) {
        return "Phòng khám nằm tại đường Lê Văn Việt, TP. Thủ Đức bạn nhé.";
    } else {
        return "Cảm ơn bạn đã nhắn tin. Bác sĩ chuyên khoa sẽ phản hồi lại trong giây lát. Vui lòng giữ máy.";
    }
}

// === 2. LOGIC CHO GOOGLE SEARCH ===
function executeGoogleSearch() {
    var keyword = document.getElementById("googleSearchInput").value;
    
    if (keyword.trim() !== "") {
        var brandName = "Klinik"; 
        var finalQuery = brandName + " " + keyword;
        var googleUrl = "https://www.google.com/search?q=" + encodeURIComponent(finalQuery);
        window.open(googleUrl, '_blank');
    } else {
        var searchBox = document.querySelector('.search-box');
        // Kích hoạt animation rung lắc từ CSS
        searchBox.style.animation = "shake 0.5s";
        setTimeout(() => searchBox.style.animation = "", 500);
        document.getElementById("googleSearchInput").focus();
    }
}

function handleSearchEnter(event) {
    if (event.key === "Enter") {
        executeGoogleSearch();
    }
}

function quickSearch(text) {
    document.getElementById("googleSearchInput").value = text;
    executeGoogleSearch();
}

// === 3. LOGIC XỬ LÝ CUỘC GỌI (WEBRTC) ===
let localStream;
let callTimerInterval;
let seconds = 0;

async function startCall(type) {
    const overlay = document.getElementById('call-overlay');
    const videoElem = document.getElementById('video-stream');
    const avatar = document.getElementById('callAvatar');
    const status = document.getElementById('callStatus');

    overlay.style.display = 'flex'; // Hiện màn hình gọi
    status.innerText = "Đang kết nối máy chủ...";
    
    try {
        // Yêu cầu quyền truy cập Camera/Micro
        const constraints = {
            audio: true,
            video: type === 'video' // Chỉ bật video nếu chọn gọi video
        };

        localStream = await navigator.mediaDevices.getUserMedia(constraints);

        if (type === 'video') {
            videoElem.srcObject = localStream;
            videoElem.style.display = 'block'; // Hiện video
            avatar.style.display = 'none'; // Ẩn avatar để hiện video
        } else {
            videoElem.style.display = 'none';
            avatar.style.display = 'block'; // Hiện avatar nếu chỉ gọi tiếng
        }

        status.innerText = "Đã kết nối";
        startTimer();

    } catch (err) {
        console.error("Lỗi truy cập media:", err);
        status.innerText = "Không thể truy cập Camera/Micro!";
        alert("Vui lòng cho phép trình duyệt truy cập Camera và Micro để gọi.");
        endCall();
    }
}

function endCall() {
    const overlay = document.getElementById('call-overlay');
    const videoElem = document.getElementById('video-stream');

    // Dừng stream (tắt đèn camera)
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }

    // Reset giao diện
    overlay.style.display = 'none';
    videoElem.srcObject = null;
    stopTimer();
    
    // Thêm thông báo vào chat
    addMessage("Cuộc gọi đã kết thúc.", "user");
}

function toggleMute() {
    if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        audioTrack.enabled = !audioTrack.enabled;
    }
}

// Logic đếm giờ
function startTimer() {
    seconds = 0;
    document.getElementById('callTimer').innerText = "00:00";
    clearInterval(callTimerInterval);
    callTimerInterval = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        document.getElementById('callTimer').innerText = 
            `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }, 1000);
}

function stopTimer() {
    clearInterval(callTimerInterval);
    seconds = 0;
}