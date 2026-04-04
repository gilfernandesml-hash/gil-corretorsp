import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Instagram, Facebook, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isLogoLoaded, setIsLogoLoaded] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    setEmail('');
  };

  return (
    <footer className="bg-[#0f172a] text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow overflow-hidden bg-[#d9ecff] ring-1 ring-white/10 p-1">
                {isLogoLoaded ? (
                  <img
                    src="/logo-gil-corretor-sp.png"
                    alt="Gil Corretor SP"
                    className="w-full h-full object-contain"
                    loading="lazy"
                    decoding="async"
                    onError={() => setIsLogoLoaded(false)}
                  />
                ) : (
                  <span className="text-white font-bold text-lg bg-gradient-to-br from-[#1a3a52] to-[#0d5a7a] w-full h-full flex items-center justify-center">
                    SP
                  </span>
                )}
              </div>
              <div className="leading-tight">
                <p className="font-extrabold">Gil Fernandes Imóveis</p>
                <p className="text-xs text-white/70">CRECI 129677-SP</p>
              </div>
            </div>
            <p className="text-sm text-white/70 mt-4 leading-relaxed">
              Sua imobiliária de confiança em São Paulo. Atendimento consultivo para compra, venda e locação nos melhores bairros.
            </p>

            <div className="flex items-center gap-3 mt-6">
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center transition-colors" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center transition-colors" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <p className="font-bold">Links Rápidos</p>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li><Link className="hover:text-white" to="/">Início</Link></li>
              <li><Link className="hover:text-white" to="/imoveis">Imóveis</Link></li>
              <li><Link className="hover:text-white" to="/bairros">Bairros</Link></li>
              <li><Link className="hover:text-white" to="/blog">Blog</Link></li>
              <li><Link className="hover:text-white" to="/contact">Contato</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-bold">Contato</p>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-white/60" />
                <span>Av. Paulista, 1000 – Bela Vista<br />São Paulo – SP</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-white/60" />
                <a className="hover:text-white" href="tel:5511971157373">(11) 97115-7373</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-white/60" />
                <a className="hover:text-white" href="mailto:gilfernandesml@gmail.com">gilfernandesml@gmail.com</a>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-bold">Newsletter</p>
            <p className="text-sm text-white/70 mt-4">
              Receba as melhores ofertas, lançamentos e notícias do mercado.
            </p>
            <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="Seu e-mail"
                className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 outline-none focus:ring-2 focus:ring-[#ff8c42]"
              />
              <Button type="submit" className="bg-[#ff8c42] hover:bg-[#ff8c42]/90 text-white">
                Inscrever
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60">
          <p>© {new Date().getFullYear()} Gil Fernandes Imóveis — Todos os direitos reservados.</p>
          <p>Desenvolvido para o mercado imobiliário em São Paulo.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
