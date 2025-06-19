// Sailorspoooky's Magical Burp Counter Application
class BurpCounter {
    constructor() {
        this.currentCount = 0;
        this.sessionStart = new Date();
        this.sessionBurps = 0;
        this.lastBurpTime = null;
        this.isConnected = false;
        this.theme = 'light';
        
        // Mock Supabase configuration
        this.supabaseConfig = {
            url: "https://myknpfezbylpwwlsahhg.supabase.co",
            anon_key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15a25wZmV6YnlscHd3bHNhaGhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyOTcwMDQsImV4cCI6MjA2NTg3MzAwNH0.SOcjnjnUqR_I9C3he7Hg3djq0yZEdDgxprSWRAE-ZuI",
            table_name: "burp_counter"
        };
        
        this.initializeElements();
        this.attachEventListeners();
        this.startApp();
    }

    initializeElements() {
        // Main elements
        this.countNumber = document.getElementById('countNumber');
        this.burpButton = document.getElementById('burpButton');
        this.manualCountInput = document.getElementById('manualCount');
        this.setCountButton = document.getElementById('setCountButton');
        this.resetButton = document.getElementById('resetButton');
        this.connectionStatus = document.getElementById('connectionStatus');
        
        // Statistics elements
        this.sessionBurpsEl = document.getElementById('sessionBurps');
        this.timeElapsedEl = document.getElementById('timeElapsed');
        this.burpsPerHourEl = document.getElementById('burpsPerHour');
        this.lastBurpEl = document.getElementById('lastBurp');
        
        // Modal elements
        this.resetModal = document.getElementById('resetModal');
        this.cancelReset = document.getElementById('cancelReset');
        this.confirmReset = document.getElementById('confirmReset');
        
        // Overlay elements
        this.loadingOverlay = document.getElementById('loadingOverlay');
        
        // Theme elements
        this.themeOptions = document.querySelectorAll('input[name="theme"]');
    }

