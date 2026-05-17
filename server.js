<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>نظام حجز مواعيد الكنيسة</title>
    <style>
        :root {
            --bg-color: #1a120b;
            --card-bg: #2c1e11;
            --text-color: #e4d4c8;
            --accent-color: #d4a373;
            --primary-button: #cd7f32;
            --danger-color: #8b0000;
            --success-color: #2e8b57;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
            background-color: var(--bg-color);
            color: var(--text-color);
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .container {
            width: 100%;
            max-width: 600px;
            background-color: var(--card-bg);
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.5);
            margin-bottom: 20px;
        }

        h2, h3 {
            text-align: center;
            color: var(--accent-color);
            margin-bottom: 20px;
        }

        .form-group {
            margin-bottom: 15px;
        }

        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }

        input, select, textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid var(--accent-color);
            border-radius: 8px;
            background-color: var(--bg-color);
            color: var(--text-color);
            font-size: 16px;
        }

        button {
            width: 100%;
            padding: 12px;
            border: none;
            border-radius: 8px;
            background-color: var(--primary-button);
            color: white;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: background 0.3s;
            margin-top: 10px;
        }

        button:hover {
            filter: brightness(1.2);
        }

        button.danger {
            background-color: var(--danger-color);
        }

        .nav-tabs {
            display: flex;
            justify-content: space-around;
            background-color: var(--bg-color);
            padding: 10px;
            border-radius: 8px;
            margin-bottom: 20px;
            width: 100%;
        }

        .tab {
            padding: 10px 15px;
            cursor: pointer;
            color: var(--text-color);
            border-radius: 5px;
        }

        .tab.active {
            background-color: var(--primary-button);
            font-weight: bold;
        }

        .card-list {
            margin-top: 15px;
        }

        .card-item {
            background-color: var(--bg-color);
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 10px;
            border-right: 5px solid var(--accent-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .hidden {
            display: none !important;
        }

        .profile-pic-container {
            text-align: center;
            margin-bottom: 15px;
        }

        .profile-pic {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid var(--accent-color);
        }
    </style>
</head>
<body>

    <div id="mainNav" class="nav-tabs hidden">
        <div class="tab active" onclick="switchTab('bookingTab')">حجز موعد</div>
        <div id="adminTabBtn" class="tab hidden" onclick="switchTab('adminTab')">لوحة الأدمن</div>
        <div class="tab" onclick="switchTab('profileTab')">الملف الشخصي</div>
        <div class="tab" onclick="logout()">خروج</div>
    </div>

    <div id="authContainer" class="container">
        <div id="loginForm">
            <h2>تسجيل الدخول</h2>
            <div class="form-group">
                <label>البريد الإلكتروني</label>
                <input type="email" id="loginEmail" required>
            </div>
            <div class="form-group">
                <label>كلمة المرور</label>
                <input type="password" id="loginPassword" required>
            </div>
            <button onclick="login()">دخول</button>
            <p style="text-align:center; margin-top:15px; cursor:pointer; color:var(--accent-color)" onclick="toggleAuthForms(false)">إنشاء حساب جديد</p>
            <p style="text-align:center; margin-top:10px; cursor:pointer; color:var(--accent-color)" onclick="forgotPassword()">نسيت كلمة المرور؟</p>
        </div>

        <div id="registerForm" class="hidden">
            <h2>إنشاء حساب جديد</h2>
            <div class="form-group">
                <label>الاسم الكامل</label>
                <input type="text" id="regName" required>
            </div>
            <div class="form-group">
                <label>البريد الإلكتروني</label>
                <input type="email" id="regEmail" required>
            </div>
            <div class="form-group">
                <label>كلمة المرور</label>
                <input type="password" id="regPassword" required>
            </div>
            <button onclick="register()">تسجيل</button>
            <p style="text-align:center; margin-top:15px; cursor:pointer; color:var(--accent-color)" onclick="toggleAuthForms(true)">لديك حساب بالفعل؟ سجل دخولك</p>
        </div>
    </div>

    <div id="bookingTab" class="container hidden">
        <h2>حجز موعد جديد</h2>
        <div class="form-group">
            <label>اختر الأب الكاهن</label>
            <select id="priestFilter" onchange="loadAvailableAppointments()"></select>
        </div>
        
        <h3>المواعيد المتاحة</h3>
        <div id="availableList" class="card-list"></div>

        <hr style="margin:20px 0; border-color:var(--accent-color);">
        
        <h3>حجوزاتك الحالية</h3>
        <div id="myBookingsList" class="card-list"></div>
    </div>

    <div id="profileTab" class="container hidden">
        <h2>الملف الشخصي</h2>
        <div class="profile-pic-container">
            <img id="userDisplayPic" src="" class="profile-pic" alt="Profile Picture">
            <input type="file" id="profilePicInput" accept="image/*" style="margin-top:10px;">
        </div>
        <div class="form-group">
            <label>الاسم</label>
            <input type="text" id="profileName">
        </div>
        <div class="form-group">
            <label>البريد الإلكتروني</label>
            <input type="email" id="profileEmail">
        </div>
        <button onclick="updateProfile()">تحديث البيانات</button>
    </div>

    <div id="adminTab" class="container hidden">
        <h2>لوحة التحكم الإدارية</h2>
        
        <div class="form-group">
            <h3>إدارة الآباء الكهنة</h3>
            <input type="text" id="newPriestName" placeholder="اسم الأب الكاهن الجديد">
            <button onclick="addPriest()">إضافة كاهن</button>
            <div id="adminPriestsList" class="card-list"></div>
        </div>

        <hr style="margin:20px 0; border-color:var(--accent-color);">

        <div class="form-group">
            <h3>إضافة مواعيد أب كاهن</h3>
            <select id="adminPriestSelect"></select>
            <label style="margin-top:10px;">التاريخ</label>
            <input type="date" id="apptDate">
            <label style="margin-top:10px;">الوقت</label>
            <input type="time" id="apptTime">
            <button onclick="addAppointment()">إضافة الموعد</button>
        </div>

        <hr style="margin:20px 0; border-color:var(--accent-color);">

        <h3>كافة الحجوزات القائمة في النظام</h3>
        <div id="allBookingsList" class="card-list"></div>

        <hr style="margin:20px 0; border-color:var(--accent-color);">
        
        <h3>إدارة حسابات المستخدمين وحظرهم</h3>
        <div id="adminUsersList" class="card-list"></div>
    </div>

    <script>
        // ضع هنا رابط السيرفر النهائي الذي حصلت عليه من Vercel أو Render دون إضافة /api في آخره
        const SERVER_URL = 'https://your-project-name.vercel.app'; 

        let currentUser = null;

        function toggleAuthForms(showLogin) {
            document.getElementById('loginForm').classList.toggle('hidden', !showLogin);
            document.getElementById('registerForm').classList.toggle('hidden', showLogin);
        }

        async function login() {
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            const res = await fetch(`${SERVER_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (data.success) {
                currentUser = data.user;
                document.getElementById('authContainer').classList.add('hidden');
                document.getElementById('mainNav').classList.remove('hidden');
                
                if (currentUser.role === 'admin') {
                    document.getElementById('adminTabBtn').classList.remove('hidden');
                    switchTab('adminTab');
                    loadAdminData();
                } else {
                    document.getElementById('adminTabBtn').classList.add('hidden');
                    switchTab('bookingTab');
                    loadUserData();
                }
                fillProfileData();
            } else {
                alert(data.message);
            }
        }

        async function register() {
            const name = document.getElementById('regName').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;

            const res = await fetch(`${SERVER_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            alert(data.message);
            if (data.success) toggleAuthForms(true);
        }

        async function forgotPassword() {
            const name = prompt("أدخل اسمك الكامل المسجل في الحساب:");
            const email = prompt("أدخل بريدك الإلكتروني:");
            if(!name || !email) return;

            const res = await fetch(`${SERVER_URL}/api/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email })
            });
            const data = await res.json();
            if(data.success) {
                alert(`كلمة المرور الخاصة بك هي: ${data.password}`);
            } else {
                alert(data.message);
            }
        }

        function fillProfileData() {
            document.getElementById('profileName').value = currentUser.name;
            document.getElementById('profileEmail').value = currentUser.email;
            document.getElementById('userDisplayPic').src = currentUser.profilePic || "https://via.placeholder.com/100";
        }

        async function updateProfile() {
            const name = document.getElementById('profileName').value;
            const email = document.getElementById('profileEmail').value;
            const fileInput = document.getElementById('profilePicInput');
            let profilePic = currentUser.profilePic;

            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                profilePic = await convertToBase64(file);
            }

            const res = await fetch(`${SERVER_URL}/api/user/update-profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.id, name, email, profilePic })
            });
            const data = await res.json();
            alert(data.message);
            if(data.success) {
                currentUser = data.user;
                fillProfileData();
            }
        }

        function convertToBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
            });
        }

        function switchTab(tabId) {
            document.querySelectorAll('.container').forEach(c => c.add('hidden'));
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            
            document.getElementById(tabId).classList.remove('hidden');
            event.target.classList.add('active');

            if (tabId === 'bookingTab') loadUserData();
            if (tabId === 'adminTab') loadAdminData();
        }

        async function loadUserData() {
            await loadPriestsLists();
            loadAvailableAppointments();
            loadMyBookings();
        }

        async function loadAdminData() {
            await loadPriestsLists();
            loadAllBookings();
            loadAllUsers();
        }

        async function loadPriestsLists() {
            const res = await fetch(`${SERVER_URL}/api/priests`, { method: 'POST' });
            const priests = await res.json();

            // تحديث قوائم الاختيار (Select filters)
            const filter = document.getElementById('priestFilter');
            const adminSelect = document.getElementById('adminPriestSelect');
            
            filter.innerHTML = '<option value="all">كل الآباء الكهنة</option>';
            adminSelect.innerHTML = '';

            const listContainer = document.getElementById('adminPriestsList');
            if(listContainer) listContainer.innerHTML = '';

            priests.forEach(p => {
                filter.innerHTML += `<option value="${p.id}">${p.name}</option>`;
                adminSelect.innerHTML += `<option value="${p.id}">${p.name}</option>`;
                
                if(listContainer) {
                    listContainer.innerHTML += `
                        <div class="card-item">
                            <span>${p.name}</span>
                            <button class="danger" style="width:auto; padding:5px 10px;" onclick="deletePriest('${p.id}')">حذف</button>
                        </div>
                    `;
                }
            });
        }

        async function addPriest() {
            const name = document.getElementById('newPriestName').value;
            if(!name) return alert("برجاء كتابة اسم الكاهن");
            await fetch(`${SERVER_URL}/api/admin/add-priest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            document.getElementById('newPriestName').value = '';
            loadAdminData();
        }

        async function deletePriest(priestId) {
            if(!confirm("هل أنت متأكد من حذف الأب الكاهن؟ سيتم حذف جميع مواعيده أيضاً.")) return;
            await fetch(`${SERVER_URL}/api/admin/delete-priest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priestId })
            });
            loadAdminData();
        }

        async function addAppointment() {
            const priestId = document.getElementById('adminPriestSelect').value;
            const date = document.getElementById('apptDate').value;
            const time = document.getElementById('apptTime').value;

            if(!priestId || !date || !time) return alert("برجاء ملء جميع الحقول لإضافة الموعد");

            const res = await fetch(`${SERVER_URL}/api/admin/add-appointment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priestId, date, time })
            });
            const data = await res.json();
            alert(data.message);
            loadAdminData();
        }

        async function loadAvailableAppointments() {
            const priestId = document.getElementById('priestFilter').value;
            const res = await fetch(`${SERVER_URL}/api/appointments/get`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priestId })
            });
            const appts = await res.json();
            const container = document.getElementById('availableList');
            container.innerHTML = appts.length === 0 ? '<p style="text-align:center;">لا توجد مواعيد متاحة حالياً</p>' : '';

            appts.forEach(a => {
                container.innerHTML += `
                    <div class="card-item">
                        <div>
                            <strong>${a.dayName}</strong> - الساعة: ${a.time}
                        </div>
                        <button style="width:auto; padding:5px 10px;" onclick="bookAppointment('${a.id}')">حجز</button>
                    </div>
                `;
            });
        }

        async function bookAppointment(appointmentId) {
            const res = await fetch(`${SERVER_URL}/api/appointments/book`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appointmentId, userId: currentUser.id })
            });
            const data = await res.json();
            alert(data.message); // هنا ستظهر رسالة الرفض إذا كان لديه حجز آخر أو تجاوز الـ 40 يوم
            loadUserData();
        }

        async function loadMyBookings() {
            const res = await fetch(`${SERVER_URL}/api/bookings/get`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.id, type: 'user' })
            });
            const bookings = await res.json();
            const container = document.getElementById('myBookingsList');
            container.innerHTML = bookings.length === 0 ? '<p style="text-align:center;">ليس لديك أي حجوزات قائمة</p>' : '';

            bookings.forEach(b => {
                container.innerHTML += `
                    <div class="card-item" style="border-right-color: var(--success-color)">
                        <div>
                            <strong>${b.dayName}</strong> - الساعة: ${b.time}
                        </div>
                        <button class="danger" style="width:auto; padding:5px 10px;" onclick="cancelBooking('${b.appointmentId}')">إلغاء</button>
                    </div>
                `;
            });
        }

        async function cancelBooking(appointmentId) {
            if(!confirm("هل أنت متأكد من رغبتك في إلغاء هذا الحجز؟")) return;
            await fetch(`${SERVER_URL}/api/appointments/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appointmentId, userId: currentUser.id })
            });
            if(currentUser.role === 'admin') loadAdminData(); else loadUserData();
        }

        async function loadAllBookings() {
            const res = await fetch(`${SERVER_URL}/api/bookings/get`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'admin' })
            });
            const bookings = await res.json();
            const container = document.getElementById('allBookingsList');
            container.innerHTML = bookings.length === 0 ? '<p style="text-align:center;">لا توجد حجوزات في النظام</p>' : '';

            bookings.forEach(b => {
                container.innerHTML += `
                    <div class="card-item">
                        <div>
                            <strong>المستخدم:</strong> ${b.userName}<br>
                            <strong>الموعد:</strong> ${b.dayName} - الساعة: ${b.time}
                        </div>
                        <button class="danger" style="width:auto; padding:5px 10px;" onclick="cancelBooking('${b.appointmentId}')">حذف الحجز</button>
                    </div>
                `;
            });
        }

        async function loadAllUsers() {
            const res = await fetch(`${SERVER_URL}/api/admin/users`, { method: 'POST' });
            const users = await res.json();
            const container = document.getElementById('adminUsersList');
            container.innerHTML = '';

            users.forEach(u => {
                if(u.role === 'admin') return; // عدم عرض حساب الأدمن نفسه للتعديل

                const isBanned = u.banUntil && new Date(u.banUntil) > new Date();
                const banBtn = isBanned ? 
                    `<button style="width:auto; padding:5px 10px; background-color:var(--success-color);" onclick="unbanUser('${u.id}')">فك الحظر</button>` :
                    `<button class="danger" style="width:auto; padding:5px 10px;" onclick="banUser('${u.id}')">حظر</button>`;

                container.innerHTML += `
                    <div class="card-item">
                        <div>
                            <strong>الاسم:</strong> ${u.name}<br>
                            <strong>الإيميل:</strong> ${u.email}<br>
                            <span style="color:red">${isBanned ? 'الحساب محظور حالياً' : ''}</span>
                        </div>
                        <div>
                            ${banBtn}
                            <button class="danger" style="width:auto; padding:5px 10px; margin-top:0;" onclick="deleteUser('${u.id}')">حذف الحساب</button>
                        </div>
                    </div>
                `;
            });
        }

        async function banUser(userId) {
            const days = prompt("أدخل عدد أيام الحظر:", "0");
            const hours = prompt("أدخل عدد ساعات الحظر:", "0");
            if(days === null || hours === null) return;

            await fetch(`${SERVER_URL}/api/admin/ban-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUserId: userId, days, hours })
            });
            loadAdminData();
        }

        async function unbanUser(userId) {
            await fetch(`${SERVER_URL}/api/admin/unban-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUserId: userId })
            });
            loadAdminData();
        }

        async function deleteUser(userId) {
            if(!confirm("هل أنت متأكد من حذف هذا الحساب نهائياً؟ سيتم مسح كافة حجوزاته وبياناته.")) return;
            await fetch(`${SERVER_URL}/api/admin/delete-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUserId: userId })
            });
            loadAdminData();
        }

        function logout() {
            currentUser = null;
            document.getElementById('mainNav').classList.add('hidden');
            document.getElementById('bookingTab').classList.add('hidden');
            document.getElementById('adminTab').classList.add('hidden');
            document.getElementById('profileTab').classList.add('hidden');
            document.getElementById('authContainer').classList.remove('hidden');
            toggleAuthForms(true);
        }
    </script>
</body>
</html>
