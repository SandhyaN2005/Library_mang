// Library Management System JavaScript

// Page Navigation
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    
    // Navigation functionality
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and pages
            navLinks.forEach(nav => nav.classList.remove('active'));
            pages.forEach(page => page.classList.remove('active'));
            
            // Add active class to clicked link and corresponding page
            this.classList.add('active');
            const targetPage = this.getAttribute('data-page');
            document.getElementById(targetPage).classList.add('active');
        });
    });
    
    // Set today's date as default for issue date
    const issueDateInput = document.getElementById('issueDate');
    if (issueDateInput) {
        const today = new Date().toISOString().split('T')[0];
        issueDateInput.value = today;
    }
    
    // Form handlers
    setupAddBookForm();
    setupIssueBookForm();
    setupReturnBookForm();
});

// Add Book Form Handler
function setupAddBookForm() {
    const form = document.getElementById('addBookForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const bookName = document.getElementById('bookName').value.trim();
        const bookAuthor = document.getElementById('bookAuthor').value.trim();
        const bookCategory = document.getElementById('bookCategory').value;
        
        // Validation
        if (!bookName || !bookAuthor || !bookCategory) {
            showMessage('Please fill in all fields', 'error');
            return;
        }
        
        // Generate book ID
        const bookId = generateBookId();
        
        // Add book to table
        addBookToTable(bookId, bookName, bookAuthor, bookCategory);
        
        // Show success message
        alert(`Book "${bookName}" has been added successfully with ID: ${bookId}`);
        
        // Reset form
        form.reset();
    });
}

// Issue Book Form Handler
function setupIssueBookForm() {
    const form = document.getElementById('issueBookForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const studentName = document.getElementById('studentName').value.trim();
        const bookName = document.getElementById('bookNameIssue').value;
        const issueDate = document.getElementById('issueDate').value;
        
        // Validation
        if (!studentName || !bookName || !issueDate) {
            alert('Please fill in all fields');
            return;
        }
        
        // Check if book is available
        if (!isBookAvailable(bookName)) {
            alert('This book is already issued. Please choose another book.');
            return;
        }
        
        // Update book status in table
        updateBookStatus(bookName, 'issued');
        
        // Show success message
        alert(`Book "${bookName}" has been issued to ${studentName} on ${issueDate}`);
        
        // Reset form
        form.reset();
        
        // Reset date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('issueDate').value = today;
    });
}

// Return Book Form Handler
function setupReturnBookForm() {
    const form = document.getElementById('returnBookForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const bookId = document.getElementById('bookIdReturn').value.trim();
        
        // Validation
        if (!bookId) {
            showReturnMessage('Please enter a Book ID', 'error');
            return;
        }
        
        // Validate book ID format
        if (!bookId.match(/^B\d{3}$/)) {
            showReturnMessage('Invalid Book ID format. Please use format like B001', 'error');
            return;
        }
        
        // Find book in table
        const bookRow = findBookById(bookId);
        
        if (!bookRow) {
            showReturnMessage(`Book with ID "${bookId}" not found`, 'error');
            return;
        }
        
        // Check if book is actually issued
        const statusCell = bookRow.querySelector('.status');
        if (statusCell.classList.contains('available')) {
            showReturnMessage(`Book with ID "${bookId}" is already available`, 'error');
            return;
        }
        
        // Update book status
        statusCell.classList.remove('issued');
        statusCell.classList.add('available');
        statusCell.textContent = 'Available';
        
        // Get book name for message
        const bookName = bookRow.cells[1].textContent;
        
        // Show success message
        showReturnMessage(`Book "${bookName}" (ID: ${bookId}) has been returned successfully`, 'success');
        
        // Reset form
        form.reset();
    });
}

// Helper Functions

function generateBookId() {
    const table = document.getElementById('booksTable');
    const tbody = table.querySelector('tbody');
    const rows = tbody.querySelectorAll('tr');
    
    // Find the highest existing book ID
    let maxId = 0;
    rows.forEach(row => {
        const idCell = row.cells[0].textContent;
        const idNum = parseInt(idCell.substring(1));
        if (idNum > maxId) {
            maxId = idNum;
        }
    });
    
    // Generate new ID
    const newId = maxId + 1;
    return `B${newId.toString().padStart(3, '0')}`;
}

