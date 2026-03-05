// src/utils/inventorySystem.ts
import { db } from './database'
import type { Character, Item } from './database'

export type EquipSlot = 'weapon' | 'clothing' | 'helmet' | 'gloves' | 'boots'

export interface StatBonuses {
  attack: number
  defense: number
  speed: number
  skill: number
  intelligence: number
}

export interface StoreEntry {
  storeId: number
  item: Item
  price: number
}

export interface TheftResult {
  stolenItems: Item[]
  message: string
}

/** Entrada do baú da tripulação: entryId = PK da tabela inventories */
export interface InventorySlot {
  entryId: number
  item: Item
}

const EQUIP_SLOTS: EquipSlot[] = ['weapon', 'clothing', 'helmet', 'gloves', 'boots']

// Preços base por classe (mesmos usados na loja)
const BASE_PRICE: Record<string, number> = {
  F: 6_000_000, E: 30_000_000, D: 120_000_000,
  C: 450_000_000, B: 1_500_000_000, A: 4_500_000_000,
}

export class InventorySystem {
  // ── Baú da Tripulação ────────────────────────────────────────────────────────

  /** Todos os itens no baú da tripulação (sem filtros). Inclui duplicatas. */
  static async getCrewChest(crewId: number): Promise<InventorySlot[]> {
    const entries = await db.inventories.where('crewId').equals(crewId).toArray()
    if (entries.length === 0) return []
    const items = await db.items.bulkGet(entries.map(e => e.itemId))
    return entries
      .map((e, i) => ({ entryId: e.id!, item: items[i]! }))
      .filter(s => s.item != null)
  }

  /**
   * Itens do baú disponíveis para um personagem.
   * Para cada itemId, conta quantas cópias existem no baú e quantas outros membros
   * já estão usando — só disponibiliza cópias excedentes.
   */
  static async getAvailableItemsForChar(crewId: number, characterId: number): Promise<InventorySlot[]> {
    const [chestSlots, members] = await Promise.all([
      this.getCrewChest(crewId),
      db.characters.where('crewId').equals(crewId).toArray(),
    ])

    const others = members.filter(m => m.id !== characterId)

    // Conta quantas vezes cada itemId está equipado por OUTROS membros
    const usedByOthers = new Map<number, number>()
    for (const member of others) {
      for (const slot of EQUIP_SLOTS) {
        const id = member[slot]
        if (id != null) usedByOthers.set(id, (usedByOthers.get(id) ?? 0) + 1)
      }
    }

    // Conta o total de cópias por itemId no baú
    const totalCopies = new Map<number, number>()
    for (const s of chestSlots) {
      const id = s.item.id!
      totalCopies.set(id, (totalCopies.get(id) ?? 0) + 1)
    }

    // Para cada slot do baú, libera apenas se ainda há cópias disponíveis
    const releasedCopies = new Map<number, number>() // quantas já "alocamos" nesta iteração
    const result: InventorySlot[] = []
    for (const slot of chestSlots) {
      const id = slot.item.id!
      const used = usedByOthers.get(id) ?? 0
      const released = releasedCopies.get(id) ?? 0
      const total = totalCopies.get(id) ?? 0
      if (released + used < total) {
        releasedCopies.set(id, released + 1)
        result.push(slot)
      }
    }
    return result
  }

  /** Inventário por membro: cada membro vê o baú filtrado pelos itens disponíveis para ele. */
  static async getCrewInventory(
    crewId: number,
  ): Promise<{ character: Character; items: InventorySlot[] }[]> {
    const members = await db.characters.where('crewId').equals(crewId).toArray()
    return Promise.all(
      members.map(async char => ({
        character: char,
        items: await this.getAvailableItemsForChar(crewId, char.id!),
      })),
    )
  }

  // ── Equipamento ────────────────────────────────────────────────────────────

