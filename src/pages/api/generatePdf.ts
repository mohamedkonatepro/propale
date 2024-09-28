import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import corsMiddleware, { cors } from '@/lib/corsMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await corsMiddleware(req, res, cors);

  const { url } = req.body;

  const options: any = {
    method: 'POST',
    url: 'https://yakpdf.p.rapidapi.com/pdf',
    headers: {
      'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPIDAPI_KEY, // Utilisez une clé d'environnement pour sécuriser votre clé API
      'x-rapidapi-host': 'yakpdf.p.rapidapi.com',
      'Content-Type': 'application/json',
    },
    data: {
      source: {
        url,
      },
      pdf: {
        format: 'A4',
        scale: 1,
        printBackground: false,
      },
      wait: {
        for: 'navigation',
        waitUntil: 'load',
        timeout: 5000,
      },
    },
    responseType: 'arraybuffer', // Recevoir le PDF en tant que flux de données
  };

  try {
    const response = await axios.request(options);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=proposal.pdf');
    res.send(response.data);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
}
