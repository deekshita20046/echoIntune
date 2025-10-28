import React from 'react';

/**
 * Design Showcase Component
 * Demonstrates the Whimsical Coastal Calm design system
 * "echo: Intune - where focus meets cozy"
 */

const DesignShowcase = () => {
  return (
    <div className="min-h-screen bg-seafoam-mist p-8">
      {/* Header with Wave Text */}
      <div className="text-center mb-12">
        <h1 className="text-6xl font-heading wave-text mb-4">
          echo: Intune
        </h1>
        <p className="text-2xl font-cursive text-ocean-deep">
          where focus meets cozy
        </p>
      </div>

      {/* Color Palette Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-heading text-ocean-deep mb-6">
          🌊 Seafoam Sunset Palette
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Ocean Blues */}
          <div className="card text-center">
            <div className="w-full h-24 bg-seafoam-mist rounded-soft mb-3"></div>
            <p className="font-details text-sm text-ocean-deep">Seafoam Mist</p>
          </div>
          <div className="card text-center">
            <div className="w-full h-24 bg-turquoise-tide rounded-soft mb-3"></div>
            <p className="font-details text-sm text-ocean-deep">Turquoise Tide</p>
          </div>
          <div className="card text-center">
            <div className="w-full h-24 bg-aqua-soft rounded-soft mb-3"></div>
            <p className="font-details text-sm text-shell-white">Soft Aqua</p>
          </div>
          <div className="card text-center">
            <div className="w-full h-24 bg-ocean-deep rounded-soft mb-3"></div>
            <p className="font-details text-sm text-ocean-deep">Ocean Deep</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Warm Neutrals */}
          <div className="card text-center">
            <div className="w-full h-24 bg-shell-white rounded-soft mb-3"></div>
            <p className="font-details text-sm text-ocean-deep">Shell White</p>
          </div>
          <div className="card text-center">
            <div className="w-full h-24 bg-driftwood-beige rounded-soft mb-3"></div>
            <p className="font-details text-sm text-ocean-deep">Driftwood Beige</p>
          </div>
          <div className="card text-center">
            <div className="w-full h-24 bg-sea-pebble rounded-soft mb-3"></div>
            <p className="font-details text-sm text-shell-white">Sea Pebble</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {/* Sunset Accents */}
          <div className="card text-center">
            <div className="w-full h-24 bg-blush-coral rounded-soft mb-3"></div>
            <p className="font-details text-sm text-ocean-deep">Blush Coral</p>
          </div>
          <div className="card text-center">
            <div className="w-full h-24 bg-peach-glow rounded-soft mb-3"></div>
            <p className="font-details text-sm text-ocean-deep">Peach Glow</p>
          </div>
          <div className="card text-center">
            <div className="w-full h-24 bg-lavender-shell rounded-soft mb-3"></div>
            <p className="font-details text-sm text-ocean-deep">Lavender Shell</p>
          </div>
        </div>
      </section>

      {/* Typography Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-heading text-ocean-deep mb-6">
          📝 Ocean Breeze Script Typography
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-xl font-heading text-ocean-deep mb-2">
              Satoshi - Headings & Body
            </h3>
            <p className="font-sans text-ocean-deep mb-2">
              The quick brown fox jumps over the lazy dog.
            </p>
            <p className="font-sans font-bold text-ocean-deep">
              Bold: Perfect for emphasis and CTAs
            </p>
          </div>

          <div className="card">
            <h3 className="text-xl font-cursive text-ocean-deep mb-2">
              Dancing Script - Cursive
            </h3>
            <p className="font-cursive text-2xl text-ocean-deep">
              Elegant, lively, and playful sophistication
            </p>
          </div>

          <div className="card">
            <h3 className="text-xl font-handwriting text-ocean-deep mb-2">
              Indie Flower - Journal
            </h3>
            <p className="font-journal text-xl text-ocean-deep">
              Charming handwritten notes with a personal touch
            </p>
          </div>

          <div className="card">
            <h3 className="text-xl font-details text-ocean-deep mb-2">
              Work Sans - Details
            </h3>
            <p className="font-details text-sm text-sea-pebble">
              Perfect for small UI elements, annotations, and helper text
            </p>
          </div>
        </div>
      </section>

      {/* Button Styles */}
      <section className="mb-12">
        <h2 className="text-3xl font-heading text-ocean-deep mb-6">
          🌊 Button Styles
        </h2>
        
        <div className="flex flex-wrap gap-4">
          <button className="btn-gradient">
            Primary Coastal
          </button>
          
          <button className="bg-gradient-to-r from-blush-coral to-peach-glow text-white px-6 py-3 rounded-soft shadow-sunset hover:-translate-y-1 transition-all">
            Sunset Accent
          </button>
          
          <button className="border-2 border-turquoise-tide text-ocean-deep px-6 py-3 rounded-soft hover:bg-turquoise-tide hover:text-white transition-all font-medium">
            Ghost Button
          </button>
          
          <button className="bg-ocean-deep text-white px-6 py-3 rounded-soft hover:bg-ocean-midnight shadow-soft hover:shadow-soft-lg transition-all font-medium">
            Ocean Deep
          </button>
        </div>
      </section>

      {/* Card Variants */}
      <section className="mb-12">
        <h2 className="text-3xl font-heading text-ocean-deep mb-6">
          🏖️ Card Styles
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-xl font-heading text-ocean-deep mb-2">
              Standard Card
            </h3>
            <p className="text-ocean-deep">
              Clean shell white background with soft coastal shadows
            </p>
          </div>

          <div className="card-sand">
            <h3 className="text-xl font-heading text-ocean-deep mb-2">
              Beach Sand Card
            </h3>
            <p className="text-ocean-deep">
              Warm sunset gradient from shell white to peach glow
            </p>
          </div>

          <div className="glass">
            <h3 className="text-xl font-heading text-ocean-deep mb-2">
              Glass Card
            </h3>
            <p className="text-ocean-deep">
              Frosted glassmorphism effect with backdrop blur
            </p>
          </div>
        </div>
      </section>

      {/* UI Elements */}
      <section className="mb-12">
        <h2 className="text-3xl font-heading text-ocean-deep mb-6">
          ✨ UI Elements
        </h2>
        
        <div className="card">
          <div className="mb-6">
            <h3 className="text-lg font-heading text-ocean-deep mb-3">
              Badges
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="shell-badge">Lavender Shell</span>
              <span className="bg-turquoise-tide text-white px-3 py-1 rounded-full text-sm font-details">
                Turquoise
              </span>
              <span className="bg-blush-coral text-white px-3 py-1 rounded-full text-sm font-details">
                Blush Coral
              </span>
              <span className="bg-peach-glow text-ocean-deep px-3 py-1 rounded-full text-sm font-details">
                Peach Glow
              </span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-heading text-ocean-deep mb-3">
              Text Gradients
            </h3>
            <p className="text-3xl text-gradient font-heading mb-2">
              Static Ocean Gradient
            </p>
            <p className="text-3xl wave-text font-heading">
              Animated Wave Text
            </p>
          </div>

          <div>
            <h3 className="text-lg font-heading text-ocean-deep mb-3">
              Mood Icons (Hover to animate)
            </h3>
            <div className="flex gap-4 text-4xl">
              <span className="mood-icon">😊</span>
              <span className="mood-icon">😢</span>
              <span className="mood-icon">😡</span>
              <span className="mood-icon">😌</span>
              <span className="mood-icon">🎉</span>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Background Demo */}
      <section className="mb-12">
        <h2 className="text-3xl font-heading text-ocean-deep mb-6">
          🎨 Animated Gradient Background
        </h2>
        
        <div className="bg-animated-gradient rounded-cozy p-12 text-center">
          <h3 className="text-4xl font-heading text-ocean-deep mb-4">
            Coastal Wave Animation
          </h3>
          <p className="text-xl font-cursive text-ocean-deep">
            A gentle, flowing gradient that breathes life into the page
          </p>
        </div>
      </section>

      {/* Journal Entry Example */}
      <section className="mb-12">
        <h2 className="text-3xl font-heading text-ocean-deep mb-6">
          📖 Journal Entry Style
        </h2>
        
        <div className="card">
          <h3 className="journal-entry-title text-2xl text-ocean-deep mb-4">
            Today's Reflection
          </h3>
          <div className="journal-entry bg-shell-white">
            Today was a beautiful day by the coast. The waves were gentle, 
            and the breeze carried the scent of salt and sunshine. 
            I feel calm and centered, ready to embrace whatever comes next.
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center mt-16 pb-8">
        <p className="text-ocean-deep font-details">
          🌊 Whimsical Coastal Calm Design System
        </p>
        <p className="text-sea-pebble font-details text-sm mt-2">
          "A cozy home by the beach — calm, breezy, creative."
        </p>
      </footer>
    </div>
  );
};

export default DesignShowcase;

