'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Users,
  FileText,
  MessageSquare,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  X,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  PRODUCT_MODULES,
  STATS,
  PROCESS_STEPS,
  TESTIMONIALS,
  ARTICLES,
} from '@/components/landing/landing-data';
import { ProductModuleItem, SupportedLocale } from '@/components/landing/landing-types';
import { FogHero } from '@/components/landing/fog-hero';
import { SmoothScroll } from '@/components/landing/smooth-scroll';
import { LandingDialog } from '@/components/landing/landing-dialog';
import s from '@/components/landing/landing.module.css';

const STEP_ICONS = {
  building: Building2,
  users: Users,
  invoice: FileText,
  whatsapp: MessageSquare,
} as const;

/** Bento placement for the five product modules: one wide card, then a row of four. */
const MODULE_LAYOUT = [
  { span: 'md:col-span-2', aspect: 'aspect-[16/8]' },
  { span: '', aspect: 'aspect-[4/3]' },
  { span: '', aspect: 'aspect-[4/3]' },
  { span: '', aspect: 'aspect-[4/3]' },
  { span: 'md:col-span-2 lg:col-span-1', aspect: 'aspect-[4/3]' },
];

function SectionHeading({
  id,
  eyebrow,
  title,
  muted,
  align = 'center',
}: {
  id?: string;
  eyebrow: string;
  title: string;
  muted?: string;
  align?: 'center' | 'left';
}) {
  const center = align === 'center';
  return (
    <div className={`${s.reveal} ${center ? 'mx-auto text-center' : ''} max-w-3xl`}>
      <span className={s.eyebrow}>{eyebrow}</span>
      <h2 id={id} className={`${s.heading} mt-5`}>
        {title}
        {muted && (
          <>
            {' '}
            <i>{muted}</i>
          </>
        )}
      </h2>
    </div>
  );
}

