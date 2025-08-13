class XLikeViewer {
    constructor() {
        this.likes = [];
        this.currentIndex = 0;
        this.isProcessing = false;
        this.twitterWidgetLoaded = false;
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        $('#fileInput').on('change', (e) => {
            this.handleFileSelect(e);
        });
        
        $('#fileInput').on('click', (e) => {
        });
        
        $('#chooseFileBtn').on('click', (e) => {
        });
        
        $('#prevBtn').on('click', () => this.previousTweet());
        $('#nextBtn').on('click', () => this.nextTweet());
        $('#randomBtn').on('click', () => this.randomTweet());
        
        $('#loadDifferentFileBtn').on('click', () => this.loadDifferentFile());
        
        $('#closeUsageBtn').on('click', () => this.closeUsageSection());
        
        $(document).on('keydown', (e) => this.handleKeyboardNavigation(e));
        
        this.setupDragAndDrop();
        this.checkUsageSectionVisibility();
    }

    setupDragAndDrop() {
        const uploadArea = $('#uploadArea');
        const fileInput = $('#fileInput');
        
        uploadArea.on('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.addClass('dragover');
        });
        
        uploadArea.on('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.removeClass('dragover');
        });
        
        uploadArea.on('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.removeClass('dragover');
            
            const files = e.originalEvent.dataTransfer.files;
            if (files.length > 0) {
                this.processFile(files[0]);
            }
        });
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file && !this.isProcessing) {
            this.processFile(file);
        }
    }

    async processFile(file) {
        if (this.isProcessing) {
            return;
        }
        
        this.isProcessing = true;
        this.showLoading();
        this.hideError();
        
        try {
            if (!file.name.endsWith('.js')) {
                throw new Error('Please select a .js file');
            }
            
            const content = await this.readFileContent(file);
            
            const likes = this.parseLikesFile(content);
            
            this.likes = likes;
            this.currentIndex = 0;
            
            this.hideLoading();
            this.showTweetViewer();
            this.updateFileInfo(file.name, likes.length);
            this.loadCurrentTweet();
            this.updateNavigationButtons();
            this.hideUploadSection();
            
        } catch (error) {
            this.hideLoading();
            this.showError(error.message);
        } finally {
            this.isProcessing = false;
        }
    }

    readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                resolve(e.target.result);
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsText(file);
        });
    }

    parseLikesFile(content) {
        try {
            console.log('=== Starting parseLikesFile ===');
            console.log('Content length:', content.length);
            console.log('Content preview (first 500 chars):', content.substring(0, 500));
            console.log('Content preview (last 500 chars):', content.substring(Math.max(0, content.length - 500)));
            
            let match = null;
            
            // First try to find the assignment pattern on the first line only
            const firstLine = content.split('\n')[0];
            const assignmentPattern = /window\.YTD\.like\.part\d+\s*=\s*/;
            match = firstLine.match(assignmentPattern);
            
            if (match) {
                console.log('Found assignment pattern on first line, using bracket counting...');
                // Since we matched on the first line, we need to find the bracket in the full content
                // The assignment pattern should be at the beginning of the file
                const assignmentStart = match[0].length;
                console.log('Assignment starts at index:', assignmentStart);
                
                // Find the opening bracket after the assignment in the full content
                const bracketStart = content.indexOf('[', assignmentStart);
                console.log('Found "[" at index:', bracketStart);
                
                if (bracketStart !== -1) {
                    let bracketCount = 0;
                    let bracketEnd = -1;
                    let inString = false;
                    let escapeNext = false;
                    
                    for (let i = bracketStart; i < content.length; i++) {
                        const char = content[i];
                        
                        if (escapeNext) {
                            escapeNext = false;
                            continue;
                        }
                        
                        if (char === '\\') {
                            escapeNext = true;
                            continue;
                        }
                        
                        if (char === '"' && !escapeNext) {
                            inString = !inString;
                            continue;
                        }
                        
                        if (!inString) {
                            if (char === '[') {
                                bracketCount++;
                            } else if (char === ']') {
                                bracketCount--;
                                if (bracketCount === 0) {
                                    bracketEnd = i;
                                    break;
                                }
                            }
                        }
                    }
                    
                    console.log('Bracket matching result - bracketEnd:', bracketEnd);
                    
                    if (bracketEnd !== -1) {
                        const arrayString = content.substring(bracketStart, bracketEnd + 1);
                        console.log('Extracted array string length:', arrayString.length);
                        console.log('Array string preview:', arrayString.substring(0, 200) + '...');
                        match = [null, arrayString];
                    }
                }
            }
            
            // Fallback to regex patterns if bracket counting fails
            if (!match) {
                console.log('Bracket counting failed, trying regex patterns...');
                const patterns = [
                    /window\.YTD\.like\.part\d+\s*=\s*(\[[\s\S]*?\]);/,
                    /window\.YTD\.like\.part\d+\s*=\s*(\[.*\]);/s,
                    /window\.YTD\.like\.part\d+\s*=\s*(\[.*\]);/
                ];
                
                console.log('Testing regex patterns...');
                for (let i = 0; i < patterns.length; i++) {
                    const pattern = patterns[i];
                    console.log(`Testing pattern ${i + 1}:`, pattern);
                    match = content.match(pattern);
                    if (match) {
                        console.log(`Pattern ${i + 1} matched!`);
                        console.log('Match groups:', match);
                        break;
                    } else {
                        console.log(`Pattern ${i + 1} did not match`);
                    }
                }
            }
            

            
            if (!match) {
                console.error('=== PARSING FAILED ===');
                console.error('No valid match found for window.YTD.like.part pattern');
                console.error('Content contains "window.YTD.like.part":', content.includes('window.YTD.like.part'));
                console.error('Content contains "window.YTD.like":', content.includes('window.YTD.like'));
                console.error('Content contains "YTD":', content.includes('YTD'));
                console.error('Content contains "like":', content.includes('like'));
                console.error('Content contains "part":', content.includes('part'));
                console.error('Content contains "=":', content.includes('='));
                console.error('Content contains "[":', content.includes('['));
                console.error('Content contains "]":', content.includes(']'));
                throw new Error('Invalid file format. Expected window.YTD.like.part0 = [...]');
            }
            
            const arrayString = match[1];
            console.log('Attempting to parse JSON...');
            console.log('Array string length:', arrayString.length);
            console.log('Array string starts with:', arrayString.substring(0, 100));
            console.log('Array string ends with:', arrayString.substring(Math.max(0, arrayString.length - 100)));

            const likesArray = JSON.parse(arrayString);
            console.log('JSON parsed successfully!');
            console.log('Likes array length:', likesArray.length);
            console.log('First item preview:', likesArray[0]);
            
            const likes = [];
            
            console.log('Processing likes array...');
            for (let i = 0; i < likesArray.length; i++) {
                const item = likesArray[i];
                
                if (item.like && item.like.tweetId && item.like.expandedUrl) {
                    const like = {
                        tweetId: item.like.tweetId,
                        fullText: item.like.fullText || '',
                        expandedUrl: item.like.expandedUrl
                    };
                    likes.push(like);
                } else {
                    console.log(`Item ${i} skipped - missing required fields:`, {
                        hasLike: !!item.like,
                        hasTweetId: !!(item.like && item.like.tweetId),
                        hasExpandedUrl: !!(item.like && item.like.expandedUrl),
                        item: item
                    });
                }
            }
            
            console.log('=== parseLikesFile completed successfully ===');
            console.log('Final likes count:', likes.length);
            return likes;
            
        } catch (error) {
            console.error('=== PARSING ERROR DETAILS ===');
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            
            if (error instanceof SyntaxError) {
                console.error('JSON Syntax Error detected');
                console.error('This usually means the extracted array string is not valid JSON');
                console.error('Check if the array extraction logic is working correctly');
            }
            
            console.error('Content analysis:');
            console.error('- Total length:', content.length);
            console.error('- Contains "window.YTD.like.part":', content.includes('window.YTD.like.part'));
            console.error('- Contains "window.YTD.like":', content.includes('window.YTD.like'));
            console.error('- Contains "YTD":', content.includes('YTD'));
            console.error('- Contains "like":', content.includes('like'));
            console.error('- Contains "part":', content.includes('part'));
            console.error('- Contains "=":', content.includes('='));
            console.error('- Contains "[":', content.includes('['));
            console.error('- Contains "]":', content.includes(']'));
            console.error('- Contains "tweetId":', content.includes('tweetId'));
            console.error('- Contains "expandedUrl":', content.includes('expandedUrl'));
            
            // Try to find any JSON-like structures
            const jsonMatches = content.match(/\{[^{}]*\}/g);
            if (jsonMatches) {
                console.error('Found potential JSON objects:', jsonMatches.length);
                console.error('First few JSON-like objects:', jsonMatches.slice(0, 3));
            }
            
            throw new Error('Failed to parse like.js file. Please make sure this is a valid file from your X archive.');
        }
    }

    loadCurrentTweet() {
        if (this.likes.length === 0) return;
        
        const currentLike = this.likes[this.currentIndex];
        this.embedTweet(currentLike.tweetId, currentLike.expandedUrl);
        this.updateCurrentIndex();
    }

    embedTweet(tweetId, fallbackUrl) {
        const container = $('#tweetEmbedContainer');
        
        container.empty();
        
        const currentLike = this.likes[this.currentIndex];
        if (!currentLike) {
            return;
        }
        
        const loadingHtml = `
            <div class="tweet-embed-wrapper">
                <div class="tweet-loading">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading post...</span>
                    </div>
                    <p class="text-muted mt-2">Loading post...</p>
                </div>
            </div>
        `;
        
        container.html(loadingHtml);
        
        this.fetchTweetOEmbed(fallbackUrl, container);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    getCorrectTweetUrl(originalUrl, callback) {
        const tweetIdMatch = originalUrl.match(/\/status\/(\d+)/);
        if (!tweetIdMatch) {
            callback(originalUrl);
            return;
        }
        
        const tweetId = tweetIdMatch[1];
        const correctUrl = `https://twitter.com/anyuser/status/${tweetId}`;
        
        callback(correctUrl);
    }
    
    fetchTweetOEmbed(tweetUrl, container) {
        this.getCorrectTweetUrl(tweetUrl, (correctUrl) => {
            const oEmbedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(correctUrl)}&partner=&hide_thread=false`;
            
            $.ajax({
                url: oEmbedUrl,
                method: 'GET',
                dataType: 'jsonp',
                success: (data) => {
                    if (data && data.html) {
                        container.find('.tweet-loading').hide();
                        
                        const embedHtml = `
                            <div class="tweet-embed-content">
                                ${data.html}
                            </div>
                        `;
                        
                        container.append(embedHtml);
                        
                        this.loadTwitterWidget();
                    } else {
                        this.showTweetFallback(container);
                    }
                },
                error: (xhr, status, error) => {
                    this.showTweetFallback(container);
                }
            });
        });
    }
    
    showTweetFallback(container) {
        const currentLike = this.likes[this.currentIndex];
        if (currentLike) {
            const postText = currentLike.fullText || 'Post content not available';
            const postId = currentLike.tweetId;
            const fallbackUrl = currentLike.expandedUrl;
            
            container.find('.tweet-loading').hide();
            
            const fallbackHtml = `
                <div class="tweet-fallback-card">
                    <div class="tweet-header">
                        <div class="tweet-avatar">
                            <i class="bi bi-person-circle text-primary"></i>
                        </div>
                        <div class="tweet-user-info">
                            <div class="tweet-username">@user</div>
                            <div class="tweet-timestamp">Post ID: ${postId}</div>
                        </div>
                        <div class="tweet-platform">
                            <i class="bi bi-twitter-x text-dark"></i>
                        </div>
                    </div>
                    <div class="tweet-content">
                        <p class="tweet-text">${this.escapeHtml(postText)}</p>
                    </div>
                    <div class="tweet-actions">
                        <a href="${fallbackUrl}" target="_blank" class="btn btn-outline-primary btn-sm">
                            <i class="bi bi-box-arrow-up-right me-1"></i>View on X
                        </a>
                    </div>
                </div>
            `;
            
            container.append(fallbackHtml);
        }
    }
    
    loadTwitterWidget() {
        if (window.twttr && window.twttr.widgets) {
            window.twttr.widgets.load();
            return;
        }
        
        if (!document.querySelector('script[src*="platform.twitter.com/widgets.js"]')) {
            const script = document.createElement('script');
            script.src = 'https://platform.twitter.com/widgets.js';
            script.charset = 'utf-8';
            script.async = true;
            script.onload = () => {
                if (window.twttr && window.twttr.widgets) {
                    window.twttr.widgets.load();
                }
            };
            document.head.appendChild(script);
        } else {
            const checkWidgets = () => {
                if (window.twttr && window.twttr.widgets) {
                    window.twttr.widgets.load();
                } else {
                    setTimeout(checkWidgets, 100);
                }
            };
            setTimeout(checkWidgets, 100);
        }
    }
    
    setCookie(name, value, days = 365) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    }
    
    getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }
    
    closeUsageSection() {
        $('#usageSection').hide();
        this.setCookie('usageSectionHidden', 'true', 365);
    }
    
    checkUsageSectionVisibility() {
        const isHidden = this.getCookie('usageSectionHidden');
        if (isHidden === 'true') {
            $('#usageSection').hide();
        }
    }

    previousTweet() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.loadCurrentTweet();
            this.updateNavigationButtons();
        }
    }

    nextTweet() {
        if (this.currentIndex < this.likes.length - 1) {
            this.currentIndex++;
            this.loadCurrentTweet();
            this.updateNavigationButtons();
        }
    }

    randomTweet() {
        if (this.likes.length === 0) return;
        
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.likes.length);
        } while (newIndex === this.currentIndex && this.likes.length > 1);
        
        this.currentIndex = newIndex;
        this.loadCurrentTweet();
        this.updateNavigationButtons();
    }

    handleKeyboardNavigation(event) {
        if (this.likes.length === 0) return;
        
        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                this.previousTweet();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.nextTweet();
                break;
            case ' ':
                event.preventDefault();
                this.randomTweet();
                break;
        }
    }

    updateNavigationButtons() {
        const hasLikes = this.likes.length > 0;
        const isFirst = this.currentIndex === 0;
        const isLast = this.currentIndex === this.likes.length - 1;
        
        $('#prevBtn').prop('disabled', !hasLikes || isFirst);
        $('#nextBtn').prop('disabled', !hasLikes || isLast);
        $('#randomBtn').prop('disabled', !hasLikes || this.likes.length === 1);
    }

    updateCurrentIndex() {
        $('#currentIndex').text(this.currentIndex + 1);
        $('#totalCount').text(this.likes.length);
    }

    updateFileInfo(fileName, likesCount) {
        $('#fileName').text(fileName);
        $('#likesCount').text(likesCount.toLocaleString());
        $('#fileInfo').show();
    }
    
    hideFileInfo() {
        $('#fileInfo').hide();
    }

    showLoading() {
        $('#loadingSection').show();
        $('#uploadSection').hide();
    }

    hideLoading() {
        $('#loadingSection').hide();
        $('#uploadSection').show();
    }

    showTweetViewer() {
        const tweetSection = $('#tweetSection');
        if (tweetSection.length > 0) {
            tweetSection.show();
            tweetSection.removeClass('hidden');
            $('#loadDifferentFileBtn').show();
        }
    }
    
    hideTweetViewer() {
        $('#tweetSection').hide();
        $('#tweetSection').addClass('hidden');
    }
    
    hideUploadSection() {
        const uploadSection = $('#uploadSection');
        if (uploadSection.length > 0) {
            uploadSection.hide();
            uploadSection.addClass('hidden');
        }
    }
    
    showUploadSection() {
        const uploadSection = $('#uploadSection');
        uploadSection.show();
        uploadSection.removeClass('hidden');
    }
    
    loadDifferentFile() {
        this.likes = [];
        this.currentIndex = 0;
        
        this.hideTweetViewer();
        this.showUploadSection();
        this.hideFileInfo();
        this.hideError();
        
        $('#loadDifferentFileBtn').hide();
        $('#fileInput').val('');
    }

    showError(message) {
        $('#errorText').text(message);
        $('#errorMessage').show();
    }

    hideError() {
        $('#errorMessage').hide();
    }
    
    destroy() {
        const uploadArea = $('#uploadArea');
        const fileInput = $('#fileInput');
        const chooseFileBtn = $('#chooseFileBtn');
        const loadDifferentFileBtn = $('#loadDifferentFileBtn');
        const closeUsageBtn = $('#closeUsageBtn');
        
        uploadArea.off();
        fileInput.off();
        chooseFileBtn.off();
        loadDifferentFileBtn.off();
        closeUsageBtn.off();
        $(document).off('keydown');
        
        if (this.twitterWidgetTimer) {
            clearTimeout(this.twitterWidgetTimer);
        }
    }
}

$(document).ready(() => {
    if (window.xLikeViewerInstance) {
        window.xLikeViewerInstance.destroy();
    }
    
    window.xLikeViewerInstance = new XLikeViewer();
}); 