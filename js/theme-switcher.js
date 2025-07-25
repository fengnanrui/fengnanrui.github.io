/**
 * 简单、独立的主题切换器脚本
 * 为Jekyll博客提供深色/浅色主题切换功能
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('主题切换器初始化中...');
  
  // 获取主题切换按钮
  const themeToggle = document.getElementById('theme-toggle');
  
  if (!themeToggle) {
    console.error('找不到主题切换按钮，ID: theme-toggle');
    return;
  }
  
  console.log('找到主题切换按钮');
  
  // 获取主题图标
  const sunIcon = document.querySelector('.sun-icon');
  const moonIcon = document.querySelector('.moon-icon');
  
  if (!sunIcon || !moonIcon) {
    console.warn('找不到主题图标');
  } else {
    console.log('找到主题图标');
  }
  
  // 应用保存的主题
  const savedTheme = localStorage.getItem('blog-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  console.log('应用保存的主题:', savedTheme);
  
  // 更新图标显示
  function updateThemeIcon(theme) {
    if (!sunIcon || !moonIcon) return;
    
    if (theme === 'dark') {
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
    } else {
      sunIcon.classList.remove('hidden');
      moonIcon.classList.add('hidden');
    }
  }
  
  // 初始更新图标
  updateThemeIcon(savedTheme);
  
  // 添加点击事件
  themeToggle.addEventListener('click', function() {
    console.log('主题切换按钮被点击');
    
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('blog-theme', newTheme);
    console.log('切换主题为:', newTheme);
    
    updateThemeIcon(newTheme);
  });
  
  console.log('主题切换器初始化完成');
}); 