export default function LandingPage() {
  const [locale, setLocale] = useState<SupportedLocale>('en');
  const isBn = locale === 'bn';

  // Dialogs. The module stays set after closing so content remains during the exit animation.
  const [activeModule, setActiveModule] = useState<ProductModuleItem>(PRODUCT_MODULES[0]);
  const [isModuleOpen, setIsModuleOpen] = useState(false);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);

  const [testimonialIndex, setTestimonialIndex] = useState(0);

  const [consultName, setConsultName] = useState('');
  const [consultPhone, setConsultPhone] = useState('');
  const [consultUnits, setConsultUnits] = useState('1–5');
  const [consultLocation, setConsultLocation] = useState('Dhaka');

  const [footerEmail, setFooterEmail] = useState('');
  const [isFooterSubscribed, setIsFooterSubscribed] = useState(false);

  const toggleLocale = useCallback(() => {
    setLocale((prev) => (prev === 'en' ? 'bn' : 'en'));
  }, []);

  const openConsultation = useCallback(() => setIsConsultationOpen(true), []);
  const closeConsultation = useCallback(() => setIsConsultationOpen(false), []);
  const closeModule = useCallback(() => setIsModuleOpen(false), []);

  const openModule = (module: ProductModuleItem) => {
    setActiveModule(module);
    setIsModuleOpen(true);
  };

  const handleConsultationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultName || !consultPhone) return;
    toast.success(
      isBn
        ? `ধন্যবাদ ${consultName}, আপনার ডেমো অনুরোধ গৃহীত হয়েছে।`
        : `Thank you, ${consultName}. Our onboarding team will call you.`
    );
    setConsultName('');
    setConsultPhone('');
    setIsConsultationOpen(false);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!footerEmail || !footerEmail.includes('@')) return;
    setIsFooterSubscribed(true);
    toast.success(isBn ? 'সফলভাবে সাবস্ক্রাইব করা হয়েছে।' : 'Subscribed to BariVara Dispatch.');
  };

  const totalTestimonials = TESTIMONIALS.length;
  const testimonial = TESTIMONIALS[testimonialIndex] ?? TESTIMONIALS[0];
  const prevTestimonial = () =>
    setTestimonialIndex((i) => (i === 0 ? totalTestimonials - 1 : i - 1));
  const nextTestimonial = () =>
    setTestimonialIndex((i) => (i === totalTestimonials - 1 ? 0 : i + 1));

  const m = activeModule;

  return (
    <div className={`${s.page} ${isBn ? s.bn : ''} min-h-screen font-sans antialiased`}>
      <SmoothScroll />

      <FogHero isBn={isBn} onToggleLocale={toggleLocale} onContact={openConsultation} />

      <main>
        {/* ─────────────────────────────────────────────────────────────
            FEATURES — bento of the five product modules
        ───────────────────────────────────────────────────────────── */}
        <section
          id="properties"
          aria-labelledby="features-title"
          className="scroll-mt-6 px-4 sm:px-8 pt-20 sm:pt-28 pb-20 sm:pb-28 max-w-7xl mx-auto"
        >
          <SectionHeading
            id="features-title"
            eyebrow={isBn ? 'কোর ফিচার ও মডিউল' : 'Core features'}
            title={isBn ? 'কাগজের খাতার বদলে' : 'Everything your building needs,'}
            muted={isBn ? 'একটি শান্ত, গোছানো জায়গা' : 'in one calm place'}
          />

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {PRODUCT_MODULES.map((module, idx) => {
              const layout = MODULE_LAYOUT[idx] ?? MODULE_LAYOUT[1];
              return (
                <article
                  key={module.id}
                  className={`${s.card} ${s.glass} ${s.reveal} ${layout.span} rounded-[22px] p-3 sm:p-4 flex flex-col`}
                >
                  <div className={`${s.shot} ${layout.aspect}`}>
                    <Image
                      src={module.imageUrl}
                      alt=""
                      fill
                      sizes={
                        idx === 0
                          ? '(min-width: 768px) 840px, 100vw'
                          : '(min-width: 1024px) 420px, (min-width: 768px) 50vw, 100vw'
                      }
                      className="object-cover object-top"
                    />
                    <span className="absolute top-3 left-3 z-10 rounded-full bg-[#0b1426]/80 backdrop-blur px-3 py-1 text-[11px] font-medium text-[#a6e8e4] border border-white/10">
                      {isBn ? module.badgeBn : module.badge}
                    </span>
                  </div>

                  <div className="px-1.5 pt-5 pb-1.5 flex flex-col gap-3 flex-1">
                    <h3 className="text-[17px] sm:text-lg font-medium leading-snug tracking-[-0.01em]">
                      <button
                        type="button"
                        onClick={() => openModule(module)}
                        className={`${s.stretch} text-left`}
                      >
                        {isBn ? module.titleBn : module.title}
                      </button>
                    </h3>
                    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-[var(--muted)]">
                      {(isBn ? module.specsBn : module.specs).slice(0, 3).map((spec) => (
                        <li key={spec} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[var(--teal)]" aria-hidden="true" />
                          {spec}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto pt-3 border-t border-white/10 flex items-center justify-between">
                      <span className="text-sm font-medium text-[var(--teal)]">
                        {isBn ? module.highlightMetricBn : module.highlightMetric}
                      </span>
                      <span
                        aria-hidden="true"
                        className="w-8 h-8 rounded-full border border-white/15 grid place-items-center text-white/80"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            STATS — four figures between hairlines
        ───────────────────────────────────────────────────────────── */}
        <section aria-label={isBn ? 'এক নজরে' : 'At a glance'} className="border-y border-white/10">
          <dl className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat, idx) => (
              <div
                key={stat.labelEn}
                className={`${s.reveal} px-5 sm:px-8 py-10 sm:py-14 flex flex-col gap-2 border-white/10 ${
                  idx % 2 === 1 ? 'border-l' : ''
                } ${idx >= 2 ? 'border-t lg:border-t-0' : ''} ${idx === 2 ? 'lg:border-l' : ''}`}
              >
                <dt className="order-2 text-[13px] font-medium text-[var(--teal)]">
                  {isBn ? stat.labelBn : stat.labelEn}
                </dt>
                <dd className="order-1 text-4xl sm:text-5xl font-medium tracking-[-0.03em] tabular-nums">
                  {isBn ? stat.valueBn : stat.value}
                </dd>
                <dd className="order-3 text-[13px] text-[var(--muted)] leading-snug">
                  {isBn ? stat.sublabelBn : stat.sublabelEn}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            PROCESS — four steps on one connected track
        ───────────────────────────────────────────────────────────── */}
        <section
          id="process"
          aria-labelledby="process-title"
          className="scroll-mt-6 px-4 sm:px-8 py-20 sm:py-28 max-w-7xl mx-auto"
        >
          <SectionHeading
            id="process-title"
            eyebrow={isBn ? 'সহজ ৪-ধাপ' : 'How it works'}
            title={isBn ? 'শান্ত, সুশৃঙ্খল পথে' : 'A calm, orderly path to'}
            muted={isBn ? 'কাগজহীন ভাড়া ব্যবস্থাপনা' : 'paperless rent management'}
          />

          <div className="relative mt-16">
            <div className={`${s.track} hidden lg:block`} aria-hidden="true" />
            <ol className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
              {PROCESS_STEPS.map((step) => {
                const Icon = STEP_ICONS[step.iconType];
                return (
                  <li key={step.number} className={`${s.reveal} flex flex-col items-center text-center`}>
                    <div className={s.node}>
                      <Icon className="w-7 h-7 text-[var(--teal)]" aria-hidden="true" />
                    </div>
                    <span className="mt-6 text-xs font-medium tabular-nums text-[var(--muted)]">
                      {step.number}
                    </span>
                    <h3 className="mt-2 text-lg font-medium leading-snug tracking-[-0.01em] max-w-[16rem]">
                      {isBn ? step.titleBn : step.titleEn}
                    </h3>
                    <p className="mt-3 text-sm text-[var(--muted)] leading-relaxed max-w-[18rem]">
                      {isBn ? step.descBn : step.descEn}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            TESTIMONIALS
        ───────────────────────────────────────────────────────────── */}
        <section
          id="testimonials"
          aria-labelledby="testimonials-title"
          className="scroll-mt-6 px-4 sm:px-8 pb-20 sm:pb-28 max-w-7xl mx-auto"
        >
          <SectionHeading
            id="testimonials-title"
            eyebrow={isBn ? 'বাড়িওয়ালাদের অভিজ্ঞতা' : 'Landlord stories'}
            title={isBn ? 'সারা দেশের বাড়িওয়ালাদের' : 'Trusted by landlords'}
            muted={isBn ? 'নির্ভরযোগ্য সঙ্গী' : 'across Bangladesh'}
          />

          <div
            className={`${s.glass} ${s.reveal} mt-14 rounded-[28px] p-4 sm:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-12 items-center`}
          >
            <div className="md:col-span-5">
              <div className="relative aspect-[4/4.4] rounded-[18px] overflow-hidden border border-white/10 bg-[#111c31]">
                <Image
                  key={testimonial.id}
                  src={testimonial.imageUrl}
                  alt={isBn ? testimonial.nameBn : testimonial.name}
                  fill
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="object-cover object-top"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0b1426]/90 to-transparent" />
                <span className="absolute bottom-4 left-4 rounded-full bg-[#0b1426]/80 backdrop-blur px-3 py-1 text-xs font-medium text-[#a6e8e4] border border-white/10">
                  {testimonial.unitsCount}
                </span>
              </div>
            </div>

            <div className="md:col-span-7 flex flex-col gap-8">
              <figure aria-live="polite" className="flex flex-col gap-5">
                <blockquote className="flex flex-col gap-5">
                  <p className="text-2xl sm:text-3xl font-medium leading-snug tracking-[-0.02em] text-balance">
                    {isBn ? testimonial.headlineBn : testimonial.headlineEn}
                  </p>
                  <p className="text-[15px] text-[var(--soft)]/80 leading-relaxed">
                    {isBn ? testimonial.quoteBn : testimonial.quoteEn}
                  </p>
                </blockquote>
                <figcaption>
                  <span className="block font-medium">{isBn ? testimonial.nameBn : testimonial.name}</span>
                  <span className="block text-sm text-[var(--muted)]">
                    {isBn ? testimonial.roleBn : testimonial.role} · {testimonial.location}
                  </span>
                </figcaption>
              </figure>

              <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={prevTestimonial}
                    aria-label={isBn ? 'আগের মতামত' : 'Previous testimonial'}
                    className={s.iconBtn}
                  >
                    <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={nextTestimonial}
                    aria-label={isBn ? 'পরের মতামত' : 'Next testimonial'}
                    className={s.iconBtn}
                  >
                    <ChevronRight className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
                <div className="flex items-center gap-3 text-sm tabular-nums text-[var(--muted)]">
                  <span className="text-white">{String(testimonialIndex + 1).padStart(2, '0')}</span>
                  <span className="w-10 h-px bg-white/20" aria-hidden="true" />
                  <span>{String(totalTestimonials).padStart(2, '0')}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            GUIDES
        ───────────────────────────────────────────────────────────── */}
        <section
          id="blog"
          aria-labelledby="guides-title"
          className="scroll-mt-6 px-4 sm:px-8 pb-20 sm:pb-28 max-w-7xl mx-auto"
        >
          <SectionHeading
            id="guides-title"
            align="left"
            eyebrow={isBn ? 'সহায়িকা ও গাইড' : 'Guides & insights'}
            title={isBn ? 'বাড়িওয়ালাদের জন্য' : 'Essential reading'}
            muted={isBn ? 'জরুরি পরামর্শ' : 'for property owners'}
          />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
            {ARTICLES.map((article) => (
              <article
                key={article.id}
                className={`${s.card} ${s.glass} ${s.reveal} rounded-[22px] p-3 flex flex-col`}
              >
                <div className={`${s.shot} aspect-[4/3]`}>
                  <Image
                    src={article.imageUrl}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover"
                  />
                  <span className="absolute top-3 left-3 z-10 rounded-full bg-[#0b1426]/80 backdrop-blur px-3 py-1 text-[11px] font-medium text-[#a6e8e4] border border-white/10">
                    {isBn ? article.categoryBn : article.categoryEn}
                  </span>
                </div>
                <div className="px-2 pt-5 pb-2 flex flex-col gap-3 flex-1">
                  <h3 className="text-[17px] font-medium leading-snug tracking-[-0.01em]">
                    <button
                      type="button"
                      className={`${s.stretch} text-left`}
                      onClick={() =>
                        toast(isBn ? `শীঘ্রই আসছে: ${article.titleBn}` : `Coming soon: “${article.titleEn}”`)
                      }
                    >
                      {isBn ? article.titleBn : article.titleEn}
                    </button>
                  </h3>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">
                    {isBn ? article.excerptBn : article.excerptEn}
                  </p>
                  <div className="mt-auto pt-4 border-t border-white/10 flex items-center gap-2.5">
                    <span className="relative w-7 h-7 rounded-full overflow-hidden border border-white/20 shrink-0">
                      <Image src={article.authorAvatar} alt="" fill sizes="28px" className="object-cover" />
                    </span>
                    <span className="text-xs text-[var(--muted)]">
                      {article.author} · {isBn ? article.readTimeBn : article.readTime}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            CTA — the hero's night scene in a panel
        ───────────────────────────────────────────────────────────── */}
        <section id="cta" aria-labelledby="cta-title" className="scroll-mt-6 px-4 sm:px-8 pb-20 sm:pb-28">
          <div className={`${s.scene} ${s.reveal} max-w-7xl mx-auto`}>
            {/* eslint-disable-next-line @next/next/no-img-element -- local decorative backdrop, blurred */}
            <img src="/hero/sky-night.webp" alt="" loading="lazy" />
            <div className="px-6 sm:px-12 lg:px-16 py-16 sm:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 flex flex-col gap-6">
                <span className={`${s.eyebrow} self-start`}>
                  {isBn ? 'কাগজহীন বাড়ি ব্যবস্থাপনা' : 'Paperless property management'}
                </span>
                <h2 id="cta-title" className={s.heading}>
                  {isBn ? 'কাগজের খাতার অনিশ্চয়তা ভুলে' : 'Ready to leave paper khata'}{' '}
                  <i className="!text-[#c9d3e3]">{isBn ? 'আজই শুরু করুন' : 'behind?'}</i>
                </h2>
                <p className="text-[15px] text-[var(--soft)] leading-relaxed max-w-xl">
                  {isBn
                    ? '১ থেকে ১৫টি ফ্ল্যাট বা দোকান পরিচালনাকারী বাংলাদেশি বাড়িওয়ালাদের জন্য তৈরি। ১লা তারিখে অটোমেটিক বিল তৈরি করুন, বিকাশে ভাড়া নিয়ে ১-ক্লিকে হোয়াটসঅ্যাপে রসিদ পাঠিয়ে দিন।'
                    : 'Built for landlords in Bangladesh managing 1–15 flats. Generate rent notices on the 1st, reconcile bKash payments, and send WhatsApp receipts in one click.'}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link href="/register" className={`${s.pill} ${s.pillLight}`}>
                    {isBn ? 'বিনামূল্যে শুরু করুন' : 'Get started free'}
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                  <button type="button" onClick={openConsultation} className={`${s.pill} ${s.pillGlass}`}>
                    {isBn ? 'ডেমোর অনুরোধ' : 'Request a demo'}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className={`${s.glass} rounded-[22px] p-6 !bg-[#0b1426]/45`}>
                  <div className="flex items-center gap-3 pb-5 border-b border-white/10">
                    <span className="w-10 h-10 rounded-full grid place-items-center bg-[#2dc2bd]/15 border border-[#2dc2bd]/30">
                      <ShieldCheck className="w-5 h-5 text-[var(--teal)]" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-medium">
                        {isBn ? 'বাড়িভাড়া গ্যারান্টি' : 'The BariVara guarantee'}
                      </h3>
                      <p className="text-xs text-[var(--muted)]">
                        {isBn ? '১–১৫ ইউনিটের জন্য' : 'Tailored for 1–15 units'}
                      </p>
                    </div>
                  </div>
                  <dl className="mt-2 text-sm">
                    {[
                      [isBn ? 'হোয়াটসঅ্যাপ রসিদ' : 'WhatsApp receipts', isBn ? '১-ক্লিকে' : 'Instant, 1 click'],
                      [isBn ? 'সাব-মিটার বিল বণ্টন' : 'Sub-meter math', isBn ? 'শতভাগ সঠিক' : 'Exact split'],
                      [isBn ? 'বিকাশ ও নগদ ট্র্যাকিং' : 'bKash & Nagad TrxID', isBn ? 'স্বয়ংক্রিয় জের' : 'Auto rollover'],
                      [isBn ? 'প্ল্যাটফর্ম চার্জ' : 'Platform fee', isBn ? '৳০ ফ্রি ট্রায়াল' : '৳0 free trial'],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between gap-4 py-3 border-b border-white/5 last:border-0"
                      >
                        <dt className="text-[var(--soft)]/75">{label}</dt>
                        <dd className="font-medium text-[#a6e8e4] text-right">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          FOOTER
      ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 bg-[#070d1a] px-4 sm:px-8 pt-16 pb-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10 text-sm">
            <div className="lg:col-span-4 flex flex-col gap-4">
              <Link href="#hero" className={`${s.focusRing} flex items-center gap-2.5 self-start rounded`}>
                {/* eslint-disable-next-line @next/next/no-img-element -- small local logo */}
                <img src="/logo.png" alt="" className="w-9 h-9 object-contain" />
                <span className="font-bold tracking-[0.16em]">BARIVARA</span>
              </Link>
              <p className="text-[var(--muted)] leading-relaxed max-w-xs">
                {isBn
                  ? 'বাংলাদেশের বাড়িওয়ালাদের জন্য আধুনিক ও নির্ভরযোগ্য ডিজিটাল ভাড়া ব্যবস্থাপনা।'
                  : 'Modern, reliable rent management and ledger platform for landlords in Bangladesh.'}
              </p>
            </div>

            <nav aria-label={isBn ? 'ফুটার মেন্যু' : 'Footer'} className="lg:col-span-2">
              <h3 className="text-xs font-medium text-white/60 mb-4">{isBn ? 'মেন্যু' : 'Menu'}</h3>
              <ul className="flex flex-col gap-2.5 text-[var(--soft)]">
                {[
                  ['#process', isBn ? 'কাজের পদ্ধতি' : 'How it works'],
                  ['#properties', isBn ? 'ফিচারসমূহ' : 'Features'],
                  ['#testimonials', isBn ? 'মতামত' : 'Reviews'],
                  ['#blog', isBn ? 'গাইড' : 'Guides'],
                ].map(([href, label]) => (
                  <li key={href}>
                    <a href={href} className={`${s.focusRing} rounded hover:text-white transition-colors`}>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="lg:col-span-3">
              <h3 className="text-xs font-medium text-white/60 mb-4">{isBn ? 'যোগাযোগ' : 'Contact'}</h3>
              <address className="not-italic flex flex-col gap-3 text-[var(--soft)]">
                <span className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[var(--teal)] shrink-0 mt-0.5" aria-hidden="true" />
                  Gulshan Centre Point, Road 90, Gulshan-2, Dhaka 1212
                </span>
                <span className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[var(--teal)] shrink-0" aria-hidden="true" />
                  +880 1700-000000
                </span>
                <span className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[var(--teal)] shrink-0" aria-hidden="true" />
                  support@barivara.app
                </span>
              </address>
            </div>

            <div className="lg:col-span-3">
              <h3 id="newsletter-title" className="text-xs font-medium text-white/60 mb-4">
                {isBn ? 'নিউজলেটার' : 'Newsletter'}
              </h3>
              <p className="text-[var(--muted)] leading-relaxed mb-4">
                {isBn
                  ? 'বাড়ি ব্যবস্থাপনা ও আইনি পরামর্শের মাসিক আপডেট।'
                  : 'Monthly landlord tax guides and tenancy law updates.'}
              </p>
              {isFooterSubscribed ? (
                <p role="status" className="text-[#a6e8e4]">
                  {isBn ? '✓ সাবস্ক্রাইব করা হয়েছে' : '✓ You’re subscribed.'}
                </p>
              ) : (
                <form onSubmit={handleNewsletterSubmit} aria-labelledby="newsletter-title" className="flex gap-2">
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={footerEmail}
                    onChange={(e) => setFooterEmail(e.target.value)}
                    placeholder={isBn ? 'আপনার ইমেইল' : 'you@example.com'}
                    aria-label={isBn ? 'ইমেইল' : 'Email address'}
                    className={`${s.field} !rounded-full`}
                  />
                  <button
                    type="submit"
                    aria-label={isBn ? 'সাবস্ক্রাইব' : 'Subscribe'}
                    className={`${s.iconBtn} shrink-0 !bg-white !text-[#0d1117] !border-white`}
                  >
                    <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--muted)]">
            <p>© 2026 BariVara. {isBn ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All rights reserved.'}</p>
            <p>{isBn ? 'ঢাকায় তৈরি' : 'Made in Dhaka'}</p>
          </div>
        </div>
      </footer>

      {/* ─────────────────────────────────────────────────────────────
          MODULE DETAILS DIALOG
      ───────────────────────────────────────────────────────────── */}
      <LandingDialog open={isModuleOpen} onClose={closeModule} labelledBy="module-dialog-title">
        <div className="relative aspect-[16/9] bg-[#111c31]">
          <Image src={m.imageUrl} alt="" fill sizes="680px" className="object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f1b33] via-transparent to-transparent" />
          <button
            type="button"
            onClick={closeModule}
            aria-label={isBn ? 'বন্ধ করুন' : 'Close'}
            className={`${s.iconBtn} absolute top-4 right-4 !bg-[#0b1426]/70 backdrop-blur`}
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        <div className="p-6 sm:p-8 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-[var(--teal)]">{isBn ? m.badgeBn : m.badge}</span>
            <h2 id="module-dialog-title" className="text-2xl font-medium leading-snug tracking-[-0.02em]">
              {isBn ? m.titleBn : m.title}
            </h2>
          </div>
          <p className="text-[15px] text-[var(--soft)]/85 leading-relaxed">
            {isBn ? m.descriptionBn : m.descriptionEn}
          </p>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm text-[var(--soft)]">
            {(isBn ? m.featuresBn : m.features).map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[var(--teal)] shrink-0 mt-0.5" aria-hidden="true" />
                {feature}
              </li>
            ))}
          </ul>
          <div className="rounded-xl border border-white/10 bg-[#0b1426] px-4 py-3 text-sm">
            <span className="block text-xs text-[var(--muted)] mb-1">
              {isBn ? 'নমুনা আউটপুট' : 'Sample output'}
            </span>
            <span className="font-mono text-[13px] text-[#a6e8e4]">
              {isBn ? m.sampleUiSnippetBn : m.sampleUiSnippetEn}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button type="button" onClick={closeModule} className={`${s.pill} ${s.pillGlass}`}>
              {isBn ? 'বন্ধ করুন' : 'Close'}
            </button>
            <Link href="/register" className={`${s.pill} ${s.pillLight}`}>
              {isBn ? m.ctaTextBn : m.ctaTextEn}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </LandingDialog>

      {/* ─────────────────────────────────────────────────────────────
          CONSULTATION DIALOG
      ───────────────────────────────────────────────────────────── */}
      <LandingDialog
        open={isConsultationOpen}
        onClose={closeConsultation}
        labelledBy="consult-dialog-title"
        narrow
      >
        <div className="p-6 sm:p-8 flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <h2 id="consult-dialog-title" className="text-xl font-medium leading-snug tracking-[-0.015em]">
              {isBn ? 'ডেমো ও সেটআপের অনুরোধ' : 'Request a demo & setup'}
            </h2>
            <button
              type="button"
              onClick={closeConsultation}
              aria-label={isBn ? 'বন্ধ করুন' : 'Close'}
              className={`${s.iconBtn} !w-9 !h-9 shrink-0`}
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            {isBn
              ? 'আপনার তথ্য দিন। আমাদের প্রতিনিধি যোগাযোগ করে বিনামূল্যে সেটআপে সহায়তা করবে।'
              : 'Leave your details and our team will call to set up your building and WhatsApp receipts.'}
          </p>

          <form onSubmit={handleConsultationSubmit} className="flex flex-col gap-4 text-sm">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="consult-name" className="text-[var(--soft)]">
                {isBn ? 'পূর্ণ নাম' : 'Full name'}
              </label>
              <input
                id="consult-name"
                type="text"
                required
                data-autofocus
                autoComplete="name"
                value={consultName}
                onChange={(e) => setConsultName(e.target.value)}
                placeholder={isBn ? 'রফিকুল ইসলাম' : 'Rafiqul Islam'}
                className={s.field}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="consult-phone" className="text-[var(--soft)]">
                {isBn ? 'মোবাইল নম্বর (হোয়াটসঅ্যাপ)' : 'Mobile (WhatsApp)'}
              </label>
              <input
                id="consult-phone"
                type="tel"
                required
                autoComplete="tel"
                value={consultPhone}
                onChange={(e) => setConsultPhone(e.target.value)}
                placeholder="+880 1700-000000"
                className={s.field}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="consult-units" className="text-[var(--soft)]">
                  {isBn ? 'ইউনিট সংখ্যা' : 'Units'}
                </label>
                <select
                  id="consult-units"
                  value={consultUnits}
                  onChange={(e) => setConsultUnits(e.target.value)}
                  className={s.field}
                >
                  <option value="1–5">{isBn ? '১–৫টি ফ্ল্যাট' : '1–5 flats'}</option>
                  <option value="6–10">{isBn ? '৬–১০টি ফ্ল্যাট' : '6–10 flats'}</option>
                  <option value="11–15+">{isBn ? '১১–১৫+ ফ্ল্যাট' : '11–15+ flats'}</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="consult-location" className="text-[var(--soft)]">
                  {isBn ? 'এলাকা' : 'Location'}
                </label>
                <select
                  id="consult-location"
                  value={consultLocation}
                  onChange={(e) => setConsultLocation(e.target.value)}
                  className={s.field}
                >
                  <option value="Dhaka">{isBn ? 'ঢাকা' : 'Dhaka'}</option>
                  <option value="Chittagong">{isBn ? 'চট্টগ্রাম' : 'Chittagong'}</option>
                  <option value="Sylhet">{isBn ? 'সিলেট' : 'Sylhet'}</option>
                  <option value="Other">{isBn ? 'অন্যান্য জেলা' : 'Other district'}</option>
                </select>
              </div>
            </div>
            <button type="submit" className={`${s.pill} ${s.pillTeal} mt-2 w-full`}>
              {isBn ? 'অনুরোধ পাঠান' : 'Request demo'}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      </LandingDialog>
    </div>
  );
}
