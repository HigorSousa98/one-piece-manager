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

export interface SellAllResult {
  success: boolean
  message: string
  itemsSold: number
  berryGained: number
}

const EQUIP_SLOTS: EquipSlot[] = ['weapon', 'clothing', 'helmet', 'gloves', 'boots']

// Preços base por classe
const BASE_PRICE: Record<string, number> = {
  F: 6_000_000, E: 30_000_000, D: 120_000_000,
  C: 450_000_000, B: 1_500_000_000, A: 4_500_000_000,
}

export class InventorySystem {

  // ── Rarity generation ────────────────────────────────────────────────────────

  /**
   * Generates a unique rarity value (0–100) for a new item instance.
   * Higher rarity is rarer: distribution is weighted toward lower values.
   * Class determines the achievable range, making high-class items always more powerful.
   */
  static generateInstanceRarity(itemClass: string): number {
    const ranges: Record<string, [number, number]> = {
      S: [80, 100], A: [65, 95], B: [50, 90],
      C: [35, 80], D: [20, 70], E: [10, 60], F: [1, 40],
    }
    const [min, max] = ranges[itemClass] ?? [1, 100]
    // Power-law distribution: Math.pow(random, 1.8) biases toward lower values
    const weighted = Math.pow(Math.random(), 1.8)
    return Math.round(min + weighted * (max - min))
  }

  /**
   * Creates a new item instance by cloning a template item and rolling a unique rarity.
   * The instance has `templateId` set to the template's id to distinguish it.
   */
  static async createItemInstance(templateItem: Item): Promise<Item> {
    const rarity = templateItem.unique
      ? 100 // unique/legendary items always have max rarity
      : this.generateInstanceRarity(templateItem.class)

    const newId = await db.items.add({
      name: templateItem.name,
      description: templateItem.description,
      type: templateItem.type,
      subtype: templateItem.subtype,
      class: templateItem.class,
      rarity,
      templateId: templateItem.id!,
      statsInfluence: { ...templateItem.statsInfluence },
      requirements: { ...templateItem.requirements },
      isStackable: templateItem.isStackable,
      maxStack: templateItem.maxStack,
      weight: templateItem.weight,
      imageUrl: templateItem.imageUrl,
      unique: templateItem.unique,
      lore: templateItem.lore,
      isBreakable: templateItem.isBreakable,
      durability: templateItem.durability,
      createdAt: new Date(),
    })

    return (await db.items.get(newId))!
  }

  // ── Baú da Tripulação ────────────────────────────────────────────────────────