  static async equipItem(
    characterId: number,
    itemId: number,
    slot: EquipSlot,
  ): Promise<{ success: boolean; message: string }> {
    const character = await db.characters.get(characterId)
    if (!character) return { success: false, message: 'Personagem não encontrado.' }

    const crewId = character.crewId
    if (!crewId) return { success: false, message: 'Personagem não tem tripulação.' }

    const item = await db.items.get(itemId)
    if (!item) return { success: false, message: 'Item não encontrado.' }

    // Item deve estar no baú da tripulação
    const owned = await db.inventories
      .where('crewId')
      .equals(crewId)
      .and(e => e.itemId === itemId)
      .first()
    if (!owned) return { success: false, message: 'Item não está no baú da tripulação.' }

    // Verificar disponibilidade: cópias no baú vs. cópias em uso por outros
    const members = await db.characters.where('crewId').equals(crewId).toArray()
    const others = members.filter(m => m.id !== characterId)
    let othersUsing = 0
    for (const member of others) {
      if (EQUIP_SLOTS.some(s => member[s] === itemId)) othersUsing++
    }
    const totalCopies = await db.inventories
      .where('crewId').equals(crewId).and(e => e.itemId === itemId).count()
    if (othersUsing >= totalCopies) {
      return { success: false, message: 'Todas as cópias deste item já estão em uso.' }
    }

    // Slot deve ser compatível com o tipo do item
    if (item.type !== slot) {
      return { success: false, message: `Este item é do tipo "${item.type}", não "${slot}".` }
    }

    // Requisito de level
    if (character.level < item.requirements.level) {
      return {
        success: false,
        message: `Level insuficiente. Requerido: ${item.requirements.level}.`,
      }
    }

    // Requisito de tipo de personagem
    if (item.requirements.characterType && item.requirements.characterType.length > 0) {
      const ok = item.requirements.characterType.includes(character.type as any)
      if (!ok) {
        return {
          success: false,
          message: `Item exclusivo para: ${item.requirements.characterType.join(', ')}.`,
        }
      }
    }

    // Requisito de estilo de combate
    // Usa findIndex no array ordenado para obter a posição real de cada ID,
    // depois Math.floor(pos/3) = grupo lógico (Combatente/Espadachim/Atirador/Suporte).
    if (item.requirements.styleCombatId && item.requirements.styleCombatId.length > 0) {
      const allStyles = await db.styleCombats.orderBy('id').toArray()
      const charStyleIndex = allStyles.findIndex(s => s.id === character.styleCombatId)
      const charGroup = charStyleIndex >= 0 ? Math.floor(charStyleIndex / 3) : -1
      const itemGroups = new Set<number>()
      for (const id of item.requirements.styleCombatId) {
        const idx = allStyles.findIndex(s => s.id === id)
        if (idx >= 0) itemGroups.add(Math.floor(idx / 3))
      }
      if (!itemGroups.has(charGroup)) {
        return { success: false, message: 'Seu estilo de combate não permite usar este item.' }
      }
    }

    await db.characters.update(characterId, { [slot]: itemId })
    return { success: true, message: `${item.name} equipado com sucesso!` }
  }

  static async unequipItem(characterId: number, slot: EquipSlot): Promise<void> {
    await db.characters.update(characterId, { [slot]: null })
  }

  // ── Venda de itens ─────────────────────────────────────────────────────────

  /**
   * Vende uma entrada específica do baú (por entryId) para a loja.
   * O item não pode estar equipado por nenhum membro.
   * Retorna 50% do preço base do item para o treasury da tripulação.
   */
  static async sellItem(
    crewId: number,
    entryId: number,
  ): Promise<{ success: boolean; message: string; berryGained: number }> {
    const crew = await db.crews.get(crewId)
    if (!crew) return { success: false, message: 'Tripulação não encontrada.', berryGained: 0 }

    const entry = await db.inventories.get(entryId)
    if (!entry || entry.crewId !== crewId) {
      return { success: false, message: 'Item não encontrado no baú.', berryGained: 0 }
    }

    const item = await db.items.get(entry.itemId)
    if (!item) return { success: false, message: 'Item não encontrado.', berryGained: 0 }

    // Verificar que o item não está equipado por nenhum membro
    // (só bloqueia se este é o único exemplar equipado)
    const members = await db.characters.where('crewId').equals(crewId).toArray()
    const copies = await db.inventories
      .where('crewId').equals(crewId).and(e => e.itemId === item.id!).count()
    let equipped = 0
    for (const member of members) {
      if (EQUIP_SLOTS.some(s => member[s] === item.id)) equipped++
    }
    if (equipped >= copies) {
      return {
        success: false,
        message: `${item.name} está equipado. Desequipe antes de vender.`,
        berryGained: 0,
      }
    }

    const sellPrice = Math.round((BASE_PRICE[item.class] ?? 6_000_000) * (0.5 + item.rarity) * 0.5)

    await db.inventories.delete(entryId)
    await db.crews.update(crewId, { treasury: crew.treasury + sellPrice })

    return {
      success: true,
      message: `${item.name} vendido por ${sellPrice.toLocaleString('pt-BR')} Berry!`,
      berryGained: sellPrice,
    }
  }

