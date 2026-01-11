'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  Phone,
  BarChart3,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Users,
  Clock,
  TrendingUp,
  Globe,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { useTranslation } from '@/lib/useTranslation';

export default function LandingPage() {
  const router = useRouter();
  const t = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Sampark</h1>
                <p className="text-xs text-slate-500">MCD 311</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LanguageToggle />
              <Button
                variant="ghost"
                onClick={() => router.push('/login')}
                className="text-slate-600 hover:text-slate-900"
              >
                {t.login.signIn}
              </Button>
              <Button onClick={() => router.push('/login')} className="shadow-md">
                {t.landing.getStarted}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-sm font-medium text-blue-700 mb-8">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Civic Services Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              {t.landing.title.split(' with ')[0]}
              <span className="block gradient-text mt-2">{t.landing.title.split(' with ')[1] || 'Municipal Services'}</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              {t.landing.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button
                size="lg"
                onClick={() => router.push('/login')}
                className="text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all hover-lift"
              >
                {t.landing.getStarted}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 border-2"
              >
                <Phone className="w-5 h-5 mr-2" />
                {t.landing.call311}
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">98%</div>
                <div className="text-sm text-slate-600">{t.landing.stats.resolutionRate}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-1">24h</div>
                <div className="text-sm text-slate-600">{t.landing.stats.avgResponse}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">15L+</div>
                <div className="text-sm text-slate-600">{t.landing.stats.citizensServed}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600 mb-1">7/24</div>
                <div className="text-sm text-slate-600">{t.landing.stats.available}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              {t.landing.features.title}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {t.landing.features.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Phone,
                title: t.landing.features.voiceFirst.title,
                description: t.landing.features.voiceFirst.description,
                color: 'blue',
              },
              {
                icon: BarChart3,
                title: t.landing.features.analytics.title,
                description: t.landing.features.analytics.description,
                color: 'emerald',
              },
              {
                icon: MapPin,
                title: t.landing.features.geographic.title,
                description: t.landing.features.geographic.description,
                color: 'purple',
              },
              {
                icon: Zap,
                title: t.landing.features.automation.title,
                description: t.landing.features.automation.description,
                color: 'amber',
              },
              {
                icon: Clock,
                title: t.landing.features.sla.title,
                description: t.landing.features.sla.description,
                color: 'red',
              },
              {
                icon: Users,
                title: t.landing.features.multichannel.title,
                description: t.landing.features.multichannel.description,
                color: 'indigo',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-6 bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition-all hover-lift fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-12 h-12 rounded-lg bg-${feature.color}-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8 bg-gradient-government text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t.landing.cta.title}
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {t.landing.cta.subtitle}
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => router.push('/login')}
            className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-blue-50 shadow-xl"
          >
            {t.landing.cta.button}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-8 bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold">Sampark</h3>
                  <p className="text-xs">MCD 311</p>
                </div>
              </div>
              <p className="text-sm">
                AI-powered civic complaint management system for the Municipal Corporation of Delhi.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/dashboard" className="hover:text-white transition-colors">{t.nav.dashboard}</Link></li>
                <li><Link href="/complaints" className="hover:text-white transition-colors">{t.nav.complaints}</Link></li>
                <li><Link href="/analytics" className="hover:text-white transition-colors">{t.nav.analytics}</Link></li>
                <li><Link href="/heatmap" className="hover:text-white transition-colors">{t.nav.heatmap}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>Municipal Corporation of Delhi</li>
                <li>New Delhi, India</li>
                <li>Phone: 311</li>
                <li>Email: support@mcd.gov.in</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-center text-sm">
            <p>© 2026 Municipal Corporation of Delhi. All rights reserved.</p>
            <p className="mt-2">Built with ❤️ for the citizens of Delhi</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
