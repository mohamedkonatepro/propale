import { NextApiRequest, NextApiResponse } from 'next';
import corsMiddleware, { cors } from '@/lib/corsMiddleware';
import { createProspectWithContacts } from '@/services/companyService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await corsMiddleware(req, res, cors);
  
  if (req.method === 'POST') {
    try {
      const dataModal = req.body;
      const company = await createProspectWithContacts(dataModal);
      return res.status(200).json(company);
    } catch (error) {
      console.error('Error creating prospect:', error);
      return res.status(500).json({ error: 'Error creating prospect' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
