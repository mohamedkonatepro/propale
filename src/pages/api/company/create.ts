import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import corsMiddleware, { cors } from '@/lib/corsMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await corsMiddleware(req, res, cors);
  if (req.method === 'POST') {
    const { dataModal } = req.body;

    const { data, error } = await supabase
      .from('company')
      .insert([{
        company_id: dataModal.companyId,
        name: dataModal.name,
        siret: dataModal.siret,
        siren: dataModal.siren,
        ape_code: dataModal.ape_code,
        activity_sector: dataModal.activity_sector,
        description: dataModal.description,
        address: dataModal.address,
        city: dataModal.city,
        postalcode: dataModal.postalcode,
        country: dataModal.country,
        heat_level: dataModal.heat_level,
        status: dataModal.status,
        type: dataModal.type,
      }])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating company:', error);
      return res.status(500).json({ error: 'Error creating company' });
    }

    return res.status(200).json(data);
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
