import { useState } from "react";
import { FaRegCircleCheck } from "react-icons/fa6";
import SwitchButton from "./SwitchButton";

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  const handleToggle = (isAnnual: boolean) => {
    setIsAnnual(isAnnual);
  };

  const pricingData = [
    {
      title: "Individuel",
      monthlyPrice: 25,
      description: "",
      features: [
        "Tunnel de vente personnalisé",
        "Propositions personnalisées",
        "Extranet client",
        "Support 24/7",
        "Emailing",
      ],
    },
    {
      title: "Pro",
      monthlyPrice: 45,
      description: "Pour les petites équipes.",
      features: [
        "Tunnel de vente personnalisé",
        "Recherche de prospects qualifiés",
        "Propositions personnalisées",
        "Notes de suivi client",
        "Rappel de tâches",
        "Extranet client",
        "Support 24/7",
        "API Propale",
        "Emailing",
      ],
    },
    {
      title: "Entreprise",
      monthlyPrice: 75,
      description: "Pour les grandes équipes",
      features: [
        "Tunnel de vente personnalisé multiple",
        "Recherche de prospects qualifiés",
        "Extranet client personnalisé",
        "Propositions personnalisées",
        "Signature électronique",
        "Notes de suivi client",
        "Rappel de tâches",
        "Support 24/7",
        "API Propale",
        "Emailing",
      ],      
    },
  ];

  return (
    <section className="bg-white py-16" id="pricing">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Heading and Subheading */}
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 text-center mx-auto w-full sm:w-3/4 lg:w-1/2">
          Des tarifs clairs, transparents et <span className="text-blueCustom">accessibles</span>.
        </h2>
        <p className="text-gray-600 mb-12 text-center mx-auto w-full sm:w-2/3 lg:w-1/2">
        Investissez dans un outil innovant qui fait grimper vos ventes.
        </p>

        {/* Toggle Button */}
        <div className="mb-12 flex justify-center items-center">
          <SwitchButton onChange={handleToggle} />
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 gap-8 px-6 md:px-12 lg:px-24 sm:grid-cols-2 lg:grid-cols-3">
          {pricingData.map((plan, index) => (
            <div key={index} className="bg-white border border-blueCustom rounded-2xl p-6 md:p-8">
              <h3 className="text-2xl md:text-3xl font-semibold text-blueCustom mb-4">{plan.title} <span className="text-black text-xl">(Sur devis)</span></h3>
              {/* <p className="text-3xl font-bold text-gray-900 text-left pl-4">
                {isAnnual
                  ? `${(plan.monthlyPrice * 12 * 0.9).toFixed(2)} €`
                  : `${plan.monthlyPrice.toFixed(2)} €`}
              </p>
              <p className="text-gray-400 mb-6 text-left pl-4">
                {isAnnual ? "par utilisateur / an" : "par utilisateur / mois"}
              </p> */}
              <button className="px-4 py-3 bg-blueCustom text-white rounded-md text-base font-medium hover:bg-blue-700 w-full">
                {"Démarrer l'essai"}
              </button>
              <p className="text-gray-600 mt-4 text-sm text-left pl-4 font-semibold">{plan.description}</p>
              <ul className="mt-4 space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="text-gray-600 text-sm text-left pl-4 flex items-center">
                    <FaRegCircleCheck className="mr-2" size={20} /> {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
