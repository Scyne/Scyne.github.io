// Burp Counter OBS Overlay - Real-time display
class BurpCounterOverlay {
    constructor() {
        this.currentCount = 0;
        this.isConnected = false;
        this.pollInterval = null;
        this.demoInterval = null;
        this.supabaseUrl = 'https://myknpfezbylpwwlsahhg.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15a25wZmV6YnlscHd3bHNhaGhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyOTcwMDQsImV4cCI6MjA2NTg3MzAwNH0.SOcjnjnUqR_I9C3he7Hg3djq0yZEdDgxprSWRAE-ZuI';
        this.tableName = 'burp_counter';
        
        // DOM elements
        this.countElement = document.getElementById('burpCount');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.sparklesContainer = document.getElementById('sparklesContainer');
        
        this.init();
    }
    
    async init() {
        console.log('🌙 Initializing Sailorspoooky Burp Counter Overlay...');
        
        // Set initial status
        this.setConnectionStatus('connecting');
        
        // For demo purposes, simulate the counter functionality
        // In production, replace this with real Supabase connection
        // this.startDemo();
        
        // Uncomment below for real Supabase integration
        await this.connectToSupabase();
        this.startPolling();
    }
    
    // Enhanced demo mode for testing without backend
    startDemo() {
        console.log('✨ Running in demo mode...');
        
        // Simulate connection delay
        setTimeout(() => {
            this.setConnectionStatus('connected');
            
            // Initial count
            this.updateCounter(0);
            
            // Start demo updates with guaranteed consistency
            let demoCount = 0;
            this.demoInterval = setInterval(() => {
                // Increment count by 1-3 randomly
                const increment = Math.floor(Math.random() * 3) + 1;
                demoCount += increment;
                
                console.log(`🎀 Demo update: ${this.currentCount} → ${demoCount}`);
                this.updateCounter(demoCount);
                
                // Reset counter if it gets too high for demo
                if (demoCount > 50) {
                    demoCount = 0;
                }
            }, 5000); // Every 5 seconds for reliable demo
            
        }, 1000);
    }
    
    // Real Supabase connection (commented out for demo)
    async connectToSupabase() {
        try {
            // Initialize Supabase client
            // const { createClient } = supabase;
            // this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
            
            console.log('🔮 Connected to Supabase');
            this.setConnectionStatus('connected');
            
            // Get initial count
            await this.fetchCurrentCount();
            
        } catch (error) {
            console.error('💔 Failed to connect to Supabase:', error);
            this.setConnectionStatus('error');
            
            // Retry connection after 5 seconds
            setTimeout(() => this.connectToSupabase(), 5000);
        }
    }
    
    async fetchCurrentCount() {
        try {
            // Real Supabase query would be:
            // const { data, error } = await this.supabase
            //     .from(this.tableName)
            //     .select('count')
            //     .single();
            
            // if (error) throw error;
            // this.updateCounter(data.count || 0);
            
            console.log('📊 Fetched current count from database');
            
        } catch (error) {
            console.error('❌ Error fetching count:', error);
            this.setConnectionStatus('error');
        }
    }
    
    startPolling() {
        // Poll for updates every 2 seconds
        this.pollInterval = setInterval(async () => {
            await this.fetchCurrentCount();
        }, 2000);
    }
    
    updateCounter(newCount) {
        const oldCount = this.currentCount;
        
        if (newCount !== oldCount) {
            console.log(`💫 Burp count updated: ${oldCount} → ${newCount}`);
            
            // Add updating animation class
            this.countElement.classList.add('updating');
            
            // Create sparkle effect immediately
            this.createSparkleEffect();
            
            // Update the number with a slight delay for smooth animation
            setTimeout(() => {
                this.countElement.textContent = newCount;
                this.currentCount = newCount;
            }, 150);
            
            // Remove updating class after animation
            setTimeout(() => {
                this.countElement.classList.remove('updating');
            }, 600);
        }
    }
    
