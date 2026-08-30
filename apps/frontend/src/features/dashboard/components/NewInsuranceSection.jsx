import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import './NewInsuranceSection.css';

export default function NewInsuranceSection() {
  const navigate = useNavigate();

  return (
    <section className="new-insurance-section" aria-label="Get a new insurance policy">
      <div className="new-insurance-content">
        <div className="new-insurance-label">
          <Sparkles size={14} aria-hidden="true" />
          Get a New Policy
        </div>
        <h3 className="new-insurance-heading">Looking for better coverage?</h3>
        <p className="new-insurance-body">
          Tell Euler about your vehicle and insurance needs. We'll help you find
          and compare suitable options tailored to you.
        </p>
        <button
          className="new-insurance-cta"
          onClick={() => navigate('/new-insurance')}
          aria-label="Start a new insurance application with Euler"
        >
          <Sparkles size={16} aria-hidden="true" />
          Start with Euler
          <ArrowRight size={15} className="new-insurance-arrow" aria-hidden="true" />
        </button>
      </div>
      <div className="new-insurance-decoration" aria-hidden="true">
        <div className="new-insurance-circle new-insurance-circle--1" />
        <div className="new-insurance-circle new-insurance-circle--2" />
        <div className="new-insurance-circle new-insurance-circle--3" />
      </div>
    </section>
  );
}
