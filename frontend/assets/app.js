// CyberGuard AI - Frontend Application Logic

const API_BASE = window.location.origin;
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
let chatSessionId = null;
let currentAttachment = null;

// Status Indicator Functions
function updateStatus(status) {
    const indicator = document.getElementById('statusIndicator');
    const dot = indicator.querySelector('.status-dot');
    const text = indicator.querySelector('.status-text');
    
    // Remove all status classes
    indicator.classList.remove('online', 'typing', 'processing');
    dot.classList.remove('status-online', 'status-typing', 'status-processing');
    
    // Add new status
    switch(status) {
        case 'online':
            indicator.classList.add('online');
            dot.classList.add('status-online');
            text.textContent = 'Online';
            break;
        case 'typing':
            indicator.classList.add('typing');
            dot.classList.add('status-typing');
            text.textContent = 'Typing...';
            break;
        case 'processing':
            indicator.classList.add('processing');
            dot.classList.add('status-processing');
            text.textContent = 'Processing...';
            break;
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    if (authToken) {
        showMainApp();
    } else {
        showAuthModal();
    }
    
    // Set initial status
    updateStatus('online');
    
    // Add typing detection for chat input
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        let typingTimeout;
        chatInput.addEventListener('input', () => {
            updateStatus('typing');
            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => {
                if (chatInput.value.trim() === '') {
                    updateStatus('online');
                }
            }, 1000);
        });
        
        chatInput.addEventListener('blur', () => {
            if (chatInput.value.trim() === '') {
                updateStatus('online');
            }
        });
    }
    
    // Add typing detection for code scanner
    const codeInput = document.getElementById('codeInput');
    if (codeInput) {
        let typingTimeout;
        codeInput.addEventListener('input', () => {
            updateStatus('typing');
            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => {
                if (codeInput.value.trim() === '') {
                    updateStatus('online');
                }
            }, 1000);
        });
        
        codeInput.addEventListener('blur', () => {
            if (codeInput.value.trim() === '') {
                updateStatus('online');
            }
        });
    }
    
    // Add typing detection for script generator
    const scriptTask = document.getElementById('scriptTask');
    if (scriptTask) {
        let typingTimeout;
        scriptTask.addEventListener('input', () => {
            updateStatus('typing');
            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => {
                if (scriptTask.value.trim() === '') {
                    updateStatus('online');
                }
            }, 1000);
        });
        
        scriptTask.addEventListener('blur', () => {
            if (scriptTask.value.trim() === '') {
                updateStatus('online');
            }
        });
    }
});

// Auth Functions
function showAuthModal() {
    document.getElementById('authModal').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
}

function showMainApp() {
    document.getElementById('authModal').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    document.getElementById('userName').textContent = currentUser.full_name || currentUser.email;
    document.getElementById('userRole').textContent = currentUser.role?.toUpperCase() || 'USER';
    
    // Show SOC Dashboard tab only for admin users
    const dashboardBtn = document.getElementById('dashboardTabBtn');
    if (currentUser.role === 'admin') {
        console.log('Admin user - showing SOC Dashboard');
        dashboardBtn.classList.remove('hidden');
    } else {
        console.log('Regular user - hiding SOC Dashboard');
        dashboardBtn.classList.add('hidden');
    }
    
    switchTab('chat');
}

function showLogin() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
}

function showRegister() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
}

// Handle API errors (including token expiration)
function handleApiError(error, response) {
    if (response && response.status === 401) {
        // Token expired or invalid - logout and show login
        alert('Your session has expired. Please login again.');
        logout();
        return true;
    }
    return false;
}

async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showAuthError('Please fill in all fields');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.access_token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showMainApp();
        } else {
            showAuthError(data.detail || 'Login failed');
        }
    } catch (error) {
        showAuthError('Connection error. Please try again.');
    }
}