  // ── Bônus de itens ─────────────────────────────────────────────────────────

  // Multiplicadores de classe: escalam os bônus dos itens proporcionalmente à
  // curva de distribuição de pontos do jogador (level 11 ≈ 193 pts, level 100 ≈ 5000+ pts).
  static readonly CLASS_MULT: Record<string, number> = {
    F: 3, E: 3, D: 4, C: 5, B: 6, A: 7, S: 8,
  }

  static async calculateItemBonuses(character: Character): Promise<StatBonuses> {
    const bonuses: StatBonuses = { attack: 0, defense: 0, speed: 0, skill: 0, intelligence: 0 }

    const equippedIds = EQUIP_SLOTS.map(s => character[s]).filter(id => id != null) as number[]
    if (equippedIds.length === 0) return bonuses

    const items = await db.items.bulkGet(equippedIds)
    for (const item of items) {
      if (!item) continue
      const inf = item.statsInfluence
      const r = item.rarity
      const m = InventorySystem.CLASS_MULT[item.class] ?? 3
      if (inf.attack) bonuses.attack += Math.round(inf.attack * r * m)
      if (inf.defense) bonuses.defense += Math.round(inf.defense * r * m)
      if (inf.speed) bonuses.speed += Math.round(inf.speed * r * m)
      if (inf.skill) bonuses.skill += Math.round(inf.skill * r * m)
      if (inf.intelligence) bonuses.intelligence += Math.round(inf.intelligence * r * m)
    }
    return bonuses
  }

  static applyBonusesToStats(
    stats: Character['stats'],
    bonuses: StatBonuses,
  ): Character['stats'] {
    return {
      ...stats,
      attack: stats.attack + bonuses.attack,
      defense: stats.defense + bonuses.defense,
      speed: stats.speed + bonuses.speed,
      skill: stats.skill + bonuses.skill,
      intelligence: stats.intelligence + bonuses.intelligence,
    }
  }

  // ── Roubo pós-batalha ──────────────────────────────────────────────────────

  static async rollItemTheft(winnerId: number, loserId: number): Promise<TheftResult> {
    const [winner, loser] = await Promise.all([
      db.characters.get(winnerId),
      db.characters.get(loserId),
    ])
    if (!winner || !loser) return { stolenItems: [], message: '' }

    const levelDiff = Math.max(0, winner.level - loser.level)
    const equippedTheftChance = Math.min(0.50, 0.20 + levelDiff * 0.01)
    const inventoryTheftChance = 0.15
    const MAX_STOLEN = 3

    const stolenItems: Item[] = []
    const winnerCrewId = winner.crewId
    const loserCrewId = loser.crewId

    for (const slot of EQUIP_SLOTS) {
      if (stolenItems.length >= MAX_STOLEN) break
      const itemId = loser[slot]
      if (!itemId) continue
      if (Math.random() >= equippedTheftChance) continue

      const item = await db.items.get(itemId)
      if (!item) continue

      await db.characters.update(loserId, { [slot]: null })

      if (loserCrewId) {
        const entry = await db.inventories
          .where('crewId').equals(loserCrewId).and(e => e.itemId === itemId).first()
        if (entry) await db.inventories.delete(entry.id!)
      }

      if (winnerCrewId) {
        await db.inventories.add({ crewId: winnerCrewId, itemId, acquiredAt: new Date() })
      }

      stolenItems.push(item)
    }

    if (stolenItems.length < MAX_STOLEN && loserCrewId && Math.random() < inventoryTheftChance) {
      const loserBag = await db.inventories.where('crewId').equals(loserCrewId).toArray()
      if (loserBag.length > 0) {
        const entry = loserBag[Math.floor(Math.random() * loserBag.length)]
        const item = await db.items.get(entry.itemId)
        if (item) {
          await db.inventories.delete(entry.id!)
          if (winnerCrewId) {
            await db.inventories.add({ crewId: winnerCrewId, itemId: item.id!, acquiredAt: new Date() })
          }
          stolenItems.push(item)
        }
      }
    }

    if (stolenItems.length === 0) return { stolenItems: [], message: '' }
    return {
      stolenItems,
      message: `⚔️ ${winner.name} tomou: ${stolenItems.map(i => i.name).join(', ')}`,
    }
  }

