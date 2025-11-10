// Configuration
const BACKEND_URL = ''; // Set your Render backend URL here

// Theme Management
const themeBtn = document.getElementById('themeBtn');
const html = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeBtn.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    themeBtn.textContent = theme === 'light' ? '🌙' : '☀️';
}

// Navigation
const navBtns = document.querySelectorAll('.nav-btn');
const pages = document.querySelectorAll('.page');

navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetPage = btn.dataset.page;
        
        // Update active nav button
        navBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Show target page
        pages.forEach(p => p.classList.remove('active'));
        document.getElementById(targetPage).classList.add('active');
    });
});

// Analytics Data
const analytics = {
    totalIdeas: 0,
    totalContent: 0,
    totalScheduled: 0
};

function updateAnalytics() {
    document.getElementById('totalIdeas').textContent = analytics.totalIdeas;
    document.getElementById('totalContent').textContent = analytics.totalContent;
    document.getElementById('totalScheduled').textContent = analytics.totalScheduled;
}

// Load analytics from localStorage
function loadAnalytics() {
    const saved = localStorage.getItem('analytics');
    if (saved) {
        Object.assign(analytics, JSON.parse(saved));
        updateAnalytics();
    }
}

function saveAnalytics() {
    localStorage.setItem('analytics', JSON.stringify(analytics));
}

loadAnalytics();

// Idea Generator
const generateIdeasBtn = document.getElementById('generateIdeasBtn');
const ideasOutput = document.getElementById('ideasOutput');
const ideasList = document.getElementById('ideasList');

generateIdeasBtn.addEventListener('click', async () => {
    const topic = document.getElementById('ideaTopic').value;
    const audience = document.getElementById('ideaAudience').value;
    
    if (!topic) {
        alert('Please enter a topic');
        return;
    }
    
    generateIdeasBtn.textContent = 'Generating...';
    generateIdeasBtn.disabled = true;
    
    const ideas = await generateIdeas(topic, audience);
    displayIdeas(ideas);
    
    analytics.totalIdeas += ideas.length;
    updateAnalytics();
    saveAnalytics();
    
    generateIdeasBtn.textContent = 'Generate Ideas';
    generateIdeasBtn.disabled = false;
});

async function generateIdeas(topic, audience) {
    // If backend is configured, use it
    if (BACKEND_URL) {
        try {
            const response = await fetch(`${BACKEND_URL}/api/web-search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: `${topic} content ideas for ${audience}`, num_results: 5 })
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.results.map(r => ({
                    title: r.title,
                    description: r.snippet,
                    value: 'Based on current trends'
                }));
            }
        } catch (error) {
            console.log('Backend not available, using templates');
        }
    }
    
    // Template-based ideas
    const templates = [
        {
            title: `Top 10 ${topic} Trends in 2024`,
            description: `Explore the latest trends and innovations in ${topic} that are shaping the industry.`,
            value: `Perfect for ${audience} looking to stay ahead of the curve`
        },
        {
            title: `Complete Guide to ${topic} for Beginners`,
            description: `A comprehensive introduction covering everything you need to know about ${topic}.`,
            value: `Great for educating ${audience} who are just starting out`
        },
        {
            title: `${topic} Best Practices and Tips`,
            description: `Proven strategies and actionable tips to improve your ${topic} skills.`,
            value: `Valuable insights for ${audience} at any level`
        },
        {
            title: `Common ${topic} Mistakes to Avoid`,
            description: `Learn from others' mistakes and avoid common pitfalls in ${topic}.`,
            value: `Helps ${audience} save time and avoid frustration`
        },
        {
            title: `Future of ${topic}: What to Expect`,
            description: `Predictions and insights about where ${topic} is heading in the coming years.`,
            value: `Forward-thinking content for ${audience} planning ahead`
        }
    ];
    
    return templates;
}

function displayIdeas(ideas) {
    ideasList.innerHTML = ideas.map(idea => `
        <div class="idea-item">
            <div class="idea-title">${idea.title}</div>
            <div class="idea-description">${idea.description}</div>
            <div class="idea-value">💡 ${idea.value}</div>
        </div>
    `).join('');
    
    ideasOutput.style.display = 'block';
}

// Content Writer
const generateContentBtn = document.getElementById('generateContentBtn');
const contentOutput = document.getElementById('contentOutput');
const contentPreview = document.getElementById('contentPreview');
const copyContentBtn = document.getElementById('copyContentBtn');

generateContentBtn.addEventListener('click', () => {
    const title = document.getElementById('contentTitle').value;
    const type = document.getElementById('contentType').value;
    const wordCount = document.getElementById('wordCount').value;
    
    if (!title) {
        alert('Please enter a content title');
        return;
    }
    
    generateContentBtn.textContent = 'Generating...';
    generateContentBtn.disabled = true;
    
    setTimeout(() => {
        const content = generateContent(title, type, wordCount);
        displayContent(content);
        
        analytics.totalContent++;
        updateAnalytics();
        saveAnalytics();
        
        generateContentBtn.textContent = 'Generate Content';
        generateContentBtn.disabled = false;
    }, 1000);
});

function generateContent(title, type, wordCount) {
    const intro = `${title}\n\n`;
    const body = `This is a ${type} about ${title}. ` + 
                 `In this comprehensive piece, we'll explore the key aspects, benefits, and practical applications. `.repeat(Math.ceil(wordCount / 100));
    
    return intro + body.substring(0, wordCount * 5);
}

function displayContent(content) {
    contentPreview.textContent = content;
    contentOutput.style.display = 'block';
}

copyContentBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(contentPreview.textContent);
    copyContentBtn.textContent = '✅ Copied!';
    setTimeout(() => {
        copyContentBtn.textContent = '📋 Copy';
    }, 2000);
});

