// Supabase configuration
const SUPABASE_URL = 'https://jvpfhtptsmkxpfuzcfmj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2cGZodHB0c21reHBmdXpjZm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NDg2OTIsImV4cCI6MjA4NjEyNDY5Mn0.AR-bWlU8_TOKk6ddh_SRawBobf2VYhGqWu2uetr9UkE';

// Use a safe variable name to avoid conflicts with global library objects
let supabase = null;

// Initialize Supabase client after library loads
function initializeSupabase() {
    if (window.supabase) {
        const { createClient } = window.supabase;
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase initialized successfully');
        console.log('Supabase URL:', SUPABASE_URL);

        // Test connection
        testConnection();

        // Enable tab buttons after successful initialization
        enableTabButtons();
    } else {
        console.error('Supabase library not loaded');
        // Retry initialization after a delay
        setTimeout(() => {
            if (!supabase && window.supabase) {
                initializeSupabase();
            }
        }, 2000);
    }
}

// Enable tab buttons after Supabase is ready
function enableTabButtons() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
    });
}

// Test database connection
async function testConnection() {
    try {
        console.log('Testing database connection...');
        const { data, error } = await supabase.from('services').select('count', { count: 'exact', head: true });
        if (error) {
            console.error('Database connection error:', error);
        } else {
            console.log('Database connected successfully! Services count:', data);
        }
    } catch (err) {
        console.error('Connection test failed:', err);
    }
}

// Nouakchott District Regions
const mauritanianRegions = [
    { id: 1, name_ar: 'تفرغ زينة', name_fr: 'Tevragh Zeina' },
    { id: 2, name_ar: 'لكصر', name_fr: 'Lakzar' },
    { id: 3, name_ar: 'تيارت', name_fr: 'Teyarett' },
    { id: 4, name_ar: 'توجنين', name_fr: 'Toujounine' },
    { id: 5, name_ar: 'عرفات', name_fr: 'Arafat' },
    { id: 6, name_ar: 'الرياض', name_fr: 'Riad' },
    { id: 7, name_ar: 'الميناء', name_fr: 'El Mina' },
    { id: 8, name_ar: 'السبخة', name_fr: 'Sebkha' },
    { id: 9, name_ar: 'دار النعيم', name_fr: 'Dar Naim' }
];

// Storage Helper (Capacitor/Web Fallback)
const Storage = {
    async set(key, value) {
        const val = typeof value === 'string' ? value : JSON.stringify(value);
        if (window.Capacitor && window.Capacitor.Plugins.Preferences) {
            await window.Capacitor.Plugins.Preferences.set({ key, value: val });
        } else {
            localStorage.setItem(key, val);
        }
    },
    async get(key) {
        let val;
        if (window.Capacitor && window.Capacitor.Plugins.Preferences) {
            const { value } = await window.Capacitor.Plugins.Preferences.get({ key });
            val = value;
        } else {
            val = localStorage.getItem(key);
        }
        try {
            return JSON.parse(val);
        } catch {
            return val;
        }
    }
};

let userData = {
    name: '',
    phone: '',
    lat: '',
    lng: '',
    manualLoc: '',
    region: '',
    deviceId: ''
};

async function initDeviceId() {
    let id = await Storage.get('deviceId');
    if (!id) {
        id = 'dev_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        await Storage.set('deviceId', id);
    }
    userData.deviceId = id;
    console.log('Device ID:', id);
}

let selectedService = null;
let currentScreen = 'splash-screen';

// 1. Splash Screen Logic
window.onload = async () => {
    // Initialize Device ID and Load Data
    await initDeviceId();
    const savedData = await Storage.get('userData');
    if (savedData) {
        userData = { ...userData, ...savedData };
    }

    // Check if Supabase is already loaded
    if (window.supabase) {
        initializeSupabase();
        setTimeout(() => {
            populateRegions();
            checkAutoForward();
        }, 500);
    } else {
        loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/dist/umd/supabase.js', async function () {
            setTimeout(() => {
                initializeSupabase();
                populateRegions();
                checkAutoForward();
            }, 500);
        });
    }


};