  // ── IA de inventário (NPCs) ────────────────────────────────────────────────

  private static itemScore(item: Item): number {
    const inf = item.statsInfluence
    return (
      ((inf.attack ?? 0) + (inf.defense ?? 0) + (inf.speed ?? 0) +
        (inf.skill ?? 0) + (inf.intelligence ?? 0)) * item.rarity
    )
  }

  static async optimizeEquipment(characterId: number): Promise<void> {
    const character = await db.characters.get(characterId)
    if (!character?.crewId) return

    const bagSlots = await this.getAvailableItemsForChar(character.crewId, characterId)
    if (bagSlots.length === 0) return

    // Re-fetch character para ter slots atualizados (caso chamado em loop)
    let current = character
    for (const slot of EQUIP_SLOTS) {
      current = (await db.characters.get(characterId)) ?? current

      const currentId = current[slot] as number | null
      const currentItem = currentId ? await db.items.get(currentId) : null
      const currentScore = currentItem ? this.itemScore(currentItem) : 0

      const candidates = bagSlots.filter(s => s.item.type === slot)
      let bestScore = currentScore
      let bestSlot: InventorySlot | null = null

      for (const s of candidates) {
        const score = this.itemScore(s.item)
        if (score > bestScore) {
          bestScore = score
          bestSlot = s
        }
      }

      if (bestSlot) {
        await this.equipItem(characterId, bestSlot.item.id!, slot)
      }
    }
  }

  static async npcBuyBestItem(
    characterId: number,
    crewId: number,
    islandId: number,
  ): Promise<boolean> {
    const crew = await db.crews.get(crewId)
    if (!crew || crew.treasury <= 0) return false

    const character = await db.characters.get(characterId)
    if (!character) return false

    const storeEntries = await this.getIslandStore(islandId)
    if (storeEntries.length === 0) return false

    const chestSlots = await this.getCrewChest(crewId)
    const ownedItemIds = new Set(chestSlots.map(s => s.item.id!))

    let bestGain = 0
    let bestEntry: StoreEntry | null = null

    for (const entry of storeEntries) {
      if (entry.price > crew.treasury) continue
      // NPCs não compram duplicatas de itens únicos
      if (entry.item.unique && ownedItemIds.has(entry.item.id!)) continue

      const item = entry.item
      const itemS = this.itemScore(item)
      const currentEquippedId = character[item.type as EquipSlot] as number | null
      const currentEquipped = currentEquippedId ? await db.items.get(currentEquippedId) : null
      const gain = itemS - (currentEquipped ? this.itemScore(currentEquipped) : 0)

      if (gain > bestGain) {
        bestGain = gain
        bestEntry = entry
      }
    }

    if (!bestEntry) return false
    const result = await this.buyItem(crewId, bestEntry.storeId)
    return result.success
  }

  // ── Melhor Compra (jogador) ────────────────────────────────────────────────

