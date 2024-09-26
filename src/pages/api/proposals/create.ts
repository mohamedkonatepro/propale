// pages/api/proposals/create.ts
import { supabase } from '@/lib/supabaseClient';
import { Proposal, Need, Paragraph } from '@/types/models';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { 
      companyId, 
      companyName, 
      companySiren, 
      prospectId, 
      prospectName, 
      prospectSiren, 
      createdBy, 
      title, 
      description, 
      totalPrice, 
      needs, 
      paragraphs, 
      status 
    }: {
      companyId: string;
      companyName: string;
      companySiren: string;
      prospectId: string;
      prospectName: string;
      prospectSiren: string;
      createdBy: string;
      title: string;
      description: string;
      totalPrice: number;
      needs: Need[];
      paragraphs: Paragraph[];
      status: 'draft' | 'published' | 'archived';
    } = req.body;

    try {
      // Enregistrer la proposition
      const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .insert([{
          company_id: companyId,
          company_name: companyName,
          company_siren: companySiren,
          prospect_id: prospectId,
          prospect_name: prospectName,
          prospect_siren: prospectSiren,
          created_by: createdBy,
          status,
          title,
          description,
          total_price: totalPrice
        }])
        .single<Proposal>();

      if (proposalError) {
        return res.status(500).json({ error: proposalError.message });
      }

      // Enregistrer les besoins (needs) avec la proposition
      const needsToInsert = needs.map((need: Need, index: number) => ({
        proposal_id: proposal.id,
        name: need.name,
        description: need.description,
        quantity: need.quantity,
        price: need.price,
        show_name: need.showName,
        show_price: need.showPrice,
        order_position: index
      }));

      const { error: needsError } = await supabase
        .from('proposal_needs')
        .insert(needsToInsert);

      if (needsError) {
        return res.status(500).json({ error: needsError.message });
      }

      // Enregistrer les paragraphes avec la proposition
      const paragraphsToInsert = paragraphs.map((paragraph: Paragraph, index: number) => ({
        proposal_id: proposal.id,
        name: paragraph.name,
        description: paragraph.description,
        show_name: paragraph.showName,
        order_position: index
      }));

      const { error: paragraphsError } = await supabase
        .from('proposal_paragraphs')
        .insert(paragraphsToInsert);

      if (paragraphsError) {
        return res.status(500).json({ error: paragraphsError.message });
      }

      // Retourner la proposition créée avec les besoins et paragraphes
      return res.status(200).json({ proposal, needs: needsToInsert, paragraphs: paragraphsToInsert });
    } catch (error) {
      return res.status(500).json({ error: 'Something went wrong' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
