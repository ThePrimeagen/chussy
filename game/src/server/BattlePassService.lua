local ReplicatedStorage = game:GetService("ReplicatedStorage")
local MarketplaceService = game:GetService("MarketplaceService")

local BattlePass = require(ReplicatedStorage.Shared.BattlePass)

local BattlePassService = {
    BATTLE_PASS_ID = 12345678, -- Developer product ID for battle pass
    playerPasses = {}
}

function BattlePassService:init()
    -- Create RemoteEvents for battle pass interactions
    local battlePassEvent = Instance.new("RemoteEvent")
    battlePassEvent.Name = "BattlePassEvent"
    battlePassEvent.Parent = ReplicatedStorage

    local purchaseEvent = Instance.new("RemoteFunction")
    purchaseEvent.Name = "PurchaseBattlePass"
    purchaseEvent.Parent = ReplicatedStorage

    -- Handle purchase requests
    purchaseEvent.OnServerInvoke = function(player)
        MarketplaceService:PromptProductPurchase(player, self.BATTLE_PASS_ID)
    end

    -- Set up ProcessReceipt
    MarketplaceService.ProcessReceipt = function(receiptInfo)
        local player = Players:GetPlayerByUserId(receiptInfo.PlayerId)
        if not player then return false end

        if receiptInfo.ProductId == self.BATTLE_PASS_ID then
            local success = self:grantBattlePass(player)
            if success then
                return Enum.ProductPurchaseDecision.PurchaseGranted
            end
        end

        return Enum.ProductPurchaseDecision.NotProcessedYet
    end
end

function BattlePassService:getPlayerPass(player)
    if not self.playerPasses[player.UserId] then
        self.playerPasses[player.UserId] = BattlePass.new()
    end
    return self.playerPasses[player.UserId]
end

function BattlePassService:grantBattlePass(player)
    local battlePass = self:getPlayerPass(player)
    return battlePass:purchase()
end

function BattlePassService:addXP(player, amount)
    local battlePass = self:getPlayerPass(player)
    local reward = battlePass:addXP(amount)
    
    if reward then
        -- Notify client of new reward
        local battlePassEvent = ReplicatedStorage:WaitForChild("BattlePassEvent")
        battlePassEvent:FireClient(player, "reward", reward)
    end
end

function BattlePassService:getProgress(player)
    local battlePass = self:getPlayerPass(player)
    return battlePass:getProgress()
end

return BattlePassService
