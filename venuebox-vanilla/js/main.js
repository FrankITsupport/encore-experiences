// DOM Elements
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const contactForm = document.getElementById('contact-form');

// Mobile Navigation Toggle
if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a link
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Smooth scrolling function
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offsetTop = section.offsetTop - 80; // Account for fixed navbar
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// Navbar scroll effect
let lastScrollTop = 0;
window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scrolling down
        navbar.style.transform = 'translateY(-100%)';
    } else {
        // Scrolling up
        navbar.style.transform = 'translateY(0)';
    }
    
    lastScrollTop = scrollTop;
});

// Add background to navbar on scroll
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(18, 18, 23, 0.95)';
        navbar.style.backdropFilter = 'blur(20px)';
        navbar.style.webkitBackdropFilter = 'blur(20px)';
    } else {
        navbar.style.background = 'rgba(18, 18, 23, 0.8)';
    }
});

// Contact Form Handler
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            message: formData.get('message')
        };
        
        // Basic validation
        if (!data.name || !data.email || !data.message) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        // Simulate form submission (replace with actual implementation)
        console.log('Form submitted:', data);
        showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
        
        // Reset form
        contactForm.reset();
    });
}

// Notification System
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.background = 'hsl(142, 76%, 36%)';
            break;
        case 'error':
            notification.style.background = 'hsl(0, 84%, 60%)';
            break;
        default:
            notification.style.background = 'hsl(var(--primary))';
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    // Elements to animate
    const animateElements = document.querySelectorAll(
        '.product-card, .service-item, .feature-item, .section-header'
    );
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Stagger animation for grid items
    const gridItems = document.querySelectorAll('.products-grid > *, .services-grid > *');
    gridItems.forEach((el, index) => {
        el.style.transitionDelay = `${index * 0.1}s`;
    });
});

// Add hover effects to cards
const cards = document.querySelectorAll('.product-card, .service-item');
cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
    });
});

// Smooth reveal for hero section
window.addEventListener('load', () => {
    const heroBadge = document.querySelector('.hero-badge');
    const heroTitleLines = document.querySelectorAll('.hero-title-line');
    const heroDescription = document.querySelector('.hero-description');
    const heroActions = document.querySelector('.hero-actions');
    
    if (heroBadge) {
        setTimeout(() => {
            heroBadge.style.opacity = '1';
            heroBadge.style.transform = 'translateY(0)';
        }, 300);
    }
    
    heroTitleLines.forEach((line, index) => {
        setTimeout(() => {
            line.style.opacity = '1';
            line.style.transform = 'translateY(0)';
        }, 500 + (index * 200));
    });
    
    if (heroDescription) {
        setTimeout(() => {
            heroDescription.style.opacity = '1';
            heroDescription.style.transform = 'translateY(0)';
        }, 1100);
    }
    
    if (heroActions) {
        setTimeout(() => {
            heroActions.style.opacity = '1';
            heroActions.style.transform = 'translateY(0)';
        }, 1300);
    }
});

// Parallax effect for hero background
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroBg = document.querySelector('.hero-bg');
    const orbs = document.querySelectorAll('.orb');
    
    if (heroBg) {
        heroBg.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
    
    orbs.forEach((orb, index) => {
        const speed = 0.2 + (index * 0.1);
        orb.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Loading animation for images
const images = document.querySelectorAll('img');
images.forEach(img => {
    img.addEventListener('load', () => {
        img.style.opacity = '1';
    });
    
    img.addEventListener('error', () => {
        img.style.opacity = '0.5';
    });
    
    // Set initial state
    img.style.transition = 'opacity 0.3s ease';
    img.style.opacity = '0';
});

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    // Escape key closes mobile menu
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// Performance optimization - Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debounced scroll handlers
const debouncedScrollHandler = debounce(() => {
    // Add any scroll-dependent logic here
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);

// Add print styles
window.addEventListener('beforeprint', () => {
    document.body.classList.add('printing');
});

window.addEventListener('afterprint', () => {
    document.body.classList.remove('printing');
});

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('VenueBox website loaded successfully!');
    
    // Add any additional initialization here
    const currentYear = new Date().getFullYear();
    const footerYear = document.querySelector('.footer-bottom p');
    if (footerYear) {
        footerYear.innerHTML = footerYear.innerHTML.replace('2024', currentYear);
    }
});
