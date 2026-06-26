/* -----------------------------------------------------------------------------
   Green Loop Premium Brand Guidelines - Single-Page Scrolling Layout Script
   ----------------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {

    // Mark JS as active (lifts FOUC guard on hero elements)
    document.body.classList.add('js-ready');
    
    // 1. Check for prefers-reduced-motion (A11y constraint)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Animation Tokens mapping to user specs (Slowing down durations for majestic feel)
    const anim = {
        y: prefersReducedMotion ? 0 : 35,
        ySmall: prefersReducedMotion ? 0 : 15,
        x: prefersReducedMotion ? 0 : 15,
        scale: prefersReducedMotion ? 1 : 0.95,
        duration: prefersReducedMotion ? 0.01 : 1.5, // Majestic 1.5s default duration
        ease: "power4.out" // Clean exponential ease-out-expo
    };

    // 2. Initialize Lenis Smooth Scrolling
    const lenis = new Lenis({
        duration: prefersReducedMotion ? 0.01 : 1.5, // Slightly longer smooth scroll duration
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // premium spring easing
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5,
        infinite: false
    });

    // Sync Lenis scroll with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // 3. Pre-split all .split-line elements once on page load for smooth, layout-safe reveals
    const splitLines = document.querySelectorAll('.split-line');
    splitLines.forEach(el => {
        if (!prefersReducedMotion) {
            const split = new SplitType(el, { types: 'lines, words' });
            split.lines.forEach(line => {
                const mask = document.createElement('div');
                mask.className = 'line-mask';
                line.parentNode.insertBefore(mask, line);
                mask.appendChild(line);
            });
            gsap.set(split.words, { yPercent: 105 });
            el.splitWords = split.words;
        }
    });

    // 4. Dynamic Section Dividers & Placeholder SVG Borders Injection
    // Section Dividers injection between all slide sections
    const sections = document.querySelectorAll('.slide-section');
    sections.forEach((section, idx) => {
        if (idx > 0) {
            const hr = document.createElement('hr');
            hr.className = 'section-divider';
            section.parentNode.insertBefore(hr, section);
        }
    });

    // Placeholder Borders injection for dashed border animations
    const placeholders = document.querySelectorAll('.placeholder-frame');
    placeholders.forEach(frame => {
        // Create wrapper SVG
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("class", "placeholder-border-svg");
        svg.style.position = "absolute";
        svg.style.top = "0";
        svg.style.left = "0";
        svg.style.width = "100%";
        svg.style.height = "100%";
        svg.style.pointerEvents = "none";
        svg.style.zIndex = "0";
        
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("class", "placeholder-border-rect");
        rect.setAttribute("x", "0.75");
        rect.setAttribute("y", "0.75");
        rect.setAttribute("width", "calc(100% - 1.5px)");
        rect.setAttribute("height", "calc(100% - 1.5px)");
        rect.setAttribute("fill", "none");
        rect.setAttribute("stroke", "rgba(46, 46, 46, 0.12)");
        rect.setAttribute("stroke-width", "1.5");
        rect.setAttribute("stroke-dasharray", "6 4");
        
        svg.appendChild(rect);
        frame.appendChild(svg);
        
        // Remove static CSS border
        frame.style.border = "none";
    });

    // Inject hover rules dynamically to avoid double file modifications
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
        .placeholder-frame:hover .placeholder-border-rect {
            stroke: var(--color-keells-green) !important;
            stroke-width: 2px !important;
        }
        .placeholder-border-svg {
            overflow: visible;
        }
    `;
    document.head.appendChild(styleEl);

    // 5. Custom Spotlight Cursor Trail Loop (Squash & Stretch Velocity Follower)
    const cursorDot = document.querySelector('.custom-cursor-dot');
    const cursorCircle = document.querySelector('.custom-cursor-circle');
    
    let mouseX = 0;
    let mouseY = 0;
    let circleX = 0;
    let circleY = 0;
    let speed = 0;
    let angle = 0;
    
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Instant dot position
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
    });
    
    // Lagging circle trail interpolation
    gsap.ticker.add(() => {
        if (prefersReducedMotion) {
            cursorCircle.style.left = `${mouseX}px`;
            cursorCircle.style.top = `${mouseY}px`;
            return;
        }

        const vx = mouseX - circleX;
        const vy = mouseY - circleY;
        
        // Position interpolation (lerp)
        circleX += vx * 0.1;
        circleY += vy * 0.1;
        
        // Calculate velocity magnitude & direction
        const currentSpeed = Math.sqrt(vx * vx + vy * vy);
        const currentAngle = Math.atan2(vy, vx) * 180 / Math.PI;
        
        // Smooth out velocity transitions
        speed += (currentSpeed - speed) * 0.15;
        angle += (currentAngle - angle) * 0.15;
        
        // Squash and stretch scale limits (max stretch 1.4x, max squeeze 0.7x)
        const scaleX = 1 + Math.min(speed * 0.005, 0.4);
        const scaleY = 1 - Math.min(speed * 0.005, 0.3);
        
        gsap.set(cursorCircle, {
            x: circleX,
            y: circleY,
            left: 0,
            top: 0,
            xPercent: -50,
            yPercent: -50,
            rotation: angle,
            scaleX: scaleX,
            scaleY: scaleY,
            transformOrigin: "center center"
        });
    });

    // Active state triggers on hover elements
    const hoverElements = document.querySelectorAll('.overview-box, .cta-button, .dot-link, .directory-card, .metric-card, .operations-step, .color-spec-card, .placeholder-frame, .strategy-table tbody tr');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursorCircle.classList.add('active'));
        el.addEventListener('mouseleave', () => cursorCircle.classList.remove('active'));
    });

    // 6. ScrollTrigger Initialization
    gsap.registerPlugin(ScrollTrigger);

    const slides = gsap.utils.toArray('.slide-section');
    const dotLinks = document.querySelectorAll('.dot-link');

    // 6a. Navbar Glassmorphism on scroll past 40px
    const header = document.querySelector('.site-header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 40) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // State variables for logo transition lifecycle
    let isPageLoading = true;

    // 6b. Page Load Hero Cascade (Awwwards Mask Entrance)
    const heroSection = document.querySelector('#slide-hero');
    if (heroSection) {
        const isScrolledPastHero = window.scrollY > window.innerHeight * 0.5;

        // Common scrubbed ScrollTrigger setup function
        const initScrubbedLogoTrigger = () => {
            gsap.fromTo('#shared-logo', 
                {
                    x: '50vw',
                    y: '28vh',
                    xPercent: -50,
                    yPercent: -50,
                    scale: 1.0,
                    transformOrigin: 'center center'
                },
                {
                    scrollTrigger: {
                        trigger: '#slide-hero',
                        start: 'top top',
                        end: 'bottom top',
                        scrub: true,
                        invalidateOnRefresh: true,
                    },
                    x: () => window.innerWidth * 0.05, // Align with left edge of container (5vw)
                    y: 40, // 40px from top
                    xPercent: 0,
                    yPercent: 0,
                    scale: 0.27,
                    transformOrigin: 'left center',
                    ease: 'none'
                }
            );
        };

        if (isScrolledPastHero) {
            // Immediately place logo in top-left target if loaded scrolled down
            gsap.set('#shared-logo', {
                x: () => window.innerWidth * 0.05,
                y: 40,
                xPercent: 0,
                yPercent: 0,
                scale: 0.27,
                opacity: 1,
                transformOrigin: 'left center'
            });
            isPageLoading = false;
            initScrubbedLogoTrigger();
        } else {
            const loadTL = gsap.timeline({ delay: 0.2 });

            const heroHeading = heroSection.querySelector('.split-line');
            const heroTagline = heroSection.querySelector('.tagline');
            const heroMeta = heroSection.querySelector('.meta-tag');

            // Set logo to starting position (centered on hero) before animating
            gsap.set('#shared-logo', {
                x: '50vw',
                y: '28vh',
                xPercent: -50,
                yPercent: -50,
                scale: 0.7,
                opacity: 0,
                transformOrigin: 'center center'
            });

            // Logo placeholder fade + scale entrance
            loadTL.to('#shared-logo', {
                opacity: 1,
                scale: 1.0,
                duration: 0.8,
                ease: 'power3.out'
            })
            // Eyebrow Label
            .from(heroMeta, {
                opacity: 0,
                x: -anim.x,
                duration: 1.0,
                ease: anim.ease
            }, "-=0.5");

            if (prefersReducedMotion) {
                loadTL.from([heroHeading, heroTagline], { opacity: 0, duration: 1.0, stagger: 0.2 }, "-=0.4");
            } else {
                if (heroHeading && heroHeading.splitWords) {
                    loadTL.to(heroHeading.splitWords, {
                        yPercent: 0,
                        duration: 1.6,
                        stagger: 0.06,
                        ease: "power4.out"
                    }, "-=0.6");
                }
                if (heroTagline && heroTagline.splitWords) {
                    loadTL.to(heroTagline.splitWords, {
                        yPercent: 0,
                        duration: 1.4,
                        stagger: 0.03,
                        ease: "power4.out"
                    }, "-=0.8");
                }
            }

            loadTL.fromTo('.hero-cta-wrap', 
                { y: anim.ySmall, opacity: 0 },
                { y: 0, opacity: 1, duration: 1.0, ease: anim.ease }
            , "-=0.6")
            // "v1.0" badge scale-up
            .from('.version-label', {
                opacity: 0,
                scale: 0.9,
                duration: 0.8,
                ease: anim.ease
            }, "-=0.5")
            // Floating Dot nav fade-in
            .from('.dot-nav', {
                opacity: 0,
                duration: 1.2
            }, "-=0.6")
            .call(() => {
                isPageLoading = false;
                initScrubbedLogoTrigger();
            });
        }
    } else {
        isPageLoading = false;
    }

    // 6c. Active State Sync for Dot Navigation, Mesh Colors, and Shared Morphing Frame on scroll
    const frameLabels = {
        'slide-hero': '[ Green Loop System Canvas ]',
        'slide-overview': '[ Green Loop System Canvas ]',
        'slide-directory': '[ Green Loop System Canvas ]',
        'slide-conflict': '[ Research & Development ]',
        'slide-survey': '[ Research & Development ]',
        'slide-competitors': '[ Research & Development ]',
        'slide-usp': '[ Product Definition ]',
        'slide-decisions': '[ Product Definition ]',
        'slide-logo': '[ Green Loop Brand Specs ]',
        'slide-construction': '[ Green Loop Brand Specs ]',
        'slide-colors': '[ Green Loop Brand System ]',
        'slide-type': '[ Green Loop Brand System ]',
        'slide-photo': '[ Green Loop Brand System ]',
        'slide-iconography': '[ Green Loop Brand System ]',
        'slide-applications': '[ Green Loop Brand Specs ]',
        'slide-mkt-campaigns': '[ Marketing & Outreach ]',
        'slide-mkt-channels': '[ Marketing & Outreach ]',
        'slide-rvm-render': '[ RVM Physical Design ]',
        'slide-rvm-dimensions': '[ RVM Physical Design ]',
        'slide-placement': '[ RVM Lobby Placement ]',
        'slide-rvm-screen': '[ RVM UI/UX Interface ]',
        'slide-rvm-app': '[ RVM UI/UX Interface ]',
        'slide-rewards': '[ RVM Reward Matrix ]',
        'slide-telemetry': '[ RVM Smart Logistics ]',
        'slide-logistics': '[ RVM Smart Logistics ]',
        'slide-journey': '[ Customer Journey ]',
        'slide-habit-loop': '[ Customer Journey ]',
        'slide-bus-model': '[ Revenue Model ]',
        'slide-bus-financials': '[ RVM Financial Matrix ]',
        'slide-bus-roadmap': '[ Future Roadmap ]',
        'slide-future-education': '[ Future Roadmap ]',
        'slide-mkt-calendar': '[ Future Roadmap ]'
    };

    // Shared morph state tracking
    let activeDefaultTarget = null;
    let activeDefaultLabel = '';
    let hoveredElement = null;

    function getElementBounds(element) {
        if (!element) return { left: 0, top: 0, width: 0, height: 0 };
        
        let revealAncestors = [];
        let cur = element;
        while (cur && cur !== document.body) {
            if (cur.classList.contains('reveal-element')) {
                revealAncestors.push(cur);
            }
            cur = cur.parentElement;
        }

        const originalTransforms = revealAncestors.map(el => {
            return {
                el: el,
                y: gsap.getProperty(el, "y")
            };
        });

        revealAncestors.forEach(el => {
            gsap.set(el, { y: 0 });
        });

        const viewportRect = document.querySelector('.viewport-container').getBoundingClientRect();
        const rect = element.getBoundingClientRect();

        originalTransforms.forEach(state => {
            gsap.set(state.el, { y: state.y });
        });

        return {
            left: rect.left - viewportRect.left,
            top: rect.top - viewportRect.top,
            width: rect.width,
            height: rect.height
        };
    }

    function updateFrameToTarget(target, labelText, isHover = false) {
        let frameOpacity = 1;
        let frameScale = 1;
        let frameTargetBounds = { left: 0, top: 0, width: 0, height: 0 };

        // Force hide the shared frame ONLY when slide-applications is active, targeted, or pinned
        const st = ScrollTrigger.getById('applications-trigger');
        const isInsideSlideApps = target && (target.closest('#slide-applications') || target.id === 'slide-applications');
        const isScrollInsideApps = st && (window.scrollY >= st.start && window.scrollY < st.end);

        if (isInsideSlideApps || isScrollInsideApps) {
            gsap.to('#shared-frame', { opacity: 0, scale: 0.8, duration: 0.3, overwrite: 'auto' });
            return;
        }

        if (!target) {
            frameOpacity = 0;
            frameScale = 0.8;
            const activeSlide = document.querySelector('.slide-section.active') || heroSection;
            const container = activeSlide.querySelector('.container') || activeSlide;
            frameTargetBounds = getElementBounds(container);
        } else {
            frameTargetBounds = getElementBounds(target);
        }

        const labelEl = document.getElementById('shared-frame-lbl');
        if (labelEl) {
            labelEl.innerText = labelText || '[ Green Loop System Canvas ]';
        }

        gsap.to('#shared-frame', {
            left: frameTargetBounds.left,
            top: frameTargetBounds.top,
            width: frameTargetBounds.width,
            height: frameTargetBounds.height,
            borderRadius: 8,
            opacity: frameOpacity,
            scale: frameScale,
            duration: isHover ? 0.6 : 1.2,
            ease: isHover ? 'power2.out' : 'power3.inOut',
            overwrite: 'auto',
            onUpdate: () => {
                const coordsText = document.getElementById('shared-frame-coords');
                if (coordsText) {
                    coordsText.innerText = `DX:${Math.round(frameTargetBounds.left)} DY:${Math.round(frameTargetBounds.top)}`;
                }
            }
        });
    }

    function updateSharedElements(activeSlide, force = false) {
        // Logo position is now fully managed by the scrubbed ScrollTrigger on the hero slide,
        // so we don't need any logo positioning calculations or GSAP animations here.

        // Determine default target for active slide
        const frameHide = activeSlide.getAttribute('data-frame-hide') === 'true';
        const frameTargetSelector = activeSlide.getAttribute('data-frame-target');

        if (frameHide || !frameTargetSelector) {
            activeDefaultTarget = null;
            activeDefaultLabel = '';
        } else {
            const targetEl = document.querySelector(frameTargetSelector);
            if (targetEl) {
                activeDefaultTarget = targetEl;
            } else {
                activeDefaultTarget = activeSlide.querySelector('.container') || activeSlide;
            }
            activeDefaultLabel = frameLabels[activeSlide.id] || '[ Green Loop System Canvas ]';
        }

        // Morph shared frame if not hovered
        if (!hoveredElement) {
            updateFrameToTarget(activeDefaultTarget, activeDefaultLabel, false);
        }
    }

    function getLabelForElement(el) {
        const card = el.closest('.guideline-card');
        if (card) {
            const attrLabel = card.getAttribute('data-frame-label');
            if (attrLabel) return `[ ${attrLabel} ]`;
            const monoLabel = card.querySelector('.mono-label');
            if (monoLabel) return `[ ${monoLabel.innerText.trim()} ]`;
        }
        
        const selfLabel = el.getAttribute('data-frame-label');
        if (selfLabel) return `[ ${selfLabel} ]`;

        const labelInside = el.querySelector('.frame-label');
        if (labelInside) return labelInside.innerText.trim();

        const colorCard = el.closest('.color-spec-card');
        if (colorCard) {
            const mono = colorCard.querySelector('.mono-label');
            if (mono) return `[ ${mono.innerText.trim()} ]`;
        }

        const dirCard = el.closest('.directory-card');
        if (dirCard) {
            const title = dirCard.querySelector('h4');
            if (title) return `[ ${title.innerText.trim()} ]`;
        }

        const metricCard = el.closest('.metric-card');
        if (metricCard) {
            const lbl = metricCard.querySelector('.metric-lbl');
            if (lbl) return `[ ${lbl.innerText.trim()} ]`;
        }

        const section = el.closest('.slide-section');
        if (section) {
            return frameLabels[section.id] || '[ Green Loop System Canvas ]';
        }

        return '[ Green Loop System Canvas ]';
    }

    // Attach frame hover listeners to all potential visual targets on page load
    const attachFrameHoverListeners = () => {
        const frameHoverTargets = document.querySelectorAll('.placeholder-frame, .strategy-table-wrapper, .color-spec-card, .directory-card, .metric-card');
        frameHoverTargets.forEach(el => {
            el.addEventListener('mouseenter', () => {
                hoveredElement = el;
                const label = getLabelForElement(el);
                updateFrameToTarget(el, label, true);
            });

            el.addEventListener('mouseleave', () => {
                if (hoveredElement === el) {
                    hoveredElement = null;
                    updateFrameToTarget(activeDefaultTarget, activeDefaultLabel, false);
                }
            });
        });
    };
    
    attachFrameHoverListeners();

    // Initial position on load
    if (heroSection) {
        updateSharedElements(heroSection);
    }

    slides.forEach((slide, idx) => {
        ScrollTrigger.create({
            trigger: slide,
            start: "top center",
            end: "bottom center",
            onToggle: self => {
                if (self.isActive) {
                    // Update active nav dot
                    dotLinks.forEach(link => link.classList.remove('active'));
                    if (dotLinks[idx]) {
                        dotLinks[idx].classList.add('active');
                    }

                    // Dynamically morph background blobs based on active section attribute values
                    const blob1Color = slide.getAttribute('data-blob1-color') || '#6DBB45';
                    const blob2Color = slide.getAttribute('data-blob2-color') || '#FFD54A';

                    gsap.to('.blob-1', {
                        backgroundColor: blob1Color,
                        x: slide.getAttribute('data-blob1-x') || '0vw',
                        y: slide.getAttribute('data-blob1-y') || '0vh',
                        scale: parseFloat(slide.getAttribute('data-blob1-scale')) || 1.0,
                        duration: 1.5,
                        ease: 'power3.out'
                    });

                    gsap.to('.blob-2', {
                        backgroundColor: blob2Color,
                        x: slide.getAttribute('data-blob2-x') || '0vw',
                        y: slide.getAttribute('data-blob2-y') || '0vh',
                        scale: parseFloat(slide.getAttribute('data-blob2-scale')) || 1.0,
                        duration: 1.5,
                        ease: 'power3.out'
                    });

                    // Morph shared logo and blueprint frame
                    updateSharedElements(slide);
                }
            }
        });
    });

    // 6d. Component-Level Scroll reveals (Triggered exactly when elements enter viewport)
    
    // Section Headers
    document.querySelectorAll('.slide-section').forEach(slide => {
        if (slide.id === 'slide-hero') return;
        const header = slide.querySelector('.section-header');
        if (!header) return;

        const eyebrow = header.querySelector('.section-num');
        const heading = header.querySelector('.split-line');

        const headerTL = gsap.timeline({
            scrollTrigger: {
                trigger: header,
                start: "top 85%",
                once: true
            }
        });

        if (eyebrow) {
            headerTL.from(eyebrow, {
                x: -anim.x,
                opacity: 0,
                duration: 0.8,
                ease: anim.ease
            });
        }

        if (heading) {
            if (prefersReducedMotion) {
                headerTL.from(heading, { opacity: 0, duration: 1.0 }, eyebrow ? "-=0.4" : "0");
            } else if (heading.splitWords) {
                headerTL.to(heading.splitWords, {
                    yPercent: 0,
                    duration: 1.5,
                    stagger: 0.05,
                    ease: "power4.out"
                }, eyebrow ? "-=0.5" : "0");
            }
        }
    });

    // Standard Reveal Elements (Text blocks, boxes, column contents)
    document.querySelectorAll('.reveal-element').forEach(el => {
        if (el.classList.contains('directory-grid-13') ||
            el.classList.contains('metric-row') ||
            el.classList.contains('strategy-table-wrapper') ||
            el.classList.contains('journey-flow')) {
            return; // Handled separately
        }

        gsap.fromTo(el, 
            { y: anim.ySmall, opacity: 0 },
            { 
                y: 0, 
                opacity: 1, 
                duration: 1.0, 
                ease: anim.ease,
                scrollTrigger: {
                    trigger: el,
                    start: "top 88%",
                    once: true
                },
                onComplete: () => {
                    el.querySelectorAll('strong.highlight-sweep').forEach(span => {
                        span.classList.add('active');
                    });
                }
            }
        );
    });

    // Section Divider Lines
    document.querySelectorAll('.section-divider').forEach(divider => {
        gsap.to(divider, {
            scaleX: 1,
            duration: 1.5,
            ease: anim.ease,
            scrollTrigger: {
                trigger: divider,
                start: "top 92%",
                once: true
            }
        });
    });

    // Placeholder Visual Card Frames
    document.querySelectorAll('.placeholder-frame').forEach(placeholder => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: placeholder,
                start: "top 85%",
                once: true
            }
        });
        
        tl.fromTo(placeholder, 
            {
                scale: anim.scale,
                opacity: 0
            },
            {
                scale: 1,
                opacity: 1,
                duration: 1.2,
                ease: anim.ease
            }
        );
        
        const rect = placeholder.querySelector('.placeholder-border-rect');
        if (rect && !prefersReducedMotion) {
            tl.add(() => {
                const bbox = rect.ownerSVGElement.parentNode.getBoundingClientRect();
                const perimeter = 2 * (bbox.width + bbox.height);
                gsap.fromTo(rect, 
                    { strokeDashoffset: perimeter, strokeDasharray: "6 4" },
                    { strokeDashoffset: 0, duration: 1.6, ease: "power2.out" }
                );
            }, "-=0.8");
        }
    });

    // 7. Custom Section Diagrams Animations (Pre-split trigger logic)
    
    // 7a. Survey Concentric Circles Animation
    const surveySvg = document.querySelector('.concentric-rings-svg');
    if (surveySvg) {
        const concentricLabel = document.querySelector('.concentric-center-label');
        const surveyTL = gsap.timeline({
            scrollTrigger: {
                trigger: surveySvg,
                start: "top 80%",
                once: true
            }
        });
        
        surveyTL.from('.concentric-rings-svg .ring', {
            transformOrigin: "center center",
            scale: 0,
            opacity: 0,
            duration: 1.6,
            stagger: 0.25,
            ease: "back.out(1.2)"
        })
        .to(concentricLabel, {
            opacity: 1,
            scale: 1,
            duration: 1.0,
            ease: anim.ease
        }, "-=0.4")
        .add(() => {
            if (!prefersReducedMotion) {
                gsap.to('.ring-3', {
                    rotation: 360,
                    transformOrigin: "center center",
                    duration: 30,
                    repeat: -1,
                    ease: "none"
                });
                gsap.to('.ring-4', {
                    scale: 1.05,
                    transformOrigin: "center center",
                    duration: 2.0,
                    yoyo: true,
                    repeat: -1,
                    ease: "power1.inOut"
                });
            }
        });
    }

    // 7b. Behavioral Habit Loop Sequential draw-on
    const loopSvg = document.querySelector('.behavioral-loop-svg');
    if (loopSvg) {
        gsap.set('.behavioral-loop-svg .loop-node', { scale: 0, opacity: 0 });
        gsap.set('.behavioral-loop-svg .loop-path', { strokeDasharray: 300, strokeDashoffset: 300 });

        const habitTL = gsap.timeline({
            scrollTrigger: {
                trigger: loopSvg,
                start: "top 80%",
                once: true
            }
        });

        habitTL.to('.node-1', { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.2)" })
               .to('.path-1', { strokeDashoffset: 0, duration: 0.9, ease: "sine.inOut" })
               .to('.node-2', { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.2)" })
               .to('.path-2', { strokeDashoffset: 0, duration: 0.9, ease: "sine.inOut" })
               .to('.node-3', { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.2)" })
               .to('.path-3', { strokeDashoffset: 0, duration: 0.9, ease: "sine.inOut" })
               .to('.node-4', { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.2)" })
               .to('.path-4', { strokeDashoffset: 0, duration: 0.9, ease: "sine.inOut" })
               .add(() => {
                   document.querySelectorAll('.loop-node').forEach(node => node.classList.add('active'));
                   const dot = document.querySelector('.loop-glowing-dot');
                   if (dot && !prefersReducedMotion) {
                       dot.style.display = "block";
                       const dotObj = { angle: -Math.PI / 2 };
                       gsap.to(dotObj, {
                           angle: 1.5 * Math.PI,
                           duration: 7.0,
                           repeat: -1,
                           ease: "none",
                           onUpdate: () => {
                               const x = 120 + 80 * Math.cos(dotObj.angle);
                               const y = 120 + 80 * Math.sin(dotObj.angle);
                               gsap.set(dot, { attr: { cx: x, cy: y } });
                           }
                       });
                   }
               });
    }

    // 7c. Floor plan blueprint sketch-line drawing (Line-by-line)
    const floorPlanSvg = document.querySelector('.floor-plan-svg');
    if (floorPlanSvg) {
        gsap.set('.floor-plan-svg .sketch-line', { strokeDasharray: 110, strokeDashoffset: 110 });
        gsap.set('.floor-plan-svg .clearance-rect', { strokeDasharray: 500, strokeDashoffset: 500 });
        
        const blueprintTL = gsap.timeline({
            scrollTrigger: {
                trigger: floorPlanSvg,
                start: "top 80%",
                once: true
            }
        });
        
        blueprintTL.to('.s-1', { strokeDashoffset: 0, duration: 0.7, ease: "sine.inOut" })
                   .to('.s-2', { strokeDashoffset: 0, duration: 0.7, ease: "sine.inOut" }, "-=0.2")
                   .to('.s-3', { strokeDashoffset: 0, duration: 0.7, ease: "sine.inOut" }, "-=0.2")
                   .to('.s-4', { strokeDashoffset: 0, duration: 0.7, ease: "sine.inOut" }, "-=0.2")
                   .to('.floor-plan-svg .clearance-rect', { strokeDashoffset: 0, duration: 1.2, ease: "power2.out" })
                   .to('.floor-plan-svg .machine-hatch', { opacity: 1, duration: 0.6 }, "<0.3")
                   .to('.floor-plan-svg .dim-line', { opacity: 1, duration: 0.8, stagger: 0.25 }, "-=0.3");
    }

    // 8. Portal Directory Grid Cards Reveal (3D Rotation flip-down)
    const dirGrid = document.querySelector('.directory-grid-13');
    if (dirGrid) {
        gsap.timeline({
            scrollTrigger: {
                trigger: dirGrid,
                start: "top 82%",
                once: true
            }
        })
        .fromTo(dirGrid, { opacity: 0, y: anim.ySmall }, { opacity: 1, y: 0, duration: 1.0 })
        .fromTo('.directory-card', 
            { rotationX: -15, transformOrigin: "top center", scale: 0.95, opacity: 0 },
            { rotationX: 0, scale: 1, opacity: 1, duration: 1.2, stagger: 0.12, ease: "power3.out" }
        , "-=0.6");
    }

    // 9. Stat Cards Count-up Numbers (Primary Ratio, Exchange Value, Carbon Offset)
    const metricRow = document.querySelector('.metric-row');
    if (metricRow) {
        const cards = gsap.utils.toArray('.metric-card');
        const metricTL = gsap.timeline({
            scrollTrigger: {
                trigger: metricRow,
                start: "top 82%",
                once: true
            }
        });

        metricTL.fromTo(metricRow, { opacity: 0, y: anim.ySmall }, { opacity: 1, y: 0, duration: 1.0 })
                .fromTo(cards, 
                    { rotationX: -15, transformOrigin: "top center", scale: 0.95, opacity: 0 },
                    { rotationX: 0, scale: 1, opacity: 1, duration: 1.4, stagger: 0.18, ease: "power3.out" }
                , "-=0.6");

        cards.forEach((card) => {
            const valEl = card.querySelector('.metric-val');
            const lblEl = card.querySelector('.metric-lbl');
            const descEl = card.querySelector('.metric-desc');

            metricTL.from(lblEl, { opacity: 0, y: -5, duration: 0.6 }, "<0.2");

            const text = valEl.innerText.trim();
            let num = 0;
            let prefix = "";
            let suffix = "";
            let decimals = 0;

            if (text.includes("Pts")) {
                num = parseInt(text.replace("Pts", ""));
                suffix = " Pts";
                valEl.innerText = "0 Pts";
            } else if (text.includes("Rs.")) {
                num = parseInt(text.replace("Rs.", ""));
                prefix = "Rs. ";
                valEl.innerText = "Rs. 0";
            } else if (text.includes("kg")) {
                num = parseFloat(text.replace("kg", ""));
                suffix = " kg";
                decimals = 2;
                valEl.innerText = "0.00 kg";
            }

            const counterObj = { val: 0 };
            metricTL.to(counterObj, {
                val: num,
                duration: 2.2, // Slower count-up
                ease: "power2.out",
                onUpdate: () => {
                    valEl.innerText = prefix + counterObj.val.toFixed(decimals) + suffix;
                }
            }, "<");

            metricTL.from(descEl, { opacity: 0, duration: 0.6 }, "<0.8");
        });
    }

    // 10. Data Tables Staggered Rows Reveal (3D index card layout)
    document.querySelectorAll('.strategy-table-wrapper').forEach(wrapper => {
        const table = wrapper.querySelector('.strategy-table');
        const header = table.querySelector('thead tr');
        const rows = table.querySelectorAll('tbody tr');
        
        const tableTL = gsap.timeline({
            scrollTrigger: {
                trigger: wrapper,
                start: "top 82%",
                once: true
            }
        });

        tableTL.fromTo(wrapper, { opacity: 0, y: anim.ySmall }, { opacity: 1, y: 0, duration: 1.0 });

        if (header) {
            tableTL.from(header, {
                opacity: 0,
                y: 8,
                duration: 0.7,
                ease: anim.ease
            }, "-=0.5");
        }

        if (rows.length > 0) {
            tableTL.fromTo(rows, 
                { opacity: 0, rotationX: -10, transformOrigin: "top center", x: -8 },
                { opacity: 1, rotationX: 0, x: 0, duration: 1.2, stagger: 0.15, ease: anim.ease }
            , "-=0.3");
        }
    });

    // 11. Shopper Journey Path & Tracer Animation
    const journeyFlow = document.querySelector('.journey-flow');
    if (journeyFlow) {
        const journeySteps = gsap.utils.toArray('.journey-step');

        // Set initial state of steps: circles and text muted
        gsap.set(journeySteps, { opacity: 0.25 });
        journeySteps.forEach(step => {
            const num = step.querySelector('.journey-step-num');
            if (num) gsap.set(num, { scale: 1 });
            const title = step.querySelector('h4');
            const desc = step.querySelector('p');
            if (title) gsap.set(title, { y: 10, opacity: 0 });
            if (desc) gsap.set(desc, { y: 10, opacity: 0 });
        });

        // We create a ScrollTrigger that runs the animation timeline
        const journeyTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: journeyFlow,
                start: "top 80%",
                once: true,
                onEnter: () => {
                    // Perform calculations on enter to get absolute coordinates after layouts settle
                    const flowRect = journeyFlow.getBoundingClientRect();
                    const stepPositions = journeySteps.map(step => {
                        const circle = step.querySelector('.journey-step-num');
                        const circleRect = circle.getBoundingClientRect();
                        const circleCenter = (circleRect.left + circleRect.width / 2) - flowRect.left;
                        return (circleCenter / flowRect.width) * 100;
                    });

                    const startPct = stepPositions[0];
                    const endPct = stepPositions[4];

                    // Position the background progress dashed line
                    gsap.set('.journey-progress-bg', { left: `${startPct}%`, width: `${endPct - startPct}%` });
                    // Set fill line initial position (collapsed at start circle center)
                    gsap.set('.journey-progress-fill', { left: `${startPct}%`, width: '0%' });
                    // Set dot initial position
                    gsap.set('.journey-progress-dot', { left: `${startPct}%` });

                    // Build the animation timeline dynamically
                    const segDur = 1.0; // Segment duration
                    const easeType = "power2.inOut";

                    // Step 1 active state
                    journeyTimeline.add(() => activateStep(0));

                    // Step 2
                    journeyTimeline
                        .to('.journey-progress-dot', { left: `${stepPositions[1]}%`, duration: segDur, ease: easeType })
                        .to('.journey-progress-fill', { width: `${stepPositions[1] - stepPositions[0]}%`, duration: segDur, ease: easeType }, '<')
                        .add(() => activateStep(1));

                    // Step 3
                    journeyTimeline
                        .to('.journey-progress-dot', { left: `${stepPositions[2]}%`, duration: segDur, ease: easeType })
                        .to('.journey-progress-fill', { width: `${stepPositions[2] - stepPositions[0]}%`, duration: segDur, ease: easeType }, '<')
                        .add(() => activateStep(2));

                    // Step 4
                    journeyTimeline
                        .to('.journey-progress-dot', { left: `${stepPositions[3]}%`, duration: segDur, ease: easeType })
                        .to('.journey-progress-fill', { width: `${stepPositions[3] - stepPositions[0]}%`, duration: segDur, ease: easeType }, '<')
                        .add(() => activateStep(3));

                    // Step 5
                    journeyTimeline
                        .to('.journey-progress-dot', { left: `${stepPositions[4]}%`, duration: segDur, ease: easeType })
                        .to('.journey-progress-fill', { width: `${stepPositions[4] - stepPositions[0]}%`, duration: segDur, ease: easeType }, '<')
                        .add(() => activateStep(4));
                }
            }
        });

        function activateStep(index) {
            const step = journeySteps[index];
            if (!step) return;

            // Highlight the step container
            gsap.to(step, { opacity: 1, duration: 0.4 });

            // Circle bounce animation
            const num = step.querySelector('.journey-step-num');
            if (num) {
                num.classList.add('active');
                gsap.fromTo(num, 
                    { scale: 1 }, 
                    { scale: 1.25, duration: 0.4, ease: "back.out(1.7)", onComplete: () => {
                        gsap.to(num, { scale: 1.08, duration: 0.2 });
                    }}
                );
            }

            // Animate step texts sliding up and fading in
            const title = step.querySelector('h4');
            const desc = step.querySelector('p');
            const stepTimeline = gsap.timeline();
            if (title) {
                stepTimeline.to(title, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" });
            }
            if (desc) {
                stepTimeline.to(desc, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }, "-=0.35");
            }
        }
    }

    // 12. Dot Navigation Clicks (Smooth Scroll Scroll-to Section)
    dotLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                lenis.scrollTo(targetEl, {
                    offset: 0,
                    duration: 0.8,
                    easing: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t // Premium ease-in-out curve
                });
            }
        });
    });

    // 13. Hero CTA Button click Smooth Scroll
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', (e) => {
            e.preventDefault();
            const targetEl = document.querySelector('#slide-overview');
            if (targetEl) {
                lenis.scrollTo(targetEl, {
                    offset: 0,
                    duration: 0.8
                });
            }
        });
    }

    // 14. Refresh ScrollTrigger after all setup has settled
        // 15. Shared Morph Modal Overlay logic
    const morphOverlay = document.getElementById('morph-overlay');
    const modalCloseBtn = document.querySelector('.morph-modal-close');
    const cardsWithMorph = document.querySelectorAll('[data-morph="card"]');

    if (morphOverlay && modalCloseBtn) {
        cardsWithMorph.forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                // Get data attributes
                const num = card.getAttribute('data-num');
                const title = card.getAttribute('data-title');
                const frameLabel = card.getAttribute('data-frame-label');
                const desc = card.getAttribute('data-desc');

                // Update modal elements
                morphOverlay.querySelector('.modal-num').innerText = num;
                morphOverlay.querySelector('.modal-title').innerText = title;
                morphOverlay.querySelector('.modal-desc').innerText = desc;

                // Clone and inject the SVG/visual content
                const placeholder = card.querySelector('.placeholder-frame');
                const modalPlaceholderBox = morphOverlay.querySelector('.modal-placeholder-box');
                
                // Clear only visual content (svg or img) but keep metadata like labels & crosshairs
                const prevVisual = modalPlaceholderBox.querySelector('svg, img');
                if (prevVisual) {
                    prevVisual.remove();
                }

                // Set the modal frame label
                const modalLabel = modalPlaceholderBox.querySelector('.modal-frame-label');
                if (modalLabel) {
                    modalLabel.innerText = `[ ${frameLabel} ]`;
                }
                
                modalPlaceholderBox.classList.remove('ratio-16-9', 'ratio-4-3', 'ratio-1-1');
                if (placeholder) {
                    if (placeholder.classList.contains('ratio-4-3')) {
                        modalPlaceholderBox.classList.add('ratio-4-3');
                    } else if (placeholder.classList.contains('ratio-1-1')) {
                        modalPlaceholderBox.classList.add('ratio-1-1');
                    } else {
                        modalPlaceholderBox.classList.add('ratio-16-9');
                    }

                    const visual = placeholder.querySelector('svg, img');
                    if (visual) {
                        const clonedVisual = visual.cloneNode(true);
                        clonedVisual.style.width = '100%';
                        clonedVisual.style.height = '100%';
                        clonedVisual.style.display = 'block';
                        clonedVisual.style.padding = '0';
                        modalPlaceholderBox.appendChild(clonedVisual);
                    }
                }

                // Animate modal opening
                morphOverlay.classList.add('active');
                morphOverlay.querySelector('.morph-modal-card').classList.add('expanded');
                
                gsap.fromTo('.morph-modal-card', 
                    { scale: 0.9, opacity: 0, y: 30 },
                    { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
                );
            });
        });

        // Click-to-enlarge for all other placeholder-frame elements (mockups and diagrams)
        const placeholderFrames = document.querySelectorAll('.placeholder-frame');
        placeholderFrames.forEach(frame => {
            // Skip if it's already inside a data-morph="card" element or is the modal box itself
            if (frame.closest('[data-morph="card"]') || frame.classList.contains('modal-placeholder-box')) {
                return;
            }

            // Make it clickable visually
            frame.style.cursor = 'zoom-in';

            frame.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                // Find parent slide-section to extract content context
                const section = frame.closest('.slide-section');
                let num = '0.0';
                let title = 'Visual Specification';
                let desc = 'Detailed diagram / visual template representation.';
                let frameLabel = 'Visual Frame';

                if (section) {
                    const numEl = section.querySelector('.section-num');
                    const titleEl = section.querySelector('h2.split-line, h2');
                    const descEl = section.querySelector('p'); // first paragraph

                    if (numEl) num = numEl.innerText.trim();
                    if (titleEl) title = titleEl.innerText.trim();
                    if (descEl) desc = descEl.innerText.trim();

                    // Determine default label
                    const rawLabel = frameLabels[section.id] || '[ Visual Frame ]';
                    frameLabel = rawLabel.replace(/[\[\]]/g, '').trim(); // Remove brackets if present
                }

                // Update modal text fields
                morphOverlay.querySelector('.modal-num').innerText = num;
                morphOverlay.querySelector('.modal-title').innerText = title;
                morphOverlay.querySelector('.modal-desc').innerText = desc;

                const modalPlaceholderBox = morphOverlay.querySelector('.modal-placeholder-box');
                
                // Clear only visual content (svg or img) but keep metadata like labels & crosshairs
                const prevVisual = modalPlaceholderBox.querySelector('svg, img');
                if (prevVisual) {
                    prevVisual.remove();
                }

                // Set the modal frame label
                const modalLabel = modalPlaceholderBox.querySelector('.modal-frame-label');
                if (modalLabel) {
                    modalLabel.innerText = `[ ${frameLabel} ]`;
                }

                // Find visual element (svg or img)
                modalPlaceholderBox.classList.remove('ratio-16-9', 'ratio-4-3', 'ratio-1-1');
                if (frame.classList.contains('ratio-4-3')) {
                    modalPlaceholderBox.classList.add('ratio-4-3');
                } else if (frame.classList.contains('ratio-1-1')) {
                    modalPlaceholderBox.classList.add('ratio-1-1');
                } else {
                    modalPlaceholderBox.classList.add('ratio-16-9');
                }

                const visual = frame.querySelector('svg, img');
                if (visual) {
                    const clonedVisual = visual.cloneNode(true);
                    clonedVisual.style.width = '100%';
                    clonedVisual.style.height = '100%';
                    clonedVisual.style.display = 'block';
                    clonedVisual.style.padding = '0';
                    modalPlaceholderBox.appendChild(clonedVisual);
                }

                // Animate modal opening
                morphOverlay.classList.add('active');
                morphOverlay.querySelector('.morph-modal-card').classList.add('expanded');
                gsap.fromTo('.morph-modal-card', 
                    { scale: 0.9, opacity: 0, y: 30 },
                    { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
                );
            });
        });

        const closeModal = () => {
            const card = morphOverlay.querySelector('.morph-modal-card');
            gsap.to(card, {
                scale: 0.9,
                opacity: 0,
                y: 30,
                duration: 0.3,
                ease: "power3.in",
                onComplete: () => {
                    morphOverlay.classList.remove('active');
                    card.classList.remove('expanded');
                }
            });
        };

        modalCloseBtn.addEventListener('click', closeModal);
        morphOverlay.querySelector('.morph-modal-bg').addEventListener('click', closeModal);
    }

    // 14. Horizontal Scroll Pinning & Middle Highlight
    const track = document.querySelector('.horizontal-track');
    const headerSticky = document.querySelector('.horizontal-header-sticky');
    if (track && headerSticky) {
        let isAnimatingCard = false;
        let currentCardIndex = 0;
        const cards = document.querySelectorAll('.horizontal-card');
        const mm = gsap.matchMedia();

        // Desktop: Pin & scrub, but NO snap in ScrollTrigger to prevent conflict with wheel hijacking
        mm.add("(min-width: 993px)", () => {
            gsap.to(track, {
                x: () => {
                    const totalMove = track.scrollWidth - window.innerWidth;
                    return -totalMove;
                },
                ease: 'none',
                scrollTrigger: {
                    id: 'applications-trigger',
                    trigger: '#slide-applications',
                    pin: true,
                    scrub: true,
                    start: 'top top',
                    end: () => `+=${track.scrollWidth - window.innerWidth + 800}`,
                    invalidateOnRefresh: true,
                    onUpdate: () => {
                        updateHighlightedCard();
                    },
                    onRefresh: () => {
                        updateHighlightedCard();
                    }
                }
            });
            updateHighlightedCard();
        });

        // Mobile/Tablet: Pin, scrub, AND snap in ScrollTrigger. No wheel hijack runs on mobile.
        mm.add("(max-width: 992px)", () => {
            gsap.to(track, {
                x: () => {
                    const totalMove = track.scrollWidth - window.innerWidth;
                    return -totalMove;
                },
                ease: 'none',
                scrollTrigger: {
                    id: 'applications-trigger',
                    trigger: '#slide-applications',
                    pin: true,
                    scrub: true,
                    snap: {
                        snapTo: 1 / (cards.length - 1),
                        duration: { min: 0.2, max: 0.4 },
                        delay: 0.05,
                        ease: "power1.inOut"
                    },
                    start: 'top top',
                    end: () => `+=${track.scrollWidth - window.innerWidth + 800}`,
                    invalidateOnRefresh: true,
                    onUpdate: () => {
                        updateHighlightedCard();
                    },
                    onRefresh: () => {
                        updateHighlightedCard();
                    }
                }
            });
            updateHighlightedCard();
        });

        function updateHighlightedCard() {
            const viewportCenter = window.innerWidth / 2;
            
            let closestCard = null;
            let minDistance = Infinity;
            let closestIdx = 0;
            
            cards.forEach((card, idx) => {
                const rect = card.getBoundingClientRect();
                const cardCenter = rect.left + rect.width / 2;
                const distance = Math.abs(cardCenter - viewportCenter);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    closestCard = card;
                    closestIdx = idx;
                }
            });
            
            cards.forEach((card, idx) => {
                if (idx === closestIdx) {
                    card.classList.add('highlighted');
                } else {
                    card.classList.remove('highlighted');
                }
            });

            if (!isAnimatingCard) {
                currentCardIndex = closestIdx;
            }
        }

        // Card-by-Card Wheel Scroll Hijack for Desktop (Attached to window for absolute robustness)
        window.addEventListener('wheel', (e) => {
            if (window.innerWidth <= 992) return; // Only hijack on desktop

            const st = ScrollTrigger.getById('applications-trigger');
            if (!st) return;

            const scrollY = window.scrollY;
            // Active if inside the trigger range, with a 10px buffer at the boundaries
            const isActive = scrollY >= (st.start - 10) && scrollY <= (st.end + 10);
            if (!isActive) return;

            // If we are currently animating, we MUST intercept and block the scroll event
            if (isAnimatingCard) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }

            if (e.deltaY > 0) {
                // Scroll down: move to next card
                if (currentCardIndex < cards.length - 1) {
                    e.preventDefault();
                    e.stopPropagation();
                    isAnimatingCard = true;
                    currentCardIndex++;
                    const targetScroll = st.start + (currentCardIndex / (cards.length - 1)) * (st.end - st.start);
                    
                    // Fail-safe to unlock scrolling after 750ms under any circumstances
                    const unlockTimeout = setTimeout(() => {
                        isAnimatingCard = false;
                    }, 750);

                    lenis.scrollTo(targetScroll, {
                        duration: 0.35,
                        force: true,
                        onComplete: () => {
                            // Devour remaining trackpad inertia before unlocking
                            setTimeout(() => {
                                clearTimeout(unlockTimeout);
                                isAnimatingCard = false;
                            }, 250);
                        }
                    });
                }
                // If we are at the last card, we don't call preventDefault, allowing the user to scroll out
            } else if (e.deltaY < 0) {
                // Scroll up: move to previous card
                if (currentCardIndex > 0) {
                    e.preventDefault();
                    e.stopPropagation();
                    isAnimatingCard = true;
                    currentCardIndex--;
                    const targetScroll = st.start + (currentCardIndex / (cards.length - 1)) * (st.end - st.start);
                    
                    // Fail-safe to unlock scrolling after 750ms under any circumstances
                    const unlockTimeout = setTimeout(() => {
                        isAnimatingCard = false;
                    }, 750);

                    lenis.scrollTo(targetScroll, {
                        duration: 0.35,
                        force: true,
                        onComplete: () => {
                            // Devour remaining trackpad inertia before unlocking
                            setTimeout(() => {
                                clearTimeout(unlockTimeout);
                                isAnimatingCard = false;
                            }, 250);
                        }
                    });
                }
                // If we are at the first card, we don't call preventDefault, allowing the user to scroll out
            }
        }, { passive: false });
    }

    // 15. Window resize handler to maintain frame positioning
    window.addEventListener('resize', () => {
        const activeDot = document.querySelector('.dot-link.active');
        if (activeDot) {
            const targetId = activeDot.getAttribute('href');
            const activeSlide = document.querySelector(targetId);
            if (activeSlide) {
                updateSharedElements(activeSlide, true);
            }
        }
    });

    ScrollTrigger.refresh();

});
