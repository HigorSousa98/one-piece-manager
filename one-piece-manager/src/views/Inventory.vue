<!-- src/views/Inventory.vue -->
<template>
  <div class="inv-page">

    <!-- Header -->
    <div class="inv-top-accent" />
    <div class="inv-header">
      <v-icon size="22" color="#D4AF37">mdi-bag-personal</v-icon>
      <div>
        <p class="inv-title">INVENTÁRIO</p>
        <p class="inv-subtitle">Gerencie os itens e equipamentos da sua tripulação</p>
      </div>
    </div>

    <!-- Tabs -->
    <v-tabs v-model="activeTab" class="inv-tabs" color="#D4AF37" bg-color="transparent">
      <v-tab value="equipment">
        <v-icon start>mdi-sword</v-icon>
        Equipamento
      </v-tab>
      <v-tab value="crew">
        <v-icon start>mdi-account-group</v-icon>
        Tripulação
      </v-tab>
      <v-tab value="store">
        <v-icon start>mdi-store</v-icon>
        Loja da Ilha
      </v-tab>
    </v-tabs>

    <v-tabs-window v-model="activeTab" class="mt-4">

      <!-- ══════════════════════════════════════════════════════
           TAB 1: MEU EQUIPAMENTO
           ══════════════════════════════════════════════════════ -->
      <v-tabs-window-item value="equipment">
        <div v-if="!playerCharacter" class="inv-empty">
          <v-icon size="60" color="#B0BFDA">mdi-account-off</v-icon>
          <p>Nenhum personagem encontrado.</p>
        </div>

        <v-row v-else>
          <!-- Painel de slots -->
          <v-col cols="12" md="4">
            <div class="inv-card">
              <div class="inv-card-title">
                <v-icon size="16" color="#D4AF37" class="mr-1">mdi-shield-account</v-icon>
                {{ playerCharacter.name }}
              </div>

              <div class="inv-slots">
                <div
                  v-for="slot in equipSlots"
                  :key="slot.key"
                  class="inv-slot-row"
                  :class="{ 'inv-slot-filled': getEquippedItem(playerCharacter, slot.key) }"
                  @click="selectSlotItem(playerCharacter, slot.key)"
                >
                  <v-icon size="18" :color="slot.color">{{ slot.icon }}</v-icon>
                  <div class="inv-slot-label">{{ slot.label }}</div>
                  <div class="inv-slot-item">
                    <template v-if="getEquippedItem(playerCharacter, slot.key)">
                      <span class="inv-item-name">{{ getEquippedItem(playerCharacter, slot.key)?.name }}</span>
                      <span class="inv-class-badge" :style="{ background: classColor(getEquippedItem(playerCharacter, slot.key)?.class) }">
                        {{ getEquippedItem(playerCharacter, slot.key)?.class }}
                      </span>
                    </template>
                    <span v-else class="inv-slot-empty">Vazio</span>
                  </div>
                </div>
              </div>

              <!-- Bônus totais -->
              <div class="inv-bonus-section mt-4">
                <div class="inv-bonus-title">
                  <v-icon size="14" color="#D4AF37" class="mr-1">mdi-plus-circle</v-icon>
                  Bônus de Itens
                </div>
                <div class="inv-bonus-grid">
                  <div v-for="b in bonusDisplay" :key="b.key" class="inv-bonus-row" v-show="b.value > 0">
                    <v-icon size="13" :color="b.color">{{ b.icon }}</v-icon>
                    <span class="inv-bonus-label">{{ b.label }}</span>
                    <span class="inv-bonus-val">+{{ b.value }}</span>
                  </div>
                  <p v-if="totalBonus === 0" class="inv-no-bonus">Nenhum item equipado</p>
                </div>
              </div>

              <!-- Auto-equip -->
              <div class="mt-3">
                <v-btn
                  block
                  size="small"
                  variant="outlined"
                  color="#D4AF37"
                  :loading="autoEquipLoading"
                  :disabled="!playerCharacter"
                  @click="handleAutoEquip(playerCharacter)"
                >
                  <v-icon start size="14">mdi-auto-fix</v-icon>
                  Auto-equipar melhor
                </v-btn>
                <p v-if="autoEquipMessage" class="inv-auto-msg mt-1">{{ autoEquipMessage }}</p>
              </div>
            </div>
          </v-col>

          <!-- Bolsa + Detalhe -->
          <v-col cols="12" md="8">
            <!-- Baú -->
            <div class="inv-card mb-4">
              <div class="inv-card-title d-flex align-center justify-space-between">
                <span>
                  <v-icon size="16" color="#D4AF37" class="mr-1">mdi-treasure-chest</v-icon>
                  Baú da Tripulação ({{ playerInventory.length }} itens)
                </span>
                <v-btn
                  v-if="playerInventory.filter(s => !isEquippedBy(s.item, playerCharacter!)).length > 0 && isPlayerCaptain"
                  size="x-small"
                  variant="outlined"
                  color="#78909C"
                  :loading="sellAllLoading"
                  @click="handleSellAll"
                >
                  <v-icon start size="12">mdi-tag-multiple</v-icon>
                  Vender não utilizados
                </v-btn>
              </div>

              <v-alert v-if="sellAllMessage" :type="sellAllSuccess ? 'success' : 'error'" density="compact" variant="tonal" class="mb-2">
                {{ sellAllMessage }}
              </v-alert>

              <div v-if="playerInventory.length === 0" class="inv-empty-small">
                Baú vazio. Explore ilhas ou compre na loja!
              </div>

              <div v-else class="inv-bag-grid">
                <v-tooltip
                  v-for="slot in playerInventory"
                  :key="slot.entryId"
                  location="right"
                  :open-delay="250"
                  max-width="260"
                >
                  <template #activator="{ props: ttProps }">
                    <div
                      v-bind="ttProps"
                      class="inv-bag-item"
                      :class="{ 'inv-bag-selected': selectedEntryId === slot.entryId, 'inv-bag-equipped': isEquippedBy(slot.item, playerCharacter!) }"
                      @click="selectedItem = slot.item; selectedEntryId = slot.entryId; selectedCharacterForAction = playerCharacter"
                    >
                      <div class="inv-bag-icon" :style="{ borderColor: classColor(slot.item.class) }">
                        <v-icon size="18" :color="typeColor(slot.item.type)">{{ itemIcon(slot.item) }}</v-icon>
                      </div>
                      <div class="inv-bag-name">{{ slot.item.name }}</div>
                      <div class="d-flex align-center gap-1">
                        <div class="inv-bag-class" :style="{ color: classColor(slot.item.class) }">{{ slot.item.class }}</div>
                        <div class="inv-rarity-mini" :style="{ color: rarityColor(slot.item.rarity) }">{{ slot.item.rarity }}</div>
                        <div v-if="isEquippedBy(slot.item, playerCharacter!)" class="inv-bag-eq-dot" title="Equipado por você" />
                      </div>
                    </div>
                  </template>
                  <div class="inv-tt">
                    <div class="inv-tt-header">
                      <span>{{ slot.item.name }}</span>
                      <span class="inv-class-badge" :style="{ background: classColor(slot.item.class) }">{{ slot.item.class }}</span>
                      <span class="inv-rarity-badge" :style="{ color: rarityColor(slot.item.rarity) }">✦{{ slot.item.rarity }}</span>
                    </div>
                    <div class="inv-tt-sub">{{ slotLabel(slot.item.type) }}</div>
                    <div class="inv-tt-divider" />
                    <template v-if="playerCharacter">
                      <div v-if="!getStatDiff(slot.item, playerCharacter).length" class="inv-tt-neutral">Sem alteração de stats</div>
                      <div v-for="s in getStatDiff(slot.item, playerCharacter)" :key="s.stat" class="inv-tt-row">
                        <v-icon size="11" :color="s.color">{{ s.icon }}</v-icon>
                        <span class="inv-tt-stat">{{ s.label }}</span>
                        <span :class="{ 'inv-tt-gain': s.diff > 0, 'inv-tt-loss': s.diff < 0, 'inv-tt-same': s.diff === 0 }">
                          {{ s.diff > 0 ? '+' : '' }}{{ s.diff }}
                        </span>
                      </div>
                    </template>
                    <template v-for="compat in [getCompatibleCrew(slot.item)]" :key="'compat'">
                      <div class="inv-tt-divider" />
                      <div class="inv-tt-who-label">Pode usar ({{ compat.compatible.length + compat.moreCount }}/{{ compat.total }})</div>
                      <div v-if="compat.compatible.length === 0" class="inv-tt-who-none">Nenhum tripulante apto</div>
                      <div v-for="m in compat.compatible" :key="m.name" class="inv-tt-who-row">
                        <v-icon size="10" :color="m.isPlayer ? '#FFD700' : '#81C784'">{{ m.isPlayer ? 'mdi-crown' : 'mdi-check' }}</v-icon>
                        <span class="inv-tt-who-name">{{ m.name }}</span>
                        <span class="inv-tt-who-lv">Lv{{ m.level }}</span>
                      </div>
                      <div v-if="compat.moreCount > 0" class="inv-tt-who-more">+{{ compat.moreCount }} mais...</div>
                    </template>
                  </div>
                </v-tooltip>
              </div>
            </div>

            <!-- Detalhe do item selecionado -->
            <div v-if="selectedItem" class="inv-card">
              <div class="inv-detail-header">
                <div>
                  <span class="inv-detail-name">{{ selectedItem.name }}</span>
                  <span class="inv-class-badge ml-2" :style="{ background: classColor(selectedItem.class) }">
                    {{ selectedItem.class }}
                  </span>
                  <span v-if="selectedItem.unique" class="inv-unique-badge ml-2">ÚNICO</span>
                </div>
                <div class="inv-rarity-bar-wrap">
                  <span class="inv-rarity-label">Raridade</span>
                  <div class="inv-rarity-bar">
                    <div class="inv-rarity-fill" :style="{ width: selectedItem.rarity + '%', background: rarityColor(selectedItem.rarity) }" />
                  </div>
                  <span class="inv-rarity-pct" :style="{ color: rarityColor(selectedItem.rarity) }">{{ selectedItem.rarity }}</span>
                </div>
              </div>

              <p class="inv-detail-desc">{{ selectedItem.description }}</p>
              <p v-if="selectedItem.lore" class="inv-detail-lore">"{{ selectedItem.lore }}"</p>

              <!-- Bônus do item -->
              <div class="inv-detail-bonuses">
                <div
                  v-for="(val, key) in effectiveBonuses(selectedItem)"
                  :key="key"
                  class="inv-detail-bonus-row"
                >
                  <v-icon size="13" :color="statColor(key)">{{ statIcon(key) }}</v-icon>
                  <span>{{ statLabel(key) }}</span>
                  <span class="inv-detail-bonus-val">+{{ val }}</span>
                </div>
              </div>

              <!-- Requisitos -->
              <div class="inv-detail-reqs">
                <!-- Badge geral de equipabilidade -->
                <span
                  class="inv-req-badge"
                  :class="selectedItemEquipCheck.canEquip ? 'inv-req-badge--ok' : 'inv-req-badge--fail'"
                >
                  <v-icon size="11">{{ selectedItemEquipCheck.canEquip ? 'mdi-check-circle' : 'mdi-close-circle' }}</v-icon>
                  {{ selectedItemEquipCheck.canEquip ? 'Equipável' : 'Inapto' }}
                </span>

                <span class="inv-req-item" :class="selectedItemEquipCheck.levelOk ? 'inv-req-ok' : 'inv-req-fail'">
                  <v-icon size="12">mdi-chevron-up</v-icon>
                  Nível {{ selectedItem.requirements.level }}
                </span>
                <span v-if="selectedItem.requirements.characterType?.length" class="inv-req-item" :class="selectedItemEquipCheck.typeOk ? 'inv-req-ok' : 'inv-req-fail'">
                  <v-icon size="12">mdi-account</v-icon>
                  {{ selectedItem.requirements.characterType.join(', ') }}
                </span>
                <span class="inv-req-item">
                  <v-icon size="12" :color="typeColor(selectedItem.type)">{{ itemIcon(selectedItem) }}</v-icon>
                  {{ slotLabel(selectedItem.type) }}
                </span>
                <span v-if="selectedItem.requirements.styleCombatId?.length" class="inv-req-item" :class="selectedItemEquipCheck.styleOk ? 'inv-req-ok' : 'inv-req-fail'">
                  <v-icon size="12">mdi-sword-cross</v-icon>
                  {{ getStyleNames(selectedItem.requirements.styleCombatId) }}
                </span>
              </div>

              <!-- Ações -->
              <div class="inv-detail-actions">
                <v-btn
                  v-if="!isEquipped(selectedItem)"
                  size="small"
                  color="#D4AF37"
                  variant="elevated"
                  :loading="actionLoading"
                  @click="handleEquip"
                >
                  <v-icon start size="14">mdi-sword</v-icon>
                  Equipar
                </v-btn>
                <v-btn
                  v-else
                  size="small"
                  color="#EF5350"
                  variant="elevated"
                  :loading="actionLoading"
                  @click="handleUnequip"
                >
                  <v-icon start size="14">mdi-minus-circle</v-icon>
                  Desequipar
                </v-btn>
                <v-btn
                  v-if="!isEquipped(selectedItem) && selectedEntryId != null"
                  size="small"
                  color="#78909C"
                  variant="outlined"
                  :loading="sellLoading"
                  @click="handleSell"
                >
                  <v-icon start size="14">mdi-tag-minus</v-icon>
                  Vender (50%)
                </v-btn>
              </div>

              <!-- Feedback -->
              <v-alert v-if="actionMessage" :type="actionSuccess ? 'success' : 'error'" density="compact" variant="tonal" class="mt-3">
                {{ actionMessage }}
              </v-alert>
              <v-alert v-if="sellMessage" :type="sellSuccess ? 'success' : 'error'" density="compact" variant="tonal" class="mt-2">
                {{ sellMessage }}
              </v-alert>
            </div>
          </v-col>
        </v-row>
      </v-tabs-window-item>

      <!-- ══════════════════════════════════════════════════════
           TAB 2: TRIPULAÇÃO
           ══════════════════════════════════════════════════════ -->
      <v-tabs-window-item value="crew">
        <v-row>
          <!-- Lista de membros -->
          <v-col cols="12" md="3">
            <div class="inv-card">
              <div class="inv-card-title">
                <v-icon size="16" color="#D4AF37" class="mr-1">mdi-account-group</v-icon>
                Membros
              </div>
              <div
                v-for="member in crewMembers"
                :key="member.character.id"
                class="inv-crew-row"
                :class="{ 'inv-crew-selected': selectedCrewMember?.character.id === member.character.id }"
                @click="selectCrewMember(member)"
              >
                <v-icon size="14" color="#B0BFDA">
                  {{ member.character.isPlayer ? 'mdi-crown' : 'mdi-account' }}
                </v-icon>
                <div class="inv-crew-info">
                  <div class="inv-crew-name">{{ member.character.name }}</div>
                  <div class="inv-crew-style">
                    {{ (styleCombatMap.get(member.character.styleCombatId) ?? '').split(' - ')[1] ?? styleCombatMap.get(member.character.styleCombatId) ?? '' }}
                  </div>
                </div>
                <div class="inv-crew-level">Lv{{ member.character.level }}</div>
              </div>
            </div>
          </v-col>

          <!-- Equipamento do membro selecionado -->
          <v-col cols="12" md="9">
            <div v-if="!selectedCrewMember" class="inv-empty">
              <v-icon size="50" color="#B0BFDA">mdi-cursor-pointer</v-icon>
              <p>Selecione um membro para ver seus itens.</p>
            </div>

            <div v-else>
              <!-- Slots -->
              <div class="inv-card mb-4">
                <div class="inv-card-title d-flex align-center justify-space-between">
                  <span>
                    <v-icon size="16" color="#D4AF37" class="mr-1">mdi-shield-account</v-icon>
                    {{ selectedCrewMember.character.name }} — Equipamento
                  </span>
                  <v-btn
                    size="x-small"
                    variant="outlined"
                    color="#D4AF37"
                    :loading="autoEquipLoading"
                    @click="handleAutoEquip(selectedCrewMember.character)"
                  >
                    <v-icon start size="12">mdi-auto-fix</v-icon>
                    Auto-equipar
                  </v-btn>
                </div>
                <div class="inv-slots">
                  <div
                    v-for="slot in equipSlots"
                    :key="slot.key"
                    class="inv-slot-row"
                    :class="{ 'inv-slot-filled': getEquippedItem(selectedCrewMember.character, slot.key) }"
                    @click="selectSlotItem(selectedCrewMember.character, slot.key)"
                  >
                    <v-icon size="18" :color="slot.color">{{ slot.icon }}</v-icon>
                    <div class="inv-slot-label">{{ slot.label }}</div>
                    <div class="inv-slot-item">
                      <template v-if="getEquippedItem(selectedCrewMember.character, slot.key)">
                        <span class="inv-item-name">{{ getEquippedItem(selectedCrewMember.character, slot.key)?.name }}</span>
                        <span class="inv-class-badge" :style="{ background: classColor(getEquippedItem(selectedCrewMember.character, slot.key)?.class) }">
                          {{ getEquippedItem(selectedCrewMember.character, slot.key)?.class }}
                        </span>
                      </template>
                      <span v-else class="inv-slot-empty">Vazio</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Baú da tripulação (visão do membro) -->
              <div class="inv-card">
                <div class="inv-card-title">
                  <v-icon size="16" color="#D4AF37" class="mr-1">mdi-treasure-chest</v-icon>
                  Baú da Tripulação — disponível para {{ selectedCrewMember.character.name }} ({{ selectedCrewMember.items.length }} itens)
                </div>
                <div v-if="selectedCrewMember.items.length === 0" class="inv-empty-small">
                  Nenhum item disponível no baú.
                </div>
                <div v-else class="inv-bag-grid">
                  <v-tooltip
                    v-for="slot in selectedCrewMember.items"
                    :key="slot.entryId"
                    location="right"
                    :open-delay="250"
                    max-width="260"
                  >
                    <template #activator="{ props: ttProps }">
                      <div
                        v-bind="ttProps"
                        class="inv-bag-item"
                        :class="{ 'inv-bag-selected': selectedEntryId === slot.entryId, 'inv-bag-equipped': isEquippedBy(slot.item, selectedCrewMember.character) }"
                        @click="selectedItem = slot.item; selectedEntryId = slot.entryId; selectedCharacterForAction = selectedCrewMember?.character ?? null"
                      >
                        <div class="inv-bag-icon" :style="{ borderColor: classColor(slot.item.class) }">
                          <v-icon size="18" :color="typeColor(slot.item.type)">{{ itemIcon(slot.item) }}</v-icon>
                        </div>
                        <div class="inv-bag-name">{{ slot.item.name }}</div>
                        <div class="d-flex align-center gap-1">
                          <div class="inv-bag-class" :style="{ color: classColor(slot.item.class) }">{{ slot.item.class }}</div>
                          <div class="inv-rarity-mini" :style="{ color: rarityColor(slot.item.rarity) }">{{ slot.item.rarity }}</div>
                          <div v-if="isEquippedBy(slot.item, selectedCrewMember.character)" class="inv-bag-eq-dot" title="Equipado por este membro" />
                        </div>
                      </div>
                    </template>
                    <div class="inv-tt">
                      <div class="inv-tt-header">
                        <span>{{ slot.item.name }}</span>
                        <span class="inv-class-badge" :style="{ background: classColor(slot.item.class) }">{{ slot.item.class }}</span>
                        <span class="inv-rarity-badge" :style="{ color: rarityColor(slot.item.rarity) }">✦{{ slot.item.rarity }}</span>
                      </div>
                      <div class="inv-tt-sub">{{ slotLabel(slot.item.type) }}</div>
                      <div class="inv-tt-divider" />
                      <div v-if="!getStatDiff(slot.item, selectedCrewMember?.character ?? null).length" class="inv-tt-neutral">Sem alteração de stats</div>
                      <div v-for="s in getStatDiff(slot.item, selectedCrewMember?.character ?? null)" :key="s.stat" class="inv-tt-row">
                        <v-icon size="11" :color="s.color">{{ s.icon }}</v-icon>
                        <span class="inv-tt-stat">{{ s.label }}</span>
                        <span :class="{ 'inv-tt-gain': s.diff > 0, 'inv-tt-loss': s.diff < 0, 'inv-tt-same': s.diff === 0 }">
                          {{ s.diff > 0 ? '+' : '' }}{{ s.diff }}
                        </span>
                      </div>
                      <template v-for="compat in [getCompatibleCrew(slot.item)]" :key="'compat'">
                        <div class="inv-tt-divider" />
                        <div class="inv-tt-who-label">Pode usar ({{ compat.compatible.length + compat.moreCount }}/{{ compat.total }})</div>
                        <div v-if="compat.compatible.length === 0" class="inv-tt-who-none">Nenhum tripulante apto</div>
                        <div v-for="m in compat.compatible" :key="m.name" class="inv-tt-who-row">
                          <v-icon size="10" :color="m.isPlayer ? '#FFD700' : '#81C784'">{{ m.isPlayer ? 'mdi-crown' : 'mdi-check' }}</v-icon>
                          <span class="inv-tt-who-name">{{ m.name }}</span>
                          <span class="inv-tt-who-lv">Lv{{ m.level }}</span>
                        </div>
                        <div v-if="compat.moreCount > 0" class="inv-tt-who-more">+{{ compat.moreCount }} mais...</div>
                      </template>
                    </div>
                  </v-tooltip>
                </div>

                <!-- Detalhe + ações (reutilizando o mesmo bloco) -->
                <div v-if="selectedItem && selectedCharacterForAction?.id === selectedCrewMember.character.id" class="mt-4">
                  <v-divider class="mb-4" />
                  <div class="inv-detail-header">
                    <span class="inv-detail-name">{{ selectedItem.name }}</span>
                    <span class="inv-class-badge ml-2" :style="{ background: classColor(selectedItem.class) }">{{ selectedItem.class }}</span>
                  </div>
                  <div class="inv-detail-bonuses">
                    <div v-for="(val, key) in effectiveBonuses(selectedItem)" :key="key" class="inv-detail-bonus-row">
                      <v-icon size="13" :color="statColor(key)">{{ statIcon(key) }}</v-icon>
                      <span>{{ statLabel(key) }}</span>
                      <span class="inv-detail-bonus-val">+{{ val }}</span>
                    </div>
                  </div>
                  <!-- Requisitos (Tab 2) -->
                  <div class="inv-detail-reqs mb-2">
                    <span
                      class="inv-req-badge"
                      :class="selectedItemEquipCheck.canEquip ? 'inv-req-badge--ok' : 'inv-req-badge--fail'"
                    >
                      <v-icon size="11">{{ selectedItemEquipCheck.canEquip ? 'mdi-check-circle' : 'mdi-close-circle' }}</v-icon>
                      {{ selectedItemEquipCheck.canEquip ? 'Equipável' : 'Inapto' }}
                    </span>
                    <span class="inv-req-item" :class="selectedItemEquipCheck.levelOk ? 'inv-req-ok' : 'inv-req-fail'">
                      <v-icon size="12">mdi-chevron-up</v-icon>
                      Nível {{ selectedItem.requirements.level }}
                    </span>
                    <span v-if="selectedItem.requirements.characterType?.length" class="inv-req-item" :class="selectedItemEquipCheck.typeOk ? 'inv-req-ok' : 'inv-req-fail'">
                      <v-icon size="12">mdi-account</v-icon>
                      {{ selectedItem.requirements.characterType.join(', ') }}
                    </span>
                    <span class="inv-req-item">
                      <v-icon size="12" :color="typeColor(selectedItem.type)">{{ typeIcon(selectedItem.type) }}</v-icon>
                      {{ slotLabel(selectedItem.type) }}
                    </span>
                    <span v-if="selectedItem.requirements.styleCombatId?.length" class="inv-req-item" :class="selectedItemEquipCheck.styleOk ? 'inv-req-ok' : 'inv-req-fail'">
                      <v-icon size="12">mdi-sword-cross</v-icon>
                      {{ getStyleNames(selectedItem.requirements.styleCombatId) }}
                    </span>
                  </div>
                  <div class="inv-detail-actions">
                    <v-btn
                      v-if="!isEquippedBy(selectedItem, selectedCrewMember.character)"
                      size="small" color="#D4AF37" variant="elevated"
                      :loading="actionLoading" @click="handleEquip"
                    >
                      <v-icon start size="14">mdi-sword</v-icon> Equipar
                    </v-btn>
                    <v-btn
                      v-else
                      size="small" color="#EF5350" variant="elevated"
                      :loading="actionLoading" @click="handleUnequip"
                    >
                      <v-icon start size="14">mdi-minus-circle</v-icon> Desequipar
                    </v-btn>
                    <v-btn
                      v-if="!isEquippedBy(selectedItem, selectedCrewMember.character) && selectedEntryId != null"
                      size="small" color="#78909C" variant="outlined"
                      :loading="sellLoading" @click="handleSell"
                    >
                      <v-icon start size="14">mdi-tag-minus</v-icon> Vender (50%)
                    </v-btn>
                  </div>
                  <v-alert v-if="actionMessage" :type="actionSuccess ? 'success' : 'error'" density="compact" variant="tonal" class="mt-3">
                    {{ actionMessage }}
                  </v-alert>
                  <v-alert v-if="sellMessage" :type="sellSuccess ? 'success' : 'error'" density="compact" variant="tonal" class="mt-2">
                    {{ sellMessage }}
                  </v-alert>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-tabs-window-item>

      <!-- ══════════════════════════════════════════════════════
           TAB 3: LOJA DA ILHA
           ══════════════════════════════════════════════════════ -->
      <v-tabs-window-item value="store">
        <div class="inv-card mb-4">
          <div class="d-flex align-center justify-space-between flex-wrap gap-2">
            <div>
              <div class="inv-card-title">
                <v-icon size="16" color="#D4AF37" class="mr-1">mdi-store</v-icon>
                Loja — {{ currentIslandName }}
              </div>
              <p class="inv-subtitle mt-1">Itens disponíveis para compra nesta ilha</p>
            </div>
            <div class="d-flex align-center gap-2">
              <v-icon size="16" color="#D4AF37">mdi-cash-multiple</v-icon>
              <span class="inv-treasury">{{ formatBerry(crewTreasury) }} Berry</span>
            </div>
          </div>

          <!-- Countdown de atualização -->
          <div class="inv-refresh-row mt-3">
            <v-icon size="13" color="#8B9DC3">mdi-clock-outline</v-icon>
            <span class="inv-refresh-label">Próxima atualização:</span>
            <span class="inv-refresh-timer" :class="{ 'inv-refresh-soon': storeNextRefreshIn < 300_000 }">
              {{ storeCountdown }}
            </span>
            <div class="inv-refresh-bar-wrap">
              <div class="inv-refresh-bar-fill" :style="{ width: (storeRefreshProgress * 100) + '%' }" />
            </div>
          </div>

          <!-- Botão Melhor Compra -->
          <div class="mt-3">
            <v-btn
              block
              size="small"
              variant="elevated"
              class="inv-bestbuy-btn"
              :loading="bestBuyLoading"
              :disabled="!isPlayerCaptain || crewTreasury <= 0 || storeItems.length === 0"
              @click="handleBestBuy"
            >
              <v-icon start size="15">mdi-treasure-chest</v-icon>
              Melhor Compra — Otimizar Tripulação
            </v-btn>
            <p v-if="!isPlayerCaptain" class="inv-bestbuy-hint">Apenas o capitão pode comprar itens.</p>
          </div>
        </div>

        <!-- Resultado da Melhor Compra -->
        <v-expand-transition>
          <div v-if="showBestBuyResult && bestBuyResult" class="inv-bestbuy-panel mb-4">
            <div class="inv-bestbuy-header">
              <div class="d-flex align-center gap-2">
                <v-icon size="16" color="#D4AF37">mdi-cart-check</v-icon>
                <span v-if="bestBuyResult.purchased.length > 0">
                  {{ bestBuyResult.purchased.length }} item(s) comprado(s) ·
                  <strong>{{ formatBerry(bestBuyResult.totalSpent) }} Berry</strong>
                </span>
                <span v-else>Nenhum upgrade disponível no orçamento atual.</span>
              </div>
              <v-btn icon size="x-small" variant="text" @click="showBestBuyResult = false">
                <v-icon size="16" color="#8B9DC3">mdi-close</v-icon>
              </v-btn>
            </div>

            <template v-if="bestBuyResult.purchased.length > 0">
              <div
                v-for="(p, i) in bestBuyResult.purchased"
                :key="i"
                class="inv-bestbuy-row"
              >
                <v-icon size="12" :color="typeColor(p.slot)">{{ typeIcon(p.slot) }}</v-icon>
                <span class="inv-bestbuy-member">{{ p.memberName }}</span>
                <span class="inv-bestbuy-arrow">→</span>
                <span class="inv-bestbuy-item">{{ p.itemName }}</span>
                <span class="inv-bestbuy-price">{{ formatBerry(p.price) }} ₿</span>
              </div>
              <div class="inv-bestbuy-footer">
                Saldo restante: <strong>{{ formatBerry(bestBuyResult.budgetAfter) }} Berry</strong>
              </div>
            </template>
          </div>
        </v-expand-transition>

        <div v-if="storeItems.length === 0" class="inv-empty">
          <v-icon size="60" color="#B0BFDA">mdi-store-off</v-icon>
          <p>Esta ilha não possui loja, ou os itens acabaram.</p>
        </div>

        <v-row v-else>
          <v-col
            v-for="entry in storeItems"
            :key="entry.storeId"
            cols="12" sm="6" md="4" lg="3"
          >
            <v-tooltip location="top" :open-delay="250" max-width="260">
              <template #activator="{ props: ttProps }">
                <div
                  v-bind="ttProps"
                  class="inv-store-card"
                  :class="{ 'inv-store-selected': selectedStoreEntry?.storeId === entry.storeId }"
                  @click="selectedStoreEntry = entry; selectedItem = entry.item; selectedCharacterForAction = playerCharacter"
                >
                  <div class="inv-store-top">
                    <div class="inv-bag-icon" :style="{ borderColor: classColor(entry.item.class) }">
                      <v-icon size="22" :color="typeColor(entry.item.type)">{{ itemIcon(entry.item) }}</v-icon>
                    </div>
                    <div>
                      <div class="inv-store-name">{{ entry.item.name }}</div>
                      <div class="d-flex align-center gap-1 mt-1">
                        <span class="inv-class-badge" :style="{ background: classColor(entry.item.class) }">{{ entry.item.class }}</span>
                        <span v-if="entry.item.unique" class="inv-unique-badge">ÚNICO</span>
                        <span class="inv-rarity-badge" :style="{ color: rarityColor(entry.item.rarity) }">✦{{ entry.item.rarity }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="inv-store-bonuses">
                    <span
                      v-for="(val, key) in effectiveBonuses(entry.item)"
                      :key="key"
                      class="inv-store-bonus-chip"
                    >
                      <v-icon size="10" :color="statColor(key)">{{ statIcon(key) }}</v-icon>
                      +{{ val }}
                    </span>
                  </div>

                  <div class="inv-store-price">
                    <v-icon size="14" color="#D4AF37">mdi-cash</v-icon>
                    {{ formatBerry(entry.price) }}
                  </div>

                  <v-btn
                    block
                    size="small"
                    color="#D4AF37"
                    variant="elevated"
                    class="mt-2"
                    :disabled="crewTreasury < entry.price || !playerCharacter || !isPlayerCaptain"
                    :loading="buyLoading && selectedStoreEntry?.storeId === entry.storeId"
                    @click.stop="handleBuy(entry)"
                  >
                    {{ isPlayerCaptain ? 'Comprar' : 'Só o capitão' }}
                  </v-btn>
                </div>
              </template>
              <div class="inv-tt">
                <div class="inv-tt-header">
                  <span>{{ entry.item.name }}</span>
                  <span class="inv-class-badge" :style="{ background: classColor(entry.item.class) }">{{ entry.item.class }}</span>
                  <span class="inv-rarity-badge" :style="{ color: rarityColor(entry.item.rarity) }">✦{{ entry.item.rarity }}</span>
                </div>
                <div class="inv-tt-sub">{{ slotLabel(entry.item.type) }} · Nível {{ entry.item.requirements.level }}</div>
                <div class="inv-tt-divider" />
                <div v-if="!getStatDiff(entry.item, playerCharacter).length" class="inv-tt-neutral">Sem alteração de stats</div>
                <div v-for="s in getStatDiff(entry.item, playerCharacter)" :key="s.stat" class="inv-tt-row">
                  <v-icon size="11" :color="s.color">{{ s.icon }}</v-icon>
                  <span class="inv-tt-stat">{{ s.label }}</span>
                  <span :class="{ 'inv-tt-gain': s.diff > 0, 'inv-tt-loss': s.diff < 0, 'inv-tt-same': s.diff === 0 }">
                    {{ s.diff > 0 ? '+' : '' }}{{ s.diff }}
                  </span>
                </div>
                <template v-for="compat in [getCompatibleCrew(entry.item)]" :key="'compat'">
                  <div class="inv-tt-divider" />
                  <div class="inv-tt-who-label">Pode usar ({{ compat.compatible.length + compat.moreCount }}/{{ compat.total }})</div>
                  <div v-if="compat.compatible.length === 0" class="inv-tt-who-none">Nenhum tripulante apto</div>
                  <div v-for="m in compat.compatible" :key="m.name" class="inv-tt-who-row">
                    <v-icon size="10" :color="m.isPlayer ? '#FFD700' : '#81C784'">{{ m.isPlayer ? 'mdi-crown' : 'mdi-check' }}</v-icon>
                    <span class="inv-tt-who-name">{{ m.name }}</span>
                    <span class="inv-tt-who-lv">Lv{{ m.level }}</span>
                  </div>
                  <div v-if="compat.moreCount > 0" class="inv-tt-who-more">+{{ compat.moreCount }} mais...</div>
                </template>
              </div>
            </v-tooltip>
          </v-col>
        </v-row>

        <v-alert
          v-if="buyMessage"
          :type="buySuccess ? 'success' : 'error'"
          density="compact"
          variant="tonal"
          class="mt-4"
        >
          {{ buyMessage }}
        </v-alert>
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useCharacterStore } from '@/stores/characterStore'
import { db } from '@/utils/database'
import type { Character, Item } from '@/utils/database'
import { InventorySystem, type EquipSlot, type StoreEntry, type InventorySlot } from '@/utils/inventorySystem'

