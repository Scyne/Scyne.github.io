// Supabase configuration
const SUPABASE_URL = 'https://myknpfezbylpwwlsahhg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15a25wZmV6YnlscHd3bHNhaGhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyOTcwMDQsImV4cCI6MjA2NTg3MzAwNH0.SOcjnjnUqR_I9C3he7Hg3djq0yZEdDgxprSWRAE-ZuI';

// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM elements
const burpCountElement = document.getElementById('burpCount');
const statusIndicator = document.getElementById('statusIndicator');
const sparklesContainer = document.getElementById('sparklesContainer');

// Connection status
let isConnected = false;
let realtimeChannel = null;

// Initialize the application
async function init() {
    try {
        console.log('🌙 Initializing Sailorspoooky Burp Counter...');

        // Update status to connecting
        updateConnectionStatus('connecting');

        // Fetch initial count
        await fetchCurrentCount();

        // Set up real-time subscription
        setupRealtimeSubscription();

        console.log('✨ Burp counter initialized successfully!');

    } catch (error) {
        console.error('❌ Failed to initialize burp counter:', error);
        updateConnectionStatus('error');
    }
}

// Fetch the current count from database
async function fetchCurrentCount() {
    try {
        const { data, error } = await supabaseClient
            .from('burp_counter')
            .select('count')
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

        updateCountDisplay(data.count);
        updateConnectionStatus('connected');

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
                        created_at: new Date().toISOString()
                    }
                }
            ])
            .select()
            .single();

        if (error) throw error;

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
            .channel('burp_counter_changes')
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
        const newCount = payload.new.count;
        const oldCount = parseInt(burpCountElement.textContent) || 0;

        updateCountDisplay(newCount);

        // Trigger sparkle effects if count increased
        if (newCount > oldCount) {
            triggerSparkleEffect();
        }
    }
}

// Update the count display with animations
function updateCountDisplay(count) {
    if (!burpCountElement) return;

    const currentCount = parseInt(burpCountElement.textContent) || 0;
    const newCount = parseInt(count) || 0;

    // Add updating class for animation
    burpCountElement.classList.add('updating');

    // Update the number
    burpCountElement.textContent = newCount;

    // Remove updating class after animation
    setTimeout(() => {
        burpCountElement.classList.remove('updating');
    }, 500);

    // Trigger sparkles if count increased
    if (newCount > currentCount) {
        triggerSparkleEffect();
    }
}

// Update connection status
function updateConnectionStatus(status) {
    if (!statusIndicator) return;

    const statusDot = statusIndicator.querySelector('.status-dot');
    const statusText = statusIndicator.querySelector('.status-text');

    // Remove all status classes
    statusIndicator.classList.remove('connected', 'error', 'connecting');

    switch (status) {
        case 'connected':
            statusIndicator.classList.add('connected');
            statusText.textContent = 'LIVE';
            isConnected = true;
            break;
        case 'error':
            statusIndicator.classList.add('error');
            statusText.textContent = 'ERROR';
            isConnected = false;
            break;
        case 'connecting':
        default:
            statusText.textContent = 'CONN...';
            isConnected = false;
            break;
    }
}

// Trigger sparkle effect
function triggerSparkleEffect() {
    if (!sparklesContainer) return;

    // Create multiple sparkles
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            createSparkle();
        }, i * 100);
    }
}

// Create individual sparkle
function createSparkle() {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.textContent = ['✨', '⭐', '🌟', '💫'][Math.floor(Math.random() * 4)];

    // Random position around the counter
    const containerRect = document.querySelector('.counter-display').getBoundingClientRect();
    const x = Math.random() * containerRect.width;
    const y = Math.random() * containerRect.height;

    sparkle.style.left = x + 'px';
    sparkle.style.top = y + 'px';

    sparklesContainer.appendChild(sparkle);

    // Remove sparkle after animation
    setTimeout(() => {
        if (sparkle.parentNode) {
            sparkle.parentNode.removeChild(sparkle);
        }
    }, 1200);
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
}, 5000);

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
});

// Handle visibility changes for OBS
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !isConnected) {
        console.log('👁️ Page became visible, attempting reconnection...');
        init();
    }
});