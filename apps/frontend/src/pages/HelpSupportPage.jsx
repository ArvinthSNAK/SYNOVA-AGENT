import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  Search,
  MessageSquare,
  PhoneCall,
  Clock,
  Sparkles,
  Shield,
  FileQuestion,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Car,
  FileText,
  AlertTriangle,
  Upload,
  X,
  ExternalLink,
  Wrench,
  LifeBuoy,
  MessageCircle,
  ArrowRight,
  Headphones,
  Check,
  Building,
} from 'lucide-react';
import UserNavbar from '../components/layout/UserNavbar.jsx';
import EulerChat from '../features/dashboard/components/EulerChat.jsx';
import { useUser } from '../context/UserContext.jsx';
import './HelpSupportPage.css';

const FAQ_CATEGORIES = [
  { id: 'all', label: 'All FAQs' },
  { id: 'claims', label: 'Claims & Accidents', icon: Shield },
  { id: 'renewals', label: 'Renewals & Expiry', icon: Clock },
  { id: 'endorsements', label: 'Endorsements & Policy Edits', icon: FileText },
  { id: 'cashless', label: 'Cashless Garages & RSA', icon: Wrench },
  { id: 'payments', label: 'Payments & Tax Invoices', icon: Building },
];

const FAQS_DATA = [
  {
    id: 'faq-1',
    category: 'claims',
    question: 'How do I register a zero-touch cashless auto claim after an accident?',
    answer:
      'You can register an instant claim through Euler AI or our 24/7 dedicated Claims Desk. Submit 3 photos of the vehicle damage and spot location. Euler validates coverage against your IDV in under 90 seconds and automatically dispatches a cashless towing partner to the nearest authorized workshop.',
    popular: true,
  },
  {
    id: 'faq-2',
    category: 'claims',
    question: 'What is the Zero Depreciation (Bumper-to-Bumper) add-on settlement process?',
    answer:
      'With Zero Depreciation, you receive 100% reimbursement on replacement of metal, nylon, rubber, and glass parts without any depreciation deduction. Only the compulsory deductible (typically ₹1,000 to ₹2,000 depending on vehicle engine capacity) applies at settlement.',
    popular: true,
  },
  {
    id: 'faq-3',
    category: 'renewals',
    question: 'How does No Claim Bonus (NCB) transfer work when switching carriers?',
    answer:
      'Your accumulated NCB discount (up to 50%) is tied to you as a driver, not the vehicle or insurer. During renewal on Synova, simply provide your previous policy number or upload your renewal notice. Our automated OCR pipeline verifies your NCB certificate and applies the full discount instantly.',
    popular: true,
  },
  {
    id: 'faq-4',
    category: 'renewals',
    question: 'What happens if my auto insurance policy has already expired?',
    answer:
      'If expired within 90 days, you can still retain your accumulated NCB discount. Synova offers zero-inspection fast renewals if expired within 30 days for select partner carriers. For longer lapses, an automated self-video inspection link will be generated instantly.',
    popular: false,
  },
  {
    id: 'faq-5',
    category: 'endorsements',
    question: 'How do I update my vehicle registration number or CNG kit endorsement?',
    answer:
      'Navigate to Settings > Vehicle & Policies, or submit a support ticket below with your updated RC (Registration Certificate) copy and invoice. Endorsement certificates are typically issued within 4 to 8 working hours.',
    popular: false,
  },
  {
    id: 'faq-6',
    category: 'cashless',
    question: 'How do I avail 24/7 Roadside Assistance (RSA) for flat tire or battery jump-start?',
    answer:
      'Call our 24/7 Emergency RSA Hotline at 1800-796-682 or tap the "Request Instant Callback" button above. An RSA technician with GPS tracking will be dispatched to your location with an average response time of under 35 minutes across major cities.',
    popular: true,
  },
  {
    id: 'faq-7',
    category: 'payments',
    question: 'Where can I download my 80D tax certificate and GST invoices?',
    answer:
      'All tax invoices and digital policy certificates are permanently stored in your Insurance Vault (/wallet) and Policy Certificates page (/policies). You can download signed PDFs with one click anytime.',
    popular: false,
  },
];

