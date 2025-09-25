<!-- src/components/CivilianRecruitmentModal.vue -->
<template>
  <v-card>
    <v-card-title class="bg-primary text-white">
      <v-icon left class="text-white">mdi-account-plus</v-icon>
      Recrutar Civil
    </v-card-title>
    
    <v-card-text class="pt-4">
      <div class="text-center mb-4">
        <v-avatar size="80" color="success">
          <span class="text-h4">👤</span>
        </v-avatar>
        <div class="text-h6 mt-2">{{ civilian.name }}</div>
        <div class="text-body-2">{{ civilian.type }} - Level {{ civilian.level }}</div>
      </div>

      <v-alert type="success" class="mb-4">
        <div class="text-body-1">
          <strong>🤝 Recrutamento Pacífico</strong>
        </div>
        <div class="text-body-2 mt-2">
          Sua bondade impressionou este civil. Você pode tentar convencê-lo a se juntar ao seu crew.
        </div>
      </v-alert>

      <!-- Estatísticas da Tentativa -->
      <v-row>
        <v-col cols="4">
          <div class="text-center">
            <div class="text-h5 text-success">
              {{ recruitmentInfo.chancePercentage }}%
            </div>
            <div class="text-caption">Chance</div>
          </div>
        </v-col>
        <v-col cols="4">
          <div class="text-center">
            <div class="text-h5 text-success">
              {{ recruitmentInfo.loyaltyPreview }}
            </div>
            <div class="text-caption">Loyalty</div>
          </div>
        </v-col>
        <v-col cols="4">
          <div class="text-center">
            <div class="text-h5 text-info">
              {{ recruiter.kindness }}
            </div>
            <div class="text-caption">Kindness</div>
          </div>
        </v-col>
      </v-row>

      <div class="text-center mt-4">
        <div class="text-body-2 text-grey">
          {{ recruitmentInfo.recommendation }}
        </div>
      </div>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        color="grey"
        @click="$emit('close')"
        :disabled="attempting"
      >
        Cancelar
      </v-btn>
      <v-btn
        color="success"
        @click="attemptRecruitment"
        :loading="attempting"
      >
        <v-icon left>mdi-handshake</v-icon>
        Recrutar
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { CivilianRecruitmentSystem } from '@/utils/civilianRecruitmentSystem'
import type { Character } from '@/utils/database'

// �� PROPS
interface Props {
  recruiter: Character
  civilian: Character
}

const props = defineProps<Props>()

// 🎯 EMITS
const emit = defineEmits<{
  close: []
  recruitmentSuccess: [civilian: Character, newLoyalty: number]
  recruitmentFailed: [civilian: Character]
}>()

// 🎯 REACTIVE DATA
const attempting = ref(false)

// �� COMPUTED
const recruitmentInfo = computed(async () => {
  return await CivilianRecruitmentSystem.getCivilianRecruitmentInfo(props.recruiter, props.civilian)
})

// 🎮 METHODS
const attemptRecruitment = async () => {
  attempting.value = true
  
  try {
    const result = await CivilianRecruitmentSystem.attemptCivilianRecruitment(
      props.recruiter,
      props.civilian
    )
    
    if (result.success) {
      emit('recruitmentSuccess', props.civilian, result.newLoyalty!)
    } else {
      emit('recruitmentFailed', props.civilian)
    }
    
  } catch (error) {
    console.error('Erro no recrutamento:', error)
    emit('recruitmentFailed', props.civilian)
  } finally {
    attempting.value = false
  }
}
</script>