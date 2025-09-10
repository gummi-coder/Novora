import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'es' | 'is';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation data
const translations = {
  en: {
    // MVP Landing Page
    'mvp.pilot.badge': 'MVP Pilot - Join the Future of Team Feedback',
    'mvp.hero.title.line1': 'Know how your team',
    'mvp.hero.title.line2': 'really feels',
    'mvp.hero.title.line3': '—anonymously',
    'mvp.hero.subtitle': '60-second monthly pulse. Private, honest, actionable.',
    'mvp.hero.subtitle.bold1': 'Transform your team culture',
    'mvp.hero.subtitle.bold2': 'anonymous feedback',
    'mvp.hero.benefit1': '5-minute setup',
    'mvp.hero.benefit2': '100% anonymous',
    'mvp.hero.benefit3': 'Actionable insights',
    'mvp.hero.cta.primary': 'Start Free Pilot',
    'mvp.hero.cta.secondary': 'See Sample Dashboard',
    
    // How it works
    'mvp.how.title': 'How it works',
    'mvp.how.subtitle': 'Simple, anonymous, and effective team pulse surveys',
    'mvp.how.step1.title': 'Launch monthly pulse',
    'mvp.how.step1.desc': 'Create and send your team survey in minutes',
    'mvp.how.step2.title': 'Team answers anonymously',
    'mvp.how.step2.desc': '0-10 score + optional comment, fully private',
    'mvp.how.step3.title': 'Get insights & act',
    'mvp.how.step3.desc': 'See trends + comments, fix issues early',
    
    // Trust section
    'mvp.trust.title': 'We can\'t see who answered',
    'mvp.trust.subtitle': 'Your team\'s privacy is protected with Min-N guard technology',
    'mvp.trust.feature': 'No results shown until ≥5 responses',
    'mvp.trust.link': 'Read privacy note →',
    
    // Value props
    'mvp.value.title': 'Why teams choose Novora',
    'mvp.value.subtitle': 'Built for modern teams who value transparency and growth',
    'mvp.value.fast.title': 'Lightning fast',
    'mvp.value.fast.desc': 'Set up in 5 minutes, get responses in real-time',
    'mvp.value.insights.title': 'Actionable insights',
    'mvp.value.insights.desc': 'Clear trends and comments to drive decisions',
    'mvp.value.trends.title': 'Trends, not noise',
    'mvp.value.trends.desc': 'See patterns over time, not just one-off responses',
    'mvp.value.fix.title': 'Fix problems early',
    'mvp.value.fix.desc': 'Identify and address issues before they escalate',
    
    // Social proof
    'mvp.social.text': 'Piloting with people-first teams in Spain',
    'mvp.social.subtext': 'Join the growing community of teams using Novora',
    
    // FAQ
    'mvp.faq.title': 'Frequently Asked Questions',
    'mvp.faq.subtitle': 'Everything you need to know about our MVP pilot',
    'mvp.faq.q1': 'Is it really anonymous?',
    'mvp.faq.a1': 'Yes. We use Min-N guard technology to ensure no individual responses can be identified. Results only appear when enough people have responded.',
    'mvp.faq.q2': 'How long does setup take?',
    'mvp.faq.a2': 'Under 5 minutes. Create your survey, get the link, and share it with your team. That\'s it.',
    'mvp.faq.q3': 'Can I export results?',
    'mvp.faq.a3': 'For the MVP pilot, results are viewable in the dashboard. Export functionality will be added based on user feedback.',
    
    // CTA
    'mvp.cta.title': 'Ready to know how your team really feels?',
    'mvp.cta.subtitle': 'Join the pilot and get started in minutes',
    'mvp.cta.button': 'Start free pilot now',
    
    // MVP Dashboard
    'mvp.dashboard.title': 'Team Pulse Dashboard',
    'mvp.dashboard.subtitle': 'Monitor your team\'s anonymous feedback and engagement',
    'mvp.dashboard.kpi.responses': 'Total Responses',
    'mvp.dashboard.kpi.score': 'Average Score',
    'mvp.dashboard.kpi.rate': 'Response Rate',
    'mvp.dashboard.kpi.status': 'Status',
    'mvp.dashboard.kpi.results.visible': 'Results visible',
    'mvp.dashboard.kpi.more.needed': 'more needed',
    'mvp.dashboard.kpi.from.last.month': 'from last month',
    'mvp.dashboard.kpi.of.team': 'of 10 team members',
    'mvp.dashboard.kpi.team.members': 'team members',
    'mvp.dashboard.kpi.active': 'Active',
    'mvp.dashboard.kpi.collecting': 'Collecting',
    'mvp.dashboard.kpi.building.anonymity': 'Building anonymity',
    
    // Privacy banner
    'mvp.dashboard.privacy.title': 'Privacy Protection Active',
    'mvp.dashboard.privacy.desc': 'We need at least {min} responses before showing results to protect individual anonymity. Currently have {current} responses.',
    
    // Comments
    'mvp.dashboard.comments.title': 'Anonymous Comments',
    'mvp.dashboard.comments.visible': 'Your team\'s anonymous feedback',
    'mvp.dashboard.comments.hidden': 'Comments will appear when privacy threshold is met',
    'mvp.dashboard.comments.anonymous': 'Anonymous response',
    'mvp.dashboard.comments.days.ago': 'days ago',
    'mvp.dashboard.comments.threshold': 'Comments will appear when {min} responses are collected',
    'mvp.dashboard.comments.protection': 'This protects individual anonymity',
    
    // Share section
    'mvp.dashboard.share.title': 'Share & Collect Responses',
    'mvp.dashboard.share.subtitle': 'Get your team\'s feedback with this survey link',
    'mvp.dashboard.share.link.label': 'Survey Link',
    'mvp.dashboard.share.copy': 'Copy',
    'mvp.dashboard.share.whatsapp': 'Share via WhatsApp',
    'mvp.dashboard.share.whatsapp.message': 'Hi 👋 60-second anonymous survey. Respond here: {LINK}\n\nResults only shown if ≥5 people respond.',
    'mvp.dashboard.share.email.subject': 'Anonymous Team Survey - Your Feedback Matters',
    'mvp.dashboard.share.email.body': 'Hi there!\n\nI\'d like to invite you to participate in a quick anonymous survey about our team. It only takes 60 seconds and your responses are completely confidential.\n\nPlease click the link below to participate:\n{LINK}\n\nResults will only be shown when we have enough responses to ensure anonymity.\n\nThank you for your time!',
    'mvp.dashboard.share.email': 'Share via Email',
    'mvp.dashboard.share.sms': 'Share via SMS',
    'mvp.dashboard.share.sms.message': 'Hi! Quick anonymous team survey (60s). Your feedback matters: {LINK}\n\nResults only shown when enough people respond.',
    
    // Question Breakdown
    'mvp.dashboard.questions.title': 'Question Breakdown',
    'mvp.dashboard.questions.mood': 'Mood',
    'mvp.dashboard.questions.manager': 'Manager Support',
    'mvp.dashboard.questions.workload': 'Workload',
    'mvp.dashboard.questions.recognition': 'Recognition',
    'mvp.dashboard.questions.locked': 'Locked — need {count} more',
    'mvp.dashboard.questions.responses': 'n={count}',
    
    // Manual Reminder Section
    'mvp.dashboard.reminder.title': 'Send Reminders',
    'mvp.dashboard.reminder.subtitle': 'Send follow-up reminders to increase response rates',
    'mvp.dashboard.reminder.email.button': 'Email Reminder',
    'mvp.dashboard.reminder.email.subject': 'Reminder: Team Survey - Your Input Still Needed',
    'mvp.dashboard.reminder.email.body': 'Hi there!\n\nJust a friendly reminder about the team survey we shared earlier. Your feedback is important and only takes 60 seconds.\n\nPlease take a moment to share your thoughts:\n{LINK}\n\nResults will only be shown when we have enough responses to ensure anonymity.\n\nThank you for your time!',
    'mvp.dashboard.reminder.sms.button': 'SMS Reminder',
    'mvp.dashboard.reminder.sms.message': 'Reminder: Quick team survey (60s). Your feedback matters: {LINK}\n\nResults only when enough people respond.',
    'mvp.dashboard.reminder.whatsapp.button': 'WhatsApp Reminder',
    'mvp.dashboard.reminder.whatsapp.message': 'Hi! 👋 Just a friendly reminder about the team survey. Your feedback matters: {LINK}\n\nResults only shown when enough people respond.',
    
    // MVP Survey Questions
    'mvp.survey.mood.question': 'How are you feeling at work this week?',
    'mvp.survey.manager.question': 'Do you feel supported and trusted by your manager?',
    'mvp.survey.workload.question': 'Is your current workload manageable?',
    'mvp.survey.recognition.question': 'Do you feel appreciated for your work?',
    
    // Improvement Questions
    'mvp.survey.improvement.w1.question': 'What\'s one thing we could change next week to improve your experience?',
    'mvp.survey.balanced.w2.question': 'What\'s one thing that helped or hurt your week?',
    'mvp.survey.keepchange.w4.question': 'What should we keep doing or change?',
    
    // Survey UI Elements
    'mvp.survey.title': 'Team Pulse Survey',
    'mvp.survey.subtitle': 'Choose your language and start the survey',
    'mvp.survey.rating.instruction': 'Rate your response on a scale from 0 to 10',
    'mvp.survey.text.instruction': 'Share your thoughts (optional, max 800 characters)',
    'mvp.survey.scale.poor': 'Very Poor',
    'mvp.survey.scale.excellent': 'Excellent',
    'mvp.survey.button.back': 'Back',
    'mvp.survey.button.next': 'Next',
    'mvp.survey.button.submit': 'Submit Survey',
    'mvp.survey.button.start': 'Start Survey',
    'mvp.survey.progress': 'Question {current} of {total}',
    'mvp.survey.anonymous': 'Your responses are completely anonymous',
    'mvp.survey.thankyou.title': 'Thank You!',
    'mvp.survey.thankyou.message': 'Your feedback has been submitted anonymously. Results will be shared when enough team members respond.',
    'mvp.dashboard.share.invite': 'Invite Team Members',
    'mvp.dashboard.share.status': 'Status:',
    'mvp.dashboard.share.status.active': 'Active • Results visible',
    'mvp.dashboard.share.status.collecting': 'Collecting responses • {current}/{min}',
    
    // Demo notice
    'mvp.dashboard.demo.title': 'Demo Mode Active',
    'mvp.dashboard.demo.desc': 'This is a sample dashboard showing how your results will look. In the real version, you\'ll see your actual team\'s anonymous feedback.',
    
    // Navigation
    'mvp.nav.demo': 'Demo Dashboard',
    'mvp.nav.start.pilot': 'Start Pilot',
    'mvp.nav.demo.mode': 'Demo Mode',
    'mvp.nav.back.landing': 'Back to Landing',
    'mvp.nav.logout': 'Logout',
    
    // Sign In Page
    'mvp.signin.title': 'Welcome to your MVP Dashboard',
    'mvp.signin.subtitle': 'Sign in to access your team pulse results',
    'mvp.signin.form.title': 'Sign In',
    'mvp.signin.form.subtitle': 'Access your team\'s anonymous feedback',
    'mvp.signin.email.label': 'Email Address',
    'mvp.signin.email.placeholder': 'Enter your email',
    'mvp.signin.password.label': 'Password',
    'mvp.signin.password.placeholder': 'Enter your password',
    'mvp.signin.button.signing': 'Signing in...',
    'mvp.signin.button.text': 'Sign In',
    'mvp.signin.demo.title': 'Demo Access',
    'mvp.signin.demo.description': 'For MVP pilot testing, you can use any email/password combination',
    'mvp.signin.demo.email': 'Email:',
    'mvp.signin.demo.password': 'Password:',
    'mvp.signin.back.link': '← Back to MVP Landing',
    'mvp.signin.no.access': 'Don\'t have access?',
    'mvp.signin.create.account': 'Create account',
    'mvp.signin.benefits.anonymous': '100% Anonymous',
    'mvp.signin.benefits.insights': 'Real-time Insights',
    'mvp.signin.benefits.actionable': 'Actionable Data',
    'mvp.signin.success.message': 'Welcome to Novora MVP!',
    'mvp.signin.error.credentials': 'Please enter both email and password',
    'mvp.signin.error.failed': 'Login failed. Please try again.',
    
    // Sign Up Page
    'mvp.signup.title': 'Join the MVP Pilot',
    'mvp.signup.subtitle': 'Create your account and start collecting team feedback',
    'mvp.signup.form.title': 'Create Account',
    'mvp.signup.form.subtitle': 'Get started with anonymous team pulse surveys',
    'mvp.signup.firstname.label': 'First Name',
    'mvp.signup.firstname.placeholder': 'First name',
    'mvp.signup.lastname.label': 'Last Name',
    'mvp.signup.lastname.placeholder': 'Last name',
    'mvp.signup.company.label': 'Company Name',
    'mvp.signup.company.placeholder': 'Your company name',
    'mvp.signup.email.label': 'Email Address',
    'mvp.signup.email.placeholder': 'Enter your email',
    'mvp.signup.password.label': 'Password',
    'mvp.signup.password.placeholder': 'Create password',
    'mvp.signup.confirmpassword.label': 'Confirm Password',
    'mvp.signup.confirmpassword.placeholder': 'Confirm password',
    'mvp.signup.button.creating': 'Creating account...',
    'mvp.signup.button.text': 'Create MVP Account',
    'mvp.signup.benefits.title': 'What you get with MVP:',
    'mvp.signup.benefits.anonymous': '100% anonymous team surveys',
    'mvp.signup.benefits.insights': 'Real-time pulse insights',
    'mvp.signup.benefits.privacy': 'Min-N guard privacy protection',
    'mvp.signup.already.have': 'Already have an account?',
    'mvp.signup.signin.link': 'Sign in here',
    'mvp.signup.back.link': '← Back to MVP Landing',
    'mvp.signup.success.message': 'Account created successfully! Welcome to Novora MVP!',
    'mvp.signup.error.passwords': 'Passwords don\'t match',
    'mvp.signup.error.required': 'Please fill in all required fields',
    'mvp.signup.error.failed': 'Signup failed. Please try again.',
    
    // Common
    'mvp.brand': 'Novora',
    'mvp.badge': 'MVP Pilot',
  },
  
  es: {
    // MVP Landing Page
    'mvp.pilot.badge': 'MVP Piloto - Únete al Futuro del Feedback de Equipo',
    'mvp.hero.title.line1': 'Descubre cómo se siente',
    'mvp.hero.title.line2': 'realmente tu equipo',
    'mvp.hero.title.line3': '—de forma anónima',
    'mvp.hero.subtitle': 'Pulso mensual de 60 segundos. Privado, honesto, accionable.',
    'mvp.hero.subtitle.bold1': 'Transforma la cultura de tu equipo',
    'mvp.hero.subtitle.bold2': 'feedback anónimo',
    'mvp.hero.benefit1': 'Configuración en 5 minutos',
    'mvp.hero.benefit2': '100% anónimo',
    'mvp.hero.benefit3': 'Insights accionables',
    'mvp.hero.cta.primary': 'Comenzar Piloto Gratis',
    'mvp.hero.cta.secondary': 'Ver Dashboard de Ejemplo',
    
    // How it works
    'mvp.how.title': 'Cómo funciona',
    'mvp.how.subtitle': 'Encuestas de pulso de equipo simples, anónimas y efectivas',
    'mvp.how.step1.title': 'Lanza el pulso mensual',
    'mvp.how.step1.desc': 'Crea y envía la encuesta de tu equipo en minutos',
    'mvp.how.step2.title': 'El equipo responde anónimamente',
    'mvp.how.step2.desc': 'Puntuación 0-10 + comentario opcional, completamente privado',
    'mvp.how.step3.title': 'Obtén insights y actúa',
    'mvp.how.step3.desc': 'Ve tendencias + comentarios, soluciona problemas temprano',
    
    // Trust section
    'mvp.trust.title': 'No podemos ver quién respondió',
    'mvp.trust.subtitle': 'La privacidad de tu equipo está protegida con tecnología Min-N guard',
    'mvp.trust.feature': 'No se muestran resultados hasta ≥5 respuestas',
    'mvp.trust.link': 'Leer nota de privacidad →',
    
    // Value props
    'mvp.value.title': 'Por qué los equipos eligen Novora',
    'mvp.value.subtitle': 'Construido para equipos modernos que valoran la transparencia y el crecimiento',
    'mvp.value.fast.title': 'Súper rápido',
    'mvp.value.fast.desc': 'Configuración en 5 minutos, respuestas en tiempo real',
    'mvp.value.insights.title': 'Insights accionables',
    'mvp.value.insights.desc': 'Tendencias claras y comentarios para tomar decisiones',
    'mvp.value.trends.title': 'Tendencias, no ruido',
    'mvp.value.trends.desc': 'Ve patrones a lo largo del tiempo, no solo respuestas únicas',
    'mvp.value.fix.title': 'Soluciona problemas temprano',
    'mvp.value.fix.desc': 'Identifica y aborda problemas antes de que escalen',
    
    // Social proof
    'mvp.social.text': 'Pilotando con equipos centrados en personas en España',
    'mvp.social.subtext': 'Únete a la creciente comunidad de equipos que usan Novora',
    
    // FAQ
    'mvp.faq.title': 'Preguntas Frecuentes',
    'mvp.faq.subtitle': 'Todo lo que necesitas saber sobre nuestro piloto MVP',
    'mvp.faq.q1': '¿Es realmente anónimo?',
    'mvp.faq.a1': 'Sí. Usamos tecnología Min-N guard para asegurar que ninguna respuesta individual pueda ser identificada. Los resultados solo aparecen cuando suficientes personas han respondido.',
    'mvp.faq.q2': '¿Cuánto tiempo toma la configuración?',
    'mvp.faq.a2': 'Menos de 5 minutos. Crea tu encuesta, obtén el enlace y compártelo con tu equipo. Eso es todo.',
    'mvp.faq.q3': '¿Puedo exportar los resultados?',
    'mvp.faq.a3': 'Para el piloto MVP, los resultados son visibles en el dashboard. La funcionalidad de exportación se agregará basándose en el feedback de los usuarios.',
    
    // CTA
    'mvp.cta.title': '¿Listo para saber cómo se siente realmente tu equipo?',
    'mvp.cta.subtitle': 'Únete al piloto y comienza en minutos',
    'mvp.cta.button': 'Comenzar piloto gratis ahora',
    
    // MVP Dashboard
    'mvp.dashboard.title': 'Dashboard de Pulso de Equipo',
    'mvp.dashboard.subtitle': 'Monitorea el feedback anónimo y engagement de tu equipo',
    'mvp.dashboard.kpi.responses': 'Total de Respuestas',
    'mvp.dashboard.kpi.score': 'Puntuación Promedio',
    'mvp.dashboard.kpi.rate': 'Tasa de Respuesta',
    'mvp.dashboard.kpi.status': 'Estado',
    'mvp.dashboard.kpi.results.visible': 'Resultados visibles',
    'mvp.dashboard.kpi.more.needed': 'más necesarias',
    'mvp.dashboard.kpi.from.last.month': 'del mes pasado',
    'mvp.dashboard.kpi.of.team': 'de 10 miembros del equipo',
    'mvp.dashboard.kpi.team.members': 'miembros del equipo',
    'mvp.dashboard.kpi.active': 'Activo',
    'mvp.dashboard.kpi.collecting': 'Recolectando',
    'mvp.dashboard.kpi.building.anonymity': 'Construyendo anonimato',
    
    // Privacy banner
    'mvp.dashboard.privacy.title': 'Protección de Privacidad Activa',
    'mvp.dashboard.privacy.desc': 'Necesitamos al menos {min} respuestas antes de mostrar resultados para proteger el anonimato individual. Actualmente tenemos {current} respuestas.',
    
    // Comments
    'mvp.dashboard.comments.title': 'Comentarios Anónimos',
    'mvp.dashboard.comments.visible': 'El feedback anónimo de tu equipo',
    'mvp.dashboard.comments.hidden': 'Los comentarios aparecerán cuando se alcance el umbral de privacidad',
    'mvp.dashboard.comments.anonymous': 'Respuesta anónima',
    'mvp.dashboard.comments.days.ago': 'días atrás',
    'mvp.dashboard.comments.threshold': 'Los comentarios aparecerán cuando se recojan {min} respuestas',
    'mvp.dashboard.comments.protection': 'Esto protege el anonimato individual',
    
    // Share section
    'mvp.dashboard.share.title': 'Compartir y Recolectar Respuestas',
    'mvp.dashboard.share.subtitle': 'Obtén el feedback de tu equipo con este enlace de encuesta',
    'mvp.dashboard.share.link.label': 'Enlace de Encuesta',
    'mvp.dashboard.share.copy': 'Copiar',
    'mvp.dashboard.share.whatsapp': 'Compartir por WhatsApp',
    'mvp.dashboard.share.whatsapp.message': 'Hola 👋 Encuesta de 60s (anónima). Responde aquí: {LINK}\n\nResultados solo si ≥5 personas responden.',
    'mvp.dashboard.share.email.subject': 'Encuesta Anónima del Equipo - Tu Opinión Importa',
    'mvp.dashboard.share.email.body': '¡Hola!\n\nMe gustaría invitarte a participar en una encuesta rápida y anónima sobre nuestro equipo. Solo toma 60 segundos y tus respuestas son completamente confidenciales.\n\nPor favor haz clic en el enlace de abajo para participar:\n{LINK}\n\nLos resultados solo se mostrarán cuando tengamos suficientes respuestas para garantizar el anonimato.\n\n¡Gracias por tu tiempo!',
    'mvp.dashboard.share.email': 'Compartir por Email',
    'mvp.dashboard.share.sms': 'Compartir por SMS',
    'mvp.dashboard.share.sms.message': '¡Hola! Encuesta anónima del equipo (60s). Tu opinión importa: {LINK}\n\nResultados solo cuando suficientes personas respondan.',
    
    // Question Breakdown
    'mvp.dashboard.questions.title': 'Desglose de Preguntas',
    'mvp.dashboard.questions.mood': 'Estado de Ánimo',
    'mvp.dashboard.questions.manager': 'Apoyo del Manager',
    'mvp.dashboard.questions.workload': 'Carga de Trabajo',
    'mvp.dashboard.questions.recognition': 'Reconocimiento',
    'mvp.dashboard.questions.locked': 'Bloqueado — necesitas {count} más',
    'mvp.dashboard.questions.responses': 'n={count}',
    
    // Manual Reminder Section
    'mvp.dashboard.reminder.title': 'Enviar Recordatorios',
    'mvp.dashboard.reminder.subtitle': 'Envía recordatorios de seguimiento para aumentar las tasas de respuesta',
    'mvp.dashboard.reminder.email.button': 'Recordatorio por Email',
    'mvp.dashboard.reminder.email.subject': 'Recordatorio: Encuesta del Equipo - Tu Opinión Aún es Necesaria',
    'mvp.dashboard.reminder.email.body': '¡Hola!\n\nSolo un recordatorio amigable sobre la encuesta del equipo que compartimos anteriormente. Tu opinión es importante y solo toma 60 segundos.\n\nPor favor tómate un momento para compartir tus pensamientos:\n{LINK}\n\nLos resultados solo se mostrarán cuando tengamos suficientes respuestas para garantizar el anonimato.\n\n¡Gracias por tu tiempo!',
    'mvp.dashboard.reminder.sms.button': 'Recordatorio por SMS',
    'mvp.dashboard.reminder.sms.message': 'Recordatorio: Encuesta rápida del equipo (60s). Tu opinión importa: {LINK}\n\nResultados solo cuando suficientes personas respondan.',
    'mvp.dashboard.reminder.whatsapp.button': 'Recordatorio por WhatsApp',
    'mvp.dashboard.reminder.whatsapp.message': '¡Hola! 👋 Solo un recordatorio amigable sobre la encuesta del equipo. Tu opinión importa: {LINK}\n\nResultados solo cuando suficientes personas respondan.',
    
    // MVP Survey Questions
    'mvp.survey.mood.question': '¿Cómo te sientes en el trabajo esta semana?',
    'mvp.survey.manager.question': '¿Te sientes apoyado/a y con confianza por tu responsable?',
    'mvp.survey.workload.question': '¿Tu carga de trabajo es manejable?',
    'mvp.survey.recognition.question': '¿Te sientes reconocido/a por tu trabajo?',
    
    // Improvement Questions
    'mvp.survey.improvement.w1.question': '¿Qué podríamos cambiar la próxima semana para mejorar tu experiencia?',
    'mvp.survey.balanced.w2.question': '¿Qué te ayudó o perjudicó esta semana?',
    'mvp.survey.keepchange.w4.question': '¿Qué deberíamos mantener o cambiar?',
    
    // Survey UI Elements
    'mvp.survey.title': 'Encuesta de Pulso del Equipo',
    'mvp.survey.subtitle': 'Elige tu idioma y comienza la encuesta',
    'mvp.survey.rating.instruction': 'Califica tu respuesta en una escala del 0 al 10',
    'mvp.survey.text.instruction': 'Comparte tus pensamientos (opcional, máximo 800 caracteres)',
    'mvp.survey.scale.poor': 'Muy Malo',
    'mvp.survey.scale.excellent': 'Excelente',
    'mvp.survey.button.back': 'Atrás',
    'mvp.survey.button.next': 'Siguiente',
    'mvp.survey.button.submit': 'Enviar Encuesta',
    'mvp.survey.button.start': 'Comenzar Encuesta',
    'mvp.survey.progress': 'Pregunta {current} de {total}',
    'mvp.survey.anonymous': 'Tus respuestas son completamente anónimas',
    'mvp.survey.thankyou.title': '¡Gracias!',
    'mvp.survey.thankyou.message': 'Tu opinión ha sido enviada de forma anónima. Los resultados se compartirán cuando suficientes miembros del equipo respondan.',
    'mvp.dashboard.share.invite': 'Invitar Miembros del Equipo',
    'mvp.dashboard.share.status': 'Estado:',
    'mvp.dashboard.share.status.active': 'Activo • Resultados visibles',
    'mvp.dashboard.share.status.collecting': 'Recolectando respuestas • {current}/{min}',
    
    // Demo notice
    'mvp.dashboard.demo.title': 'Modo Demo Activo',
    'mvp.dashboard.demo.desc': 'Este es un dashboard de ejemplo que muestra cómo se verán tus resultados. En la versión real, verás el feedback anónimo real de tu equipo.',
    
    // Navigation
    'mvp.nav.demo': 'Dashboard Demo',
    'mvp.nav.start.pilot': 'Comenzar Piloto',
    'mvp.nav.demo.mode': 'Modo Demo',
    'mvp.nav.back.landing': 'Volver al Inicio',
    'mvp.nav.logout': 'Cerrar Sesión',
    
    // Sign In Page
    'mvp.signin.title': 'Bienvenido a tu Dashboard MVP',
    'mvp.signin.subtitle': 'Inicia sesión para acceder a los resultados del pulso de tu equipo',
    'mvp.signin.form.title': 'Iniciar Sesión',
    'mvp.signin.form.subtitle': 'Accede al feedback anónimo de tu equipo',
    'mvp.signin.email.label': 'Dirección de Email',
    'mvp.signin.email.placeholder': 'Ingresa tu email',
    'mvp.signin.password.label': 'Contraseña',
    'mvp.signin.password.placeholder': 'Ingresa tu contraseña',
    'mvp.signin.button.signing': 'Iniciando sesión...',
    'mvp.signin.button.text': 'Iniciar Sesión',
    'mvp.signin.demo.title': 'Acceso Demo',
    'mvp.signin.demo.description': 'Para pruebas del piloto MVP, puedes usar cualquier combinación de email/contraseña',
    'mvp.signin.demo.email': 'Email:',
    'mvp.signin.demo.password': 'Contraseña:',
    'mvp.signin.back.link': '← Volver al Landing MVP',
    'mvp.signin.no.access': '¿No tienes acceso?',
    'mvp.signin.create.account': 'Crear cuenta',
    'mvp.signin.benefits.anonymous': '100% Anónimo',
    'mvp.signin.benefits.insights': 'Insights en Tiempo Real',
    'mvp.signin.benefits.actionable': 'Datos Accionables',
    'mvp.signin.success.message': '¡Bienvenido a Novora MVP!',
    'mvp.signin.error.credentials': 'Por favor ingresa tanto el email como la contraseña',
    'mvp.signin.error.failed': 'Error al iniciar sesión. Por favor intenta de nuevo.',
    
    // Sign Up Page
    'mvp.signup.title': 'Únete al Piloto MVP',
    'mvp.signup.subtitle': 'Crea tu cuenta y comienza a recopilar feedback del equipo',
    'mvp.signup.form.title': 'Crear Cuenta',
    'mvp.signup.form.subtitle': 'Comienza con encuestas de pulso de equipo anónimas',
    'mvp.signup.firstname.label': 'Nombre',
    'mvp.signup.firstname.placeholder': 'Nombre',
    'mvp.signup.lastname.label': 'Apellido',
    'mvp.signup.lastname.placeholder': 'Apellido',
    'mvp.signup.company.label': 'Nombre de la Empresa',
    'mvp.signup.company.placeholder': 'Nombre de tu empresa',
    'mvp.signup.email.label': 'Dirección de Email',
    'mvp.signup.email.placeholder': 'Ingresa tu email',
    'mvp.signup.password.label': 'Contraseña',
    'mvp.signup.password.placeholder': 'Crear contraseña',
    'mvp.signup.confirmpassword.label': 'Confirmar Contraseña',
    'mvp.signup.confirmpassword.placeholder': 'Confirmar contraseña',
    'mvp.signup.button.creating': 'Creando cuenta...',
    'mvp.signup.button.text': 'Crear Cuenta MVP',
    'mvp.signup.benefits.title': 'Lo que obtienes con MVP:',
    'mvp.signup.benefits.anonymous': 'Encuestas de equipo 100% anónimas',
    'mvp.signup.benefits.insights': 'Insights de pulso en tiempo real',
    'mvp.signup.benefits.privacy': 'Protección de privacidad Min-N guard',
    'mvp.signup.already.have': '¿Ya tienes una cuenta?',
    'mvp.signup.signin.link': 'Inicia sesión aquí',
    'mvp.signup.back.link': '← Volver al Landing MVP',
    'mvp.signup.success.message': '¡Cuenta creada exitosamente! ¡Bienvenido a Novora MVP!',
    'mvp.signup.error.passwords': 'Las contraseñas no coinciden',
    'mvp.signup.error.required': 'Por favor completa todos los campos requeridos',
    'mvp.signup.error.failed': 'Error al registrarse. Por favor intenta de nuevo.',
    
    // Common
    'mvp.brand': 'Novora',
    'mvp.badge': 'MVP Piloto',
  },
  
  is: {
    // MVP Landing Page
    'mvp.pilot.badge': 'MVP Prófun - Vertu Partur af Framtíðinni fyrir Hópviðbrögð',
    'mvp.hero.title.line1': 'Vitaðu hvernig hópurinn þinn',
    'mvp.hero.title.line2': 'lýtur raunverulega',
    'mvp.hero.title.line3': '—nafnlaust',
    'mvp.hero.subtitle': '60 sekúndna mánaðarlegur púls. Einkamál, heiðarlegur, aðgerðarhæfur.',
    'mvp.hero.subtitle.bold1': 'Umbreyttu hópmenningu þinni',
    'mvp.hero.subtitle.bold2': 'nafnlaus viðbrögð',
    'mvp.hero.benefit1': '5 mínútur uppsetning',
    'mvp.hero.benefit2': '100% nafnlaust',
    'mvp.hero.benefit3': 'Aðgerðarhæf innsýn',
    'mvp.hero.cta.primary': 'Byrjaðu Ókeypis Prófun',
    'mvp.hero.cta.secondary': 'Skoðaðu Sýnishornið af Mælaborði',
    
    // How it works
    'mvp.how.title': 'Hvernig það virkar',
    'mvp.how.subtitle': 'Einföld, nafnlaus og áhrifamikil hópprófun á púls',
    'mvp.how.step1.title': 'Lanseraðu mánaðarlegan púls',
    'mvp.how.step1.desc': 'Búðu til og sendu hópprófunina þína á mínútum',
    'mvp.how.step2.title': 'Hópurinn svarar nafnlaust',
    'mvp.how.step2.desc': '0-10 einkunn + valfrjáls athugasemd, algjörlega einkamál',
    'mvp.how.step3.title': 'Fáðu innsýn og gerðu',
    'mvp.how.step3.desc': 'Sjáðu þróun + athugasemdir, lagaðu vandamál snemma',
    
    // Trust section
    'mvp.trust.title': 'Við getum ekki séð hver svaraði',
    'mvp.trust.subtitle': 'Persónuvernd hópsins þíns er vernduð með Min-N guard tækni',
    'mvp.trust.feature': 'Engin niðurstöður sýndar fyrr en ≥5 svör',
    'mvp.trust.link': 'Lestu persónuverndarspjall →',
    
    // Value props
    'mvp.value.title': 'Af hverju hópar velja Novora',
    'mvp.value.subtitle': 'Byggt fyrir nútímahópa sem meta gagnsæi og vöxt',
    'mvp.value.fast.title': 'Léttur sem fjöður',
    'mvp.value.fast.desc': 'Uppsetning á 5 mínútum, svör í rauntíma',
    'mvp.value.insights.title': 'Aðgerðarhæf innsýn',
    'mvp.value.insights.desc': 'Skýr þróun og athugasemdir til að taka ákvarðanir',
    'mvp.value.trends.title': 'Þróun, ekki hávaði',
    'mvp.value.trends.desc': 'Sjáðu mynstur með tímanum, ekki bara einstök svör',
    'mvp.value.fix.title': 'Lagaðu vandamál snemma',
    'mvp.value.fix.desc': 'Auðkenndu og taktu á vandamálum áður en þau aukast',
    
    // Social proof
    'mvp.social.text': 'Prófað með hópum sem setja fólkið fyrst á Spáni',
    'mvp.social.subtext': 'Vertu partur af vaxandi samfélagi hópa sem nota Novora',
    
    // FAQ
    'mvp.faq.title': 'Algengar Spurningar',
    'mvp.faq.subtitle': 'Allt sem þú þarft að vita um MVP prófunina okkar',
    'mvp.faq.q1': 'Er það raunverulega nafnlaust?',
    'mvp.faq.a1': 'Já. Við notum Min-N guard tækni til að tryggja að engin einstök svör geti verið auðkennd. Niðurstöður birtast bara þegar nóg fólk hefur svarað.',
    'mvp.faq.q2': 'Hversu lengi tekur uppsetningin?',
    'mvp.faq.a2': 'Undir 5 mínútum. Búðu til prófunina þína, fáðu tengilinn og deildu honum með hópnum þínum. Það er allt.',
    'mvp.faq.q3': 'Get ég útflutt niðurstöður?',
    'mvp.faq.a3': 'Fyrir MVP prófunina eru niðurstöður sýnilegar á mælaborðinu. Útflutningsaðgerðir verða bættar við byggt á viðbrögðum notenda.',
    
    // CTA
    'mvp.cta.title': 'Tilbúinn til að vita hvernig hópurinn þinn lýtur raunverulega?',
    'mvp.cta.subtitle': 'Vertu partur af prófuninni og byrjaðu á mínútum',
    'mvp.cta.button': 'Byrjaðu ókeypis prófun núna',
    
    // MVP Dashboard
    'mvp.dashboard.title': 'Mælaborð fyrir Hóppúls',
    'mvp.dashboard.subtitle': 'Fylgstu með nafnlausum viðbrögðum og þátttöku hópsins þíns',
    'mvp.dashboard.kpi.responses': 'Heildarfjöldi Svara',
    'mvp.dashboard.kpi.score': 'Meðaleinkunn',
    'mvp.dashboard.kpi.rate': 'Svörhlutfall',
    'mvp.dashboard.kpi.status': 'Staða',
    'mvp.dashboard.kpi.results.visible': 'Niðurstöður sýnilegar',
    'mvp.dashboard.kpi.more.needed': 'fleiri þarf',
    'mvp.dashboard.kpi.from.last.month': 'frá síðasta mánuði',
    'mvp.dashboard.kpi.of.team': 'af 10 hópmeðlimum',
    'mvp.dashboard.kpi.team.members': 'hópmeðlimir',
    'mvp.dashboard.kpi.active': 'Virkur',
    'mvp.dashboard.kpi.collecting': 'Safna',
    'mvp.dashboard.kpi.building.anonymity': 'Byggja nafnleysi',
    
    // Privacy banner
    'mvp.dashboard.privacy.title': 'Persónuvernd Virk',
    'mvp.dashboard.privacy.desc': 'Við þurfum að minnsta kosti {min} svör áður en við sýnum niðurstöður til að vernda einstakt nafnleysi. Við höfum nú {current} svör.',
    
    // Comments
    'mvp.dashboard.comments.title': 'Nafnlausar Athugasemdir',
    'mvp.dashboard.comments.visible': 'Nafnlaus viðbrögð hópsins þíns',
    'mvp.dashboard.comments.hidden': 'Athugasemdir munu birtast þegar persónuverndarþröskuldur er náður',
    'mvp.dashboard.comments.anonymous': 'Nafnlaus svör',
    'mvp.dashboard.comments.days.ago': 'dögum síðan',
    'mvp.dashboard.comments.threshold': 'Athugasemdir munu birtast þegar {min} svör eru safnuð',
    'mvp.dashboard.comments.protection': 'Þetta verndar einstakt nafnleysi',
    
    // Share section
    'mvp.dashboard.share.title': 'Deila og Safna Svörum',
    'mvp.dashboard.share.subtitle': 'Fáðu viðbrögð hópsins þíns með þessum prófunartengli',
    'mvp.dashboard.share.link.label': 'Prófunartengill',
    'mvp.dashboard.share.copy': 'Afrita',
    'mvp.dashboard.share.whatsapp': 'Deila með WhatsApp',
    'mvp.dashboard.share.whatsapp.message': 'Halló 👋 60 sekúndna könnun (nafnlaus). Svaraðu hér: {LINK}\n\nNiðurstöður birtast bara ef ≥5 manns svara.',
    'mvp.dashboard.share.email.subject': 'Nafnlaus Hópakönnun - Þín Ábending Skiptir Máli',
    'mvp.dashboard.share.email.body': 'Halló!\n\nÉg vil bjóða þér að taka þátt í fljótlegri nafnlausri könnun um hópinn okkar. Það tekur aðeins 60 sekúndur og svörin þín eru algjörlega trúnaðarmál.\n\nVinsamlegast smelltu á hlekkinn hér að neðan til að taka þátt:\n{LINK}\n\nNiðurstöðurnar verða aðeins sýndar þegar við höfum nógu mörg svör til að tryggja nafnleynd.\n\nTakk fyrir tímann þinn!',
    'mvp.dashboard.share.email': 'Deila með Tölvupósti',
    'mvp.dashboard.share.sms': 'Deila með SMS',
    'mvp.dashboard.share.sms.message': 'Halló! Fljótleg nafnlaus hópakönnun (60s). Þín ábending skiptir máli: {LINK}\n\nNiðurstöður birtast bara þegar nógu margir svara.',
    
    // Question Breakdown
    'mvp.dashboard.questions.title': 'Spurningaútdrættir',
    'mvp.dashboard.questions.mood': 'Hugan',
    'mvp.dashboard.questions.manager': 'Stuðningur Leiðbeinanda',
    'mvp.dashboard.questions.workload': 'Vinnuálag',
    'mvp.dashboard.questions.recognition': 'Viðurkenning',
    'mvp.dashboard.questions.locked': 'Læst — þarf {count} fleiri',
    'mvp.dashboard.questions.responses': 'n={count}',
    
    // Manual Reminder Section
    'mvp.dashboard.reminder.title': 'Senda Áminningar',
    'mvp.dashboard.reminder.subtitle': 'Sendu áminningar til að auka svörun',
    'mvp.dashboard.reminder.email.button': 'Áminning með Tölvupósti',
    'mvp.dashboard.reminder.email.subject': 'Áminning: Hópakönnun - Þín Ábending er Enn Nauðsynleg',
    'mvp.dashboard.reminder.email.body': 'Halló!\n\nBara vingjarnleg áminning um hópakönnunina sem við deildum áður. Þín ábending er mikilvæg og tekur aðeins 60 sekúndur.\n\nVinsamlegast taktu þér stund til að deila þínum hugsunum:\n{LINK}\n\nNiðurstöðurnar verða aðeins sýndar þegar við höfum nógu mörg svör til að tryggja nafnleynd.\n\nTakk fyrir tímann þinn!',
    'mvp.dashboard.reminder.sms.button': 'Áminning með SMS',
    'mvp.dashboard.reminder.sms.message': 'Áminning: Fljótleg hópakönnun (60s). Þín ábending skiptir máli: {LINK}\n\nNiðurstöður bara þegar nógu margir svara.',
    'mvp.dashboard.reminder.whatsapp.button': 'Áminning með WhatsApp',
    'mvp.dashboard.reminder.whatsapp.message': 'Halló! 👋 Bara vingjarnleg áminning um hópakönnunina. Þín ábending skiptir máli: {LINK}\n\nNiðurstöður bara þegar nógu margir svara.',
    
    // MVP Survey Questions
    'mvp.survey.mood.question': 'Hvernig líður þér á vinnustaðnum í vikunni?',
    'mvp.survey.manager.question': 'Finnst þér að þú fáir stuðning og traust frá yfirmanninum þínum?',
    'mvp.survey.workload.question': 'Er vinnuálagið þitt viðráðanlegt?',
    'mvp.survey.recognition.question': 'Finnst þér að þú sért metinn fyrir vinnuna þína?',
    
    // Improvement Questions
    'mvp.survey.improvement.w1.question': 'Hvað gætum við breytt næstu viku til að bæta reynsluna þína?',
    'mvp.survey.balanced.w2.question': 'Hvað hjálpaði eða skaðaði þig í vikunni?',
    'mvp.survey.keepchange.w4.question': 'Hvað ættum við að halda áfram að gera eða breyta?',
    
    // Survey UI Elements
    'mvp.survey.title': 'Hópakönnun',
    'mvp.survey.subtitle': 'Veldu tungumál og byrjaðu könnunina',
    'mvp.survey.rating.instruction': 'Gefðu einkunn frá 0 til 10',
    'mvp.survey.text.instruction': 'Deildu hugsunum þínum (valfrjálst, hámark 800 stafir)',
    'mvp.survey.scale.poor': 'Mjög Slæmt',
    'mvp.survey.scale.excellent': 'Frábært',
    'mvp.survey.button.back': 'Til Baka',
    'mvp.survey.button.next': 'Áfram',
    'mvp.survey.button.submit': 'Klára könnun',
    'mvp.survey.button.start': 'Byrja könnun',
    'mvp.survey.progress': 'Spurning {current} af {total}',
    'mvp.survey.anonymous': 'Svörin þín eru algjörlega nafnlaus',
    'mvp.survey.thankyou.title': 'Takk!',
    'mvp.survey.thankyou.message': 'Þín ábending hefur verið send nafnlaust. Niðurstöðurnar verða deildar þegar nógu margir hópmeðlimir svara.',
    'mvp.dashboard.share.invite': 'Bjóða Hópmeðlimi',
    'mvp.dashboard.share.status': 'Staða:',
    'mvp.dashboard.share.status.active': 'Virkur • Niðurstöður sýnilegar',
    'mvp.dashboard.share.status.collecting': 'Safna svörum • {current}/{min}',
    
    // Demo notice
    'mvp.dashboard.demo.title': 'Prófunarhamur Virkur',
    'mvp.dashboard.demo.desc': 'Þetta er sýnishornið af mælaborði sem sýnir hvernig niðurstöðurnar þínar munu líta út. Í raunútgáfunni munt þú sjá raunveruleg nafnlaus viðbrögð hópsins þíns.',
    
    // Navigation
    'mvp.nav.demo': 'Prófunarmælaborð',
    'mvp.nav.start.pilot': 'Byrjaðu Prófun',
    'mvp.nav.demo.mode': 'Prófunarhamur',
    'mvp.nav.back.landing': 'Aftur á Forsíðu',
    'mvp.nav.logout': 'Útskrá',
    
    // Sign In Page
    'mvp.signin.title': 'Velkomin í MVP Mælaborðið þitt',
    'mvp.signin.subtitle': 'Skráðu þig inn til að fá aðgang að niðurstöðum hóppulsins þíns',
    'mvp.signin.form.title': 'Skrá Inn',
    'mvp.signin.form.subtitle': 'Fáðu aðgang að nafnlausum viðbrögðum hópsins þíns',
    'mvp.signin.email.label': 'Netfang',
    'mvp.signin.email.placeholder': 'Sláðu inn netfangið þitt',
    'mvp.signin.password.label': 'Lykilorð',
    'mvp.signin.password.placeholder': 'Sláðu inn lykilorðið þitt',
    'mvp.signin.button.signing': 'Skrái inn...',
    'mvp.signin.button.text': 'Skrá Inn',
    'mvp.signin.demo.title': 'Prófunaraðgangur',
    'mvp.signin.demo.description': 'Fyrir MVP prófun geturðu notað hvaða netfang/lykilorð samsetningu sem er',
    'mvp.signin.demo.email': 'Netfang:',
    'mvp.signin.demo.password': 'Lykilorð:',
    'mvp.signin.back.link': '← Til baka á MVP Forsíðu',
    'mvp.signin.no.access': 'Áttu ekki aðgang?',
    'mvp.signin.create.account': 'Búa til reikning',
    'mvp.signin.benefits.anonymous': '100% Nafnlaus',
    'mvp.signin.benefits.insights': 'Rauntíma Upplýsingar',
    'mvp.signin.benefits.actionable': 'Aðgerðarhæf Gögn',
    'mvp.signin.success.message': 'Velkomin í Novora MVP!',
    'mvp.signin.error.credentials': 'Vinsamlegast sláðu inn bæði netfang og lykilorð',
    'mvp.signin.error.failed': 'Innskráning mistókst. Vinsamlegast reyndu aftur.',
    
    // Sign Up Page
    'mvp.signup.title': 'Vertu Partur af MVP Prófuninni',
    'mvp.signup.subtitle': 'Búðu til reikninginn þinn og byrjaðu að safna viðbrögðum hópsins',
    'mvp.signup.form.title': 'Búa til Reikning',
    'mvp.signup.form.subtitle': 'Byrjaðu með nafnlausum hóppuls könnunum',
    'mvp.signup.firstname.label': 'Fornafn',
    'mvp.signup.firstname.placeholder': 'Fornafn',
    'mvp.signup.lastname.label': 'Eftirnafn',
    'mvp.signup.lastname.placeholder': 'Eftirnafn',
    'mvp.signup.company.label': 'Nafn Fyrirtækis',
    'mvp.signup.company.placeholder': 'Nafn fyrirtækis þíns',
    'mvp.signup.email.label': 'Netfang',
    'mvp.signup.email.placeholder': 'Sláðu inn netfangið þitt',
    'mvp.signup.password.label': 'Lykilorð',
    'mvp.signup.password.placeholder': 'Búa til lykilorð',
    'mvp.signup.confirmpassword.label': 'Staðfesta Lykilorð',
    'mvp.signup.confirmpassword.placeholder': 'Staðfesta lykilorð',
    'mvp.signup.button.creating': 'Býr til reikning...',
    'mvp.signup.button.text': 'Búa til MVP Reikning',
    'mvp.signup.benefits.title': 'Það sem þú færð með MVP:',
    'mvp.signup.benefits.anonymous': '100% nafnlausar hóp könnanir',
    'mvp.signup.benefits.insights': 'Rauntíma hóppuls upplýsingar',
    'mvp.signup.benefits.privacy': 'Min-N vörn fyrir nafnleysi',
    'mvp.signup.already.have': 'Áttu þegar reikning?',
    'mvp.signup.signin.link': 'Skráðu þig inn hér',
    'mvp.signup.back.link': '← Til baka á MVP Forsíðu',
    'mvp.signup.success.message': 'Reikningur búinn til! Velkomin í Novora MVP!',
    'mvp.signup.error.passwords': 'Lykilorðin passa ekki saman',
    'mvp.signup.error.required': 'Vinsamlegast fylltu út öll nauðsynleg reit',
    'mvp.signup.error.failed': 'Skráning mistókst. Vinsamlegast reyndu aftur.',
    
    // Common
    'mvp.brand': 'Novora',
    'mvp.badge': 'MVP Prófun',
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    const translation = translations[language][key as keyof typeof translations[typeof language]];
    return translation || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
