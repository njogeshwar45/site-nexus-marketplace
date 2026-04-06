import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Zap, Shield, Clock, Star, ChevronRight } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

const QUIZ_STEPS = [
  { title: 'What type of business do you have?', options: ['E-commerce', 'SaaS', 'Services', 'Blog', 'Restaurant', 'Real Estate', 'Education', 'Other'] },
  { title: 'What is your budget?', options: ['Under $500', '$500–$1500', '$1500–$5000', '$5000+'] },
  { title: 'What is your main goal?', options: ['Sell products', 'Generate leads', 'Build brand', 'Launch fast', 'Replace old site'] },
  { title: 'Tech stack preference?', options: ['React', 'WordPress', 'No preference'] },
];

const STATS = [
  { value: '42+', label: 'Websites Listed' },
  { value: '200+', label: 'Happy Buyers' },
  { value: '48hr', label: 'Delivery' },
  { value: '5-star', label: 'Support' },
];

const TESTIMONIALS = [
  { name: 'Sarah K.', role: 'Startup Founder', text: 'NexusGrid saved us months of development. The SaaS template was production-ready out of the box.' },
  { name: 'Marcus T.', role: 'Agency Owner', text: 'The quality of the code and design is exceptional. Our clients love the portfolio sites we\'ve deployed.' },
  { name: 'Priya R.', role: 'Restaurant Owner', text: 'Our online reservations increased 300% after launching our NexusGrid website. Incredible value.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number = 0) => ({ opacity: 1, scale: 1, transition: { delay: i * 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] } }),
};

export default function LandingPage() {
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);

  const handleQuizAnswer = (answer: string) => {
    const newAnswers = [...quizAnswers, answer];
    setQuizAnswers(newAnswers);
    if (quizStep < QUIZ_STEPS.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      localStorage.setItem('nexusgrid_quiz', JSON.stringify(newAnswers));
      setQuizOpen(false);
      setQuizStep(0);
      setQuizAnswers([]);
      window.location.href = '/marketplace';
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Nav */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 w-full z-50 glass"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="font-display text-xl font-bold gradient-text">NexusGrid</Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/marketplace" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Marketplace</Link>
            <Link to="/request-deploy" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Deploy</Link>
            <Link to="/request-build" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Custom Build</Link>
            <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Admin</Link>
            <ThemeToggle />
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center gradient-mesh overflow-hidden">
        {/* Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary/30"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 1, 0],
                y: [0, -20, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: 'easeInOut',
              }}
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center pt-20">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            Premium Websites,<br />
            <span className="gradient-text">Ready to Launch</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto mb-10"
          >
            Discover handcrafted, production-ready websites built with modern tech stacks. Buy, deploy, and launch in hours — not months.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link to="/marketplace">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Button className="gradient-btn text-primary-foreground px-8 py-6 text-lg rounded-xl border-0 font-medium">
                  Browse Websites <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant="outline"
                className="glass px-8 py-6 text-lg rounded-xl text-foreground border-glass-border hover:bg-muted/30"
                onClick={() => setQuizOpen(true)}
              >
                Find My Perfect Site <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Floating preview cards */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto"
          >
            {['ShopWave Pro', 'CloudDash SaaS', 'Artisan Folio'].map((name, i) => (
              <motion.div
                key={name}
                variants={scaleIn}
                custom={i}
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  y: { duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 },
                }}
              >
                <GlassCard className="text-left">
                  <div className="w-full h-24 rounded-lg bg-muted/30 mb-3" />
                  <p className="font-display font-semibold text-sm">{name}</p>
                  <p className="text-muted-foreground text-xs">From $499</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <div className="glow-divider" />
      <section className="py-16 bg-space-navy">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          {STATS.map((stat, i) => (
            <motion.div key={stat.label} variants={fadeUp} custom={i}>
              <p className="font-display text-3xl font-bold gradient-text">{stat.value}</p>
              <p className="text-muted-foreground text-sm mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Why NexusGrid */}
      <div className="glow-divider" />
      <section className="py-24 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl font-bold text-center mb-16"
          >
            Why <span className="gradient-text">NexusGrid</span>?
          </motion.h2>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { icon: Zap, title: 'Launch Instantly', desc: 'Skip months of development. Our websites are production-ready and can be deployed within 48 hours.' },
              { icon: Shield, title: 'Premium Quality', desc: 'Every website is handcrafted with clean code, best practices, and modern tech stacks. No templates.' },
              { icon: Clock, title: 'Full Ownership', desc: 'Get complete source code, documentation, and 30-day support. The website is 100% yours.' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title} variants={scaleIn} custom={i} whileHover={{ y: -6, transition: { duration: 0.3 } }}>
                <GlassCard>
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <div className="glow-divider" />
      <section className="py-24 bg-space-navy">
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl font-bold text-center mb-16"
          >
            What Our <span className="gradient-text">Clients Say</span>
          </motion.h2>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid md:grid-cols-3 gap-8"
          >
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} variants={fadeUp} custom={i} whileHover={{ y: -6, transition: { duration: 0.3 } }}>
                <GlassCard>
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-secondary text-secondary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">"{t.text}"</p>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-muted-foreground text-xs">{t.role}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTAs */}
      <div className="glow-divider" />
      <section className="py-24 bg-background">
        <div className="max-w-4xl mx-auto px-4 space-y-16">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="font-display text-3xl font-bold mb-4">Want to Deploy Your Website?</h2>
            <p className="text-muted-foreground mb-6">Already have a website built? Let our experts deploy, host, and maintain it for you.</p>
            <Link to="/request-deploy">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="inline-block">
                <Button className="gradient-btn text-primary-foreground px-8 py-4 rounded-xl border-0">
                  Request Deployment <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
          <div className="glow-divider" />
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="font-display text-3xl font-bold mb-4">Need a Custom Website Built?</h2>
            <p className="text-muted-foreground mb-6">Tell us your vision — we'll build it from scratch with premium quality.</p>
            <Link to="/request-build">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="inline-block">
                <Button className="gradient-btn text-primary-foreground px-8 py-4 rounded-xl border-0">
                  Commission a Build <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="border-t border-border py-12 bg-space-navy"
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <p className="font-display font-bold gradient-text mb-4">NexusGrid</p>
              <p className="text-muted-foreground text-sm">Premium websites, ready to launch.</p>
            </div>
            <div>
              <p className="font-semibold text-sm mb-3">Navigate</p>
              <div className="space-y-2">
                <Link to="/" className="block text-muted-foreground text-sm hover:text-foreground transition-colors">Home</Link>
                <Link to="/marketplace" className="block text-muted-foreground text-sm hover:text-foreground transition-colors">Marketplace</Link>
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm mb-3">Services</p>
              <div className="space-y-2">
                <Link to="/request-deploy" className="block text-muted-foreground text-sm hover:text-foreground transition-colors">Request Deploy</Link>
                <Link to="/request-build" className="block text-muted-foreground text-sm hover:text-foreground transition-colors">Request Build</Link>
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm mb-3">Contact</p>
              <a href="https://caselgrid.tech" target="_blank" rel="noopener noreferrer" className="text-muted-foreground text-sm hover:text-foreground transition-colors">caselgrid.tech</a>
            </div>
          </div>
          <div className="glow-divider mb-4" />
          <p className="text-center text-muted-foreground text-xs">
            Built by <a href="https://caselgrid.tech" target="_blank" rel="noopener noreferrer" className="gradient-text hover:underline">CaselGrid</a> · © {new Date().getFullYear()} NexusGrid
          </p>
        </div>
      </motion.footer>

      {/* Quiz Modal */}
      <Dialog open={quizOpen} onOpenChange={setQuizOpen}>
        <DialogContent className="glass border-glass-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Find Your Perfect Site</DialogTitle>
          </DialogHeader>
          <Progress value={((quizStep + 1) / QUIZ_STEPS.length) * 100} className="mb-4 h-2" />
          <p className="text-sm text-muted-foreground mb-1">Step {quizStep + 1} of {QUIZ_STEPS.length}</p>
          <motion.p
            key={quizStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="font-semibold mb-4"
          >
            {QUIZ_STEPS[quizStep].title}
          </motion.p>
          <motion.div
            key={`opts-${quizStep}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="grid grid-cols-2 gap-3"
          >
            {QUIZ_STEPS[quizStep].options.map((opt, i) => (
              <motion.div
                key={opt}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.25 }}
              >
                <Button
                  variant="outline"
                  className="glass border-glass-border hover:border-primary hover:bg-primary/10 text-sm py-3 h-auto w-full"
                  onClick={() => handleQuizAnswer(opt)}
                >
                  {opt}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
