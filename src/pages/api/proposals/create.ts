// pages/api/proposals/create.ts
import corsMiddleware, { cors } from '@/lib/corsMiddleware';
import { supabase } from '@/lib/supabaseClient';
import { Proposal, Need, Paragraph, ProposalData } from '@/types/models';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await corsMiddleware(req, res, cors);
  if (req.method === 'POST') {
    const { 
      name,
      companyId, 
      companyName, 
      companySiren, 
      prospectId, 
      prospectName, 
      prospectSiren, 
      createdBy, 
      title, 
      showTitle,
      description, 
      totalPrice, 
      needs, 
      paragraphs, 
      status,
      mention_realise
    }: ProposalData = req.body;

    try {
      // Enregistrer la proposition
      const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .insert([{
          name,
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
          show_title: showTitle,
          total_price: totalPrice,
          mention_realise
        }])
        .select('*')
        .single<Proposal>();

      if (proposalError) {
        return res.status(500).json({ error: proposalError.message });
      }

      const needsToInsert = needs.map((need: Need, index: number) => ({
        proposal_id: proposal.id,
        name: need.name,
        description: need.description,
        quantity: need.quantity,
        price: need.price,
        show_name: need.showName,
        show_price: need.showPrice,
        show_quantity: need.showQuantity,
        order_position: index
      }));

      const { data: needsData, error: needsError } = await supabase
        .from('proposal_needs')
        .insert(needsToInsert)
        .select('*');

      if (needsError) {
        return res.status(500).json({ error: needsError.message });
      }

      const paragraphsToInsert = paragraphs.map((paragraph: Paragraph, index: number) => ({
        proposal_id: proposal.id,
        name: paragraph.name,
        description: paragraph.description,
        show_name: paragraph.showName,
        order_position: index
      }));

      const { data: paragraphsData, error: paragraphsError } = await supabase
        .from('proposal_paragraphs')
        .insert(paragraphsToInsert)
        .select('*');

      if (paragraphsError) {
        return res.status(500).json({ error: paragraphsError.message });
      }

      return res.status(200).json({ proposal, needs: needsData, paragraphs: paragraphsData });
    } catch (error) {
      return res.status(500).json({ error: 'Something went wrong' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