function addBookToTable(bookId, bookName, bookAuthor, bookCategory) {
    const table = document.getElementById('booksTable');
    const tbody = table.querySelector('tbody');
    
    const newRow = tbody.insertRow();
    
    newRow.innerHTML = `
        <td>${bookId}</td>
        <td>${bookName}</td>
        <td>${bookAuthor}</td>
        <td>${bookCategory}</td>
        <td><span class="status available">Available</span></td>
    `;
    
    // Add hover effect to new row
    newRow.style.animation = 'fadeIn 0.5s ease';
}

function isBookAvailable(bookName) {
    const table = document.getElementById('booksTable');
    const rows = table.querySelectorAll('tbody tr');
    
    for (let row of rows) {
        if (row.cells[1].textContent === bookName) {
            const statusCell = row.querySelector('.status');
            return statusCell.classList.contains('available');
        }
    }
    
    return false;
}

function updateBookStatus(bookName, status) {
    const table = document.getElementById('booksTable');
    const rows = table.querySelectorAll('tbody tr');
    
    for (let row of rows) {
        if (row.cells[1].textContent === bookName) {
            const statusCell = row.querySelector('.status');
            statusCell.classList.remove('available', 'issued');
            statusCell.classList.add(status);
            statusCell.textContent = status === 'available' ? 'Available' : 'Issued';
            break;
        }
    }
}

function findBookById(bookId) {
    const table = document.getElementById('booksTable');
    const rows = table.querySelectorAll('tbody tr');
    
    for (let row of rows) {
        if (row.cells[0].textContent === bookId) {
            return row;
        }
    }
    
    return null;
}

function showReturnMessage(message, type) {
    const messageDiv = document.getElementById('returnMessage');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type} show`;
    
    // Hide message after 5 seconds
    setTimeout(() => {
        messageDiv.classList.remove('show');
    }, 5000);
}

function showMessage(message, type) {
    // Create a temporary message element if needed
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type} show`;
    messageDiv.textContent = message;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.right = '20px';
    messageDiv.style.zIndex = '1000';
    messageDiv.style.maxWidth = '300px';
    
    document.body.appendChild(messageDiv);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Add some interactive features
document.addEventListener('DOMContentLoaded', function() {
    // Add search functionality for books (bonus feature)
    addSearchFunctionality();
    
    // Add table row click to show details
    addTableRowInteractions();
});

function addSearchFunctionality() {
    // Create search input for books page
    const booksSection = document.querySelector('.books-table');
    if (!booksSection) return;
    
    const searchContainer = document.createElement('div');
    searchContainer.style.marginBottom = '1rem';
    searchContainer.innerHTML = `
        <input type="text" id="bookSearch" placeholder="Search books by name, author, or category..." 
               style="width: 100%; padding: 0.75rem; border: 2px solid #e1e5e9; border-radius: 8px; font-size: 1rem;">
    `;
    
    const booksTable = booksSection.querySelector('table');
    booksSection.insertBefore(searchContainer, booksTable);
    
    // Add search functionality
    const searchInput = document.getElementById('bookSearch');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = document.querySelectorAll('#booksTable tbody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
}

function addTableRowInteractions() {
    const rows = document.querySelectorAll('#booksTable tbody tr');
    
    rows.forEach(row => {
        row.style.cursor = 'pointer';
        row.addEventListener('click', function() {
            const bookId = this.cells[0].textContent;
            const bookName = this.cells[1].textContent;
            const author = this.cells[2].textContent;
            const category = this.cells[3].textContent;
            const availability = this.cells[4].textContent;
            
            alert(`Book Details:\n\nID: ${bookId}\nName: ${bookName}\nAuthor: ${author}\nCategory: ${category}\nStatus: ${availability}`);
        });
    });
}

// Add smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Add loading animation for form submissions
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function() {
        const submitBtn = this.querySelector('button[type="submit"]');
        if (submitBtn) {
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Processing...';
            submitBtn.disabled = true;
            
            // Reset button after 2 seconds (in case form doesn't reset)
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 2000);
        }
    });
});
