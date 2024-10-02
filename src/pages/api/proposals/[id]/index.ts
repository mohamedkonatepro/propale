import corsMiddleware, { cors } from '@/lib/corsMiddleware';
import { supabase } from '@/lib/supabaseClient';
import { Proposal, Need, Paragraph } from '@/types/models';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await corsMiddleware(req, res, cors);
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing proposal ID' });
  }
  if (req.method === 'GET') {
    try {
      const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', id)
        .single<Proposal>();

      if (proposalError || !proposal) {
        return res.status(404).json({ error: 'Proposal not found' });
      }

      const { data: needs, error: needsError } = await supabase
        .from('proposal_needs')
        .select('*')
        .eq('proposal_id', id);

      if (needsError) {
        return res.status(500).json({ error: needsError.message });
      }

      const formattedNeeds = needs?.map((need: any) => ({
        ...need,
        showName: need.show_name,
        showPrice: need.show_price,
        showQuantity: need.show_quantity,
      }));

      const { data: paragraphs, error: paragraphsError } = await supabase
        .from('proposal_paragraphs')
        .select('*')
        .eq('proposal_id', id);

      if (paragraphsError) {
        return res.status(500).json({ error: paragraphsError.message });
      }

      const formattedParagraphs = paragraphs?.map((paragraph: any) => ({
        ...paragraph,
        showName: paragraph.show_name,
      }));

      return res.status(200).json({
        proposal,
        needs: formattedNeeds || [],
        paragraphs: formattedParagraphs || [],
      });
    } catch (error) {
      return res.status(500).json({ error: 'Something went wrong' });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Delete proposal needs
      await supabase
        .from('proposal_needs')
        .delete()
        .eq('proposal_id', id);

      // Delete proposal paragraphs
      await supabase
        .from('proposal_paragraphs')
        .delete()
        .eq('proposal_id', id);

      // Delete proposal itself
      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', id);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ message: 'Proposal deleted successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Something went wrong' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
