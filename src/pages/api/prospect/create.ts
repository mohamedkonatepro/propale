import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { createUser, sendPasswordResetEmail } from '@/services/userService';
import { createProfile } from '@/services/profileService';
import { associateProfileWithCompany } from '@/services/companyProfileService';
import corsMiddleware, { cors } from '@/lib/corsMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await corsMiddleware(req, res, cors);
  if (req.method === 'POST') {
    const dataModal = req.body;

    try {
      // Step 1: Create the prospect company
      const { data, error } = await supabase
        .from('company')
        .insert([{
          company_id: dataModal.companyId,
          name: dataModal.name,
          siren: dataModal.siren,
          ape_code: dataModal.ape_code,
          activity_sector: dataModal.activity_sector,
          address: dataModal.address,
          city: dataModal.city,
          postalcode: dataModal.postalcode,
          country: dataModal.country,
          heat_level: dataModal.heat_level,
          status: dataModal.status,
          type: 'prospect',
        }])
        .select('*')
        .single();
      if (error) {
        throw new Error('Error creating prospect company');
      }

      // Step 2: Create the user and associate with company
      let user;
      if (dataModal.password) {
        user = await createUser(dataModal.email, dataModal.password);
        if (!user) throw new Error('Failed to create primary contact user');
      } else {
        user = await createUser(dataModal.email);
        if (!user) throw new Error('Failed to create primary contact user');
        
        await sendPasswordResetEmail(dataModal.email);
      }

      const profileData = {
        userId: user.id,
        firstname: dataModal.firstname,
        lastname: dataModal.lastname,
        position: dataModal.position,
        phone: dataModal.phone,
        email: dataModal.email,
        role: dataModal.role || 'prospect',
        is_primary_contact: true,
      };

      await createProfile(profileData);
      await associateProfileWithCompany(user.id, data.id);

      // Step 3: Handle additional contacts if provided
      if (dataModal.additionalContacts) {
        for (const contact of dataModal.additionalContacts) {
          const additionalUser = await createUser(contact.email);
          if (!additionalUser) throw new Error('Failed to create additional contact user');
  
          await sendPasswordResetEmail(contact.email);

          const additionalProfileData = {
            userId: additionalUser.id,
            firstname: contact.firstname,
            lastname: contact.lastname,
            position: contact.position,
            phone: contact.phone,
            email: contact.email,
            role: contact.role || 'prospect',
            is_primary_contact: false,
          };

          await createProfile(additionalProfileData);
          await associateProfileWithCompany(additionalUser.id, data.id);
        }
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error('Error creating prospect:', error);
      return res.status(500).json({ error: 'Error creating prospect' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