// Helper function to load scripts dynamically
function loadScript(src, callback) {
    const script = document.createElement('script');
    script.src = src;
    script.onload = callback;
    document.head.appendChild(script);
}

// Function to populate regions dropdown
function populateRegions() {
    const regionSelects = document.querySelectorAll('.region-select');
    regionSelects.forEach(select => {
        if (select) {
            // Keep the first option (placeholder)
            const placeholder = select.options[0];
            select.innerHTML = '';
            select.appendChild(placeholder);

            mauritanianRegions.forEach(region => {
                const option = document.createElement('option');
                option.value = region.name_ar;
                option.textContent = `${region.name_ar} / ${region.name_fr}`;
                select.appendChild(option);
            });
        }
    });
}

// 2. Screen Navigation
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    const target = document.getElementById(screenId);
    if (target) target.classList.add('active');
    currentScreen = screenId;
}

function checkAutoForward() {
    // If we have name and phone, skip welcome screens and go to home
    if (userData.name && userData.phone) {
        const displayEl = document.getElementById('display-name');
        if (displayEl) {
            displayEl.textContent = `مرحباً، ${userData.name.split(' ')[0]}`;
        }
        showScreen('home-screen');
        switchTab('nursing');
    } else {
        showScreen('splash-screen');
    }
}

function goBack() {
    if (currentScreen === 'home-screen') {
        showScreen('login-screen');
    } else if (currentScreen === 'checkout-screen') {
        showScreen('home-screen');
    }
}

// 3. User Data Collection
async function collectUserData() {
    userData.name = document.getElementById('user-name').value;
    userData.phone = document.getElementById('user-phone').value;
    userData.region = document.getElementById('user-region').value;
    userData.manualLoc = document.getElementById('manual-location').value;

    if (!userData.name || !userData.phone || !userData.region) {
        alert("يرجى ملء جميع الحقول المطلوبة / Please fill all required fields");
        return false;
    }

    // Save to local storage for "remember me" functionality
    await Storage.set('userData', userData);
    return true;
}

async function goToHome() {
    if (await collectUserData()) {
        const displayEl = document.getElementById('display-name');
        if (displayEl) {
            displayEl.textContent = `مرحباً، ${userData.name.split(' ')[0]}`;
        }
        showScreen('home-screen');
        switchTab('nursing');
    }
}

