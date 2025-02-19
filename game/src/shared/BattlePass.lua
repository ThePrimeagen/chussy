local BattlePass = {}
BattlePass.__index = BattlePass

local BATTLE_PASS_COST = 100 -- USD
local MAX_LEVEL = 100
local XP_PER_FOOD = 10

function BattlePass.new()
    local self = setmetatable({}, BattlePass)
    self.level = 0
    self.xp = 0
    self.purchased = false
    self.rewards = self:initializeRewards()
    return self
end

function BattlePass:initializeRewards()
    return {
        [10] = { type = "workout", name = "Prime's Beginner Routine", unlocked = false },
        [25] = { type = "workout", name = "ThePrimeagen's Core Workout", unlocked = false },
        [50] = { type = "workout", name = "Prime's Advanced Circuit", unlocked = false },
        [75] = { type = "currency", amount = 5000, name = "UwU Currency", unlocked = false },
        [100] = { type = "skin", name = "Legendary Dragon", unlocked = false }
    }
end

function BattlePass:addXP(amount)
    if not self.purchased then return end
    
    self.xp = self.xp + amount
    local newLevel = math.floor(self.xp / 100)
    
    if newLevel > self.level then
        self.level = math.min(newLevel, MAX_LEVEL)
        self:checkRewards()
    end
end

function BattlePass:checkRewards()
    for level, reward in pairs(self.rewards) do
        if self.level >= level and not reward.unlocked then
            reward.unlocked = true
            -- Signal that a reward is available
            return reward
        end
    end
    return nil
end

function BattlePass:purchase()
    self.purchased = true
    return true
end

function BattlePass:getProgress()
    return {
        level = self.level,
        xp = self.xp,
        purchased = self.purchased,
        rewards = self.rewards
    }
end

return BattlePass
