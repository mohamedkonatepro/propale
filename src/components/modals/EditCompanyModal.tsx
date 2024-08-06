import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { CompanyFormInputs } from '@/schemas/company';
import axios from 'axios';
import dataApeCode from '../../data/codes-ape.json';
import { Company } from '@/types/models';
import BaseModal from './BaseModal';

type AddCompanyModalProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  defaultValues: Company;
};

const EditCompanyModal: React.FC<AddCompanyModalProps> = ({ isOpen, onRequestClose, onSubmit, defaultValues }) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<CompanyFormInputs>({
    defaultValues,
  });

  const onSubmitHandler = async (data: CompanyFormInputs) => {
    await onSubmit(data);
    reset();
  };

  const sirenValue = watch('siren');

  useEffect(() => {
    const fetchCompanyDetails = async (siren: string) => {
      try {
        const response = await axios.get(`https://api.insee.fr/entreprises/sirene/V3.11/siren/${siren}`, {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SIRENE_API_KEY}`,
          },
        });
        const companyData = response.data.uniteLegale;
        const ape_code = companyData.periodesUniteLegale[0].activitePrincipaleUniteLegale;
        setValue('ape_code', ape_code || '');
        const naf = dataApeCode.find(code => code.id === ape_code);
        if (naf) {
          setValue('activity_sector', naf?.label || '');
        }

        const responseSearch = await axios.get(`https://recherche-entreprises.api.gouv.fr/search?q=${siren}`);
        const company = responseSearch.data.results[0].siege;
        setValue('address', `${company.numero_voie || ''} ${company.type_voie || ''} ${company.libelle_voie || ''}`);
        setValue('city', company.libelle_commune || '');
        setValue('postalcode', company.code_postal || '');
        setValue('country', 'France');
      } catch (error) {
        console.error('Erreur lors de la récupération des informations de l’entreprise:', error);
      }
    };

    if (sirenValue && sirenValue.length === 9) {
      fetchCompanyDetails(sirenValue);
    } else {
      setValue('activity_sector', '');
      setValue('ape_code', '');
      setValue('address', '');
      setValue('city', '');
      setValue('postalcode', '');
    }
  }, [sirenValue, setValue]);

  return (
    <BaseModal isOpen={isOpen} onRequestClose={onRequestClose} title={'Modifier une entreprise'}>
      <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Informations principales</h3>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <label className="block text-sm font-medium text-labelGray">Raison sociale</label>
              <input
                {...register('name', { value: defaultValues.name })}
                className="mt-1 block w-full rounded p-2 bg-backgroundGray"
                placeholder="Company"
              />
              {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-labelGray">Numéro SIREN</label>
              <input
                {...register('siren', { value: defaultValues.siren })}
                className="mt-1 block w-full bg-backgroundGray rounded p-2"
                placeholder="123456789"
              />
              {errors.siren && <p className="text-red-500 text-xs">{errors.siren.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-labelGray">Code APE</label>
              <input
                {...register('ape_code')}
                className="mt-1 block w-full bg-backgroundGray rounded p-2"
                placeholder="9234A"
                disabled
              />
              {errors.ape_code && <p className="text-red-500 text-xs">{errors.ape_code.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-labelGray">Secteur d’activité</label>
              <input
                {...register('activity_sector', { value: defaultValues.activity_sector })}
                className="mt-1 block w-full bg-backgroundGray rounded p-2"
                placeholder=""
                disabled
              />
              {errors.activity_sector && <p className="text-red-500 text-xs">{errors.activity_sector.message}</p>}
            </div>
          </div>
        </div>
        <div className='flex justify-center'>
          <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 mt-4">
            Modifier cette entreprise
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default EditCompanyModal;