  /**
   * Compra automaticamente a melhor combinação de itens da loja para toda a tripulação,
   * priorizando Capitão → membros por level decrescente, dentro do orçamento disponível.
   * Após cada membro, chama optimizeEquipment para equipar o que foi comprado.
   */
  static async bestBuyForCrew(
    crewId: number,
    islandId: number,
  ): Promise<{
    purchased: Array<{ memberName: string; itemName: string; slot: EquipSlot; price: number }>
    totalSpent: number
    budgetAfter: number
  }> {
    const crew = await db.crews.get(crewId)
    if (!crew) return { purchased: [], totalSpent: 0, budgetAfter: 0 }
    let remainingBudget = crew.treasury

    // Capitão primeiro, depois por level decrescente
    const members = await db.characters.where('crewId').equals(crewId).toArray()
    const captain = members.find(m => m.id === crew.captainId)
    const others = members
      .filter(m => m.id !== crew.captainId)
      .sort((a, b) => b.level - a.level)
    const sortedMembers = captain ? [captain, ...others] : others

    const storeEntries = await this.getIslandStore(islandId)
    if (storeEntries.length === 0) return { purchased: [], totalSpent: 0, budgetAfter: remainingBudget }

    const allStyles = await db.styleCombats.orderBy('id').toArray()

    // Pontuação efetiva: statsInfluence × rarity × CLASS_MULT (reflete bônus real)
    const effectiveScore = (item: Item): number => {
      const inf = item.statsInfluence
      const m = this.CLASS_MULT[item.class] ?? 3
      return (
        ((inf.attack ?? 0) + (inf.defense ?? 0) + (inf.speed ?? 0) +
          (inf.skill ?? 0) + (inf.intelligence ?? 0)) *
        item.rarity *
        m
      )
    }

    const canMemberEquip = (item: Item, member: Character): boolean => {
      if (member.level < item.requirements.level) return false
      if (
        item.requirements.characterType?.length &&
        !item.requirements.characterType.includes(member.type as any)
      ) return false
      if (item.requirements.styleCombatId?.length) {
        const charIdx = allStyles.findIndex(s => s.id === member.styleCombatId)
        const charGroup = charIdx >= 0 ? Math.floor(charIdx / 3) : -1
        const itemGroups = new Set<number>()
        for (const id of item.requirements.styleCombatId) {
          const idx = allStyles.findIndex(s => s.id === id)
          if (idx >= 0) itemGroups.add(Math.floor(idx / 3))
        }
        if (!itemGroups.has(charGroup)) return false
      }
      return true
    }

    const purchased: Array<{ memberName: string; itemName: string; slot: EquipSlot; price: number }> = []
    let totalSpent = 0

    for (const member of sortedMembers) {
      // Re-fetch para ter slots atualizados após optimizeEquipment do membro anterior
      const current = (await db.characters.get(member.id!)) ?? member

      for (const slot of EQUIP_SLOTS) {
        const currentItemId = current[slot] as number | null
        const currentItem = currentItemId ? await db.items.get(currentItemId) : null
        const currentScore = currentItem ? effectiveScore(currentItem) : 0

        let bestEntry: StoreEntry | null = null
        let bestScore = currentScore // só compra se for melhor que o atual

        for (const entry of storeEntries) {
          if (entry.item.type !== slot) continue
          if (entry.price > remainingBudget) continue
          if (!canMemberEquip(entry.item, current)) continue
          if (entry.item.unique) {
            const alreadyOwned = await db.inventories
              .where('crewId')
              .equals(crewId)
              .and(e => e.itemId === entry.item.id!)
              .first()
            if (alreadyOwned) continue
          }
          const score = effectiveScore(entry.item)
          if (score > bestScore) {
            bestScore = score
            bestEntry = entry
          }
        }

        if (bestEntry) {
          const result = await this.buyItem(crewId, bestEntry.storeId)
          if (result.success) {
            remainingBudget -= bestEntry.price
            totalSpent += bestEntry.price
            purchased.push({
              memberName: current.name,
              itemName: bestEntry.item.name,
              slot,
              price: bestEntry.price,
            })
          }
        }
      }

      // Equipar imediatamente os itens comprados para este membro antes de avançar
      if (purchased.some(p => p.memberName === current.name)) {
        await this.optimizeEquipment(current.id!)
      }
    }

    const updatedCrew = await db.crews.get(crewId)
    return {
      purchased,
      totalSpent,
      budgetAfter: updatedCrew?.treasury ?? 0,
    }
  }

  // ── Loja ───────────────────────────────────────────────────────────────────

  static readonly STORE_REFRESH_INTERVAL = 60 * 60 * 1000

  private static dbKey(islandId: number): string {
    return `storeLastRefresh_${islandId}`
  }

