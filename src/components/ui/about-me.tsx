import React from 'react';

export default function AboutMe(){
  return (
    <article className="about-editorial">
      <header className="editorial-header">
        <div className="editorial-meta">
          <span className="editorial-category">About</span>
          <span className="editorial-divider">—</span>
          <span className="editorial-date">October 2026</span>
        </div>
        <h1 className="editorial-headline">
          Technology should feel like magic,<br />
          <span className="editorial-italic">not a maze.</span>
        </h1>
      </header>

      <div className="editorial-content">
        <div className="editorial-grid">
          <aside className="editorial-sidebar">
            <div className="editorial-label">Profile</div>
            <div className="editorial-info">
              <div className="editorial-info-item">
                <span className="editorial-info-label">Background</span>
                <span className="editorial-info-value">IT Graduate</span>
              </div>
              <div className="editorial-info-item">
                <span className="editorial-info-label">Focus</span>
                <span className="editorial-info-value">Full-Stack + AI</span>
              </div>
              <div className="editorial-info-item">
                <span className="editorial-info-label">Approach</span>
                <span className="editorial-info-value">Human-Centric</span>
              </div>
            </div>
          </aside>

          <div className="editorial-body">
            <p className="editorial-lead">
              As an IT graduate, I have the technical foundation to build robust systems. But my real motivation comes from being a user myself. I've experienced the frustration of clunky interfaces and the burnout of repetitive, manual workflows.
            </p>

            <p className="editorial-text">
              That's why I shifted my focus. I don't just write code; I combine full-stack development with AI automation to build tools that actually <em>make sense</em> to the people using them. I build the solutions I wish I had.
            </p>

            <blockquote className="editorial-pullquote">
              <p>
                I don't just write code; I combine full-stack development with AI automation to build tools that actually make sense to the people using them.
              </p>
            </blockquote>

            <p className="editorial-text">
              My promise to you is simple: You won't just get a working app or a script. You'll get a human-centric solution that saves time, eliminates friction, and scales with your goals—backed by clean, well-documented code.
            </p>
          </div>
        </div>
      </div>

      <footer className="editorial-footer">
        <div className="editorial-footer-content">
          <div className="editorial-footer-label">The Commitment</div>
          <p className="editorial-footer-text">
            Clean code. Intuitive design. Real results.
          </p>
        </div>
      </footer>
    </article>
  );
};