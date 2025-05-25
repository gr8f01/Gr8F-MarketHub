import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-neutral-800 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="text-2xl font-heading font-bold mb-4">
              <span className="text-[#FF7A00]">GR8F</span> MarketHub
            </div>
            <p className="text-neutral-400 mb-4">
              The ultimate marketplace for Egerton University students. Shop with convenience and get the best deals.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-[#FF7A00] transition-colors" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-white hover:text-[#FF7A00] transition-colors" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-white hover:text-[#FF7A00] transition-colors" aria-label="Instagram">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-neutral-400 hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/products" className="text-neutral-400 hover:text-white transition-colors">Shop</Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-neutral-400 hover:text-white transition-colors">How It Works</Link>
              </li>
              <li>
                <Link href="/#faq" className="text-neutral-400 hover:text-white transition-colors">FAQ</Link>
              </li>
              <li>
                <Link href="/register" className="text-neutral-400 hover:text-white transition-colors">Register</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products?category=1" className="text-neutral-400 hover:text-white transition-colors">Textbooks</Link>
              </li>
              <li>
                <Link href="/products?category=2" className="text-neutral-400 hover:text-white transition-colors">Stationery</Link>
              </li>
              <li>
                <Link href="/products?category=3" className="text-neutral-400 hover:text-white transition-colors">Gadgets</Link>
              </li>
              <li>
                <Link href="/products?category=4" className="text-neutral-400 hover:text-white transition-colors">Dorm Essentials</Link>
              </li>
              <li>
                <Link href="/products" className="text-neutral-400 hover:text-white transition-colors">View All</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <MapPin size={18} className="text-[#FF7A00] mt-1 mr-2" />
                <span className="text-neutral-400">Egerton University, Njoro Campus</span>
              </li>
              <li className="flex items-start">
                <Mail size={18} className="text-[#FF7A00] mt-1 mr-2" />
                <span className="text-neutral-400">hello@gr8fmarkethub.co.ke</span>
              </li>
              <li className="flex items-start">
                <Phone size={18} className="text-[#FF7A00] mt-1 mr-2" />
                <span className="text-neutral-400">+254 712 345 678</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-6 mt-6 border-t border-neutral-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-400 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} GR8F MarketHub. All rights reserved.
          </p>
          <div className="flex space-x-4 text-sm">
            <Link href="/terms" className="text-neutral-400 hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/terms#privacy" className="text-neutral-400 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms#returns" className="text-neutral-400 hover:text-white transition-colors">Return Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
