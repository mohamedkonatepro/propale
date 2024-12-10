import { VscSend } from "react-icons/vsc";
import { useForm } from "react-hook-form";

export default function ContactSection() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data: any) => {
    console.log(data);
    // Envoyer les données à un serveur ou les traiter ici
  };

  return (
    <section className="bg-white py-8" id="contact">
      <div className="mx-auto px-4 sm:px-6 lg:px-20">
        <div className="lg:flex lg:items-center lg:justify-between">
          {/* Partie gauche : Texte */}
          <div className="lg:w-1/2 mb-12 lg:mb-0">
            <h2 className="text-2xl lg:text-4xl font-medium text-gray-900 mb-4">
              Comment pouvons-nous vous <span className="text-blueCustom">aider</span> ?
            </h2>
            <p className="text-gray-600">
              {"Contactez nos équipes de vente et d'assistance pour des démonstrations, une assistance à l'intégration ou des questions sur le produit."}
            </p>
          </div>

          {/* Partie droite : Formulaire */}
          <div className="lg:w-1/2 p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Nom et Prénom */}
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-labelGray mb-2">Nom</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-backgroundGray text-labelGray rounded-md placeholder-labelGray"
                    placeholder="Votre nom"
                    {...register("nom", { required: true })}
                  />
                  {errors.nom && <p className="text-red-500 text-xs">Nom requis</p>}
                </div>
                <div className="w-1/2">
                  <label className="block text-labelGray mb-2">Prénom</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-backgroundGray text-labelGray rounded-md placeholder-labelGray"
                    placeholder="Votre prénom"
                    {...register("prenom", { required: true })}
                  />
                  {errors.prenom && <p className="text-red-500 text-xs">Prénom requis</p>}
                </div>
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-labelGray mb-2">Numéro de téléphone</label>
                <input
                  type="text"
                  className="w-full p-3 bg-backgroundGray text-labelGray rounded-md placeholder-labelGray"
                  placeholder="Votre numéro de téléphone"
                  {...register("telephone", { required: true })}
                />
                {errors.telephone && <p className="text-red-500 text-xs">Numéro de téléphone requis</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-labelGray mb-2">Email</label>
                <input
                  type="email"
                  className="w-full p-3 bg-backgroundGray text-labelGray rounded-md placeholder-labelGray"
                  placeholder="Votre email"
                  {...register("email", { required: true })}
                />
                {errors.email && <p className="text-red-500 text-xs">Email requis</p>}
              </div>

              {/* Message */}
              <div>
                <label className="block text-labelGray mb-2">Message</label>
                <textarea
                  className="w-full p-3 bg-backgroundGray text-labelGray rounded-md placeholder-labelGray"
                  placeholder="Votre message"
                  rows={4}
                  {...register("message", { required: true })}
                ></textarea>
                {errors.message && <p className="text-red-500 text-xs">Message requis</p>}
              </div>

              {/* Bouton Envoyer */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  className="flex items-center justify-center bg-blueCustom text-white py-3 px-4 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Envoyer <VscSend className="ml-2" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
