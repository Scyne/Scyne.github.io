// Supabase configuration
const SUPABASE_URL = 'https://myknpfezbylpwwlsahhg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15a25wZmV6YnlscHd3bHNhaGhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyOTcwMDQsImV4cCI6MjA2NTg3MzAwNH0.SOcjnjnUqR_I9C3he7Hg3djq0yZEdDgxprSWRAE-ZuI';

// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM elements
const currentCountElement = document.getElementById('currentCount');
const burpButton = document.getElementById('burpButton');
const manualCountInput = document.getElementById('manualCount');
const connectionStatus = document.getElementById('connectionStatus');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const loadingOverlay = document.getElementById('loadingOverlay');
const confirmModal = document.getElementById('confirmModal');

// Statistics elements
const totalBurpsElement = document.getElementById('totalBurps');
const sessionTimeElement = document.getElementById('sessionTime');
const burpsPerHourElement = document.getElementById('burpsPerHour');
const lastBurpElement = document.getElementById('lastBurp');

// Application state
let currentCount = 0;
let sessionStartTime = new Date();
let isConnected = false;
let realtimeChannel = null;
let sessionTimer = null;

// Initialize the application
async function init() {
    try {
        console.log('🌙 Initializing Control Panel...');
        showLoading(true);

        // Update status to connecting
        updateConnectionStatus('connecting');

        // Fetch initial data
        await fetchCurrentCount();

        // Set up real-time subscription
        setupRealtimeSubscription();

        // Start session timer
        startSessionTimer();

        // Initialize statistics
        updateStatistics();

        console.log('✨ Control panel initialized successfully!');

    } catch (error) {
        console.error('❌ Failed to initialize control panel:', error);
        updateConnectionStatus('error');
    } finally {
        showLoading(false);
    }
}

// Show/hide loading overlay
function showLoading(show) {
    if (loadingOverlay) {
        if (show) {
            loadingOverlay.classList.add('show');
        } else {
            loadingOverlay.classList.remove('show');
        }
    }
}

// Fetch the current count from database
async function fetchCurrentCount() {
    try {
        const { data, error } = await supabaseClient
            .from('burp_counter')
            .select('*')
            .eq('counter_id', 'sailorspoooky_main')
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // No record found, create one
                await createInitialRecord();
                return;
            }
            throw error;
        }

        currentCount = data.count || 0;
        updateCountDisplay(currentCount);
        updateConnectionStatus('connected');

        // Update session start time if available
        if (data.session_metadata && data.session_metadata.session_start) {
            sessionStartTime = new Date(data.session_metadata.session_start);
        }

        updateStatistics();

    } catch (error) {
        console.error('❌ Error fetching count:', error);
        updateConnectionStatus('error');
        throw error;
    }
}

// Create initial record if none exists
async function createInitialRecord() {
    try {
        const { data, error } = await supabaseClient
            .from('burp_counter')
            .insert([
                { 
                    counter_id: 'sailorspoooky_main', 
                    count: 0,
                    session_metadata: {
                        session_name: 'Sailorspoooky Stream',
                        theme: 'sailor_moon',
                        session_start: sessionStartTime.toISOString(),
                        created_at: new Date().toISOString()
                    }
                }
            ])
            .select()
            .single();

        if (error) throw error;

        currentCount = 0;
        updateCountDisplay(0);
        updateConnectionStatus('connected');

    } catch (error) {
        console.error('❌ Error creating initial record:', error);
        updateConnectionStatus('error');
        throw error;
    }
}

// Set up real-time subscription
function setupRealtimeSubscription() {
    try {
        realtimeChannel = supabaseClient
            .channel('control_panel_updates')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'burp_counter',
                    filter: 'counter_id=eq.sailorspoooky_main'
                },
                (payload) => {
                    console.log('🔄 Real-time update received:', payload);
                    handleRealtimeUpdate(payload);
                }
            )
            .subscribe((status) => {
                console.log('📡 Subscription status:', status);
                if (status === 'SUBSCRIBED') {
                    updateConnectionStatus('connected');
                } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    updateConnectionStatus('error');
                }
            });

    } catch (error) {
        console.error('❌ Error setting up real-time subscription:', error);
        updateConnectionStatus('error');
    }
}

// Handle real-time updates
function handleRealtimeUpdate(payload) {
    if (payload.new && typeof payload.new.count !== 'undefined') {
        currentCount = payload.new.count;
        updateCountDisplay(currentCount);
        updateStatistics();
    }
}

// Update the count display
function updateCountDisplay(count) {
    if (currentCountElement) {
        currentCountElement.textContent = count || 0;
    }
}

// Update connection status
function updateConnectionStatus(status) {
    if (!connectionStatus) return;

    // Remove all status classes
    connectionStatus.classList.remove('connected', 'error', 'connecting');

    switch (status) {
        case 'connected':
            connectionStatus.classList.add('connected');
            statusText.textContent = 'Connected to Magical Realm ✨';
            isConnected = true;
            break;
        case 'error':
            connectionStatus.classList.add('error');
            statusText.textContent = 'Connection Lost 🔥';
            isConnected = false;
            break;
        case 'connecting':
        default:
            statusText.textContent = 'Connecting to Magic...';
            isConnected = false;
            break;
    }
}

