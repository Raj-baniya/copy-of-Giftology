import { Product, Category } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Custom Engraved Watch',
    price: 2499,
    category: 'for-him',
    imageUrl: 'https://images.pexels.com/photos/280250/pexels-photo-280250.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'A timeless piece with a personal touch.',
    trending: true,
  },
  {
    id: '2',
    name: 'Monogrammed Leather Tote',
    price: 3999,
    category: 'for-her',
    imageUrl: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Elegant and spacious for everyday use.',
    trending: true,
  },
  {
    id: '3',
    name: 'Anniversary Photo Frame',
    price: 1299,
    category: 'anniversary',
    imageUrl: 'https://images.pexels.com/photos/1040900/pexels-photo-1040900.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Capture your best moments together.',
  },
  {
    id: '4',
    name: 'Personalized Mug Set',
    price: 899,
    category: 'birthdays',
    imageUrl: 'https://images.pexels.com/photos/1320998/pexels-photo-1320998.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Start the morning with a smile.',
  },
  {
    id: '5',
    name: 'Wooden Toy Train',
    price: 1499,
    category: 'for-kids',
    imageUrl: 'https://images.pexels.com/photos/3663060/pexels-photo-3663060.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Classic wooden toy for imaginative play.',
  },
  {
    id: '6',
    name: 'Modern Ceramic Vase',
    price: 2100,
    category: 'for-home',
    imageUrl: 'https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Minimalist design to elevate any room.',
    trending: true,
  },
  {
    id: '8',
    name: 'Crystal Wine Glasses',
    price: 3200,
    category: 'wedding',
    imageUrl: 'https://images.pexels.com/photos/313700/pexels-photo-313700.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Elegant glassware for the perfect toast.',
  },
  {
    id: '9',
    name: 'Handpainted Clay Diyas (Set of 6)',
    price: 499,
    category: 'diwali',
    imageUrl: 'https://images.pexels.com/photos/6759530/pexels-photo-6759530.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Traditional handcrafted diyas to light up your festival.',
    trending: true,
  },
  {
    id: '10',
    name: 'Organic Gulal Hamper',
    price: 899,
    category: 'holi',
    imageUrl: 'https://images.pexels.com/photos/1109447/pexels-photo-1109447.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Safe and skin-friendly organic colors for a vibrant Holi.',
  },
  {
    id: '11',
    name: 'Spooky Ceramic Pumpkin',
    price: 1299,
    category: 'halloween',
    imageUrl: 'https://images.pexels.com/photos/619418/pexels-photo-619418.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Perfect decor for a spooky Halloween night.',
  },
  {
    id: '12',
    name: 'Personalized Santa Sack',
    price: 1499,
    category: 'christmas',
    imageUrl: 'https://images.pexels.com/photos/3303615/pexels-photo-3303615.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'A large sack for all the gifts from Santa.',
    trending: true,
  },
  {
    id: '13',
    name: 'Premium Date & Nut Box',
    price: 1999,
    category: 'eid',
    imageUrl: 'https://images.pexels.com/photos/2233416/pexels-photo-2233416.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Exquisite selection of dates and nuts for Eid.',
  }
];

export const CATEGORIES: Category[] = [
  { 
    id: 'c1', 
    name: 'For Him', 
    slug: 'for-him', 
    imageUrl: 'https://images.pexels.com/photos/842539/pexels-photo-842539.jpeg?auto=compress&cs=tinysrgb&w=800' 
  },
  { 
    id: 'c2', 
    name: 'For Her', 
    slug: 'for-her', 
    imageUrl: 'https://images.pexels.com/photos/1460838/pexels-photo-1460838.jpeg?auto=compress&cs=tinysrgb&w=800' 
  },
  { 
    id: 'c3', 
    name: 'Anniversary', 
    slug: 'anniversary', 
    imageUrl: 'https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=800' 
  },
  { 
    id: 'c4', 
    name: 'Birthdays', 
    slug: 'birthdays', 
    imageUrl: 'https://images.pexels.com/photos/1405528/pexels-photo-1405528.jpeg?auto=compress&cs=tinysrgb&w=800' 
  },
  { 
    id: 'c5', 
    name: 'For Kids', 
    slug: 'for-kids', 
    imageUrl: 'https://images.pexels.com/photos/3661229/pexels-photo-3661229.jpeg?auto=compress&cs=tinysrgb&w=800' 
  },
  { 
    id: 'c6', 
    name: 'Home Decor', 
    slug: 'for-home', 
    imageUrl: 'https://images.pexels.com/photos/1090638/pexels-photo-1090638.jpeg?auto=compress&cs=tinysrgb&w=800' 
  },
  { 
    id: 'c7', 
    name: 'Wedding', 
    slug: 'wedding', 
    imageUrl: 'https://images.pexels.com/photos/256737/pexels-photo-256737.jpeg?auto=compress&cs=tinysrgb&w=800' 
  },
  {
    id: 'c9',
    name: 'Diwali',
    slug: 'diwali',
    imageUrl: 'https://images.pexels.com/photos/6759530/pexels-photo-6759530.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'c10',
    name: 'Holi',
    slug: 'holi',
    imageUrl: 'https://images.pexels.com/photos/1109447/pexels-photo-1109447.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'c11',
    name: 'Halloween',
    slug: 'halloween',
    imageUrl: 'https://images.pexels.com/photos/619418/pexels-photo-619418.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'c12',
    name: 'Christmas',
    slug: 'christmas',
    imageUrl: 'https://images.pexels.com/photos/3303615/pexels-photo-3303615.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'c13',
    name: 'Eid',
    slug: 'eid',
    imageUrl: 'https://images.pexels.com/photos/2233416/pexels-photo-2233416.jpeg?auto=compress&cs=tinysrgb&w=800'
  }
];