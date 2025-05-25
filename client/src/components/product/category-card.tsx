import { Link } from "wouter";

export interface CategoryItem {
  id: number;
  name: string;
  image: string;
  count: number;
  subcategories: { name: string; href: string }[];
}

interface CategoryCardProps {
  category: CategoryItem;
}

export const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <div className="group bg-neutral-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative h-48">
        <img 
          src={category.image} 
          alt={`${category.name} category`} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
          <div className="p-4 w-full">
            <h3 className="font-heading font-bold text-xl text-white">{category.name}</h3>
            <span className="text-sm text-white/90">{category.count}+ products</span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <ul className="space-y-2 text-sm">
          {category.subcategories.map((subcategory, index) => (
            <li key={index} className="text-neutral-700 hover:text-primary transition-colors">
              <Link href={subcategory.href} className="flex justify-between">
                <span>{subcategory.name}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
        <Link href={`/products?category=${category.id}`} className="inline-block mt-4 text-primary font-medium hover:text-primary-dark transition-colors">
          View All <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </div>
  );
};
