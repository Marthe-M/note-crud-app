import { useState } from 'react'
import { prisma } from '../lib/prisma'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { AiOutlineCloseSquare, AiOutlineRead, AiOutlineForm, AiOutlinePlusCircle, AiOutlineRedo } from 'react-icons/ai';

interface Notes {
  notes: {
    id: string,
    title: string,
    content: string,
    createdAt: string
  }[]
}

interface FormData {
  title: string,
  content: string,
  id: string
}

const Home = ({ notes }: Notes) => {
  const [form, setForm] = useState<FormData>({ title: "", content: "", id: "" })
  const [updatedform, setupdatedForm] = useState<FormData>({ title: "", content: "", id: "" })
  const [showWindow, setShowWindow] = useState<boolean>(false)
  const router = useRouter()

  const refreshdata = () => {
    router.replace(router.asPath)
  }

  const iconStyle = {
    color: 'white',
    fontSize: '18px',
    padding: '0',
    margin: '0'
  }

  const iconStyleTwo = {
    fontSize: '26px',
  }

  const iconStyleThree = {
    fontSize: '26px',
    color: 'white',
    marginLeft: '10px'
  }

  async function create(data: FormData) {
    try {
      fetch('http://localhost:3000/api/create', {
        body: JSON.stringify(data),
        headers: {
          'Content-type': 'application/json'
        },
        method: 'POST'
      }).then(() => {
        setForm({ title: '', content: '', id: '' })
        refreshdata()
      })
    } catch (error) {
      console.log(error)
    }
  }

  async function deleteNote(id: string) {
    try {
      fetch(`http://localhost:3000/api/delete/${id}`, {
        headers: {
          'Content-type': 'application/json'
        },
        method: 'DELETE'
      }).then(() => {
        refreshdata()
      })
    } catch (error) {
      console.log(error)
    }
  }

  async function updateNote(data: FormData, id: string) {
    try {
      fetch(`http://localhost:3000/api/update/${id}`, {
        body: JSON.stringify(data),
        headers: {
          'Content-type': 'application/json'
        },
        method: 'PUT'
      }).then(() => {
        setShowWindow(false)
        refreshdata()
      })
    } catch (error) {
      console.log(error)
    }
  }


  const handleSubmit = async (data: FormData) => {
    try {
      create(data)
    } catch (error) {
      console.log(error)
    }
  }

  const handleUpdateSubmit = async (data: FormData, id: string) => {
    try {
      updateNote(data, id)
    } catch (error) {
      console.log(error)
    }
  }

  const showUpdateWindow = (note: FormData) => {
    setupdatedForm({ title: note.title, content: note.content, id: note.id })
    setShowWindow(true)
  }

  const sortedNotes = notes.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))

  return (
    <div className="app-container">

      {showWindow ? <div className="content-container">
        <h1>Update note</h1>
        <form className="notes-form" onSubmit={e => {
          e.preventDefault()
          handleUpdateSubmit(updatedform, updatedform.id)

        }}>
          <input type="text" placeholder="Title" value={updatedform.title} onChange={e => setupdatedForm({ ...updatedform, title: e.target.value })} />
          <textarea placeholder="Content" value={updatedform.content} onChange={e => setupdatedForm({ ...updatedform, content: e.target.value })} />
          <button className="add" type="submit">Update note<AiOutlineRedo style={iconStyleThree} /></button>
        </form>
      </div> : <div className="content-container">
        <h1>Note Taking App</h1>
        <form className="notes-form" onSubmit={e => {
          e.preventDefault()
          handleSubmit(form)
        }}>
          <input type="text" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <textarea placeholder="Content" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
          <button type="submit" className="add">Add note<AiOutlinePlusCircle style={iconStyleThree} /></button>
        </form>
        <div className="notes-container">
          <ul className="notes-list">
            {sortedNotes && sortedNotes.map(note => (
              <li className="note-element" key={note.id}><div className="note-title"><h3>{note.title}</h3><AiOutlineRead style={iconStyleTwo} /></div>
                <p className="note-content">{note.content}</p>
                <p className="note-date">Created at: {note.createdAt.toString().split('GMT+0100 (Midden-Europese standaardtijd)')}</p>
                <div className="note-buttons">
                  <button onClick={() => showUpdateWindow(note)} ><AiOutlineForm style={iconStyle} /></button>
                  <button className="delete" onClick={() => deleteNote(note.id)}> <AiOutlineCloseSquare style={iconStyle} /></button>
                </div></li>
            ))}
          </ul>
        </div>
      </div>}

    </div>
  )
}

export default Home

export const getServerSideProps: GetServerSideProps = async () => {

  const notes = await prisma.note.findMany({
    select: {
      title: true,
      id: true,
      content: true,
      createdAt: true
    }
  })

  return {
    props: {
      notes
    }
  }
}