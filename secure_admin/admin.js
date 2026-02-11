// Supabase configuration
const SUPABASE_URL = 'https://jvpfhtptsmkxpfuzcfmj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2cGZodHB0c21reHBmdXpjZm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NDg2OTIsImV4cCI6MjA4NjEyNDY5Mn0.AR-bWlU8_TOKk6ddh_SRawBobf2VYhGqWu2uetr9UkE';

// Initialize Supabase variable
var supabaseAdmin = null;

let currentEditId = null;
let currentEditType = null;

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

// Initialize the admin panel
document.addEventListener('DOMContentLoaded', function () {
    loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2', function () {
        const checkSupabase = setInterval(() => {
            if (window.supabase) {
                clearInterval(checkSupabase);
                const { createClient } = window.supabase;
                supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                console.log('Admin Supabase initialized');

                updateStatistics();
                renderServices();
                renderNurses();
                renderMaterials();
                setupImageUploads();
                populateRegions();
            }
        }, 100);
    });
});

function setupImageUploads() {
    const serviceFile = document.getElementById('service-file');
    const nurseFile = document.getElementById('nurse-file');

    if (serviceFile) {
        serviceFile.onchange = (e) => handleFileUpload(e, 'service-image-url', 'service-preview');
    }
    if (nurseFile) {
        nurseFile.onchange = (e) => handleFileUpload(e, 'nurse-image-url', 'nurse-preview');
    }

    // Preview listeners for URL input
    document.getElementById('service-image-url').oninput = (e) => updatePreview(e.target.value, 'service-preview');
    document.getElementById('nurse-image-url').oninput = (e) => updatePreview(e.target.value, 'nurse-preview');
}

function updatePreview(url, previewId) {
    const img = document.getElementById(previewId);
    if (url) {
        img.src = url;
        img.style.display = 'block';
    } else {
        img.style.display = 'none';
    }
}

async function handleFileUpload(event, urlInputId, previewId) {
    const file = event.target.files[0];
    if (!file) return;

    const statusLabel = event.target.parentElement.querySelector('label');
    const originalLabel = statusLabel.innerHTML;
    statusLabel.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loading...';

    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        // Attempt upload to 'images' bucket (must exist and have public policy)
        const { data, error } = await supabaseAdmin.storage
            .from('images')
            .upload(filePath, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabaseAdmin.storage
            .from('images')
            .getPublicUrl(filePath);

        document.getElementById(urlInputId).value = publicUrl;
        updatePreview(publicUrl, previewId);
        statusLabel.innerHTML = originalLabel;
    } catch (error) {
        console.error('Upload error:', error);
        alert('Upload failed. Please ensure an "images" bucket exists in your Supabase Storage with public access, or just paste a URL.');
        statusLabel.innerHTML = originalLabel;
    }
}

// Helper function to load scripts dynamically
function loadScript(src, callback) {
    const script = document.createElement('script');
    script.src = src;
    script.onload = callback;
    document.head.appendChild(script);
}

function populateRegions() {
    const regionSelects = document.querySelectorAll('.region-select');
    regionSelects.forEach(select => {
        if (select) {
            // Keep the first option (placeholder) if it exists, otherwise clear
            const placeholder = select.options.length > 0 ? select.options[0] : null;
            select.innerHTML = '';
            if (placeholder) select.appendChild(placeholder);

            mauritanianRegions.forEach(region => {
                const option = document.createElement('option');
                option.value = region.name_ar;
                option.textContent = `${region.name_ar} / ${region.name_fr}`;
                select.appendChild(option);
            });
        }
    });
}

async function getAdminNurseLocation() {
    const btn = event.currentTarget;
    const latInput = document.getElementById('nurse-lat');
    const lngInput = document.getElementById('nurse-lng');

    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Locating...';

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                latInput.value = position.coords.latitude;
                lngInput.value = position.coords.longitude;
                btn.innerHTML = '<i class="fa-solid fa-check"></i> Found! / تم التحديد';
                btn.style.color = '#059669';
                btn.style.borderColor = '#059669';
            },
            (error) => {
                alert('Location error: ' + error.message);
                btn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Try Again';
            }
        );
    } else {
        alert('Geolocation not supported');
    }
}

