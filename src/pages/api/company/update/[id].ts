import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import corsMiddleware, { cors } from '@/lib/corsMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await corsMiddleware(req, res, cors);
  const { id } = req.query;

  if (req.method === 'PUT') {
    const data = req.body;

    const { error } = await supabase
      .from('company')
      .update({
        name: data.name,
        siret: data.siret,
        siren: data.siren,
        ape_code: data.ape_code,
        activity_sector: data.activity_sector,
        description: data.description,
        updated_at: new Date().toISOString(),
        address: data.address,
        city: data.city,
        postalcode: data.postalcode,
        country: data.country,
        heat_level: data.heat_level,
        status: data.status,
        type: data.type,
      })
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Error updating company' });
    }

    return res.status(200).json({ message: 'Company updated successfully' });
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