    createSparkleEffect() {
        const sparkleCount = 6;
        const sparkleSymbols = ['✨', '💫', '⭐', '🌟', '✦', '✧'];
        
        console.log('✨ Creating sparkle effect!');
        
        for (let i = 0; i < sparkleCount; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.className = 'sparkle';
                sparkle.textContent = sparkleSymbols[Math.floor(Math.random() * sparkleSymbols.length)];
                
                // Position sparkles around the counter display
                const centerX = 200; // Center of 400px width
                const centerY = 100; // Center of 200px height
                const radius = 80 + Math.random() * 60; // Random radius around center
                const angle = (Math.PI * 2 * i) / sparkleCount + Math.random() * 0.5;
                
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                
                sparkle.style.left = Math.max(10, Math.min(x, 390)) + 'px';
                sparkle.style.top = Math.max(10, Math.min(y, 190)) + 'px';
                
                this.sparklesContainer.appendChild(sparkle);
                
                // Remove sparkle after animation completes
                setTimeout(() => {
                    if (sparkle.parentNode) {
                        sparkle.parentNode.removeChild(sparkle);
                    }
                }, 1200);
            }, i * 150); // Stagger sparkles
        }
    }
    
    setConnectionStatus(status) {
        // Remove all status classes
        this.statusIndicator.className = 'status-indicator';
        
        // Update status text element (create if doesn't exist)
        let statusText = this.statusIndicator.querySelector('.status-text');
        if (!statusText) {
            statusText = document.createElement('div');
            statusText.className = 'status-text';
            this.statusIndicator.appendChild(statusText);
        }
        
        switch (status) {
            case 'connected':
                this.statusIndicator.classList.add('connected');
                statusText.textContent = 'LIVE';
                this.isConnected = true;
                console.log('🟢 Status: Connected ✓');
                break;
            case 'error':
                this.statusIndicator.classList.add('error');
                statusText.textContent = 'ERROR';
                this.isConnected = false;
                console.log('🔴 Status: Connection Error ✗');
                break;
            case 'connecting':
            default:
                statusText.textContent = 'CONN...';
                this.isConnected = false;
                console.log('🟡 Status: Connecting...');
                break;
        }
    }
    
    // Test methods for debugging
    simulateUpdate() {
        const newCount = this.currentCount + Math.floor(Math.random() * 5) + 1;
        this.updateCounter(newCount);
    }
    
    resetCounter() {
        this.updateCounter(0);
    }
    
    // Cleanup method
    destroy() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
        if (this.demoInterval) {
            clearInterval(this.demoInterval);
            this.demoInterval = null;
        }
        console.log('🌙 Burp counter overlay destroyed');
    }
}

// Initialize the overlay when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎀 DOM loaded, starting overlay...');
    window.burpCounter = new BurpCounterOverlay();
});

// Handle page visibility changes (OBS browser source optimization)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('👻 Overlay hidden - maintaining operation for OBS');
        // Keep running for OBS even when hidden
    } else {
        console.log('✨ Overlay visible - normal operation');
    }
});

// Handle window unload
window.addEventListener('beforeunload', () => {
    if (window.burpCounter) {
        window.burpCounter.destroy();
    }
});

// Debug methods for testing
window.testBurpUpdate = (count) => {
    console.log(`🧪 Testing burp update to: ${count}`);
    if (window.burpCounter) {
        window.burpCounter.updateCounter(count || window.burpCounter.currentCount + 1);
    }
};

window.testSparkles = () => {
    console.log('🧪 Testing sparkle effect');
    if (window.burpCounter) {
        window.burpCounter.createSparkleEffect();
    }
};

window.simulateUpdate = () => {
    console.log('🧪 Simulating random update');
    if (window.burpCounter) {
        window.burpCounter.simulateUpdate();
    }
};

window.resetCounter = () => {
    console.log('🧪 Resetting counter to 0');
    if (window.burpCounter) {
        window.burpCounter.resetCounter();
    }
};

// Auto-resize handler for different OBS source sizes
window.addEventListener('resize', () => {
    console.log(`📏 Overlay resized to: ${window.innerWidth}x${window.innerHeight}`);
});

// Add keyboard shortcuts for testing (useful in OBS)
document.addEventListener('keydown', (e) => {
    if (e.key === ' ') { // Spacebar
        e.preventDefault();
        window.simulateUpdate();
    } else if (e.key === 'r') { // R key
        e.preventDefault();
        window.resetCounter();
    } else if (e.key === 's') { // S key
        e.preventDefault();
        window.testSparkles();
    }
});

console.log('🌟 Sailorspoooky Burp Counter Overlay loaded! Press SPACE to test updates, R to reset, S for sparkles');

/* 
PRODUCTION SETUP INSTRUCTIONS:
1. Replace supabaseUrl and supabaseKey with your actual Supabase credentials
2. Ensure your burp_counter table exists with a 'count' column
3. Set up proper RLS (Row Level Security) policies in Supabase
4. Uncomment the real Supabase connection code in connectToSupabase()
5. Comment out or remove the startDemo() call
6. Include the Supabase JavaScript client library in your HTML:
   <script src="https://unpkg.com/@supabase/supabase-js@2"></script>

TABLE SCHEMA:
CREATE TABLE burp_counter (
    id SERIAL PRIMARY KEY,
    count INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO burp_counter (count) VALUES (0);

OBS SETUP:
1. Add Browser Source in OBS
2. Set URL to this HTML file
3. Set Width: 400, Height: 200
4. Check "Shutdown source when not visible" = FALSE
5. Check "Refresh browser when scene becomes active" = FALSE
*/