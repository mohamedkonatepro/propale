import { useState } from "react";
import { FiPlus, FiMinus } from "react-icons/fi";

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const questionsAnswers = [
    {
      question: "Qu'est-ce que votre service propose ?",
      answer:
        "Notre service vous permet de gérer, prospecter et auditer vos clients de manière efficace, avec tous les outils nécessaires en un seul endroit.",
    },
    {
      question: "Quels sont les tarifs proposés ?",
      answer:
        "Nous proposons des tarifs adaptés à différentes tailles d'équipes, avec des options mensuelles et annuelles.",
    },
    {
      question: "Est-il possible d'essayer avant de s'engager ?",
      answer:
        "Oui, nous offrons une période d'essai gratuite pour que vous puissiez tester notre service avant de souscrire.",
    },
    {
      question: "Quelle est la durée de l'engagement ?",
      answer:
        "Il n'y a pas de durée minimale d'engagement. Vous pouvez annuler à tout moment.",
    },
    {
      question: "Quel type de support est disponible ?",
      answer:
        "Nous offrons un support 24/7 via chat et email pour répondre à toutes vos questions.",
    },
  ];

  const toggleAnswer = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="bg-gray-50 py-8">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Heading and Subheading */}
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 text-center mx-auto w-full sm:w-3/4 lg:w-1/2">
          Une <span className="text-blueCustom">question</span> ? <br />
          Nous avons la <span className="text-blueCustom">réponse</span>.
        </h2>
        <p className="text-gray-600 mb-12 text-center mx-auto w-full sm:w-2/3 lg:w-1/3">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididun.
        </p>

        {/* FAQ Section */}
        <div className="space-y-4 mx-auto w-full sm:w-3/4 lg:w-1/2">
          {questionsAnswers.map((item, index) => (
            <div
              key={index}
              className="bg-white border border-white rounded-lg p-4 text-left shadow-sm transition-all duration-300"
            >
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleAnswer(index)}
              >
                <h3 className="text-lg font-medium text-gray-900">
                  {item.question}
                </h3>
                <span className="text-blueCustom">
                  {activeIndex === index ? <FiMinus size={24} /> : <FiPlus size={24} />}
                </span>
              </div>
              {activeIndex === index && (
                <p className="mt-4 text-gray-600">{item.answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
