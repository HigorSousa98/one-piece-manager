// src/stores/characterStore.ts
import { defineStore } from 'pinia'
import { db, Character, Crew, Ship, DevilFruit, StyleCombat } from '@/utils/database'
import { GenerationConfig } from '@/utils/generationConfig'
import { WorldResetSystem } from '@/utils/worldResetSystem'

export const useCharacterStore = defineStore('character', {
  state: () => ({
    playerCharacter: null as Character | null,
    crewMembers: [] as Character[],
    availableNPCs: [] as Character[],
    isLoading: false,
    playerCrew: null as Crew | null,
    playerShip: null as Ship | null, 
    shipFactor: 0,
  }),

  getters: {
    playerStats: (state) => state.playerCharacter?.stats,
    playerLevel: (state) => state.playerCharacter?.level || 1,
    playerBounty: (state) => state.playerCharacter?.bounty || 0,

  },

  actions: {
    async loadCrewMembers(crewId: number) {
      this.crewMembers = await db.characters.where('crewId').equals(crewId).toArray()
    },
    async loadDevilFruit(devilFruit: number): Promise<DevilFruit | null> {
      return await db.devilFruits.get(devilFruit) || null
    },
    async loadStyleCombat(combat: number): Promise<StyleCombat | null> {
      return await db.styleCombats.get(combat) || null
    },
    // src/stores/characterStore.ts - Método para carregar jogador
    async loadPlayerCharacter() {
      this.isLoading = true
      try {
          console.log('👤 Carregando personagem do jogador...')
          const shipFactor = GenerationConfig.createEpic().shipFactor
          this.shipFactor = shipFactor
          const allCharacters = await db.characters.toArray()
          const player = allCharacters.find(char => char.isPlayer === 1)
          if (player) {
              this.playerCharacter = player
              console.log('✅ Personagem carregado:', player.name)
              const crews = await db.crews.toArray()
              const crew = crews.find(crew => crew.id === player.crewId)
              if(crew){
                  this.playerCrew = crew
                  console.log('✅ Tripulação carregada:', crew.name)

                  const ship = await db.ships
                  .where('crewId')
                  .equals(crew.id || 0)
                  .first()
                
                  this.playerShip = ship || null
              }
              else{
                  console.log('❌ Nenhuma tripulação do jogador encontrado')
                  this.playerCrew = null
              }
              

          } else {
          console.log('❌ Nenhum personagem do jogador encontrado')
          this.playerCharacter = null
          }

        
        
      } catch (error) {
        console.error('❌ Erro ao carregar personagem do jogador:', error)
        this.playerCharacter = null
      } finally {
        this.isLoading = false
      }
    },
    async loadPlayerShip() {
      try {
        if (!this.playerCrew?.id) return null
        
        const ship = await db.ships
          .where('crewId')
          .equals(this.playerCrew.id)
          .first()
        
        this.playerShip = ship || null
        
      } catch (error) {
        console.error('❌ Erro ao carregar navio do jogador:', error)
        return null
      }
    },
    async loadPlayerCrew() {
      try {
        console.log('🔄 CharacterStore - Carregando player crew...')
        
        if (!this.playerCharacter?.crewId) {
          console.error('❌ CharacterStore - Player character não tem crewId')
          return
        }
        
        const crew = await db.crews.get(this.playerCharacter.crewId)
        if (crew) {
          this.playerCrew = crew
          console.log('✅ CharacterStore - Player crew carregado:', {
            id: crew.id,
            name: crew.name,
            currentIsland: crew.currentIsland
          })
        } else {
          console.error('❌ CharacterStore - Crew não encontrado:', this.playerCharacter.crewId)
        }
      } catch (error) {
        console.error('❌ CharacterStore - Erro ao carregar player crew:', error)
      }
    },
  }
})