    attachEventListeners() {
        // Main functionality
        this.burpButton.addEventListener('click', () => this.incrementBurp());
        this.setCountButton.addEventListener('click', () => this.setManualCount());
        this.resetButton.addEventListener('click', () => this.showResetModal());
        
        // Manual count input
        this.manualCountInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.setManualCount();
            }
        });
        
        // Modal controls
        this.cancelReset.addEventListener('click', () => this.hideResetModal());
        this.confirmReset.addEventListener('click', () => this.resetCounter());
        
        // Theme switching
        this.themeOptions.forEach(option => {
            option.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.switchTheme(e.target.value);
                }
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                this.incrementBurp();
            }
        });
    }

    async startApp() {
        this.showLoading();
        
        try {
            // Simulate connection delay
            await this.delay(1500);
            
            // Initialize mock database connection
            await this.initializeDatabase();
            
            // Load existing data
            await this.loadCounterData();
            
            // Set up real-time updates simulation
            this.setupRealtimeUpdates();
            
            // Start statistics timer
            this.startStatisticsTimer();
            
            this.updateConnectionStatus(true);
            this.hideLoading();
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.updateConnectionStatus(false);
            this.hideLoading();
            this.showError('Failed to connect to the magical realm. Using offline mode.');
        }
    }

    async initializeDatabase() {
        // Mock Supabase initialization
        // In a real implementation, this would connect to Supabase
        this.mockDatabase = {
            burp_counter: {
                id: 'main-counter',
                count: parseInt(localStorage.getItem('burp_count') || '0'),
                last_updated: localStorage.getItem('last_updated') || new Date().toISOString(),
                session_info: JSON.parse(localStorage.getItem('session_info') || '{}')
            }
        };
        
        console.log('Mock database initialized');
    }

    async loadCounterData() {
        try {
            // Mock data loading from Supabase
            const data = this.mockDatabase.burp_counter;
            
            this.currentCount = data.count;
            this.lastBurpTime = data.last_updated ? new Date(data.last_updated) : null;
            
            this.updateCountDisplay();
            this.updateStatistics();
            
        } catch (error) {
            console.error('Error loading counter data:', error);
            throw error;
        }
    }

    setupRealtimeUpdates() {
        // Mock real-time subscription
        // In a real implementation, this would use Supabase real-time subscriptions
        console.log('Real-time updates simulation active');
        
        // Simulate periodic sync
        setInterval(() => {
            this.syncWithDatabase();
        }, 30000); // Sync every 30 seconds
    }

    async syncWithDatabase() {
        // Mock database sync
        try {
            const currentData = {
                count: this.currentCount,
                last_updated: new Date().toISOString(),
                session_info: {
                    session_start: this.sessionStart.toISOString(),
                    session_burps: this.sessionBurps
                }
            };
            
            // Save to localStorage (mock database)
            localStorage.setItem('burp_count', this.currentCount.toString());
            localStorage.setItem('last_updated', currentData.last_updated);
            localStorage.setItem('session_info', JSON.stringify(currentData.session_info));
            
            this.mockDatabase.burp_counter = { ...this.mockDatabase.burp_counter, ...currentData };
            
        } catch (error) {
            console.error('Sync error:', error);
        }
    }

    async incrementBurp() {
        try {
            this.currentCount++;
            this.sessionBurps++;
            this.lastBurpTime = new Date();
            
            // Add magical animation
            this.animateBurpButton();
            this.animateCountChange();
            
            // Update display
            this.updateCountDisplay();
            this.updateStatistics();
            
            // Sync with database
            await this.syncWithDatabase();
            
            // Celebrate milestone burps
            this.checkMilestones();
            
        } catch (error) {
            console.error('Error incrementing burp:', error);
            this.showError('Failed to register burp. Please try again!');
        }
    }

    async setManualCount() {
        const newCount = parseInt(this.manualCountInput.value);
        
        if (isNaN(newCount) || newCount < 0) {
            this.showError('Please enter a valid number (0 or greater)');
            return;
        }
        
        try {
            const difference = newCount - this.currentCount;
            this.currentCount = newCount;
            
            if (difference > 0) {
                this.sessionBurps += difference;
            }
            
            this.lastBurpTime = new Date();
            
            this.updateCountDisplay();
            this.updateStatistics();
            this.manualCountInput.value = '';
            
            await this.syncWithDatabase();
            
            this.showSuccess(`Count set to ${newCount}! ✨`);
            
        } catch (error) {
            console.error('Error setting manual count:', error);
            this.showError('Failed to set count. Please try again!');
        }
    }

    showResetModal() {
        this.resetModal.classList.add('show');
    }

    hideResetModal() {
        this.resetModal.classList.remove('show');
    }

    async resetCounter() {
        try {
            this.currentCount = 0;
            this.sessionBurps = 0;
            this.sessionStart = new Date();
            this.lastBurpTime = null;
            
            this.updateCountDisplay();
            this.updateStatistics();
            this.hideResetModal();
            
            await this.syncWithDatabase();
            
            this.showSuccess('Counter reset! Ready for a new magical session! 🌙');
            
        } catch (error) {
            console.error('Error resetting counter:', error);
            this.showError('Failed to reset counter. Please try again!');
        }
    }

    updateCountDisplay() {
        this.countNumber.textContent = this.currentCount.toLocaleString();
    }

    updateStatistics() {
        // Session burps
        this.sessionBurpsEl.textContent = this.sessionBurps.toLocaleString();
        
        // Time elapsed
        const elapsed = new Date() - this.sessionStart;
        this.timeElapsedEl.textContent = this.formatDuration(elapsed);
        
        // Burps per hour
        const hours = elapsed / (1000 * 60 * 60);
        const burpsPerHour = hours > 0 ? Math.round(this.sessionBurps / hours) : 0;
        this.burpsPerHourEl.textContent = burpsPerHour.toString();
        
        // Last burp
        if (this.lastBurpTime) {
            const timeSince = new Date() - this.lastBurpTime;
            this.lastBurpEl.textContent = this.formatTimeAgo(timeSince);
        } else {
            this.lastBurpEl.textContent = 'Never';
        }
    }

    startStatisticsTimer() {
        setInterval(() => {
            this.updateStatistics();
        }, 1000);
    }

    animateBurpButton() {
        this.burpButton.classList.add('animate');
        setTimeout(() => {
            this.burpButton.classList.remove('animate');
        }, 600);
    }

    animateCountChange() {
        this.countNumber.style.transform = 'scale(1.2)';
        this.countNumber.style.transition = 'transform 0.3s ease';
        
        setTimeout(() => {
            this.countNumber.style.transform = 'scale(1)';
        }, 300);
    }

    checkMilestones() {
        const milestones = [10, 25, 50, 100, 250, 500, 1000];
        
        if (milestones.includes(this.currentCount)) {
            this.celebrateMilestone(this.currentCount);
        }
    }

    celebrateMilestone(milestone) {
        this.showSuccess(`🎉 Milestone reached: ${milestone} burps! You're truly magical! ✨`);
        
        // Add extra sparkle animation
        const sparkles = document.querySelector('.sparkles');
        sparkles.style.animation = 'sparkleRotate 0.5s linear infinite';
        
        setTimeout(() => {
            sparkles.style.animation = 'sparkleRotate 3s linear infinite';
        }, 3000);
    }

    switchTheme(theme) {
        this.theme = theme;
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    updateConnectionStatus(connected) {
        this.isConnected = connected;
        const statusDot = this.connectionStatus.querySelector('.status-dot');
        const statusText = this.connectionStatus.querySelector('.status-text');
        
        if (connected) {
            statusDot.className = 'status-dot connected';
            statusText.textContent = 'Connected to magical realm';
        } else {
            statusDot.className = 'status-dot disconnected';
            statusText.textContent = 'Offline mode';
        }
    }

    showLoading() {
        this.loadingOverlay.classList.add('show');
    }

    hideLoading() {
        this.loadingOverlay.classList.remove('show');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✨' : '⚠️'}</span>
                <span class="notification-message">${message}</span>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #f1b7d1, #80b3d6)' : 'linear-gradient(135deg, #ff6b6b, #ee5a5a)'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            z-index: 1001;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 4000);
    }

    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        const h = hours.toString().padStart(2, '0');
        const m = (minutes % 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        
        return `${h}:${m}:${s}`;
    }

    formatTimeAgo(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m ago`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s ago`;
        } else {
            return `${seconds}s ago`;
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Additional notification styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification-content {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .notification-icon {
        font-size: 16px;
    }
    
    .notification-message {
        font-size: 14px;
        font-weight: 500;
    }
`;
document.head.appendChild(notificationStyles);

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    
    // Set theme radio button
    const themeRadio = document.querySelector(`input[name="theme"][value="${savedTheme}"]`);
    if (themeRadio) {
        themeRadio.checked = true;
    }
    
    // Initialize the burp counter
    window.burpCounter = new BurpCounter();
    
    console.log('🌙 Sailorspoooky\'s Magical Burp Counter initialized! ✨');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (window.burpCounter && !document.hidden) {
        // Refresh data when page becomes visible
        window.burpCounter.loadCounterData();
    }
});

// Handle browser back/forward
window.addEventListener('pageshow', (event) => {
    if (event.persisted && window.burpCounter) {
        // Refresh data when returning from cache
        window.burpCounter.loadCounterData();
    }
});