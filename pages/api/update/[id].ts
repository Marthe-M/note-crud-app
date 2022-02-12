import { prisma } from '../../../lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const noteId = req.query.id
    const { title, content } = req.body
    if (req.method === 'PUT') {
        const note = await prisma.note.update({
            where: { id: Number(noteId) },
            data: {
                title,
                content,
                id: Number(noteId)
            }
        })
        res.json(note)
    } else {
        console.log('Note could not be updated')
    }
}
