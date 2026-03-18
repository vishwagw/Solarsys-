"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Sun, Zap, BarChart3, Globe, ArrowRight, CheckCircle, Star, TrendingUp, Layers, Cpu, ChevronRight } from "lucide-react";

const STATS = [
  { value: "2.4M+", label: "Panels Designed" },
  { value: "180+", label: "Countries Covered" },
  { value: "94%", label: "Accuracy Rate" },
  { value: "$2.1B", label: "Savings Projected" },
];

const FEATURES = [
  { icon: Globe, title: "Satellite Analysis", desc: "High-resolution satellite imagery analysis to identify rooftop dimensions, orientation, and shading obstructions in real-time.", color: "#00e5ff" },
  { icon: Sun, title: "Solar Irradiance Mapping", desc: "Global solar resource database with hourly irradiance data from NASA & PVGIS to model exact energy potential at any location.", color: "#ffc107" },
  { icon: Layers, title: "Panel Layout Designer", desc: "AI-optimized panel placement maximizing density while respecting setback requirements, shading analysis, and structural load.", color: "#ff6d00" },
  { icon: BarChart3, title: "Energy Yield Simulation", desc: "Physics-based simulation of annual energy production with weather normalization, degradation modeling, and P50/P90 estimates.", color: "#00e676" },
  { icon: TrendingUp, title: "Financial Modeling", desc: "ROI analysis, payback period, NPV, and LCOE calculations with local electricity rates, incentives, and financing options.", color: "#ce93d8" },
  { icon: Cpu, title: "AI Design Engine", desc: "Machine learning models trained on 50,000+ solar installations to recommend optimal system configurations automatically.", color: "#80cbc4" },
];

const TESTIMONIALS = [
  { name: "Sarah Chen", role: "Solar Project Developer, SunPath Energy", text: "SolarSense reduced our site assessment time from 3 days to 20 minutes. The accuracy of the irradiance data is remarkable.", stars: 5 },
  { name: "Marcus Andresson", role: "CTO, Nordic Renewables", text: "The financial modeling tools alone saved us €2M in mispriced proposals. This platform is transforming how we do solar development.", stars: 5 },
  { name: "Priya Sharma", role: "EPC Manager, SolarGrid India", text: "We deployed 47 rooftop systems across Mumbai using SolarSense designs. Every system is outperforming its projected yield.", stars: 5 },
];

