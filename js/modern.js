// Modern Jekyll Blog JavaScript

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        THEME_KEY: 'blog-theme',
        AUTH_TOKEN_KEY: 'auth-token',
        USER_DATA_KEY: 'user-data',
        API_BASE_URL: '/api', // This would be your authentication microservice
        SAML_LOGIN_URL: '/auth/saml/login',
        SEARCH_DEBOUNCE: 300,
        SCROLL_THRESHOLD: 100
    };
    
    // Utility functions
    const utils = {
        // Debounce function
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        
        // Get element safely
        $(selector) {
            return document.querySelector(selector);
        },
        
        // Get elements safely
        $$(selector) {
            return document.querySelectorAll(selector);
        },
        
        // Add event listener safely
        on(element, event, handler) {
            if (element) {
                element.addEventListener(event, handler);
            }
        },
        
        // Remove class from all elements
        removeClass(elements, className) {
            elements.forEach(el => el.classList.remove(className));
        },
        
        // Add class to element
        addClass(element, className) {
            if (element) {
                element.classList.add(className);
            }
        },
        
        // Toggle class on element
        toggleClass(element, className) {
            if (element) {
                element.classList.toggle(className);
            }
        },
        
        // Check if element has class
        hasClass(element, className) {
            return element && element.classList.contains(className);
        },
        
        // Local storage helpers
        storage: {
            get(key) {
                try {
                    return JSON.parse(localStorage.getItem(key));
                } catch (e) {
                    return localStorage.getItem(key);
                }
            },
            
            set(key, value) {
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                } catch (e) {
                    localStorage.setItem(key, value);
                }
            },
            
            remove(key) {
                localStorage.removeItem(key);
            }
        },
        
        // API helpers
        async api(url, options = {}) {
            const defaultOptions = {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': utils.$('meta[name="csrf-token"]')?.content || ''
                }
            };
            
            const token = utils.storage.get(CONFIG.AUTH_TOKEN_KEY);
            if (token) {
                defaultOptions.headers['Authorization'] = `Bearer ${token}`;
            }
            
            try {
                const response = await fetch(url, {
                    ...defaultOptions,
                    ...options,
                    headers: {
                        ...defaultOptions.headers,
                        ...options.headers
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                return await response.json();
            } catch (error) {
                console.error('API Error:', error);
                throw error;
            }
        }
    };
    
    // Theme Manager
    const themeManager = {
        init() {
            this.loadTheme();
            this.bindEvents();
            console.log('Theme manager initialized'); // 添加调试日志
        },
        
        loadTheme() {
            const savedTheme = localStorage.getItem('blog-theme') || 'light';
            this.setTheme(savedTheme);
        },
        
        setTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('blog-theme', theme);
            this.updateThemeIcon(theme);
        },
        
        toggleTheme() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            console.log('Toggling theme to:', newTheme); // 添加调试日志
            this.setTheme(newTheme);
        },
        
        updateThemeIcon(theme) {
            const sunIcon = utils.$('.sun-icon');
            const moonIcon = utils.$('.moon-icon');
            
            if (theme === 'dark') {
                utils.addClass(sunIcon, 'hidden');
                utils.removeClass([moonIcon], 'hidden');
            } else {
                utils.addClass(moonIcon, 'hidden');
                utils.removeClass([sunIcon], 'hidden');
            }
        },
        
        // 确保绑定事件正确
        bindEvents() {
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) {
                themeToggle.addEventListener('click', () => {
                    console.log('Theme toggle clicked'); // 添加调试日志
                    this.toggleTheme();
                });
            } else {
                console.error('Theme toggle button not found'); // 添加错误日志
            }
        }
    };
    
    // Navigation Manager
    const navigationManager = {
        init() {
            this.bindEvents();
            this.handleScroll();
        },
        
        bindEvents() {
            // Mobile menu toggle
            utils.on(utils.$('#mobile-menu-toggle'), 'click', () => {
                this.toggleMobileMenu();
            });
            
            // Close mobile menu when clicking nav links
            utils.$$('.nav-link').forEach(link => {
                utils.on(link, 'click', () => {
                    this.closeMobileMenu();
                });
            });
            
            // Handle scroll for header
            window.addEventListener('scroll', utils.debounce(() => {
                this.handleScroll();
            }, 10));
        },
        
        toggleMobileMenu() {
            const nav = utils.$('#site-nav');
            const toggle = utils.$('#mobile-menu-toggle');
            
            utils.toggleClass(nav, 'mobile-open');
            utils.toggleClass(toggle, 'open');
        },
        
        closeMobileMenu() {
            const nav = utils.$('#site-nav');
            const toggle = utils.$('#mobile-menu-toggle');
            
            utils.removeClass([nav], 'mobile-open');
            utils.removeClass([toggle], 'open');
        },
        
        handleScroll() {
            const header = utils.$('#site-header');
            const scrolled = window.scrollY > CONFIG.SCROLL_THRESHOLD;
            
            if (scrolled) {
                utils.addClass(header, 'scrolled');
            } else {
                utils.removeClass([header], 'scrolled');
            }
        }
    };
    
    // Search Manager
    const searchManager = {
        init() {
            this.bindEvents();
            this.loadSearchIndex();
        },
        
        bindEvents() {
            // Search toggle
            utils.on(utils.$('#search-toggle'), 'click', () => {
                this.openSearch();
            });
            
            // Close search overlay
            utils.on(utils.$('#search-overlay'), 'click', (e) => {
                if (e.target.id === 'search-overlay') {
                    this.closeSearch();
                }
            });
            
            // Search input
            utils.on(utils.$('#search-input'), 'input', utils.debounce((e) => {
                this.performSearch(e.target.value);
            }, CONFIG.SEARCH_DEBOUNCE));
            
            // Escape key to close search
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeSearch();
                }
            });
        },
        
        openSearch() {
            const overlay = utils.$('#search-overlay');
            const input = utils.$('#search-input');
            
            utils.addClass(overlay, 'open');
            setTimeout(() => {
                input?.focus();
            }, 100);
        },
        
        closeSearch() {
            const overlay = utils.$('#search-overlay');
            const input = utils.$('#search-input');
            
            utils.removeClass([overlay], 'open');
            if (input) input.value = '';
            this.clearResults();
        },
        
        async loadSearchIndex() {
            try {
                // In a real implementation, you would load a search index
                // For now, we'll use a simple client-side search
                this.searchIndex = await this.buildSearchIndex();
            } catch (error) {
                console.error('Failed to load search index:', error);
            }
        },
        
        async buildSearchIndex() {
            // This would typically be a pre-built search index
            // For demo purposes, we'll return a simple structure
            return [
                {
                    title: 'Sample Post 1',
                    url: '/2024/01/01/sample-post-1/',
                    excerpt: 'This is a sample post excerpt...',
                    content: 'Full content of the post...'
                },
                {
                    title: 'Sample Post 2',
                    url: '/2024/01/02/sample-post-2/',
                    excerpt: 'Another sample post excerpt...',
                    content: 'Full content of another post...'
                }
            ];
        },
        
        performSearch(query) {
            if (!query.trim()) {
                this.clearResults();
                return;
            }
            
            const results = this.searchIndex?.filter(item => {
                const searchText = `${item.title} ${item.excerpt} ${item.content}`.toLowerCase();
                return searchText.includes(query.toLowerCase());
            }) || [];
            
            this.displayResults(results, query);
        },
        
        displayResults(results, query) {
            const container = utils.$('#search-results');
            if (!container) return;
            
            if (results.length === 0) {
                container.innerHTML = `
                    <div class="search-result">
                        <div class="result-title">未找到相关结果</div>
                        <div class="result-excerpt">尝试使用不同的关键词搜索</div>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = results.map(result => `
                <a href="${result.url}" class="search-result">
                    <div class="result-title">${this.highlightText(result.title, query)}</div>
                    <div class="result-excerpt">${this.highlightText(result.excerpt, query)}</div>
                </a>
            `).join('');
        },
        
        highlightText(text, query) {
            const regex = new RegExp(`(${query})`, 'gi');
            return text.replace(regex, '<mark>$1</mark>');
        },
        
        clearResults() {
            const container = utils.$('#search-results');
            if (container) {
                container.innerHTML = '';
            }
        }
    };
    
    // Authentication Manager
    const authManager = {
        init() {
            this.checkAuthStatus();
            this.bindEvents();
        },
        
        bindEvents() {
            // Login button
            utils.on(utils.$('#login-btn'), 'click', () => {
                this.openLoginModal();
            });
            
            // SAML login button
            utils.on(utils.$('#saml-login-btn'), 'click', () => {
                this.initiateSAMLLogin();
            });
            
            // Logout button
            utils.on(utils.$('#logout-btn'), 'click', () => {
                this.logout();
            });
            
            // Profile dropdown
            utils.on(utils.$('#profile-trigger'), 'click', () => {
                this.toggleProfileDropdown();
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.user-profile')) {
                    this.closeProfileDropdown();
                }
            });
            
            // Close auth modal
            utils.on(utils.$('#auth-modal'), 'click', (e) => {
                if (e.target.id === 'auth-modal') {
                    this.closeLoginModal();
                }
            });
        },
        
        checkAuthStatus() {
            const token = utils.storage.get(CONFIG.AUTH_TOKEN_KEY);
            const userData = utils.storage.get(CONFIG.USER_DATA_KEY);
            
            if (token && userData) {
                this.showUserProfile(userData);
            } else {
                this.showLoginButton();
            }
        },
        
        showLoginButton() {
            const loginBtn = utils.$('#login-btn');
            const userProfile = utils.$('#user-profile');
            
            utils.removeClass([loginBtn], 'hidden');
            utils.addClass(userProfile, 'hidden');
        },
        
        showUserProfile(userData) {
            const loginBtn = utils.$('#login-btn');
            const userProfile = utils.$('#user-profile');
            const avatar = utils.$('#user-avatar');
            const username = utils.$('#username');
            
            utils.addClass(loginBtn, 'hidden');
            utils.removeClass([userProfile], 'hidden');
            
            if (avatar) avatar.src = userData.avatar || '/assets/images/default-avatar.png';
            if (username) username.textContent = userData.name || userData.email;
        },
        
        openLoginModal() {
            const modal = utils.$('#auth-modal');
            utils.addClass(modal, 'open');
        },
        
        closeLoginModal() {
            const modal = utils.$('#auth-modal');
            utils.removeClass([modal], 'open');
        },
        
        async initiateSAMLLogin() {
            const button = utils.$('#saml-login-btn');
            const originalText = button?.innerHTML;
            
            try {
                // Show loading state
                if (button) {
                    button.innerHTML = `
                        <div class="loading-spinner"></div>
                        正在跳转...
                    `;
                    button.disabled = true;
                }
                
                // In a real implementation, this would redirect to SAML IdP
                // For demo purposes, we'll simulate the process
                await this.simulateSAMLLogin();
                
            } catch (error) {
                console.error('SAML login failed:', error);
                this.showError('登录失败，请稍后重试');
            } finally {
                // Restore button state
                if (button && originalText) {
                    button.innerHTML = originalText;
                    button.disabled = false;
                }
            }
        },
        
        async simulateSAMLLogin() {
            // Simulate SAML login process
            return new Promise((resolve) => {
                setTimeout(() => {
                    // Simulate successful login
                    const userData = {
                        id: 'user123',
                        name: 'Nanru1',
                        email: 'fengnanrui@163.com',
                        avatar: '/assets/images/avatar.jpg',
                        roles: ['editor']
                    };
                    
                    const token = 'simulated-jwt-token';
                    
                    utils.storage.set(CONFIG.AUTH_TOKEN_KEY, token);
                    utils.storage.set(CONFIG.USER_DATA_KEY, userData);
                    
                    this.showUserProfile(userData);
                    this.closeLoginModal();
                    this.showSuccess('登录成功！');
                    
                    resolve();
                }, 2000);
            });
        },
        
        logout() {
            utils.storage.remove(CONFIG.AUTH_TOKEN_KEY);
            utils.storage.remove(CONFIG.USER_DATA_KEY);
            
            this.showLoginButton();
            this.closeProfileDropdown();
            this.showSuccess('已安全退出登录');
        },
        
        toggleProfileDropdown() {
            const trigger = utils.$('#profile-trigger');
            const dropdown = utils.$('#profile-dropdown');
            
            utils.toggleClass(trigger, 'open');
            utils.toggleClass(dropdown, 'open');
        },
        
        closeProfileDropdown() {
            const trigger = utils.$('#profile-trigger');
            const dropdown = utils.$('#profile-dropdown');
            
            utils.removeClass([trigger], 'open');
            utils.removeClass([dropdown], 'open');
        },
        
        showError(message) {
            this.showNotification(message, 'error');
        },
        
        showSuccess(message) {
            this.showNotification(message, 'success');
        },
        
        showNotification(message, type = 'info') {
            // Create notification element
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <span class="notification-message">${message}</span>
                    <button class="notification-close">&times;</button>
                </div>
            `;
            
            // Add to page
            document.body.appendChild(notification);
            
            // Show notification
            setTimeout(() => {
                utils.addClass(notification, 'show');
            }, 100);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                this.removeNotification(notification);
            }, 5000);
            
            // Close button
            utils.on(notification.querySelector('.notification-close'), 'click', () => {
                this.removeNotification(notification);
            });
        },
        
        removeNotification(notification) {
            utils.removeClass([notification], 'show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    };
    
    // Back to Top Manager
    const backToTopManager = {
        init() {
            this.bindEvents();
            this.handleScroll();
        },
        
        bindEvents() {
            utils.on(utils.$('#back-to-top'), 'click', () => {
                this.scrollToTop();
            });
            
            window.addEventListener('scroll', utils.debounce(() => {
                this.handleScroll();
            }, 100));
        },
        
        handleScroll() {
            const button = utils.$('#back-to-top');
            const scrolled = window.scrollY > CONFIG.SCROLL_THRESHOLD * 3;
            
            if (scrolled) {
                utils.addClass(button, 'visible');
            } else {
                utils.removeClass([button], 'visible');
            }
        },
        
        scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };
    
    // Reading Progress Manager (for post pages)
    const readingProgressManager = {
        init() {
            if (utils.$('#reading-progress-bar')) {
                this.bindEvents();
            }
        },
        
        bindEvents() {
            window.addEventListener('scroll', utils.debounce(() => {
                this.updateProgress();
            }, 10));
        },
        
        updateProgress() {
            const progressBar = utils.$('#reading-progress-bar');
            if (!progressBar) return;
            
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight - windowHeight;
            const scrolled = window.scrollY;
            const progress = (scrolled / documentHeight) * 100;
            
            progressBar.style.width = `${Math.min(progress, 100)}%`;
        }
    };
    
    // Newsletter Manager
    const newsletterManager = {
        init() {
            this.bindEvents();
        },
        
        bindEvents() {
            utils.on(utils.$('#newsletter-form'), 'submit', (e) => {
                e.preventDefault();
                this.handleSubscription(e.target);
            });
        },
        
        async handleSubscription(form) {
            const email = form.querySelector('.email-input')?.value;
            const button = form.querySelector('.subscribe-btn');
            const originalText = button?.textContent;
            
            if (!email) return;
            
            try {
                // Show loading state
                if (button) {
                    button.textContent = '订阅中...';
                    button.disabled = true;
                }
                
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Show success message
                authManager.showSuccess('订阅成功！感谢您的关注。');
                form.reset();
                
            } catch (error) {
                console.error('Newsletter subscription failed:', error);
                authManager.showError('订阅失败，请稍后重试');
            } finally {
                // Restore button state
                if (button && originalText) {
                    button.textContent = originalText;
                    button.disabled = false;
                }
            }
        }
    };
    
    // Initialize all managers when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        themeManager.init();
        navigationManager.init();
        searchManager.init();
        backToTopManager.init();
        readingProgressManager.init();
        newsletterManager.init();
        
        console.log('Modern Jekyll Blog initialized successfully!');
    });
        
        // Add notification styles if not present
        if (!utils.$('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: var(--color-surface-elevated);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-xl);
                    padding: var(--space-md);
                    max-width: 400px;
                    z-index: var(--z-tooltip);
                    transform: translateX(100%);
                    opacity: 0;
                    transition: all var(--transition-normal);
                }
                
                .notification.show {
                    transform: translateX(0);
                    opacity: 1;
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: var(--space-sm);
                }
                
                .notification-message {
                    flex: 1;
                    color: var(--color-text-primary);
                    font-size: var(--font-size-sm);
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    color: var(--color-text-secondary);
                    cursor: pointer;
                    font-size: var(--font-size-lg);
                    padding: var(--space-xs);
                    border-radius: var(--radius-sm);
                }
                
                .notification-close:hover {
                    background: var(--color-surface);
                }
                
                .notification-success {
                    border-left: 4px solid var(--color-success);
                }
                
                .notification-error {
                    border-left: 4px solid var(--color-error);
                }
                
                .notification-info {
                    border-left: 4px solid var(--color-info);
                }
            `;
            document.head.appendChild(styles);
        }
        
        console.log('Modern Jekyll Blog initialized successfully!');
    });
    
})();

