const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Game Library</h3>
            <p className="text-gray-400">Your complete solution for game borrowing management.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Browse Games</a></li>
              <li><a href="#" className="hover:text-white">My Account</a></li>
              <li><a href="#" className="hover:text-white">Help & Support</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-gray-400">
              <i className="fas fa-envelope mr-2"></i>support@gamelibrary.com<br />
              <i className="fas fa-phone mr-2"></i>+1 (555) 123-4567
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Game Library. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