  private static async getLastRefresh(islandId: number): Promise<number> {
    const entry = await db.gameState.where('key').equals(this.dbKey(islandId)).first()
    return entry?.value ?? 0
  }

  static async getTimeUntilRefresh(islandId: number): Promise<number> {
    const last = await this.getLastRefresh(islandId)
    if (!last) return 0
    return Math.max(0, this.STORE_REFRESH_INTERVAL - (Date.now() - last))
  }

  static async refreshIslandStore(islandId: number): Promise<void> {
    const island = await db.islands.get(islandId)
    if (!island) return

    const allItems = await db.items.filter(item => !item.unique).toArray()

    const classesForDifficulty = (d: number): string[] => {
      if (d <= 5)  return ['F', 'E']
      if (d <= 10) return ['E', 'D']
      if (d <= 15) return ['D', 'C']
      if (d <= 20) return ['C', 'B']
      return ['B', 'A']
    }

    const allowed = classesForDifficulty(island.difficulty)
    const eligible = allItems.filter(item => allowed.includes(item.class))
    const shuffled = [...eligible].sort(() => Math.random() - 0.5)
    const count = Math.floor(Math.random() * 7) + 12
    const selected = shuffled.slice(0, Math.min(count, shuffled.length))

    await db.stores.where('currentIslandId').equals(islandId).delete()
    if (selected.length > 0) {
      await db.stores.bulkAdd(
        selected.map(item => ({
          currentIslandId: islandId,
          itemId: item.id!,
          price: Math.round((BASE_PRICE[item.class] ?? 5_000_000) * (0.5 + item.rarity)),
        })),
      )
    }

    // Persistir timestamp no IndexedDB (sincronizado com o resto dos dados do jogo)
    const key = this.dbKey(islandId)
    const existing = await db.gameState.where('key').equals(key).first()
    if (existing) {
      await db.gameState.update(existing.id!, { value: Date.now(), updatedAt: new Date() })
    } else {
      await db.gameState.add({ key, value: Date.now(), updatedAt: new Date() })
    }
  }

  static async checkAndRefreshStore(
    islandId: number,
  ): Promise<{ refreshed: boolean; nextRefreshIn: number }> {
    const timeLeft = await this.getTimeUntilRefresh(islandId)
    if (timeLeft === 0) {
      await this.refreshIslandStore(islandId)
      return { refreshed: true, nextRefreshIn: this.STORE_REFRESH_INTERVAL }
    }
    return { refreshed: false, nextRefreshIn: timeLeft }
  }

  static async getIslandStore(islandId: number): Promise<StoreEntry[]> {
    const storeEntries = await db.stores.where('currentIslandId').equals(islandId).toArray()
    if (storeEntries.length === 0) return []
    const items = await db.items.bulkGet(storeEntries.map(e => e.itemId))
    return storeEntries
      .map((entry, i) => ({ storeId: entry.id!, item: items[i]!, price: entry.price }))
      .filter(e => e.item != null)
  }

  static async buyItem(
    crewId: number,
    storeId: number,
  ): Promise<{ success: boolean; message: string }> {
    const crew = await db.crews.get(crewId)
    if (!crew) return { success: false, message: 'Tripulação não encontrada.' }

    const storeEntry = await db.stores.get(storeId)
    if (!storeEntry) return { success: false, message: 'Item não disponível na loja.' }

    if (crew.treasury < storeEntry.price) {
      return {
        success: false,
        message: `Berry insuficiente. Necessário: ${storeEntry.price.toLocaleString('pt-BR')} Berry.`,
      }
    }

    const item = await db.items.get(storeEntry.itemId)
    if (!item) return { success: false, message: 'Item não encontrado.' }

    if (item.unique) {
      const alreadyOwned = await db.inventories
        .where('crewId').equals(crewId).and(e => e.itemId === storeEntry.itemId).first()
      if (alreadyOwned) return { success: false, message: 'A tripulação já possui este item único.' }
    }

    await db.crews.update(crewId, { treasury: crew.treasury - storeEntry.price })
    await db.inventories.add({ crewId, itemId: storeEntry.itemId, acquiredAt: new Date() })

    return { success: true, message: `${item.name} comprado para o baú da tripulação!` }
  }
}
