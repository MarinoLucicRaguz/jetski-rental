import React from 'react';
import Modal from '../ui/Modal';
import { Location, Jetski, User } from '@prisma/client';

interface LocationDetailsModalProps {
  location: Location;
  jetskis: Jetski[];
  users: User[];
  onClose: () => void;
}

const LocationDetailsModal: React.FC<LocationDetailsModalProps> = ({ location, jetskis, users, onClose }) => {
  return (
    <Modal onClose={onClose}>
      <div className="p-15">
        <h2 className="text-2xl font-bold mb-4">{location.location_name}</h2>
        <p className="mb-4">Manager: {location.location_manager_id ? users.find(user => user.user_id === location.location_manager_id)?.name || 'N/A' : 'N/A'}</p>
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-2">Jetskis</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currently rented</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {jetskis.map(jetski => (
                jetski.jetski_status === "AVAILABLE" && (
                    <tr key={jetski.jetski_id}>
                        <td className="px-6 py-4 whitespace-nowrap">{jetski.jetski_registration}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{jetski.jetski_model}</td>
                    </tr>
                )
            ))}
            </tbody>
          </table>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Workers</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.user_id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.user_role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
};

export default LocationDetailsModal;
