import React from 'react';

/**
 * Full-bleed autoplaying hero video for the landing page.
 * Replaces the old canvas-based CityHeroAnimation.
 */
export default function LandingHeroVideo() {
  return (
    <section className="landing-hero-video-viewport">
      <video
        className="landing-hero-video"
        src="/assets/background-video3-enhanced.webm"
        autoPlay
        muted
        loop
        playsInline
      />
    </section>
  );
}
