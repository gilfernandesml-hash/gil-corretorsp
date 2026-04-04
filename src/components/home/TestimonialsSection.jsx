import React from 'react';
import { Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Carlos Silva',
    role: 'Cliente',
    text: 'Atendimento impecável! A equipe entendeu exatamente o que eu buscava e encontrou a casa dos meus sonhos em tempo recorde.'
  },
  {
    name: 'Mariana Santos',
    role: 'Cliente',
    text: 'Transparência e segurança durante todo o processo. Senti total confiança na negociação do meu apartamento.'
  },
  {
    name: 'Roberta Almeida',
    role: 'Cliente',
    text: 'Excelente suporte do início ao contrato. Muito bem preparados. Recomendo a Gil Fernandes de olhos fechados.'
  }
];

const Stars = () => (
  <div className="flex items-center gap-1 text-[#ff8c42]">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} className="w-4 h-4 fill-current" />
    ))}
  </div>
);

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a3a52]">
            O que Nossos Clientes Dizem
          </h2>
          <p className="text-gray-500 mt-3">
            Histórias reais de quem realizou sonhos com a nossa equipe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6">
              <Stars />
              <p className="mt-4 text-gray-600 text-sm leading-relaxed">“{t.text}”</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1a3a52]/10 text-[#1a3a52] font-extrabold flex items-center justify-center">
                  {t.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-[#1a3a52] leading-tight">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
