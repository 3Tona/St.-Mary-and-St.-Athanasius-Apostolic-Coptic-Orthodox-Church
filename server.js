const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // لضمان استقبال صور البروفايل الـ Base64 بأي حجم

// ==================== مصفوفات البيانات الافتراضية ====================
let allUsers = [
    { id: "admin_root", name: "الأدمن الرئيسي", email: "admin@church.com", password: "admin123", role: "admin", profilePic: "", banUntil: null }
];
let priests = [];
let appointments = [];
let bookings = [];
let notifications = []; // تشمل طلبات العضوية ورسائل التواصل والتنبيهات

// ==================== الـ Endpoints الخاصة بالنظام ====================

// 1. تسجيل حساب جديد للمستخدمين
app.post('/api/register', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.json({ success: false, message: "برجاء ملء جميع الحقول المطلوبة" });
    }
    
    const exists = allUsers.find(u => u.email === email);
    if (exists) {
        return res.json({ success: false, message: "هذا البريد الإلكتروني مسجل بالفعل!" });
    }

    const newUser = {
        id: 'usr_' + Date.now(),
        name,
        email,
        password,
        role: 'user',
        profilePic: "",
        banUntil: null
    };
    
    allUsers.push(newUser);
    res.json({ success: true, message: "تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول." });
});

// 2. تسجيل الدخول (مع حماية الأدمن وحساب مدة الحظر بدقة)
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // تحقق أولاً إذا كان الحساب هو الأدمن الرئيسي لتخطي أي تعارض
    if (email === "admin@church.com" && password === "admin123") {
        const adminAccount = allUsers.find(u => u.role === 'admin') || { id: "admin_root", name: "الأدمن الرئيسي", email: "admin@church.com", role: "admin" };
        return res.json({ success: true, user: adminAccount });
    }

    // البحث في المستخدمين العاديين
    const user = allUsers.find(u => u.email === email && u.password === password);
    if (!user) {
        return res.json({ success: false, message: "البريد الإلكتروني أو كلمة المرور خاطئة" });
    }

    // فحص الحظر المؤقت بدقة باليوم والساعة
    if (user.banUntil && new Date(user.banUntil) > new Date()) {
        const remainingMs = new Date(user.banUntil) - new Date();
        const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        return res.json({ 
            success: false, 
            message: `لقد أخذت حظر لفترة ${days} يوم و ${hours} ساعة` 
        });
    }

    res.json({ success: true, user: user });
});

// 3. استعادة كلمة المرور
app.post('/api/forgot-password', (req, res) => {
    const { name, email } = req.body;
    const user = allUsers.find(u => u.name === name && u.email === email);
    if (user) {
        res.json({ success: true, password: user.password });
    } else {
        res.json({ success: false, message: "البيانات المدخلة غير متطابقة مع أي حساب!" });
    }
});

// 4. تحديث بيانات الملف الشخصي (الاسم، الإيميل، الصورة الشخصية)
app.post('/api/user/update-profile', (req, res) => {
    const { userId, name, email, profilePic } = req.body;
    const user = allUsers.find(u => u.id === userId);
    
    if (!user) return res.json({ success: false, message: "المستخدم غير موجود" });
    
    // التحقق من عدم تكرار الإيميل مع مستخدم آخر
    const emailExists = allUsers.find(u => u.email === email && u.id !== userId);
    if (emailExists) return res.json({ success: false, message: "هذا البريد الإلكتروني مستخدم بالفعل من قبل شخص آخر" });

    user.name = name;
    user.email = email;
    if (profilePic !== undefined) {
        user.profilePic = profilePic; // تخزين نص الـ Base64 الخاص بالصورة
    }

    res.json({ success: true, message: "تم تحديث الملف الشخصي بنجاح", user: user });
});

// 5. إدارة الآباء الكهنة (إضافة، جلب، حذف)
app.post('/api/priests', (req, res) => { res.json(priests); });
app.post('/api/admin/add-priest', (req, res) => {
    const { name } = req.body;
    priests.push({ id: 'prst_' + Date.now(), name });
    res.json({ success: true, message: "تم إضافة الأب الكاهن بنجاح" });
});
app.post('/api/admin/delete-priest', (req, res) => {
    const { priestId } = req.body;
    priests = priests.filter(p => p.id !== priestId);
    appointments = appointments.filter(a => a.priestId !== priestId);
    res.json({ success: true, message: "تم حذف الأب الكاهن ومواعيده" });
});

// 6. إدارة المواعيد والحجوزات
app.post('/api/admin/add-appointment', (req, res) => {
    const { priestId, date, time } = req.body;
    const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    const dayName = days[new Date(date).getDay()] + " " + date;
    
    appointments.push({ id: 'appt_' + Date.now(), priestId, date, time, dayName, isBooked: false });
    res.json({ success: true, message: "تم إضافة الموعد بنجاح" });
});

app.post('/api/appointments/get', (req, res) => {
    const { priestId } = req.body;
    let available = appointments.filter(a => !a.isBooked);
    if (priestId !== 'all') {
        available = available.filter(a => a.priestId === priestId);
    }
    res.json(available);
});

