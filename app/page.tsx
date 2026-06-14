'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/AuthContext';
import { useModals } from '@/components/ModalsContext';
import { RegistrationModal } from '@/components/RegistrationModal';

// ─── Translation Dictionary ────────────────────────────────────────────────
const translations = {
  id: {
    // Navbar
    nav_features: 'Fitur',
    nav_how: 'Cara Kerja',
    nav_pricing: 'Harga',
    nav_signin: 'Masuk',
    nav_dashboard: 'Buka Dashboard',

    // Hero
    hero_badge: 'CRM Katering B2B Premium',
    hero_pre: 'Kelola Setiap Pesanan,',
    hero_h1: 'CATERING',
    hero_tagline: 'operasi — disederhanakan',
    hero_desc: 'CRM B2B lengkap untuk dapur komersial & pemasok F&B. Kelola kepatuhan klien, sederhanakan logistik, dan prediksi permintaan otomatis dengan AI LSTM — semuanya dalam satu workspace bersih.',
    hero_cta: 'MULAI SEKARANG',
    hero_from: 'Mulai Dari',
    hero_per_month: '/bulan',
    hero_card_name: 'Nasi Goreng Spesial',
    hero_card_min: 'Min. 50 porsi',
    hero_card_badge: 'Terlaris',
    hero_card_price: 'Rp 35.000',
    hero_card_unit: '/porsi',

    // Trust strip
    trust_title: 'Dipercaya oleh bisnis F&B terkemuka di Indonesia',

    // Features
    feat_badge: 'Platform Lengkap',
    feat_h2_1: 'Semua yang Dibutuhkan',
    feat_h2_2: 'Operasi Catering Anda',
    feat_sub: 'Dirancang untuk memecahkan masalah operasional unik yang dihadapi dapur komersial setiap hari.',
    feat_detail: 'Lihat Detail',
    features: [
      { title: 'Kanban Drag-Drop', desc: 'Pantau pesanan dari penawaran awal hingga pengiriman akhir secara real-time.' },
      { title: 'LSTM Demand AI', desc: 'Ramalkan kebutuhan bahan baku akhir pekan dengan akurasi 94% berbasis AI.' },
      { title: 'Kepatuhan Dietary', desc: 'Saring hidangan menu otomatis terhadap Halal, Kosher, atau alergen kacang.' },
      { title: 'Logistik & Kalender', desc: 'Jadwalkan ulang tanggal pengiriman dan pantau armada aktif dengan mudah.' },
    ],

    // Showcase
    show_badge: 'Inventori Menu Visual',
    show_h2_1: 'Kurasi Menu Digital &',
    show_h2_2: 'Kelola Alergen Klien',
    show_desc: 'Klien Anda berhak mendapatkan transparansi penuh. CaterFlow memungkinkan Anda membangun profil kuliner untuk setiap resep — lacak bahan baku, hitung ukuran porsi otomatis hingga 10.000 tamu, dan jalankan pemeriksaan kontaminasi silang secara instan.',
    show_week: 'Porsi/Minggu',
    show_item: 'Ayam Bakar Spesial',
    show_rank: '#1 Terlaris',
    showcase_items: [
      { title: 'Pengukur Porsi', desc: 'Scale otomatis volume bumbu & protein berdasarkan jumlah tamu.' },
      { title: 'Generator Label', desc: 'Buat label kemasan pengiriman dengan peringatan alergen dinamis.' },
      { title: 'Galeri Menu', desc: 'Tampilkan foto catering premium kepada klien dari dashboard.' },
      { title: 'Invoicing PDF', desc: 'Otomatis buat invoice PDF profesional per pesanan klien.' },
    ],

    // How it works
    how_badge: 'Cara Kerja',
    how_h2: 'Dirancang untuk Kepala Dapur & Manajer Logistik',
    how_sub: 'Mengelola pesanan dapur tidak perlu tiga spreadsheet. CaterFlow menyatukan alur kerja dalam satu timeline bersih.',
    how_tabs: [
      { num: '01', title: 'Corong Pesanan Klien', desc: 'Penawaran otomatis mengalir ke daftar DP Lunas dan Dalam Produksi.' },
      { num: '02', title: 'Prediksi Permintaan AI', desc: 'Model LSTM menganalisis tren historis dan menyarankan stok buffer bahan baku.' },
      { num: '03', title: 'Skrining Alergen & Pengiriman', desc: 'Logistik mencocokkan jam pengiriman dan mengingatkan sopir tentang pengecualian klien.' },
    ],
    kanban_title: 'Papan Kanban CRM — Pratinjau Langsung',
    kanban_live: 'Langsung',
    kanban_cols: [
      { label: 'Penawaran', color: 'slate', items: ['PT Maju Jaya — Rp 8.5M', 'CV Sumber Rasa — Rp 3.2M'] },
      { label: 'Dalam Produksi', color: 'orange', items: ['PT Bintang Terang — Rp 12.5M', 'Kopi Kenangan — Rp 4.2M'] },
      { label: 'Terkirim', color: 'emerald', items: ['IndoFood Corp — Rp 22M', 'Gajah Mada — Rp 6.8M'] },
    ],
    lstm_title: 'Prakiraan Jaringan Neural LSTM',
    lstm_training: 'Pelatihan',
    lstm_insight: 'LSTM mendeteksi lonjakan volume akhir pekan. Rekomendasi buffer dapur: +15%. Hari puncak: Sabtu & Minggu.',
    lstm_conf: 'Keyakinan 94%',
    lstm_bars: [{d:'Sen'},{d:'Sel'},{d:'Rab'},{d:'Kam'},{d:'Jum (AI)'},{d:'Sab (AI)'}],
    dietary_title: 'Layar Keamanan Alergen Cerdas',
    dietary_checked: 'Alergen Terverifikasi ✓',
    dietary_rows: [
      { client: 'PT Sukma Abadi', order: 'Ayam Bakar Penyet — 50 porsi', status: 'HALAL PATUH', ok: true },
      { client: 'IndoFood Catering', order: 'Sate Padang — 100 porsi', status: 'KACANG DIKECUALIKAN', ok: false },
      { client: 'Kopi Kenangan', order: 'Nasi Box Premium — 200 porsi', status: 'VEGAN PATUH', ok: true },
    ],

    // Stats
    stats: [
      { value: 'Rp 128M+', label: 'Pendapatan Dikelola / Bulan', icon: 'fa-chart-line' },
      { value: '1.200+', label: 'Pesanan Aktif Harian', icon: 'fa-receipt' },
      { value: '94.2%', label: 'Pengiriman Tepat Waktu', icon: 'fa-truck-fast' },
      { value: '50+', label: 'Klien B2B Aktif', icon: 'fa-handshake' },
    ],

    // Pricing
    price_badge: 'Harga',
    price_h2_1: 'Harga Sederhana &',
    price_h2_2: 'Skala Operasional',
    price_sub: 'Semua paket mencakup fitur Kanban inti. Paket Plus membuka invoicing otomatis, notifikasi WhatsApp, dan AI LSTM.',
    price_monthly: 'Bulanan',
    price_annually: 'Tahunan',
    price_save: 'Hemat 20%',
    price_popular: '⚡ Paling Populer',
    plans: [
      {
        tier: 'Standar',
        name: 'CaterFlow Gratis',
        price_monthly: 'Rp 0',
        price_annually: 'Rp 0',
        per: '/ bulan',
        desc: 'Sempurna untuk startup katering rumahan lokal yang mengelola volume pesanan klien korporat mingguan yang sedikit.',
        features_yes: ['Hingga 5 Klien B2B Aktif', 'Kanban Drag-Drop Penuh', 'Kalender Logistik Standar'],
        features_no: ['Otomasi Invoice PDF', 'Prediksi AI LSTM'],
        cta: 'Mulai Gratis',
        popular: false,
      },
      {
        tier: 'Tier Pertumbuhan',
        name: 'CaterFlow Plus',
        price_monthly: 'Rp 499k',
        price_annually: 'Rp 399k',
        per: '/ bulan',
        desc: 'Membuka operasi berat, invoice B2B cerdas, alert otomatis, dan perkiraan kapasitas machine learning.',
        features_yes: ['Klien B2B CRM Tak Terbatas', 'Kanban Drag-Drop Penuh', 'Otomasi Invoice PDF Premium', 'Prediksi Permintaan Mingguan LSTM', 'Alert Pengiriman WhatsApp Otomatis'],
        features_no: [],
        cta: 'Mulai 14 Hari Gratis',
        popular: true,
      },
    ],

    // CTA
    cta_badge: 'Mulai Hari Ini',
    cta_h2_1: 'Mulai Sederhanakan',
    cta_h2_2: 'Logistik Dapur Anda',
    cta_desc: 'Bergabunglah dengan pemasok F&B yang menjalankan operasi katering tanpa pesanan terlewat dan pemborosan bahan baku diminimalkan.',
    cta_btn1: 'Buka Dashboard',
    cta_btn2: 'Lihat Paket Harga',

    // Footer
    footer_copy: '© 2026 CaterFlow. Semua hak dilindungi. Dibuat untuk logistik F&B grosir.',
    footer_feat: 'Fitur',
    footer_price: 'Harga',
    footer_how: 'Cara Kerja',
  },

  en: {
    // Navbar
    nav_features: 'Features',
    nav_how: 'How It Works',
    nav_pricing: 'Pricing',
    nav_signin: 'Sign In',
    nav_dashboard: 'Go to Dashboard',

    // Hero
    hero_badge: 'Premium B2B Catering CRM',
    hero_pre: 'Manage Every Order,',
    hero_h1: 'CATERING',
    hero_tagline: 'operations — simplified',
    hero_desc: 'The all-in-one B2B CRM built for commercial kitchens & F&B suppliers. Manage client compliance, streamline logistics, and auto-predict demand with LSTM AI — all in one clean workspace.',
    hero_cta: 'GET STARTED',
    hero_from: 'Starting From',
    hero_per_month: '/month',
    hero_card_name: 'Special Fried Rice',
    hero_card_min: 'Min. 50 servings',
    hero_card_badge: 'Bestseller',
    hero_card_price: 'Rp 35,000',
    hero_card_unit: '/serving',

    // Trust strip
    trust_title: 'Trusted by leading F&B businesses in Indonesia',

    // Features
    feat_badge: 'Full Platform',
    feat_h2_1: 'Everything You Need for',
    feat_h2_2: 'Your Catering Operations',
    feat_sub: 'Designed to solve the unique operational challenges faced by commercial kitchens every single day.',
    feat_detail: 'View Details',
    features: [
      { title: 'Kanban Drag-Drop', desc: 'Track orders from initial quote to final delivery in real-time.' },
      { title: 'LSTM Demand AI', desc: 'Forecast weekend ingredient needs with 94% accuracy powered by AI.' },
      { title: 'Dietary Compliance', desc: 'Auto-filter menu dishes against Halal, Kosher, or nut allergens.' },
      { title: 'Logistics & Calendar', desc: 'Reschedule delivery dates and monitor active fleet with ease.' },
    ],

    // Showcase
    show_badge: 'Visual Menu Inventory',
    show_h2_1: 'Digital Menu Curation &',
    show_h2_2: 'Client Allergen Management',
    show_desc: 'Your clients deserve full transparency. CaterFlow lets you build a culinary profile for every recipe — track ingredients, auto-calculate portion sizes for up to 10,000 guests, and run cross-contamination checks instantly.',
    show_week: 'Servings/Week',
    show_item: 'Special Grilled Chicken',
    show_rank: '#1 Bestseller',
    showcase_items: [
      { title: 'Portion Scaler', desc: 'Auto-scale seasoning & protein volume based on guest count.' },
      { title: 'Label Generator', desc: 'Create delivery packaging labels with dynamic allergen warnings.' },
      { title: 'Menu Gallery', desc: 'Showcase premium catering photos to clients from the dashboard.' },
      { title: 'PDF Invoicing', desc: 'Auto-generate professional PDF invoices per client order.' },
    ],

    // How it works
    how_badge: 'How It Works',
    how_h2: 'Built for Kitchen Directors & Logistics Managers',
    how_sub: 'Managing kitchen orders doesn\'t need three spreadsheets. CaterFlow unifies your workflow in one clean timeline.',
    how_tabs: [
      { num: '01', title: 'Client Order Funnel', desc: 'Quotes automatically flow into DP Paid and In Production lists.' },
      { num: '02', title: 'AI Demand Forecasting', desc: 'LSTM model analyzes historical trends and suggests ingredient buffer stock.' },
      { num: '03', title: 'Allergen Screening & Dispatch', desc: 'Logistics matches delivery times and alerts drivers about client exceptions.' },
    ],
    kanban_title: 'CRM Kanban Board — Live Preview',
    kanban_live: 'Live',
    kanban_cols: [
      { label: 'Quotation', color: 'slate', items: ['PT Maju Jaya — Rp 8.5M', 'CV Sumber Rasa — Rp 3.2M'] },
      { label: 'In Production', color: 'orange', items: ['PT Bintang Terang — Rp 12.5M', 'Kopi Kenangan — Rp 4.2M'] },
      { label: 'Delivered', color: 'emerald', items: ['IndoFood Corp — Rp 22M', 'Gajah Mada — Rp 6.8M'] },
    ],
    lstm_title: 'LSTM Neural Network Forecast',
    lstm_training: 'Training',
    lstm_insight: 'LSTM detects a weekend volume spike. Kitchen buffer recommendation: +15%. Peak days: Saturday & Sunday.',
    lstm_conf: '94% Confidence',
    lstm_bars: [{d:'Mon'},{d:'Tue'},{d:'Wed'},{d:'Thu'},{d:'Fri (AI)'},{d:'Sat (AI)'}],
    dietary_title: 'Smart Allergen Safety Screen',
    dietary_checked: 'Allergen Checked ✓',
    dietary_rows: [
      { client: 'PT Sukma Abadi', order: 'Grilled Chicken — 50 servings', status: 'HALAL COMPLIANT', ok: true },
      { client: 'IndoFood Catering', order: 'Satay Padang — 100 servings', status: 'NUT EXCLUDED', ok: false },
      { client: 'Kopi Kenangan', order: 'Premium Rice Box — 200 servings', status: 'VEGAN COMPLIANT', ok: true },
    ],

    // Stats
    stats: [
      { value: 'Rp 128M+', label: 'Revenue Managed / Month', icon: 'fa-chart-line' },
      { value: '1,200+', label: 'Active Daily Orders', icon: 'fa-receipt' },
      { value: '94.2%', label: 'On-Time Delivery Rate', icon: 'fa-truck-fast' },
      { value: '50+', label: 'Active B2B Clients', icon: 'fa-handshake' },
    ],

    // Pricing
    price_badge: 'Pricing',
    price_h2_1: 'Simple Pricing &',
    price_h2_2: 'Operational Scale',
    price_sub: 'All plans include core Kanban features. Plus unlocks auto-invoicing, WhatsApp notifications, and LSTM AI.',
    price_monthly: 'Monthly',
    price_annually: 'Annually',
    price_save: 'Save 20%',
    price_popular: '⚡ Most Popular',
    plans: [
      {
        tier: 'Standard',
        name: 'CaterFlow Free',
        price_monthly: 'Rp 0',
        price_annually: 'Rp 0',
        per: '/ month',
        desc: 'Perfect for local home-based catering startups managing a small volume of weekly corporate orders.',
        features_yes: ['Up to 5 Active B2B Clients', 'Full Drag-Drop Kanban', 'Standard Logistics Calendar'],
        features_no: ['Automated PDF Invoicing', 'LSTM AI Forecasting'],
        cta: 'Start Free',
        popular: false,
      },
      {
        tier: 'Growth Tier',
        name: 'CaterFlow Plus',
        price_monthly: 'Rp 499k',
        price_annually: 'Rp 399k',
        per: '/ month',
        desc: 'Unlocks heavy operations, smart B2B invoicing, automated alerts, and ML capacity forecasting.',
        features_yes: ['Unlimited B2B CRM Clients', 'Full Drag-Drop Kanban', 'Premium PDF Invoice Automation', 'LSTM Weekly Demand Forecasting', 'Automated WhatsApp Delivery Alerts'],
        features_no: [],
        cta: 'Start 14-Day Free Trial',
        popular: true,
      },
    ],

    // CTA
    cta_badge: 'Start Today',
    cta_h2_1: 'Start Simplifying',
    cta_h2_2: 'Your Kitchen Logistics',
    cta_desc: 'Join F&B suppliers who run catering operations with zero missed orders and minimized ingredient waste.',
    cta_btn1: 'Open Dashboard',
    cta_btn2: 'View Pricing Plans',

    // Footer
    footer_copy: '© 2026 CaterFlow. All rights reserved. Built for wholesale F&B logistics.',
    footer_feat: 'Features',
    footer_price: 'Pricing',
    footer_how: 'How It Works',
  },
} as const;

