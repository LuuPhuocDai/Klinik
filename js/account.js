/**
 * account.js
 * Xử lý: Đăng nhập, Đăng ký, Quên mật khẩu, Đặt lịch hẹn, Lịch sử, Thông báo
 */

// === CẤU HÌNH CHUNG ===
const modal = document.getElementById('mainModal');
const historyModal = document.getElementById('historyModal');
const openBtn = document.getElementById('openLoginBtn');
const closeBtn = document.getElementById('closeModalBtn');

const forms = {
    login: document.getElementById('loginForm'),
    register: document.getElementById('registerForm'),
    forgot: document.getElementById('forgotForm'),
    newPass: document.getElementById('newPassForm')
};

// === QUẢN LÝ DỮ LIỆU (LOCAL STORAGE) ===
let users = JSON.parse(localStorage.getItem('DS_TAI_KHOAN')) || [];
let appointments = JSON.parse(localStorage.getItem('DS_LICH_HEN')) || [];
let currentUser = JSON.parse(localStorage.getItem('CURRENT_USER')) || null;

function saveData() {
    localStorage.setItem('DS_TAI_KHOAN', JSON.stringify(users));
    localStorage.setItem('DS_LICH_HEN', JSON.stringify(appointments));
    localStorage.setItem('CURRENT_USER', JSON.stringify(currentUser));
}

// === HÀM TIỆN ÍCH: HIỂN THỊ THÔNG BÁO ĐẸP (CUSTOM ALERT) ===
function showCustomAlert(message, type = 'error') {
    const modalAlert = document.getElementById('customAlertModal');
    const icon = document.getElementById('alertIcon');
    const title = document.getElementById('alertTitle');
    const msg = document.getElementById('alertMessage');

    if (type === 'success') {
        icon.className = "fa-solid fa-circle-check text-success";
        title.innerText = "Thành công";
        title.style.color = "#198754";
    } else {
        icon.className = "fa-solid fa-circle-exclamation text-danger";
        title.innerText = "Thông báo";
        title.style.color = "#dc3545";
    }

    msg.innerText = message;
    modalAlert.classList.add('active');
}

// Hàm đóng thông báo (Được gọi từ nút "Đã hiểu" bên HTML)
function closeCustomAlert() {
    document.getElementById('customAlertModal').classList.remove('active');
}

// === CẬP NHẬT GIAO DIỆN (UI) ===
function updateUI() {
    if (currentUser) {
        // Đã đăng nhập
        openBtn.innerHTML = `<i class="fa fa-user-circle me-2"></i> ${currentUser.name}`;
        openBtn.classList.replace('btn-dark', 'btn-outline-primary');
        openBtn.style.fontWeight = "bold";
        
        // Bấm vào tên -> Mở Menu
        openBtn.onclick = () => {
            document.getElementById('menuUserName').innerText = `Xin chào, ${currentUser.name}!`;
            document.getElementById('userMenuModal').classList.add('active');
        };
    } else {
        // Chưa đăng nhập
        openBtn.innerHTML = `<i class="fa fa-user me-2"></i> Đăng nhập`;
        openBtn.classList.replace('btn-outline-primary', 'btn-dark');
        openBtn.style.fontWeight = "normal";
        openBtn.onclick = () => { modal.classList.add('active'); showForm('login'); };
    }
}

// Chạy cập nhật UI ngay khi file JS được tải
updateUI();

// === CÁC CHỨC NĂNG TÀI KHOẢN ===

// 1. Chuyển đổi qua lại các Form
function showForm(name) { 
    Object.values(forms).forEach(f => f.classList.add('hidden')); 
    forms[name].classList.remove('hidden'); 
}

// Gán sự kiện click cho các nút chuyển form
if(closeBtn) closeBtn.onclick = () => modal.classList.remove('active');
window.onclick = (e) => { if (e.target === modal) modal.classList.remove('active'); };