async function register() {
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const full_name = document.getElementById('regName').value;
    
    if (!email || !password || !full_name) {
        showAuthError('Please fill in all fields');
        return;
    }
    
    // Validate email domain - only @gmail.com allowed
    if (!email.toLowerCase().endsWith('@gmail.com')) {
        showAuthError('Registration is only allowed with @gmail.com email addresses');
        return;
    }
    
    // Validate password length
    if (password.length < 8) {
        showAuthError('Password must be at least 8 characters');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, full_name })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Registration successful - show success message and switch to login
            alert('✅ Registration successful! Please login with your credentials.');
            
            // Clear registration form
            document.getElementById('regEmail').value = '';
            document.getElementById('regPassword').value = '';
            document.getElementById('regName').value = '';
            
            // Switch to login form
            showLogin();
            
            // Pre-fill email in login form for convenience
            document.getElementById('loginEmail').value = email;
            document.getElementById('loginPassword').focus();
        } else {
            showAuthError(data.detail || 'Registration failed');
        }
    } catch (error) {
        showAuthError('Connection error. Please try again.');
    }
}

function logout() {
    authToken = null;
    currentUser = {};
    chatSessionId = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    showAuthModal();
}

function showAuthError(message) {
    const errorDiv = document.getElementById('authError');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    setTimeout(() => errorDiv.classList.add('hidden'), 5000);
}

// Tab Management
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('border-b-2');
        btn.style.borderColor = '';
        btn.style.color = 'var(--text-muted)';
    });
    
    // Show selected tab
    document.getElementById(`${tabName}Tab`).classList.remove('hidden');
    const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
    activeBtn.classList.add('border-b-2');
    activeBtn.style.borderColor = 'var(--accent-primary)';
    activeBtn.style.color = 'var(--accent-primary)';
    
    // Load data for specific tabs
    if (tabName === 'dashboard' && currentUser.role === 'admin') {
        loadLogs();
    }
}

// Quick Search
function quickSearch(topic) {
    switchTab('chat');
    document.getElementById('chatInput').value = `Tell me about ${topic}`;
    sendChat();
}

// Show Security Tools Menu
function showSecurityTools() {
    switchTab('chat');
    
    const toolsMessage = `🛠️ Security Tools - Which tool would you like to learn about?

Click or type the tool name:

1️⃣ Metasploit - Penetration testing framework
2️⃣ Burp Suite - Web application security testing
3️⃣ Nmap - Network scanning and enumeration
4️⃣ Wireshark - Network protocol analyzer
5️⃣ Volatility - Memory forensics framework
6️⃣ John the Ripper - Password cracking tool

Just type the tool name (e.g., "Metasploit") and I'll provide detailed information!`;
    
    addChatMessage('assistant', toolsMessage);
}

// Show Cybersecurity News Sources
function showNewsSources() {
    switchTab('chat');
    
    const sourcesMessage = `📰 **Top Cybersecurity News Sources**

Here are the best sources for latest cybersecurity news and updates:

**🔥 Breaking News & Alerts:**
• **The Hacker News** - https://thehackernews.com/
• **BleepingComputer** - https://www.bleepingcomputer.com/
• **Threatpost** - https://threatpost.com/

**📊 Industry News & Analysis:**
• **CyberScoop** - https://www.cyberscoop.com/
• **SecurityWeek** - https://www.securityweek.com/
• **Dark Reading** - https://www.darkreading.com/

**🛡️ Vendor Security Bulletins:**
• **Microsoft Security** - https://msrc.microsoft.com/
• **Cisco Security** - https://sec.cloudapps.cisco.com/security/center/publicationListing.x
• **Adobe Security** - https://helpx.adobe.com/security.html

**🔍 Vulnerability Databases:**
• **CVE Details** - https://www.cvedetails.com/
• **NVD (NIST)** - https://nvd.nist.gov/
• **Exploit Database** - https://www.exploit-db.com/

**💡 Tip:** Bookmark these sources and check them daily for the latest threats, vulnerabilities, and security updates!`;
    
    addChatMessage('assistant', sourcesMessage);
}

