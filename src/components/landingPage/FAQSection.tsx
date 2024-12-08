import { useState } from "react";
import { FiPlus, FiMinus } from "react-icons/fi";

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const questionsAnswers = [
    {
      question: "Est-ce que Propale peut être personnalisé pour répondre aux besoins spécifiques de votre offre de service ?",
      answer:
        "L’objectif principal est de fournir un tunnel de vente qui expose et personnalise les interactions pour une expérience client améliorée. Nos consultants analysent en profondeur vos propositions commerciales et proposent des questions de qualification hautement personnalisées à votre offre. Ils travaillent en étroite collaboration avec votre équipe pour cartographier le parcours idéal pour s’assurer que vos propositions commerciales sont alignées avec les attentes de vos prospects.",
    },
    {
      question: "Qui sont les utilisateurs de Propale ?",
      answer:
        "En intégrant les perspectives des prospects dans le processus, nous créons un dialogue plus riche pour une compréhension approfondie de leurs besoins. La collaboration active des prospects et des commerciaux est optimisée par l’algorithme Propale qui orchestre intelligemment le processus par une communication fluide. Cette approche collaborative permet également d’inclure les experts produits, les techniciens et les managers pour apporter des informations cruciales sur leurs besoins et étudier des perspectives complémentaires. ",
    },
    {
      question: "Y a-t-il un accompagnement à la mise en place d’un parcours de vente personnalisé ?",
      answer:
        "Notre équipe vous accompagne dans la création d’un tunnel de vente à la progression facile en veillant à ce que chaque question soit stratégiquement placée dans le parcours. Propale offre un environnement commercial avec des processus dynamiques et adaptatifs simples à faire évoluer à chaque étape du parcours client. Nous garantissons la bonne conception d’un parcours qui inspire confiance aux prospects, améliore vos taux de conversion tout en jetant les bases de la relation client. ",
    },
    {
      question: "La génération de la proposition commerciale est-elle automatisée ?",
      answer:
        "Propale révolutionne le processus de vente en offrant une solution efficace et rapide qui permet la génération de propositions en quelques clics. La solution s'intègre harmonieusement dans l'écosystème technologique existant des entreprises, tel que (site web, outils analytiques, ERP, logiciel comptable, … ). Le logiciel SaaS offre une flexibilité remarquable qui permet l’ajustement automatique des contenus, ce qui accélérera votre cycle de vente par la réaction rapide à chaque demande des clients.",
    },
    {
      question: "La solution Propale propose-t-elle un extranet client ?",
      answer:
        "Propale propose un extranet client à l’interface intuitive avec des fonctionnalités avancées assurant une expérience utilisateur de haute qualité. Les prospects peuvent s'inscrire de manière autonome directement depuis votre site web ou vos réseaux sociaux. Lors de l'inscription, les utilisateurs remplissent un profil détaillé, permettant une première compréhension de leurs besoins et attentes. Une fois inscrits, les utilisateurs obtiennent immédiatement accès à leur espace personnel sécurisé, où ils peuvent commencer à interagir avec la plateforme.",
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
          Nos experts en parcours commerciaux vous accompagnent à identifier le parcours sur-mesure et répondent à vos questions :
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