// Update statistics
async function updateStatistics() {
    try {
        const { count: servicesCount, error: servicesError } = await supabaseAdmin
            .from('services')
            .select('*', { count: 'exact', head: true });

        const { count: nursesCount, error: nursesError } = await supabaseAdmin
            .from('nurses')
            .select('*', { count: 'exact', head: true });

        const { count: materialsCount, error: materialsError } = await supabaseAdmin
            .from('services')
            .select('*', { count: 'exact', head: true })
            .eq('category', 'material');

        const { count: nursingCount, error: nursingError } = await supabaseAdmin
            .from('services')
            .select('*', { count: 'exact', head: true })
            .eq('category', 'nursing');

        if (!servicesError && !nursesError && !materialsError && !nursingError) {
            document.getElementById('total-services').textContent = nursingCount || 0;
            document.getElementById('total-nurses').textContent = nursesCount || 0;
            document.getElementById('total-materials').textContent = materialsCount || 0;
        } else {
            console.error('Error updating statistics:', servicesError, nursesError, materialsError);
        }
    } catch (error) {
        console.error('Error updating statistics:', error);
    }
}

// Switch admin tabs
function switchAdminTab(event, tab) {
    // Update tab buttons
    document.querySelectorAll('.admin-tab').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

    // Update sections
    document.querySelectorAll('.admin-section').forEach(section => section.classList.remove('active'));
    document.getElementById(`${tab}-section`).classList.add('active');
}

// Render services
async function renderServices() {
    try {
        const { data: services, error } = await supabaseAdmin
            .from('services')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading services:', error);
            document.getElementById('services-list').innerHTML = '<p>Error loading services</p>';
            return;
        }

        const container = document.getElementById('services-list');

        if (!services || services.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 20px;">لا توجد خدمات / No services</p>';
            return;
        }

        container.innerHTML = services.map(service => `
            <div class="data-row">
                <div class="data-info">
                    <strong>${service.title_ar}</strong> / ${service.title_fr}
                    <br>
                    <small>${service.price} MRU - ${service.category === 'nursing' ? 'تمريض' : 'معدات'}</small>
                </div>
                <div class="data-actions">
                    <button class="btn-edit" onclick="editService('${service.id}')">
                        <i class="fa-solid fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="deleteService('${service.id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error rendering services:', error);
    }
}

// Render nurses
async function renderNurses() {
    try {
        const { data: nurses, error } = await supabaseAdmin
            .from('nurses')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading nurses:', error);
            document.getElementById('nurses-list').innerHTML = '<p>Error loading nurses</p>';
            return;
        }

        const container = document.getElementById('nurses-list');

        if (!nurses || nurses.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 20px;">لا يوجد ممرضين / No nurses</p>';
            return;
        }

        container.innerHTML = nurses.map(nurse => `
            <div class="data-row ${nurse.status === 'pending' ? 'pending-row' : ''}">
                <div class="data-info">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <strong>${nurse.name}</strong>
                        <span class="status-badge ${nurse.status === 'active' ? 'status-active' : 'status-pending'}">
                            ${nurse.status === 'active' ? 'Active' : 'Pending'}
                        </span>
                    </div>
                    <small>${nurse.specialty} - ${nurse.region}</small>
                </div>
                <div class="data-actions">
                    <button class="btn-edit" 
                            style="background: ${nurse.status === 'active' ? '#e11d48' : '#059669'}" 
                            onclick="toggleNurseStatus('${nurse.id}', '${nurse.status}')"
                            title="${nurse.status === 'active' ? 'Deactivate' : 'Activate'}">
                        <i class="fa-solid fa-${nurse.status === 'active' ? 'xmark' : 'check'}"></i>
                    </button>
                    <button class="btn-edit" onclick="editNurse('${nurse.id}')">
                        <i class="fa-solid fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="deleteNurse('${nurse.id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error rendering nurses:', error);
    }
}

