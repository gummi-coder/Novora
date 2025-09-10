import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const MVPFooter = () => {
  const { t, language } = useLanguage();

  // MVP-specific footer translations
  const footerText = {
    en: {
      tagline: "MVP Pilot - Building better workplaces through feedback",
      quickLinks: "Quick Links",
      home: "MVP Home",
      dashboard: "Demo Dashboard", 
      signIn: "Start Pilot",
      support: "Support",
      helpCenter: "Help Center",
      contactUs: "Contact Us",
      stayUpdated: "Stay Updated",
      newsletterText: "Get updates about our MVP pilot program",
      emailPlaceholder: "Your email",
      privacyNote: "We respect your privacy",
      copyright: "© 2025 Novora MVP Pilot",
      privacyPolicy: "Privacy",
      termsOfService: "Terms",
      cookies: "Cookies"
    },
    es: {
      tagline: "MVP Piloto - Construyendo mejores lugares de trabajo a través de feedback",
      quickLinks: "Enlaces Rápidos",
      home: "MVP Inicio",
      dashboard: "Demo Dashboard",
      signIn: "Iniciar Piloto",
      support: "Soporte",
      helpCenter: "Centro de Ayuda",
      contactUs: "Contáctanos",
      stayUpdated: "Mantente Actualizado",
      newsletterText: "Recibe actualizaciones sobre nuestro programa piloto MVP",
      emailPlaceholder: "Tu email",
      privacyNote: "Respetamos tu privacidad",
      copyright: "© 2025 Novora MVP Piloto",
      privacyPolicy: "Privacidad",
      termsOfService: "Términos",
      cookies: "Cookies"
    },
    is: {
      tagline: "MVP Píla - Að byggja betri vinnustaði með viðbrögðum",
      quickLinks: "Flýtileiðir",
      home: "MVP Heim",
      dashboard: "Demo Dashboard",
      signIn: "Byrja Píla",
      support: "Þjónusta",
      helpCenter: "Hjálparmiðstöð",
      contactUs: "Hafa samband",
      stayUpdated: "Vertu upplýstur",
      newsletterText: "Fáðu uppfærslur um MVP pílótaforritið okkar",
      emailPlaceholder: "Netfangið þitt",
      privacyNote: "Við virðum persónuvernd þína",
      copyright: "© 2025 Novora MVP Píla",
      privacyPolicy: "Persónuvernd",
      termsOfService: "Skilmálar",
      cookies: "Vafrakökur"
    }
  };

  const text = footerText[language] || footerText.en;

  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* MVP Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="text-2xl font-bold text-novora-400">Novora</div>
              <div className="px-2 py-1 bg-novora-600 text-white text-xs font-medium rounded-full">
                MVP
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              {text.tagline}
            </p>
          </div>
          
          {/* MVP Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              {text.quickLinks}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/mvp" className="text-slate-300 hover:text-novora-400 transition-colors text-sm">
                  {text.home}
                </Link>
              </li>
              <li>
                <Link to="/mvp-dashboard?demo=1" className="text-slate-300 hover:text-novora-400 transition-colors text-sm">
                  {text.dashboard}
                </Link>
              </li>
              <li>
                <Link to="/mvp-signin" className="text-slate-300 hover:text-novora-400 transition-colors text-sm">
                  {text.signIn}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* MVP Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              {text.support}
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-slate-300 hover:text-novora-400 transition-colors text-sm">
                  {text.helpCenter}
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-novora-400 transition-colors text-sm">
                  {text.contactUs}
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* MVP Newsletter */}
        <div className="mt-8 pt-8 border-t border-slate-800">
          <div className="max-w-md">
            <h3 className="text-lg font-semibold mb-3 text-white">
              {text.stayUpdated}
            </h3>
            <p className="text-slate-300 text-sm mb-4">
              {text.newsletterText}
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder={text.emailPlaceholder}
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm placeholder:text-slate-400 focus:outline-none focus:border-novora-500"
              />
              <button className="px-4 py-2 bg-novora-600 hover:bg-novora-700 text-white text-sm rounded transition-colors">
                →
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {text.privacyNote}
            </p>
          </div>
        </div>
        
        {/* MVP Bottom */}
        <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm">
            {text.copyright}
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
              {text.privacyPolicy}
            </a>
            <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
              {text.termsOfService}
            </a>
            <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
              {text.cookies}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default MVPFooter;