document.getElementById('linkToRegister').onclick = (e) => { e.preventDefault(); showForm('register'); };
document.getElementById('linkToLoginFromRegister').onclick = (e) => { e.preventDefault(); showForm('login'); };
document.getElementById('linkToForgot').onclick = (e) => { e.preventDefault(); showForm('forgot'); };
document.getElementById('linkBackToLogin1').onclick = (e) => { e.preventDefault(); showForm('login'); };


// 2. XỬ LÝ ĐĂNG KÝ (Đã bao gồm logic chặn số ở Tên)
document.getElementById('btnRegisterAction').onclick = () => {
    const name = document.getElementById('regName').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const pass = document.getElementById('regPass').value;
    const cccd = document.getElementById('regCCCD').value.trim();
    const dob = document.getElementById('regDOB').value;

    // Validate Rỗng
    if(!name || !phone || !pass || !cccd || !dob) {
        showCustomAlert("Vui lòng điền đầy đủ thông tin!", "error");
        return;
    }

    // Validate Tên (Không chứa số)
    if (/\d/.test(name)) {
        showCustomAlert("Họ tên không hợp lệ (không được chứa số)!", "error");
        return;
    }
    if (name.length < 2) {
        showCustomAlert("Tên quá ngắn! Vui lòng nhập họ tên đầy đủ.", "error");
        return;
    }

    // Validate Số (SĐT & CCCD)
    const isOnlyDigits = (str) => /^\d+$/.test(str);

    if (!isOnlyDigits(phone) || phone.length < 8) {
        showCustomAlert("Số điện thoại không hợp lệ (phải là số và từ 8 ký tự trở lên)!", "error");
        return;
    }

    if (!isOnlyDigits(cccd) || cccd.length < 8) {
         showCustomAlert("CCCD không hợp lệ (phải là số và từ 8 ký tự trở lên)!", "error");
         return;
    }

    // Validate Mật khẩu
    if (pass.length < 6) {
        showCustomAlert("Mật khẩu quá ngắn! Vui lòng nhập tối thiểu 6 ký tự.", "error");
        return;
    }

    // Check trùng SĐT
    if(users.find(u => u.phone === phone)) {
        showCustomAlert("Số điện thoại này đã tồn tại trong hệ thống!", "error");
        return;
    }

    // Lưu
    users.push({ name, phone, pass, cccd, dob });
    saveData();
    showCustomAlert("Đăng ký thành công! Vui lòng đăng nhập ngay.", "success");
    showForm('login');
    
    const loginPhoneInput = document.getElementById('loginPhone');
    if (loginPhoneInput) loginPhoneInput.value = phone;
};


// 3. XỬ LÝ ĐĂNG NHẬP
document.getElementById('btnLoginAction').onclick = () => {
    const phone = document.getElementById('loginPhone').value.trim();
    const pass = document.getElementById('loginPass').value;
    
    const user = users.find(u => u.phone === phone && u.pass === pass);
    
    if(user) {
        currentUser = user; 
        saveData();
        modal.classList.remove('active');
        updateUI();
        showCustomAlert("Đăng nhập thành công! Xin chào " + user.name, "success");
    } else {
        showCustomAlert("Sai số điện thoại hoặc mật khẩu!", "error");
    }
};

// 4. XỬ LÝ ĐĂNG XUẤT
// Hàm này được gọi từ onclick bên HTML
function logout() {
    // Dùng confirm mặc định hoặc custom modal tùy bạn, ở đây dùng confirm cho nhanh
    if(confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
        currentUser = null;
        saveData();
        location.reload();
    }
}


// 5. QUÊN MẬT KHẨU
let userDangQuenMatKhau = null;