type Lang = 'id' | 'en';

// ─── Feature icon/color config (language-agnostic) ────────────────────────
const featureConfig = [
  { icon: 'fa-clipboard-list', gradient: 'from-[#FF6B35] to-[#FF9F1C]', bg: 'bg-orange-50 dark:bg-orange-950/10', border: 'border-orange-100 dark:border-orange-900/20', accent: 'text-[var(--primary)]' },
  { icon: 'fa-brain',          gradient: 'from-emerald-500 to-teal-500',  bg: 'bg-emerald-50 dark:bg-emerald-950/10', border: 'border-emerald-100 dark:border-emerald-900/20', accent: 'text-emerald-600' },
  { icon: 'fa-shield-halved',  gradient: 'from-rose-500 to-pink-500',     bg: 'bg-rose-50 dark:bg-rose-950/10',       border: 'border-rose-100 dark:border-rose-900/20',     accent: 'text-rose-600' },
  { icon: 'fa-truck',          gradient: 'from-blue-500 to-indigo-500',   bg: 'bg-blue-50 dark:bg-blue-950/10',       border: 'border-blue-100 dark:border-blue-900/20',     accent: 'text-blue-600' },
];

const showcaseIconConfig = ['fa-scale-balanced', 'fa-scroll', 'fa-camera', 'fa-file-invoice'];
const tabIconConfig: ('kanban' | 'lstm' | 'dietary')[] = ['kanban', 'lstm', 'dietary'];
const tabFAIconConfig = ['fa-clipboard-list', 'fa-brain', 'fa-shield-halved'];

