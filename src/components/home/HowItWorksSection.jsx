import React from 'react';
import { Search, Handshake, FileSignature, CheckCircle2 } from 'lucide-react';

const STEPS = [
  {
    number: 1,
    icon: Search,
    title: 'Busque',
    description: 'Encontre o imóvel ideal com base no seu perfil e objetivos.'
  },
  {
    number: 2,
    icon: Handshake,
    title: 'Conheça',
    description: 'Agende visitas e compare opções com orientação especializada.'
  },
  {
    number: 3,
    icon: FileSignature,
    title: 'Negocie',
    description: 'Faça propostas com apoio na negociação e análise documental.'
  },
  {
    number: 4,
    icon: CheckCircle2,
    title: 'Finalize',
    description: 'Conclua a transação com segurança e suporte até a entrega.'
  }
];

const HowItWorksSection = () => {
  return (
    <section className="py-20 bg-[#0d5a7a] text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold">Como Funciona</h2>
          <p className="text-white/80 mt-3">
            Um processo simples, ágil e seguro para a sua conquista.
          </p>
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="hidden lg:block absolute left-0 right-0 top-10 h-px bg-white/25" />

          {STEPS.map(({ number, icon: Icon, title, description }) => (
            <div key={title} className="text-center relative">
              <div className="mx-auto w-16 h-16 rounded-full bg-white/10 flex items-center justify-center relative">
                <Icon className="w-7 h-7" />
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#ff8c42] text-white flex items-center justify-center text-sm font-extrabold shadow">
                  {number}
                </div>
              </div>
              <h3 className="mt-6 font-bold">{title}</h3>
              <p className="mt-2 text-sm text-white/80 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
