import React, { useState } from "react";
import { VscSend } from "react-icons/vsc";
import { useForm } from "react-hook-form";

type ContactFormData = {
  lastname: string;
  firstname: string;
  phone: string;
  email: string;
  message: string;
};

export default function ContactSection() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormData>();
  const [isSending, setIsSending] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const sendEmail = async (data: ContactFormData) => {
    try {
      setIsSending(true);
      setApiError(null);

      const formattedMessage = data.message.replace(/\n/g, "<br />");

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/sendEmail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: [{email: process.env.NEXT_PUBLIC_BREVO_TO_EMAIL ?? "no-reply@propale.co"}],
          subject: "Message depuis votre site Propale",
          html: `
            <h2>Nouvelle demande de contact</h2>
            <p><strong>Nom :</strong> ${data.lastname} ${data.firstname}</p>
            <p><strong>Téléphone :</strong> ${data.phone}</p>
            <p><strong>Email :</strong> ${data.email}</p>
            <p><strong>Message :</strong><br>${formattedMessage}</p>
          `,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur serveur: ${response.statusText}`);
      }

      alert("Message envoyé avec succès !");
      reset(); // Clear the form
    } catch (error: any) {
      console.error("Erreur lors de l'envoi :", error);
      setApiError(error.message || "Une erreur est survenue lors de l'envoi. Veuillez réessayer.");
    } finally {
      setIsSending(false);
    }
  };

  const onSubmit = (data: ContactFormData) => {
    sendEmail(data);
  };

  return (
    <section className="bg-[#FBFDFE] py-8" id="contact">
      <div className="mx-auto px-4 sm:px-6 lg:px-20">
        <div className="lg:flex lg:items-center lg:justify-between">
          {/* Texte à gauche */}
          <div className="lg:w-1/2 mb-12 lg:mb-0">
            <h2 className="text-2xl lg:text-4xl font-medium text-gray-900 mb-4">
              Comment pouvons-nous vous <span className="text-blueCustom">aider</span> ?
            </h2>
            <p className="text-gray-600">
              {"Contactez nos équipes pour une démonstration, une assistance ou toute question sur nos produits."}
            </p>
          </div>

          {/* Formulaire à droite */}
          <div className="lg:w-1/2 p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Nom et prénom */}
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-labelGray mb-2">Nom</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-backgroundGray text-labelGray rounded-md placeholder-labelGray"
                    placeholder="Votre nom"
                    {...register("lastname", { required: "Le nom est obligatoire." })}
                  />
                  {errors.lastname && <p className="text-red-500 text-xs">{errors.lastname.message}</p>}
                </div>
                <div className="w-1/2">
                  <label className="block text-labelGray mb-2">Prénom</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-backgroundGray text-labelGray rounded-md placeholder-labelGray"
                    placeholder="Votre prénom"
                    {...register("firstname", { required: "Le prénom est obligatoire." })}
                  />
                  {errors.firstname && <p className="text-red-500 text-xs">{errors.firstname.message}</p>}
                </div>
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-labelGray mb-2">Téléphone</label>
                <input
                  type="tel"
                  className="w-full p-3 bg-backgroundGray text-labelGray rounded-md placeholder-labelGray"
                  placeholder="Votre numéro de téléphone"
                  {...register("phone", { required: "Le numéro de téléphone est obligatoire." })}
                />
                {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-labelGray mb-2">Email</label>
                <input
                  type="email"
                  className="w-full p-3 bg-backgroundGray text-labelGray rounded-md placeholder-labelGray"
                  placeholder="Votre email"
                  {...register("email", { required: "L'email est obligatoire." })}
                />
                {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
              </div>

              {/* Message */}
              <div>
                <label className="block text-labelGray mb-2">Message</label>
                <textarea
                  className="w-full p-3 bg-backgroundGray text-labelGray rounded-md placeholder-labelGray"
                  placeholder="Votre message"
                  rows={4}
                  {...register("message", { required: "Le message est obligatoire." })}
                ></textarea>
                {errors.message && <p className="text-red-500 text-xs">{errors.message.message}</p>}
              </div>

              {/* Erreur API */}
              {apiError && <p className="text-red-500 text-sm">{apiError}</p>}

              {/* Bouton envoyer */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isSending}
                  className={`flex items-center justify-center py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                    isSending
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-blueCustom text-white hover:bg-blue-700"
                  }`}
                >
                  {isSending ? "Envoi en cours..." : "Envoyer"} <VscSend className="ml-2" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