const characterStore = useCharacterStore()

// ── Estado ─────────────────────────────────────────────────────────────────────
const activeTab = ref('equipment')
const playerInventory = ref<InventorySlot[]>([])
const crewMembers = ref<{ character: Character; items: InventorySlot[] }[]>([])
const storeItems = ref<StoreEntry[]>([])
const selectedItem = ref<Item | null>(null)
const selectedEntryId = ref<number | null>(null)
const selectedCharacterForAction = ref<Character | null>(null)
const selectedCrewMember = ref<{ character: Character; items: InventorySlot[] } | null>(null)
const selectedStoreEntry = ref<StoreEntry | null>(null)
const itemBonuses = ref<Record<string, number>>({})
const actionLoading = ref(false)
const actionMessage = ref('')
const actionSuccess = ref(false)
const sellLoading = ref(false)
const sellMessage = ref('')
const sellSuccess = ref(false)
const buyLoading = ref(false)
const buyMessage = ref('')
const buySuccess = ref(false)
const crewTreasury = ref(0)
const currentIslandName = ref('Ilha desconhecida')
const styleCombatMap = ref<Map<number, string>>(new Map())
const autoEquipLoading = ref(false)
const autoEquipMessage = ref('')
const bestBuyLoading = ref(false)
const bestBuyResult = ref<{
  purchased: Array<{ memberName: string; itemName: string; slot: string; price: number }>
  totalSpent: number
  budgetAfter: number
} | null>(null)
const showBestBuyResult = ref(false)
const sellAllLoading = ref(false)
const sellAllMessage = ref('')
const sellAllSuccess = ref(false)