// AI Chat
async function sendChat() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Update status to processing
    updateStatus('processing');
    
    // Add user message to chat
    addChatMessage('user', message);
    input.value = '';
    
    // Reset textarea height
    input.style.height = 'auto';
    input.style.height = '48px';
    
    // Show loading
    const loadingId = addChatMessage('assistant', 'Thinking...');
    
    try {
        const response = await fetch(`${API_BASE}/ai/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ 
                message,
                session_id: chatSessionId
            })
        });
        
        // Check for authentication error
        if (response.status === 401) {
            document.getElementById(loadingId).remove();
            handleApiError(null, response);
            updateStatus('online');
            return;
        }
        
        const data = await response.json();
        
        if (response.ok) {
            chatSessionId = data.session_id;
            // Remove loading message
            document.getElementById(loadingId).remove();
            // Add AI response
            addChatMessage('assistant', data.response);
            
            // Update status back to online
            updateStatus('online');
        } else {
            document.getElementById(loadingId).textContent = `Error: ${data.detail}`;
            updateStatus('online');
        }
    } catch (error) {
        document.getElementById(loadingId).textContent = 'Connection error. Please try again.';
        updateStatus('online');
    }
}

function addChatMessage(role, content) {
    const messagesDiv = document.getElementById('chatMessages');
    const messageId = `msg-${Date.now()}`;
    
    const messageDiv = document.createElement('div');
    messageDiv.id = messageId;
    messageDiv.className = `p-4 rounded fade-in ${role === 'user' ? 'ml-12' : 'mr-12'}`;
    messageDiv.style.backgroundColor = role === 'user' ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-tertiary)';
    
    const roleLabel = document.createElement('div');
    roleLabel.className = 'text-xs mb-1';
    roleLabel.style.color = 'var(--text-muted)';
    roleLabel.textContent = role === 'user' ? 'You' : 'Cyberix AI';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'text-sm whitespace-pre-wrap';
    contentDiv.style.color = 'var(--text-primary)';
    contentDiv.textContent = content;
    
    messageDiv.appendChild(roleLabel);
    messageDiv.appendChild(contentDiv);
    messagesDiv.appendChild(messageDiv);
    
    // Auto-resize chat area based on content
    const contentHeight = messagesDiv.scrollHeight;
    if (contentHeight < 200) {
        messagesDiv.style.height = '200px'; // Minimum height
    } else if (contentHeight > 600) {
        messagesDiv.style.height = '600px'; // Maximum height
    } else {
        messagesDiv.style.height = contentHeight + 'px'; // Auto height
    }
    
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    return messageId;
}

// Code Scanner
async function scanCode() {
    const code = document.getElementById('codeInput').value.trim();
    const language = document.getElementById('scanLanguage').value;
    const mode = document.getElementById('scanMode').value;
    
    if (!code) {
        alert('Please paste some code to analyze');
        return;
    }
    
    // Update status to processing
    updateStatus('processing');
    
    const resultsDiv = document.getElementById('scanResults');
    resultsDiv.innerHTML = '<div class="text-center text-gray-400">Analyzing code...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/ai/scan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ code, language, mode })
        });
        
        // Check for authentication error
        if (response.status === 401) {
            handleApiError(null, response);
            updateStatus('online');
            return;
        }
        
        const data = await response.json();
        
        if (response.ok) {
            displayScanResults(data);
            updateStatus('online');
        } else {
            resultsDiv.innerHTML = `<div class="text-red-400">Error: ${data.detail}</div>`;
            updateStatus('online');
        }
    } catch (error) {
        resultsDiv.innerHTML = '<div class="text-red-400">Connection error. Please try again.</div>';
        updateStatus('online');
    }
}

function displayScanResults(data) {
    const resultsDiv = document.getElementById('scanResults');
    
    let html = '<div class="space-y-4">';
    
    // Vulnerabilities
    if (data.vulnerabilities && data.vulnerabilities.length > 0) {
        html += '<div class="p-4 rounded" style="background: var(--bg-tertiary); border: 1px solid var(--border-color);"><h4 class="font-bold mb-3" style="color: var(--text-primary);">Vulnerabilities Found:</h4><div class="space-y-2">';
        data.vulnerabilities.forEach(vuln => {
            const severityColors = {
                'CRITICAL': '#ef4444',
                'HIGH': '#f97316',
                'MEDIUM': '#f59e0b',
                'LOW': '#3b82f6',
                'INFO': '#64748b'
            };
            const color = severityColors[vuln.severity] || '#64748b';
            
            html += `
                <div class="border-l-4 pl-3 py-2" style="border-color: ${color};">
                    <div class="font-semibold" style="color: ${color};">${vuln.severity}: ${vuln.type}</div>
                    <div class="text-sm" style="color: var(--text-secondary);">${vuln.description}</div>
                </div>
            `;
        });
        html += '</div></div>';
    }
    
    // Analysis
    html += `<div class="p-4 rounded" style="background: var(--bg-tertiary); border: 1px solid var(--border-color);"><h4 class="font-bold mb-3" style="color: var(--text-primary);">Analysis:</h4><pre class="text-sm whitespace-pre-wrap" style="color: var(--text-secondary);">${data.analysis}</pre></div>`;
    
    html += '</div>';
    resultsDiv.innerHTML = html;
}

// Script Generator
async function generateScript() {
    const task = document.getElementById('scriptTask').value.trim();
    const language = document.getElementById('scriptLanguage').value;
    
    if (!task) {
        alert('Please describe the script you need');
        return;
    }
    
    // Update status to processing
    updateStatus('processing');
    
    const resultsDiv = document.getElementById('scriptResults');
    resultsDiv.innerHTML = '<div class="text-center text-gray-400">Generating script...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/ai/script`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ task, language })
        });
        
        // Check for authentication error
        if (response.status === 401) {
            handleApiError(null, response);
            updateStatus('online');
            return;
        }
        
        const data = await response.json();
        
        if (response.ok) {
            displayScriptResults(data);
            updateStatus('online');
        } else {
            resultsDiv.innerHTML = `<div class="text-red-400">Error: ${data.detail}</div>`;
            updateStatus('online');
        }
    } catch (error) {
        resultsDiv.innerHTML = '<div class="text-red-400">Connection error. Please try again.</div>';
        updateStatus('online');
    }
}