// Increment burp count
async function incrementBurp() {
    if (!isConnected) {
        alert('Not connected to the magical realm! Please wait...');
        return;
    }

    try {
        // Disable button temporarily
        if (burpButton) {
            burpButton.disabled = true;
            burpButton.textContent = '✨ BURPING... ✨';
        }

        // Use the PostgreSQL function to increment
        const { data, error } = await supabaseClient
            .rpc('increment_burp_counter', {
                counter_name: 'sailorspoooky_main'
            });

        if (error) throw error;

        console.log('🎉 Burp increment successful!', data);

        // The real-time subscription will handle the UI update

    } catch (error) {
        console.error('❌ Error incrementing burp:', error);
        alert('Failed to register burp! The magic is broken 😢');
    } finally {
        // Re-enable button
        if (burpButton) {
            burpButton.disabled = false;
            burpButton.textContent = '✨ BURP! ✨';
        }
    }
}

// Set manual count
async function setManualCount() {
    const newCount = parseInt(manualCountInput.value);

    if (isNaN(newCount) || newCount < 0) {
        alert('Please enter a valid number (0 or higher)');
        return;
    }

    if (!isConnected) {
        alert('Not connected to the magical realm! Please wait...');
        return;
    }

    try {
        // Use the PostgreSQL function to set count
        const { data, error } = await supabaseClient
            .rpc('set_burp_counter', {
                counter_name: 'sailorspoooky_main',
                new_value: newCount
            });

        if (error) throw error;

        console.log('📝 Manual count set successfully!', data);

        // Clear the input
        manualCountInput.value = '';

    } catch (error) {
        console.error('❌ Error setting manual count:', error);
        alert('Failed to set count! The magic is broken 😢');
    }
}

// Show reset confirmation modal
function showResetModal() {
    if (confirmModal) {
        confirmModal.classList.add('show');
    }
}

// Hide modal
function hideModal() {
    if (confirmModal) {
        confirmModal.classList.remove('show');
    }
}

// Confirm reset
async function confirmReset() {
    hideModal();

    if (!isConnected) {
        alert('Not connected to the magical realm! Please wait...');
        return;
    }

    try {
        // Use the PostgreSQL function to reset counter
        const { data, error } = await supabaseClient
            .rpc('reset_burp_counter', {
                counter_name: 'sailorspoooky_main'
            });

        if (error) throw error;

        console.log('🔄 Counter reset successfully!', data);

        // Reset session start time
        sessionStartTime = new Date();

    } catch (error) {
        console.error('❌ Error resetting counter:', error);
        alert('Failed to reset counter! The magic is broken 😢');
    }
}

// Refresh data
async function refreshData() {
    try {
        showLoading(true);
        await fetchCurrentCount();
        updateStatistics();
    } catch (error) {
        console.error('❌ Error refreshing data:', error);
    } finally {
        showLoading(false);
    }
}

// Start session timer
function startSessionTimer() {
    sessionTimer = setInterval(() => {
        updateStatistics();
    }, 1000);
}

// Update statistics
function updateStatistics() {
    // Total burps (same as current count)
    if (totalBurpsElement) {
        totalBurpsElement.textContent = currentCount;
    }

    // Session time
    const now = new Date();
    const sessionDuration = now - sessionStartTime;
    const hours = Math.floor(sessionDuration / (1000 * 60 * 60));
    const minutes = Math.floor((sessionDuration % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((sessionDuration % (1000 * 60)) / 1000);

    if (sessionTimeElement) {
        sessionTimeElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Burps per hour
    const sessionHours = sessionDuration / (1000 * 60 * 60);
    const burpsPerHour = sessionHours > 0 ? (currentCount / sessionHours).toFixed(1) : '0.0';

    if (burpsPerHourElement) {
        burpsPerHourElement.textContent = burpsPerHour;
    }

    // Last burp (placeholder for now)
    if (lastBurpElement && currentCount > 0) {
        lastBurpElement.textContent = 'Just now';
    }
}

// Connection monitoring
setInterval(async () => {
    if (!isConnected) {
        try {
            await fetchCurrentCount();
        } catch (error) {
            console.log('🔄 Still trying to reconnect...');
        }
    }
}, 10000);

// Keyboard shortcuts
document.addEventListener('keydown', (event) => {
    // Space bar to burp
    if (event.code === 'Space' && event.target === document.body) {
        event.preventDefault();
        incrementBurp();
    }

    // Enter to set manual count
    if (event.code === 'Enter' && event.target === manualCountInput) {
        event.preventDefault();
        setManualCount();
    }
});

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (realtimeChannel) {
        supabaseClient.removeChannel(realtimeChannel);
    }
    if (sessionTimer) {
        clearInterval(sessionTimer);
    }
});

// Make functions available globally for onclick handlers
window.incrementBurp = incrementBurp;
window.setManualCount = setManualCount;
window.showResetModal = showResetModal;
window.hideModal = hideModal;
window.confirmReset = confirmReset;
window.refreshData = refreshData;