  /** Todos os itens no baú da tripulação (sem filtros). */
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
   * Cada item é uma instância única — disponível se não equipado por outro membro.
   */
  static async getAvailableItemsForChar(crewId: number, characterId: number): Promise<InventorySlot[]> {
    const [chestSlots, members] = await Promise.all([
      this.getCrewChest(crewId),
      db.characters.where('crewId').equals(crewId).toArray(),
    ])

    const others = members.filter(m => m.id !== characterId)

    // IDs de itens equipados por OUTROS membros
    const equippedByOthers = new Set<number>()
    for (const member of others) {
      for (const slot of EQUIP_SLOTS) {
        const id = member[slot]
        if (id != null) equippedByOthers.add(id)
      }
    }

    // Cada item é uma instância única: disponível se não estiver equipado por outro
    return chestSlots.filter(s => !equippedByOthers.has(s.item.id!))
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
      .where('crewId').equals(crewId).and(e => e.itemId === itemId).first()
    if (!owned) return { success: false, message: 'Item não está no baú da tripulação.' }

    // Com instâncias únicas: verificar se não está equipado por outro
    const members = await db.characters.where('crewId').equals(crewId).toArray()
    const others = members.filter(m => m.id !== characterId)
    const usedByOther = others.some(m => EQUIP_SLOTS.some(s => m[s] === itemId))
    if (usedByOther) {
      return { success: false, message: 'Este item está sendo usado por outro membro.' }
    }

    // Slot deve ser compatível com o tipo do item
    if (item.type !== slot) {
      return { success: false, message: `Este item é do tipo "${item.type}", não "${slot}".` }
    }

    // Requisito de level
    if (character.level < item.requirements.level) {
      return { success: false, message: `Level insuficiente. Requerido: ${item.requirements.level}.` }
    }

    // Requisito de tipo de personagem
    if (item.requirements.characterType?.length) {
      const ok = item.requirements.characterType.includes(character.type as any)
      if (!ok) {
        return { success: false, message: `Item exclusivo para: ${item.requirements.characterType.join(', ')}.` }
      }
    }

    // Requisito de estilo de combate
    if (item.requirements.styleCombatId?.length) {
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
   * Deleta a instância do item de db.items (se for instância com templateId).
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
    const members = await db.characters.where('crewId').equals(crewId).toArray()
    const isEquipped = members.some(m => EQUIP_SLOTS.some(s => m[s] === item.id))
    if (isEquipped) {
      return {
        success: false,
        message: `${item.name} está equipado. Desequipe antes de vender.`,
        berryGained: 0,
      }
    }

    // Preço de venda: 50% do preço base, escalado pela raridade
    const sellPrice = Math.round((BASE_PRICE[item.class] ?? 6_000_000) * (0.5 + item.rarity / 100) * 0.5)

    // Remover entrada do inventário
    await db.inventories.delete(entryId)

    // Deletar instância do db.items (se for instância, não template)
    if (item.templateId != null) {
      await db.items.delete(item.id!)
    }

    await db.crews.update(crewId, { treasury: crew.treasury + sellPrice })

    return {
      success: true,
      message: `${item.name} vendido por ${sellPrice.toLocaleString('pt-BR')} Berry!`,
      berryGained: sellPrice,
    }
  }

  /**
   * Vende todos os itens do baú que NÃO estão equipados por nenhum membro da tripulação.
   */
  static async sellAllUnusedItems(crewId: number): Promise<SellAllResult> {
    const crew = await db.crews.get(crewId)
    if (!crew) return { success: false, message: 'Tripulação não encontrada.', itemsSold: 0, berryGained: 0 }

    const [chestSlots, members] = await Promise.all([
      this.getCrewChest(crewId),
      db.characters.where('crewId').equals(crewId).toArray(),
    ])

    // IDs de todos os itens equipados por qualquer membro
    const equippedIds = new Set<number>()
    for (const member of members) {
      for (const slot of EQUIP_SLOTS) {
        const id = member[slot]
        if (id != null) equippedIds.add(id)
      }
    }

    const unusedSlots = chestSlots.filter(s => !equippedIds.has(s.item.id!))
    if (unusedSlots.length === 0) {
      return { success: true, message: 'Nenhum item não utilizado para vender.', itemsSold: 0, berryGained: 0 }
    }

    let totalBerry = 0
    const entryIdsToDelete: number[] = []
    const instanceIdsToDelete: number[] = []

    for (const slot of unusedSlots) {
      const item = slot.item
      const sellPrice = Math.round((BASE_PRICE[item.class] ?? 6_000_000) * (0.5 + item.rarity / 100) * 0.5)
      totalBerry += sellPrice
      entryIdsToDelete.push(slot.entryId)
      if (item.templateId != null) {
        instanceIdsToDelete.push(item.id!)
      }
    }

    await db.inventories.bulkDelete(entryIdsToDelete)
    if (instanceIdsToDelete.length > 0) {
      await db.items.bulkDelete(instanceIdsToDelete)
    }
    await db.crews.update(crewId, { treasury: crew.treasury + totalBerry })

    return {
      success: true,
      message: `${unusedSlots.length} item(s) vendido(s) por ${totalBerry.toLocaleString('pt-BR')} Berry!`,
      itemsSold: unusedSlots.length,
      berryGained: totalBerry,
    }
  }

  // ── Bônus de itens ─────────────────────────────────────────────────────────

  static readonly CLASS_MULT: Record<string, number> = {
    F: 3, E: 3, D: 4, C: 5, B: 6, A: 7, S: 8,
  }

  /**
   * Calcula bônus de stats dos itens equipados por um personagem.
   * Fórmula: statsInfluence * (1 + rarity/100)
   * statsInfluence já está em pontos absolutos; rarity escala o bônus (0=base, 100=2×base).
   */
  static async calculateItemBonuses(character: Character): Promise<StatBonuses> {
    const bonuses: StatBonuses = { attack: 0, defense: 0, speed: 0, skill: 0, intelligence: 0 }

    const equippedIds = EQUIP_SLOTS.map(s => character[s]).filter(id => id != null) as number[]
    if (equippedIds.length === 0) return bonuses

    const items = await db.items.bulkGet(equippedIds)
    for (const item of items) {
      if (!item) continue
      const inf = item.statsInfluence
      const r = item.rarity / 100 // normalize to 0–1 for math
      if (inf.attack)        bonuses.attack        += Math.round(inf.attack        * (1 + r))
      if (inf.defense)       bonuses.defense       += Math.round(inf.defense       * (1 + r))
      if (inf.speed)         bonuses.speed         += Math.round(inf.speed         * (1 + r))
      if (inf.skill)         bonuses.skill         += Math.round(inf.skill         * (1 + r))
      if (inf.intelligence)  bonuses.intelligence  += Math.round(inf.intelligence  * (1 + r))
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
    const r = item.rarity / 100
    return (
      ((inf.attack ?? 0) + (inf.defense ?? 0) + (inf.speed ?? 0) +
        (inf.skill ?? 0) + (inf.intelligence ?? 0)) * (1 + r)
    )
  }

  static async optimizeEquipment(characterId: number): Promise<void> {
    const character = await db.characters.get(characterId)
    if (!character?.crewId) return

    const bagSlots = await this.getAvailableItemsForChar(character.crewId, characterId)
    if (bagSlots.length === 0) return

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
    const ownedTemplateIds = new Set(
      chestSlots.map(s => s.item.templateId ?? s.item.id!),
    )

    let bestGain = 0
    let bestEntry: StoreEntry | null = null

    for (const entry of storeEntries) {
      if (entry.price > crew.treasury) continue
      // NPCs não compram outro item do mesmo template se já têm um único
      if (entry.item.unique) {
        const baseId = entry.item.templateId ?? entry.item.id!
        if (ownedTemplateIds.has(baseId)) continue
      }

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

    const members = await db.characters.where('crewId').equals(crewId).toArray()
    const captain = members.find(m => m.id === crew.captainId)
    const others = members
      .filter(m => m.id !== crew.captainId)
      .sort((a, b) => b.level - a.level)
    const sortedMembers = captain ? [captain, ...others] : others

    const storeEntries = await this.getIslandStore(islandId)
    if (storeEntries.length === 0) return { purchased: [], totalSpent: 0, budgetAfter: remainingBudget }

    const allStyles = await db.styleCombats.orderBy('id').toArray()

    // Pontuação efetiva usando a nova fórmula de raridade
    const effectiveScore = (item: Item): number => {
      const inf = item.statsInfluence
      const r = item.rarity / 100
      return (
        ((inf.attack ?? 0) + (inf.defense ?? 0) + (inf.speed ?? 0) +
          (inf.skill ?? 0) + (inf.intelligence ?? 0)) *
        (1 + r)
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
      const current = (await db.characters.get(member.id!)) ?? member

      for (const slot of EQUIP_SLOTS) {
        const currentItemId = current[slot] as number | null
        const currentItem = currentItemId ? await db.items.get(currentItemId) : null
        const currentScore = currentItem ? effectiveScore(currentItem) : 0

        let bestEntry: StoreEntry | null = null
        let bestScore = currentScore

        for (const entry of storeEntries) {
          if (entry.item.type !== slot) continue
          if (entry.price > remainingBudget) continue
          if (!canMemberEquip(entry.item, current)) continue
          if (entry.item.unique) {
            const baseId = entry.item.templateId ?? entry.item.id!
            const chestSlots = await this.getCrewChest(crewId)
            const alreadyOwned = chestSlots.some(s => (s.item.templateId ?? s.item.id!) === baseId)
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

  /** Intervalo de atualização global de todas as lojas (1 hora). */
  static readonly STORE_REFRESH_INTERVAL = 60 * 60 * 1000

  private static readonly GLOBAL_STORE_REFRESH_KEY = 'storeGlobalLastRefresh'

  private static async getLastGlobalRefresh(): Promise<number> {
    const entry = await db.gameState.where('key').equals(this.GLOBAL_STORE_REFRESH_KEY).first()
    return entry?.value ?? 0
  }

  /** Retorna milissegundos até a próxima atualização global das lojas. */
  static async getTimeUntilRefresh(): Promise<number> {
    const last = await this.getLastGlobalRefresh()
    if (!last) return 0
    return Math.max(0, this.STORE_REFRESH_INTERVAL - (Date.now() - last))
  }

  /**
   * Atualiza a loja de UMA ilha específica:
   * 1. Deleta store entries antigas + instâncias de itens não vendidas.
   * 2. Cria novas instâncias com rarity único para cada slot.
   * 3. Cria novos store entries apontando para as instâncias.
   */
  static async refreshIslandStore(islandId: number): Promise<void> {
    const island = await db.islands.get(islandId)
    if (!island) return

    // Deletar instâncias de itens que ainda estão na loja (não foram comprados)
    const oldEntries = await db.stores.where('currentIslandId').equals(islandId).toArray()
    const oldItemIds = oldEntries.map(e => e.itemId)

    await db.stores.where('currentIslandId').equals(islandId).delete()

    if (oldItemIds.length > 0) {
      const oldItems = await db.items.bulkGet(oldItemIds)
      const instanceIds = oldItems
        .filter((item): item is Item => item != null && item.templateId != null)
        .map(item => item.id!)
      if (instanceIds.length > 0) {
        await db.items.bulkDelete(instanceIds)
      }
    }

    // Selecionar templates elegíveis para a dificuldade da ilha
    const classesForDifficulty = (d: number): string[] => {
      if (d <= 5)  return ['F', 'E']
      if (d <= 10) return ['E', 'D']
      if (d <= 15) return ['D', 'C']
      if (d <= 20) return ['C', 'B']
      return ['B', 'A']
    }

    const allowed = classesForDifficulty(island.difficulty)

    // Templates = itens sem templateId (criados durante a geração do mundo)
    const allTemplates = await db.items
      .filter(item => item.templateId == null && !item.unique && allowed.includes(item.class))
      .toArray()

    const shuffled = [...allTemplates].sort(() => Math.random() - 0.5)
    const count = Math.floor(Math.random() * 7) + 12
    const selected = shuffled.slice(0, Math.min(count, shuffled.length))

    // Criar instâncias e store entries
    for (const template of selected) {
      const instance = await this.createItemInstance(template)
      const price = Math.round((BASE_PRICE[instance.class] ?? 5_000_000) * (0.5 + instance.rarity / 100))
      await db.stores.add({
        currentIslandId: islandId,
        itemId: instance.id!,
        price,
      })
    }
  }

  /**
   * Atualiza TODAS as lojas de todas as ilhas ao mesmo tempo e grava o timestamp global.
   */
  static async refreshAllIslandStores(): Promise<void> {
    const islands = await db.islands.toArray()
    for (const island of islands) {
      await this.refreshIslandStore(island.id!)
    }

    // Gravar timestamp global
    const key = this.GLOBAL_STORE_REFRESH_KEY
    const existing = await db.gameState.where('key').equals(key).first()
    if (existing) {
      await db.gameState.update(existing.id!, { value: Date.now(), updatedAt: new Date() })
    } else {
      await db.gameState.add({ key, value: Date.now(), updatedAt: new Date() })
    }
  }

  /**
   * Verifica se é hora de atualizar as lojas (timer global).
   * Se sim, atualiza TODAS as ilhas de uma vez.
   */
  static async checkAndRefreshAllStores(): Promise<{ refreshed: boolean; nextRefreshIn: number }> {
    const timeLeft = await this.getTimeUntilRefresh()
    if (timeLeft === 0) {
      await this.refreshAllIslandStores()
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

  /**
   * Compra um item da loja:
   * - O store entry aponta para uma instância pré-gerada.
   * - A instância é movida do store para o inventário da tripulação.
   * - O store entry é deletado (item "esgotado").
   */
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

    // Para itens únicos/lendários: verificar se já possuem um (pelo templateId ou id)
    if (item.unique) {
      const baseId = item.templateId ?? item.id!
      const chest = await this.getCrewChest(crewId)
      const alreadyOwned = chest.some(s => (s.item.templateId ?? s.item.id!) === baseId)
      if (alreadyOwned) return { success: false, message: 'A tripulação já possui este item único.' }
    }

    await db.crews.update(crewId, { treasury: crew.treasury - storeEntry.price })

    // Mover instância para inventário e remover da loja
    await db.inventories.add({ crewId, itemId: storeEntry.itemId, acquiredAt: new Date() })
    await db.stores.delete(storeId)

    return { success: true, message: `${item.name} comprado para o baú da tripulação!` }
  }
}