function displayScriptResults(data) {
    const resultsDiv = document.getElementById('scriptResults');
    
    const html = `
        <div class="space-y-4">
            <div class="p-4 rounded" style="background: rgba(239, 68, 68, 0.1); border: 2px solid #ef4444;">
                <div class="font-bold mb-2" style="color: #ef4444;">⚠️ ETHICAL USE WARNING</div>
                <div class="text-sm" style="color: #ef4444;">${data.warning}</div>
            </div>
            <div class="p-4 rounded" style="background: var(--bg-tertiary); border: 1px solid var(--border-color);">
                <div class="flex justify-between items-center mb-3">
                    <h4 class="font-bold" style="color: var(--text-primary);">Generated Script:</h4>
                    <button onclick="copyScript()" class="btn-primary text-sm">Copy</button>
                </div>
                <pre id="generatedScript" class="p-4 rounded text-sm overflow-x-auto font-mono" style="background: var(--bg-primary); color: var(--text-primary); border: 1px solid var(--border-color);"><code>${escapeHtml(data.script)}</code></pre>
            </div>
            <div class="p-4 rounded" style="background: var(--bg-tertiary); border: 1px solid var(--border-color);">
                <h4 class="font-bold mb-3" style="color: var(--text-primary);">Usage Instructions:</h4>
                <pre class="text-sm whitespace-pre-wrap" style="color: var(--text-secondary);">${escapeHtml(data.usage)}</pre>
            </div>
        </div>
    `;
    
    resultsDiv.innerHTML = html;
}

function copyScript() {
    const scriptText = document.getElementById('generatedScript').textContent;
    navigator.clipboard.writeText(scriptText).then(() => {
        alert('Script copied to clipboard!');
    });
}