const CASHLESS_GARAGES_SAMPLE = [
  { name: 'Advaith Hyundai Authorized Center', city: 'Bengaluru', area: 'Whitefield', distance: '2.4 km', rating: '4.8' },
  { name: 'Kalyani Motors Maruti Arena & Nexa', city: 'Bengaluru', area: 'Outer Ring Road', distance: '4.1 km', rating: '4.7' },
  { name: 'Trident Motors Body & Paint Hub', city: 'Bengaluru', area: 'Koramangala', distance: '5.8 km', rating: '4.9' },
  { name: 'Bosch Car Care Multibrand Service', city: 'Bengaluru', area: 'Indiranagar', distance: '6.2 km', rating: '4.6' },
];

export default function HelpSupportPage() {
  const { user } = useUser();
  const [eulerOpen, setEulerOpen] = useState(false);
  const [activeFaqCategory, setActiveFaqCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState('faq-1');

  // Callback modal state
  const [callbackModalOpen, setCallbackModalOpen] = useState(false);
  const [callbackPhone, setCallbackPhone] = useState(user.phone || '+91 98765 43210');
  const [callbackRequested, setCallbackRequested] = useState(false);

  // Support Ticket Form State
  const [ticketForm, setTicketForm] = useState({
    category: 'Emergency Claim Assistance',
    policyId: 'AUTO-123456 (ICICI Lombard - Hyundai Creta)',
    subject: '',
    description: '',
    urgency: 'high',
    attachmentName: '',
  });
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  // Active tickets list
  const [ticketsList, setTicketsList] = useState([
    {
      id: 'TKT-2026-9041',
      category: 'NCB Certificate Verification',
      subject: 'NCB 50% transfer from previous HDFC ERGO policy',
      status: 'In Progress',
      statusType: 'progress',
      updatedAt: 'Today, 10:15 AM',
      sla: 'SLA: Within 2 hours',
    },
    {
      id: 'TKT-2026-8812',
      category: 'Policy Endorsement',
      subject: 'High-security registration plate (HSRP) number update',
      status: 'Resolved',
      statusType: 'resolved',
      updatedAt: '18 Aug 2026',
      sla: 'Resolved by Agent Sarah',
    },
  ]);

  // Garage search filter
  const [garageSearch, setGarageSearch] = useState('');

  const filteredFaqs = FAQS_DATA.filter((faq) => {
    const matchesCategory = activeFaqCategory === 'all' || faq.category === activeFaqCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredGarages = CASHLESS_GARAGES_SAMPLE.filter(
    (g) =>
      g.name.toLowerCase().includes(garageSearch.toLowerCase()) ||
      g.area.toLowerCase().includes(garageSearch.toLowerCase()) ||
      g.city.toLowerCase().includes(garageSearch.toLowerCase())
  );

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    if (!ticketForm.subject.trim() || !ticketForm.description.trim()) return;

    setIsSubmittingTicket(true);
    setTimeout(() => {
      const newId = `TKT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmittedTicketId(newId);
      setTicketsList([
        {
          id: newId,
          category: ticketForm.category,
          subject: ticketForm.subject,
          status: 'Under Review',
          statusType: 'progress',
          updatedAt: 'Just now',
          sla: 'Priority SLA: 30 minutes',
        },
        ...ticketsList,
      ]);
      setIsSubmittingTicket(false);
      setTicketSubmitted(true);
    }, 600);
  };

  const handleRequestCallback = (e) => {
    e.preventDefault();
    setCallbackRequested(true);
    setTimeout(() => {
      setCallbackModalOpen(false);
      setCallbackRequested(false);
    }, 2500);
  };

  return (
    <div className="dashboard-layout mesh-ambient-bg">
      <UserNavbar />

      <main className="help-content" id="main-content" tabIndex={-1}>
        {/* Hero Section with Quick Search */}
        <section className="help-hero glass-panel">
          <div className="help-hero-badge">
            <span className="help-live-dot" />
            <span>24/7 Dedicated Concierge & Emergency Response</span>
          </div>

          <h1 className="help-hero-title">
            How can we assist you, <span className="help-title-accent">{user.name || 'Naresh'}</span>?
          </h1>
          <p className="help-hero-subtitle">
            Instant AI resolution with Euler Copilot, 24/7 accident roadside assistance, or direct priority claims desk.
          </p>

          {/* Quick Search */}
          <div className="help-search-box">
            <Search size={18} className="help-search-icon" />
            <input
              type="search"
              className="help-search-input"
              placeholder="Search help topics, zero-dep claims, NCB transfer, cashless garages, invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="help-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </section>

        {/* 4 Main Support Channels Cards */}
        <div className="help-channels-grid">
          {/* Card 1: Euler AI */}
          <motion.div
            whileHover={{ y: -4 }}
            className="help-channel-card help-channel-card--euler glass-card"
          >
            <div className="help-channel-icon-wrap euler-accent-bg">
              <Sparkles size={24} />
            </div>
            <div className="help-channel-body">
              <div className="help-channel-tag">Instant AI Response</div>
              <h2 className="help-channel-title">Euler Copilot</h2>
              <p className="help-channel-desc">
                24/7 insurance copilot for instant policy Q&A, NCB calculations, quote comparisons, and claims guidance.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEulerOpen(true)}
              className="help-channel-btn help-channel-btn--euler"
            >
              <MessageSquare size={16} />
              <span>Ask Euler Copilot</span>
              <ArrowRight size={14} />
            </button>
          </motion.div>

          {/* Card 2: 24/7 Emergency RSA */}
          <motion.div
            whileHover={{ y: -4 }}
            className="help-channel-card help-channel-card--emergency glass-card"
          >
            <div className="help-channel-icon-wrap emergency-accent-bg">
              <PhoneCall size={24} />
            </div>
            <div className="help-channel-body">
              <div className="help-channel-tag help-channel-tag--urgent">Accident & Roadside</div>
              <h2 className="help-channel-title">24/7 Emergency RSA</h2>
              <p className="help-channel-desc">
                Flat tire, accident towing, battery jump-start, or fuel assistance. Average dispatch in &lt; 35 mins.
              </p>
            </div>
            <div className="help-channel-actions-row">
              <a href="tel:1800796682" className="help-channel-btn help-channel-btn--call">
                <Phone size={15} />
                <span>1800-796-682 (Toll Free)</span>
              </a>
              <button
                type="button"
                onClick={() => setCallbackModalOpen(true)}
                className="help-channel-btn help-channel-btn--secondary"
              >
                Instant Callback
              </button>
            </div>
          </motion.div>

          {/* Card 3: WhatsApp Support */}
          <motion.div
            whileHover={{ y: -4 }}
            className="help-channel-card help-channel-card--whatsapp glass-card"
          >
            <div className="help-channel-icon-wrap whatsapp-accent-bg">
              <MessageCircle size={24} />
            </div>
            <div className="help-channel-body">
              <div className="help-channel-tag">Fastest Mobile Support</div>
              <h2 className="help-channel-title">WhatsApp Concierge</h2>
              <p className="help-channel-desc">
                Receive policy PDFs, share accident photos on the spot, and track live repair progress with our agent.
              </p>
            </div>
            <a
              href="https://wa.me/919876543210?text=Hi%20Synova%20Support,%20I%20need%20assistance%20with%20my%20policy"
              target="_blank"
              rel="noopener noreferrer"
              className="help-channel-btn help-channel-btn--whatsapp"
            >
              <MessageCircle size={16} />
              <span>Chat on WhatsApp</span>
              <ExternalLink size={13} />
            </a>
          </motion.div>

          {/* Card 4: Priority Claims Desk */}
          <motion.div
            whileHover={{ y: -4 }}
            className="help-channel-card help-channel-card--claims glass-card"
          >
            <div className="help-channel-icon-wrap claims-accent-bg">
              <Shield size={24} />
            </div>
            <div className="help-channel-body">
              <div className="help-channel-tag">Cashless Repairs</div>
              <h2 className="help-channel-title">Priority Claims Desk</h2>
              <p className="help-channel-desc">
                Direct settlement coordinator with ICICI Lombard, HDFC ERGO, and Bajaj Allianz network surveyors.
              </p>
            </div>
            <a href="mailto:claims@synova.ai" className="help-channel-btn help-channel-btn--claims">
              <Mail size={16} />
              <span>claims@synova.ai</span>
            </a>
          </motion.div>
        </div>

        {/* Main 2-Column Section: Ticket Submission & Active Tickets */}
        <div className="help-main-grid">
          {/* Left Column: Create Support Ticket */}
          <div className="help-ticket-card glass-card">
            <div className="help-card-header">
              <div className="help-card-header-icon">
                <FileQuestion size={20} />
              </div>
              <div>
                <h2 className="help-card-title">Submit a Priority Support Request</h2>
                <p className="help-card-desc">
                  Our claims and policy endorsement specialists respond within 30 minutes.
                </p>
              </div>
            </div>

            {ticketSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="help-ticket-success-panel"
              >
                <div className="help-success-badge-icon">
                  <CheckCircle2 size={40} />
                </div>
                <h3>Support Request Dispatched!</h3>
                <p className="help-success-id mono">Reference ID: {submittedTicketId}</p>
                <p className="help-success-text">
                  We have logged your ticket under category <strong>{ticketForm.category}</strong>. Our priority desk will reach out to you via registered email ({user.email || 'naresh.kumar@email.com'}) and phone.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setTicketSubmitted(false);
                    setTicketForm({
                      category: 'Emergency Claim Assistance',
                      policyId: 'AUTO-123456 (ICICI Lombard - Hyundai Creta)',
                      subject: '',
                      description: '',
                      urgency: 'high',
                      attachmentName: '',
                    });
                  }}
                  className="help-btn-submit"
                >
                  Create Another Request
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="help-ticket-form">
                <div className="help-form-row">
                  <div className="help-form-group">
                    <label htmlFor="ticket-category" className="help-form-label">
                      Issue Category <span className="help-required">*</span>
                    </label>
                    <select
                      id="ticket-category"
                      className="help-form-select"
                      value={ticketForm.category}
                      onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                    >
                      <option value="Emergency Claim Assistance">🚨 Emergency Claim Assistance</option>
                      <option value="Policy Endorsement & Corrections">📝 Policy Endorsement & RC Corrections</option>
                      <option value="NCB Certificate Transfer">🛡️ No Claim Bonus (NCB) Transfer</option>
                      <option value="Renewal & Premium Discrepancy">🔄 Renewal Quote Discrepancy</option>
                      <option value="Cashless Garage Coordination">🔧 Cashless Garage Coordination</option>
                      <option value="Billing & Tax Invoice">💳 Billing & 80D Tax Invoice</option>
                      <option value="General Technical Support">⚙️ General Technical Support</option>
                    </select>
                  </div>

                  <div className="help-form-group">
                    <label htmlFor="ticket-policy" className="help-form-label">
                      Linked Policy / Vehicle
                    </label>
                    <select
                      id="ticket-policy"
                      className="help-form-select"
                      value={ticketForm.policyId}
                      onChange={(e) => setTicketForm({ ...ticketForm, policyId: e.target.value })}
                    >
                      <option value="AUTO-123456 (ICICI Lombard - Hyundai Creta)">
                        AUTO-123456 · KA-01-XX-0000 (Hyundai Creta)
                      </option>
                      <option value="NEW-APP (Pending Renewal)">
                        SYN-2026-00124 (In Progress Application)
                      </option>
                      <option value="OTHER">Other / General Inquiry</option>
                    </select>
                  </div>
                </div>

                <div className="help-form-group">
                  <label htmlFor="ticket-subject" className="help-form-label">
                    Subject / Summary <span className="help-required">*</span>
                  </label>
                  <input
                    id="ticket-subject"
                    type="text"
                    className="help-form-input"
                    placeholder="e.g. Need immediate cashless authorization for bumper repair"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    required
                  />
                </div>

                <div className="help-form-group">
                  <label htmlFor="ticket-desc" className="help-form-label">
                    Detailed Description <span className="help-required">*</span>
                  </label>
                  <textarea
                    id="ticket-desc"
                    rows={4}
                    className="help-form-textarea"
                    placeholder="Provide details such as accident location, workshop name, or specific policy corrections needed..."
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                    required
                  />
                </div>

                <div className="help-form-row">
                  <div className="help-form-group">
                    <label className="help-form-label">Urgency Level</label>
                    <div className="help-urgency-radios">
                      {[
                        { id: 'normal', label: 'Normal (within 4 hrs)' },
                        { id: 'high', label: 'High Priority (within 1 hr)' },
                        { id: 'urgent', label: 'Critical / On-Road (30 mins)' },
                      ].map((u) => (
                        <label key={u.id} className="help-radio-label">
                          <input
                            type="radio"
                            name="urgency"
                            value={u.id}
                            checked={ticketForm.urgency === u.id}
                            onChange={(e) => setTicketForm({ ...ticketForm, urgency: e.target.value })}
                          />
                          <span>{u.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="help-form-group">
                    <label className="help-form-label">Attach Document / Photo (Optional)</label>
                    <label className="help-upload-box">
                      <input
                        type="file"
                        className="sr-only"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setTicketForm({ ...ticketForm, attachmentName: e.target.files[0].name });
                          }
                        }}
                      />
                      <Upload size={16} className="help-upload-icon" />
                      <span className="help-upload-text">
                        {ticketForm.attachmentName || 'Upload Damage Photo, RC copy, or Invoice'}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="help-form-footer">
                  <div className="help-form-guarantee">
                    <Shield size={14} /> End-to-end encrypted with policyholder SLA guarantee.
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmittingTicket}
                    className="help-btn-submit"
                  >
                    {isSubmittingTicket ? (
                      <>
                        <div className="help-spinner" />
                        <span>Dispatching...</span>
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>Submit Priority Ticket</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Column: Active Tickets & Cashless Garages */}
          <div className="help-sidebar-stack">
            {/* Active Tickets Widget */}
            <div className="help-status-card glass-card">
              <div className="help-card-header">
                <div className="help-card-header-icon">
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="help-card-title">My Active Support Tickets</h3>
                  <p className="help-card-desc">Real-time status tracking and SLA milestones</p>
                </div>
              </div>

              <div className="help-tickets-list">
                {ticketsList.map((ticket) => (
                  <div key={ticket.id} className="help-ticket-item">
                    <div className="help-ticket-top">
                      <span className="help-ticket-id mono">{ticket.id}</span>
                      <span className={`help-ticket-badge help-ticket-badge--${ticket.statusType}`}>
                        {ticket.status}
                      </span>
                    </div>
                    <h4 className="help-ticket-subject">{ticket.subject}</h4>
                    <div className="help-ticket-meta">
                      <span>{ticket.category}</span>
                      <span>·</span>
                      <span>{ticket.updatedAt}</span>
                    </div>
                    <div className="help-ticket-sla">{ticket.sla}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Cashless Garages Locator */}
            <div className="help-garages-card glass-card">
              <div className="help-card-header">
                <div className="help-card-header-icon">
                  <MapPin size={18} />
                </div>
                <div>
                  <h3 className="help-card-title">Nearby Cashless Garages</h3>
                  <p className="help-card-desc">Authorized network body shops in Bengaluru</p>
                </div>
              </div>

              <div className="help-garage-search-wrap">
                <input
                  type="text"
                  placeholder="Filter by area e.g. Whitefield, Koramangala..."
                  value={garageSearch}
                  onChange={(e) => setGarageSearch(e.target.value)}
                  className="help-garage-search-input"
                />
              </div>

              <div className="help-garages-list">
                {filteredGarages.map((g) => (
                  <div key={g.name} className="help-garage-item">
                    <div className="help-garage-info">
                      <div className="help-garage-name">{g.name}</div>
                      <div className="help-garage-loc">
                        {g.area}, {g.city} · <span className="help-distance">{g.distance}</span>
                      </div>
                    </div>
                    <div className="help-garage-rating">★ {g.rating}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Categorized FAQs Section */}
        <section className="help-faqs-section glass-panel">
          <div className="help-faqs-head">
            <div className="help-faqs-head-badge">
              <LifeBuoy size={14} />
              <span>Knowledge Base & Guides</span>
            </div>
            <h2 className="help-faqs-title">Frequently Asked Questions</h2>
            <p className="help-faqs-subtitle">
              Comprehensive answers regarding zero-dep claims, NCB discount retention, and carrier integrations.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="help-faq-filters">
            {FAQ_CATEGORIES.map((cat) => {
              const Icon = cat.icon || HelpCircle;
              const isActive = activeFaqCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveFaqCategory(cat.id)}
                  className={`help-faq-filter-btn ${isActive ? 'help-faq-filter-btn--active' : ''}`}
                >
                  <Icon size={15} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* FAQ Accordion List */}
          <div className="help-faq-accordion">
            {filteredFaqs.length === 0 ? (
              <div className="help-faq-empty">
                <AlertCircle size={24} />
                <p>No questions found matching &ldquo;{searchQuery}&rdquo;. Try asking Euler Copilot directly above!</p>
              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const isOpen = expandedFaq === faq.id;
                return (
                  <div key={faq.id} className={`help-faq-card ${isOpen ? 'help-faq-card--open' : ''}`}>
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(isOpen ? null : faq.id)}
                      className="help-faq-trigger"
                      aria-expanded={isOpen}
                    >
                      <div className="help-faq-q-text">
                        {faq.popular && <span className="help-faq-popular-tag">Popular</span>}
                        <span>{faq.question}</span>
                      </div>
                      <div className="help-faq-arrow-wrap">
                        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="help-faq-body"
                        >
                          <p>{faq.answer}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Corporate Support Contacts Banner */}
        <section className="help-contact-banner glass-card">
          <div className="help-contact-col">
            <div className="help-contact-icon">
              <Headphones size={22} />
            </div>
            <div>
              <h3>General Support</h3>
              <p>Mon – Sat, 8:00 AM – 9:00 PM IST</p>
              <a href="mailto:support@synova.ai" className="help-contact-link">support@synova.ai</a>
            </div>
          </div>

          <div className="help-contact-col">
            <div className="help-contact-icon emergency-accent-color">
              <Shield size={22} />
            </div>
            <div>
              <h3>24/7 Dedicated Claims</h3>
              <p>Immediate surveyor appointment & cashless approvals</p>
              <a href="tel:1800796682" className="help-contact-link">1800-796-682</a>
            </div>
          </div>

          <div className="help-contact-col">
            <div className="help-contact-icon">
              <MapPin size={22} />
            </div>
            <div>
              <h3>Corporate Headquarters</h3>
              <p>Level 8, Tech Park Avenue, Whitefield, Bengaluru - 560066</p>
              <span className="help-contact-note">Authorized IRDAI Web Aggregator</span>
            </div>
          </div>
        </section>
      </main>

      {/* Request Callback Modal */}
      <AnimatePresence>
        {callbackModalOpen && (
          <div className="help-modal-backdrop" onClick={() => setCallbackModalOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              className="help-modal-card glass-card"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="help-modal-close"
                onClick={() => setCallbackModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              <div className="help-modal-icon-wrap emergency-accent-bg">
                <PhoneCall size={26} />
              </div>

              <h3 className="help-modal-title">Request 24/7 Priority Callback</h3>
              <p className="help-modal-desc">
                An on-duty emergency claims & RSA officer will connect with your registered mobile in under 45 seconds.
              </p>

              {callbackRequested ? (
                <div className="help-modal-success">
                  <CheckCircle2 size={32} color="#10B981" />
                  <h4>Callback Request Received!</h4>
                  <p>Calling <strong>{callbackPhone}</strong> right now...</p>
                </div>
              ) : (
                <form onSubmit={handleRequestCallback} className="help-modal-form">
                  <div className="help-form-group">
                    <label htmlFor="modal-phone" className="help-form-label">
                      Mobile Number to Call
                    </label>
                    <input
                      id="modal-phone"
                      type="tel"
                      className="help-form-input"
                      value={callbackPhone}
                      onChange={(e) => setCallbackPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="help-modal-actions">
                    <button
                      type="button"
                      className="help-btn-secondary"
                      onClick={() => setCallbackModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="help-btn-submit">
                      <PhoneCall size={15} />
                      <span>Call Me Now</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Euler AI Copilot Chat Drawer */}
      <EulerChat open={eulerOpen} onClose={() => setEulerOpen(false)} />
    </div>
  );
}
