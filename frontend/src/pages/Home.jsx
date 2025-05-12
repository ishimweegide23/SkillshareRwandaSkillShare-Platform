import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading (remove in production)
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <FullPageLoading />;

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to Skillshare</h1>
          <p className="hero-subtitle">
            Share your skills, learn from others, and track your progress in one vibrant community.
          </p>
          <div className="cta-buttons">
            <Link to="/feed" className="cta-button primary">
              Explore Community Feed
            </Link>
            <Link to="/create-post" className="cta-button secondary">
              Share Your Skill
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <img 
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
            alt="People learning together" 
          />
        </div>
      </div>

      <div className="features-section">
        <h2 className="section-title">Why Join Skillshare?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <h3>Connect with Experts</h3>
            <p>Learn directly from industry professionals and passionate hobbyists alike.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h3>Structured Learning</h3>
            <p>Follow curated learning paths or create your own personalized journey.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3>Community Support</h3>
            <p>Get feedback and encouragement from fellow learners at every step.</p>
          </div>
        </div>
      </div>

      <div className="quick-links">
        <Link to="/profile" className="quick-link">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Your Profile
        </Link>
        <Link to="/learning-progress" className="quick-link">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          Learning Progress
        </Link>
        <Link to="/feed" className="quick-link">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Community Feed
        </Link>
      </div>
    </div>
  );
};

const FullPageLoading = () => (
  <div className="full-page-loading">
    <div className="spinner"></div>
    <h2>Loading Skillshare</h2>
  </div>
);

// CSS Styles
const styles = `
  .home-container {
    min-height: 100vh;
    width: 100%;
    overflow-x: hidden;
  }

  .full-page-loading {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f8f9fa;
  }

  .spinner {
    width: 50px;
    height: 50px;
    border: 5px solid rgba(100, 108, 255, 0.2);
    border-radius: 50%;
    border-top-color: #646cff;
    animation: spin 1s ease-in-out infinite;
    margin-bottom: 20px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .hero-section {
    display: flex;
    flex-direction: column;
    min-height: 80vh;
    background: linear-gradient(135deg, #646cff 0%, #535bf2 100%);
    color: white;
    padding: 40px 20px;
  }

  @media (min-width: 992px) {
    .hero-section {
      flex-direction: row;
      align-items: center;
      padding: 0 10%;
    }
  }

  .hero-content {
    flex: 1;
    padding: 40px 0;
    text-align: left;
  }

  @media (min-width: 992px) {
    .hero-content {
      padding-right: 60px;
    }
  }

  .hero-title {
    font-size: 3rem;
    margin-bottom: 20px;
    line-height: 1.2;
  }

  @media (min-width: 768px) {
    .hero-title {
      font-size: 4rem;
    }
  }

  .hero-subtitle {
    font-size: 1.2rem;
    margin-bottom: 30px;
    max-width: 600px;
    opacity: 0.9;
  }

  .cta-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
  }

  .cta-button {
    padding: 12px 24px;
    border-radius: 30px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .cta-button.primary {
    background-color: white;
    color: #646cff;
  }

  .cta-button.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }

  .cta-button.secondary {
    background-color: transparent;
    color: white;
    border: 2px solid rgba(255,255,255,0.3);
  }

  .cta-button.secondary:hover {
    background-color: rgba(255,255,255,0.1);
    border-color: white;
  }

  .hero-image {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
  }

  .hero-image img {
    max-width: 100%;
    height: auto;
    border-radius: 10px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  }

  .features-section {
    padding: 80px 20px;
    background-color: white;
  }

  @media (min-width: 768px) {
    .features-section {
      padding: 100px 10%;
    }
  }

  .section-title {
    text-align: center;
    font-size: 2rem;
    margin-bottom: 60px;
    color: #333;
  }

  .features-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 40px;
    max-width: 1200px;
    margin: 0 auto;
  }

  @media (min-width: 768px) {
    .features-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .feature-card {
    text-align: center;
    padding: 30px;
    border-radius: 10px;
    transition: all 0.3s ease;
  }

  .feature-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  }

  .feature-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f7ff;
    border-radius: 50%;
    color: #646cff;
  }

  .feature-card h3 {
    font-size: 1.3rem;
    margin-bottom: 15px;
    color: #333;
  }

  .feature-card p {
    color: #666;
    line-height: 1.6;
  }

  .quick-links {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20px;
    padding: 40px 20px;
    background-color: #f8f9fa;
  }

  .quick-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 24px;
    background-color: white;
    border-radius: 8px;
    text-decoration: none;
    color: #333;
    font-weight: 500;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }

  .quick-link:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    color: #646cff;
  }

  .quick-link svg {
    color: #646cff;
  }
`;

// Inject styles
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default Home;