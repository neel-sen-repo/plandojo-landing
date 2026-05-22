"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import WaitlistForm from "../components/WaitlistForm";

export default function Home() {
  const [slider, setSlider] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [metrics, setMetrics] = useState({ homeowners: 0, pros: 0 });
  const [videoOpen, setVideoOpen] = useState(false);
  const containerRef = useRef(null);
  const visitRecordedRef = useRef(false);

  const startDrag = (e) => {
    e?.preventDefault?.();
    setDragging(true);
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
  };
  
  const stopDrag = useCallback(() => {
    setDragging(false);
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
  }, []);

  const onDrag = useCallback((e) => {
    if (!dragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    let percent = ((x - rect.left) / rect.width) * 100;

    percent = Math.max(0, Math.min(100, percent));
    setSlider(percent);
  }, [dragging]);

  const handleSliderKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      setSlider((prev) => Math.max(0, prev - 5));
    } else if (e.key === "ArrowRight") {
      setSlider((prev) => Math.min(100, prev + 5));
    }
  };

  const fetchMetrics = async () => {
    try {
      const res = await fetch("/api/metrics");
      if (!res.ok) {
        throw new Error("Failed to load metrics");
      }
      const data = await res.json();
      setMetrics({
        homeowners: data.homeownerSignups ?? 0,
        pros: data.proSignups ?? 0,
      });
    } catch (err) {
      // Intentionally swallow error visually for metrics
    }
  };

  const recordVisit = useCallback(async () => {
    if (visitRecordedRef.current) return;
    visitRecordedRef.current = true;

    try {
      const res = await fetch("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 200) {
        const data = await res.json();
        setMetrics({
          homeowners: data.homeownerSignups ?? 0,
          pros: data.proSignups ?? 0,
        });
      } else {
        await fetchMetrics();
      }
    } catch (err) {
      // Intentionally swallow error visually for metrics
    }
  }, []);

  useEffect(() => {
    if (!dragging) return;
    window.addEventListener("mousemove", onDrag);
    window.addEventListener("touchmove", onDrag);
    window.addEventListener("mouseup", stopDrag);
    window.addEventListener("touchend", stopDrag);

    return () => {
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("touchmove", onDrag);
      window.removeEventListener("mouseup", stopDrag);
      window.removeEventListener("touchend", stopDrag);
    };
  }, [dragging, onDrag, stopDrag]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    recordVisit();
  }, [recordVisit]);

  return (
    <>
      <nav className="topNav">
        <span className="navLogo">Plan<span style={{ color: '#2563eb' }}>Dojo</span></span>
        <div className="navActions">
          <a href="/contractor" className="navProButton">I am a Contractor →</a>
        </div>
      </nav>
      <main className="main">
      {/* 1. HERO SECTION (NEW) */}
      <header className="hero snapSection" style={{ paddingBottom: '20px', paddingTop: '64px' }}>
        <div className="heroContent" style={{ maxWidth: '1000px' }}>
          <h1>See Your Renovation Before You Commit.</h1>
          <h2 className="heroSubtitle" style={{ fontSize: '18px', fontWeight: '500' }}>
            This couple struggled to pick a tile for their kitchen backsplash.<br />
            They both got complete clarity in under 60 seconds.
          </h2>

          <div
            className="sliderWrapper"
            ref={containerRef}
            role="slider"
            tabIndex={0}
            aria-valuenow={Math.round(slider)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Before and after renovation slider"
            onKeyDown={handleSliderKeyDown}
            onMouseDown={(e) => startDrag(e)}
            onTouchStart={(e) => startDrag(e)}
            onDragStart={(e) => e.preventDefault()}
            style={{ marginTop: '40px', marginBottom: '40px' }}
          >
            <img src="/after.jpg" className="imgNormalized" alt="Renovated Layout" draggable={false} />
            <div className="mask" style={{ clipPath: `inset(0 ${100 - slider}% 0 0)` }}>
              <img src="/before.jpg" className="imgNormalized" alt="Current Environmental State" draggable={false} />
            </div>
            <div className="handle" style={{ left: `${slider}%` }}>
              <div className="handleLine"></div>
              <div className="handleCircle"></div>
            </div>
            <div className="sliderLabel before">Before</div>
            <div className="sliderLabel after">After</div>
          </div>

          <div className="heroCtas">
            <button className="ctaButtonSecondary" onClick={() => setVideoOpen(true)}>▶ Watch Demo</button>
            <button className="ctaButton" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>How It Works</button>
          </div>
        </div>
      </header>

      <div className="snapSection" id="how-it-works">
      {/* 2. WAITLIST SECTION */}
      <section className="ctaSection" style={{ padding: '60px 20px', background: '#1e293b' }}>
        <div className="maxWidth">
          <h2 style={{ color: 'white', marginBottom: '30px' }}>Your renovation scope, validated in 60 seconds.</h2>
          <WaitlistForm
            className="ctaForm"
            buttonText="Apply for Early Access"
          />
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section className="howItWorksSection" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div className="maxWidth">
          <h2>How It Works</h2>
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginTop: '48px', flexWrap: 'wrap' }}>
            <div className="stepCard" style={{ flex: '1', minWidth: '220px', maxWidth: '375px', padding: '20px', border: '1px solid #e5dcbe', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.94)', textAlign: 'left' }}>
              <img src="/before.jpg" className="stepThumb" alt="Upload a photo of your space" />
              <h3 style={{ fontSize: '18px', marginBottom: '8px', color: '#1e293b' }}>1. Upload a photo</h3>
              <p style={{ color: '#475569', fontSize: '15px' }}>Snap a picture of your current space.</p>
            </div>
            <div className="stepCard" style={{ flex: '1', minWidth: '220px', maxWidth: '375px', padding: '20px', border: '1px solid #e5dcbe', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.94)', textAlign: 'left' }}>
              <img src="/after.jpg" className="stepThumb" alt="See your renovated after look" />
              <h3 style={{ fontSize: '18px', marginBottom: '8px', color: '#1e293b' }}>2. See your After look</h3>
              <p style={{ color: '#475569', fontSize: '15px' }}>Get a visual transformation instantly.</p>
            </div>
            <div className="stepCard" style={{ flex: '1', minWidth: '220px', maxWidth: '375px', padding: '20px', border: '1px solid #e5dcbe', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.94)', textAlign: 'left' }}>
              <img src="/plan-sample.jpg" className="stepThumb" alt="Get a structured draft plan" />
              <h3 style={{ fontSize: '18px', marginBottom: '8px', color: '#1e293b' }}>3. Get a Draft Plan</h3>
              <p style={{ color: '#475569', fontSize: '15px' }}>Receive a structured scope for your project.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHY HOMEOWNERS LOVE IT */}
      <section className="benefitsSection" style={{ textAlign: 'center', padding: '40px 20px 80px' }}>
        <div className="maxWidth">
          <h2>Why Homeowners Love It</h2>
          <ul className="benefitsList" style={{ listStyle: 'none', padding: 0, marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <li style={{ fontSize: '18px', fontWeight: '600', color: '#1e3a8a', background: '#e2f1ff', padding: '20px 30px', borderRadius: '12px', width: '100%', maxWidth: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #93c5fd' }}>
              <span style={{ marginRight: '12px' }}>✅</span> Avoid costly mistakes
            </li>
            <li style={{ fontSize: '18px', fontWeight: '600', color: '#1e3a8a', background: '#e2f1ff', padding: '20px 30px', borderRadius: '12px', width: '100%', maxWidth: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #93c5fd' }}>
              <span style={{ marginRight: '12px' }}>✅</span> Know what you're getting
            </li>
            <li style={{ fontSize: '18px', fontWeight: '600', color: '#1e3a8a', background: '#e2f1ff', padding: '20px 30px', borderRadius: '12px', width: '100%', maxWidth: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #93c5fd' }}>
              <span style={{ marginRight: '12px' }}>✅</span> Align before talking to contractors
            </li>
          </ul>
        </div>
      </section>

      {/* CTA Waitlist Section */}
      <section className="ctaSection">
        <div className="maxWidth">
          <h2>Join the Pre-Bid Standard</h2>
          <p>End the renovation chaos before it costs your household time or unvetted overhead.</p>
          <WaitlistForm
            className="ctaForm"
            buttonText="Apply for Early Access"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="maxWidth">
          <p>&copy; 2026 PlanDojo. The Pre-Bid Alignment Layer.</p>
        </div>
      </footer>
      </div>

      {/* Floating System Telemetry Widget */}
      <div className="metricsWidget" aria-live="polite">
        <div className="metricsHeading">Interest</div>
        <div className="metricsItem">
          <span className="metricsValue">{metrics.homeowners.toLocaleString()}</span>
          <span className="metricsLabel">Homeowners</span>
        </div>
        <div className="metricsItem">
          <span className="metricsValue">{metrics.pros.toLocaleString()}</span>
          <span className="metricsLabel">Contractors</span>
        </div>
      </div>
    </main>

    {videoOpen && (
      <div className="videoModal" role="dialog" aria-modal="true" aria-label="AURA demo video" onClick={() => setVideoOpen(false)}>
        <div className="videoModalWrapper" onClick={e => e.stopPropagation()}>
          <button className="videoModalClose" onClick={() => setVideoOpen(false)} aria-label="Close video">✕</button>
          <div className="videoModalContent">
            <video src="/plandojo-mobile-demo.mp4" autoPlay muted controls playsInline style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        </div>
      </div>
    )}
    </>
  );
}