// SOC Dashboard
async function loadLogs() {
    if (currentUser.role !== 'admin') {
        document.getElementById('logsList').innerHTML = '<div class="text-red-400 text-center p-8">⚠️ Admin access required to view security logs</div>';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/logs?limit=50`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        // Check for authentication error
        if (response.status === 401) {
            handleApiError(null, response);
            return;
        }
        
        const logs = await response.json();
        
        if (response.ok) {
            displayLogs(logs);
        } else {
            document.getElementById('logsList').innerHTML = `<div class="text-red-400">Error loading logs: ${logs.detail || 'Access denied'}</div>`;
        }
    } catch (error) {
        document.getElementById('logsList').innerHTML = '<div class="text-red-400">Connection error</div>';
    }
}

function displayLogs(logs) {
    // Update counters
    const critical = logs.filter(l => l.severity === 'critical').length;
    const warning = logs.filter(l => l.severity === 'warning').length;
    const info = logs.filter(l => l.severity === 'info').length;
    
    document.getElementById('criticalCount').textContent = critical;
    document.getElementById('warningCount').textContent = warning;
    document.getElementById('infoCount').textContent = info;
    
    // Display logs
    const logsDiv = document.getElementById('logsList');
    
    if (logs.length === 0) {
        logsDiv.innerHTML = '<div class="text-center p-8" style="color: var(--text-muted);">No logs found</div>';
        return;
    }
    
    let html = '';
    logs.forEach(log => {
        const severityColor = {
            'critical': '#ef4444',
            'warning': '#f59e0b',
            'info': '#3b82f6'
        }[log.severity] || '#64748b';
        
        const timestamp = new Date(log.timestamp).toLocaleString();
        
        html += `
            <div class="log-item fade-in" style="border-left-color: ${severityColor};">
                <div class="flex justify-between items-start mb-2">
                    <span class="font-semibold" style="color: ${severityColor};">${log.event_type}</span>
                    <span class="text-xs log-time">${timestamp}</span>
                </div>
                <div class="text-sm">${log.details || 'No details'}</div>
                ${log.user_email ? `<div class="text-xs log-user mt-1">User: ${log.user_email}</div>` : ''}
                ${log.ip_address ? `<div class="text-xs log-user">IP: ${log.ip_address}</div>` : ''}
            </div>
        `;
    });
    
    logsDiv.innerHTML = html;
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


// File Upload Handlers
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            alert('Image file is too large. Maximum size is 10MB.');
            return;
        }
        currentAttachment = {
            type: 'image',
            file: file,
            name: file.name
        };
        showAttachmentPreview(file.name, '🖼️');
    }
}

function handleDocUpload(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            alert('Document file is too large. Maximum size is 10MB.');
            return;
        }
        currentAttachment = {
            type: 'document',
            file: file,
            name: file.name
        };
        showAttachmentPreview(file.name, '📄');
    }
}

function showAttachmentPreview(fileName, icon) {
    const preview = document.getElementById('attachmentPreview');
    const nameSpan = document.getElementById('attachmentName');
    nameSpan.textContent = `${icon} ${fileName}`;
    preview.classList.remove('hidden');
}

function clearAttachment() {
    currentAttachment = null;
    document.getElementById('attachmentPreview').classList.add('hidden');
    document.getElementById('imageUpload').value = '';
    document.getElementById('docUpload').value = '';
}

// Modified sendChat to handle attachments
async function sendChatWithAttachment() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message && !currentAttachment) return;
    
    // Add user message to chat
    let displayMessage = message;
    if (currentAttachment) {
        displayMessage = `${currentAttachment.type === 'image' ? '🖼️' : '📄'} ${currentAttachment.name}\n${message}`;
    }
    addChatMessage('user', displayMessage);
    input.value = '';
    
    // Show loading
    const loadingId = addChatMessage('assistant', 'Analyzing your file and thinking...');
    
    try {
        // For now, simulate file processing
        // In production, you would upload the file to the backend
        let enhancedMessage = message;
        if (currentAttachment) {
            enhancedMessage = `[User uploaded a ${currentAttachment.type}: ${currentAttachment.name}] ${message}`;
        }
        
        const response = await fetch(`${API_BASE}/ai/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ 
                message: enhancedMessage,
                session_id: chatSessionId
            })
        });
        
        // Check for authentication error
        if (response.status === 401) {
            document.getElementById(loadingId).remove();
            handleApiError(null, response);
            return;
        }
        
        const data = await response.json();
        
        if (response.ok) {
            chatSessionId = data.session_id;
            // Remove loading message
            document.getElementById(loadingId).remove();
            // Add AI response
            addChatMessage('assistant', data.response);
        } else {
            document.getElementById(loadingId).textContent = `Error: ${data.detail}`;
        }
    } catch (error) {
        document.getElementById(loadingId).textContent = 'Connection error. Please try again.';
    }
    
    // Clear attachment after sending
    clearAttachment();
}

// Update the original sendChat to use the new function
const originalSendChat = sendChat;
sendChat = function() {
    if (currentAttachment) {
        sendChatWithAttachment();
    } else {
        originalSendChat();
    }
};
