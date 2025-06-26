// Custom cursor
document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.querySelector('.cursor');
    
    document.addEventListener('mousemove', (e) => {
        gsap.to(cursor, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.1,
            ease: 'power1.out'
        });
        
        if (cursor.opacity !== 1) {
            gsap.to(cursor, {
                opacity: 1,
                duration: 0.3
            });
        }
    });
    
    document.addEventListener('mouseleave', () => {
        gsap.to(cursor, {
            opacity: 0,
            duration: 0.3
        });
    });
});


// Upload functionality
const fileInput = document.getElementById('fileInput');
const uploadButton = document.getElementById('uploadButton');
const uploadArea = document.getElementById('uploadArea');
const resultsContainer = document.getElementById('resultsContainer');
const originalImage = document.getElementById('originalImage');
const removedBgImage = document.getElementById('removedBgImage');
const downloadButton = document.getElementById('downloadButton');
const loadingOverlay = document.getElementById('loadingOverlay');
const errorMessage = document.getElementById('errorMessage');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');

// Handle file upload button click
uploadButton.addEventListener('click', () => {
    fileInput.click();
});

// Handle file selection
fileInput.addEventListener('change', handleFileSelect);

// Handle drag and drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    
    if (e.dataTransfer.files.length) {
        handleFile(e.dataTransfer.files[0]);
    }
});

// Handle file selection from input
function handleFileSelect(e) {
    if (e.target.files.length) {
        handleFile(e.target.files[0]);
    }
}

// Process the selected file
function handleFile(file) {
    // Check if file is an image
    if (!file.type.match('image.*')) {
        showError('Please select an image file (JPG, PNG, or WEBP)');
        return;
    }
    
    // Check file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
        showError('File is too large! Maximum size is 20MB');
        return;
    }

    // Clear previous error
    hideError();
    
    // Show loading state
    loadingOverlay.style.visibility = 'visible';
    progressContainer.style.display = 'block';
    
    // Create a preview of the original image
    const reader = new FileReader();
    reader.onload = (e) => {
        originalImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
    
    // Prepare form data for API request
    const formData = new FormData();
    formData.append('file', file);
    
    // Create and configure XMLHttpRequest
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://api.zpi.my.id/v1/utility/remove-bg', true);
    
    // Track upload progress
    xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            progressBar.style.width = percentComplete + '%';
            progressText.textContent = percentComplete + '%';
        }
    };
    
    // Handle response
    xhr.onload = function() {
        loadingOverlay.style.visibility = 'hidden';
        
        if (xhr.status === 200) {
            try {
                const response = JSON.parse(xhr.responseText);
                
                if (response.code === 200 && response.response && response.response.image && response.response.image.preview) {
                    // Display the result
                    removedBgImage.src = response.response.image.preview;
                    resultsContainer.style.display = 'flex';
                    downloadButton.style.display = 'block';
                    
                    // Enable download button
                    downloadButton.addEventListener('click', () => {
                        downloadImage(response.response.image.preview);
                    });
                    

                } else {
                    showError('Failed to process the image. Please try again.');
                }
            } catch (error) {
                showError('Error processing response. Please try again.');
            }
        } else {
            showError('Error: ' + xhr.status + ' - ' + xhr.statusText);
        }
        
        // Hide progress after a delay
        setTimeout(() => {
            progressContainer.style.display = 'none';
        }, 1000);
    };
    
    // Handle error
    xhr.onerror = function() {
        loadingOverlay.style.visibility = 'hidden';
        progressContainer.style.display = 'none';
        showError('Network error. Please check your connection and try again.');
    };
    
    // Send the request
    xhr.send(formData);
}

// Download processed image
function downloadImage(url) {
    const link = document.createElement('a');
    link.href = url;
    link.download = 'removed-background.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    
    // Shake animation for error
    gsap.fromTo(errorMessage, 
        {x: -10}, 
        {x: 10, duration: 0.1, repeat: 5, yoyo: true}
    );
}

// Hide error message
function hideError() {
    errorMessage.style.display = 'none';
}