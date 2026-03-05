<!-- src/components/RemoveMemberConfirmationModal.vue -->
<template>
  <v-card class="remove-member-modal">
  <v-card-title class="text-center bg-red-darken-2 text-white">
    <v-icon left color="white" size="large">mdi-alert</v-icon>
    ⚠️ Confirmar Remoção
  </v-card-title>
  
  <v-card-text class="pa-6">
    
    <!-- AVISO PRINCIPAL -->
    <v-alert
      type="warning"
      variant="tonal"
      class="mb-4"
      prominent
    >
      <v-icon left>mdi-alert-circle</v-icon>
      <strong>Atenção!</strong> Esta ação não pode ser desfeita.
    </v-alert>
    
    <!-- INFORMAÇÕES DO MEMBRO -->
    <div class="member-info mb-4">
      <div class="d-flex align-center mb-3">
        <v-avatar size="60" :color="getTypeColor(member.type)" class="mr-3">
          <span class="text-h5">{{ getTypeIcon(member.type) }}</span>
        </v-avatar>
        <div>
          <div class="text-h5 mb-1">{{ member.name }}</div>
          <div class="d-flex gap-2 flex-wrap">
            <v-chip :color="getTypeColor(member.type)" size="small" variant="elevated">
              {{ member.type }}
            </v-chip>
            <v-chip color="blue-darken-2" size="small" variant="elevated">
              Level {{ member.level }}
            </v-chip>
            <v-chip v-if="member.position" color="green-darken-2" size="small" variant="elevated">
              {{ member.position }}
            </v-chip>
          </div>
        </div>
      </div>
    </div>
    
    <!-- CONSEQUÊNCIAS -->
    <v-card variant="outlined" color="orange-darken-1" class="mb-4">
      <v-card-text class="pa-4">
        <div class="text-h6 mb-3 text-orange-darken-3">
          <v-icon left color="orange-darken-3">mdi-information</v-icon>
          O que acontecerá:
        </div>
        
        <div class="consequences-list">
          <div class="consequence-item">
            <v-icon color="red-darken-2" class="mr-2">mdi-account-remove</v-icon>
            <span><strong>{{ member.name }}</strong> será removido(a) da tripulação</span>
          </div>
          
          <div class="consequence-item">
            <v-icon color="blue-darken-2" class="mr-2">mdi-map-marker</v-icon>
            <span>O personagem permanecerá na ilha atual</span>
          </div>
          
          <div class="consequence-item">
            <v-icon color="purple-darken-2" class="mr-2">mdi-account-group</v-icon>
            <span>Poderá ser recrutado novamente no futuro</span>
          </div>
          
          <div class="consequence-item">
            <v-icon color="green-darken-2" class="mr-2">mdi-chart-line</v-icon>
            <span>Stats e level serão mantidos</span>
          </div>
          
          <div class="consequence-item" v-if="member.loyalty !== undefined && member.loyalty < 0">
            <v-icon color="red-darken-2" class="mr-2">mdi-heart-broken</v-icon>
            <span class="text-red-darken-3">
              <strong>Loyalty baixa:</strong> Pode se tornar hostil
            </span>
          </div>
        </div>
      </v-card-text>
    </v-card>
    
    <!-- CONFIRMAÇÃO FINAL -->
    <v-card variant="outlined" color="red-darken-1">
      <v-card-text class="pa-4 text-center">
        <v-icon size="40" color="red-darken-2" class="mb-2">mdi-account-remove</v-icon>
        <div class="text-h6 text-red-darken-3 mb-2">
          Tem certeza que deseja remover <strong>{{ member.name }}</strong>?
        </div>
        <div class="text-body-2 text-red-darken-2">
          Esta ação é permanente e não pode ser desfeita.
        </div>
      </v-card-text>
    </v-card>
    
  </v-card-text>
  
  <!-- ✅ v-card-actions DENTRO do v-card -->
  <v-card-actions class="pa-4 bg-grey-lighten-4">
    <v-row no-gutters>
      <v-col cols="12" md="6" class="pr-md-2">
        <v-btn 
          color="grey-darken-1" 
          @click="$emit('cancel')" 
          variant="outlined"
          size="large"
          block
        >
          <v-icon left>mdi-cancel</v-icon>
          Cancelar
        </v-btn>
      </v-col>
      
      <v-col cols="12" md="6" class="pl-md-2 mt-3 mt-md-0">
        <v-btn 
          color="red-darken-2" 
          @click="$emit('confirm')" 
          variant="elevated"
          size="large"
          block
        >
          <v-icon left>mdi-check</v-icon>
          Confirmar Remoção
        </v-btn>
      </v-col>
    </v-row>
  </v-card-actions>
  
</v-card>
</template>

<script setup lang="ts">
import type { Character } from '@/utils/database'

interface Props {
  member: Character
}

defineProps<Props>()

defineEmits<{
  confirm: []
  cancel: []
}>()

// 🎨 HELPER FUNCTIONS
const getTypeColor = (type: string): string => {
  switch (type) {
    case 'Pirate': return 'red-darken-2'
    case 'Marine': return 'blue-darken-2'
    case 'Government': return 'orange-darken-2'
    case 'BountyHunter': return 'green-darken-2'
    default: return 'grey-darken-2'
  }
}

const getTypeIcon = (type: string): string => {
  switch (type) {
    case 'Pirate': return '��‍☠️'
    case 'Marine': return '⚓'
    case 'Government': return '🏛️'
    case 'BountyHunter': return '💰'
    default: return '❓'
  }
}
</script>

<style scoped>
/* RemoveMemberConfirmationModal - Danger confirmation */

.removal-modal-header {
  background: linear-gradient(135deg, rgba(198,40,40,0.15), rgba(139,0,0,0.1));
  border-bottom: 1px solid rgba(198,40,40,0.3);
  padding: 16px 20px;
}

.removal-title {
  font-family: Georgia, serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: #EF5350;
  letter-spacing: 0.04em;
}

.removal-member-info {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 10px;
  padding: 14px;
  margin: 12px 0;
  text-align: center;
}

.removal-member-name {
  font-family: Georgia, serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #E8D5A3;
  margin-bottom: 4px;
}

.removal-warning-text {
  font-size: 0.85rem;
  color: #EF9A9A;
  margin-top: 8px;
}

.confirm-remove-btn {
  background: linear-gradient(135deg, #B71C1C, #C62828) !important;
  color: #fff !important;
  font-weight: 700 !important;
  letter-spacing: 0.05em !important;
  box-shadow: 0 4px 14px rgba(198,40,40,0.3) !important;
}
</style>