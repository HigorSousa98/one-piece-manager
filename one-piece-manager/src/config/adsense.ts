// src/config/adsense.ts
export const ADSENSE_CONFIG = {
  // ✅ SEU CLIENT ID (você recebe do AdSense)
  CLIENT_ID: 'ca-pub-1234567890123456', // SUBSTITUA pelo seu

  // ✅ SLOTS DE ANÚNCIOS (você cria no painel do AdSense)
  AD_SLOTS: {
    // Banner horizontal topo
    DASHBOARD_TOP_BANNER: '1234567890',

    // Sidebar vertical
    DASHBOARD_SIDEBAR_VERTICAL: '2345678901',

    // Sidebar quadrado
    DASHBOARD_SIDEBAR_SQUARE: '3456789012',

    // Banner horizontal meio
    DASHBOARD_MIDDLE_BANNER: '4567890123',

    // Banner horizontal final
    DASHBOARD_BOTTOM_BANNER: '5678901234',

    // Outros slots para outras páginas
    BATTLE_SIDEBAR: '6789012345',
    CREW_BANNER: '7890123456',
    TRAINING_SQUARE: '8901234567',
  },

  // ✅ CONFIGURAÇÕES POR AMBIENTE
  ENABLED: {
    development: false, // Não mostrar anúncios em dev
    production: true, // Mostrar apenas em produção
  },
}