// ── Countdown de atualização da loja ───────────────────────────────────────────
const storeNextRefreshIn = ref(0) // milissegundos restantes
let countdownInterval: ReturnType<typeof setInterval> | null = null

const storeCountdown = computed(() => {
  const ms = storeNextRefreshIn.value
  if (ms <= 0) return 'Atualizando...'
  const totalSec = Math.ceil(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
  return `${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
})

// Progresso da barra (0–1): quanto do intervalo já passou
const storeRefreshProgress = computed(() => {
  const interval = InventorySystem.STORE_REFRESH_INTERVAL
  return Math.max(0, Math.min(1, 1 - storeNextRefreshIn.value / interval))
})

// Mapa itemId → Item (para lookup rápido dos slots equipados)
const equippedItems = ref<Map<number, Item>>(new Map())

// ── Dados do personagem do jogador ─────────────────────────────────────────────
const playerCharacter = computed(() => characterStore.playerCharacter)
const playerCrew = computed(() => characterStore.playerCrew)
const isPlayerCaptain = computed(() =>
  playerCrew.value != null && playerCharacter.value != null &&
  playerCrew.value.captainId === playerCharacter.value.id
)

// ── Slots de equipamento ───────────────────────────────────────────────────────
const equipSlots: { key: EquipSlot; label: string; icon: string; color: string }[] = [
  { key: 'weapon',   label: 'Arma',      icon: 'mdi-sword',        color: '#EF5350' },
  { key: 'clothing', label: 'Roupa',     icon: 'mdi-tshirt-crew',  color: '#42A5F5' },
  { key: 'helmet',   label: 'Capacete',  icon: 'mdi-hard-hat',     color: '#66BB6A' },
  { key: 'gloves',   label: 'Luvas',     icon: 'mdi-hand-wave',    color: '#FFA726' },
  { key: 'boots',    label: 'Botas',     icon: 'mdi-shoe-print',   color: '#AB47BC' },
]

// ── Helpers de cor / ícone ─────────────────────────────────────────────────────
const classColor = (cls?: string): string => ({
  S: '#FFD700', A: '#E91E63', B: '#7C4DFF',
  C: '#42A5F5', D: '#66BB6A', E: '#78909C', F: '#546E7A',
}[cls ?? 'F'] ?? '#546E7A')

// Subtype-specific icons — weapon subtypes differentiated by role
const SUBTYPE_ICONS: Record<string, string> = {
  // Weapons — melee
  sword:      'mdi-sword',
  nodachi:    'mdi-sword-cross',
  knife:      'mdi-knife',
  bisento:    'mdi-axe',
  axe:        'mdi-axe',
  spear:      'mdi-spear',
  club:       'mdi-baseball-bat',
  fist:       'mdi-boxing-glove',
  staff:      'mdi-hiking',
  claw:       'mdi-hand-clap',
  // Weapons — ranged/gun
  gun:        'mdi-pistol',
  slingshot:  'mdi-bow-arrow',
  // Weapons — support/special
  special:    'mdi-lightning-bolt',
  instrument: 'mdi-music',
  medical:    'mdi-medical-bag',
  tome:       'mdi-book-open-page-variant',
  tool:       'mdi-wrench',
  // Clothing
  shirt:      'mdi-tshirt-crew',
  casual:     'mdi-tshirt-v',
  vest:       'mdi-tshirt-crew-outline',
  uniform:    'mdi-account-tie',
  coat:       'mdi-hanger',
  suit:       'mdi-tie',
  armor:      'mdi-shield-half-full',
  // Helmet
  hat:        'mdi-hat-fedora',
  bandana:    'mdi-scarf',
  cap:        'mdi-hard-hat',
  mask:       'mdi-drama-masks',
  helmet:     'mdi-hard-hat',
  visor:      'mdi-glasses',
  // Gloves
  cloth:      'mdi-hand-wave',
  leather:    'mdi-hand-clap',
  combat:     'mdi-boxing-glove',
  precision:  'mdi-crosshairs-gps',
  gauntlets:  'mdi-arm-flex',
  // Boots
  sandals:    'mdi-shoe-sneaker',
  military:   'mdi-shoe-formal',
  pirate:     'mdi-shoe-heel',
  speed:      'mdi-run-fast',
}

const TYPE_FALLBACK_ICONS: Record<string, string> = {
  weapon: 'mdi-sword', clothing: 'mdi-tshirt-crew',
  helmet: 'mdi-hard-hat', gloves: 'mdi-hand-wave', boots: 'mdi-shoe-print',
}

const itemIcon = (item: { type: string; subtype?: string } | string): string => {
  if (typeof item === 'string') return TYPE_FALLBACK_ICONS[item] ?? 'mdi-package-variant'
  return SUBTYPE_ICONS[item.subtype ?? ''] ?? TYPE_FALLBACK_ICONS[item.type] ?? 'mdi-package-variant'
}

// Keep typeIcon for backward-compat (slot-level, no subtype)
const typeIcon = (type: string): string => TYPE_FALLBACK_ICONS[type] ?? 'mdi-package-variant'

const typeColor = (type: string): string => ({
  weapon: '#EF5350', clothing: '#42A5F5',
  helmet: '#66BB6A', gloves: '#FFA726', boots: '#CE93D8',
}[type] ?? '#B0BFDA')

const statLabel = (key: string): string => ({
  attack: 'Ataque', defense: 'Defesa', speed: 'Velocidade',
  skill: 'Habilidade', intelligence: 'Inteligência',
}[key] ?? key)

const statIcon = (key: string): string => ({
  attack: 'mdi-sword', defense: 'mdi-shield', speed: 'mdi-run-fast',
  skill: 'mdi-feather', intelligence: 'mdi-brain',
}[key] ?? 'mdi-star')

const statColor = (key: string): string => ({
  attack: '#EF5350', defense: '#42A5F5', speed: '#66BB6A',
  skill: '#FFA726', intelligence: '#CE93D8',
}[key] ?? '#B0BFDA')

const formatBerry = (n: number): string => n.toLocaleString('pt-BR')

const rarityColor = (rarity: number): string => {
  if (rarity >= 80) return '#FFD700'
  if (rarity >= 60) return '#E91E63'
  if (rarity >= 40) return '#7C4DFF'
  if (rarity >= 20) return '#42A5F5'
  return '#78909C'
}

// ── Estilos de combate + slot label + auto-equip + diff de stats ───────────────
// stylesOrdered: estilos ordenados por ID (mesma ordem de inserção)
const stylesOrdered = ref<{ id: number; name: string }[]>([])

const loadStyleCombats = async () => {
  const styles = await db.styleCombats.orderBy('id').toArray()
  stylesOrdered.value = styles.map(s => ({ id: s.id!, name: s.name }))
  styleCombatMap.value = new Map(styles.map(s => [s.id!, s.name]))
}

// Converte IDs reais do banco para nomes de grupo.
// Usa findIndex no array ordenado para obter a posição real, depois Math.floor(pos/3) = grupo.
const getStyleNames = (ids?: number[]): string => {
  if (!ids?.length || stylesOrdered.value.length === 0) return ''
  const groups = new Set<number>()
  for (const id of ids) {
    const idx = stylesOrdered.value.findIndex(s => s.id === id)
    if (idx >= 0) groups.add(Math.floor(idx / 3))
  }
  if (groups.size === 0) return ids.join(', ')
  const groupNames: string[] = []
  groups.forEach(g => {
    const first = stylesOrdered.value[g * 3]
    if (first) groupNames.push(first.name.split(' - ')[0])
  })
  return groupNames.join(', ')
}

// ── Verificação de equipabilidade ────────────────────────────────────────────
interface EquipCheck { canEquip: boolean; levelOk: boolean; typeOk: boolean; styleOk: boolean }

const checkEquipability = (item: Item | null, character: Character | null): EquipCheck => {
  const none: EquipCheck = { canEquip: false, levelOk: true, typeOk: true, styleOk: true }
  if (!item || !character) return none

  const levelOk = character.level >= item.requirements.level

  const typeOk = !item.requirements.characterType?.length ||
    item.requirements.characterType.includes(character.type as any)

  let styleOk = true
  if (item.requirements.styleCombatId?.length && stylesOrdered.value.length > 0) {
    const charIdx = stylesOrdered.value.findIndex(s => s.id === character.styleCombatId)
    const charGroup = charIdx >= 0 ? Math.floor(charIdx / 3) : -1
    const itemGroups = new Set<number>()
    for (const id of item.requirements.styleCombatId) {
      const idx = stylesOrdered.value.findIndex(s => s.id === id)
      if (idx >= 0) itemGroups.add(Math.floor(idx / 3))
    }
    styleOk = itemGroups.has(charGroup)
  }

  return { canEquip: levelOk && typeOk && styleOk, levelOk, typeOk, styleOk }
}

const selectedItemEquipCheck = computed(() =>
  checkEquipability(selectedItem.value, selectedCharacterForAction.value)
)

// ── Quem na tripulação pode usar o item ────────────────────────────────────────
interface CrewCompatibility {
  compatible: Array<{ name: string; level: number; isPlayer: boolean }>
  moreCount: number
  total: number
}

const getCompatibleCrew = (item: Item): CrewCompatibility => {
  const all: Character[] = []
  if (playerCharacter.value) all.push(playerCharacter.value)
  crewMembers.value
    .filter(m => m.character.id !== playerCharacter.value?.id)
    .forEach(m => all.push(m.character))

  const compatible = all.filter(c => checkEquipability(item, c).canEquip)
  const MAX_SHOW = 6
  return {
    compatible: compatible.slice(0, MAX_SHOW).map(c => ({
      name: c.name,
      level: c.level,
      isPlayer: c.isPlayer === 1,
    })),
    moreCount: Math.max(0, compatible.length - MAX_SHOW),
    total: all.length,
  }
}

const slotLabel = (type: string): string =>
  equipSlots.find(s => s.key === type)?.label ?? type

const handleAutoEquip = async (character: Character | null) => {
  if (!character?.id) return
  autoEquipLoading.value = true
  try {
    await InventorySystem.optimizeEquipment(character.id)
    await characterStore.loadPlayerCharacter()
    await loadAll()
    // Atualizar selectedCrewMember se era o membro otimizado
    if (selectedCrewMember.value?.character.id === character.id) {
      const updated = crewMembers.value.find(m => m.character.id === character.id)
      if (updated) selectedCrewMember.value = updated
    }
    autoEquipMessage.value = 'Equipamento otimizado!'
  } catch {
    autoEquipMessage.value = 'Erro ao otimizar.'
  } finally {
    autoEquipLoading.value = false
    setTimeout(() => { autoEquipMessage.value = '' }, 3000)
  }
}

const handleBestBuy = async () => {
  if (!playerCrew.value?.id || !isPlayerCaptain.value) return
  const islandId = playerCrew.value.currentIsland
  if (!islandId) return
  bestBuyLoading.value = true
  bestBuyResult.value = null
  showBestBuyResult.value = false
  try {
    const result = await InventorySystem.bestBuyForCrew(playerCrew.value.id, islandId)
    bestBuyResult.value = result
    showBestBuyResult.value = true
    await characterStore.loadPlayerCharacter()
    await loadAll()
  } finally {
    bestBuyLoading.value = false
  }
}

const handleSell = async () => {
  if (!selectedItem.value || !playerCrew.value || selectedEntryId.value == null) return
  sellLoading.value = true
  const res = await InventorySystem.sellItem(playerCrew.value.id!, selectedEntryId.value)
  sellLoading.value = false
  sellSuccess.value = res.success
  sellMessage.value = res.message
  if (res.success) {
    selectedItem.value = null
    selectedEntryId.value = null
    selectedCharacterForAction.value = null
    await characterStore.loadPlayerCharacter()
    await loadAll()
  }
  setTimeout(() => { sellMessage.value = '' }, 3500)
}

const handleSellAll = async () => {
  if (!playerCrew.value?.id) return
  sellAllLoading.value = true
  try {
    const res = await InventorySystem.sellAllUnusedItems(playerCrew.value.id)
    sellAllSuccess.value = res.success
    sellAllMessage.value = res.message
    if (res.success) {
      await characterStore.loadPlayerCharacter()
      await loadAll()
    }
  } finally {
    sellAllLoading.value = false
  }
  setTimeout(() => { sellAllMessage.value = '' }, 4000)
}

// Rarity scale factor only — statsInfluence values are already absolute stat points
const itemMult = (_item: Item) => 1

interface StatDiff {
  stat: string; label: string; diff: number; newVal: number; icon: string; color: string
}
const getStatDiff = (item: Item, character: Character | null): StatDiff[] => {
  if (!character) return []
  const currentSlotId = character[item.type as EquipSlot] as number | null
  const currentItem = currentSlotId != null ? equippedItems.value.get(currentSlotId) : null
  return (['attack', 'defense', 'speed', 'skill', 'intelligence'] as const)
    .map(stat => {
      const inf = item.statsInfluence as Record<string, number>
      const curInf = (currentItem?.statsInfluence ?? {}) as Record<string, number>
      const newVal = Math.round((inf[stat] ?? 0) * (1 + item.rarity / 100) * itemMult(item))
      const curMult = currentItem ? itemMult(currentItem) : 1
      const curVal = currentItem ? Math.round((curInf[stat] ?? 0) * (1 + currentItem.rarity / 100) * curMult) : 0
      return { stat, label: statLabel(stat), diff: newVal - curVal, newVal, icon: statIcon(stat), color: statColor(stat) }
    })
    .filter(s => s.newVal > 0 || (currentItem != null && Math.round(((currentItem.statsInfluence as any)[s.stat] ?? 0) * (1 + currentItem.rarity / 100) * itemMult(currentItem)) > 0))
}

// ── Bônus efetivos do item (statsInfluence × (1 + rarity/100)) ────────────────
const effectiveBonuses = (item: Item): Record<string, number> => {
  const result: Record<string, number> = {}
  const m = itemMult(item)
  for (const [k, v] of Object.entries(item.statsInfluence)) {
    const eff = Math.round((v ?? 0) * (1 + item.rarity / 100) * m)
    if (eff > 0) result[k] = eff
  }
  return result
}

// ── Bônus totais equipados (jogador) ──────────────────────────────────────────
const bonusDisplay = computed(() => [
  { key: 'attack',       label: 'Ataque',       icon: 'mdi-sword',    color: '#EF5350', value: itemBonuses.value['attack']       ?? 0 },
  { key: 'defense',      label: 'Defesa',        icon: 'mdi-shield',   color: '#42A5F5', value: itemBonuses.value['defense']      ?? 0 },
  { key: 'speed',        label: 'Velocidade',    icon: 'mdi-run-fast', color: '#66BB6A', value: itemBonuses.value['speed']        ?? 0 },
  { key: 'skill',        label: 'Habilidade',    icon: 'mdi-feather',  color: '#FFA726', value: itemBonuses.value['skill']        ?? 0 },
  { key: 'intelligence', label: 'Inteligência',  icon: 'mdi-brain',    color: '#CE93D8', value: itemBonuses.value['intelligence'] ?? 0 },
])
const totalBonus = computed(() => bonusDisplay.value.reduce((s, b) => s + b.value, 0))

// ── Item equipado num slot ─────────────────────────────────────────────────────
const getEquippedItem = (char: Character, slot: EquipSlot): Item | undefined => {
  const id = char[slot]
  return id != null ? equippedItems.value.get(id) : undefined
}

const isEquipped = (item: Item): boolean => {
  if (!selectedCharacterForAction.value || !item.id) return false
  const char = selectedCharacterForAction.value
  return equipSlots.some(s => char[s.key] === item.id)
}

const isEquippedBy = (item: Item, char: Character): boolean => {
  return equipSlots.some(s => char[s.key] === item.id)
}

// ── Carregar dados ─────────────────────────────────────────────────────────────
const loadEquippedItems = async () => {
  const map = new Map<number, Item>()
  const allChars = [
    ...(playerCharacter.value ? [playerCharacter.value] : []),
    ...crewMembers.value.map(m => m.character),
  ]
  const ids = new Set<number>()
  for (const char of allChars) {
    for (const slot of equipSlots) {
      if (char[slot.key]) ids.add(char[slot.key]!)
    }
  }
  if (ids.size > 0) {
    const items = await db.items.bulkGet([...ids])
    for (const item of items) {
      if (item?.id) map.set(item.id, item)
    }
  }
  equippedItems.value = map
}

const loadAll = async () => {
  if (!playerCharacter.value?.id) return

  await loadStyleCombats()

  // Inventário do jogador: slots do baú disponíveis, equipados pelo jogador primeiro
  if (playerCrew.value?.id) {
    const available = await InventorySystem.getAvailableItemsForChar(
      playerCrew.value.id,
      playerCharacter.value.id,
    )
    const equippedIds = new Set(
      equipSlots.map(s => playerCharacter.value![s.key]).filter((id): id is number => id != null),
    )
    playerInventory.value = [
      ...available.filter(s => equippedIds.has(s.item.id!)),
      ...available.filter(s => !equippedIds.has(s.item.id!)),
    ]
  } else {
    playerInventory.value = []
  }

  // Bônus de itens equipados
  const bonuses = await InventorySystem.calculateItemBonuses(playerCharacter.value)
  itemBonuses.value = { ...bonuses }

  // Membros da tripulação
  if (playerCrew.value?.id) {
    crewMembers.value = await InventorySystem.getCrewInventory(playerCrew.value.id)
    crewTreasury.value = playerCrew.value.treasury ?? 0
  }

  // Loja da ilha atual
  const islandId = playerCrew.value?.currentIsland
  if (islandId) {
    // Verificar se passou 1 hora desde a última atualização global
    const { nextRefreshIn } = await InventorySystem.checkAndRefreshAllStores()
    storeNextRefreshIn.value = nextRefreshIn
    storeItems.value = await InventorySystem.getIslandStore(islandId)
    const island = await db.islands.get(islandId)
    currentIslandName.value = island?.name ?? 'Ilha desconhecida'

    // Iniciar (ou reiniciar) o ticker do countdown
    if (countdownInterval) clearInterval(countdownInterval)
    countdownInterval = setInterval(() => {
      storeNextRefreshIn.value = Math.max(0, storeNextRefreshIn.value - 1000)
      if (storeNextRefreshIn.value === 0) {
        clearInterval(countdownInterval!)
        countdownInterval = null
        // Recarregar loja automaticamente quando o tempo expirar
        InventorySystem.refreshAllIslandStores().then(() => {
          InventorySystem.getIslandStore(islandId).then(items => {
            storeItems.value = items
            storeNextRefreshIn.value = InventorySystem.STORE_REFRESH_INTERVAL
            if (countdownInterval) clearInterval(countdownInterval)
            countdownInterval = setInterval(() => {
              storeNextRefreshIn.value = Math.max(0, storeNextRefreshIn.value - 1000)
            }, 1000)
          })
        })
      }
    }, 1000)
  }

  await loadEquippedItems()
}

// ── Ações ──────────────────────────────────────────────────────────────────────
const selectSlotItem = (char: Character, slot: EquipSlot) => {
  const item = getEquippedItem(char, slot)
  if (item) {
    selectedItem.value = item
    selectedEntryId.value = null // item equipado no slot; venda exige desequipar primeiro
    selectedCharacterForAction.value = char
  }
}

const selectCrewMember = (member: { character: Character; items: InventorySlot[] }) => {
  selectedCrewMember.value = member
  selectedItem.value = null
  selectedEntryId.value = null
  selectedCharacterForAction.value = null
}

const showActionResult = (success: boolean, msg: string) => {
  actionSuccess.value = success
  actionMessage.value = msg
  setTimeout(() => { actionMessage.value = '' }, 3500)
}

const handleEquip = async () => {
  if (!selectedItem.value || !selectedCharacterForAction.value) return
  actionLoading.value = true
  const res = await InventorySystem.equipItem(
    selectedCharacterForAction.value.id!,
    selectedItem.value.id!,
    selectedItem.value.type as EquipSlot,
  )
  actionLoading.value = false
  showActionResult(res.success, res.message)
  if (res.success) {
    await characterStore.loadPlayerCharacter()
    await loadAll()
  }
}

const handleUnequip = async () => {
  if (!selectedItem.value || !selectedCharacterForAction.value) return
  const slot = equipSlots.find(s => selectedCharacterForAction.value![s.key] === selectedItem.value!.id)
  if (!slot) return
  actionLoading.value = true
  await InventorySystem.unequipItem(selectedCharacterForAction.value.id!, slot.key)
  actionLoading.value = false
  showActionResult(true, `${selectedItem.value.name} desequipado.`)
  await characterStore.loadPlayerCharacter()
  await loadAll()
}

const handleBuy = async (entry: StoreEntry) => {
  if (!playerCharacter.value || !playerCrew.value) return
  if (!isPlayerCaptain.value) {
    buySuccess.value = false
    buyMessage.value = 'Apenas o capitão pode comprar itens para o baú.'
    setTimeout(() => { buyMessage.value = '' }, 3500)
    return
  }
  selectedStoreEntry.value = entry
  buyLoading.value = true
  const res = await InventorySystem.buyItem(
    playerCrew.value.id!,
    entry.storeId,
  )
  buyLoading.value = false
  buySuccess.value = res.success
  buyMessage.value = res.message
  if (res.success) {
    await characterStore.loadPlayerCharacter()
    await loadAll()
  }
  setTimeout(() => { buyMessage.value = '' }, 3500)
}

// ── Lifecycle ──────────────────────────────────────────────────────────────────
onMounted(loadAll)
onUnmounted(() => { if (countdownInterval) clearInterval(countdownInterval) })
watch(playerCharacter, loadAll)
</script>

<style scoped>
/* ── Página ──────────────────────────────────────────────────────────── */
.inv-page {
  padding: 0 0 32px;
}

.inv-top-accent {
  height: 3px;
  background: linear-gradient(90deg, transparent, #D4AF37, transparent);
  margin-bottom: 0;
}

.inv-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px 14px;
  background: linear-gradient(135deg, rgba(212,175,55,0.06) 0%, transparent 100%);
  border-bottom: 1px solid rgba(212,175,55,0.2);
  margin-bottom: 4px;
}

.inv-title {
  margin: 0;
  font-family: Georgia, serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: #D4AF37;
  letter-spacing: 0.06em;
  text-shadow: 0 0 12px rgba(212,175,55,0.3);
}

.inv-subtitle {
  margin: 2px 0 0;
  font-size: 0.78rem;
  color: #B0BFDA;
}

/* ── Tabs ───────────────────────────────────────────────────────────── */
.inv-tabs {
  border-bottom: 1px solid rgba(212,175,55,0.25);
}

:deep(.v-tab) {
  color: #B0BFDA !important;
  font-weight: 600;
  font-size: 0.85rem;
  letter-spacing: 0.03em;
}

:deep(.v-tab--selected) {
  color: #D4AF37 !important;
}

/* ── Card genérico ──────────────────────────────────────────────────── */
.inv-card {
  background: #172D48;
  border: 1px solid rgba(212,175,55,0.2);
  border-radius: 12px;
  padding: 16px;
}

.inv-card-title {
  display: flex;
  align-items: center;
  font-size: 0.82rem;
  font-weight: 700;
  color: #D4AF37;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 14px;
}

/* ── Slots de equipamento ───────────────────────────────────────────── */
.inv-slots {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.inv-slot-row {
  display: grid;
  grid-template-columns: 22px 80px 1fr;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid rgba(176,191,218,0.12);
  background: rgba(10,22,40,0.4);
  cursor: pointer;
  transition: all 0.18s ease;
}

.inv-slot-row:hover {
  border-color: rgba(212,175,55,0.35);
  background: rgba(212,175,55,0.06);
}

.inv-slot-filled {
  border-color: rgba(212,175,55,0.3) !important;
  background: rgba(212,175,55,0.06) !important;
}

.inv-slot-label {
  font-size: 0.75rem;
  color: #B0BFDA;
  font-weight: 600;
}

.inv-slot-item {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
}

.inv-item-name {
  font-size: 0.78rem;
  color: #F0E6D8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.inv-slot-empty {
  font-size: 0.72rem;
  color: rgba(176,191,218,0.4);
  font-style: italic;
}

/* ── Badges ─────────────────────────────────────────────────────────── */
.inv-class-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 4px;
  color: #0A1628;
  white-space: nowrap;
  flex-shrink: 0;
}

.inv-unique-badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.6rem;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 4px;
  background: linear-gradient(90deg,#FFD700,#FFA000);
  color: #0A1628;
}

/* ── Bônus ──────────────────────────────────────────────────────────── */
.inv-bonus-section {
  border-top: 1px solid rgba(212,175,55,0.15);
  padding-top: 12px;
}

.inv-bonus-title {
  font-size: 0.72rem;
  font-weight: 700;
  color: #B0BFDA;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.inv-bonus-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.inv-bonus-row {
  display: grid;
  grid-template-columns: 16px 1fr auto;
  align-items: center;
  gap: 6px;
  font-size: 0.76rem;
}

.inv-bonus-label { color: #B0BFDA; }
.inv-bonus-val   { color: #66BB6A; font-weight: 700; }

.inv-no-bonus {
  font-size: 0.72rem;
  color: rgba(176,191,218,0.4);
  font-style: italic;
  margin: 0;
}

/* ── Bolsa ──────────────────────────────────────────────────────────── */
.inv-bag-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 8px;
}

.inv-bag-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 10px 6px;
  border-radius: 10px;
  border: 1px solid rgba(176,191,218,0.12);
  background: rgba(10,22,40,0.4);
  cursor: pointer;
  transition: all 0.18s ease;
}

.inv-bag-item:hover,
.inv-bag-selected {
  border-color: rgba(212,175,55,0.45) !important;
  background: rgba(212,175,55,0.08) !important;
}

.inv-bag-equipped {
  border-color: rgba(102,187,106,0.5) !important;
  background: rgba(102,187,106,0.06) !important;
}

.inv-bag-eq-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #66BB6A;
  flex-shrink: 0;
}

.inv-bag-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 2px solid;
  background: rgba(10,22,40,0.6);
}

.inv-bag-name {
  font-size: 0.65rem;
  color: #F0E6D8;
  text-align: center;
  line-height: 1.2;
  max-height: 2.4em;
  overflow: hidden;
}

.inv-bag-class {
  font-size: 0.65rem;
  font-weight: 800;
}

.inv-rarity-mini {
  font-size: 0.6rem;
  font-weight: 700;
  opacity: 0.9;
}

.inv-rarity-badge {
  font-size: 0.62rem;
  font-weight: 700;
  white-space: nowrap;
}

/* ── Detalhe item ────────────────────────────────────────────────────── */
.inv-detail-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.inv-detail-name {
  font-size: 1rem;
  font-weight: 700;
  color: #F0E6D8;
}

.inv-detail-desc {
  font-size: 0.78rem;
  color: #B0BFDA;
  margin-bottom: 6px;
}

.inv-detail-lore {
  font-size: 0.74rem;
  color: rgba(212,175,55,0.7);
  font-style: italic;
  margin-bottom: 10px;
}

.inv-rarity-bar-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}

.inv-rarity-label {
  font-size: 0.68rem;
  color: #B0BFDA;
}

.inv-rarity-bar {
  width: 70px;
  height: 5px;
  background: rgba(176,191,218,0.15);
  border-radius: 3px;
  overflow: hidden;
}

.inv-rarity-fill {
  height: 100%;
  background: linear-gradient(90deg, #D4AF37, #FFF176);
  border-radius: 3px;
}

.inv-rarity-pct {
  font-size: 0.68rem;
  color: #D4AF37;
  font-weight: 700;
}

.inv-detail-bonuses {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
}

.inv-detail-bonus-row {
  display: grid;
  grid-template-columns: 16px 1fr auto;
  align-items: center;
  gap: 6px;
  font-size: 0.76rem;
  color: #B0BFDA;
}

.inv-detail-bonus-val {
  color: #66BB6A;
  font-weight: 700;
}

.inv-detail-reqs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.inv-req-item {
  font-size: 0.7rem;
  color: #B0BFDA;
  display: flex;
  align-items: center;
  gap: 3px;
  transition: color 0.15s;
}

.inv-req-ok  { color: #66BB6A !important; }
.inv-req-fail { color: #EF5350 !important; }

.inv-req-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.66rem;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 20px;
  letter-spacing: 0.04em;
}

.inv-req-badge--ok {
  background: rgba(102,187,106,0.15);
  color: #66BB6A;
  border: 1px solid rgba(102,187,106,0.35);
}

.inv-req-badge--fail {
  background: rgba(239,83,80,0.12);
  color: #EF5350;
  border: 1px solid rgba(239,83,80,0.3);
}

.inv-detail-actions {
  display: flex;
  gap: 8px;
}

/* ── Tripulação ────────────────────────────────────────────────────── */
.inv-crew-row {
  display: grid;
  grid-template-columns: 18px 1fr auto;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid rgba(176,191,218,0.1);
  background: rgba(10,22,40,0.35);
  margin-bottom: 5px;
  cursor: pointer;
  transition: all 0.18s ease;
}

.inv-crew-row:hover,
.inv-crew-selected {
  border-color: rgba(212,175,55,0.4) !important;
  background: rgba(212,175,55,0.07) !important;
}

.inv-crew-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.inv-crew-name {
  font-size: 0.78rem;
  color: #F0E6D8;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inv-crew-style {
  font-size: 0.65rem;
  color: #8899BB;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.inv-crew-level {
  font-size: 0.7rem;
  color: #D4AF37;
  font-weight: 700;
}

/* ── Loja ───────────────────────────────────────────────────────────── */
.inv-treasury {
  font-size: 0.9rem;
  font-weight: 700;
  color: #D4AF37;
}

.inv-store-card {
  background: #172D48;
  border: 1px solid rgba(212,175,55,0.18);
  border-radius: 12px;
  padding: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.inv-store-card:hover,
.inv-store-selected {
  border-color: rgba(212,175,55,0.5) !important;
  background: rgba(212,175,55,0.06) !important;
}

.inv-store-top {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
}

.inv-store-name {
  font-size: 0.82rem;
  font-weight: 700;
  color: #F0E6D8;
}

.inv-store-bonuses {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

.inv-store-bonus-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.65rem;
  color: #B0BFDA;
  background: rgba(176,191,218,0.08);
  border-radius: 4px;
  padding: 1px 5px;
}

.inv-store-price {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.78rem;
  font-weight: 700;
  color: #D4AF37;
  margin-bottom: 4px;
}

/* ── Vazios ─────────────────────────────────────────────────────────── */
.inv-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 20px;
  color: #B0BFDA;
  font-size: 0.88rem;
}

.inv-empty-small {
  font-size: 0.78rem;
  color: rgba(176,191,218,0.5);
  font-style: italic;
  padding: 12px 0;
}

/* ── Gap utility ────────────────────────────────────────────────────── */
.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }

/* ── Countdown de atualização da loja ───────────────────────────────── */
.inv-refresh-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.inv-refresh-label {
  font-size: 0.72rem;
  color: #8B9DC3;
}

.inv-refresh-timer {
  font-size: 0.72rem;
  font-weight: 700;
  color: #B0BFDA;
  font-variant-numeric: tabular-nums;
  min-width: 80px;
}

.inv-refresh-soon {
  color: #FFA726;
}

.inv-refresh-bar-wrap {
  flex: 1;
  min-width: 80px;
  height: 3px;
  background: rgba(176, 191, 218, 0.12);
  border-radius: 2px;
  overflow: hidden;
}

.inv-refresh-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #1565C0, #D4AF37);
  border-radius: 2px;
  transition: width 1s linear;
}

.inv-auto-msg {
  font-size: 0.7rem;
  color: #66BB6A;
  text-align: center;
  margin: 0;
}

/* ── Melhor Compra ──────────────────────────────────────────────── */
.inv-bestbuy-btn {
  background: linear-gradient(135deg, rgba(212,175,55,0.85), rgba(180,130,20,0.9)) !important;
  color: #0A1628 !important;
  font-weight: 700 !important;
  letter-spacing: 0.04em;
  border: 1px solid rgba(212,175,55,0.6) !important;
  text-shadow: none !important;
}

.inv-bestbuy-btn:disabled {
  opacity: 0.45 !important;
}

.inv-bestbuy-hint {
  font-size: 0.68rem;
  color: #8B9DC3;
  text-align: center;
  margin: 4px 0 0;
}

.inv-bestbuy-panel {
  background: rgba(15,27,43,0.95);
  border: 1px solid rgba(212,175,55,0.3);
  border-radius: 10px;
  overflow: hidden;
}

.inv-bestbuy-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: rgba(212,175,55,0.08);
  border-bottom: 1px solid rgba(212,175,55,0.15);
  font-size: 0.82rem;
  color: #F0E6D8;
}

.inv-bestbuy-row {
  display: grid;
  grid-template-columns: 14px auto 12px 1fr auto;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: 0.76rem;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}

.inv-bestbuy-member {
  color: #D4AF37;
  font-weight: 700;
  white-space: nowrap;
}

.inv-bestbuy-arrow {
  color: #4A5568;
  font-size: 0.7rem;
}

.inv-bestbuy-item {
  color: #C8D6EE;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.inv-bestbuy-price {
  color: #8B9DC3;
  font-size: 0.68rem;
  white-space: nowrap;
  text-align: right;
}

.inv-bestbuy-footer {
  padding: 8px 14px;
  font-size: 0.74rem;
  color: #8B9DC3;
  text-align: right;
  background: rgba(212,175,55,0.04);
}

.inv-bestbuy-footer strong {
  color: #D4AF37;
}
</style>

<!-- Tooltip styles: non-scoped because v-tooltip uses Teleport to document.body -->
<style>
/* Force dark background on the Vuetify tooltip wrapper that contains inv-tt */
.v-tooltip .v-overlay__content {
  background: #0F1B2B !important;
  border: 1px solid rgba(212,175,55,0.25) !important;
  border-radius: 8px !important;
  padding: 0 !important;
  box-shadow: 0 4px 16px rgba(0,0,0,0.55) !important;
}

.inv-tt { padding: 8px 10px; min-width: 160px; }
.inv-tt-header { display: flex; align-items: center; gap: 6px; margin-bottom: 2px; font-weight: 700; font-size: 0.8rem; color: #FFE9C8; }
.inv-tt-sub { font-size: 0.68rem; color: #9BAFD5; margin-bottom: 6px; }
.inv-tt-divider { height: 1px; background: rgba(212,175,55,0.25); margin-bottom: 6px; }
.inv-tt-row { display: grid; grid-template-columns: 14px 1fr auto; align-items: center; gap: 4px; font-size: 0.72rem; margin-bottom: 2px; }
.inv-tt-stat { color: #C8D6EE; }
.inv-tt-gain { color: #81C784; font-weight: 700; }
.inv-tt-loss { color: #E57373; font-weight: 700; }
.inv-tt-same { color: #9BAFD5; }
.inv-tt-neutral { font-size: 0.7rem; color: #9BAFD5; font-style: italic; }

/* Crew compatibility section */
.inv-tt-who-label { font-size: 0.63rem; color: #7B9CC8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
.inv-tt-who-row { display: grid; grid-template-columns: 13px 1fr auto; gap: 3px; align-items: center; font-size: 0.7rem; margin-bottom: 2px; }
.inv-tt-who-name { color: #C8D6EE; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.inv-tt-who-lv { color: #7B9CC8; font-size: 0.63rem; white-space: nowrap; }
.inv-tt-who-none { font-size: 0.7rem; color: #E57373; font-style: italic; }
.inv-tt-who-more { font-size: 0.63rem; color: #7B9CC8; font-style: italic; margin-top: 1px; }
</style>
