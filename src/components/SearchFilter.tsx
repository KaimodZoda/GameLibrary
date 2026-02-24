'use client';

const SearchFilter = () => {
  return (
    <section className="py-8 bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search games by title..." 
                className="text-black w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
            </div>
          </div>
          <select className="text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
            <option>All Platforms</option>
            <option>PlayStation 5</option>
            <option>Xbox Series X</option>
            <option>Nintendo Switch</option>
            <option>PC</option>
          </select>
          <select className="text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
            <option>All Genres</option>
            <option>Action</option>
            <option>RPG</option>
            <option>Sports</option>
            <option>Strategy</option>
          </select>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            <i className="fas fa-filter mr-2"></i>Filter
          </button>
        </div>
      </div>
    </section>
  );
};

export default SearchFilter;
