import { NextApiRequest, NextApiResponse } from 'next';
import corsMiddleware, { cors } from '@/lib/corsMiddleware';
import { createCompanyRecord } from '@/services/companyService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await corsMiddleware(req, res, cors);
  
  if (req.method === 'POST') {
    try {
      const { dataModal } = req.body;
      
      const company = await createCompanyRecord(dataModal);
      return res.status(200).json(company);
    } catch (error) {
      console.error('Error creating company:', error);
      return res.status(500).json({ error: 'Error creating company' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
