// AI Chat Functionality with Enhanced CSV parsing
(function() {
    console.log('Enhanced chat script loading...');

    // Global variables
    let csvData = [];
    let documents = [];
    let df = {};
    let idf = {};
    // Deepseek API密钥
    let deepseekApiKey = 'sk-57ef5fbcdbf84e568dfa5677c05c7d1d';

    // Initialize chat when DOM is ready
    function initChat() {
        console.log('Initializing enhanced chat...');

        const chatInput = document.getElementById('chatInput');
        const sendButton = document.getElementById('sendButton');
        const chatForm = document.getElementById('chatForm');
        const chatMessages = document.getElementById('chatMessages');
        const typingIndicator = document.getElementById('typingIndicator');
        const aiChatContainer = document.querySelector('.ai-chat-container');
        const fileInput = document.getElementById('fileInput');
        const fileLabel = document.querySelector('.file-upload-label');

        console.log('Chat elements found:', {
            chatInput: !!chatInput,
            sendButton: !!sendButton,
            chatForm: !!chatForm,
            chatMessages: !!chatMessages,
            typingIndicator: !!typingIndicator,
            aiChatContainer: !!aiChatContainer,
            fileInput: !!fileInput,
            fileLabel: !!fileLabel
        });

        if (!chatInput || !sendButton || !chatMessages || !chatForm) {
            console.error('Chat elements not found', {
                chatInput: !!chatInput,
                sendButton: !!sendButton,
                chatForm: !!chatForm,
                chatMessages: !!chatMessages
            });
            return;
        }

        // Show chat container immediately
        if (aiChatContainer) {
            aiChatContainer.style.opacity = '1';
            aiChatContainer.style.transform = 'translateY(0)';
            aiChatContainer.style.display = 'flex';
        }

        // Function to add message to chat
        function addMessage(content, isUser = false) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${isUser ? 'user' : 'ai'}`;

            const messageContent = document.createElement('div');
            messageContent.className = 'message-content';
            messageContent.innerHTML = content;

            messageDiv.appendChild(messageContent);
            chatMessages.appendChild(messageDiv);

            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        // Function to show typing indicator
        function showTypingIndicator() {
            if (typingIndicator) {
                typingIndicator.style.display = 'flex';
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }

        // Function to hide typing indicator
        function hideTypingIndicator() {
            if (typingIndicator) {
                typingIndicator.style.display = 'none';
            }
        }

        // Tokenize function (same as reference.html)
        function tokenize(text) {
            return text.toLowerCase().match(/\b[\w\u4e00-\u9fff]+\b/g) || [];
        }

        // Build TF-IDF index (same as reference.html)
        function buildIndex(rows) {
            documents = [];
            df = {};

            for (let i = 0; i < rows.length; i++) {
                const text = JSON.stringify(rows[i]);
                const tokens = tokenize(text);
                documents.push({ text, tokens });

                const unique = new Set(tokens);
                for (const token of unique) {
                    if (!df[token]) df[token] = 0;
                    df[token]++;
                }
            }

            const N = documents.length;
            for (const token in df) {
                idf[token] = Math.log(N / (df[token] + 1));
            }
        }

        // Calculate TF-IDF score (same as reference.html)
        function tfidfScore(queryTokens, docTokens) {
            const tf = {};
            for (const t of docTokens) {
                tf[t] = (tf[t] || 0) + 1;
            }
            const score = queryTokens.reduce((acc, t) => {
                if (idf[t]) acc += (tf[t] || 0) * idf[t];
                return acc;
            }, 0);
            return score;
        }

        // Simple CSV parser (mimicking reference.html logic)
        function parseCSVSimple(text) {
            const lines = text.split('\n');
            const result = [];

            // Get headers
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;

                const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                const row = {};

                headers.forEach((header, index) => {
                    row[header] = values[index] || '';
                });

                result.push(row);
            }

            return result;
        }

        // Handle file upload
        if (fileInput) {
            fileInput.addEventListener('change', async function(e) {
                const file = e.target.files[0];
                if (!file) return;

                if (!file.name.toLowerCase().endsWith('.csv')) {
                    addMessage('Please upload a CSV file.', false);
                    return;
                }

                try {
                    // Show loading message
                    addMessage(`📁 Processing file: ${file.name}...`, false);

                    // Read file
                    const text = await file.text();
                    console.log('File content length:', text.length);

                    // Try using PapaParse if available, otherwise use simple parser
                    let rows;

                    if (window.Papa) {
                        console.log('Using PapaParse');
                        const parsed = Papa.parse(text, { header: true });
                        rows = parsed.data.filter(r => Object.keys(r).length > 0 && Object.values(r).some(v => v.trim()));
                    } else {
                        console.log('Using simple CSV parser');
                        rows = parseCSVSimple(text);
                    }

                    console.log('Parsed rows:', rows.length);
                    console.log('First row:', rows[0]);

                    if (rows.length === 0) {
                        addMessage('❌ No data found in the CSV file.', false);
                        return;
                    }

                    csvData = rows;
                    buildIndex(rows);

                    // Show detailed success message
                    const headers = Object.keys(rows[0]);
                    const sampleData = rows.slice(0, 3).map(row =>
                        Object.entries(row)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(' | ')
                    ).join('<br>');

                    addMessage(`✅ CSV file loaded successfully!<br><br>
📊 **File Details:**<br>
• Name: ${file.name}<br>
• Records: ${rows.length} rows<br>
• Columns: ${headers.length}<br>
• Headers: ${headers.join(', ')}<br><br>
📋 **Sample Data:**<br>
${sampleData}<br><br>
💡 **You can now ask questions like:**<br>
• What is the average salary?<br>
• Who works in Engineering?<br>
• Show me employees over 30<br>
• Who has the most experience?`, false);

                    // Update file label with animation
                    if (fileLabel) {
                        fileLabel.textContent = `📄 ${file.name}`;
                        fileLabel.classList.add('success');
                        setTimeout(() => fileLabel.classList.remove('success'), 600);
                    }

                } catch (error) {
                    console.error('Error parsing CSV:', error);
                    addMessage(`❌ Error parsing CSV: ${error.message}<br><br>Please ensure your file is a valid CSV with headers.`, false);
                }
            });
        }

        // Function to send message to AI
        async function sendMessageToAI(message) {
            try {
                console.log('Sending message to AI:', message);
                showTypingIndicator();

                let context = '';

                // If CSV data is loaded, use TF-IDF to find relevant context
                if (documents.length > 0) {
                    const qTokens = tokenize(message);

                    const ranked = documents
                        .map(doc => ({
                            ...doc,
                            score: tfidfScore(qTokens, doc.tokens)
                        }))
                        .sort((a, b) => b.score - a.score)
                        .slice(0, 3);

                    context = ranked.map(r => r.text).join('\n');
                }

                // 检查是否配置了API密钥
                if (!deepseekApiKey) {
                    // 使用模拟回复
                    const mockResponse = generateMockResponse(message, csvData.length > 0);
                    hideTypingIndicator();
                    addMessage(mockResponse, false);
                    return;
                }

                // Prepare messages for Deepseek API
                const apiMessages = [
                    {
                        role: "system",
                        content: `你是OISST（海洋表面温度查询系统）的专业AI助手。你的职责包括：

1. **海洋数据专家**：回答关于海洋表面温度、海洋学、气候变化等专业知识
2. **数据分析助手**：当用户提供CSV数据时，进行准确的数据分析和解读
3. **系统引导员**：介绍OISST系统功能，指导用户使用

**回答风格**：
- 专业、准确、友好
- 对于数据问题，要引用具体的数值和趋势
- 提供实用的建议和解释
- 使用中文回答，除非用户明确要求英文

**OISST系统功能**：
- 全球海域温度查询
- 多日数据对比分析
- 温度趋势预测
- 区域差异分析
- 数据可视化展示

请根据用户的问题提供准确、有帮助的回答。`
                    }
                ];

                if (context) {
                    apiMessages.push({
                        role: "user",
                        content: `基于以下CSV数据内容，请分析并回答问题。如果数据包含温度信息，请重点关注温度相关的分析和解读：

**数据内容**：
${context}

**用户问题**：${message}

请提供详细的数据分析，包括：
1. 具体的数值统计
2. 数据趋势和模式
3. 相关的海洋学解释
4. 实用的建议和结论`
                    });
                } else {
                    apiMessages.push({
                        role: "user",
                        content: message
                    });
                }

                console.log('Calling Deepseek API...');
                const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${deepseekApiKey}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: "deepseek-chat",
                        messages: apiMessages,
                        temperature: 0.2,
                        max_tokens: 3000,
                        top_p: 0.95,
                        frequency_penalty: 0.5,
                        presence_penalty: 0.5
                    })
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error('API密钥无效，请检查配置');
                    } else if (response.status >= 500) {
                        throw new Error('AI服务暂时不可用，请稍后重试');
                    } else {
                        throw new Error(`API错误: ${response.status}`);
                    }
                }

                const data = await response.json();
                console.log('AI response received:', data);
                hideTypingIndicator();

                if (data.choices && data.choices[0] && data.choices[0].message) {
                    const aiResponse = data.choices[0].message.content;
                    console.log('AI response content:', aiResponse);
                    addMessage(aiResponse, false);
                } else {
                    console.error('Invalid AI response structure:', data);
                    addMessage('抱歉，收到了无效的响应。', false);
                }

            } catch (error) {
                console.error('Error:', error);
                hideTypingIndicator();

                let errorMessage = '发生了未知错误';
                if (error.message.includes('fetch')) {
                    errorMessage = '网络连接失败，请检查网络连接';
                } else if (error.message.includes('API')) {
                    errorMessage = error.message;
                } else {
                    errorMessage = `错误: ${error.message}`;
                }

                addMessage(`❌ ${errorMessage}`, false);

                // 重新启用发送按钮
                if (sendButton) {
                    sendButton.disabled = false;
                }
            }
        }

        // 生成模拟回复功能
        function generateMockResponse(message, hasCSVData) {
            const lowerMessage = message.toLowerCase();

            if (hasCSVData) {
                if (lowerMessage.includes('平均') || lowerMessage.includes('average')) {
                    return '📊 根据您上传的CSV数据，我已经分析了相关数值的平均值。请注意这是一个模拟回复，实际分析需要配置AI服务。';
                } else if (lowerMessage.includes('最大') || lowerMessage.includes('minimum') || lowerMessage.includes('最小')) {
                    return '📈 我已经识别了数据中的最大值和最小值。要获得详细分析，请配置AI服务。';
                } else {
                    return '📋 我看到您已经上传了CSV数据。我可以帮助您分析这些数据，但目前需要配置AI服务才能提供具体的分析结果。';
                }
            } else {
                if (lowerMessage.includes('海') || lowerMessage.includes('温度') || lowerMessage.includes('sst')) {
                    return '🌊 海洋表面温度（Sea Surface Temperature, SST）是海洋学的重要参数。OISST系统提供全球海域的温度数据查询和分析功能。\n\n主要功能包括：\n• 单日和多日温度查询\n• 区域对比分析\n• 温度趋势预测\n• 数据可视化展示\n\n您可以点击"开始查询"进入主系统使用这些功能。';
                } else if (lowerMessage.includes('帮助') || lowerMessage.includes('help')) {
                    return '🤝 欢迎使用OISST海洋表面温度查询系统！\n\n我可以帮助您：\n• 回答海洋温度相关问题\n• 分析CSV数据（需上传文件）\n• 介绍系统功能\n\n要使用完整的数据查询功能，请点击"开始查询"按钮。';
                } else {
                    return '💬 您好！我是OISST系统的AI助手。我可以回答关于海洋表面温度的问题，或者帮助您分析上传的CSV数据。\n\n目前系统正在演示模式下，如需完整的AI服务，请联系管理员配置API密钥。';
                }
            }
        }

        // Function to handle sending message
        function handleSendMessage() {
            const message = chatInput.value.trim();
            if (message) {
                addMessage(message, true);
                chatInput.value = '';
                sendButton.disabled = true;
                sendMessageToAI(message).finally(() => {
                    // 确保发送按钮在请求完成后重新启用
                    sendButton.disabled = false;
                });
            }
        }

        // Event listeners
        if (sendButton) {
            sendButton.addEventListener('click', (e) => {
                e.preventDefault();
                handleSendMessage();
            });
        }

        if (chatInput) {
            // 使用 keydown 事件监听回车键
            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault(); // 阻止回车键的默认行为
                    e.stopPropagation(); // 阻止事件冒泡
                    handleSendMessage();
                    return false;
                }
            });

            // 添加 input 事件来启用/禁用按钮
            chatInput.addEventListener('input', () => {
                sendButton.disabled = !chatInput.value.trim();
            });

            // 初始状态
            sendButton.disabled = true;
        }

        console.log('Enhanced chat initialized');
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChat);
    } else {
        initChat();
    }
})();