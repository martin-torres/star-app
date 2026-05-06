import React from 'react';
import { MapPin, Clock, Users, Tag, ArrowLeft } from 'lucide-react';

interface RestaurantBrief {
  id: string;
  name: string;
  address?: string;
  hours?: { open?: string; close?: string };
  waitTime?: number;
  distance?: number;
  promos?: Array<{
    title: string;
    description: string;
    discount?: number;
  }>;
}

interface RestaurantInfoProps {
  restaurant: RestaurantBrief;
  primaryColor?: string;
  secondaryColor?: string;
  onContinue: () => void;
}

export const RestaurantInfoView: React.FC<RestaurantInfoProps> = ({
  restaurant,
  primaryColor = '#f59e0b',
  secondaryColor = '#ea580c',
  onContinue,
}) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-lg mx-auto space-y-4">
        {/* Restaurant Header */}
        <div className="bg-white rounded-3xl shadow-sm border p-6">
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
              {restaurant.address && (
                <div className="flex items-start gap-2 text-gray-600">
                  <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>{restaurant.address}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {restaurant.hours && (
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" style={{ color: primaryColor }} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Horario</p>
                    <p className="text-sm text-gray-600">
                      {restaurant.hours.open || 'N/A'} - {restaurant.hours.close || 'N/A'}
                    </p>
                  </div>
                </div>
              )}
              {restaurant.waitTime !== undefined && (
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" style={{ color: secondaryColor }} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Tiempo de espera</p>
                    <p className="text-sm text-gray-600">{restaurant.waitTime} min</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Promotions */}
        {restaurant.promos && restaurant.promos.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-bold text-gray-900">Promociones de Hoy</h2>
            </div>
            <div className="space-y-3">
              {restaurant.promos.map((promo, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border-2 border-orange-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-gray-900">{promo.title}</h3>
                    {promo.discount && promo.discount > 0 && (
                      <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold flex-shrink-0">
                        {promo.discount}% OFF
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{promo.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fixed bottom button */}
        <div className="sticky bottom-0 py-4 bg-gradient-to-t from-white via-white to-transparent">
          <button
            onClick={onContinue}
            className="w-full text-white py-4 rounded-2xl font-bold text-lg transition-all hover:brightness-90 shadow-lg"
            style={{ backgroundColor: primaryColor }}
          >
            Ver Menú y Seleccionar Mesa
          </button>
        </div>
      </div>
    </div>
  );
};
