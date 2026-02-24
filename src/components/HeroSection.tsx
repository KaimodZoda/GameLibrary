const HeroSection = () => {
  return (
    <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold mb-4">Welcome to Game Library</h2>
        <p className="text-xl mb-8">Browse, borrow, and manage your favorite games</p>
        <div className="flex justify-center space-x-4">
          <button className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100">
            <i className="fas fa-gamepad mr-2"></i>Browse Games
          </button>
          <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600">
            <i className="fas fa-plus mr-2"></i>Add Game
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