// 4. Location Services
function getLocation() {
    const statusEl = document.getElementById('location-status');
    const btn = event.currentTarget; // Get the button that called the function

    statusEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري تحديد الموقع... / Getting location...';
    statusEl.style.color = 'var(--primary)';

    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    };

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userData.lat = position.coords.latitude;
                userData.lng = position.coords.longitude;
                statusEl.innerHTML = '<i class="fa-solid fa-circle-check"></i> تم تحديد الموقع بنجاح! / Localisation réussie!';
                statusEl.style.color = '#059669';

                // Visual feedback on button
                if (btn && btn.classList.contains('btn-outline')) {
                    btn.style.borderColor = '#059669';
                    btn.style.color = '#059669';
                    btn.innerHTML = '<i class="fa-solid fa-check"></i> تم التحديد / Localisé';
                }
            },
            (error) => {
                let errorMsg = 'فشل تحديد الموقع / Échec de la localisation';
                if (error.code === 1) errorMsg = 'يرجى تفعيل صلاحية الموقع / Veuillez autoriser la localisation';

                statusEl.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${errorMsg}`;
                statusEl.style.color = '#e11d48';
                console.error('Geolocation error:', error);
            },
            options
        );
    } else {
        statusEl.textContent = 'المتصفح لا يدعم تحديد الموقع / Navigation non supportée';
    }
}

// 5. Tab Navigation
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Handle click on children elements
    const clickedBtn = event.target.closest('.tab-btn');
    if (clickedBtn) {
        clickedBtn.classList.add('active');
    }

    // Check if Supabase is initialized
    if (!supabase) {
        document.getElementById('content-area').innerHTML = '<div class="loading"></div>';
        return;
    }

    // Show loading skeleton
    document.getElementById('content-area').innerHTML = '<div class="loading"></div>';

    // Show/Hide Floating Add Nurse Button
    const addNurseBtn = document.getElementById('btn-add-nurse');
    if (addNurseBtn) {
        if (tabName === 'nurses') {
            addNurseBtn.classList.add('visible');
        } else {
            addNurseBtn.classList.remove('visible');
        }
    }

    // Load corresponding data
    if (tabName === 'nursing') {
        loadServices('nursing');
    } else if (tabName === 'material') {
        loadServices('material');
    } else if (tabName === 'nurses') {
        loadNurses();
    }
}

// 6. Data Loading Functions
async function loadServices(category = null) {
    if (!supabase) return;

    const cacheKey = `cache_services_${category || 'all'}`;

    // 1. Try to load and show cached data immediately (Offline-First)
    const cachedData = await Storage.get(cacheKey);
    if (cachedData) {
        console.log('Showing cached services for:', category);
        renderServices(cachedData);
    } else {
        document.getElementById('content-area').innerHTML = '<div class="loading"></div>';
    }

    try {
        let query = supabase.from('services').select('*').order('created_at', { ascending: false });

        if (category) {
            query = query.eq('category', category);
        }

        const { data: services, error } = await query;

        if (!error && services) {
            console.log('Fetched fresh services, updating cache...');
            // 2. Update cache and re-render
            await Storage.set(cacheKey, services);
            renderServices(services);
        } else if (error && !cachedData) {
            document.getElementById('content-area').innerHTML = '<p>Error loading services</p>';
        }
    } catch (error) {
        console.error('Network error fetching services:', error);
        if (!cachedData) {
            document.getElementById('content-area').innerHTML = '<p>Network error.</p>';
        }
    }
}

async function loadNurses() {
    if (!supabase) return;

    const cacheKey = 'cache_nurses';

    // 1. Try to load and show cached data immediately
    const cachedData = await Storage.get(cacheKey);
    if (cachedData) {
        console.log('Showing cached nurses');
        renderNurses(cachedData);
    } else {
        document.getElementById('content-area').innerHTML = '<div class="loading"></div>';
    }

    try {
        const { data: nurses, error } = await supabase
            .from('nurses')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && nurses) {
            console.log('Fetched fresh nurses, updating cache...');
            // 2. Update cache and re-render
            await Storage.set(cacheKey, nurses);
            renderNurses(nurses);
        } else if (error && !cachedData) {
            document.getElementById('content-area').innerHTML = '<p>Error loading nurses</p>';
        }
    } catch (error) {
        console.error('Network error fetching nurses:', error);
        if (!cachedData) {
            document.getElementById('content-area').innerHTML = '<p>Network error.</p>';
        }
    }
}

// 7. Data Rendering Functions
function renderServices(items) {
    if (!items || items.length === 0) {
        document.getElementById('content-area').innerHTML = "<p style='text-align:center'>لا توجد خدمات / Aucun service</p>";
        return;
    }
    const html = items.map(item => `
        <div class="card" onclick='selectService(${JSON.stringify(item).replace(/'/g, "&#39;")})'>
            <div class="card-image">
                <img src="${item.image_url}" alt="${item.title_ar}" onerror="this.src='https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300'">
            </div>
            <div class="card-content">
                <div class="card-title">
                    <h4>${item.title_ar}</h4>
                    <p>${item.title_fr}</p>
                </div>
                <div class="card-price">${item.price} MRU</div>
            </div>
        </div>
    `).join('');
    document.getElementById('content-area').innerHTML = html;
}

// Haversine formula to calculate distance between two points in KM
function calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d.toFixed(1);
}

function renderNurses(items) {
    if (!items || items.length === 0) {
        document.getElementById('content-area').innerHTML = "<p style='text-align:center'>لا يوجد ممرضين / Aucun infirmier</p>";
        return;
    }

    // Sort by distance if user location is available
    if (userData.lat && userData.lng) {
        items.sort((a, b) => {
            const distA = a.lat && a.lng ? calculateDistance(userData.lat, userData.lng, a.lat, a.lng) : 9999;
            const distB = b.lat && b.lng ? calculateDistance(userData.lat, userData.lng, b.lat, b.lng) : 9999;
            return distA - distB;
        });
    }

    const html = items.map(item => {
        const distance = (userData.lat && userData.lng && item.lat && item.lng)
            ? calculateDistance(userData.lat, userData.lng, item.lat, item.lng)
            : null;

        return `
            <div class="card nurse-card" style="cursor:default">
                <div class="nurse-avatar">
                    <img src="${item.image_url || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150'}" 
                         alt="${item.name}" 
                         onerror="this.src='https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150'">
                </div>
                <div class="nurse-info">
                    <div class="nurse-name">
                        <h4>${item.name}</h4>
                        ${distance ? `<span class="distance-tag"><i class="fa-solid fa-location-arrow"></i> ${distance} km</span>` : ''}
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <p class="nurse-specialty">${item.specialty}</p>
                    </div>
                    <p class="nurse-region"><i class="fa-solid fa-map-marker-alt"></i> ${item.region}</p>
                </div>
            </div>
        `;
    }).join('');
    document.getElementById('content-area').innerHTML = html;
}

// 8. Service Selection
function selectService(service) {
    selectedService = service;
    showScreen('checkout-screen');
    displayInvoice();
}

// 9. Checkout and Invoice
function displayInvoice() {
    if (!selectedService) return;

    // Correct IDs from index.html
    const serviceEl = document.getElementById('invoice-service');
    const priceEl = document.getElementById('invoice-price');

    if (serviceEl) {
        serviceEl.textContent = `${selectedService.title_ar} / ${selectedService.title_fr}`;
    }
    if (priceEl) {
        priceEl.textContent = `${selectedService.price} MRU`;
    }
}

// Interactivity for Facture
function toggleBankDetails(show) {
    const bankDetails = document.getElementById('bank-details');
    if (bankDetails) {
        bankDetails.style.display = show ? 'block' : 'none';
    }
}

function copyValue(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        const originalIcon = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i>';
        btn.classList.add('success');
        setTimeout(() => {
            btn.innerHTML = originalIcon;
            btn.classList.remove('success');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

function handleFileSelect(input) {
    const preview = document.getElementById('file-preview');
    const label = document.getElementById('screenshot-label');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.innerHTML = `<img src="${e.target.result}" style="max-height: 100px; border-radius: 8px; margin-top: 10px;">`;
            label.style.borderColor = 'var(--primary)';
            label.querySelector('span').textContent = 'تم اختيار الوصل / Reçu sélectionné';
        }
        reader.readAsDataURL(input.files[0]);
    }
}

async function uploadReceipt(file) {
    if (!supabase) return null;
    const fileName = `receipts/${userData.phone}_${Date.now()}.jpg`;
    const { data, error } = await supabase.storage
        .from('images')
        .upload(fileName, file);

    if (error) {
        console.error('Upload error:', error);
        return null;
    }
    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
    return publicUrl;
}

async function sendOrderToWhatsapp() {
    const paymentMethod = document.querySelector('input[name="payment"]:checked');
    if (!paymentMethod) {
        alert("يرجى اختيار طريقة الدفع / Please select payment method");
        return;
    }

    if (!selectedService) return;

    const confirmBtn = document.getElementById('btn-confirm-order');
    const btnText = document.getElementById('btn-text');
    const btnLoader = document.getElementById('btn-loader');
    const fileInput = document.getElementById('payment-screenshot');

    let receiptUrl = null;

    if (paymentMethod.value === 'Bank' && fileInput.files[0]) {
        confirmBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';

        receiptUrl = await uploadReceipt(fileInput.files[0]);

        if (!receiptUrl) {
            alert("فشل رفع الصورة، يرجى المحاولة لاحقاً / Échec de l'envoi de l'image");
            confirmBtn.disabled = false;
            btnText.style.display = 'inline-block';
            btnLoader.style.display = 'none';
            return;
        }
    }

    // Create WhatsApp message
    const locationStr = userData.lat && userData.lng
        ? `GPS: https://maps.google.com/?q=${userData.lat},${userData.lng}`
        : userData.region || 'غير محدد / Not specified';

    let message = `
*رعاية - طلب جديد / Riaaya - Commande*
━━━━━━━━━━━━━━━━━━━━
👤 *الاسم / Nom:* ${userData.name}
📞 *الهاتف / Tel:* ${userData.phone}
📍 *الموقع / Lieu:* ${locationStr}
🏥 *الخدمة / Service:* ${selectedService.title_ar} (${selectedService.title_fr})
💰 *السعر / Prix:* ${selectedService.price} MRU
💳 *الدفع / Paiement:* ${paymentMethod.value === 'Bank' ? 'بنكي / Banque' : 'نقداً / Cash'}
━━━━━━━━━━━━━━━━━━━━
`.trim();

    if (receiptUrl) {
        message += `\n📸 *الوصل / Reçu:* ${receiptUrl}`;
    }

    // Admin WhatsApp number
    const adminPhone = '22212345678';
    const url = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;

    // Reset button after a small delay
    setTimeout(() => {
        confirmBtn.disabled = false;
        btnText.style.display = 'inline-block';
        btnLoader.style.display = 'none';
    }, 2000);

    window.open(url, '_blank');
}

