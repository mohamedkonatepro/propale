import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import BaseModal from './BaseModal';
import { Button } from '../common/Button';

const mailGroupSchema = z.object({
  subject: z.string().min(1, "L'objet est requis"),
  message: z.string().min(1, "Le message est requis"),
});

export type MailGroupFormInputs = z.infer<typeof mailGroupSchema>;

type MailGroupModalProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  onSubmit: (data: MailGroupFormInputs) => Promise<void>;
};

const MailGroupModal: React.FC<MailGroupModalProps> = ({ isOpen, onRequestClose, onSubmit }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<MailGroupFormInputs>({
    resolver: zodResolver(mailGroupSchema),
    defaultValues: {
      subject: '',
      message: '',
    },
  });

  const onSubmitHandler = async (data: MailGroupFormInputs) => {
    setIsLoading(true);
    await onSubmit(data);
    reset();
    setIsLoading(false);
    onRequestClose();
  };

  return (
    <BaseModal isOpen={isOpen} onRequestClose={onRequestClose} title="Envoyer un email groupé">
      <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
        <div className="form-group">
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
            {"Objet de l'email"}
          </label>
          <input
            type="text"
            id="subject"
            {...register('subject')}
            className="mt-1 p-2 border border-gray-300 rounded-md w-full"
          />
          {errors.subject && <p className="text-red-600 text-sm mt-1">{errors.subject.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
            Message
          </label>
          <textarea
            id="message"
            {...register('message')}
            rows={6}
            className="mt-1 p-2 border border-gray-300 rounded-md w-full"
          />
          {errors.message && <p className="text-red-600 text-sm mt-1">{errors.message.message}</p>}
        </div>

        <div className='flex justify-center'>
          <Button isLoading={isLoading} type="submit" className="bg-blueCustom text-white rounded px-4 py-2 mt-4">
            Envoyer les emails
          </Button>
        </div>
      </form>
    </BaseModal>
  );
};

export default MailGroupModal;
