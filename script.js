class AdvancedEmbedSystem {
    constructor() {
        this.settings = {
            maxEmbeds: 1,
            defaultTimeout: 30,
            enableLogging: true,
            allowHttps: true,
            blockedDomains: [],
            allowedDomains: [],
            enableSandbox: true,
            allowFullscreen: true,
            allowAutoplay: false,
            allowCamera: false,
            allowMicrophone: false
        };
        
        this.embedHistory = [];
        this.currentEmbed = null;
        this.isFullscreen = false;
        
        this.init();
        this.loadSettings();
        this.loadHistory();
    }

    init() {
        // DOM Elements
        this.embedUrl = document.getElementById('embedUrl');
        this.embedBtn = document.getElementById('embedBtn');
        this.embedFrame = document.getElementById('embedFrame');
        this.embedTitle = document.getElementById('embedTitle');
        this.adminBtn = document.getElementById('adminBtn');
        this.adminModal = document.getElementById('adminModal');
        this.closeModal = document.getElementById('closeModal');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        
        // Control buttons
        this.refreshBtn = document.getElementById('refreshBtn');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.closeBtn = document.getElementById('closeBtn');
        
        // Quick access buttons
        this.quickBtns = document.querySelectorAll('.quick-btn');
        
        // Admin panel elements
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.saveSettings = document.getElementById('saveSettings');
        this.resetSettings = document.getElementById('resetSettings');
        this.clearHistory = document.getElementById('clearHistory');
        this.exportHistory = document.getElementById('exportHistory');
        
        this.bindEvents();
    }

    bindEvents() {
        // Main embed functionality
        this.embedBtn.addEventListener('click', () => this.embedWebsite());
        this.embedUrl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.embedWebsite();
        });

        // Quick access buttons
        this.quickBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const url = btn.dataset.url;
                this.embedUrl.value = url;
                this.embedWebsite();
            });
        });

        // Control buttons
        this.refreshBtn.addEventListener('click', () => this.refreshEmbed());
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        this.closeBtn.addEventListener('click', () => this.closeEmbed());

        // Admin panel
        this.adminBtn.addEventListener('click', () => this.openAdminPanel());
        this.closeModal.addEventListener('click', () => this.closeAdminPanel());
        
        // Admin tabs
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Admin actions
        this.saveSettings.addEventListener('click', () => this.saveAdminSettings());
        this.resetSettings.addEventListener('click', () => this.resetAdminSettings());
        this.clearHistory.addEventListener('click', () => this.clearEmbedHistory());
        this.exportHistory.addEventListener('click', () => this.exportEmbedHistory());

        // Modal close on outside click
        this.adminModal.addEventListener('click', (e) => {
            if (e.target === this.adminModal) this.closeAdminPanel();
        });

        // Escape key handling
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.isFullscreen) {
                    this.toggleFullscreen();
                } else if (this.adminModal.style.display === 'block') {
                    this.closeAdminPanel();
                }
            }
        });
    }

    embedWebsite() {
        const url = this.embedUrl.value.trim();
        
        if (!url) {
            this.showNotification('Please enter a valid URL', 'error');
            return;
        }

        if (!this.isValidUrl(url)) {
            this.showNotification('Please enter a valid URL format', 'error');
            return;
        }

        if (!this.isAllowedDomain(url)) {
            this.showNotification('This domain is not allowed for embedding', 'error');
            return;
        }

        if (this.isBlockedDomain(url)) {
            this.showNotification('This domain is blocked', 'error');
            return;
        }

        this.showLoading(true);
        this.createEmbedFrame(url);
    }

    createEmbedFrame(url) {
        try {
            // Ensure URL has protocol
            const fullUrl = this.normalizeUrl(url);
            
            // Create iframe with security settings
            const iframe = document.createElement('iframe');
            iframe.src = fullUrl;
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            
            // Apply sandbox security if enabled
            if (this.settings.enableSandbox) {
                const sandboxPermissions = [
                    'allow-scripts',
                    'allow-same-origin',
                    'allow-forms',
                    'allow-navigation',
                    'allow-popups'
                ];
                
                if (this.settings.allowFullscreen) {
                    sandboxPermissions.push('allow-fullscreen');
                }
                
                if (this.settings.allowAutoplay) {
                    sandboxPermissions.push('allow-autoplay');
                }
                
                iframe.sandbox = sandboxPermissions.join(' ');
            }

            // Set additional attributes for full functionality
            iframe.allow = this.generateAllowAttribute();
            iframe.loading = 'lazy';
            iframe.referrerPolicy = 'strict-origin-when-cross-origin';

            // Handle iframe load events
            iframe.onload = () => {
                this.showLoading(false);
                this.updateEmbedTitle(fullUrl);
                this.addToHistory(fullUrl);
                this.currentEmbed = fullUrl;
                
                if (this.settings.enableLogging) {
                    console.log(`Successfully embedded: ${fullUrl}`);
                }
            };

            iframe.onerror = () => {
                this.showLoading(false);
                this.showNotification('Failed to load the website. It may not allow embedding.', 'error');
            };

            // Set loading timeout
            setTimeout(() => {
                if (iframe.src && !iframe.contentDocument) {
                    this.showLoading(false);
                    this.showNotification('Loading timeout. The website may be taking too long to respond.', 'warning');
                }
            }, this.settings.defaultTimeout * 1000);

            // Clear previous content and add new iframe
            this.embedFrame.innerHTML = '';
            this.embedFrame.appendChild(iframe);

        } catch (error) {
            this.showLoading(false);
            this.showNotification('Error creating embed: ' + error.message, 'error');
            console.error('Embed error:', error);
        }
    }

    generateAllowAttribute() {
        const permissions = [];
        
        if (this.settings.allowCamera) {
            permissions.push('camera');
        }
        
        if (this.settings.allowMicrophone) {
            permissions.push('microphone');
        }
        
        if (this.settings.allowAutoplay) {
            permissions.push('autoplay');
        }
        
        if (this.settings.allowFullscreen) {
            permissions.push('fullscreen');
        }
        
        // Add common permissions for web functionality
        permissions.push('encrypted-media', 'picture-in-picture', 'accelerometer', 'gyroscope');
        
        return permissions.join('; ');
    }

    isValidUrl(string) {
        try {
            new URL(this.normalizeUrl(string));
            return true;
        } catch (_) {
            return false;
        }
    }

    normalizeUrl(url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        
        // Check HTTPS only setting
        if (this.settings.allowHttps && url.startsWith('http://')) {
            url = url.replace('http://', 'https://');
        }
        
        return url;
    }

    isAllowedDomain(url) {
        if (this.settings.allowedDomains.length === 0) return true;
        
        try {
            const domain = new URL(this.normalizeUrl(url)).hostname;
            return this.settings.allowedDomains.some(allowed => 
                domain === allowed || domain.endsWith('.' + allowed)
            );
        } catch {
            return false;
        }
    }

    isBlockedDomain(url) {
        try {
            const domain = new URL(this.normalizeUrl(url)).hostname;
            return this.settings.blockedDomains.some(blocked => 
                domain === blocked || domain.endsWith('.' + blocked)
            );
        } catch {
            return false;
        }
    }

    refreshEmbed() {
        if (this.currentEmbed) {
            this.createEmbedFrame(this.currentEmbed);
        }
    }

    toggleFullscreen() {
        const container = document.querySelector('.embed-container');
        
        if (!this.isFullscreen) {
            container.classList.add('fullscreen');
            this.fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
            this.fullscreenBtn.title = 'Exit Fullscreen';
            this.isFullscreen = true;
        } else {
            container.classList.remove('fullscreen');
            this.fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
            this.fullscreenBtn.title = 'Fullscreen';
            this.isFullscreen = false;
        }
    }

    closeEmbed() {
        this.embedFrame.innerHTML = `
            <div class="placeholder">
                <i class="fas fa-globe-americas"></i>
                <h2>Advanced Website Embedding</h2>
                <p>Enter any website URL above to embed it with full functionality</p>
                <div class="features">
                    <div class="feature">
                        <i class="fas fa-check-circle"></i>
                        <span>100% Website Functionality</span>
                    </div>
                    <div class="feature">
                        <i class="fas fa-check-circle"></i>
                        <span>Real-time Embedding</span>
                    </div>
                    <div class="feature">
                        <i class="fas fa-check-circle"></i>
                        <span>Admin Panel Control</span>
                    </div>
                </div>
            </div>
        `;
        this.updateEmbedTitle('No website embedded');
        this.currentEmbed = null;
        this.embedUrl.value = '';
    }

    updateEmbedTitle(url) {
        try {
            const domain = new URL(url).hostname;
            this.embedTitle.textContent = `Embedded: ${domain}`;
        } catch {
            this.embedTitle.textContent = url;
        }
    }

    addToHistory(url) {
        const historyItem = {
            url: url,
            timestamp: new Date().toLocaleString(),
            domain: new URL(url).hostname
        };
        
        this.embedHistory.unshift(historyItem);
        
        // Keep only last 50 items
        if (this.embedHistory.length > 50) {
            this.embedHistory = this.embedHistory.slice(0, 50);
        }
        
        this.saveHistory();
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const historyList = document.getElementById('historyList');
        
        if (this.embedHistory.length === 0) {
            historyList.innerHTML = '<p>No embed history yet.</p>';
            return;
        }
        
        historyList.innerHTML = this.embedHistory.map(item => `
            <div class="history-item">
                <div class="url">${item.domain}</div>
                <div class="timestamp">${item.timestamp}</div>
            </div>
        `).join('');
    }

    openAdminPanel() {
        this.adminModal.style.display = 'block';
        this.loadSettingsToForm();
        this.updateHistoryDisplay();
    }

    closeAdminPanel() {
        this.adminModal.style.display = 'none';
    }

    switchTab(tabName) {
        // Update tab buttons
        this.tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabName);
        });
    }

    loadSettingsToForm() {
        document.getElementById('maxEmbeds').value = this.settings.maxEmbeds;
        document.getElementById('defaultTimeout').value = this.settings.defaultTimeout;
        document.getElementById('enableLogging').checked = this.settings.enableLogging;
        document.getElementById('allowHttps').checked = this.settings.allowHttps;
        document.getElementById('blockedDomains').value = this.settings.blockedDomains.join('\n');
        document.getElementById('allowedDomains').value = this.settings.allowedDomains.join('\n');
        document.getElementById('enableSandbox').checked = this.settings.enableSandbox;
        document.getElementById('allowFullscreen').checked = this.settings.allowFullscreen;
        document.getElementById('allowAutoplay').checked = this.settings.allowAutoplay;
        document.getElementById('allowCamera').checked = this.settings.allowCamera;
        document.getElementById('allowMicrophone').checked = this.settings.allowMicrophone;
    }

    saveAdminSettings() {
        this.settings.maxEmbeds = parseInt(document.getElementById('maxEmbeds').value);
        this.settings.defaultTimeout = parseInt(document.getElementById('defaultTimeout').value);
        this.settings.enableLogging = document.getElementById('enableLogging').checked;
        this.settings.allowHttps = document.getElementById('allowHttps').checked;
        this.settings.blockedDomains = document.getElementById('blockedDomains').value
            .split('\n').filter(domain => domain.trim()).map(domain => domain.trim());
        this.settings.allowedDomains = document.getElementById('allowedDomains').value
            .split('\n').filter(domain => domain.trim()).map(domain => domain.trim());
        this.settings.enableSandbox = document.getElementById('enableSandbox').checked;
        this.settings.allowFullscreen = document.getElementById('allowFullscreen').checked;
        this.settings.allowAutoplay = document.getElementById('allowAutoplay').checked;
        this.settings.allowCamera = document.getElementById('allowCamera').checked;
        this.settings.allowMicrophone = document.getElementById('allowMicrophone').checked;
        
        this.saveSettings();
        this.showNotification('Settings saved successfully!', 'success');
    }

    resetAdminSettings() {
        this.settings = {
            maxEmbeds: 1,
            defaultTimeout: 30,
            enableLogging: true,
            allowHttps: true,
            blockedDomains: [],
            allowedDomains: [],
            enableSandbox: true,
            allowFullscreen: true,
            allowAutoplay: false,
            allowCamera: false,
            allowMicrophone: false
        };
        
        this.loadSettingsToForm();
        this.saveSettings();
        this.showNotification('Settings reset to default!', 'success');
    }

    clearEmbedHistory() {
        if (confirm('Are you sure you want to clear all embed history?')) {
            this.embedHistory = [];
            this.saveHistory();
            this.updateHistoryDisplay();
            this.showNotification('History cleared!', 'success');
        }
    }

    exportEmbedHistory() {
        const data = JSON.stringify(this.embedHistory, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `embed-history-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('History exported!', 'success');
    }

    saveSettings() {
        localStorage.setItem('embedSettings', JSON.stringify(this.settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('embedSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    }

    saveHistory() {
        localStorage.setItem('embedHistory', JSON.stringify(this.embedHistory));
    }

    loadHistory() {
        const saved = localStorage.getItem('embedHistory');
        if (saved) {
            this.embedHistory = JSON.parse(saved);
        }
    }

    showLoading(show) {
        this.loadingOverlay.style.display = show ? 'flex' : 'none';
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10001',
            maxWidth: '300px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        
        // Set background color based on type
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        notification.style.background = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdvancedEmbedSystem();
});

// Global functions for enhanced functionality
window.embedSystem = {
    embedUrl: (url) => {
        document.getElementById('embedUrl').value = url;
        document.getElementById('embedBtn').click();
    },
    
    getCurrentEmbed: () => {
        return window.embedSystemInstance ? window.embedSystemInstance.currentEmbed : null;
    },
    
    getSettings: () => {
        return window.embedSystemInstance ? window.embedSystemInstance.settings : null;
    }
};

// Store instance globally for external access
document.addEventListener('DOMContentLoaded', () => {
    window.embedSystemInstance = new AdvancedEmbedSystem();
});