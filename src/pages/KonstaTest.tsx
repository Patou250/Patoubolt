import { App, Page, Navbar, Block, Button, List, ListItem } from 'konsta/react'

export default function KonstaTest() {
  return (
    <App theme="ios">
      <Page>
        <Navbar title="Konsta OK" />
        
        <Block>
          <h2 className="text-2xl font-bold mb-4 text-primary">🎉 Konsta UI Integration Test</h2>
          <p className="mb-4 text-gray-600">
            Konsta UI est correctement intégré avec les couleurs Patou et la police Nunito !
          </p>
        </Block>

        <Block>
          <h3 className="text-lg font-semibold mb-3 text-protect">Test des couleurs Patou</h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button className="bg-primary">Primary #287233</Button>
            <Button className="bg-protect">Protect #017ba6</Button>
            <Button className="bg-share">Share #e2725b</Button>
            <Button className="bg-awaken text-gray-900">Awaken #ffd447</Button>
          </div>
        </Block>

        <List>
          <ListItem title="Police Nunito" subtitle="Font-family appliquée globalement" />
          <ListItem title="Couleurs Patou" subtitle="Intégrées dans Tailwind config" />
          <ListItem title="Konsta UI" subtitle="Composants iOS/Material Design" />
        </List>

        <Block>
          <div className="bg-gradient-to-r from-primary to-protect text-white p-4 rounded-lg text-center">
            <h4 className="font-bold">Gradient Patou</h4>
            <p className="text-sm opacity-90">Primary → Protect</p>
          </div>
        </Block>
      </Page>
    </App>
  )
}