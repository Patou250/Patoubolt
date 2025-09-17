import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const mock = [
  { name: 'Lundi', minutes: 30 },
  { name: 'Mardi', minutes: 45 },
  { name: 'Mercredi', minutes: 20 }
]

export default function ParentInsights() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Insights</h1>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={mock}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="minutes" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}