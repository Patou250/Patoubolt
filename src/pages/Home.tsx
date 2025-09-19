import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { App, Page, Navbar, Block, Button, List, ListItem } from 'konsta/react'
import { usePreviewGate } from '../hooks/usePreviewGate'
import PreviewGate from '../components/PreviewGate'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Home() {
  const { mustGate } = usePreviewGate()

  // Afficher le gate de prévisualisation si nécessaire
  if (mustGate) {
    return <PreviewGate />
  }

  return (
    <App theme="ios">
      <Page>
        <Navbar title="Patou - Test Konsta UI" />
        
        <Block>
          <h2 className="text-2xl font-bold mb-4 text-primary">🎉 Konsta UI Integration Test</h2>
          <p className="mb-4 text-gray-600">
            Konsta UI est correctement intégré avec les couleurs Patou et la police Nunito !
          </p>
        </Block>

        <Block>
          <h3 className="text-lg font-semibold mb-3 text-protect">Test des couleurs Patou</h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button className="bg-primary text-white">Primary #287233</Button>
            <Button className="bg-protect text-white">Protect #017ba6</Button>
            <Button className="bg-share text-white">Share #e2725b</Button>
            <Button className="bg-awaken text-gray-900">Awaken #ffd447</Button>
          </div>
        </Block>

        <List>
          <ListItem title="Police Nunito" subtitle="Font-family appliquée globalement" />
          <ListItem title="Couleurs Patou" subtitle="Intégrées dans Tailwind config" />
          <ListItem title="Konsta UI" subtitle="Composants iOS/Material Design" />
        </List>

        <Block>
          <div className="bg-gradient-to-r from-primary to-protect text-white p-4 rounded-lg text-center mb-6">
            <h4 className="font-bold">Gradient Patou</h4>
            <p className="text-sm opacity-90">Primary → Protect</p>
          </div>
        </Block>

        <Block>
          <h3 className="text-lg font-semibold mb-3 text-share">Navigation Patou</h3>
          <div className="space-y-2">
            <Link to="/parent/login" className="block w-full">
              <Button className="w-full bg-protect text-white">Espace Parent</Button>
            </Link>
            <Link to="/child/login" className="block w-full">
              <Button className="w-full bg-awaken text-gray-900">Espace Enfant</Button>
            </Link>
          </div>
        </Block>
      </Page>
    </App>
  )
}