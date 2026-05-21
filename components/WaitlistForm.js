"use client";
import { useState } from "react";

export default function WaitlistForm({ buttonText, className = "", source = "homeowner" }) {
  const [email, setEmail] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
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
    setResponseMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setResponseMessage(data.message);
      setEmail("");
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
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="emailInput"
        />
        <button type="submit" disabled={loading} className="ctaButton">
          {loading ? "Checking..." : buttonText}
        </button>
      </form>
      {responseMessage && <p className="successMessage">{responseMessage}</p>}
      {error && <p className="errorMessage">{error}</p>}
    </div>
  );
}
