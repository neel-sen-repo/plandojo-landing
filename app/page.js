"use client";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [slider, setSlider] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState({ signups: 0, visits: 0 });
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState("");
  const containerRef = useRef(null);

  const startDrag = (e) => {
    e?.preventDefault?.();
    setDragging(true);
    // disable text selection during drag
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
  };
  const stopDrag = () => {
    setDragging(false);
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
  };

  const onDrag = (e) => {
    if (!dragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    let percent = ((x - rect.left) / rect.width) * 100;

    percent = Math.max(0, Math.min(100, percent));
    setSlider(percent);
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
      setMetricsError("Unable to load stats");
    } finally {
      setMetricsLoading(false);
    }
  };

  const recordVisit = async () => {
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
      setMetricsError("Unable to load stats");
    } finally {
      setMetricsLoading(false);
    }
  };

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    recordVisit();
  }, []);

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
    <main className="main">
      {/* Hero Section */}
      <header className="hero">
        <div className="heroContent">
          <div className="badge">The Alignment Layer for Home Renovation</div>
          <h1>End Renovation Chaos</h1>
          <p className="heroSubtitle">
            Photos to draft plans in under 60 seconds. Homeowners and contractors finally on the same page.
          </p>
          <form onSubmit={handleSubmit} className="waitlistForm">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="emailInput"
            />
            <button type="submit" disabled={loading} className="ctaButton">
              {loading ? "Joining..." : "Join Waitlist"}
            </button>
          </form>
          {submitted && <p className="successMessage">✓ You're on the list!</p>}
          {error && <p className="errorMessage">{error}</p>}
        </div>
      </header>

      {/* The Problem: $600B Misalignment Tax */}
      <section className="problemSection">
        <div className="maxWidth">
          <h2>The $600B Misalignment Tax</h2>
          <p className="sectionLead">
            Hidden inefficiencies between homeowners and contractors paralyze <strong>$600 billion in home equity</strong>.
          </p>

          <div className="problemGrid">
            <div className="problemCard">
              <div className="problemIcon">🏠</div>
              <h3>Homeowners</h3>
              <ul className="problemList">
                <li>What are my real options?</li>
                <li>Afraid of getting ripped off</li>
                <li>Every contractor gives different scope</li>
                <li>Can't visualize the final result</li>
              </ul>
            </div>
            <div className="problemCard">
              <div className="problemIcon">👷</div>
              <h3>Contractors</h3>
              <ul className="problemList">
                <li>Homeowners don't know what they want</li>
                <li>Every job starts correcting assumptions</li>
                <li>$300+ wasted per unvetted site visit</li>
                <li>30–40% uncertainty baked into bids</li>
              </ul>
            </div>
          </div>

          <div className="insightBox">
            <p>
              <strong>The result:</strong> Homeowners lack clarity. Contractors waste time. Projects get delayed, budgets balloon, and $600B in home equity remains untapped.
            </p>
          </div>
        </div>
      </section>

      {/* Before/After Visualization */}
      <section className="sliderSection">
        <div className="maxWidth">
          <h2>See Your Renovation Before You Commit</h2>
          <p className="sliderSubtitle">Instant spatial clarity—no app download needed</p>

          <div
            className="sliderWrapper"
            ref={containerRef}
            onMouseDown={(e) => startDrag(e)}
            onTouchStart={(e) => startDrag(e)}
            onDragStart={(e) => e.preventDefault()}
          >
            <img src="/after.jpg" className="imgNormalized" alt="Renovated" draggable={false} />
            <div className="mask" style={{ clipPath: `inset(0 ${100 - slider}% 0 0)` }}>
              <img src="/before.jpg" className="imgNormalized" alt="Current" draggable={false} />
            </div>
            <div className="handle" style={{ left: `${slider}%` }}>
              <div className="handleLine"></div>
              <div className="handleCircle"></div>
            </div>
          </div>
          <div className="sliderLabel">
            <span>Current State</span>
            <span>Your Renovation</span>
          </div>

          <p className="sliderNote">
            This is what homeowners see. Contractors get a detailed scope sheet with materials, timeline, and verified measurements.
          </p>
        </div>
      </section>

      {/* The Solution */}
      <section className="solutionSection">
        <div className="maxWidth">
          <h2>How PlanDojo Works</h2>
          <p className="sectionLead">
            From photos to actionable plans in seconds. An intelligent system that speaks both homeowner and contractor.
          </p>

          <div className="stepsGrid">
            <div className="stepCard">
              <div className="stepNumber">1</div>
              <h3>Homeowner Uploads Photos</h3>
              <p>Send photos of your space via web or messaging. Tell us what you're dreaming of.</p>
            </div>
            <div className="stepCard">
              <div className="stepNumber">2</div>
              <h3>AURA AI Infers Everything</h3>
              <p>Geometry, materials, depth, layout—all extracted from your photos in under 60 seconds.</p>
            </div>
            <div className="stepCard">
              <div className="stepNumber">3</div>
              <h3>Draft Plan Generated</h3>
              <p>Detailed scope, timeline, materials list, and budget estimate—all auto-generated.</p>
            </div>
            <div className="stepCard">
              <div className="stepNumber">4</div>
              <h3>Contractor Feedback Loop</h3>
              <p>Contractors review, correct, and provide expert estimates. Each correction improves the AI.</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Wedge: Photos to Scope */}
      <section className="wedgeSection">
        <div className="maxWidth">
          <h2>Photos to Scope in &lt; 60 Seconds</h2>
          <p className="sectionLead">
            Our inference engine builds the draft plan in the background while you interact conversationally.
          </p>

          <div className="wedgeContent">
            <div className="wedgeStep">
              <div className="wedgeStepNumber">📸</div>
              <h3>Capture</h3>
              <p>Homeowner sends photos of their space</p>
            </div>
            <div className="wedgeArrow">→</div>
            <div className="wedgeStep">
              <div className="wedgeStepNumber">🧠</div>
              <h3>Infer</h3>
              <p>System measures: ceiling height, counters, cabinets, layout, materials</p>
            </div>
            <div className="wedgeArrow">→</div>
            <div className="wedgeStep">
              <div className="wedgeStepNumber">📋</div>
              <h3>Plan</h3>
              <p>Draft scope, timeline, and budget in &lt; 60 seconds</p>
            </div>
          </div>

          <div className="insightBox">
            <p>
              We are not another lead-gen platform. <strong>We build the bridge of trust</strong> through verified scope, not just qualified leads.
            </p>
          </div>
        </div>
      </section>

      {/* Sample Project Plan */}
      <section className="sampleProjectSection">
        <div className="maxWidth">
          <h2>Example: Kitchen Backsplash Scope</h2>
          <p className="sectionLead">This is what contractors receive. Auto-generated from photos, ready for field verification.</p>

          <div className="samplePlanContainer">
            <div className="planHeader">
              <div>
                <strong>Project Type:</strong> Kitchen Backsplash Replacement (with Window Return)
              </div>
              <div>
                <strong>Location:</strong> Long Valley, NJ
              </div>
            </div>

            <div className="planContent">
              <h3>Before & After Reference</h3>
              <p className="planNote">
                The images provide spatial context so contractors understand the homeowner's target look. Contractor must verify all measurements on-site before final pricing.
              </p>

              <h3>Existing Conditions (From Photos)</h3>
              <ul className="planList">
                <li>Standard 36" countertop height</li>
                <li>Backsplash runs along main counter wall and wraps left side of window return</li>
                <li>Existing grout lines standard width (⅛")</li>
                <li>Substrate: Drywall (standard, no prep required)</li>
              </ul>

              <h3>Proposed Scope</h3>
              <ul className="planList">
                <li>Remove existing backsplash tile and grout</li>
                <li>Prepare substrate: Clean, level, prime</li>
                <li>Install new subway tile with ⅛" grout lines</li>
                <li>Seal grout per manufacturer specs</li>
                <li>Window return trim finish</li>
              </ul>

              <h3>Timeline Estimate</h3>
              <ul className="planList">
                <li><strong>Day 1:</strong> Demolition & substrate prep (4-6 hours)</li>
                <li><strong>Days 2-3:</strong> Tile installation & grouting (8-10 hours)</li>
                <li><strong>Day 4:</strong> Grout sealing & cleanup (2 hours)</li>
              </ul>

              <h3>Budget Breakdown</h3>
              <div className="budgetTable">
                <div className="budgetRow">
                  <span>Materials (tile, grout, primer, sealant)</span>
                  <span>$800 - $1,200</span>
                </div>
                <div className="budgetRow">
                  <span>Labor (3-4 days for experienced tile setter)</span>
                  <span>$2,400 - $3,200</span>
                </div>
                <div className="budgetRow">
                  <span>Permits & Disposal</span>
                  <span>$200 - $400</span>
                </div>
                <div className="budgetRow highlighted">
                  <span><strong>Total Estimate</strong></span>
                  <span><strong>$3,400 - $4,800</strong></span>
                </div>
              </div>

              <div className="contractorNotesBox">
                <h4>🧑‍🔧 Contractor Notes</h4>
                <p>This scope was auto-generated from homeowner photos by PlanDojo. Use this as your baseline:</p>
                <ul className="planList">
                  <li>Refine cost based on local market rates</li>
                  <li>Verify all measurements during site visit</li>
                  <li>Suggest material alternatives (premium tile, grout colors)</li>
                  <li>Note any existing conditions requiring adjustment</li>
                </ul>
                <p className="feedbackNote">
                  <strong>Critical:</strong> Each correction you provide improves our AI's accuracy for future homeowners. Your expertise is the moat.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Moat */}
      <section className="moatSection">
        <div className="maxWidth">
          <h2>The Intelligence Flywheel</h2>
          <p className="sectionLead">
            Every project tightens the loop between AI and contractor reality.
          </p>

          <div className="flyWheelGrid">
            <div className="flyWheelStep">
              <div className="circleNumber">1</div>
              <h3>Homeowner uploads photos</h3>
            </div>
            <div className="flyWheelArrow">↓</div>
            <div className="flyWheelStep">
              <div className="circleNumber">2</div>
              <h3>AURA generates draft plan</h3>
            </div>
            <div className="flyWheelArrow">↓</div>
            <div className="flyWheelStep">
              <div className="circleNumber">3</div>
              <h3>Contractor reviews & corrects</h3>
            </div>
            <div className="flyWheelArrow">↓</div>
            <div className="flyWheelStep">
              <div className="circleNumber">4</div>
              <h3>Corrections feed back into AURA</h3>
            </div>
            <div className="flyWheelArrow">↓</div>
            <div className="flyWheelStep">
              <div className="circleNumber">5</div>
              <h3>Model improves (50% → 75% → 85%+ accuracy)</h3>
            </div>
          </div>

          <div className="moatFeatures">
            <div className="moatFeature">
              <strong>🔄 Compounding Data Moat</strong>
              <p>Every contractor correction becomes training data. Spatial precision improves over time, widening the gap from generalist AI.</p>
            </div>
            <div className="moatFeature">
              <strong>🤝 Aligned Ecosystem</strong>
              <p>Homeowners get clarity. Contractors get pre-scoped leads. AI gets smarter. Everyone wins.</p>
            </div>
            <div className="moatFeature">
              <strong>📊 Defensible Position</strong>
              <p>We own the pre-bid alignment layer—the new standard between homeowners and contractors.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Now */}
      <section className="whyNowSection">
        <div className="maxWidth">
          <h2>Why Now?</h2>
          <p className="sectionLead">
            Three forces converge: better AI, frustrated contractors, and inflation-weary homeowners.
          </p>

          <div className="whyNowGrid">
            <div className="whyNowCard">
              <h3>🤖 Frontier AI Models</h3>
              <p>Multimodal models now infer geometry, materials, depth, and layout from a single photo with high fidelity.</p>
              <p className="small">Photo → Structured Scope Plan is finally possible.</p>
            </div>
            <div className="whyNowCard">
              <h3>🏗️ Contractor Economics</h3>
              <p>30–40% of contractor effort wasted on unqualified leads and triage. They will engage for pre-scoped homeowners.</p>
              <p className="small">Clear scope = faster, better bids.</p>
            </div>
            <div className="whyNowCard">
              <h3>📈 Homeowner Behavior</h3>
              <p>Inflation made opaque pricing unacceptable. Homeowners demand clarity on scope before committing capital.</p>
              <p className="small">Equity unlock: Clarity = Confidence.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Competitive Positioning */}
      <section className="positioningSection">
        <div className="maxWidth">
          <h2>Market Positioning: We Own the Alignment Layer</h2>

          <div className="stackDiagram">
            <div className="stackBox">
              <strong>Lead-Gen Layer</strong>
              <p className="small">Angi, Thumbtack, Houzz (low intent, high noise)</p>
            </div>
            <div className="stackArrow">↓</div>
            <div className="stackBox highlight">
              <strong>🎯 PlanDojo – Alignment Layer</strong>
              <p className="small">Photo-to-Scope Pre-Bid Qualification (AUTHENTICATED INTENT)</p>
            </div>
            <div className="stackArrow">↓</div>
            <div className="stackBox">
              <strong>Operations Layer</strong>
              <p className="small">Buildertrend, Joist, Procore (project execution)</p>
            </div>
          </div>

          <div className="insightBox">
            <p>
              <strong>The insight:</strong> Marketplaces sell leads and hope for alignment. We sell <strong>authenticated scope</strong> and build trust. That's a different business.
            </p>
          </div>

          <h3>Our Defensible Advantages</h3>
          <ul className="advantageList">
            <li>
              <strong>Pre-Bid Intelligence:</strong> We replace "unqualified lead" with "verified scope." Contractors actually trust it.
            </li>
            <li>
              <strong>Compounding Moat:</strong> Each contractor correction improves AURA's spatial precision, widening the gap from ChatGPT.
            </li>
            <li>
              <strong>Zero-Friction Wedge:</strong> Homeowners get before/after clarity. Contractors get draft scope for free. Both come back.
            </li>
          </ul>
        </div>
      </section>

      {/* CTA Section */}
      <section className="ctaSection">
        <div className="maxWidth">
          <h2>Join the Alignment Revolution</h2>
          <p>Be part of the beta. Help us end renovation chaos.</p>
          <form onSubmit={handleSubmit} className="waitlistForm ctaForm">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="emailInput"
            />
            <button type="submit" disabled={loading} className="ctaButton">
              {loading ? "Joining..." : "Join Waitlist"}
            </button>
          </form>
          {submitted && <p className="successMessage">✓ You're on the list!</p>}
          {error && <p className="errorMessage">{error}</p>}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="maxWidth">
          <p>&copy; 2026 PlanDojo. Clarity for home renovation.</p>
        </div>
      </footer>

      <div className="metricsWidget" aria-live="polite">
        <div className="metricsHeading">Live engagement</div>
        <div className="metricsItem">
          <span className="metricsValue">{metrics.signups.toLocaleString()}</span>
          <span className="metricsLabel">Signups</span>
        </div>
        <div className="metricsItem">
          <span className="metricsValue">{metrics.visits.toLocaleString()}</span>
          <span className="metricsLabel">Page visits</span>
        </div>
        <div className="metricsNote">
          {metricsLoading ? "Updating…" : metricsError ? metricsError : "Refreshed on page load"}
        </div>
      </div>
    </main>
  );
}
