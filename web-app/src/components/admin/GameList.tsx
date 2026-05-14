'use client';

import { useState, useEffect } from 'react';
import { Game } from '@/types/game';

interface GameListProps {
  refreshTrigger?: number;
}

const GameList = ({ refreshTrigger }: GameListProps) => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    fetchGames();
  }, [refreshTrigger]);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/games');
      const result = await response.json();
      
      if (result.success) {
        setGames(result.data);
      } else {
        setError('Failed to fetch games');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/games/${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setGames(games.filter(game => game.id !== id));
        setDeleteConfirm(null);
      } else {
        setError(result.message || 'Failed to delete game');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleEdit = (game: Game) => {
    setEditingGame(game);
  };

  const handleUpdate = async (updatedGame: Game) => {
    try {
      const response = await fetch(`/api/games/${updatedGame.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedGame),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setGames(games.map(game => 
          game.id === updatedGame.id ? result.data : game
        ));
        setEditingGame(null);
      } else {
        setError(result.message || 'Failed to update game');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  
  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-center items-center py-12">
          <i className="fas fa-spinner fa-spin text-2xl text-indigo-600"></i>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchGames}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          Manage Games ({games.length})
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Game
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Platform
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Genre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {games.map((game, index) => (
              <tr key={game.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`h-8 w-8 rounded bg-gradient-to-br ${game.gradient} mr-3`}></div>
                    <div className="text-sm font-medium text-gray-900">{game.title}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {game.platform}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {game.genre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    game.available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {game.available ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(game)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(game.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingGame && (
        <EditGameModal
          game={editingGame}
          onSave={handleUpdate}
          onCancel={() => setEditingGame(null)}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <DeleteConfirmModal
          gameTitle={games.find(g => g.id === deleteConfirm)?.title || ''}
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
};

// Edit Game Modal Component
const EditGameModal = ({ game, onSave, onCancel }: {
  game: Game;
  onSave: (game: Game) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState(game);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const platforms = ['PC', 'PlayStation 5', 'Xbox Series X', 'Nintendo Switch', 'PlayStation 4', 'Xbox One'];
  const genres = ['Action', 'Adventure', 'RPG', 'Strategy', 'Sports', 'Racing', 'Simulation', 'Puzzle', 'Fighting', 'Platformer', 'Shooter', 'Action-Adventure'];
  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    onSave(formData);
    setTimeout(() => setIsSubmitting(false), 1000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Game</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
            <select
              value={formData.platform}
              onChange={(e) => setFormData({...formData, platform: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {platforms.map(platform => (
                <option key={platform} value={platform}>{platform}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
            <select
              value={formData.genre}
              onChange={(e) => setFormData({...formData, genre: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.available}
                onChange={(e) => setFormData({...formData, available: e.target.checked})}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Available</span>
            </label>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteConfirmModal = ({ gameTitle, onConfirm, onCancel }: {
  gameTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-sm w-full p-6">
        <div className="flex items-center mb-4">
          <i className="fas fa-exclamation-triangle text-red-600 text-xl mr-3"></i>
          <h3 className="text-lg font-semibold text-gray-900">Delete Game</h3>
        </div>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete &quot;{gameTitle}&quot;? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameList;