function confirmOrder() {
    sendOrderToWhatsapp();
}

// 10. Admin Functions
function showAdminModal() {
    const pin = prompt("Enter admin PIN:");
    if (pin === '5544') {
        document.getElementById('admin-modal').style.display = 'flex';
    } else if (pin) {
        alert("Incorrect PIN");
    }
}

function hideAdminModal() {
    document.getElementById('admin-modal').style.display = 'none';
}

// Admin form submissions
async function addServiceToDb() {
    if (!supabase) {
        alert("Database not connected");
        return;
    }

    const ar = document.getElementById('new-service-ar').value;
    const fr = document.getElementById('new-service-fr').value;
    const price = document.getElementById('new-price').value;
    const cat = document.getElementById('new-category').value;

    if (!ar || !fr || !price) {
        alert("Please fill all fields");
        return;
    }

    try {
        const { error } = await supabase.from('services').insert({
            title_ar: ar,
            title_fr: fr,
            price: price,
            category: cat
        });

        if (!error) {
            alert("Service Added Successfully!");
            document.getElementById('new-service-ar').value = "";
            document.getElementById('new-service-fr').value = "";
            document.getElementById('new-price').value = "";
            loadServices(); // Refresh the list
        } else {
            console.error(error);
            alert("Error adding service: " + error.message);
        }
    } catch (error) {
        console.error('Error adding service:', error);
        alert("Error adding service");
    }
}

