import React from 'react';
import { POWER_UP_DEFINITIONS, POWER_UP_KEYS } from '@/components/kahoot/powerUps';

export default function KahootPowerUpShop({ coins, inventory, onBuy, disabled }) {
  return (
    <div className="rounded-[28px] bg-white/14 p-4 shadow-2xl backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Power-up shop</p>
          <h3 className="text-xl font-black text-white">Spend your game coins</h3>
        </div>
        <div className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-black text-yellow-950">
          {coins || 0} coins
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {POWER_UP_KEYS.map((key) => {
          const item = POWER_UP_DEFINITIONS[key];
          const affordable = (coins || 0) >= item.cost;
          return (
            <div key={key} className="rounded-3xl bg-white/10 p-4 text-white">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-2xl">{item.icon}</span>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black uppercase tracking-wide">
                  x{inventory?.[key] || 0}
                </span>
              </div>
              <p className="text-lg font-black">{item.label}</p>
              <p className="mt-1 text-sm text-white/75">{item.cost} coins</p>
              <button
                onClick={() => onBuy(key)}
                disabled={disabled || !affordable}
                className="mt-4 w-full rounded-2xl bg-white px-4 py-2 text-sm font-black text-[#5b2b86] hover:bg-white/90 disabled:opacity-40"
              >
                Buy now
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}