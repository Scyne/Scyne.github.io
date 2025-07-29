// app.js

// PitchDeck class for managing slides and video player functionality
class PitchDeck {
    constructor() {
        // Set the correct number of slides (now 15 after removing slide 8)
        this.currentSlide = 1;
        this.totalSlides = 15; // Updated to 15 slides
        this.slides = document.querySelectorAll('.slide');
        this.indicators = document.querySelectorAll('.indicator');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.isTransitioning = false;

        // Video player elements
        this.videoPlayer = document.getElementById('videoPlayer');
        this.videoOptions = document.querySelectorAll('.video-option');
        this.videoDescription = document.getElementById('videoDescription');

        // Video data
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

    // Initialize event listeners and UI state
    init() {
        // Navigation button listeners
        this.prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.previousSlide();
        });
        this.nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.nextSlide();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // Indicator click handlers
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', (e) => {
                e.preventDefault();
                this.goToSlide(index + 1);
            });
        });

        // Video player functionality
        this.initVideoPlayer();

        // Set initial slide and navigation state
        this.updateSlide();
        this.updateNavigation();

        // Touch/swipe support
        this.initTouchSupport();
    }

    // Video player setup
    initVideoPlayer() {
        if (!this.videoOptions.length || !this.videoPlayer) {
            console.error('✗ Video player elements not found');
            return;
        }
        this.videoOptions.forEach((option, index) => {
            const videoId = option.getAttribute('data-video');
            option.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.selectVideo(videoId);
            });
        });
        // Set initial video
        this.selectVideo('6_fGJ5VRasc');
    }

    // Select a video and update UI
    selectVideo(videoId) {
        if (!videoId || !this.videos[videoId]) {
            console.error('✗ Invalid video ID:', videoId);
            return;
        }
        // Update active state
        this.videoOptions.forEach(option => {
            option.classList.remove('active');
            if (option.getAttribute('data-video') === videoId) {
                option.classList.add('active');
            }
        });
        // Update iframe src
        if (this.videoPlayer) {
            const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&rel=0&showinfo=0&modestbranding=1&origin=${window.location.origin}`;
            this.videoPlayer.src = '';
            setTimeout(() => {
                this.videoPlayer.src = embedUrl;
            }, 100);
        }
        // Update description
        if (this.videoDescription) {
            this.videoDescription.textContent = this.videos[videoId].description;
        }
    }

    // Keyboard navigation handler
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
            case ' ':
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

    // Go to previous slide
    previousSlide() {
        if (this.isTransitioning) return;
        if (this.currentSlide > 1) {
            this.currentSlide--;
            this.updateSlide();
            this.updateNavigation();
        }
    }

    // Go to next slide
    nextSlide() {
        if (this.isTransitioning) return;
        if (this.currentSlide < this.totalSlides) {
            this.currentSlide++;
            this.updateSlide();
            this.updateNavigation();
        }
    }

    // Go to a specific slide
    goToSlide(slideNumber) {
        if (this.isTransitioning) return;
        if (slideNumber >= 1 && slideNumber <= this.totalSlides && slideNumber !== this.currentSlide) {
            this.currentSlide = slideNumber;
            this.updateSlide();
            this.updateNavigation();
        }
    }

    // Update slide visibility and indicator state
    updateSlide() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        // Hide all slides
        this.slides.forEach(slide => slide.classList.remove('active'));
        // Show current slide
        const targetSlide = Array.from(this.slides).find(slide =>
            slide.getAttribute('data-slide') === this.currentSlide.toString()
        );
        if (targetSlide) {
            targetSlide.offsetHeight; // Force reflow
            targetSlide.classList.add('active');
        }
        // Update indicators
        this.indicators.forEach((indicator, index) => {
            indicator.classList.remove('active');
            if (index + 1 === this.currentSlide) {
                indicator.classList.add('active');
            }
        });
        setTimeout(() => {
            this.isTransitioning = false;
        }, 650);
    }

    // Update navigation button state
    updateNavigation() {
        if (this.currentSlide === 1) {
            this.prevBtn.disabled = true;
            this.prevBtn.textContent = 'Start';
        } else {
            this.prevBtn.disabled = false;
            this.prevBtn.textContent = 'Previous';
        }
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
        let threshold = 50;
        let restraint = 100;
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
                    this.nextSlide();
                } else {
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

    // Reset to first slide and video
    reset() {
        this.currentSlide = 1;
        this.updateSlide();
        this.updateNavigation();
        this.selectVideo('6_fGJ5VRasc');
    }

    // Debug video player state
    debugVideoPlayer() {
        console.log('=== VIDEO PLAYER DEBUG INFO ===');
        console.log('Video options found:', this.videoOptions.length);
        console.log('Video player element:', this.videoPlayer ? 'Found' : 'Not found');
        console.log('Video description element:', this.videoDescription ? 'Found' : 'Not found');
        console.log('Available videos:', Object.keys(this.videos));
        if (this.videoPlayer) {
            console.log('Current video src:', this.videoPlayer.src);
        }
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

    // Test video switching
    testVideoSwitching() {
        this.goToSlide(6);
        setTimeout(() => {
            const videoIds = ['6_fGJ5VRasc', 'XcQ69yjIu9A', 'vloNmTqxYNE', 'KwjZxTbsfYU'];
            let testIndex = 0;
            const testInterval = setInterval(() => {
                if (testIndex < videoIds.length) {
                    const videoId = videoIds[testIndex];
                    this.selectVideo(videoId);
                    testIndex++;
                } else {
                    clearInterval(testInterval);
                    this.selectVideo('6_fGJ5VRasc');
                }
            }, 2000);
        }, 1000);
    }
}

// DOMContentLoaded: initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Check for correct number of slides/indicators
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.indicator');
    if (slides.length !== 15 || indicators.length !== 15) {
        console.error('✗ CRITICAL ERROR: Mismatch in slide/indicator count! Expected 15 each.');
        return;
    }
    // Only first slide/indicator active
    slides.forEach((slide, index) => {
        slide.classList.remove('active');
        if (index === 0) slide.classList.add('active');
    });
    indicators.forEach((indicator, index) => {
        indicator.classList.remove('active');
        if (index === 0) indicator.classList.add('active');
    });
    // Create pitch deck instance
    const pitchDeck = new PitchDeck();
    addVisualEnhancements();
    window.pitchDeck = pitchDeck;
});

// Visual enhancements for UI
function addVisualEnhancements() {
    // Navigation button hover
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
    // Indicator hover
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
    // Video option hover
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
    // Parallax background
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2;
        mouseY = (e.clientY / window.innerHeight) * 2;
        document.body.style.backgroundPosition = `${50 + mouseX}% ${50 + mouseY}%`;
    });
}

// Debug slide state
function debugSlideState() {
    const activeSlides = document.querySelectorAll('.slide.active');
    const activeIndicators = document.querySelectorAll('.indicator.active');
    return {
        activeSlides: activeSlides.length,
        activeIndicators: activeIndicators.length,
        currentSlide: window.pitchDeck ? window.pitchDeck.currentSlide : 'not initialized'
    };
}

// Test video functionality
function testVideoFunctionality() {
    if (!window.pitchDeck) {
        console.error('✗ PitchDeck not initialized');
        return false;
    }
    window.pitchDeck.goToSlide(6);
    setTimeout(() => {
        const videoPlayer = document.getElementById('videoPlayer');
        const videoOptions = document.querySelectorAll('.video-option');
        if (videoOptions.length > 0 && videoOptions[1]) {
            videoOptions[1].click();
        }
    }, 1000);
    return true;
}

// Expose debug/test functions
window.debugSlideState = debugSlideState;
window.testVideoFunctionality = testVideoFunctionality;

// Error handling
window.addEventListener('error', (e) => {
    console.error('✗ Application error:', e.error);
});

// Post-load verification of critical elements
window.addEventListener('load', () => {
    const criticalElements = [
        { selector: '.slide', expected: 15, name: 'slides' },
        { selector: '.indicator', expected: 15, name: 'indicators' },
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
    // Background image check
    const body = document.body;
    const computedStyle = window.getComputedStyle(body);
    const backgroundImage = computedStyle.backgroundImage;
    if (backgroundImage && backgroundImage.includes('SCYNEWAVEbackground.jpg')) {
        console.log('✓ Background image successfully applied to body');
    } else {
        console.error('✗ Background image not found on body');
    }
    // Slides background check
    const slides = document.querySelectorAll('.slide');
    let slidesWithBackground = 0;
    slides.forEach((slide) => {
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
});
