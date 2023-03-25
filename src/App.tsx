import type { InferResponseType } from 'hono/client'
import { hc } from 'hono/client'
import { useEffect, useState } from 'react'
import { AppType2 } from '../functions/api/[[route]]'
import { SequenceNumber } from './components/SequenceNumber'

const App = () => {
  const client = hc<AppType2>('/api')
  const $get = client.list.$get

  const [data, setData] = useState<InferResponseType<typeof $get>>()

  useEffect(() => {
    const fetchData = async () => {
      const res = await $get()
      const responseData = await res.json()
      setData(responseData)
    }
    fetchData()
  }, [])

  const sequenceNumbers = data.collection.map((seqnum) => (
    <SequenceNumber id={seqnum.name} />
    )
  )
  return (
    <div>
    <h1>KV Data</h1>
    <h2 id="list-heading">Sequence Numbers</h2>
    <ul role="list" aria-labelledby="list-heading">
      {sequenceNumbers}
    </ul>
    </div>
  )
}

export default App