// SEO Analyzer
const analyzeSeoBtn = document.getElementById('analyzeSeoBtn');
const seoOutput = document.getElementById('seoOutput');

analyzeSeoBtn.addEventListener('click', () => {
    const content = document.getElementById('seoContent').value;
    const keyword = document.getElementById('seoKeyword').value;
    
    if (!content || !keyword) {
        alert('Please enter both content and keyword');
        return;
    }
    
    analyzeSeoBtn.textContent = 'Analyzing...';
    analyzeSeoBtn.disabled = true;
    
    setTimeout(() => {
        const analysis = analyzeSEO(content, keyword);
        displaySEO(analysis);
        
        analyzeSeoBtn.textContent = 'Analyze SEO';
        analyzeSeoBtn.disabled = false;
    }, 1000);
});

function analyzeSEO(content, keyword) {
    const wordCount = content.split(/\s+/).length;
    const keywordCount = (content.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
    const keywordDensity = ((keywordCount / wordCount) * 100).toFixed(2);
    
    let score = 0;
    
    // Word count score
    if (wordCount >= 300) score += 25;
    
    // Keyword density score
    if (keywordDensity >= 1 && keywordDensity <= 3) score += 25;
    
    // Keyword in first 100 words
    if (content.substring(0, 500).toLowerCase().includes(keyword.toLowerCase())) score += 25;
    
    // Content length bonus
    if (wordCount >= 1000) score += 25;
    
    return {
        score,
        wordCount,
        keywordCount,
        keywordDensity,
        metrics: [
            { label: 'Word Count', value: wordCount, status: wordCount >= 300 ? '✅' : '⚠️' },
            { label: 'Keyword Density', value: `${keywordDensity}%`, status: keywordDensity >= 1 && keywordDensity <= 3 ? '✅' : '⚠️' },
            { label: 'Keyword Mentions', value: keywordCount, status: keywordCount > 0 ? '✅' : '⚠️' }
        ]
    };
}

function displaySEO(analysis) {
    document.getElementById('seoScoreValue').textContent = analysis.score;
    
    const metricsHTML = analysis.metrics.map(m => `
        <div class="seo-metric">
            <span>${m.label}: ${m.value}</span>
            <span>${m.status}</span>
        </div>
    `).join('');
    
    document.getElementById('seoMetrics').innerHTML = metricsHTML;
    seoOutput.style.display = 'block';
}

// Calendar
const addPostBtn = document.getElementById('addPostBtn');
const scheduleModal = document.getElementById('scheduleModal');
const closeModal = document.getElementById('closeModal');
const cancelSchedule = document.getElementById('cancelSchedule');
const saveSchedule = document.getElementById('saveSchedule');
const calendarList = document.getElementById('calendarList');

let scheduledPosts = JSON.parse(localStorage.getItem('scheduledPosts') || '[]');

addPostBtn.addEventListener('click', () => {
    scheduleModal.style.display = 'flex';
});

closeModal.addEventListener('click', () => {
    scheduleModal.style.display = 'none';
});

cancelSchedule.addEventListener('click', () => {
    scheduleModal.style.display = 'none';
});

saveSchedule.addEventListener('click', () => {
    const title = document.getElementById('postTitle').value;
    const platform = document.getElementById('postPlatform').value;
    const date = document.getElementById('postDate').value;
    const time = document.getElementById('postTime').value;
    
    if (!title || !date || !time) {
        alert('Please fill in all fields');
        return;
    }
    
    const post = {
        id: Date.now(),
        title,
        platform,
        date,
        time
    };
    
    scheduledPosts.push(post);
    localStorage.setItem('scheduledPosts', JSON.stringify(scheduledPosts));
    
    analytics.totalScheduled = scheduledPosts.length;
    updateAnalytics();
    saveAnalytics();
    
    displayCalendar();
    scheduleModal.style.display = 'none';
    
    // Clear form
    document.getElementById('postTitle').value = '';
    document.getElementById('postDate').value = '';
    document.getElementById('postTime').value = '';
});

function displayCalendar() {
    if (scheduledPosts.length === 0) {
        calendarList.innerHTML = '<p class="empty-state">No scheduled posts yet. Click "Schedule Post" to get started!</p>';
        return;
    }
    
    calendarList.innerHTML = scheduledPosts.map(post => `
        <div class="calendar-item">
            <div class="calendar-info">
                <h4>${post.title}</h4>
                <div class="calendar-meta">
                    ${post.platform} • ${post.date} at ${post.time}
                </div>
            </div>
            <button class="delete-btn" onclick="deletePost(${post.id})">Delete</button>
        </div>
    `).join('');
}

function deletePost(id) {
    scheduledPosts = scheduledPosts.filter(p => p.id !== id);
    localStorage.setItem('scheduledPosts', JSON.stringify(scheduledPosts));
    
    analytics.totalScheduled = scheduledPosts.length;
    updateAnalytics();
    saveAnalytics();
    
    displayCalendar();
}

displayCalendar();

// Hashtag Generator
const generateHashtagsBtn = document.getElementById('generateHashtagsBtn');
const hashtagOutput = document.getElementById('hashtagOutput');
const hashtagsList = document.getElementById('hashtagsList');
const copyHashtagsBtn = document.getElementById('copyHashtagsBtn');

generateHashtagsBtn.addEventListener('click', () => {
    const topic = document.getElementById('hashtagTopic').value;
    const platform = document.getElementById('hashtagPlatform').value;
    const count = parseInt(document.getElementById('hashtagCount').value);
    
    if (!topic) {
        alert('Please enter a topic');
        return;
    }
    
    generateHashtagsBtn.textContent = 'Generating...';
    generateHashtagsBtn.disabled = true;
    
    setTimeout(() => {
        const hashtags = generateHashtags(topic, platform, count);
        displayHashtags(hashtags);
        
        generateHashtagsBtn.textContent = 'Generate Hashtags';
        generateHashtagsBtn.disabled = false;
    }, 500);
});

function generateHashtags(topic, platform, count) {
    const words = topic.split(' ');
    const hashtags = [];
    
    // Add main topic hashtags
    hashtags.push(`#${topic.replace(/\s+/g, '')}`);
    words.forEach(word => {
        if (word.length > 3) {
            hashtags.push(`#${word}`);
        }
    });
    
    // Add platform-specific hashtags
    const platformTags = {
        instagram: ['#instagood', '#photooftheday', '#instadaily', '#picoftheday'],
        twitter: ['#trending', '#viral', '#news', '#update'],
        linkedin: ['#professional', '#business', '#career', '#networking'],
        tiktok: ['#fyp', '#foryou', '#viral', '#trending']
    };
    
    hashtags.push(...platformTags[platform]);
    
    // Add generic popular hashtags
    const generic = ['#content', '#digital', '#online', '#social', '#media', '#marketing', 
                     '#tips', '#guide', '#howto', '#tutorial', '#learn', '#education'];
    
    hashtags.push(...generic);
    
    // Return unique hashtags up to count
    return [...new Set(hashtags)].slice(0, count);
}

function displayHashtags(hashtags) {
    hashtagsList.innerHTML = `
        <div class="hashtags-grid">
            ${hashtags.map(tag => `<span class="hashtag-tag">${tag}</span>`).join('')}
        </div>
    `;
    hashtagOutput.style.display = 'block';
}

copyHashtagsBtn.addEventListener('click', () => {
    const hashtags = Array.from(document.querySelectorAll('.hashtag-tag'))
        .map(tag => tag.textContent)
        .join(' ');
    
    navigator.clipboard.writeText(hashtags);
    copyHashtagsBtn.textContent = '✅ Copied!';
    setTimeout(() => {
        copyHashtagsBtn.textContent = '📋 Copy All';
    }, 2000);
});

console.log('✅ Content Studio Pro loaded successfully!');