async function addNurseToDb() {
    if (!supabase) {
        alert("Database not connected");
        return;
    }

    const name = document.getElementById('new-nurse-name').value;
    const specialty = document.getElementById('new-nurse-specialty').value;
    const phone = document.getElementById('new-nurse-phone').value;
    const region = document.getElementById('new-nurse-region').value;

    if (!name || !specialty || !phone || !region) {
        alert("Please fill all fields");
        return;
    }

    try {
        const { error } = await supabase.from('nurses').insert({
            name: name,
            specialty: specialty,
            phone: phone,
            region: region,
            rating: 4.5 // Default rating
        });

        if (!error) {
            alert("Nurse Added Successfully!");
            document.getElementById('new-nurse-name').value = "";
            document.getElementById('new-nurse-specialty').value = "";
            document.getElementById('new-nurse-phone').value = "";
            document.getElementById('new-nurse-region').value = "";
            loadNurses(); // Refresh the list
        } else {
            console.error(error);
            alert("Error adding nurse: " + error.message);
        }
    } catch (error) {
        console.error('Error adding nurse:', error);
        alert("Error adding nurse");
    }
}

// Nurse Registration Logic
let tempNurseLocation = { lat: null, lng: null };

async function fixNurseLocation() {
    const statusEl = document.getElementById('nurse-location-status');
    const btn = document.getElementById('btn-fix-location');

    statusEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري تحديد موقعك المهني...';

    try {
        const pos = await getCurrentLocation();
        tempNurseLocation.lat = pos.lat;
        tempNurseLocation.lng = pos.lng;

        statusEl.innerHTML = '<i class="fa-solid fa-circle-check"></i> تم تثبيت الموقع المهني بنجاح!';
        btn.innerHTML = '<i class="fa-solid fa-check"></i> تم التثبيت / Localisé';
        btn.classList.add('success');
    } catch (err) {
        statusEl.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> فشل التحديد، تأكد من تشغيل GPS';
        console.error(err);
    }
}