// Kiểm tra thông tin
document.getElementById('btnCheckInfo').onclick = () => {
    const inputName = document.getElementById('verifyName').value.trim();
    const inputCCCD = document.getElementById('verifyCCCD').value.trim();
    const inputDOB = document.getElementById('verifyDOB').value;

    if (!inputName || !inputCCCD || !inputDOB) {
        showCustomAlert("Vui lòng nhập đầy đủ thông tin để xác minh!", "error");
        return;
   }

   // Validate Tên & CCCD bên Form quên mật khẩu
   if (inputName.length < 6) { // Tùy chọn độ dài
       showCustomAlert("Họ tên nhập vào quá ngắn!", "error");
       return;
   }
   const isOnlyDigits = (str) => /^\d+$/.test(str);
   if (!isOnlyDigits(inputCCCD) || inputCCCD.length < 8) {
        showCustomAlert("CCCD không hợp lệ!", "error");
        return;
   }

    const foundUser = users.find(user => 
        user.name === inputName && 
        user.cccd === inputCCCD && 
        user.dob === inputDOB
    );

    if (foundUser) {
        userDangQuenMatKhau = foundUser;
        showCustomAlert("Xác minh thành công! Vui lòng đặt mật khẩu mới.", "success");
        setTimeout(() => { closeCustomAlert(); showForm('newPass'); }, 1500);
    } else {
        showCustomAlert("Thông tin xác minh không chính xác!", "error");
    }
};

// Đổi mật khẩu mới
document.getElementById('btnChangePass').onclick = () => {
    const p1 = document.getElementById('newPassMain').value;
    const p2 = document.getElementById('newPassConfirm').value;

    if (p1.length < 6) { 
        showCustomAlert("Mật khẩu quá ngắn (tối thiểu 6 ký tự)!", "error"); return; 
    }
    if (p1 !== p2) { 
        showCustomAlert("Hai mật khẩu không khớp nhau!", "error"); return; 
    }

    if (userDangQuenMatKhau) {
        userDangQuenMatKhau.pass = p1; 
        saveData();
        showCustomAlert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.", "success");
        userDangQuenMatKhau = null;
        setTimeout(() => { closeCustomAlert(); showForm('login'); }, 1500);
    }
};


// 6. XỬ LÝ ĐẶT LỊCH HẸN
document.getElementById('btnBookAppointment').onclick = () => {
    if (!currentUser) {
        showCustomAlert("Bạn cần ĐĂNG NHẬP để có thể đặt lịch hẹn!", "error");
        setTimeout(() => { modal.classList.add('active'); showForm('login'); }, 1500);
        return;
    }

    const pName = document.getElementById('apptName').value.trim();
    const pDoctor = document.getElementById('apptDoctor').value;
    const pDate = document.getElementById('apptDate').value;
    const pTime = document.getElementById('apptTime').value;
    const pNote = document.getElementById('apptNote').value; // Lấy thêm ghi chú nếu cần

    if(!pName || !pDoctor || !pDate || !pTime) { 
        showCustomAlert("Vui lòng điền đầy đủ thông tin đặt hẹn!", "error"); 
        return; 
    }

    appointments.push({
        userAccount: currentUser.phone, 
        patientName: pName,
        doctor: pDoctor,
        date: pDate,
        time: pTime,
        note: pNote,
        status: "Đã xác nhận"
    });
    saveData();
    
    showCustomAlert("ĐẶT LỊCH THÀNH CÔNG!\nBạn có thể kiểm tra lại trong phần Lịch sử.", "success");
    document.getElementById('appointmentForm').reset();
};


// 7. XỬ LÝ LỊCH SỬ KHÁM BỆNH
// Hàm mở lịch sử từ menu (được gọi từ HTML)
function openHistoryFromMenu() {
    document.getElementById('userMenuModal').classList.remove('active');
    showHistory();
}

function showHistory() {
    if(!currentUser) return;

    const tbody = document.getElementById('historyTableBody');
    const noMsg = document.getElementById('noHistoryMsg');
    tbody.innerHTML = '';

    const myHistory = appointments.filter(app => app.userAccount === currentUser.phone);

    if (myHistory.length > 0) {
        noMsg.style.display = 'none';
        myHistory.forEach(item => {
            tbody.innerHTML += `
                <tr>
                    <td>${item.time} <br> ${item.date}</td>
                    <td>${item.doctor}</td>
                    <td><span class="badge bg-success">${item.status}</span></td>
                </tr>
            `;
        });
    } else {
        noMsg.style.display = 'block';
    }

    historyModal.classList.add('active');
}