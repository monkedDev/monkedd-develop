/**
 * monkedDev — Профессиональный JavaScript
 * Полный набор функций: анимации, формы, модальные окна, валидация и更多
 */

(function() {
    'use strict';

    // ========================================
    // Глобальные константы и утилиты
    // ========================================

    const SELECTORS = {
        preloader: '#preloader',
        cursorFollower: '#cursorFollower',
        scrollProgress: '#scrollProgress',
        backToTop: '#backToTop',
        header: '#header',
        burger: '.burger',
        mobileMenuOverlay: '#mobileMenuOverlay',
        themeToggle: '#themeToggle',
        orderForm: '#orderForm',
        formStatus: '#formStatus',
        toastContainer: '#toastContainer',
        portfolioModal: '#portfolioModal',
        portfolioModalBody: '#portfolioModalBody',
        reviewsTrack: '#reviewsTrack',
        reviewsDots: '#reviewsDots',
        heroScrollIndicator: '#heroScrollIndicator',
        heroParticles: '#heroParticles'
    };

    const CLASS_NAMES = {
        hidden: 'hidden',
        active: 'active',
        visible: 'visible',
        scrolled: 'scrolled',
        loading: 'loading'
    };

    const ANIMATION_DURATION = {
        fast: 150,
        base: 300,
        slow: 500
    };

    // Утилита для debounce
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Утилита для throttle
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // ========================================
    // Preloader
    // ========================================

    class Preloader {
        constructor() {
            this.element = document.querySelector(SELECTORS.preloader);
            this.init();
        }

        init() {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    this.hide();
                }, 500);
            });
        }

        hide() {
            if (this.element) {
                this.element.classList.add('hidden');
                setTimeout(() => {
                    this.element.style.display = 'none';
                }, ANIMATION_DURATION.slow);
            }
        }
    }

    // ========================================
    // Custom Cursor
    // ========================================

    class CustomCursor {
        constructor() {
            this.element = document.querySelector(SELECTORS.cursorFollower);
            if (!this.element) return;
            
            this.pos = { x: 0, y: 0 };
            this.mouse = { x: 0, y: 0 };
            this.speed = 0.15;
            
            this.init();
        }

        init() {
            document.addEventListener('mousemove', (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            });

            // Увеличение курсора при наведении на интерактивные элементы
            const interactiveElements = document.querySelectorAll('a, button, input, textarea, select');
            interactiveElements.forEach(el => {
                el.addEventListener('mouseenter', () => this.element.classList.add('active'));
                el.addEventListener('mouseleave', () => this.element.classList.remove('active'));
            });

            this.animate();
        }

        animate() {
            this.pos.x += (this.mouse.x - this.pos.x) * this.speed;
            this.pos.y += (this.mouse.y - this.pos.y) * this.speed;

            this.element.style.left = this.pos.x + 'px';
            this.element.style.top = this.pos.y + 'px';

            requestAnimationFrame(() => this.animate());
        }
    }

    // ========================================
    // Scroll Progress
    // ========================================

    class ScrollProgress {
        constructor() {
            this.element = document.querySelector(SELECTORS.scrollProgress);
            if (!this.element) return;
            
            this.init();
        }

        init() {
            window.addEventListener('scroll', () => {
                const scrollTop = window.scrollY;
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                const scrollPercent = (scrollTop / docHeight) * 100;
                this.element.style.width = scrollPercent + '%';
            });
        }
    }

    // ========================================
    // Back to Top Button
    // ========================================

    class BackToTop {
        constructor() {
            this.element = document.querySelector(SELECTORS.backToTop);
            if (!this.element) return;
            
            this.threshold = 500;
            this.init();
        }

        init() {
            window.addEventListener('scroll', () => {
                if (window.scrollY > this.threshold) {
                    this.element.classList.add('visible');
                } else {
                    this.element.classList.remove('visible');
                }
            });

            this.element.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }

    // ========================================
    // Header & Navigation
    // ========================================

    class Header {
        constructor() {
            this.element = document.querySelector(SELECTORS.header);
            this.burger = document.querySelector(SELECTORS.burger);
            this.nav = document.querySelector('.header__nav');
            this.overlay = document.querySelector(SELECTORS.mobileMenuOverlay);
            this.links = document.querySelectorAll('.header__link');
            
            this.init();
        }

        init() {
            // Scroll effect
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    this.element.classList.add('scrolled');
                } else {
                    this.element.classList.remove('scrolled');
                }
            });

            // Mobile menu
            if (this.burger) {
                this.burger.addEventListener('click', () => this.toggleMobileMenu());
            }

            if (this.overlay) {
                this.overlay.addEventListener('click', () => this.closeMobileMenu());
            }

            // Close menu on link click
            this.links.forEach(link => {
                link.addEventListener('click', () => this.closeMobileMenu());
            });

            // Active link on scroll
            this.initActiveLink();
        }

        toggleMobileMenu() {
            this.burger.classList.toggle('active');
            this.nav.classList.toggle('active');
            this.overlay.classList.toggle('active');
            document.body.style.overflow = this.nav.classList.contains('active') ? 'hidden' : '';
        }

        closeMobileMenu() {
            this.burger.classList.remove('active');
            this.nav.classList.remove('active');
            this.overlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        initActiveLink() {
            const sections = document.querySelectorAll('section[id]');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute('id');
                        this.links.forEach(link => {
                            link.classList.remove('active');
                            if (link.getAttribute('href') === `#${id}`) {
                                link.classList.add('active');
                            }
                        });
                    }
                });
            }, { threshold: 0.3 });

            sections.forEach(section => observer.observe(section));
        }
    }

    // ========================================
    // Theme Toggle
    // ========================================

    class ThemeToggle {
        constructor() {
            this.element = document.querySelector(SELECTORS.themeToggle);
            if (!this.element) return;
            
            this.init();
        }

        init() {
            // Load saved theme
            const savedTheme = localStorage.getItem('theme') || 'light';
            this.setTheme(savedTheme);

            this.element.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                this.setTheme(newTheme);
            });
        }

        setTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        }
    }

    // ========================================
    // Smooth Scroll
    // ========================================

    class SmoothScroll {
        constructor() {
            this.init();
        }

        init() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    const href = anchor.getAttribute('href');
                    if (href !== '#' && href.length > 1) {
                        e.preventDefault();
                        const target = document.querySelector(href);
                        if (target) {
                            const headerHeight = document.querySelector('.header').offsetHeight;
                            const targetPosition = target.offsetTop - headerHeight;

                            window.scrollTo({
                                top: targetPosition,
                                behavior: 'smooth'
                            });
                        }
                    }
                });
            });
        }
    }

    // ========================================
    // Scroll Animations
    // ========================================

    class ScrollAnimations {
        constructor() {
            this.elements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .scale-in');
            this.init();
        }

        init() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            this.elements.forEach(el => {
                el.classList.add('fade-in');
                observer.observe(el);
            });
        }
    }

    // ========================================
    // Counter Animation
    // ========================================

    class CounterAnimation {
        constructor() {
            this.counters = document.querySelectorAll('.stat__value, .stat-card__number');
            this.init();
        }

        init() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateCounter(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            this.counters.forEach(counter => observer.observe(counter));
        }

        animateCounter(element) {
            const target = parseInt(element.getAttribute('data-count'));
            if (!target) return;

            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;

            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    element.textContent = target + '+';
                    clearInterval(timer);
                } else {
                    element.textContent = Math.floor(current);
                }
            }, 16);
        }
    }

    // ========================================
    // Skill Bars Animation
    // ========================================

    class SkillBars {
        constructor() {
            this.bars = document.querySelectorAll('.skill-item__progress');
            this.init();
        }

        init() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const progress = entry.target.getAttribute('data-progress');
                        entry.target.style.width = progress + '%';
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            this.bars.forEach(bar => observer.observe(bar));
        }
    }

    // ========================================
    // Services Tabs
    // ========================================

    class ServicesTabs {
        constructor() {
            this.tabs = document.querySelectorAll('.services__tab');
            this.cards = document.querySelectorAll('.service-card');
            this.init();
        }

        init() {
            this.tabs.forEach(tab => {
                tab.addEventListener('click', () => this.filterServices(tab));
            });
        }

        filterServices(tab) {
            // Update active tab
            this.tabs.forEach(t => t.classList.remove('services__tab--active'));
            tab.classList.add('services__tab--active');

            const category = tab.getAttribute('data-tab');

            // Filter cards
            this.cards.forEach(card => {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.classList.remove('hidden');
                    setTimeout(() => card.style.display = '', 300);
                } else {
                    card.classList.add('hidden');
                    setTimeout(() => card.style.display = 'none', 300);
                }
            });
        }
    }

    // ========================================
    // Portfolio Filter
    // ========================================

    class PortfolioFilter {
        constructor() {
            this.buttons = document.querySelectorAll('.portfolio__filter-btn');
            this.cards = document.querySelectorAll('.portfolio-card');
            this.init();
        }

        init() {
            this.buttons.forEach(btn => {
                btn.addEventListener('click', () => this.filterPortfolio(btn));
            });
        }

        filterPortfolio(button) {
            // Update active button
            this.buttons.forEach(b => b.classList.remove('portfolio__filter-btn--active'));
            button.classList.add('portfolio__filter-btn--active');

            const filter = button.getAttribute('data-filter');

            // Filter cards with animation
            this.cards.forEach((card, index) => {
                const category = card.getAttribute('data-category');
                
                setTimeout(() => {
                    if (filter === 'all' || category === filter) {
                        card.classList.remove('hidden');
                        card.style.display = '';
                    } else {
                        card.classList.add('hidden');
                        card.style.display = 'none';
                    }
                }, index * 50);
            });
        }
    }

    // ========================================
    // Reviews Slider
    // ========================================

    class ReviewsSlider {
        constructor() {
            this.track = document.querySelector(SELECTORS.reviewsTrack);
            this.dotsContainer = document.querySelector(SELECTORS.reviewsDots);
            if (!this.track) return;
            
            this.cards = this.track.querySelectorAll('.review-card');
            this.currentIndex = 0;
            this.init();
        }

        init() {
            // Create dots
            this.cards.forEach((_, index) => {
                const dot = document.createElement('button');
                dot.classList.add('reviews__dot');
                if (index === 0) dot.classList.add('active');
                dot.addEventListener('click', () => this.goToSlide(index));
                this.dotsContainer.appendChild(dot);
            });

            this.dots = this.dotsContainer.querySelectorAll('.reviews__dot');

            // Add prev/next buttons functionality
            const prevBtn = document.querySelector('.slider__btn--prev');
            const nextBtn = document.querySelector('.slider__btn--next');

            if (prevBtn) prevBtn.addEventListener('click', () => this.prev());
            if (nextBtn) nextBtn.addEventListener('click', () => this.next());

            // Auto scroll
            this.autoScroll = setInterval(() => this.next(), 5000);

            // Pause on hover
            this.track.addEventListener('mouseenter', () => clearInterval(this.autoScroll));
            this.track.addEventListener('mouseleave', () => {
                this.autoScroll = setInterval(() => this.next(), 5000);
            });
        }

        goToSlide(index) {
            const cardWidth = this.cards[0].offsetWidth + 30; // 30px gap
            this.track.scrollTo({
                left: index * cardWidth,
                behavior: 'smooth'
            });
            this.updateDots(index);
        }

        next() {
            this.currentIndex = (this.currentIndex + 1) % this.cards.length;
            this.goToSlide(this.currentIndex);
        }

        prev() {
            this.currentIndex = (this.currentIndex - 1 + this.cards.length) % this.cards.length;
            this.goToSlide(this.currentIndex);
        }

        updateDots(index) {
            this.dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        }
    }

    // ========================================
    // FAQ Accordion
    // ========================================

    class FAQAccordion {
        constructor() {
            this.items = document.querySelectorAll('.faq-item');
            this.init();
        }

        init() {
            this.items.forEach(item => {
                const header = item.querySelector('.faq-item__header');
                header.addEventListener('click', () => this.toggle(item));
            });

            // Open first item by default
            if (this.items.length > 0) {
                this.items[0].classList.add('active');
            }
        }

        toggle(item) {
            const isActive = item.classList.contains('active');
            
            // Close all
            this.items.forEach(i => i.classList.remove('active'));

            // Open clicked if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        }
    }

    // ========================================
    // Form Handling
    // ========================================

    class FormHandler {
        constructor() {
            this.form = document.querySelector(SELECTORS.orderForm);
            this.statusElement = document.querySelector(SELECTORS.formStatus);
            if (!this.form) return;
            
            this.init();
        }

        init() {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
            this.initValidation();
            this.initRealTimeValidation();
        }

        async handleSubmit(e) {
            e.preventDefault();

            // Validate form
            if (!this.validateForm()) {
                this.showToast('Пожалуйста, заполните все обязательные поля', 'error');
                return;
            }

            // Check privacy checkbox
            const privacyCheckbox = document.getElementById('privacy');
            if (!privacyCheckbox || !privacyCheckbox.checked) {
                this.showToast('Необходимо согласие на обработку данных', 'error');
                return;
            }

            const submitBtn = this.form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            // Disable button
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="btn__loader"></span> Отправка...';

            try {
                const formData = new FormData(this.form);

                const response = await fetch(this.form.action, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success || response.ok) {
                    this.showStatus('Спасибо! Ваша заявка отправлена. Я свяжусь с вами в ближайшее время.', 'success');
                    this.form.reset();
                    this.showToast('Заявка успешно отправлена!', 'success');
                } else {
                    throw new Error(result.message || 'Ошибка отправки');
                }
            } catch (error) {
                this.showStatus('Ошибка отправки. Попробуйте позже или свяжитесь напрямую.', 'error');
                this.showToast('Ошибка отправки формы', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        }

        validateForm() {
            const requiredFields = this.form.querySelectorAll('[required]');
            let isValid = true;

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.style.borderColor = 'var(--color-error)';
                    isValid = false;
                } else {
                    field.style.borderColor = '';
                }
            });

            return isValid;
        }

        initValidation() {
            const inputs = this.form.querySelectorAll('.form-input[required]');
            
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    if (!input.value.trim()) {
                        input.style.borderColor = 'var(--color-error)';
                    } else {
                        input.style.borderColor = '';
                    }
                });
            });
        }

        initRealTimeValidation() {
            const inputs = this.form.querySelectorAll('.form-input');
            
            inputs.forEach(input => {
                input.addEventListener('input', () => {
                    input.style.borderColor = '';
                });
            });

            // Email validation
            const contactInput = document.getElementById('contact');
            if (contactInput) {
                contactInput.addEventListener('blur', () => {
                    const value = contactInput.value.trim();
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
                    
                    // Accept email, phone, or Telegram username
                    if (value && !emailRegex.test(value) && !phoneRegex.test(value) && !value.startsWith('@')) {
                        contactInput.style.borderColor = 'var(--color-warning)';
                    }
                });
            }
        }

        showStatus(message, type) {
            if (this.statusElement) {
                this.statusElement.textContent = message;
                this.statusElement.className = `form-status ${type}`;
                this.statusElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }

        showToast(message, type = 'info') {
            const toast = document.createElement('div');
            toast.className = `toast toast--${type}`;
            
            const icons = {
                success: '✓',
                error: '✕',
                warning: '⚠',
                info: 'ℹ'
            };

            toast.innerHTML = `
                <span class="toast__icon">${icons[type]}</span>
                <div class="toast__content">
                    <div class="toast__title">${type === 'success' ? 'Успешно' : type === 'error' ? 'Ошибка' : 'Информация'}</div>
                    <div class="toast__message">${message}</div>
                </div>
            `;

            const container = document.querySelector(SELECTORS.toastContainer);
            if (container) {
                container.appendChild(toast);

                setTimeout(() => {
                    toast.classList.add('hiding');
                    setTimeout(() => toast.remove(), ANIMATION_DURATION.slow);
                }, 5000);
            }
        }
    }

    // ========================================
    // Modal
    // ========================================

    class Modal {
        constructor() {
            this.modal = document.querySelector(SELECTORS.portfolioModal);
            this.body = document.querySelector(SELECTORS.portfolioModalBody);
            if (!this.modal) return;
            
            this.init();
        }

        init() {
            // Close button
            const closeBtn = this.modal.querySelector('.modal__close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.close());
            }

            // Close on overlay click
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal.querySelector('.modal__overlay')) {
                    this.close();
                }
            });

            // Close on ESC
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                    this.close();
                }
            });

            // Portfolio preview buttons
            document.querySelectorAll('.portfolio-card__preview').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openPortfolioPreview(btn.closest('.portfolio-card'));
                });
            });
        }

        openPortfolioPreview(card) {
            const title = card.querySelector('.portfolio-card__title')?.textContent || '';
            const desc = card.querySelector('.portfolio-card__desc')?.textContent || '';
            const tags = card.querySelector('.portfolio-card__tags')?.innerHTML || '';
            const meta = card.querySelector('.portfolio-card__meta')?.innerHTML || '';
            const placeholder = card.querySelector('.portfolio-placeholder')?.innerHTML || '';

            this.body.innerHTML = `
                <div class="portfolio-preview">
                    <div class="portfolio-preview__image">
                        <div class="portfolio-placeholder">${placeholder}</div>
                    </div>
                    <div class="portfolio-preview__content">
                        <div class="portfolio-preview__tags">${tags}</div>
                        <h3 class="portfolio-preview__title">${title}</h3>
                        <p class="portfolio-preview__desc">${desc}</p>
                        <div class="portfolio-preview__meta">${meta}</div>
                        <div class="portfolio-preview__actions">
                            <a href="#order" class="btn btn--primary">Заказать похожий</a>
                        </div>
                    </div>
                </div>
            `;

            this.open();
        }

        open() {
            this.modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        close() {
            this.modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // ========================================
    // Hero Particles
    // ========================================

    class HeroParticles {
        constructor() {
            this.container = document.querySelector(SELECTORS.heroParticles);
            if (!this.container) return;
            
            this.init();
        }

        init() {
            const particleCount = 20;

            for (let i = 0; i < particleCount; i++) {
                this.createParticle(i);
            }
        }

        createParticle(index) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random position and animation
            const left = Math.random() * 100;
            const delay = Math.random() * 20;
            const duration = 15 + Math.random() * 20;
            const size = 4 + Math.random() * 8;

            particle.style.left = left + '%';
            particle.style.bottom = '-20px';
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.animationDelay = delay + 's';
            particle.style.animationDuration = duration + 's';

            this.container.appendChild(particle);
        }
    }

    // ========================================
    // Hide Scroll Indicator on Scroll
    // ========================================

    class ScrollIndicator {
        constructor() {
            this.element = document.querySelector(SELECTORS.heroScrollIndicator);
            if (!this.element) return;
            
            this.init();
        }

        init() {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 200) {
                    this.element.style.opacity = '0';
                } else {
                    this.element.style.opacity = '1';
                }
            });
        }
    }

    // ========================================
    // Ripple Effect on Buttons
    // ========================================

    class RippleEffect {
        constructor() {
            this.init();
        }

        init() {
            document.querySelectorAll('.btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const rect = btn.getBoundingClientRect();
                    const ripple = document.createElement('span');
                    ripple.className = 'btn__ripple';
                    
                    const size = Math.max(rect.width, rect.height);
                    ripple.style.width = ripple.style.height = size + 'px';
                    ripple.style.left = e.clientX - rect.left - size / 2 + 'px';
                    ripple.style.top = e.clientY - rect.top - size / 2 + 'px';
                    
                    btn.appendChild(ripple);
                    
                    setTimeout(() => ripple.remove(), ANIMATION_DURATION.slow);
                });
            });
        }
    }

    // ========================================
    // Lazy Loading Images
    // ========================================

    class LazyLoad {
        constructor() {
            this.images = document.querySelectorAll('img[data-src]');
            this.init();
        }

        init() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            this.images.forEach(img => observer.observe(img));
        }

        loadImage(img) {
            const src = img.getAttribute('data-src');
            if (src) {
                img.src = src;
                img.removeAttribute('data-src');
            }
        }
    }

    // ========================================
    // Typing Animation
    // ========================================

    class TypingAnimation {
        constructor() {
            this.element = document.querySelector('.typing-text');
            if (!this.element) return;
            
            this.phrases = [
                '💻 Лендинги от 8 000 ₽',
                '🛒 Интернет-магазины от 25 000 ₽',
                '📱 Telegram-боты от 5 000 ₽',
                '🎨 Уникальный дизайн',
                '🚀 Быстрая загрузка',
                '📈 SEO-оптимизация'
            ];
            this.phraseIndex = 0;
            this.charIndex = 0;
            this.isDeleting = false;
            this.typingSpeed = 100;
            this.deletingSpeed = 50;
            this.pauseTime = 2000;
            
            this.init();
        }

        init() {
            this.type();
        }

        type() {
            const currentPhrase = this.phrases[this.phraseIndex];
            
            if (this.isDeleting) {
                this.element.textContent = currentPhrase.substring(0, this.charIndex - 1);
                this.charIndex--;
                this.typingSpeed = this.deletingSpeed;
            } else {
                this.element.textContent = currentPhrase.substring(0, this.charIndex + 1);
                this.charIndex++;
                this.typingSpeed = 100;
            }

            if (!this.isDeleting && this.charIndex === currentPhrase.length) {
                this.typingSpeed = this.pauseTime;
                this.isDeleting = true;
            } else if (this.isDeleting && this.charIndex === 0) {
                this.isDeleting = false;
                this.phraseIndex = (this.phraseIndex + 1) % this.phrases.length;
                this.typingSpeed = 500;
            }

            setTimeout(() => this.type(), this.typingSpeed);
        }
    }

    // ========================================
    // Countdown Timer
    // ========================================

    class CountdownTimer {
        constructor() {
            this.countdown = document.getElementById('countdown');
            if (!this.countdown) return;
            
            this.daysEl = document.getElementById('days');
            this.hoursEl = document.getElementById('hours');
            this.minutesEl = document.getElementById('minutes');
            this.secondsEl = document.getElementById('seconds');
            
            // Set end date to end of current month
            const now = new Date();
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            this.endDate = endOfMonth.getTime();
            
            this.init();
        }

        init() {
            this.updateCountdown();
            setInterval(() => this.updateCountdown(), 1000);
        }

        updateCountdown() {
            const now = new Date().getTime();
            const distance = this.endDate - now;

            if (distance < 0) {
                // Reset to next month if expired
                const now = new Date();
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
                this.endDate = endOfMonth.getTime();
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            this.daysEl.textContent = String(days).padStart(2, '0');
            this.hoursEl.textContent = String(hours).padStart(2, '0');
            this.minutesEl.textContent = String(minutes).padStart(2, '0');
            this.secondsEl.textContent = String(seconds).padStart(2, '0');
        }
    }

    // ========================================
    // Parallax Effect
    // ========================================

    class ParallaxEffect {
        constructor() {
            this.shapes = document.querySelectorAll('.shape-3d');
            this.floatingCards = document.querySelectorAll('.hero__floating-card');
            this.init();
        }

        init() {
            window.addEventListener('scroll', () => this.handleScroll());
            document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        }

        handleScroll() {
            const scrolled = window.scrollY;
            
            this.shapes.forEach((shape, index) => {
                const speed = 0.1 + (index * 0.05);
                shape.style.transform = `translateY(${scrolled * speed}px)`;
            });
        }

        handleMouseMove(e) {
            const mouseX = e.clientX / window.innerWidth - 0.5;
            const mouseY = e.clientY / window.innerHeight - 0.5;

            this.floatingCards.forEach((card, index) => {
                const speed = (index + 1) * 10;
                card.style.transform = `translate(${mouseX * speed}px, ${mouseY * speed}px)`;
            });
        }
    }

    // ========================================
    // Reveal on Scroll
    // ========================================

    class RevealOnScroll {
        constructor() {
            this.elements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
            this.init();
        }

        init() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -100px 0px'
            });

            this.elements.forEach(el => observer.observe(el));
        }
    }

    // ========================================
    // Stagger Animation
    // ========================================

    class StaggerAnimation {
        constructor() {
            this.init();
        }

        init() {
            const staggerContainers = document.querySelectorAll('.services__grid, .portfolio__grid, .benefits__grid');
            
            staggerContainers.forEach(container => {
                const items = container.children;
                Array.from(items).forEach((item, index) => {
                    item.classList.add('stagger-item');
                    item.style.transitionDelay = `${index * 100}ms`;
                });
            });

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const items = entry.target.children;
                        Array.from(items).forEach(item => {
                            item.classList.add('visible');
                        });
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            staggerContainers.forEach(container => observer.observe(container));
        }
    }

    // ========================================
    // Magnetic Buttons
    // ========================================

    class MagneticButtons {
        constructor() {
            this.buttons = document.querySelectorAll('.btn--primary, .magnetic-btn');
            this.init();
        }

        init() {
            this.buttons.forEach(btn => {
                btn.addEventListener('mousemove', (e) => this.handleMouseMove(e, btn));
                btn.addEventListener('mouseleave', (e) => this.handleMouseLeave(e, btn));
            });
        }

        handleMouseMove(e, btn) {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        }

        handleMouseLeave(e, btn) {
            btn.style.transform = 'translate(0, 0)';
        }
    }

    // ========================================
    // Console Message
    // ========================================

    class ConsoleMessage {
        constructor() {
            this.init();
        }

        init() {
            console.log('%c🚀 monkedDev Site', 'font-size: 24px; font-weight: bold; color: #7B8FD4;');
            console.log('%cСайт успешно загружен и готов к работе!', 'font-size: 14px; color: #6B6B75;');
            console.log('%cРазработано с ❤️ monkedDev', 'font-size: 12px; color: #9A9AA5;');
        }
    }

    // ========================================
    // Initialize All Modules
    // ========================================

    class App {
        constructor() {
            this.modules = [];
        }

        use(module) {
            this.modules.push(module);
            return this;
        }

        init() {
            document.addEventListener('DOMContentLoaded', () => {
                this.modules.forEach(Module => {
                    try {
                        new Module();
                    } catch (error) {
                        console.error(`Error initializing ${Module.name}:`, error);
                    }
                });
            });
        }
    }

    // Create and initialize app
    const app = new App();
    
    app.use(Preloader)
       .use(CustomCursor)
       .use(ScrollProgress)
       .use(BackToTop)
       .use(Header)
       .use(ThemeToggle)
       .use(SmoothScroll)
       .use(ScrollAnimations)
       .use(CounterAnimation)
       .use(SkillBars)
       .use(ServicesTabs)
       .use(PortfolioFilter)
       .use(ReviewsSlider)
       .use(FAQAccordion)
       .use(FormHandler)
       .use(Modal)
       .use(HeroParticles)
       .use(ScrollIndicator)
       .use(RippleEffect)
       .use(LazyLoad)
       .use(TypingAnimation)
       .use(CountdownTimer)
       .use(ParallaxEffect)
       .use(RevealOnScroll)
       .use(StaggerAnimation)
       .use(MagneticButtons)
       .use(ConsoleMessage);

    app.init();

})();
