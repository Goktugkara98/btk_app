/**
 * Profile Information Section JavaScript
 * Handles form interactions, validation, and data management
 */

class ProfileInfoSection {
    constructor() {
        this.form = null;
        this.isEditing = false;
        this.originalData = {};
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadUserData();
    }

    bindEvents() {
        // Edit button
        const editBtn = document.querySelector('.btn-edit-profile');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.toggleEditMode());
        }

        // Save button
        const saveBtn = document.querySelector('.btn-save-profile');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveProfile());
        }

        // Cancel button
        const cancelBtn = document.querySelector('.btn-cancel-edit');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.cancelEdit());
        }

        // Form validation
        this.form = document.querySelector('.profile-info-form');
        if (this.form) {
            this.form.addEventListener('input', (e) => this.validateField(e.target));
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProfile();
            });
        }

        // Avatar upload
        const avatarUpload = document.querySelector('.avatar-upload');
        if (avatarUpload) {
            avatarUpload.addEventListener('change', (e) => this.handleAvatarUpload(e));
        }
    }

    loadUserData() {
        // Simulate loading user data from server
        const userData = {
            username: 'johndoe',
            email: 'john.doe@example.com',
            firstName: 'John',
            lastName: 'Doe',
            phone: '+90 555 123 4567',
            birthDate: '1990-05-15',
            gender: 'male',
            location: 'İstanbul, Türkiye',
            bio: 'Yazılım geliştirici ve teknoloji meraklısı. Quiz çözmeyi seviyorum!',
            website: 'https://johndoe.dev',
            twitter: '@johndoe',
            linkedin: 'linkedin.com/in/johndoe',
            github: 'github.com/johndoe',
            joinDate: '2024-01-15',
            lastLogin: '2024-03-20 14:30',
            status: 'active'
        };

        this.populateForm(userData);
        this.originalData = { ...userData };
    }

    populateForm(data) {
        const fields = [
            'username', 'email', 'firstName', 'lastName', 'phone',
            'birthDate', 'gender', 'location', 'bio', 'website',
            'twitter', 'linkedin', 'github'
        ];

        fields.forEach(field => {
            const element = document.querySelector(`[name="${field}"]`);
            if (element && data[field]) {
                element.value = data[field];
            }
        });

        // Update display fields
        this.updateDisplayFields(data);
    }

    updateDisplayFields(data) {
        // Update join date
        const joinDateElement = document.querySelector('.join-date');
        if (joinDateElement) {
            joinDateElement.textContent = this.formatDate(data.joinDate);
        }

        // Update last login
        const lastLoginElement = document.querySelector('.last-login');
        if (lastLoginElement) {
            lastLoginElement.textContent = this.formatDateTime(data.lastLogin);
        }

        // Update status
        const statusElement = document.querySelector('.user-status');
        if (statusElement) {
            statusElement.textContent = this.getStatusText(data.status);
            statusElement.className = `status-indicator status-${data.status}`;
        }
    }

    toggleEditMode() {
        this.isEditing = !this.isEditing;
        
        const formFields = document.querySelectorAll('.profile-info-form input, .profile-info-form select, .profile-info-form textarea');
        const editBtn = document.querySelector('.btn-edit-profile');
        const saveBtn = document.querySelector('.btn-save-profile');
        const cancelBtn = document.querySelector('.btn-cancel-edit');

        formFields.forEach(field => {
            field.disabled = !this.isEditing;
        });

        if (this.isEditing) {
            editBtn.style.display = 'none';
            saveBtn.style.display = 'inline-flex';
            cancelBtn.style.display = 'inline-flex';
            this.showNotification('Düzenleme moduna geçtiniz', 'info');
        } else {
            editBtn.style.display = 'inline-flex';
            saveBtn.style.display = 'none';
            cancelBtn.style.display = 'none';
        }
    }

    async saveProfile() {
        if (!this.validateForm()) {
            this.showNotification('Lütfen form hatalarını düzeltin', 'error');
            return;
        }

        const formData = this.getFormData();
        
        try {
            // Show loading state
            const saveBtn = document.querySelector('.btn-save-profile');
            const originalText = saveBtn.innerHTML;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Kaydediliyor...';
            saveBtn.disabled = true;

            // Simulate API call
            await this.simulateApiCall(formData);

            // Update original data
            this.originalData = { ...this.originalData, ...formData };
            
            // Exit edit mode
            this.toggleEditMode();
            
            this.showNotification('Profil bilgileri başarıyla güncellendi', 'success');
            
        } catch (error) {
            this.showNotification('Güncelleme sırasında bir hata oluştu', 'error');
        } finally {
            // Reset button
            const saveBtn = document.querySelector('.btn-save-profile');
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        }
    }

    cancelEdit() {
        // Restore original data
        this.populateForm(this.originalData);
        
        // Exit edit mode
        this.toggleEditMode();
        
        this.showNotification('Değişiklikler iptal edildi', 'info');
    }

    getFormData() {
        const formData = {};
        const form = document.querySelector('.profile-info-form');
        
        if (form) {
            const formElements = form.elements;
            for (let element of formElements) {
                if (element.name) {
                    formData[element.name] = element.value;
                }
            }
        }
        
        return formData;
    }

    validateForm() {
        let isValid = true;
        const requiredFields = ['username', 'email', 'firstName', 'lastName'];
        
        requiredFields.forEach(fieldName => {
            const field = document.querySelector(`[name="${fieldName}"]`);
            if (field && !this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        // Remove existing error
        this.removeFieldError(field);

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'Bu alan zorunludur';
        }

        // Email validation
        if (fieldName === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Geçerli bir e-posta adresi girin';
            }
        }

        // Username validation
        if (fieldName === 'username' && value) {
            const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
            if (!usernameRegex.test(value)) {
                isValid = false;
                errorMessage = 'Kullanıcı adı 3-20 karakter arasında olmalı ve sadece harf, rakam ve alt çizgi içerebilir';
            }
        }

        // Phone validation
        if (fieldName === 'phone' && value) {
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
            if (!phoneRegex.test(value)) {
                isValid = false;
                errorMessage = 'Geçerli bir telefon numarası girin';
            }
        }

        // Website validation
        if (fieldName === 'website' && value) {
            const urlRegex = /^https?:\/\/.+/;
            if (!urlRegex.test(value)) {
                isValid = false;
                errorMessage = 'Geçerli bir URL girin (http:// veya https:// ile başlamalı)';
            }
        }

        // Show error if invalid
        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    showFieldError(field, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
        field.classList.add('error');
    }

    removeFieldError(field) {
        const errorDiv = field.parentNode.querySelector('.form-error');
        if (errorDiv) {
            errorDiv.remove();
        }
        field.classList.remove('error');
    }

    async handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showNotification('Lütfen geçerli bir resim dosyası seçin', 'error');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showNotification('Dosya boyutu 5MB\'dan küçük olmalıdır', 'error');
            return;
        }

        try {
            // Show preview
            const reader = new FileReader();
            reader.onload = (e) => {
                const avatarElements = document.querySelectorAll('.avatar-img');
                avatarElements.forEach(avatar => {
                    avatar.src = e.target.result;
                });
            };
            reader.readAsDataURL(file);

            // Simulate upload
            await this.simulateAvatarUpload(file);
            this.showNotification('Profil fotoğrafı başarıyla güncellendi', 'success');

        } catch (error) {
            this.showNotification('Fotoğraf yüklenirken bir hata oluştu', 'error');
        }
    }

    // Utility methods
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    formatDateTime(dateTimeString) {
        const date = new Date(dateTimeString);
        return date.toLocaleString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getStatusText(status) {
        const statusMap = {
            active: 'Aktif',
            inactive: 'Pasif',
            pending: 'Beklemede'
        };
        return statusMap[status] || status;
    }

    async simulateApiCall(data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Profile data saved:', data);
                resolve(data);
            }, 1500);
        });
    }

    async simulateAvatarUpload(file) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Avatar uploaded:', file.name);
                resolve();
            }, 1000);
        });
    }

    showNotification(message, type = 'info') {
        // Use the notification system from main profile.js
        if (window.profilePage && window.profilePage.showNotification) {
            window.profilePage.showNotification(message, type);
        } else {
            // Fallback notification
            alert(message);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProfileInfoSection();
}); 