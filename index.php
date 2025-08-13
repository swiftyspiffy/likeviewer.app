<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>X Like Viewer</title>
    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" rel="stylesheet">
    <link href="styles.css?ran=<?php echo rand(1000, 9999); ?>" rel="stylesheet">
</head>
<body>
    <div class="container-fluid py-4">
        <div class="row justify-content-center">
            <div class="col-lg-10 col-xl-8">
                <div class="main-container p-4">
                    <div class="text-center mb-4">
                        <h1 class="display-4 fw-bold text-primary mb-2">
                            <i class="bi bi-heart-fill text-danger me-2"></i>
                            X Like Viewer
                        </h1>
                        <p class="lead text-muted">Select your X archive like.js file to browse through your liked posts</p>
                    </div>

                    <div id="uploadSection" class="mb-4">
                        <div class="upload-area p-5 text-center" id="uploadArea" style="position: relative;">
                            <i class="bi bi-folder2 display-1 text-muted mb-3"></i>
                            <h4>Select your like.js file</h4>
                            <p class="text-muted">Drag and drop your like.js file here or click to browse</p>
                            <input type="file" id="fileInput" accept=".js" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; z-index: 10;">
                            <button class="btn btn-primary btn-custom" id="chooseFileBtn" style="position: relative; z-index: 5;">
                                <i class="bi bi-folder2-open me-2"></i>Select File
                            </button>
                        </div>
                    </div>

                    <div id="loadingSection" class="text-center mb-4 loading-spinner">
                        <div class="spinner-border text-primary mb-3" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <h5>Processing your likes...</h5>
                        <div class="progress-container">
                            <div class="progress mb-2">
                                <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 0%"></div>
                            </div>
                            <small class="text-muted" id="progressText">0% complete</small>
                        </div>
                    </div>

                    <div id="errorMessage" class="error-message mb-4">
                        <i class="bi bi-exclamation-triangle-fill me-2"></i>
                        <span id="errorText"></span>
                    </div>

                    <div id="tweetSection" class="tweet-container p-4 hidden">
                        <div class="row align-items-center mb-4">
                            <div class="col-md-6">
                                <h5 class="mb-0">
                                    <i class="bi bi-twitter-x me-2 text-dark"></i>
                                    Post Viewer
                                </h5>
                            </div>
                            <div class="col-md-6 text-end">
                                <span class="text-muted">
                                    <span id="currentIndex">0</span> of <span id="totalCount">0</span>
                                </span>
                            </div>
                        </div>

                        <div class="tweet-navigation-container position-relative mb-4">
                            <button class="btn btn-light btn-circle navigation-arrow navigation-arrow-left" id="prevBtn" disabled>
                                <i class="bi bi-chevron-left"></i>
                            </button>
                            
                            <div id="tweetEmbedContainer" class="tweet-embed">
                                <div class="text-center py-5">
                                    <i class="bi bi-twitter-x display-1 text-muted"></i>
                                    <p class="text-muted mt-3">Select a file to start viewing your likes</p>
                                </div>
                            </div>
                            
                            <button class="btn btn-light btn-circle navigation-arrow navigation-arrow-right" id="nextBtn" disabled>
                                <i class="bi bi-chevron-right"></i>
                            </button>
                        </div>

                        <div class="text-center mb-4">
                            <button class="btn btn-primary btn-custom" id="randomBtn" disabled>
                                <i class="bi bi-shuffle me-2"></i>Random Post
                            </button>
                        </div>

                        <div id="fileInfo" class="file-info">
                            <div class="row align-items-center">
                                <div class="col-md-4">
                                    <h6 class="mb-1"><i class="bi bi-file-earmark-text me-2"></i>File Loaded</h6>
                                    <p class="mb-0 text-muted" id="fileName"></p>
                                </div>
                                <div class="col-md-4 text-center">
                                    <span class="stats-badge" id="totalLikes">
                                        <i class="bi bi-heart me-1"></i>
                                        <span id="likesCount">0</span> likes
                                    </span>
                                </div>
                                <div class="col-md-4 text-end">
                                    <button class="btn btn-outline-secondary btn-sm" id="loadDifferentFileBtn" style="display: none;">
                                        <i class="bi bi-folder2-open me-1"></i>Select Different File
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="usageSection" class="usage-section mt-5">
                        <div class="card" id="usageCard">
                            <div class="card-header bg-light d-flex justify-content-between align-items-center">
                                <h5 class="mb-0">
                                    <i class="bi bi-info-circle me-2 text-primary"></i>
                                    How to Use This Tool
                                </h5>
                                <button class="btn btn-sm btn-outline-secondary" id="closeUsageBtn" title="Close this section">
                                    <i class="bi bi-x-lg"></i>
                                </button>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <h6><i class="bi bi-upload me-2 text-success"></i>Getting Started</h6>
                                        <ul class="list-unstyled">
                                            <li><i class="bi bi-check-circle text-success me-2"></i>Download your X archive using X's <a href="https://x.com/settings/download_your_data" target="_blank">archive tool</a></li>
                                            <li><i class="bi bi-check-circle text-success me-2"></i>Extract the archive and find your <code>like.js</code> file in <code>data</code> directory</li>
                                            <li><i class="bi bi-check-circle text-success me-2"></i>Select the file using the button above</li>
                                            <li><i class="bi bi-check-circle text-success me-2"></i>Start browsing through your liked posts!</li>
                                        </ul>
                                    </div>
                                    <div class="col-md-6">
                                        <h6><i class="bi bi-controller me-2 text-info"></i>Navigation Controls</h6>
                                        <ul class="list-unstyled">
                                            <li><i class="bi bi-arrow-left text-primary me-2"></i><strong>Left Arrow</strong> - Previous post</li>
                                            <li><i class="bi bi-arrow-right text-primary me-2"></i><strong>Right Arrow</strong> - Next post</li>
                                            <li><i class="bi bi-keyboard text-primary me-2"></i><strong>Spacebar</strong> - Random post</li>
                                        </ul>
                                    </div>
                                </div>
                                <div class="row mt-3">
                                    <div class="col-12">
                                        <div class="alert alert-info mb-0">
                                            <i class="bi bi-lightbulb me-2"></i>
                                            <strong>Tip:</strong> This tool works entirely in your browser - your data never leaves your computer!
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="container-fluid py-1 mt-0">
        <div class="row justify-content-center">
            <div class="col-lg-10 col-xl-8">
                <div class="text-center">
                    <div class="footer-credit">
                        <p class="mb-0">
                            Built and maintained by 
                            <a href="https://x.com/notnotnotclippy" target="_blank" class="credit-link">
                                <img src="logo-black.png" alt="Logo" class="me-1" style="height: 16px; width: auto; vertical-align: middle;">
                                <i class="bi bi-twitter-x me-1"></i>@notnotnotclippy
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="script.js?ran=<?php echo rand(1000, 9999); ?>"></script>
</body>
</html> 