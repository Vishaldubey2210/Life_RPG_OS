import test from 'node:test'
import assert from 'node:assert/strict'

// 1. Core Level & XP Mechanics
function getXPForLevel(level) {
  return Math.floor(100 * Math.pow(1.25, level - 1))
}

function calculateLevelFromXP(totalXP) {
  let level = 1
  let xpNeeded = getXPForLevel(level)
  let currentXP = totalXP

  while (currentXP >= xpNeeded) {
    currentXP -= xpNeeded
    level++
    xpNeeded = getXPForLevel(level)
  }

  return { level, currentXP, xpNeeded }
}

test('XP calculation scales with level exponential factor', () => {
  const level1XP = getXPForLevel(1)
  const level2XP = getXPForLevel(2)
  const level3XP = getXPForLevel(3)

  assert.equal(level1XP, 100)
  assert.equal(level2XP, 125)
  assert.equal(level3XP, 156)
})

test('Level derivation from total XP', () => {
  const resultLvl1 = calculateLevelFromXP(50)
  assert.equal(resultLvl1.level, 1)
  assert.equal(resultLvl1.currentXP, 50)
  assert.equal(resultLvl1.xpNeeded, 100)

  // 100 XP gives level 2
  const resultLvl2 = calculateLevelFromXP(100)
  assert.equal(resultLvl2.level, 2)
  assert.equal(resultLvl2.currentXP, 0)
  assert.equal(resultLvl2.xpNeeded, 125)

  // 225 XP gives level 3
  const resultLvl3 = calculateLevelFromXP(225)
  assert.equal(resultLvl3.level, 3)
  assert.equal(resultLvl3.currentXP, 0)
})

// 2. Health (HP) Loss and Vitality Resistance
function calculateHPLoss(skippedCount, vitalityStat) {
  const baseDamagePerMiss = 15
  const damageReduction = Math.min(0.5, (vitalityStat || 0) * 0.01)
  const totalDamage = skippedCount * baseDamagePerMiss * (1 - damageReduction)
  return Math.round(totalDamage)
}

test('HP penalty reduces with higher vitality stat', () => {
  const standardDamage = calculateHPLoss(2, 0) // 2 misses, 0 vitality
  assert.equal(standardDamage, 30)

  const highVitalityDamage = calculateHPLoss(2, 30) // 2 misses, 30% reduction
  assert.equal(highVitalityDamage, 21)
})

// 3. Streak Multiplier Logic
function getStreakMultiplier(streakDays) {
  if (streakDays >= 30) return 2.0
  if (streakDays >= 14) return 1.5
  if (streakDays >= 7) return 1.25
  if (streakDays >= 3) return 1.1
  return 1.0
}

test('Streak multipliers apply correct bonus tier', () => {
  assert.equal(getStreakMultiplier(1), 1.0)
  assert.equal(getStreakMultiplier(3), 1.1)
  assert.equal(getStreakMultiplier(7), 1.25)
  assert.equal(getStreakMultiplier(14), 1.5)
  assert.equal(getStreakMultiplier(45), 2.0)
})

// 4. Rate Limiter Logic
function testRateLimiter(calls, limit) {
  let allowed = 0
  let blocked = 0
  for (let i = 0; i < calls; i++) {
    if (i < limit) {
      allowed++
    } else {
      blocked++
    }
  }
  return { allowed, blocked }
}

test('Rate limiter permits requests within budget and blocks overflow', () => {
  const result = testRateLimiter(35, 30)
  assert.equal(result.allowed, 30)
  assert.equal(result.blocked, 5)
})
