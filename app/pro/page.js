"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import WaitlistForm from "../../components/WaitlistForm";

export default function ProPage() {
  const [slider, setSlider] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const containerRef = useRef(null);

  const toggleTab = (id) => setActiveTab(activeTab === id ? null : id);

  const startDrag = (e) => {
    e?.preventDefault?.();
    setDragging(true);
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";
  };

  const stopDrag = useCallback(() => {
    setDragging(false);
    document.body.style.userSelect = "";
    document.body.style.webkitUserSelect = "";
  }, []);

  const onDrag = useCallback(
    (e) => {
      if (!dragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      let percent = ((x - rect.left) / rect.width) * 100;
      percent = Math.max(0, Math.min(100, percent));
      setSlider(percent);
    },
    [dragging]
  );

  const handleSliderKeyDown = (e) => {
    if (e.key === "ArrowLeft") setSlider((s) => Math.max(0, s - 2));
    if (e.key === "ArrowRight") setSlider((s) => Math.min(100, s + 2));
  };

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

  return (
    <>
      {/* NAV */}
      <nav className="topNav">
        <span className="navLogo">
          Plan<span style={{ color: "#2563eb" }}>Dojo</span>
          <span style={{ marginLeft: "8px", fontSize: "11px", fontFamily: "monospace", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>Pro</span>
        </span>
        <div className="navActions">
          <a href="/" className="navVideoButton" style={{ textDecoration: "none" }}>For Homeowners →</a>
        </div>
      </nav>

      <main className="main">

        {/* SECTION 1 — HERO */}
        <header className="hero snapSection" style={{ paddingTop: "64px", paddingBottom: "20px" }}>
          <div className="heroContent" style={{ maxWidth: "800px" }}>

            <div className="badge">Contractor Pro Beta</div>

            <h1 style={{ fontSize: "52px", fontWeight: "700", marginBottom: "20px", color: "#1e293b", lineHeight: "1.15", letterSpacing: "-1.2px" }}>
              This homeowner arrived pre-aligned.<br />No triage. No confusion.
            </h1>

            <p className="heroSubtitle" style={{ fontSize: "22px", fontWeight: "500" }}>
              PlanDojo generates a structured draft scope before you ever step on site.
            </p>

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
              style={{ marginTop: "40px", marginBottom: "40px" }}
            >
              <img src="/after.jpg" className="imgNormalized" alt="Renovated space" draggable={false} />
              <div className="mask" style={{ clipPath: `inset(0 ${100 - slider}% 0 0)` }}>
                <img src="/before.jpg" className="imgNormalized" alt="Current space" draggable={false} />
              </div>
              <div className="handle" style={{ left: `${slider}%` }}>
                <div className="handleLine"></div>
                <div className="handleCircle"></div>
              </div>
            </div>

            <div className="heroCtas" style={{ flexDirection: "row", justifyContent: "center", flexWrap: "wrap", gap: "16px" }}>
              <WaitlistForm
                buttonText="Join Contractor Pro Beta"
                source="pro"
              />
              <button
                className="navVideoButton"
                style={{ padding: "14px 24px", fontSize: "15px" }}
                onClick={() => document.getElementById("scope-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                See the Draft Scope Example ↓
              </button>
            </div>

          </div>
        </header>

        {/* SECTION 2 — DRAFT SCOPE + WHY */}
        <div className="snapSection" id="scope-section">

          {/* Draft Scope */}
          <section className="sampleProjectSection" style={{ paddingTop: "80px" }}>
            <div className="maxWidth">

              <div style={{ marginBottom: "48px", textAlign: "center" }}>
                <span className="badge">Live Draft Scope — Kitchen Backsplash</span>
                <h2 style={{ marginTop: "16px" }}>You verify — not educate.</h2>
                <p className="sectionLead" style={{ maxWidth: "640px", margin: "16px auto 0" }}>
                  The homeowner has already reviewed this document. They know what they want, what it costs, and how long it takes. You show up to confirm — not explain.
                </p>
              </div>

              <div className="accordionWrapper" role="tablist">

                <div className="accordionItem">
                  <button className="accordionHeader" role="tab" aria-expanded={activeTab === 1} aria-controls="panel-1" onClick={() => toggleTab(1)}>
                    <span>📐 Verified Geometry &amp; Spatial Constraints</span>
                    <span className="accordionIndicator">{activeTab === 1 ? "−" : "+"}</span>
                  </button>
                  {activeTab === 1 && (
                    <div className="accordionContent" role="tabpanel" id="panel-1">
                      <p className="planNote">Homeowner has reviewed and confirmed these parameters before contacting you.</p>
                      <ul className="planList">
                        <li>Verified 36" countertop height baseline parameters.</li>
                        <li>Backsplash runs along primary wall and wraps left side of window return.</li>
                        <li>Existing grout matrices evaluated at uniform ⅛" runtime bounds.</li>
                        <li>Substrate: Drywall (stable, standard preparation profile).</li>
                      </ul>
                    </div>
                  )}
                </div>

                <div className="accordionItem">
                  <button className="accordionHeader" role="tab" aria-expanded={activeTab === 2} aria-controls="panel-2" onClick={() => toggleTab(2)}>
                    <span>📋 Proposed Technical Scope Matrix</span>
                    <span className="accordionIndicator">{activeTab === 2 ? "−" : "+"}</span>
                  </button>
                  {activeTab === 2 && (
                    <div className="accordionContent" role="tabpanel" id="panel-2">
                      <p className="planNote">Homeowner has read and accepted this scope. You verify feasibility on site.</p>
                      <ul className="planList">
                        <li>Extract existing tile arrays and clear compound adhesive residues.</li>
                        <li>Prepare substrate: clean, plane level, apply structural primer.</li>
                        <li>Set uniform new subway tile pattern with ⅛" precision joint lines.</li>
                        <li>Apply high-durability moisture barrier grout sealant.</li>
                      </ul>
                    </div>
                  )}
                </div>

                <div className="accordionItem">
                  <button className="accordionHeader" role="tab" aria-expanded={activeTab === 3} aria-controls="panel-3" onClick={() => toggleTab(3)}>
                    <span>⏳ Estimated Timeline &amp; Budget Baselines</span>
                    <span className="accordionIndicator">{activeTab === 3 ? "−" : "+"}</span>
                  </button>
                  {activeTab === 3 && (
                    <div className="accordionContent" role="tabpanel" id="panel-3">
                      <p className="planNote">Homeowner has seen and accepted this range. No sticker shock. No scope arguments.</p>
                      <div className="budgetTable">
                        <div className="budgetRow">
                          <span>Phase 1: Demolition &amp; Substrate Prep</span>
                          <strong>4–6 Hours</strong>
                        </div>
                        <div className="budgetRow">
                          <span>Phase 2: Tile Installation &amp; Grouting</span>
                          <strong>8–10 Hours</strong>
                        </div>
                        <div className="budgetRow highlighted">
                          <span>Total Estimated Runtime</span>
                          <span>14–18 Hours</span>
                        </div>
                      </div>
                      <div className="budgetTable" style={{ marginTop: "12px" }}>
                        <div className="budgetRow">
                          <span>Materials (Tile, Grout, Compounds)</span>
                          <strong>$800–$1,200</strong>
                        </div>
                        <div className="budgetRow">
                          <span>Labor Baseline</span>
                          <strong>$2,400–$3,200</strong>
                        </div>
                        <div className="budgetRow highlighted">
                          <span>Total Pre-Bid Baseline</span>
                          <span>$3,400–$4,800</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </section>

          {/* Why Contractors Love It */}
          <section style={{ textAlign: "center", padding: "60px 20px 80px" }}>
            <div className="maxWidth">
              <h2>Why Contractors Love It</h2>
              <div style={{ display: "flex", gap: "20px", justifyContent: "center", marginTop: "40px", flexWrap: "wrap" }}>
                {[
                  { stat: "30–40%", label: "Less triage time per lead" },
                  { stat: "Faster", label: "Quoting — scope is already drafted" },
                  { stat: "Fewer", label: "Back-and-forth messages" },
                  { stat: "Zero", label: "Sticker shock conversations" },
                ].map(({ stat, label }) => (
                  <div key={stat} style={{ flex: "1", minWidth: "200px", padding: "32px 20px", border: "1px solid #e5dcbe", borderRadius: "16px", background: "rgba(255,255,255,0.94)", backdropFilter: "blur(12px)" }}>
                    <div style={{ fontSize: "32px", fontWeight: "800", color: "#2563eb", marginBottom: "8px" }}>{stat}</div>
                    <div style={{ fontSize: "15px", color: "#475569", fontWeight: "500" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>

        {/* SECTION 3 — HOW IT WORKS + FINAL CTA + FOOTER */}
        <div className="snapSection">

          {/* How It Works */}
          <section style={{ textAlign: "center", padding: "80px 20px 60px" }}>
            <div className="maxWidth">
              <h2>How It Works</h2>
              <p className="sectionLead" style={{ maxWidth: "560px", margin: "16px auto 48px" }}>
                PlanDojo does the pre-work. You do the skilled work.
              </p>
              <div style={{ display: "flex", gap: "0px", justifyContent: "center", flexWrap: "wrap", maxWidth: "800px", margin: "0 auto" }}>
                {[
                  { step: "1", title: "Homeowner uploads photos", desc: "They photograph the space directly over messaging — no app download." },
                  { step: "2", title: "PlanDojo drafts the scope", desc: "AURA generates geometry, materials, timeline, and a baseline budget range." },
                  { step: "3", title: "You verify on site", desc: "Show up to a homeowner who already knows what they want and what it costs." },
                  { step: "4", title: "You quote faster", desc: "No education. No expectation resetting. Just your expertise applied to a clean brief." },
                ].map(({ step, title, desc }, i, arr) => (
                  <div key={step} style={{ display: "flex", alignItems: "flex-start", gap: "16px", flex: "1", minWidth: "280px", padding: "20px", position: "relative" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#2563eb", color: "white", fontWeight: "800", fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>{step}</div>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: "700", fontSize: "16px", color: "#1e293b", marginBottom: "6px" }}>{title}</div>
                      <div style={{ fontSize: "14px", color: "#475569", lineHeight: "1.6" }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="ctaSection">
            <div className="maxWidth">
              <h2>Join Contractor Pro Beta</h2>
              <p>Be first to receive pre-aligned homeowner leads. No triage. No wasted site visits.</p>
              <WaitlistForm
                className="ctaForm"
                buttonText="Join Contractor Pro Beta"
                source="pro"
              />
            </div>
          </section>

          <footer className="footer">
            <div className="maxWidth">
              <p>&copy; 2026 PlanDojo. The Pre-Bid Alignment Layer.</p>
            </div>
          </footer>

        </div>

      </main>
    </>
  );
}
