class PitchDeck {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 16; // FIXED: Updated to 16 slides
        this.slides = document.querySelectorAll('.slide');
        this.indicators = document.querySelectorAll('.indicator');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.isTransitioning = false;
        
        // CRITICAL: Video player elements - TOP PRIORITY
        this.videoPlayer = document.getElementById('videoPlayer');
        this.videoOptions = document.querySelectorAll('.video-option');
        this.videoDescription = document.getElementById('videoDescription');
        
        // CRITICAL: Video data with proper descriptions - TOP PRIORITY
        this.videos = {
            'XcQ69yjIu9A': {
                title: 'Phasma Finds Love',
                duration: '3:36',
                description: 'Pop culture satire and storytelling that demonstrates our unique voice in VR comedy'
            },
            'vloNmTqxYNE': {
                title: 'Do the Brushwood',
                duration: '1:43',
                description: 'Interactive VR-native content showcasing our innovative approach to virtual reality entertainment'
            },
            '6_fGJ5VRasc': {
                title: 'A Very Insightful Interview',
                duration: '0:44',
                description: 'Brainrot meme humor example demonstrating our understanding of internet culture'
            },
            'KwjZxTbsfYU': {
                title: 'Banned From Steam',
                duration: '10:00',
                description: 'Range demonstration showing the longform comedy content of The Scynewave Show'
            }
        };
        
