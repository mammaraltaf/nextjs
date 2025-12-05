
import Link from 'next/link'

export default function Home() {
  const formCards = [
    {
      title: 'Education Form',
      description: 'Educational institutions and services registration',
      link: '/dashboard/education'
    },
    {
      title: 'Financial Institutions',
      description: 'Banking and financial services registration',
      link: '/dashboard/financial-institutions'
    },
    {
      title: 'Government Form',
      description: 'Government agencies and departments registration',
      link: '/dashboard/government'
    },
    {
      title: 'Healthcare Form',
      description: 'Healthcare providers and medical services',
      link: '/dashboard/healthcare'
    },
    {
      title: 'Merchant Form',
      description: 'Business and merchant services registration',
      link: '/dashboard/merchant'
    },
    {
      title: 'Consumer Portal',
      description: 'Individual consumer identity verification',
      link: '/dashboard/consumer/this-is-me'
    }
  ]

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">
            Welcome to Ginicoe
          </h1>
          <p className="text-lg mb-6">
            Choose your registration form to get started
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formCards.map((card, index) => (
            <Link 
              key={index} 
              href={card.link}
              className="block"
            >
              <div className="border p-6 rounded">
                <h2 className="text-xl font-semibold mb-3">
                  {card.title}
                </h2>
                <p className="text-sm">
                  {card.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}

export const metadata = {
  title: 'Ginicoe',
  description: 'Ginicoe - Registration Forms'
}