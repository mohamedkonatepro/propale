import { NextApiRequest, NextApiResponse } from 'next';
import corsMiddleware, { cors } from '@/lib/corsMiddleware';
import { updateCompanyRecord } from '@/services/companyService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await corsMiddleware(req, res, cors);
  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const data = req.body;
      await updateCompanyRecord(id as string, data);
      return res.status(200).json({ message: 'Company updated successfully' });
    } catch (error) {
      console.error('Error updating company:', error);
      return res.status(500).json({ error: 'Error updating company' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