export default function LandingPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const h = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);

  return (
    <div className="min-h-screen grid-bg overflow-x-hidden">
      <div className="fixed pointer-events-none z-0 rounded-full opacity-20 blur-3xl transition-all duration-700"
        style={{ width: 600, height: 600, background: "radial-gradient(circle, rgba(255,193,7,0.3) 0%, transparent 70%)", left: mousePos.x - 300, top: mousePos.y - 300 }} />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-[rgba(255,193,7,0.1)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#ffc107] flex items-center justify-center solar-glow">
            <Sun size={20} color="#050810" fill="#050810" />
          </div>
          <span className="text-xl font-semibold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Solar<span className="gradient-text">Sense</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-[var(--text-secondary)]">
          {["Features", "How It Works", "Testimonials", "Pricing"].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="hover:text-[var(--solar-primary)] transition-colors">{item}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors px-4 py-2">Sign In</Link>
          <Link href="/dashboard" className="text-sm font-medium px-5 py-2.5 rounded-lg bg-[#ffc107] text-[#050810] hover:bg-[#ffca28] transition-all solar-glow" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-24 pb-20 px-8 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(255,193,7,0.3)] bg-[rgba(255,193,7,0.05)] text-sm text-[var(--solar-primary)] mb-8">
          <span className="status-dot active"></span>
          Now with PVGIS global solar database integration
          <ChevronRight size={14} />
        </div>
        <h1 className="text-6xl md:text-7xl font-bold leading-tight mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Design Perfect Solar Systems<br />
          <span className="gradient-text text-solar-glow">From Satellite to Blueprint</span>
        </h1>
        <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
          Harness geospatial intelligence and satellite imagery to analyze any location, optimize panel placement, and generate bankable solar designs in minutes — not days.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 px-8 py-4 rounded-xl bg-[#ffc107] text-[#050810] font-semibold text-base hover:bg-[#ffca28] transition-all solar-glow-strong group" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Launch Design Studio <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/dashboard" className="flex items-center gap-2 px-8 py-4 rounded-xl border border-[rgba(255,193,7,0.3)] text-[var(--text-primary)] font-medium text-base hover:border-[var(--solar-primary)] hover:bg-[rgba(255,193,7,0.05)] transition-all">
            <Zap size={16} className="text-[#ffc107]" /> Watch Demo
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 py-16 border-y border-[rgba(255,193,7,0.08)]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-8">
          {STATS.map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl font-bold gradient-text mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{stat.value}</div>
              <div className="text-sm text-[var(--text-secondary)]">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 py-24 px-8 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-sm font-mono text-[var(--solar-primary)] mb-3 tracking-widest uppercase">Capabilities</div>
          <h2 className="text-4xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Everything You Need to Deploy Solar at Scale</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(feature => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="card p-6 hover:border-[rgba(255,193,7,0.3)] transition-all group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{ background: `${feature.color}18`, border: `1px solid ${feature.color}30` }}>
                  <Icon size={22} style={{ color: feature.color }} />
                </div>
                <h3 className="text-base font-semibold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{feature.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative z-10 py-24 px-8 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-sm font-mono text-[var(--solar-primary)] mb-3 tracking-widest uppercase">Workflow</div>
          <h2 className="text-4xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>From Address to Bankable Design in 4 Steps</h2>
        </div>
        <div className="space-y-6">
          {[
            { step: "01", title: "Pin Your Location", desc: "Search any address or GPS coordinate. Our platform fetches satellite imagery and geographic data automatically.", color: "#ffc107" },
            { step: "02", title: "Analyze Solar Potential", desc: "We query PVGIS and NASA databases to fetch irradiance, cloud cover, temperature, and seasonal variation data.", color: "#00e5ff" },
            { step: "03", title: "Design Your System", desc: "Draw your roof polygon on the map. Our AI suggests optimal panel count, tilt, azimuth, and inverter configuration.", color: "#ff6d00" },
            { step: "04", title: "Generate Report", desc: "Export a bankable engineering report with energy yield estimates, financial projections, and equipment specs.", color: "#00e676" },
          ].map(step => (
            <div key={step.step} className="card p-6 flex gap-6 items-start hover:border-[rgba(255,193,7,0.2)] transition-all">
              <div className="text-3xl font-bold font-mono flex-shrink-0 w-14" style={{ color: step.color, fontFamily: "'JetBrains Mono', monospace" }}>{step.step}</div>
              <div>
                <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{step.title}</h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative z-10 py-24 px-8 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-sm font-mono text-[var(--solar-primary)] mb-3 tracking-widest uppercase">Social Proof</div>
          <h2 className="text-4xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Trusted by Solar Professionals Worldwide</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="card p-6">
              <div className="flex gap-1 mb-4">{Array.from({ length: t.stars }).map((_, i) => <Star key={i} size={14} fill="#ffc107" color="#ffc107" />)}</div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4 italic">&ldquo;{t.text}&rdquo;</p>
              <div>
                <div className="text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{t.name}</div>
                <div className="text-xs text-[var(--text-muted)]">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 py-24 px-8 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-sm font-mono text-[var(--solar-primary)] mb-3 tracking-widest uppercase">Pricing</div>
          <h2 className="text-4xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Simple, Transparent Pricing</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { name: "Starter", price: "$0", period: "/month", desc: "For individuals exploring solar", features: ["5 designs/month", "Basic irradiance data", "PDF export", "Email support"], cta: "Get Started Free", highlight: false },
            { name: "Professional", price: "$79", period: "/month", desc: "For solar contractors and developers", features: ["Unlimited designs", "PVGIS + NASA data", "3D shading analysis", "Financial modeling", "API access", "Priority support"], cta: "Start 14-Day Trial", highlight: true },
            { name: "Enterprise", price: "Custom", period: "", desc: "For large EPCs and utilities", features: ["Everything in Pro", "White-label option", "Custom integrations", "SLA guarantee", "Dedicated success manager", "On-premise option"], cta: "Contact Sales", highlight: false },
          ].map(plan => (
            <div key={plan.name} className={`card p-6 relative ${plan.highlight ? "border-[rgba(255,193,7,0.4)] solar-glow" : ""}`}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#ffc107] text-[#050810] text-xs font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Most Popular</div>
              )}
              <div className="text-sm text-[var(--text-secondary)] mb-1">{plan.name}</div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{plan.price}</span>
                <span className="text-[var(--text-secondary)] text-sm">{plan.period}</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-5">{plan.desc}</p>
              <ul className="space-y-2 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <CheckCircle size={14} className="text-[#00e676] flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/dashboard" className={`block w-full text-center py-3 rounded-lg text-sm font-medium transition-all ${plan.highlight ? "bg-[#ffc107] text-[#050810] hover:bg-[#ffca28]" : "border border-[rgba(255,193,7,0.3)] text-[var(--text-primary)] hover:border-[var(--solar-primary)]"}`}
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-8">
        <div className="max-w-3xl mx-auto text-center card p-12 solar-glow border-[rgba(255,193,7,0.2)]">
          <div className="w-16 h-16 rounded-2xl bg-[rgba(255,193,7,0.1)] flex items-center justify-center mx-auto mb-6 solar-glow">
            <Sun size={32} className="text-[#ffc107]" />
          </div>
          <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Start Designing Today</h2>
          <p className="text-[var(--text-secondary)] mb-8 text-lg">Join 12,000+ solar professionals who have deployed SolarSense to accelerate their project pipeline.</p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-[#ffc107] text-[#050810] font-semibold text-base hover:bg-[#ffca28] transition-all solar-glow-strong group" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Launch Design Studio <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[rgba(255,193,7,0.08)] py-8 px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#ffc107] flex items-center justify-center">
              <Sun size={14} color="#050810" fill="#050810" />
            </div>
            <span className="font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Solar<span className="gradient-text">Sense</span></span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">© 2025 SolarSense. Powered by PVGIS, NASA POWER, and satellite imagery.</p>
          <div className="flex gap-4 text-xs text-[var(--text-muted)]">
            {["Privacy", "Terms", "API Docs"].map(item => <a key={item} href="#" className="hover:text-[var(--solar-primary)]">{item}</a>)}
          </div>
        </div>
      </footer>
    </div>
  );
}