// Render materials (same as services but only material category)
async function renderMaterials() {
    try {
        const { data: materials, error } = await supabaseAdmin
            .from('services')
            .select('*')
            .eq('category', 'material')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading materials:', error);
            document.getElementById('materials-list').innerHTML = '<p>Error loading materials</p>';
            return;
        }

        const container = document.getElementById('materials-list');

        if (!materials || materials.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 20px;">لا توجد مواد / No materials</p>';
            return;
        }

        container.innerHTML = materials.map(material => `
            <div class="data-row">
                <div class="data-info">
                    <strong>${material.title_ar}</strong> / ${material.title_fr}
                    <br>
                    <small>${material.price} MRU</small>
                </div>
                <div class="data-actions">
                    <button class="btn-edit" onclick="editMaterial('${material.id}')">
                        <i class="fa-solid fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="deleteMaterial('${material.id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error rendering materials:', error);
    }
}

// Service CRUD operations
function openServiceModal() {
    currentEditId = null;
    currentEditType = 'service';
    document.getElementById('service-form').reset();
    document.getElementById('service-preview').style.display = 'none';
    document.getElementById('service-modal').style.display = 'flex';
}

async function editService(id) {
    currentEditId = id;
    currentEditType = 'service';

    try {
        const { data: service, error } = await supabaseAdmin
            .from('services')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error loading service:', error);
            alert('Error loading service');
            return;
        }

        if (service) {
            document.getElementById('service-ar').value = service.title_ar;
            document.getElementById('service-fr').value = service.title_fr;
            document.getElementById('service-price').value = service.price;
            document.getElementById('service-category').value = service.category;
            const imageUrl = service.image_url || '';
            document.getElementById('service-image-url').value = imageUrl;
            updatePreview(imageUrl, 'service-preview');
            document.getElementById('service-modal').style.display = 'flex';
        }
    } catch (error) {
        console.error('Error editing service:', error);
    }
}

async function saveService(event) {
    event.preventDefault();

    const serviceData = {
        title_ar: document.getElementById('service-ar').value,
        title_fr: document.getElementById('service-fr').value,
        price: parseInt(document.getElementById('service-price').value),
        category: document.getElementById('service-category').value.trim().toLowerCase(),
        image_url: document.getElementById('service-image-url').value.trim() || 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300'
    };

    try {
        let result;
        if (currentEditId) {
            // Update existing service
            result = await supabaseAdmin
                .from('services')
                .update(serviceData)
                .eq('id', currentEditId);
        } else {
            // Add new service
            result = await supabaseAdmin
                .from('services')
                .insert(serviceData);
        }

        if (result.error) {
            console.error('Error saving service:', result.error);
            alert('Error saving service: ' + result.error.message);
            return;
        }

        closeModal('service-modal');
        updateStatistics();
        renderServices();
        renderMaterials();
        alert('تم الحفظ بنجاح! / Saved successfully!');
    } catch (error) {
        console.error('Error saving service:', error);
        alert('Error saving service');
    }
}

async function deleteService(id) {
    if (confirm('هل أنت متأكد من الحذف؟ / Are you sure you want to delete?')) {
        try {
            const { error } = await supabaseAdmin
                .from('services')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting service:', error);
                alert('Error deleting service: ' + error.message);
                return;
            }

            updateStatistics();
            renderServices();
            renderMaterials();
            alert('تم الحذف بنجاح! / Deleted successfully!');
        } catch (error) {
            console.error('Error deleting service:', error);
            alert('Error deleting service');
        }
    }
}

// Nurse CRUD operations
function openNurseModal() {
    currentEditId = null;
    currentEditType = 'nurse';
    document.getElementById('nurse-form').reset();
    document.getElementById('nurse-preview').style.display = 'none';
    document.getElementById('nurse-modal').style.display = 'flex';
}

async function editNurse(id) {
    currentEditId = id;
    currentEditType = 'nurse';

    try {
        const { data: nurse, error } = await supabaseAdmin
            .from('nurses')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error loading nurse:', error);
            alert('Error loading nurse');
            return;
        }

        if (nurse) {
            document.getElementById('nurse-name').value = nurse.name;
            document.getElementById('nurse-specialty').value = nurse.specialty;
            document.getElementById('nurse-phone').value = nurse.phone;
            document.getElementById('nurse-region').value = nurse.region;

            // GPS Fields
            document.getElementById('nurse-lat').value = nurse.lat || '';
            document.getElementById('nurse-lng').value = nurse.lng || '';

            if (document.getElementById('nurse-rating')) {
                document.getElementById('nurse-rating').value = nurse.rating;
            }
            const imageUrl = nurse.image_url || '';
            document.getElementById('nurse-image-url').value = imageUrl;
            updatePreview(imageUrl, 'nurse-preview');
            document.getElementById('nurse-modal').style.display = 'flex';
        }
    } catch (error) {
        console.error('Error editing nurse:', error);
    }
}

async function saveNurse(event) {
    event.preventDefault();

    const nurseData = {
        name: document.getElementById('nurse-name').value,
        specialty: document.getElementById('nurse-specialty').value,
        phone: document.getElementById('nurse-phone').value,
        region: document.getElementById('nurse-region').value,
        lat: parseFloat(document.getElementById('nurse-lat').value) || null,
        lng: parseFloat(document.getElementById('nurse-lng').value) || null,
        image_url: document.getElementById('nurse-image-url').value.trim() || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150'
    };

    try {
        let result;
        if (currentEditId) {
            // Update existing nurse
            result = await supabaseAdmin
                .from('nurses')
                .update(nurseData)
                .eq('id', currentEditId);
        } else {
            // Add new nurse
            result = await supabaseAdmin
                .from('nurses')
                .insert(nurseData);
        }

        if (result.error) {
            console.error('Error saving nurse:', result.error);
            alert('Error saving nurse: ' + result.error.message);
            return;
        }

        closeModal('nurse-modal');
        updateStatistics();
        renderNurses();
        alert('تم الحفظ بنجاح! / Saved successfully!');
    } catch (error) {
        console.error('Error saving nurse:', error);
        alert('Error saving nurse');
    }
}

async function toggleNurseStatus(id, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'pending' : 'active';
    try {
        const { error } = await supabaseAdmin
            .from('nurses')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) throw error;

        renderNurses();
        updateStatistics();
    } catch (error) {
        console.error('Error toggling nurse status:', error);
        alert('Error updating status');
    }
}

async function deleteNurse(id) {
    if (confirm('هل أنت متأكد من الحذف؟ / Are you sure you want to delete?')) {
        try {
            const { error } = await supabaseAdmin
                .from('nurses')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting nurse:', error);
                alert('Error deleting nurse: ' + error.message);
                return;
            }

            updateStatistics();
            renderNurses();
            alert('تم الحذف بنجاح! / Deleted successfully!');
        } catch (error) {
            console.error('Error deleting nurse:', error);
            alert('Error deleting nurse');
        }
    }
}

// Material CRUD operations (alias for service operations)
function openMaterialModal() {
    openServiceModal();
    // Set default category to material
    setTimeout(() => {
        document.getElementById('service-category').value = 'material';
    }, 100);
}

function editMaterial(id) {
    editService(id);
}

function deleteMaterial(id) {
    deleteService(id);
}

// Modal operations
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    currentEditId = null;
    currentEditType = null;
}

// Close modal when clicking outside
window.onclick = function (event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        currentEditId = null;
        currentEditType = null;
    }
}

// Export data functionality
async function exportData() {
    try {
        const { data: services } = await supabaseAdmin.from('services').select('*');
        const { data: nurses } = await supabaseAdmin.from('nurses').select('*');

        const data = {
            services: services || [],
            nurses: nurses || [],
            exportDate: new Date().toISOString()
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = `ra3aya-data-${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    } catch (error) {
        console.error('Error exporting data:', error);
        alert('Error exporting data');
    }
}

// Import data functionality
async function importData(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = async function (e) {
            try {
                const data = JSON.parse(e.target.result);

                // Import services
                if (data.services && data.services.length > 0) {
                    const { error: servicesError } = await supabaseAdmin
                        .from('services')
                        .upsert(data.services);

                    if (servicesError) {
                        console.error('Error importing services:', servicesError);
                    }
                }

                // Import nurses
                if (data.nurses && data.nurses.length > 0) {
                    const { error: nursesError } = await supabaseAdmin
                        .from('nurses')
                        .upsert(data.nurses);

                    if (nursesError) {
                        console.error('Error importing nurses:', nursesError);
                    }
                }

                updateStatistics();
                renderServices();
                renderNurses();
                renderMaterials();
                alert('تم الاستيراد بنجاح! / Imported successfully!');
            } catch (error) {
                alert('خطأ في الملف / File error: ' + error.message);
            }
        };
        reader.readAsText(file);
    }
}

// Logout function
function logout() {
    if (confirm('هل تريد تسجيل الخروج؟ / Do you want to logout?')) {
        window.location.href = 'index.html';
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function (event) {
    // ESC to close modals
    if (event.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => {
            if (modal.style.display === 'flex') {
                modal.style.display = 'none';
            }
        });
        currentEditId = null;
        currentEditType = null;
    }

    // Ctrl+S to save (when modal is open)
    if (event.ctrlKey && event.key === 's') {
        const openModal = document.querySelector('.modal[style*="flex"]');
        if (openModal) {
            event.preventDefault();
            if (openModal.id === 'service-modal') {
                document.getElementById('service-form').dispatchEvent(new Event('submit'));
            } else if (openModal.id === 'nurse-modal') {
                document.getElementById('nurse-form').dispatchEvent(new Event('submit'));
            }
        }
    }
});