async function submitNurseProfile() {
    const name = document.getElementById('nurse-name-reg').value;
    const phone = document.getElementById('nurse-phone-reg').value;
    const specialty = document.getElementById('nurse-specialty-reg').value;
    const region = document.getElementById('nurse-region-reg').value;

    if (!name || !phone || !specialty || !region || region === "") {
        alert("يرجى اختيار المنطقة وملء جميع البيانات / Veuillez choisir une région et remplir tous les champs");
        return;
    }

    if (!tempNurseLocation.lat) {
        alert("يرجى تثبيت موقعك الجغرافي أولاً / Veuillez fixer votre localisation GPS");
        return;
    }

    try {
        const { error } = await supabase.from('nurses').insert({
            name: name,
            phone: phone,
            specialty: specialty,
            region: region,
            lat: tempNurseLocation.lat,
            lng: tempNurseLocation.lng,
            status: 'pending' // For admin review
        });

        if (!error) {
            alert("تم إرسال ملفك بنجاح! سيتم مراجعته قريباً / Profil envoyé avec succès!");
            showScreen('home-screen');
        } else {
            throw error;
        }
    } catch (err) {
        alert("حدث خطأ أثناء التسجيل / Erreur lors de l'inscription");
        console.error(err);
    }
}

// 11. Utility Functions
function formatPhone(phone) {
    // Format phone number for WhatsApp
    return phone.replace(/[^0-9]/g, '');
}

function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            position => resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude
            }),
            error => reject(error)
        );
    });
}

// 12. Native Integration (Capacitor)
async function initNativeFeatures() {
    if (!window.Capacitor) return;

    const { PushNotifications } = window.Capacitor.Plugins;
    const { App } = window.Capacitor.Plugins;

    // Handle Hardware Back Button (Android)
    if (App) {
        App.addListener('backButton', ({ canGoBack }) => {
            if (currentScreen !== 'home-screen' && currentScreen !== 'welcome-screen') {
                goBack();
            } else {
                App.exitApp();
            }
        });

        // Handle Deep Links (App Url Open)
        App.addListener('appUrlOpen', (data) => {
            console.log('App opened with URL:', data.url);
            // Example: riaya://service/123
            const url = new URL(data.url);
            const path = url.pathname;
            // You can add custom routing logic here
        });
    }

    // Push Notifications Logic
    if (PushNotifications) {
        // Request permissions
        let permStatus = await PushNotifications.checkPermissions();
        if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive === 'granted') {
            await PushNotifications.register();
        }

        // Token registration
        PushNotifications.addListener('registration', (token) => {
            console.log('Push registration success, token: ' + token.value);
            // In a real app, send this token to Supabase/FCM
        });

        // Error notification
        PushNotifications.addListener('registrationError', (error) => {
            console.error('Error on registration: ' + JSON.stringify(error));
        });

        // Handle notification received while app is open
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('Push received: ' + JSON.stringify(notification));
            alert(notification.title + ': ' + notification.body);
        });

        // Handle notification click
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
            console.log('Push action performed: ' + JSON.stringify(notification));
        });
    }
}

// Invoke native init if available
initNativeFeatures();