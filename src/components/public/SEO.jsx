import { Helmet } from 'react-helmet-async'

export default function SEO({ title, description, image, type = 'website' }) {
  const fullTitle = title
    ? `${title} | IKS.PI Kera Sakti Kedungadem`
    : 'IKS.PI Kera Sakti Ranting Kedungadem'
  const desc =
    description ||
    'Website resmi IKS.PI Kera Sakti Ranting Kedungadem, Cabang Bojonegoro.'
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={type} />
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  )
}
