/**
 * animations.js
 * 
 * 此文件提供了一系列动画和视觉效果函数，用于增强Jekyll博客的用户体验
 * 包括: 滚动动画、淡入效果、打字效果、视差滚动等
 * 
 * @author: Nanru1
 * @version: 1.0.0
 * @license: MIT
 */

(function() {
  'use strict';
  
  // 配置选项
  const config = {
    // 动画触发阈值
    threshold: 0.2,
    
    // 动画延迟基础值(毫秒)
    baseDelay: 100,
    
    // 是否对移动设备禁用某些动画
    reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    
    // 选择器配置
    selectors: {
      fadeIn: '.animate-fade-in',
      slideUp: '.animate-slide-up',
      slideIn: '.animate-slide-in',
      scale: '.animate-scale',
      typing: '[data-typing]',
      parallax: '.parallax-section',
      counter: '[data-counter]'
    }
  };
  
  /**
   * 工具函数集合
   */
  const utils = {
    /**
     * 创建防抖函数
     * @param {Function} func - 要执行的函数
     * @param {number} wait - 等待时间(毫秒)
     * @return {Function} - 防抖后的函数
     */
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
    
    /**
     * 获取元素在视口中的可见性百分比
     * @param {HTMLElement} element - 要检查的元素
     * @return {number} - 0到1之间的可见性百分比
     */
    getVisibilityPercentage(element) {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      
      // 元素在视口上方
      if (rect.bottom < 0) return 0;
      
      // 元素在视口下方
      if (rect.top > windowHeight) return 0;
      
      // 元素完全在视口内
      if (rect.top >= 0 && rect.bottom <= windowHeight) return 1;
      
      // 元素部分可见
      const visibleHeight = rect.bottom > windowHeight
        ? windowHeight - rect.top
        : rect.bottom;
        
      return Math.min(visibleHeight / rect.height, 1);
    },
    
    /**
     * 创建交叉观察器
     * @param {Function} callback - 回调函数
     * @param {Object} options - 配置选项
     * @return {IntersectionObserver}
     */
    createObserver(callback, options = {}) {
      return new IntersectionObserver(callback, {
        threshold: config.threshold,
        rootMargin: '0px 0px -50px 0px',
        ...options
      });
    }
  };
  
  /**
   * 淡入动画管理器
   */
  const fadeManager = {
    init() {
      if (config.reduceMotion) return;
      
      // 获取所有需要淡入的元素
      const fadeElements = document.querySelectorAll(config.selectors.fadeIn);
      if (!fadeElements.length) return;
      
      // 创建交叉观察器
      const observer = utils.createObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = parseInt(el.dataset.delay || 0, 10);
            
            setTimeout(() => {
              el.classList.add('fade-in-active');
              observer.unobserve(el);
            }, config.baseDelay + delay);
          }
        });
      });
      
      // 观察每个元素
      fadeElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.8s ease-out';
        
        // 如果没有显式的延迟，添加级联效果
        if (!el.dataset.delay) {
          el.dataset.delay = index * 100;
        }
        
        observer.observe(el);
      });
    }
  };
  
  /**
   * 滑入动画管理器
   */
  const slideManager = {
    init() {
      if (config.reduceMotion) return;
      
      this.initSlideUp();
      this.initSlideIn();
    },
    
    initSlideUp() {
      const elements = document.querySelectorAll(config.selectors.slideUp);
      if (!elements.length) return;
      
      const observer = utils.createObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = parseInt(el.dataset.delay || 0, 10);
            
            setTimeout(() => {
              el.classList.add('slide-up-active');
              observer.unobserve(el);
            }, config.baseDelay + delay);
          }
        });
      });
      
      elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        
        if (!el.dataset.delay) {
          el.dataset.delay = index * 100;
        }
        
        observer.observe(el);
      });
    },
    
    initSlideIn() {
      const elements = document.querySelectorAll(config.selectors.slideIn);
      if (!elements.length) return;
      
      const observer = utils.createObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = parseInt(el.dataset.delay || 0, 10);
            const direction = el.dataset.direction || 'left';
            
            setTimeout(() => {
              el.classList.add('slide-in-active');
              observer.unobserve(el);
            }, config.baseDelay + delay);
          }
        });
      });
      
      elements.forEach((el, index) => {
        const direction = el.dataset.direction || 'left';
        let transform;
        
        switch (direction) {
          case 'left':
            transform = 'translateX(-50px)';
            break;
          case 'right':
            transform = 'translateX(50px)';
            break;
          case 'up':
            transform = 'translateY(50px)';
            break;
          case 'down':
            transform = 'translateY(-50px)';
            break;
          default:
            transform = 'translateX(-50px)';
        }
        
        el.style.opacity = '0';
        el.style.transform = transform;
        el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        
        if (!el.dataset.delay) {
          el.dataset.delay = index * 100;
        }
        
        observer.observe(el);
      });
    }
  };

  /**
   * 缩放动画管理器
   */
  const scaleManager = {
    init() {
      if (config.reduceMotion) return;
      
      const elements = document.querySelectorAll(config.selectors.scale);
      if (!elements.length) return;
      
      const observer = utils.createObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = parseInt(el.dataset.delay || 0, 10);
            
            setTimeout(() => {
              el.classList.add('scale-active');
              observer.unobserve(el);
            }, config.baseDelay + delay);
          }
        });
      });
      
      elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'scale(0.8)';
        el.style.transition = 'opacity 0.8s ease-out, transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        
        if (!el.dataset.delay) {
          el.dataset.delay = index * 100;
        }
        
        observer.observe(el);
      });
    }
  };
  
  /**
   * 打字效果管理器
   */
  const typingManager = {
    init() {
      const elements = document.querySelectorAll(config.selectors.typing);
      if (!elements.length) return;
      
      elements.forEach(el => {
        const text = el.dataset.typing || el.textContent;
        const speed = parseInt(el.dataset.typingSpeed || 50, 10);
        const delay = parseInt(el.dataset.delay || 0, 10);
        const cursor = el.dataset.cursor !== 'false';
        
        el.textContent = '';
        
        if (cursor) {
          const cursorEl = document.createElement('span');
          cursorEl.classList.add('typing-cursor');
          cursorEl.textContent = '|';
          el.appendChild(cursorEl);
        }
        
        setTimeout(() => {
          this.typeText(el, text, 0, speed);
        }, delay);
      });
    },
    
    typeText(element, text, index, speed) {
      if (index < text.length) {
        // 创建一个新的span来包含下一个字符
        const charSpan = document.createElement('span');
        charSpan.classList.add('typing-char');
        charSpan.textContent = text.charAt(index);
        
        // 在光标前插入字符
        const cursor = element.querySelector('.typing-cursor');
        if (cursor) {
          element.insertBefore(charSpan, cursor);
        } else {
          element.appendChild(charSpan);
        }
        
        // 继续下一个字符
        setTimeout(() => {
          this.typeText(element, text, index + 1, speed);
        }, speed);
      }
    }
  };
  
  /**
   * 视差滚动效果管理器
   */
  const parallaxManager = {
    init() {
      if (config.reduceMotion) return;
      
      const elements = document.querySelectorAll(config.selectors.parallax);
      if (!elements.length) return;
      
      // 初始化所有视差元素
      elements.forEach(el => {
        const speed = parseFloat(el.dataset.parallaxSpeed || 0.2);
        el.dataset.parallaxSpeed = speed;
        this.setPosition(el);
      });
      
      // 绑定滚动事件
      window.addEventListener('scroll', utils.debounce(() => {
        elements.forEach(el => this.setPosition(el));
      }, 10));
    },
    
    setPosition(element) {
      const scrollY = window.scrollY;
      const speed = parseFloat(element.dataset.parallaxSpeed);
      const yPos = -scrollY * speed;
      
      element.style.transform = `translate3d(0, ${yPos}px, 0)`;
    }
  };
  
  /**
   * 数字计数器动画
   */
  const counterManager = {
    init() {
      const elements = document.querySelectorAll(config.selectors.counter);
      if (!elements.length) return;
      
      const observer = utils.createObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !entry.target.dataset.counted) {
            const el = entry.target;
            const target = parseInt(el.dataset.counter, 10);
            const duration = parseInt(el.dataset.duration || 2000, 10);
            const delay = parseInt(el.dataset.delay || 0, 10);
            
            el.dataset.counted = 'true';
            setTimeout(() => this.animateCount(el, target, duration), delay);
          }
        });
      });
      
      elements.forEach(el => observer.observe(el));
    },
    
    animateCount(element, target, duration) {
      const start = 0;
      const startTime = performance.now();
      const prefix = element.dataset.prefix || '';
      const suffix = element.dataset.suffix || '';
      
      const updateCount = (timestamp) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 使用缓动函数使动画更自然
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(easeOutQuart * (target - start) + start);
        
        element.textContent = `${prefix}${current}${suffix}`;
        
        if (progress < 1) {
          requestAnimationFrame(updateCount);
        }
      };
      
      requestAnimationFrame(updateCount);
    }
  };
  
  /**
   * 初始化所有动画管理器
   */
  function initAnimations() {
    // 检查是否支持IntersectionObserver
    if ('IntersectionObserver' in window) {
      // 先添加需要的CSS
      addCssStyles();
      
      // 初始化各种动画
      fadeManager.init();
      slideManager.init();
      scaleManager.init();
      typingManager.init();
      parallaxManager.init();
      counterManager.init();
      
      console.log('博客动画初始化完成！');
    } else {
      console.warn('您的浏览器不支持IntersectionObserver，动画效果将不可用。');
    }
  }
  
  /**
   * 添加必要的CSS样式
   */
  function addCssStyles() {
    if (document.getElementById('animations-styles')) return;
    
    const styleSheet = document.createElement('style');
    styleSheet.id = 'animations-styles';
    styleSheet.textContent = `
      /* 动画相关样式 */
      .fade-in-active {
        opacity: 1 !important;
      }
      
      .slide-up-active {
        opacity: 1 !important;
        transform: translateY(0) !important;
      }
      
      .slide-in-active {
        opacity: 1 !important;
        transform: translate(0, 0) !important;
      }
      
      .scale-active {
        opacity: 1 !important;
        transform: scale(1) !important;
      }
      
      .typing-cursor {
        display: inline-block;
        vertical-align: bottom;
        animation: blink 0.7s infinite;
      }
      
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }
      
      /* 视差容器需要overflow:hidden */
      [data-parallax-container] {
        overflow: hidden;
        position: relative;
      }
    `;
    
    document.head.appendChild(styleSheet);
  }
  
  /**
   * 当DOM加载完成后初始化
   */
  document.addEventListener('DOMContentLoaded', initAnimations);
  
  /**
   * 公开API
   */
  window.NanruAnimations = {
    init: initAnimations,
    fade: fadeManager,
    slide: slideManager,
    scale: scaleManager,
    typing: typingManager,
    parallax: parallaxManager,
    counter: counterManager
  };
})();
