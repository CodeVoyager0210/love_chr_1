document.addEventListener('DOMContentLoaded', function() {
    // 获取开始查询按钮
    const startBtn = document.getElementById('startMonitoringBtn');

    if (startBtn) {
        startBtn.addEventListener('click', function(e) {
            e.preventDefault(); // 阻止任何默认行为
            e.stopPropagation(); // 阻止事件冒泡

            console.log('Start button clicked, navigating to /app');

            // 添加过渡动画
            document.body.style.transition = 'opacity 0.5s ease-in-out';
            document.body.style.opacity = '0';

            // 延迟跳转到React应用
            setTimeout(() => {
                // 跳转到React应用的主页面
                console.log('Navigating to:', window.location.origin + '/app');
                window.location.href = '/app';
            }, 500);
        });

        // 添加悬停效果
        startBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
        });

        startBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
        });
    }

    // 添加键盘快捷键支持（仅在特定区域生效）
    document.addEventListener('keydown', function(e) {
        // 按Enter键也可以开始查询，但不要在聊天输入框中触发
        if (e.key === 'Enter' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            startBtn.click();
        }
    });
});