const lstmBarConfig = [
  { h: 'h-10', type: 'normal' },
  { h: 'h-14', type: 'normal' },
  { h: 'h-12', type: 'normal' },
  { h: 'h-20', type: 'primary' },
  { h: 'h-24', type: 'ai' },
  { h: 'h-32', type: 'ai' },
];

// ─── Component ───────────────────────────────────────────────────────────
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pricingPeriod, setPricingPeriod] = useState<'monthly' | 'annually'>('monthly');
  const [selectedFeature, setSelectedFeature] = useState<'kanban' | 'lstm' | 'dietary'>('kanban');
  const [lang, setLang] = useState<Lang>('id');
  const [scrolled, setScrolled] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const t = translations[lang];
  const toggleLang = () => setLang((l) => (l === 'id' ? 'en' : 'id'));

  const { user } = useAuth();
  const { openAuth } = useModals();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const authType = params.get('auth');
      if (authType === 'login' || authType === 'activate') {
        window.history.replaceState({}, '', window.location.pathname);
        openAuth(authType as 'login' | 'activate');
      }
    }
  }, [openAuth]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--primary)] selection:text-white transition-colors duration-300 overflow-x-hidden">

      {/* ─── NAVBAR ─────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50">

        {/* Single morphing inner container */}
        <div
          style={{
            transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)',
            outline: 'none',
          }}
          className={`mx-auto flex items-center justify-between ${
            scrolled
              ? 'max-w-5xl mt-3 px-5 py-3 bg-white/[0.92] dark:bg-[#1A1715]/[0.92] backdrop-blur-xl border border-orange-100/80 dark:border-stone-700/60 shadow-xl rounded-2xl'
              : 'max-w-7xl mt-0 px-6 py-5 bg-transparent border border-transparent'
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0" style={{ outline: 'none' }}>
            <div
              className="relative flex items-center justify-center group-hover:scale-105"
              style={{
                width: scrolled ? '32px' : '36px',
                height: scrolled ? '32px' : '36px',
                transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1), height 0.5s cubic-bezier(0.4,0,0.2,1)',
              }}
            >
              {/* White bg pill behind logo when on hero so it's always visible */}
              <div
                className="absolute inset-0 bg-white rounded-xl"
                style={{
                  opacity: scrolled ? 0 : 1,
                  transition: 'opacity 0.5s cubic-bezier(0.4,0,0.2,1)',
                }}
              />
              <Image src="/caterflowlogo.png" alt="CaterFlow Logo" fill className="object-contain relative z-10" priority />
            </div>
            <span
              className="font-black tracking-tight"
              style={{
                fontSize: scrolled ? '0.9rem' : '1.125rem',
                color: scrolled ? '' : 'white',
                textShadow: scrolled ? 'none' : '0 1px 3px rgba(0,0,0,0.2)',
                transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)',
              }}
            >
              CaterFlow
            </span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-7">
            {[
              { href: '#features', label: t.nav_features },
              { href: '#demo',     label: t.nav_how },
              { href: '#pricing',  label: t.nav_pricing },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className={`text-sm font-semibold transition-colors duration-300 ${
                  scrolled
                    ? 'text-slate-500 hover:text-[var(--primary)] dark:text-stone-400 dark:hover:text-[var(--primary)]'
                    : 'text-white/90 hover:text-white'
                }`}
                style={{ outline: 'none', textDecoration: 'none' }}
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-2.5 flex-shrink-0">
            {/* Lang toggle */}
            <button
              onClick={toggleLang}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-300 ${
                scrolled
                  ? 'border-slate-200 dark:border-stone-700 hover:border-[var(--primary)]/40 hover:bg-orange-50 dark:hover:bg-orange-950/20 text-slate-500'
                  : 'border-white/30 bg-white/10 hover:bg-white/20 text-white'
              }`}
              style={{ outline: 'none' }}
              title={lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
            >
              <i className="fa-solid fa-globe text-xs" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider">
                {lang === 'id' ? 'ID' : 'EN'}
              </span>
            </button>

            {/* Sign in */}
            {!user ? (
              <button
                onClick={() => openAuth('login')}
                className={`text-sm font-semibold transition-colors duration-300 cursor-pointer ${
                  scrolled
                    ? 'text-slate-600 dark:text-stone-300 hover:text-[var(--primary)]'
                    : 'text-white/90 hover:text-white'
                }`}
                style={{ outline: 'none' }}
              >
                {t.nav_signin}
              </button>
            ) : null}

            {/* CTA button */}
            <button
              onClick={() => {
                if (!user) {
                  setRegisterOpen(true);
                } else {
                  window.location.href = '/dashboard';
                }
              }}
              style={{ outline: 'none' }}
              className={`flex items-center gap-1.5 font-black text-sm transition-all duration-300 cursor-pointer ${
                scrolled
                  ? 'bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white py-2 px-4 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-px'
                  : 'bg-white/15 hover:bg-white/25 border border-white/30 text-white py-2.5 px-5 rounded-full shadow-sm backdrop-blur-sm'
              }`}
            >
              {user ? (
                <>
                  {t.nav_dashboard} <i className="fa-solid fa-right-to-bracket text-[10px]" />
                </>
              ) : (
                <>
                  Coba Gratis <i className="fa-solid fa-arrow-right text-[10px]" />
                </>
              )}
            </button>
          </div>

          {/* Mobile right */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleLang}
              style={{ outline: 'none' }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 ${
                scrolled
                  ? 'border-slate-200 dark:border-stone-700 text-slate-500'
                  : 'border-white/30 bg-white/10 text-white'
              }`}
            >
              <i className="fa-solid fa-globe text-xs mr-0.5" />
              {lang === 'id' ? 'ID' : 'EN'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ outline: 'none' }}
              className={`p-2 transition-colors duration-300 ${scrolled ? 'text-slate-500 dark:text-stone-400' : 'text-white'}`}
            >
              <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-xl`} />
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className={`md:hidden mx-4 mt-1 rounded-2xl border border-[var(--border)] p-5 flex flex-col gap-3 shadow-xl backdrop-blur-xl ${
            scrolled ? 'bg-white dark:bg-[#1A1715]' : 'bg-white/95 dark:bg-[#1A1715]/95'
          }`}>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-slate-700 dark:text-stone-300 py-2 border-b border-[var(--border)]/30" style={{ outline: 'none' }}>{t.nav_features}</a>
            <a href="#demo" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-slate-700 dark:text-stone-300 py-2 border-b border-[var(--border)]/30" style={{ outline: 'none' }}>{t.nav_how}</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-slate-700 dark:text-stone-300 py-2 border-b border-[var(--border)]/30" style={{ outline: 'none' }}>{t.nav_pricing}</a>
            <Link
              href="/dashboard"
              onClick={(e) => {
                setMobileMenuOpen(false);
                if (!user) {
                  e.preventDefault();
                  openAuth('login');
                }
              }}
              className="flat-button py-3 text-sm justify-center w-full mt-1 rounded-xl"
              style={{ outline: 'none' }}
            >
              {t.nav_dashboard} <i className="fa-solid fa-right-to-bracket text-xs ml-1" />
            </Link>
          </div>
        )}
      </header>

      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="relative bg-gradient-to-br from-[#FF6B35] via-[#FF8C42] to-[#FF9F1C] min-h-[620px] md:min-h-[700px] flex items-center">

          {/* Right half background image with gradient fade to left */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-y-0 right-0 w-full md:w-1/2 h-full">
              <Image
                src="/catering_buffet.png"
                alt="Premium catering buffet background"
                fill
                className="object-cover object-center opacity-90 md:opacity-100"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#FF6B35] via-[#FF6B35]/85 to-transparent md:bg-gradient-to-r md:from-[#FF8C42] md:via-[#FF8C42]/50 md:to-transparent" />
            </div>
            <div className="absolute inset-y-0 left-0 w-full md:w-1/2 bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] hidden md:block" />
          </div>

          <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '60px 60px'}} />
          <div className="absolute top-1/4 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto w-full px-6 md:px-10 py-16 md:py-24 grid grid-cols-1 md:grid-cols-12 gap-12 items-center relative z-10">

            <div className="md:col-span-7 lg:col-span-6 flex flex-col items-start text-left">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 rounded-full px-4 py-1.5 text-[10px] font-extrabold text-white uppercase tracking-widest mb-6 shadow-sm">
                <i className="fa-solid fa-fire text-yellow-300 text-[10px] animate-pulse" /> {t.hero_badge}
              </div>

              <div className="space-y-1 mb-6">
                <p className="text-white/95 font-bold text-sm tracking-wider uppercase">{t.hero_pre}</p>
                <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black leading-none text-white tracking-tight drop-shadow-md">
                  {t.hero_h1}
                </h1>
                <p className="text-yellow-200 font-extrabold text-lg sm:text-xl italic tracking-wide">
                  {t.hero_tagline}
                </p>
              </div>

              <p className="text-white/95 text-sm sm:text-base leading-relaxed max-w-md font-medium mb-8">
                {t.hero_desc}
              </p>

              <div className="flex flex-wrap items-center gap-6 mb-8 w-full">
                <Link
                  href="/dashboard"
                  onClick={(e) => {
                    if (!user) {
                      e.preventDefault();
                      setRegisterOpen(true);
                    }
                  }}
                  className="bg-white text-[#FF6B35] font-black text-sm px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-2 group"
                >
                  {t.hero_cta}
                  <i className="fa-solid fa-arrow-right text-xs group-hover:translate-x-1 transition-transform" />
                </Link>
                <div className="flex flex-col">
                  <span className="text-white/70 text-[9px] font-extrabold uppercase tracking-widest">{t.hero_from}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-white font-black text-2xl">Rp 399k</span>
                    <span className="text-white/70 text-xs font-bold">{t.hero_per_month}</span>
                  </div>
                </div>
              </div>

              {/* Mini food card */}
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 shadow-xl max-w-xs w-full hover:bg-white/15 transition-all duration-200">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-white/30">
                  <Image src="/mini_food_card.png" alt={t.hero_card_name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-white font-extrabold text-xs truncate">{t.hero_card_name}</p>
                    <span className="bg-yellow-400 text-slate-900 text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider shrink-0">{t.hero_card_badge}</span>
                  </div>
                  <p className="text-white/80 text-[10px] font-medium">{t.hero_card_min}</p>
                  <p className="text-yellow-200 font-extrabold text-xs mt-0.5">{t.hero_card_price}<span className="text-white/70 font-medium text-[9px]">{t.hero_card_unit}</span></p>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 lg:col-span-6 hidden md:block" />
          </div>

          {/* Bottom wave */}
          <div className="absolute bottom-0 left-0 right-0 z-10">
            <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
              <path d="M0 80H1440V40C1200 80 960 0 720 20C480 40 240 80 0 40V80Z" fill="#FAF6F0" className="dark:fill-[#12100E]" />
            </svg>
          </div>
        </div>
      </section>

      {/* ─── TRUST STRIP ───────────────────────────────────────────────── */}
      <section className="py-10 bg-[#FAF6F0] dark:bg-[#12100E] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[10px] font-extrabold text-slate-400 dark:text-stone-600 uppercase tracking-widest mb-7">{t.trust_title}</p>
          <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-3">
            {[
              { name: 'PT Bintang Terang', icon: 'fa-star' },
              { name: 'Kopi Kenangan Group', icon: 'fa-mug-hot' },
              { name: 'IndoFood Catering', icon: 'fa-utensils' },
              { name: 'Gajah Mada Corp', icon: 'fa-building' },
              { name: 'Sukma Abadi', icon: 'fa-leaf' },
            ].map((brand) => (
              <div key={brand.name} className="flex items-center gap-2 group cursor-default">
                <i className={`fa-solid ${brand.icon} text-[var(--primary)]/30 group-hover:text-[var(--primary)] text-xs transition-colors`} />
                <span className="text-sm font-black text-slate-300 dark:text-stone-700 group-hover:text-[var(--primary)] dark:group-hover:text-[var(--primary)] transition-colors tracking-tight">{brand.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES GRID ─────────────────────────────────────────────── */}
      <section id="features" className="py-24 md:py-32 bg-[#FAF6F0] dark:bg-[#12100E]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block text-[11px] font-extrabold text-[var(--primary)] uppercase tracking-widest bg-orange-100/60 dark:bg-orange-950/20 border border-orange-200/50 dark:border-orange-900/30 rounded-full px-4 py-1.5 mb-4">{t.feat_badge}</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-stone-100 tracking-tight mb-4 leading-tight">
              {t.feat_h2_1}<br />
              <span className="bg-gradient-to-r from-[var(--primary)] to-[#FF9F1C] bg-clip-text text-transparent">{t.feat_h2_2}</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-stone-500 font-semibold leading-relaxed">{t.feat_sub}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {t.features.map((f, i) => {
              const cfg = featureConfig[i];
              return (
                <div key={f.title} className={`group relative p-6 ${cfg.bg} border ${cfg.border} rounded-3xl flex flex-col gap-4 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 overflow-hidden`}>
                  <div className={`absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r ${cfg.gradient} rounded-full opacity-60 group-hover:opacity-100 transition-opacity`} />
                  <div className={`w-12 h-12 bg-gradient-to-br ${cfg.gradient} rounded-2xl flex items-center justify-center text-white text-lg shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <i className={`fa-solid ${cfg.icon}`} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800 dark:text-stone-100 mb-2">{f.title}</h3>
                    <p className={`text-xs font-semibold leading-relaxed ${cfg.accent} opacity-70`}>{f.desc}</p>
                  </div>
                  <div className={`mt-auto text-[10px] font-extrabold ${cfg.accent} flex items-center gap-1 group-hover:gap-2 transition-all`}>
                    {t.feat_detail} <i className="fa-solid fa-arrow-right text-[8px]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CATERING SHOWCASE ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1C0F07] via-[#2A1508] to-[#1C0F07]" />
        <div className="absolute inset-0">
          <Image src="/catering_buffet.png" alt="" fill className="object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1C0F07]/95 via-[#2A1508]/70 to-[#1C0F07]/95" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-32 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left circular food image */}
          <div className="lg:col-span-5 relative flex justify-center items-center h-[400px]">
            <div className="absolute w-[340px] h-[340px] rounded-full border border-[var(--primary)]/20 animate-spin" style={{ animationDuration: '30s' }} />
            <div className="absolute w-[300px] h-[300px] rounded-full border border-[var(--primary)]/10 animate-spin" style={{ animationDuration: '20s', animationDirection: 'reverse' }} />

            <div className="relative w-[280px] h-[280px] z-10 rounded-full overflow-hidden border-4 border-[var(--primary)]/40 shadow-2xl shadow-orange-900/50">
              <Image src="/showcase_food.png" alt={t.show_item} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C0F07]/60 to-transparent" />
            </div>

            <div className="absolute top-8 right-4 z-20 bg-[var(--primary)] text-white rounded-2xl px-4 py-3 shadow-xl shadow-orange-500/30 text-center">
              <p className="text-2xl font-black leading-none">600</p>
              <p className="text-[9px] font-extrabold uppercase tracking-wider opacity-80">{t.show_week}</p>
            </div>

            <div className="absolute bottom-10 left-0 z-20 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
              <i className="fa-solid fa-star text-yellow-400 text-[10px]" />
              <span className="text-xs font-extrabold text-white">{t.show_item}</span>
              <span className="text-[10px] text-white/60 font-semibold">· {t.show_rank}</span>
            </div>
          </div>

          {/* Right content */}
          <div className="lg:col-span-7 space-y-6">
            <span className="text-[11px] font-extrabold text-[var(--primary)] uppercase tracking-widest">{t.show_badge}</span>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
              {t.show_h2_1}<br />
              <span className="bg-gradient-to-r from-[var(--primary)] to-[#FF9F1C] bg-clip-text text-transparent">{t.show_h2_2}</span>
            </h2>
            <p className="text-sm text-white/60 font-semibold leading-relaxed max-w-lg">{t.show_desc}</p>
            <div className="grid grid-cols-2 gap-4">
              {t.showcase_items.map((item, i) => (
                <div key={item.title} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-[var(--primary)]/40 hover:bg-white/8 transition-all duration-200 group">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--primary)] to-amber-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <i className={`fa-solid ${showcaseIconConfig[i]} text-white text-xs`} />
                  </div>
                  <h4 className="text-xs font-extrabold text-white mb-1">{item.title}</h4>
                  <p className="text-[10px] text-white/50 font-semibold leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section id="demo" className="py-24 md:py-32 bg-[#FAF6F0] dark:bg-[#12100E]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block text-[11px] font-extrabold text-[var(--primary)] uppercase tracking-widest bg-orange-100/60 dark:bg-orange-950/20 border border-orange-200/50 dark:border-orange-900/30 rounded-full px-4 py-1.5 mb-4">{t.how_badge}</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-stone-100 tracking-tight mb-4">{t.how_h2}</h2>
            <p className="text-sm text-slate-500 dark:text-stone-500 font-semibold leading-relaxed">{t.how_sub}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

            {/* Tab Buttons */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              {t.how_tabs.map((tab, i) => (
                <button
                  key={tabIconConfig[i]}
                  onClick={() => setSelectedFeature(tabIconConfig[i])}
                  className={`flex items-start gap-4 p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${selectedFeature === tabIconConfig[i] ? 'bg-white dark:bg-stone-900 border-[var(--primary)] shadow-lg shadow-orange-500/5' : 'border-transparent hover:bg-orange-50/50 dark:hover:bg-stone-900/50'}`}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-colors duration-200 ${selectedFeature === tabIconConfig[i] ? 'bg-gradient-to-br from-[var(--primary)] to-amber-500 text-white shadow-md' : 'bg-orange-100/60 dark:bg-stone-800 text-[var(--primary)] dark:text-stone-500'}`}>
                    <i className={`fa-solid ${tabFAIconConfig[i]}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-black ${selectedFeature === tabIconConfig[i] ? 'text-[var(--primary)]' : 'text-slate-400'}`}>{tab.num}</span>
                      <h4 className="text-sm font-extrabold text-slate-800 dark:text-stone-200">{tab.title}</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-stone-500 font-semibold leading-relaxed">{tab.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Visualization Panel */}
            <div className="lg:col-span-7 bg-white dark:bg-[#1A1715] border border-[var(--border)] rounded-3xl p-6 shadow-xl min-h-[360px] flex items-center justify-center">

              {selectedFeature === 'kanban' && (
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-extrabold text-slate-800 dark:text-stone-200">{t.kanban_title}</p>
                    <span className="text-[9px] font-extrabold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-100 dark:border-emerald-900/30">
                      <i className="fa-solid fa-circle text-[7px] animate-pulse mr-1" /> {t.kanban_live}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {t.kanban_cols.map((col) => (
                      <div key={col.label} className="bg-slate-50 dark:bg-stone-900/40 p-2.5 rounded-xl border border-[var(--border)] space-y-2">
                        <span className={`text-[9px] font-extrabold uppercase tracking-wider block ${col.color === 'orange' ? 'text-[var(--primary)]' : col.color === 'emerald' ? 'text-emerald-500' : 'text-slate-400'}`}>{col.label}</span>
                        {col.items.map((item) => (
                          <div key={item} className="p-2 bg-white dark:bg-stone-800 rounded-lg border border-[var(--border)] shadow-sm">
                            <p className="text-[10px] font-bold text-slate-700 dark:text-stone-200 leading-tight">{item.split('—')[0]}</p>
                            <p className={`text-[10px] font-extrabold mt-0.5 ${col.color === 'orange' ? 'text-[var(--primary)]' : col.color === 'emerald' ? 'text-emerald-500' : 'text-slate-400'}`}>{item.split('—')[1]}</p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedFeature === 'lstm' && (
                <div className="w-full space-y-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-extrabold text-slate-800 dark:text-stone-200">{t.lstm_title}</p>
                    <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-100 dark:border-emerald-900/30">
                      <i className="fa-solid fa-microchip animate-pulse mr-1" /> {t.lstm_training}
                    </span>
                  </div>
                  <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/10 border border-emerald-100/60 dark:border-emerald-900/20 rounded-2xl">
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold mb-1">Epoch loss: 0.0042 — Model converged</p>
                    <p className="text-xs text-slate-600 dark:text-stone-300 font-semibold leading-relaxed">{t.lstm_insight}</p>
                  </div>
                  <div className="h-36 flex items-end justify-between gap-2 px-2 pt-2">
                    {t.lstm_bars.map((b, i) => {
                      const cfg = lstmBarConfig[i];
                      return (
                        <div key={b.d} className={`w-full rounded-t-lg flex flex-col items-center justify-end pb-1 ${cfg.h} ${cfg.type === 'ai' ? 'bg-emerald-100 dark:bg-emerald-950/30 border-t-2 border-dashed border-emerald-500' : cfg.type === 'primary' ? 'bg-orange-100 border-t-2 border-[var(--primary)]' : 'bg-orange-100/70 dark:bg-stone-800'}`}>
                          <span className={`text-[8px] font-extrabold ${cfg.type === 'ai' ? 'text-emerald-600' : cfg.type === 'primary' ? 'text-[var(--primary)]' : 'text-slate-400'}`}>{b.d}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-stone-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[var(--primary)] to-emerald-500 w-[94%] rounded-full" />
                    </div>
                    <span className="text-[11px] font-extrabold text-slate-600 dark:text-stone-300 whitespace-nowrap">{t.lstm_conf}</span>
                  </div>
                </div>
              )}

              {selectedFeature === 'dietary' && (
                <div className="w-full grid grid-cols-12 gap-5 items-center">
                  <div className="col-span-7 space-y-3">
                    <p className="text-sm font-extrabold text-slate-800 dark:text-stone-200 mb-3">{t.dietary_title}</p>
                    <div className="divide-y divide-[var(--border)] bg-slate-50/60 dark:bg-stone-900/40 rounded-2xl border border-[var(--border)] overflow-hidden">
                      {t.dietary_rows.map((row) => (
                        <div key={row.client} className="p-3 flex items-center justify-between gap-2">
                          <div>
                            <p className="text-[11px] font-extrabold text-slate-800 dark:text-stone-200">{row.client}</p>
                            <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{row.order}</p>
                          </div>
                          <span className={`flex-shrink-0 px-2.5 py-0.5 text-[9px] font-extrabold rounded-full border ${row.ok ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30' : 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30'}`}>
                            {!row.ok && <i className="fa-solid fa-triangle-exclamation mr-1" />}{row.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-5 flex flex-col items-center justify-center gap-3">
                    <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-emerald-200 dark:border-emerald-900/40 shadow-lg">
                      <Image src="/showcase_food.png" alt={t.dietary_title} fill className="object-cover" />
                    </div>
                    <span className="bg-emerald-500 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow">{t.dietary_checked}</span>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS BAND ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/cta_food_right.png" alt="Catering stats background" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B35]/95 via-[#c94a14]/90 to-[#FF6B35]/95" />
        </div>
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px'}} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {t.stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center mb-1">
                <i className={`fa-solid ${stat.icon} text-white text-sm`} />
              </div>
              <p className="text-3xl md:text-4xl font-black text-white drop-shadow">{stat.value}</p>
              <p className="text-white/75 text-xs font-semibold uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PRICING ───────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 md:py-32 bg-[#FAF6F0] dark:bg-[#12100E]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block text-[11px] font-extrabold text-[var(--primary)] uppercase tracking-widest bg-orange-100/60 dark:bg-orange-950/20 border border-orange-200/50 dark:border-orange-900/30 rounded-full px-4 py-1.5 mb-4">{t.price_badge}</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-stone-100 tracking-tight mb-4">
              {t.price_h2_1}<br />
              <span className="bg-gradient-to-r from-[var(--primary)] to-[#FF9F1C] bg-clip-text text-transparent">{t.price_h2_2}</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-stone-500 font-semibold mb-8">{t.price_sub}</p>
            <div className="inline-flex bg-white dark:bg-stone-900 border border-[var(--border)] rounded-2xl p-1.5 shadow-sm">
              <button onClick={() => setPricingPeriod('monthly')} className={`px-5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${pricingPeriod === 'monthly' ? 'bg-gradient-to-r from-[var(--primary)] to-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                {t.price_monthly}
              </button>
              <button onClick={() => setPricingPeriod('annually')} className={`px-5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${pricingPeriod === 'annually' ? 'bg-gradient-to-r from-[var(--primary)] to-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                {t.price_annually} <span className={pricingPeriod === 'annually' ? 'text-yellow-200' : 'text-emerald-500'} style={{fontWeight: 800}}>{t.price_save}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto items-stretch">
            {t.plans.map((plan) => (
              <div key={plan.name} className={`relative bg-white dark:bg-[#1A1715] p-8 rounded-3xl flex flex-col justify-between transition-shadow duration-300 ${plan.popular ? 'border-2 border-[var(--primary)] shadow-2xl shadow-orange-500/10' : 'border border-[var(--border)] hover:shadow-lg'}`}>
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${plan.popular ? 'from-[var(--primary)] to-amber-500' : 'from-slate-200 to-slate-300 dark:from-stone-700 dark:to-stone-600'} rounded-t-3xl`} />
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[var(--primary)] to-amber-500 text-white text-[10px] font-black rounded-full px-5 py-1.5 uppercase tracking-widest shadow-lg z-10 whitespace-nowrap">
                    {t.price_popular}
                  </div>
                )}
                <div>
                  <span className={`text-[10px] font-extrabold uppercase tracking-widest block mb-2 ${plan.popular ? 'text-[var(--primary)]' : 'text-slate-400'}`}>{plan.tier}</span>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-stone-100 mb-5">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-black text-slate-800 dark:text-stone-100">
                      {pricingPeriod === 'monthly' ? plan.price_monthly : plan.price_annually}
                    </span>
                    <span className="text-xs text-slate-400 font-bold"> {plan.per}</span>
                    {pricingPeriod === 'annually' && plan.popular && (
                      <span className="ml-2 text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 font-extrabold px-2 py-0.5 rounded-full">{t.price_save}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-stone-400 leading-relaxed font-semibold mb-6 border-b border-[var(--border)] pb-6">{plan.desc}</p>
                  <ul className="space-y-3.5 text-xs text-slate-600 dark:text-stone-300 font-semibold mb-8">
                    {plan.features_yes.map((f) => (
                      <li key={f} className="flex items-center gap-2.5"><i className="fa-solid fa-check text-emerald-500 w-3" /> {f}</li>
                    ))}
                    {plan.features_no.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-slate-300 dark:text-stone-600"><i className="fa-solid fa-xmark w-3" /> {f}</li>
                    ))}
                  </ul>
                </div>
                <Link
                  href="/dashboard"
                  onClick={(e) => {
                    if (!user) {
                      e.preventDefault();
                      setRegisterOpen(true);
                    }
                  }}
                  className={`w-full py-3.5 font-black text-sm rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 ${plan.popular ? 'bg-gradient-to-r from-[var(--primary)] to-amber-500 hover:opacity-90 text-white shadow-lg shadow-orange-500/20' : 'bg-slate-50 hover:bg-slate-100 dark:bg-stone-900 dark:hover:bg-stone-800 text-slate-700 dark:text-stone-200 border border-[var(--border)]'}`}
                >
                  {plan.cta} {plan.popular && <i className="fa-solid fa-arrow-right text-xs" />}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ────────────────────────────────────────────────── */}
      <section className="py-20 md:py-24 bg-[#FAF6F0] dark:bg-[#12100E]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-orange-500/10 min-h-[340px] flex items-center">
            <div className="absolute inset-0">
              <Image src="/cta_food_right.png" alt="Catering CTA background" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1C0F07]/95 via-[#2A1508]/80 to-[#FF6B35]/70" />
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[var(--primary)]/30 to-transparent pointer-events-none" />

            <div className="relative z-10 p-10 md:p-16 max-w-2xl">
              <span className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-[10px] font-extrabold text-white uppercase tracking-widest mb-6">
                <i className="fa-solid fa-rocket text-yellow-300 text-[9px]" /> {t.cta_badge}
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                {t.cta_h2_1}<br />{t.cta_h2_2}
              </h2>
              <p className="text-white/70 text-sm max-w-xl mb-8 font-medium leading-relaxed">{t.cta_desc}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/dashboard"
                  onClick={(e) => {
                    if (!user) {
                      e.preventDefault();
                      openAuth('login');
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--primary)] text-white hover:bg-[#e55d28] font-black text-sm rounded-2xl shadow-xl transition-all duration-200 hover:scale-[1.02] group"
                >
                  {t.cta_btn1} <i className="fa-solid fa-arrow-right text-xs group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="#pricing" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border border-white/25 backdrop-blur-sm text-white hover:bg-white/20 font-bold text-sm rounded-2xl transition-all duration-200">
                  {t.cta_btn2}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ────────────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border)] py-12 bg-white dark:bg-[#1A1715] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <Image src="/caterflowlogo.png" alt="CaterFlow Logo" fill className="object-contain" />
            </div>
            <div>
              <span className="font-black text-slate-800 dark:text-stone-100 text-sm">CaterFlow</span>
              <p className="text-[10px] text-slate-400 font-semibold">{t.hero_badge}</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 dark:text-stone-500 font-semibold">{t.footer_copy}</p>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-xs font-semibold text-slate-400 hover:text-[var(--primary)] transition-colors">{t.footer_feat}</a>
            <a href="#pricing" className="text-xs font-semibold text-slate-400 hover:text-[var(--primary)] transition-colors">{t.footer_price}</a>
            <a href="#demo" className="text-xs font-semibold text-slate-400 hover:text-[var(--primary)] transition-colors">{t.footer_how}</a>
          </div>
        </div>
      </footer>

      <RegistrationModal isOpen={registerOpen} onClose={() => setRegisterOpen(false)} />
    </div>
  );
}
