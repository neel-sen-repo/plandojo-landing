"use client";
import { useState, useRef, useEffect, useCallback } from "react";

function WaitlistForm({ buttonText, successMessage, className = "" }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError("Please enter an email");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      setSubmitted(true);
      setEmail("");
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="waitlistForm">
        <input
          type="email"
          placeholder="Enter your email or phone number"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="emailInput"
        />
        <button type="submit" disabled={loading} className="ctaButton">
          {loading ? "Checking..." : buttonText}
        </button>
      </form>
      {submitted && <p className="successMessage">{successMessage}</p>}
      {error && <p className="errorMessage">{error}</p>}
    </div>
  );
}

export default function Home() {
  const [slider, setSlider] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [metrics, setMetrics] = useState({ signups: 0, visits: 0 });
  const [activeTab, setActiveTab] = useState(null); // Managed state for progressive disclosure
  const containerRef = useRef(null);
  const visitRecordedRef = useRef(false);

  const toggleTab = (id) => {
    setActiveTab(activeTab === id ? null : id);
  };

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
        signups: data.totalSignups ?? 0,
        visits: data.visits ?? 0,
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
          signups: data.totalSignups ?? 0,
          visits: data.visits ?? 0,
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
    recordVisit();
  }, [recordVisit]);

  return (
    <main className="main">
      {/* Hero Section */}
      <header className="hero">
        <div className="heroContent">
          <div className="badge">The Pre-Bid Standard for Home Renovation</div>
          <h1>Get Your Renovation Sorted</h1>
          <p className="heroSubtitle">
            Photos to a precise baseline project scope in 60 seconds. Directly over text. No apps to download, no cognitive overload.
          </p>
          <div className="heroCtas">
            <WaitlistForm 
              buttonText="I am interested"
              successMessage="Successful add to interest list!"
            />
            <a 
              href="/plandojo-mobile-demo.mp4" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="demoVideoButton"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="10 8 16 12 10 16 10 8"></polygon>
              </svg>
              Watch the 60s demo
            </a>
          </div>
        </div>
      </header>

      {/* Before/After Visual Interactive WedgeSlider */}
      <section className="sliderSection">
        <div className="maxWidth">
          <h2>Instant Spatial Clarity Over Messaging</h2>
          <p className="sliderSubtitle">See your structural baseline transform instantly</p>

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
          >
            <img src="/after.jpg" className="imgNormalized" alt="Renovated Layout" draggable={false} />
            <div className="mask" style={{ clipPath: `inset(0 ${100 - slider}% 0 0)` }}>
              <img src="/before.jpg" className="imgNormalized" alt="Current Environmental State" draggable={false} />
            </div>
            <div className="handle" style={{ left: `${slider}%` }}>
              <div className="handleLine"></div>
              <div className="handleCircle"></div>
            </div>
          </div>
          <div className="sliderLabel">
            <span>[ Current Space Profile ]</span>
            <span>[ AURA Spatial Telemetry Node ]</span>
          </div>

          <p className="sliderNote">
            This is the visual baseline homeowners experience. Trade partners simultaneously receive an authenticated, code-verifiable takeoff scope document.
          </p>
        </div>
      </section>

      {/* Your Project Coordination Center - Progressive Disclosure Interface */}
      <section className="sampleProjectSection">
        <div className="maxWidth">
          <h2>Your Project Coordination Center</h2>
          <p className="sectionLead">
            AURA instantly parses raw environmental photos into highly structured spatial constraints. Open a configuration layer below to verify your telemetry data.
          </p>

          <div className="accordionWrapper">
            
            {/* PANEL 1: GEOMETRY */}
            <div className="accordionItem">
              <button className="accordionHeader" onClick={() => toggleTab(1)}>
                <span>📐 Verified Geometry &amp; Spatial Constraints</span>
                <span className="accordionIndicator">{activeTab === 1 ? "−" : "+"}</span>
              </button>
              {activeTab === 1 && (
                <div className="accordionContent">
                  <p className="planNote">Raw physical parameters extracted from camera feeds and map vectors.</p>
                  <ul className="planList">
                    <li>Verified 36" countertop height baseline parameters.</li>
                    <li>Backsplash configuration runs cleanly along primary wall and wraps left side of window return structure.</li>
                    <li>Existing grout matrices evaluated at uniform ⅛" runtime bounds.</li>
                    <li>Substrate Base: Drywall (stable classification, standard preparation profile).</li>
                  </ul>
                </div>
              )}
            </div>

            {/* PANEL 2: SCOPE */}
            <div className="accordionItem">
              <button className="accordionHeader" onClick={() => toggleTab(2)}>
                <span>📋 Proposed Technical Scope Matrix</span>
                <span className="accordionIndicator">{activeTab === 2 ? "−" : "+"}</span>
              </button>
              {activeTab === 2 && (
                <div className="accordionContent">
                  <p className="planNote">Automated operational checklist translated for cross-ecosystem contractor compliance.</p>
                  <ul className="planList">
                    <li>Extract existing tile arrays and clear compound adhesive residues.</li>
                    <li>Prepare underlying substrate base: clean, plane level, and apply structural primer.</li>
                    <li>Set uniform new subway tile pattern layout with ⅛" precision joint lines.</li>
                    <li>Apply high-durability moisture barrier grout sealant per manufacturer specifications.</li>
                  </ul>
                </div>
              )}
            </div>

            {/* PANEL 3: TIMELINE & BUDGET */}
            <div className="accordionItem">
              <button className="accordionHeader" onClick={() => toggleTab(3)}>
                <span>⏳ Estimated Timeline &amp; Budget Baselines</span>
                <span className="accordionIndicator">{activeTab === 3 ? "−" : "+"}</span>
              </button>
              {activeTab === 3 && (
                <div className="accordionContent">
                  <p className="planNote">Resource distribution variables mapped against localized labor nodes.</p>
                  <div className="budgetTable">
                    <div className="budgetRow">
                      <span>Phase 1: Demolition &amp; Substrate Base Prep</span>
                      <strong>4–6 Hours</strong>
                    </div>
                    <div className="budgetRow">
                      <span>Phase 2: Tile Installation Matrix &amp; Grouting</span>
                      <strong>8–10 Hours</strong>
                    </div>
                    <div className="budgetRow highlighted">
                      <span>Total Estimated Construction Runtime</span>
                      <span>14–18 Hours</span>
                    </div>
                  </div>
                  <div className="budgetTable" style={{ marginTop: "12px" }}>
                    <div className="budgetRow">
                      <span>Raw Material Estimates (Tile, Grout, Compounds)</span>
                      <strong>$800 - $1,200</strong>
                    </div>
                    <div className="budgetRow">
                      <span>Localized Labor Allocation Baseline</span>
                      <strong>$2,400 - $3,200</strong>
                    </div>
                    <div className="budgetRow highlighted">
                      <span>Total Pre-Bid Baseline Assessment</span>
                      <span>$3,400 - $4,800</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* High-Intent Strategic Interactive Next Step Endpoint */}
          <div className="actionCtaBlock">
            <button className="proBidButton">
              APPROVE &amp; DISPATCH PRO-BIDS
            </button>
            <div className="microSequence">
              <span>Spatial Capture</span>
              <span className="arrow">→</span>
              <span>Layout Approval</span>
              <span className="arrow">→</span>
              <span>Dispatched to Regional Network Nodes</span>
            </div>
          </div>

        </div>
      </section>

      {/* CTA Waitlist Section */}
      <section className="ctaSection">
        <div className="maxWidth">
          <h2>Join the Pre-Bid Standard</h2>
          <p>End the renovation chaos before it costs your household time or unvetted overhead.</p>
          <WaitlistForm 
            className="ctaForm"
            buttonText="I am interested"
            successMessage="Successful add to interest list!"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="maxWidth">
          <p>&copy; 2026 PlanDojo. The Pre-Bid Alignment Layer.</p>
        </div>
      </footer>

      {/* Floating System Telemetry Widget */}
      <div className="metricsWidget" aria-live="polite">
        <div className="metricsHeading">Live Data Telemetry</div>
        <div className="metricsItem">
          <span className="metricsValue">{metrics.signups.toLocaleString()}</span>
          <span className="metricsLabel">Authenticated takeoffs</span>
        </div>
        <div className="metricsItem">
          <span className="metricsValue">{metrics.visits.toLocaleString()}</span>
          <span className="metricsLabel">Network queries</span>
        </div>
      </div>
    </main>
  );
}