import Image from 'next/image'
import clsx from 'clsx'

interface FoodPlaceholderProps {
  title?: string
  cuisine?: string
  className?: string
}

const IMG = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`

const LIB: { test: RegExp; src: string; alt: string }[] = [
  { test: /(pizza|ital|margherita|pepperoni|pasta|risotto)/i, src: IMG('photo-1604382354936-07c5d9983bd3'), alt: 'Italian pizza on board' },
  { test: /(pasta|ital|spaghetti|fettuccine|penne)/i, src: IMG('photo-1621996346565-e3dbc353d2e5'), alt: 'Creamy pasta dish' },
  { test: /(taco|mex|quesadilla|burrito)/i, src: IMG('photo-1565299585323-38d6b0865b47'), alt: 'Tacos with toppings' },
  { test: /(stir.?fry|asian|noodle|wok|beef)/i, src: IMG('photo-1603133872878-684f208fb84b'), alt: 'Beef stir fry' },
  { test: /(burger|american|sandwich)/i, src: IMG('photo-1568901346375-23c9450c58cd'), alt: 'Juicy burger' },
  { test: /(sushi|jap|nigiri|maki)/i, src: IMG('photo-1553621042-f6e147245754'), alt: 'Assorted sushi plate' },
  { test: /(salad|healthy|greens)/i, src: IMG('photo-1546069901-ba9599a7e63c'), alt: 'Fresh salad bowl' },
  { test: /(breakfast|pancake|waffle)/i, src: IMG('photo-1504754524776-8f4f37790ca0'), alt: 'Pancakes with berries' },
  { test: /(curry|indian|masala)/i, src: IMG('photo-1512058564366-18510be2db19'), alt: 'Spiced curry' },
]

const FALLBACK = { src: IMG('photo-1504674900247-0877df9cc836'), alt: 'Assorted street food' }

export function FoodPlaceholder({ title, cuisine, className }: FoodPlaceholderProps) {
  const text = `${cuisine || ''} ${title || ''}`
  const match = LIB.find(item => item.test.test(text)) || FALLBACK

  return (
    <div className={clsx('relative aspect-video overflow-hidden rounded-t-2xl', className)}>
      <Image src={match.src} alt={match.alt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
    </div>
  )
}