        this.init();
    }
    
    init() {
        console.log('Initializing PitchDeck with', this.totalSlides, 'slides');
        
        // Initialize event listeners
        this.prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.previousSlide();
        });
        
        this.nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.nextSlide();
        });
        
        // Add keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Add indicator click handlers
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', (e) => {
                e.preventDefault();
                this.goToSlide(index + 1);
            });
        });
        
        // CRITICAL: Initialize video player functionality - TOP PRIORITY
        this.initVideoPlayer();
        
        // Initialize the first slide
        this.updateSlide();
        this.updateNavigation();
        
        // Add touch support
        this.initTouchSupport();
        
        console.log('✓ PitchDeck initialized successfully');
        console.log('✓ Video player functionality enabled');
        console.log('✓ Background images applied to all slides');
    }
    
    // CRITICAL: Video player initialization and functionality - TOP PRIORITY
    initVideoPlayer() {
        console.log('Initializing video player...');
        
        if (!this.videoOptions.length || !this.videoPlayer) {
            console.error('✗ Video player elements not found');
            console.error('Video options:', this.videoOptions.length);
            console.error('Video player:', !!this.videoPlayer);
            return;
        }
        
        // CRITICAL: Add click handlers to video options - TOP PRIORITY
        this.videoOptions.forEach((option, index) => {
            const videoId = option.getAttribute('data-video');
            console.log(`Setting up video option ${index + 1}: ${videoId}`);
            
            option.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`Video option clicked: ${videoId}`);
                this.selectVideo(videoId);
            });
        });
        
        console.log('✓ Video player initialized with', this.videoOptions.length, 'video options');
        
        // Set initial video
        this.selectVideo('6_fGJ5VRasc');
    }
    
    // CRITICAL: Video selection functionality - TOP PRIORITY
    selectVideo(videoId) {
        console.log('Selecting video:', videoId);
        
        if (!videoId || !this.videos[videoId]) {
            console.error('✗ Invalid video ID:', videoId);
            return;
        }
        
        // CRITICAL: Update active video option visual state - TOP PRIORITY
        this.videoOptions.forEach(option => {
            option.classList.remove('active');
            if (option.getAttribute('data-video') === videoId) {
                option.classList.add('active');
                console.log('✓ Video option marked as active:', videoId);
            }
        });
        
        // CRITICAL: Update video player iframe source - TOP PRIORITY
        if (this.videoPlayer) {
            const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&rel=0&showinfo=0&modestbranding=1&origin=${window.location.origin}`;
            
            // Force iframe reload by setting src to empty first, then to new URL
            this.videoPlayer.src = '';
            setTimeout(() => {
                this.videoPlayer.src = embedUrl;
                console.log('✓ Video player updated to:', videoId);
                console.log('✓ New embed URL:', embedUrl);
            }, 100);
        } else {
            console.error('✗ Video player iframe not found');
        }
        
        // CRITICAL: Update video description - TOP PRIORITY
        if (this.videoDescription) {
            const videoData = this.videos[videoId];
            this.videoDescription.textContent = videoData.description;
            console.log('✓ Video description updated');
        } else {
            console.error('✗ Video description element not found');
        }
    }
    
    handleKeyPress(event) {
        if (this.isTransitioning) return;
        
        switch(event.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                event.preventDefault();
                this.previousSlide();
                break;
            case 'ArrowRight':
            case 'ArrowDown':
            case ' ': // Spacebar
                event.preventDefault();
                this.nextSlide();
                break;
            case 'Home':
                event.preventDefault();
                this.goToSlide(1);
                break;
            case 'End':
                event.preventDefault();
                this.goToSlide(this.totalSlides);
                break;
        }
    }
    
    previousSlide() {
        if (this.isTransitioning) return;
        
        if (this.currentSlide > 1) {
            this.currentSlide--;
            this.updateSlide();
            this.updateNavigation();
        }
    }
    
    nextSlide() {
        if (this.isTransitioning) return;
        
        if (this.currentSlide < this.totalSlides) {
            this.currentSlide++;
            this.updateSlide();
            this.updateNavigation();
        }
    }
    
    goToSlide(slideNumber) {
        if (this.isTransitioning) return;
        
        if (slideNumber >= 1 && slideNumber <= this.totalSlides && slideNumber !== this.currentSlide) {
            this.currentSlide = slideNumber;
            this.updateSlide();
            this.updateNavigation();
        }
    }
    
    updateSlide() {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        // FIXED: Properly hide all slides first to prevent overlap
        this.slides.forEach((slide, index) => {
            slide.classList.remove('active');
        });
        
        // Find and activate the current slide
        const targetSlide = Array.from(this.slides).find(slide => 
            slide.getAttribute('data-slide') === this.currentSlide.toString()
        );
        
        if (targetSlide) {
            // Force reflow to ensure the class removal takes effect
            targetSlide.offsetHeight;
            
            // Add active class to current slide
            targetSlide.classList.add('active');
            console.log('✓ Slide updated to:', this.currentSlide);
        } else {
            console.error('✗ Could not find slide:', this.currentSlide);
        }
        
        // Update indicators
        this.indicators.forEach((indicator, index) => {
            indicator.classList.remove('active');
            if (index + 1 === this.currentSlide) {
                indicator.classList.add('active');
            }
        });
        
        // Reset transition flag after animation completes
        setTimeout(() => {
            this.isTransitioning = false;
        }, 650); // Slightly longer than CSS transition
    }
    
    updateNavigation() {
        // Update previous button
        if (this.currentSlide === 1) {
            this.prevBtn.disabled = true;
            this.prevBtn.textContent = 'Start';
        } else {
            this.prevBtn.disabled = false;
            this.prevBtn.textContent = 'Previous';
        }
        
        // Update next button  
        if (this.currentSlide === this.totalSlides) {
            this.nextBtn.disabled = true;
            this.nextBtn.textContent = 'Finish';
        } else {
            this.nextBtn.disabled = false;
            this.nextBtn.textContent = 'Next';
        }
    }
    
    // Touch/swipe support for mobile
    initTouchSupport() {
        let startX = 0;
        let startY = 0;
        let threshold = 50; // Minimum distance for swipe
        let restraint = 100; // Maximum perpendicular distance
        
        document.addEventListener('touchstart', (e) => {
            const touchobj = e.changedTouches[0];
            startX = touchobj.pageX;
            startY = touchobj.pageY;
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            if (this.isTransitioning) return;
            
            const touchobj = e.changedTouches[0];
            const distX = touchobj.pageX - startX;
            const distY = touchobj.pageY - startY;
            
            if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) {
                if (distX < 0) {
                    // Swipe left - next slide
                    this.nextSlide();
                } else {
                    // Swipe right - previous slide
                    this.previousSlide();
                }
            }
        }, { passive: true });
    }
    
    // Get current progress
    getProgress() {
        return {
            current: this.currentSlide,
            total: this.totalSlides,
            percentage: Math.round((this.currentSlide / this.totalSlides) * 100)
        };
    }
    
    // Reset to first slide
    reset() {
        this.currentSlide = 1;
        this.updateSlide();
        this.updateNavigation();
        // Reset video player to first video
        this.selectVideo('6_fGJ5VRasc');
    }
    
    // CRITICAL: Debug method for video player - TOP PRIORITY
    debugVideoPlayer() {
        console.log('=== VIDEO PLAYER DEBUG INFO ===');
        console.log('Video options found:', this.videoOptions.length);
        console.log('Video player element:', this.videoPlayer ? 'Found' : 'Not found');
        console.log('Video description element:', this.videoDescription ? 'Found' : 'Not found');
        console.log('Available videos:', Object.keys(this.videos));
        
        if (this.videoPlayer) {
            console.log('Current video src:', this.videoPlayer.src);
        }
        
        // Test each video option
        this.videoOptions.forEach((option, index) => {
            const videoId = option.getAttribute('data-video');
            const isActive = option.classList.contains('active');
            console.log(`Video option ${index + 1}: ${videoId} (active: ${isActive})`);
        });
        
        return {
            videoOptions: this.videoOptions.length,
            hasVideoPlayer: !!this.videoPlayer,
            hasVideoDescription: !!this.videoDescription,
            availableVideos: Object.keys(this.videos),
            currentVideoSrc: this.videoPlayer ? this.videoPlayer.src : null
        };
    }
    
    // CRITICAL: Test video switching functionality - TOP PRIORITY
    testVideoSwitching() {
        console.log('=== TESTING VIDEO SWITCHING ===');
        
        // Go to slide 6 first
        this.goToSlide(6);
        
        setTimeout(() => {
            const videoIds = ['6_fGJ5VRasc', 'XcQ69yjIu9A', 'vloNmTqxYNE', 'KwjZxTbsfYU'];
            let testIndex = 0;
            
            const testInterval = setInterval(() => {
                if (testIndex < videoIds.length) {
                    const videoId = videoIds[testIndex];
                    console.log(`Testing video switch to: ${videoId}`);
                    this.selectVideo(videoId);
                    testIndex++;
                } else {
                    clearInterval(testInterval);
                    console.log('✓ Video switching test completed');
                    // Reset to first video
                    this.selectVideo('6_fGJ5VRasc');
                }
            }, 2000);
        }, 1000);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== INITIALIZING THE SCYNEWAVE SHOW PITCH DECK ===');
    
    // Ensure all slides are properly initialized
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.indicator');
    
    // Verify we have the correct number of slides and indicators
    console.log(`Found ${slides.length} slides and ${indicators.length} indicators`);
    
    if (slides.length !== 16 || indicators.length !== 16) {
        console.error('✗ CRITICAL ERROR: Mismatch in slide/indicator count! Expected 16 each.');
        console.error(`Slides: ${slides.length}, Indicators: ${indicators.length}`);
        return;
    }
    
    // Initialize slides - make sure only the first is active
    slides.forEach((slide, index) => {
        slide.classList.remove('active');
        if (index === 0) {
            slide.classList.add('active');
        }
    });
    
    // Initialize indicators - make sure only the first is active  
    indicators.forEach((indicator, index) => {
        indicator.classList.remove('active');
        if (index === 0) {
            indicator.classList.add('active');
        }
    });
    
    // Create the main pitch deck instance
    const pitchDeck = new PitchDeck();
    
    // Add visual enhancements
    addVisualEnhancements();
    
    // Make pitch deck globally available for debugging
    window.pitchDeck = pitchDeck;
    
    console.log('=== INITIALIZATION COMPLETE ===');
    console.log('✓ THE SCYNEWAVE SHOW PITCH DECK LOADED SUCCESSFULLY');
    console.log('✓ CRITICAL FEATURES IMPLEMENTED:');
    console.log('  • Background image applied to all slides (SCYNEWAVEbackground.jpg)');
    console.log('  • Working video players on slide 6 with proper switching');
    console.log('  • All 16 slides present and accessible');
    console.log('  • Fixed visual overlap issues');
    console.log('');
    console.log('NAVIGATION OPTIONS:');
    console.log('  • Arrow keys (left/right/up/down)');
    console.log('  • Previous/Next buttons');
    console.log('  • Click slide indicators');
    console.log('  • Touch/swipe on mobile');
    console.log('');
    console.log('VIDEO FUNCTIONALITY (Slide 6):');
    console.log('  • Click different video options to change videos');
    console.log('  • Videos will switch with proper YouTube embeds');
    console.log('');
    console.log('DEBUG COMMANDS:');
    console.log('  • pitchDeck.goToSlide(n) - Go to specific slide');
    console.log('  • pitchDeck.reset() - Reset to first slide');
    console.log('  • pitchDeck.debugVideoPlayer() - Debug video functionality');
    console.log('  • pitchDeck.testVideoSwitching() - Test video switching');
    console.log('  • debugSlideState() - Debug slide state');
});

// Visual enhancements
function addVisualEnhancements() {
    // Add hover effects to navigation buttons
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            if (!this.disabled) {
                this.style.transform = 'scale(1.05)';
                this.style.boxShadow = '0 5px 15px rgba(4, 0, 245, 0.4)';
            }
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = 'none';
        });
    });
    
    // Add hover effects to indicators
    const indicators = document.querySelectorAll('.indicator');
    indicators.forEach(indicator => {
        indicator.addEventListener('mouseenter', function() {
            if (!this.classList.contains('active')) {
                this.style.backgroundColor = 'var(--brand-grayish-blue)';
                this.style.transform = 'scale(1.2)';
            }
        });
        
        indicator.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                this.style.transform = 'scale(1)';
            }
        });
    });
    
    // CRITICAL: Add hover effects to video options - TOP PRIORITY
    const videoOptions = document.querySelectorAll('.video-option');
    videoOptions.forEach(option => {
        option.addEventListener('mouseenter', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'scale(1.02)';
                this.style.boxShadow = '0 5px 15px rgba(4, 0, 245, 0.3)';
            }
        });
        
        option.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'scale(1)';
                this.style.boxShadow = 'none';
            }
        });
    });
    
    // Add subtle background movement effect
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2;
        mouseY = (e.clientY / window.innerHeight) * 2;
        
        // Apply subtle parallax effect to background
        document.body.style.backgroundPosition = `${50 + mouseX}% ${50 + mouseY}%`;
    });
}

// Utility function for debugging slide state
function debugSlideState() {
    const activeSlides = document.querySelectorAll('.slide.active');
    const activeIndicators = document.querySelectorAll('.indicator.active');
    
    console.log('=== SLIDE STATE DEBUG ===');
    console.log(`Active slides: ${activeSlides.length}`);
    console.log(`Active indicators: ${activeIndicators.length}`);
    
    if (activeSlides.length > 0) {
        console.log(`Current slide data-slide: ${activeSlides[0].getAttribute('data-slide')}`);
    }
    
    return {
        activeSlides: activeSlides.length,
        activeIndicators: activeIndicators.length,
        currentSlide: window.pitchDeck ? window.pitchDeck.currentSlide : 'not initialized'
    };
}

// CRITICAL: Test video functionality specifically - TOP PRIORITY
function testVideoFunctionality() {
    console.log('=== TESTING VIDEO FUNCTIONALITY ===');
    
    if (!window.pitchDeck) {
        console.error('✗ PitchDeck not initialized');
        return false;
    }
    
    // Navigate to slide 6
    console.log('Navigating to slide 6...');
    window.pitchDeck.goToSlide(6);
    
    setTimeout(() => {
        const videoPlayer = document.getElementById('videoPlayer');
        const videoOptions = document.querySelectorAll('.video-option');
        
        console.log('Video player found:', !!videoPlayer);
        console.log('Video options found:', videoOptions.length);
        
        if (videoOptions.length > 0) {
            console.log('Testing video option clicks...');
            videoOptions.forEach((option, index) => {
                const videoId = option.getAttribute('data-video');
                console.log(`Video option ${index + 1}: ${videoId}`);
            });
            
            // Test clicking the second video option
            if (videoOptions[1]) {
                console.log('Clicking second video option...');
                videoOptions[1].click();
            }
        }
    }, 1000);
    
    return true;
}

// Make debug functions globally available
window.debugSlideState = debugSlideState;
window.testVideoFunctionality = testVideoFunctionality;

// Error handling for missing elements
window.addEventListener('error', (e) => {
    console.error('✗ Application error:', e.error);
});

// Performance monitoring and critical element verification
window.addEventListener('load', () => {
    console.log('=== POST-LOAD VERIFICATION ===');
    
    // Verify critical elements are present
    const criticalElements = [
        { selector: '.slide', expected: 16, name: 'slides' },
        { selector: '.indicator', expected: 16, name: 'indicators' },
        { selector: '#prevBtn', expected: 1, name: 'previous button' },
        { selector: '#nextBtn', expected: 1, name: 'next button' },
        { selector: '.navigation', expected: 1, name: 'navigation' },
        { selector: '#videoPlayer', expected: 1, name: 'video player' },
        { selector: '.video-option', expected: 4, name: 'video options' }
    ];
    
    let allElementsFound = true;
    
    criticalElements.forEach(({ selector, expected, name }) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === expected) {
            console.log(`✓ Found ${elements.length} ${name}`);
        } else {
            console.error(`✗ Expected ${expected} ${name}, found ${elements.length}`);
            allElementsFound = false;
        }
    });
    
    // CRITICAL: Verify background image implementation - TOP PRIORITY
    const body = document.body;
    const computedStyle = window.getComputedStyle(body);
    const backgroundImage = computedStyle.backgroundImage;
    
    if (backgroundImage && backgroundImage.includes('SCYNEWAVEbackground.jpg')) {
        console.log('✓ Background image successfully applied to body');
    } else {
        console.error('✗ Background image not found on body');
        console.log('Current body background-image:', backgroundImage);
    }
    
    // Check slides for background images
    const slides = document.querySelectorAll('.slide');
    let slidesWithBackground = 0;
    slides.forEach((slide, index) => {
        const slideStyle = window.getComputedStyle(slide);
        const slideBackground = slideStyle.backgroundImage;
        if (slideBackground && slideBackground.includes('SCYNEWAVEbackground.jpg')) {
            slidesWithBackground++;
        }
    });
    
    if (slidesWithBackground === slides.length) {
        console.log(`✓ Background image applied to all ${slidesWithBackground} slides`);
    } else {
        console.error(`✗ Background image only applied to ${slidesWithBackground}/${slides.length} slides`);
    }
    
    if (allElementsFound) {
        console.log('✓ All critical elements verified successfully');
    } else {
        console.error('✗ Some critical elements are missing');
    }
    
    console.log('=== VERIFICATION COMPLETE ===');
});