// *** endpoint الحجز المعدل لمنع تكرار الحجوزات نهائياً عبر كل الآباء ***
app.post('/api/appointments/book', (req, res) => {
    const { appointmentId, userId } = req.body;
    const appt = appointments.find(a => a.id === appointmentId);
    const user = allUsers.find(u => u.id === userId);

    if (!appt || appt.isBooked) return res.json({ success: false, message: "عذراً، هذا الموعد غير متاح حالياً" });

    // التعديل الجديد والمهم: التحقق من وجود أي حجز نشط للمستخدم في النظام بالكامل
    const hasActiveBooking = bookings.find(b => b.userId === userId);
    if (hasActiveBooking) {
        return res.json({ success: false, message: "عذراً، لديك حجز نشط بالفعل في النظام. لا يمكنك حجز موعد آخر مع أي أب كاهن حتى ينتهي موعدك القديم أو تقوم بإلغائه." });
    }

    // شرط الـ 40 يوم
    const bookingDate = new Date(appt.date);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 40);
    if (bookingDate > maxDate) {
        return res.json({ success: false, message: "عذراً، لا يمكن حجز مواعيد تتعدى الـ 40 يوماً من اليوم" });
    }

    appt.isBooked = true;
    bookings.push({
        id: 'book_' + Date.now(),
        appointmentId,
        userId,
        userName: user.name,
        priestId: appt.priestId,
        dayName: appt.dayName,
        time: appt.time,
        date: appt.date
    });

    res.json({ success: true, message: "تم حجز الموعد بنجاح!" });
});

app.post('/api/bookings/get', (req, res) => {
    const { userId, type } = req.body;
    if (type === 'admin') return res.json(bookings);
    res.json(bookings.filter(b => b.userId === userId));
});

app.post('/api/appointments/cancel', (req, res) => {
    const { appointmentId, userId } = req.body;
    bookings = bookings.filter(b => b.appointmentId !== appointmentId);
    const appt = appointments.find(a => a.id === appointmentId);
    if (appt) appt.isBooked = false;
    res.json({ success: true, message: "تم إلغاء الحجز بنجاح وإعادة إتاحة الموعد للجميع." });
});

// 7. استقبال طلبات العضوية
app.post('/api/user/membership', (req, res) => {
    const { userId, phone, nid, wifeName, wifeNid, childrenNames, childrenNids } = req.body;
    const user = allUsers.find(u => u.id === userId);
    
    notifications.push({
        id: 'notif_' + Date.now(),
        type: 'membership',
        userId,
        userName: user.name,
        date: new Date().toLocaleString('ar-EG'),
        data: { phone, nid, wifeName, wifeNid, childrenNames, childrenNids }
    });
    res.json({ success: true, message: "تم إرسال بيانات العضوية بنجاح للأدمن للمراجعة." });
});

app.post('/api/user/contact', (req, res) => {
    const { userId, message } = req.body;
    const user = allUsers.find(u => u.id === userId);
    notifications.push({
        id: 'notif_' + Date.now(),
        type: 'contact',
        userId,
        userName: user.name,
        userProfilePic: user.profilePic || "",
        message,
        date: new Date().toLocaleString('ar-EG')
    });
    res.json({ success: true, message: "تم إرسال رسالتك للأدمن بنجاح." });
});

app.post('/api/admin/notifications', (req, res) => { res.json(notifications); });

app.post('/api/admin/send-general-alert', (req, res) => {
    const { alertText } = req.body;
    notifications.push({
        id: 'alert_' + Date.now(),
        type: 'general-alert',
        text: alertText,
        date: new Date().toLocaleString('ar-EG')
    });
    res.json({ success: true, message: "تم نشر التنبيه العام لجميع المستخدمين." });
});

app.post('/api/user/alerts', (req, res) => {
    const { userId } = req.body;
    const alerts = notifications.filter(n => n.type === 'general-alert' || (n.type === 'admin-reply' && n.targetUserId === userId));
    res.json(alerts);
});

app.post('/api/admin/reply', (req, res) => {
    const { targetUserId, replyText, originalMessage } = req.body;
    notifications.push({
        id: 'reply_' + Date.now(),
        type: 'admin-reply',
        targetUserId,
        text: `رد الأدمن على رسالتك ("${originalMessage}"): ${replyText}`,
        date: new Date().toLocaleString('ar-EG')
    });
    res.json({ success: true, message: "تم إرسال الرد للمستخدم بنجاح." });
});

// ==================== إدارة الحسابات للأدمن ====================
app.post('/api/admin/users', (req, res) => { res.json(allUsers); });

app.post('/api/admin/delete-user', (req, res) => {
    const { targetUserId } = req.body;
    allUsers = allUsers.filter(u => u.id !== targetUserId);
    bookings = bookings.filter(b => b.userId !== targetUserId);
    res.json({ success: true, message: "تم حذف حساب المستخدم وجميع حجوزاته نهائياً." });
});

app.post('/api/admin/ban-user', (req, res) => {
    const { targetUserId, days, hours } = req.body;
    const user = allUsers.find(u => u.id === targetUserId);
    if (!user) return res.json({ success: false, message: "المستخدم غير موجود" });

    const banDurationMs = (parseInt(days) * 24 * 60 * 60 * 1000) + (parseInt(hours) * 60 * 60 * 1000);
    user.banUntil = new Date(Date.now() + banDurationMs);
    res.json({ success: true, message: `تم حظر المستخدم بنجاح لمدة ${days} يوم و ${hours} ساعة.` });
});

app.post('/api/admin/unban-user', (req, res) => {
    const { targetUserId } = req.body;
    const user = allUsers.find(u => u.id === targetUserId);
    if (!user) return res.json({ success: false, message: "المستخدم غير موجود" });

    user.banUntil = null;
    res.json({ success: true, message: "تم إلغاء الحظر وتفعيل حساب المستخدم مجدداً." });
});

app.listen(PORT, () => console.log(`Server running smoothly on http://192.168.1.9:${PORT}`));