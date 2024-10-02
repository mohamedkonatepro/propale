import { supabase } from '@/lib/supabaseClient';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Proposal, Need, Paragraph, ProposalData } from '@/types/models';
import corsMiddleware, { cors } from '@/lib/corsMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await corsMiddleware(req, res, cors);
  if (req.method === 'PUT') {
    const { id: proposalId } = req.query;
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

    if (!proposalId || typeof proposalId !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing proposal ID' });
    }

    try {
      const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .update({
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
          show_title: showTitle,
          description,
          total_price: totalPrice,
          mention_realise,
          updated_at: new Date().toISOString(),
        })
        .eq('id', proposalId)
        .select('*')
        .single<Proposal>();

      if (proposalError) {
        return res.status(500).json({ error: proposalError.message });
      }

      await supabase.from('proposal_needs').delete().eq('proposal_id', proposalId);
      await supabase.from('proposal_paragraphs').delete().eq('proposal_id', proposalId);

      const needsToInsert = needs.map((need: Need, index: number) => ({
        proposal_id: proposalId,
        name: need.name,
        description: need.description,
        quantity: need.quantity,
        price: need.price,
        show_name: need.showName,
        show_price: need.showPrice,
        show_quantity: need.showQuantity,
        order_position: index,
      }));

      const { data: needsData, error: needsError } = await supabase
        .from('proposal_needs')
        .insert(needsToInsert)
        .select('*');

      if (needsError) {
        return res.status(500).json({ error: needsError.message });
      }

      const paragraphsToInsert = paragraphs.map((paragraph: Paragraph, index: number) => ({
        proposal_id: proposalId,
        name: paragraph.name,
        description: paragraph.description,
        show_name: paragraph.showName,
        order_position: index,
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
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
